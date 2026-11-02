import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.scan import MRIScan
from app.models.prediction import Prediction
from app.models.chat import ChatConversation, ChatMessage
from app.services.groq_service import groq_service
from app.schemas import MessageCreate, MessageResponse, ConversationResponse

router = APIRouter(prefix="/chat", tags=["AI Clinical Chatbot"])

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    scan_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = "Clinical AI Consultation"
    if scan_id:
        scan = db.query(MRIScan).filter(MRIScan.id == scan_id).first()
        if scan:
            title = f"Scan Analysis: {scan.original_filename}"

    conv = ChatConversation(
        user_id=current_user.id,
        scan_id=scan_id,
        title=title
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        scan_id=conv.scan_id,
        created_at=conv.created_at,
        messages=[]
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.created_at.desc())
        .all()
    )
    results = []
    for c in convs:
        msgs = [MessageResponse.model_validate(m) for m in c.messages]
        results.append(
            ConversationResponse(
                id=c.id,
                title=c.title,
                scan_id=c.scan_id,
                created_at=c.created_at,
                messages=msgs
            )
        )
    return results

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msgs = [MessageResponse.model_validate(m) for m in conv.messages]
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        scan_id=conv.scan_id,
        created_at=conv.created_at,
        messages=msgs
    )

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def send_message(
    conversation_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="user",
        content=msg_in.content
    )
    db.add(user_msg)
    db.commit()

    # Build scan context if conversation is linked to a scan
    scan_context = None
    target_scan_id = msg_in.scan_id or conv.scan_id
    if target_scan_id:
        pred = db.query(Prediction).filter(Prediction.scan_id == target_scan_id).first()
        if pred:
            scan_context = {
                "scan_id": target_scan_id,
                "predicted_class": pred.predicted_class,
                "confidence_percentage": pred.confidence * 100,
                "probabilities": json.loads(pred.probabilities_json) if pred.probabilities_json else {}
            }

    # Fetch recent conversation history
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    formatted_history = [{"role": m.sender_role, "content": m.content} for m in history]

    # Query Groq or clinical intelligence engine
    reply_text, model_used, is_live = groq_service.chat(
        messages=formatted_history,
        scan_context=scan_context,
        custom_api_key=msg_in.groq_api_key
    )

    # Save assistant message
    asst_msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="assistant",
        content=reply_text,
        model_used=model_used
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return MessageResponse.model_validate(asst_msg)

@router.post("", response_model=dict)
def quick_chat(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Direct one-call endpoint for MRI workspace right-side chat panel and search modal."""
    content = payload.get("message") or payload.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Message content required")

    scan_id = payload.get("scan_id")
    conv_id = payload.get("conversation_id")
    custom_api_key = payload.get("groq_api_key") or payload.get("api_key")

    conv = None
    if conv_id:
        conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
    if not conv:
        conv = ChatConversation(
            user_id=current_user.id,
            scan_id=scan_id,
            title="Clinical AI Consultation"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = ChatMessage(conversation_id=conv.id, sender_role="user", content=content)
    db.add(user_msg)
    db.commit()

    # Build scan context if attached to a scan
    scan_context = None
    target_scan_id = scan_id or conv.scan_id
    if target_scan_id:
        pred = db.query(Prediction).filter(Prediction.scan_id == target_scan_id).first()
        if pred:
            scan_context = {
                "scan_id": target_scan_id,
                "predicted_class": pred.predicted_class,
                "confidence_percentage": pred.confidence * 100,
                "probabilities": json.loads(pred.probabilities_json) if pred.probabilities_json else {}
            }

    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    formatted_history = [{"role": m.sender_role, "content": m.content} for m in history]

    reply_text, model_used, is_live = groq_service.chat(
        messages=formatted_history,
        scan_context=scan_context,
        custom_api_key=custom_api_key
    )

    asst_msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="assistant",
        content=reply_text,
        model_used=model_used
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return {
        "reply": reply_text,
        "model_used": model_used,
        "conversation_id": conv.id,
        "message_id": asst_msg.id,
        "is_live": is_live
    }

@router.get("/status")
def get_chat_status():
    """Returns runtime health and active AI model status."""
    return {
        "status": groq_service.check_health(),
        "model": settings.GROQ_MODEL,
        "fallback_model": settings.GROQ_FALLBACK_MODEL,
        "has_api_key": bool(os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY)
    }

@router.post("/key")
def configure_groq_key(payload: dict):
    """Sets a runtime Groq API key in memory."""
    key = payload.get("key", "").strip()
    if key:
        os.environ["GROQ_API_KEY"] = key
        groq_service._init_client()
        return {"success": True, "message": "Groq API key configured and activated."}
    else:
        os.environ.pop("GROQ_API_KEY", None)
        groq_service.client = None
        return {"success": True, "message": "Groq API key cleared. Operating on internal clinical intelligence."}

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return None
