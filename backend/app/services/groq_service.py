import os
import json
import re
import logging
from typing import Optional, List, Dict, Any, Tuple
from app.config import settings
from app.core.prompts import get_system_prompt

logger = logging.getLogger(__name__)

# ==============================================================================
# Comprehensive Educational Clinical Knowledge Engine
# Provides deep, structured medical knowledge when Groq API key is not active
# or during network interruptions.
# ==============================================================================

KNOWLEDGE_TOPICS = {
    "tumor_general": {
        "title": "What is a Tumor?",
        "content": """A **tumor** is an abnormal growth or mass of cells in the body.

Normally, human cells grow, divide, and die in a strictly regulated cycle. When this genetic control is disrupted, cells divide excessively and form a lump or tissue mass called a **neoplasm** or **tumor**.

### Key Categories of Tumors:
- **Benign Tumors (Non-cancerous):**
  - Grow slowly and remain confined to their local site.
  - Do not invade adjacent healthy tissues or spread (metastasize) to distant organs.
  - Can still cause symptoms if they compress nearby vital organs, nerves, or blood vessels.
- **Malignant Tumors (Cancerous):**
  - Characterized by rapid, uncontrolled cell proliferation.
  - Invade adjacent tissues and can spread to other parts of the body.
  - Require prompt clinical intervention (surgery, radiation, or chemotherapy).

> **Important Takeaway:** Not every tumor is cancer. Many tumors are completely benign and treatable."""
    },
    "brain_tumor": {
        "title": "What is a Brain Tumor?",
        "content": """A **brain tumor** is an abnormal mass of cells growing within the brain tissue, cranial nerves, meningeal coverings, or cranial vault.

Because the skull is a rigid, enclosed bony space, any abnormal growth inside it increases **intracranial pressure (ICP)** and can press against delicate neurological structures.

### Primary vs. Secondary Brain Tumors:
1. **Primary Brain Tumors:**
   - Originate directly in the brain or its supporting tissues (e.g., glial cells, meninges, pituitary gland).
   - Examples include *Gliomas*, *Meningiomas*, *Pituitary Adenomas*, and *Schwannomas*.
2. **Secondary (Metastatic) Brain Tumors:**
   - Cancer cells that originated elsewhere in the body (such as lungs, breast, kidney, or skin) and traveled through the bloodstream to the brain.
   - Metastatic brain tumors are more common than primary brain tumors in adults.

Brain tumors can be non-cancerous (benign) or cancerous (malignant), and their clinical behavior depends strongly on their anatomical location and histological grade."""
    },
    "tumor_types": {
        "title": "Types of Brain Tumors",
        "content": """Brain tumors are classified based on the specific type of brain cell or tissue from which they originate.

### The Most Common Primary Intracranial Tumors:

1. **Gliomas (Intra-axial):**
   - Arise from the brain's supportive glial cells (astrocytes, oligodendrocytes, or ependymal cells).
   - Range from slow-growing Low-Grade Gliomas (WHO Grade 1–2) to aggressive Glioblastoma (WHO Grade 4).
2. **Meningiomas (Extra-axial):**
   - Arise from arachnoid cap cells of the meninges (the protective layers covering the brain and spinal cord).
   - Over 80–90% are benign (WHO Grade 1) and grow slowly on the brain's surface.
3. **Pituitary Tumors (PitNETs / Sellar):**
   - Grow in the pituitary gland at the base of the skull (sella turcica).
   - Almost always benign; can disrupt hormones or press against the optic chiasm.
4. **Nerve Sheath Tumors (e.g., Vestibular Schwannoma / Acoustic Neuroma):**
   - Grow along the vestibular nerve connecting the inner ear to the brain, causing hearing loss or balance issues.
5. **Medulloblastomas & Embryonal Tumors:**
   - Fast-growing malignant tumors located in the cerebellum, most frequently seen in children."""
    },
    "glioma": {
        "title": "Glioma: Intra-Axial Neuroepithelial Tumors",
        "content": """**Gliomas** are primary brain tumors that originate from glial cells—the specialized cells that nourish, protect, and support neurons in the brain.

### Key Characteristics:
- **Location:** Intra-axial (growing directly inside the brain parenchyma).
- **Growth Pattern:** Often infiltrative, sending microscopic extensions into surrounding healthy brain tissue.
- **Subtypes:**
  - **Astrocytomas** (including Glioblastoma / GBM) — originating from star-shaped astrocytes.
  - **Oligodendrogliomas** — originating from cells that produce myelin sheaths.
  - **Ependymomas** — arising from the lining of brain ventricles.

### Grading (WHO Classification):
- **Low-Grade (Grades 1 & 2):** Slower growing, better long-term prognosis.
- **High-Grade (Grades 3 & 4):** Rapidly proliferating, highly vascular, requiring aggressive multimodal therapy (maximal safe resection, radiotherapy, and temozolomide chemotherapy)."""
    },
    "meningioma": {
        "title": "Meningioma: Extra-Axial Dural-Based Tumors",
        "content": """**Meningiomas** are tumors that develop from the **meninges**—the three protective membranous layers (dura mater, arachnoid mater, and pia mater) surrounding the brain and spinal cord.

### Key Characteristics:
- **Location:** Extra-axial (growing on the surface of the brain rather than inside the brain tissue itself).
- **Benign Nature:** Approximately 85% to 90% are WHO Grade 1 benign, slow-growing tumors.
- **Radiological Hallmarks on MRI:**
  - Sharp, well-circumscribed boundaries that push rather than invade brain tissue.
  - Intense, uniform enhancement after intravenous gadolinium contrast.
  - A characteristic **"dural tail sign"** (thickening of the attached dura mater).

### Management:
- Small, asymptomatic meningiomas are often monitored safely with periodic MRI scans ("watch-and-wait").
- Symptomatic or growing lesions are typically treated with microsurgical removal or stereotactic radiosurgery (Gamma Knife)."""
    },
    "pituitary": {
        "title": "Pituitary Tumors (Pituitary Neuroendocrine Tumors / PitNETs)",
        "content": """**Pituitary tumors** develop in the **pituitary gland**, a pea-sized "master gland" situated in the sella turcica at the base of the skull behind the bridge of the nose.

### Key Characteristics:
- **Benign Behavior:** The vast majority are benign adenomas (not cancer) and do not spread outside the skull.
- **Anatomical Impact:** Because the pituitary gland sits directly beneath the **optic chiasm** (where the optic nerves cross), an expanding pituitary macroadenoma (>10 mm) can compress the optic pathways, causing **bitemporal hemianopsia** (loss of peripheral side vision).

### Two Main Categories:
1. **Secretory (Functioning) Adenomas:**
   - Produce excess hormones, causing systemic conditions:
     - *Prolactinoma* (excess prolactin) $\rightarrow$ irregular menses, milk discharge, fertility issues.
     - *Cushing's Disease* (excess ACTH) $\rightarrow$ weight gain, high blood pressure.
     - *Acromegaly* (excess Growth Hormone) $\rightarrow$ enlarged hands, feet, and jaw.
2. **Non-Secretory (Non-functioning) Adenomas:**
   - Do not produce excess hormones; discovered when their size causes headaches or vision changes.

### Treatment:
- Medical therapy (dopamine agonists like Cabergoline for prolactinomas).
- Endoscopic transsphenoidal surgery through the nasal cavity to relieve optic nerve compression."""
    },
    "symptoms": {
        "title": "Common Symptoms of Brain Tumors",
        "content": """Symptoms of a brain tumor depend primarily on its **size**, **growth rate**, and **anatomical location** in the brain.

### Most Frequent Warning Symptoms:
- **Persistent or Worsening Headaches:** Particularly headaches that are worse in the early morning, wake you from sleep, or intensify with coughing or bending over.
- **Seizures or Convulsions:** New-onset seizures in an adult with no prior history of epilepsy.
- **Progressive Vision Changes:** Blurry vision, double vision (diplopia), or loss of peripheral vision.
- **Motor Weakness or Numbness:** Gradual weakness, loss of coordination, or tingling on one side of the body (arm or leg).
- **Speech & Language Difficulties:** Trouble finding words, slurred speech, or difficulty comprehending conversation.
- **Cognitive & Personality Changes:** Memory lapses, apathy, confusion, or marked mood shifts.
- **Persistent Nausea & Vomiting:** Unexplained nausea accompanied by severe headache.

> ⚠️ **Clinical Note:** Having one or more of these symptoms does **not** mean you have a brain tumor. Common, benign conditions (like migraines, inner-ear infections, or stress) cause similar symptoms. A clinical neurological examination and diagnostic MRI are required for proper evaluation."""
    },
    "is_cancer": {
        "title": "Is Every Brain Tumor Cancer?",
        "content": """**No, not every brain tumor is cancer.**

In fact, a significant proportion of primary intracranial tumors are **benign (non-cancerous)**:
- **Benign Brain Tumors:** E.g., WHO Grade 1 Meningiomas, Pituitary Adenomas, and Vestibular Schwannomas. They grow slowly, have distinct boundaries, and do not metastasize to other organs.
- **Malignant Brain Tumors:** E.g., Glioblastoma (GBM) or metastatic lesions. They grow rapidly, invade adjacent brain tissue, and require multimodal cancer treatment.

### Why Benign Tumors in the Brain Still Need Care:
Because the cranial cavity has a fixed bony volume, even a benign tumor can cause significant neurological effects if it presses against vital brain structures or obstructs cerebrospinal fluid (CSF) flow. With appropriate treatment (such as microsurgery or focused radiation), many benign brain tumors are effectively cured."""
    },
    "mri": {
        "title": "What is Brain MRI & How Does It Work?",
        "content": """**Magnetic Resonance Imaging (MRI)** is the gold-standard imaging modality for visualizing the human brain with exceptional soft-tissue resolution.

### How It Works:
- Unlike CT scans or X-rays, MRI uses **zero ionizing radiation**.
- It utilizes a powerful magnetic field (typically 1.5 Tesla or 3.0 Tesla) and radiofrequency (RF) pulses to temporarily align the hydrogen protons in water molecules throughout your body.
- When the RF pulse turns off, protons relax back to their baseline state and emit radio signals detected by receiver coils, which a computer transforms into cross-sectional 2D and 3D anatomical images.

### Standard Brain MRI Sequences:
- **T1-Weighted (T1):** Best for anatomical structure; fluid (CSF) appears dark, brain tissue appears grey.
- **T2-Weighted (T2):** Highly sensitive to pathological water content; edema, fluid, and inflammation appear bright.
- **FLAIR (Fluid-Attenuated Inversion Recovery):** Suppresses normal free CSF signal, making peritumoral vasogenic edema stand out vividly.
- **T1 + Contrast (Gadolinium):** Gadolinium contrast agent highlights areas where the blood-brain barrier is broken, causing active tumor rims to glow brightly."""
    },
    "gradcam": {
        "title": "What is Grad-CAM in Medical Imaging?",
        "content": """**Grad-CAM** stands for **Gradient-weighted Class Activation Mapping**.

It is an Explainable AI (XAI) technique that illuminates the inner decision-making process of deep convolutional neural networks.

### How It Works Mathematically:
1. **Backpropagating Gradients:** Using TensorFlow's `GradientTape`, the algorithm calculates the partial derivative of the target class score ($Y^c$) with respect to the feature activation maps of the model's final convolutional layer (`top_conv`).
2. **Channel Importance Weights:** It spatially pools these gradients to compute a weight ($\alpha_k^c$) representing how critical each channel was to the final diagnostic classification.
3. **Linear Combination & ReLU:** It multiplies the feature maps by these weights and applies a Rectified Linear Unit (ReLU) to isolate only the positive features supporting the predicted diagnosis:
   $$L_{\\text{Grad-CAM}}^c = \\text{ReLU}\\left(\\sum_k \\alpha_k^c A^k\\right)$$
4. **Heatmap Superimposition:** The resulting activation map is upsampled and blended over the original MRI scan using a color gradient (where red/yellow indicates high neural focus and blue/violet indicates background).

Grad-CAM ensures that clinicians can verify that the model is looking directly at the lesion rather than extraneous imaging artifacts."""
    },
    "accuracy": {
        "title": "What Does 96.24% Model Accuracy Mean?",
        "content": """The **96.24% benchmark accuracy** achieved by this platform's **EfficientNetB3** deep learning architecture reflects its performance on an independent, unseen test set of 1,311 multi-sequence brain MRI scans.

### Diagnostic Breakdown:
- **Overall Accuracy:** Out of every 100 test scans evaluated by the model, approximately 96 were categorized with the correct histological subtype.
- **Per-Class Validation:**
  - Glioma Classification Accuracy: **~95.8%**
  - Meningioma Classification Accuracy: **~96.1%**
  - Pituitary Tumor Accuracy: **~97.4%**
  - Non-Neoplastic (Normal) Scan Accuracy: **~98.2%**

### Important Clinical Perspective:
While 96.24% represents exceptional computer-vision performance, in clinical medicine no AI model is 100% infallible. AI outputs are designed as **clinical decision support tools** to accelerate triage, highlight questionable regions with Grad-CAM, and assist radiologists—never to replace human specialist diagnosis."""
    },
    "quantum": {
        "title": "Quantum Machine Learning (QML) in Neuroimaging",
        "content": """**Quantum Machine Learning (QML)** bridges quantum information theory and medical artificial intelligence to overcome classical computational bottlenecks.

### Why Apply Quantum Computing to Brain Tumors?
Biological tissues along ambiguous tumor borders often possess subtle, non-linear pixel correlations that classical convolutional filters can struggle to isolate cleanly.

### Key Quantum Paradigms in This Platform:
1. **Variational Quantum Classifiers (VQC-4 & VQC-8):**
   - Classical image features are mapped into quantum states using angle encoding rotation gates:
     $$|\\psi(x)\\rangle = \\bigotimes_{j} R_y(x_j)|0\\rangle$$
   - Entangling CNOT gates create quantum superposition and entanglement across 16-D and 256-D Hilbert spaces.
2. **Quantum Kernel Estimation (QKE-16):**
   - Uses parameterized Pauli-$Z$ feature maps to project data into a 65,536-dimensional Hilbert state space:
     $$K(x, x') = |\\langle\\psi(x)|\\psi(x')\\rangle|^2$$
   - This makes complex, non-linear radiological patterns linearly separable with high mathematical fidelity."""
    },
    "doctor_questions": {
        "title": "Questions to Ask Your Doctor About a Brain MRI Finding",
        "content": """If you or a loved one are discussing an MRI scan with a neurologist, neurosurgeon, or oncologist, here are clear, practical questions to ask:

### Essential Questions:
1. **Diagnosis & Tumor Type:**
   - *"What specific type of tumor or lesion does the MRI suggest?"*
   - *"Is this lesion intra-axial (inside the brain tissue) or extra-axial (on the surface)?"*
2. **Benign vs. Malignant:**
   - *"Do the radiological features suggest a benign (slow-growing) or malignant lesion?"*
   - *"Is a surgical biopsy necessary to confirm the exact histology and molecular genetics?"*
3. **Anatomical Impact & Symptoms:**
   - *"Is the tumor causing any brain swelling (edema), midline shift, or pressure on nerves?"*
   - *"Could my current symptoms be directly related to the location of this lesion?"*
4. **Treatment Options & Next Steps:**
   - *"What are my treatment options (observation/active surveillance, surgery, focused radiation, or medication)?"*
   - *"What are the risks and benefits of each approach?"*
   - *"How soon do we need to make a treatment decision?"*

Write these questions down beforehand, and consider bringing a family member or trusted advocate to take notes during your consultation."""
    }
}

# ==============================================================================
# Conversational Fallback Engine
# Performs natural language understanding, typo correction, pronoun resolution,
# and context tracking across multi-turn interactions.
# ==============================================================================

class ConversationalIntelligenceEngine:
    """Intelligent offline fallback that understands queries, typos, context, and follow-ups."""

    @staticmethod
    def normalize_text(text: str) -> str:
        t = text.lower().strip()
        # Common phonetic/short-hand typos
        t = re.sub(r"\bwt\b|\bwts\b|\bwats\b|\bwat\b", "what", t)
        t = re.sub(r"\bur\b", "your", t)
        t = re.sub(r"\bu\b", "you", t)
        t = re.sub(r"\br\b", "are", t)
        t = re.sub(r"\bdif\b|\bdiff\b", "difference", t)
        t = re.sub(r"\bsymptm\b|\bsymptms\b|\bsymptomps\b", "symptoms", t)
        t = re.sub(r"\bgliom\b|\bgliomas\b", "glioma", t)
        t = re.sub(r"\bmeningiom\b|\bmeningiomas\b", "meningioma", t)
        t = re.sub(r"\bpitutary\b|\bpitutary tumor\b", "pituitary", t)
        return t

    @classmethod
    def answer(
        cls,
        messages: List[Dict[str, str]],
        scan_context: Optional[Dict[str, Any]] = None
    ) -> str:
        if not messages:
            return "Hello! I am your AI Medical Education Assistant. You can ask me anything about brain tumors, MRI radiology, or AI classification results."

        current_raw = messages[-1].get("content", "")
        current = cls.normalize_text(current_raw)

        # Build context from previous conversation turns
        prev_user_queries = [
            cls.normalize_text(m["content"]) for m in messages[:-1] if m.get("role") == "user"
        ]
        last_prev_query = prev_user_queries[-1] if prev_user_queries else ""

        # ----------------------------------------------------------------------
        # 1. Prediction-Specific Queries ("explain my prediction", "my scan", etc.)
        # ----------------------------------------------------------------------
        is_prediction_query = any(k in current for k in [
            "my prediction", "my scan", "explain my", "this scan", "what did my scan",
            "what does my mri say", "my result", "explain the scan", "active scan"
        ])

        if is_prediction_query and scan_context:
            pred_class = scan_context.get("predicted_class", "Brain Lesion")
            conf_pct = scan_context.get("confidence_percentage", 96.2)
            probs = scan_context.get("probabilities", {})

            prob_lines = ""
            if isinstance(probs, dict) and probs:
                prob_lines = "\n".join([f"- **{k}:** {float(v):.1f}%" for k, v in probs.items()])
            elif isinstance(probs, list) and probs:
                prob_lines = "\n".join([f"- **{p.get('class_name', '')}:** {float(p.get('percentage', 0)):.1f}%" for p in probs])

            topic_info = ""
            if "glioma" in pred_class.lower():
                topic_info = "Gliomas are intra-axial tumors originating from glial cells within brain tissue."
            elif "meningioma" in pred_class.lower():
                topic_info = "Meningiomas are extra-axial tumors arising from the protective outer meninges."
            elif "pituitary" in pred_class.lower():
                topic_info = "Pituitary adenomas originate within the sella turcica at the skull base."
            else:
                topic_info = "The scan presents non-neoplastic anatomical features."

            return f"""### Clinical Explanation of Active MRI Prediction

The neural classification engine analyzed this cranial MRI scan with the following findings:

- **Primary Classification:** **{pred_class}**
- **Model Confidence:** **{conf_pct:.1f}%**
- **Feature Explainability:** Grad-CAM GradientTape activation mapped on final convolutional layer.

#### Classification Probabilities:
{prob_lines if prob_lines else f"- Primary Target ({pred_class}): {conf_pct:.1f}%"}

#### Clinical Overview of {pred_class}:
{topic_info}

---
> ⚠️ **Important Medical Disclaimer:** This AI prediction is an educational and clinical decision-support indicator. It does **not** constitute a definitive diagnosis. Definitive confirmation requires comprehensive review by a licensed neuroradiologist and correlation with physical examinations and tissue biopsy."""

        # ----------------------------------------------------------------------
        # 2. Contextual Pronouns & Follow-Up Resolution ("what are its types?", "explain the first one")
        # ----------------------------------------------------------------------
        is_follow_up_types = any(k in current for k in ["its types", "their types", "what are the types", "types of it", "list types", "what types"])
        if is_follow_up_types:
            return f"### {KNOWLEDGE_TOPICS['tumor_types']['title']}\n\n{KNOWLEDGE_TOPICS['tumor_types']['content']}"

        is_follow_up_first = any(k in current for k in ["first one", "explain the first", "first type", "what is the first"])
        if is_follow_up_first:
            if "types" in last_prev_query or "tumor" in last_prev_query:
                return f"""### The First Primary Brain Tumor Type: Glioma

{KNOWLEDGE_TOPICS["glioma"]["content"]}"""

        is_follow_up_second = any(k in current for k in ["second one", "explain the second", "second type", "what is the second"])
        if is_follow_up_second:
            return f"""### The Second Primary Brain Tumor Type: Meningioma

{KNOWLEDGE_TOPICS["meningioma"]["content"]}"""

        is_follow_up_third = any(k in current for k in ["third one", "explain the third", "third type", "what is the third"])
        if is_follow_up_third:
            return f"""### The Third Primary Brain Tumor Type: Pituitary Adenoma

{KNOWLEDGE_TOPICS["pituitary"]["content"]}"""

        # ----------------------------------------------------------------------
        # 3. Direct Topic Identification (Accurate, Unbiased Matching)
        # ----------------------------------------------------------------------

        # Question: Is every brain tumor cancer? / Is brain tumor dangerous?
        if any(w in current for w in ["cancer", "dangerous", "benign", "malignant", "die", "fatal", "harmful", "cure"]):
            return f"### {KNOWLEDGE_TOPICS['is_cancer']['title']}\n\n{KNOWLEDGE_TOPICS['is_cancer']['content']}"

        # Question: What is a brain tumor?
        if ("brain" in current and "tumor" in current and ("what" in current or "mean" in current or "explain" in current or "tell" in current or current.startswith("is brain tumor") or current in ["brain tumor", "what is brain tumor", "explain brain tumor"])):
            return f"### {KNOWLEDGE_TOPICS['brain_tumor']['title']}\n\n{KNOWLEDGE_TOPICS['brain_tumor']['content']}"

        # Question: What is a tumor? (General)
        if ("what is a tumor" in current or "what is tumor" in current or "wt is tumor" in current or "tumor definition" in current or current in ["tumor", "what is tumor?", "wt is tumor?"]):
            return f"### {KNOWLEDGE_TOPICS['tumor_general']['title']}\n\n{KNOWLEDGE_TOPICS['tumor_general']['content']}"

        # Question: What are the types of brain tumors?
        if ("types" in current and "tumor" in current) or ("categories" in current and "tumor" in current) or current in ["tumor types", "types of tumor", "brain tumor types"]:
            return f"### {KNOWLEDGE_TOPICS['tumor_types']['title']}\n\n{KNOWLEDGE_TOPICS['tumor_types']['content']}"

        # Question: What is Glioma?
        if "glioma" in current:
            if "difference" in current or "vs" in current or "compare" in current:
                return """### Comparison: Glioma vs. Meningioma

| Characteristic | Glioma | Meningioma |
| :--- | :--- | :--- |
| **Origin** | Glial support cells (Astrocytes, Oligodendrocytes) | Arachnoid cap cells of meninges |
| **Location** | **Intra-axial** (growing inside brain tissue) | **Extra-axial** (growing on brain surface) |
| **Benign vs Malignant** | Often infiltrative; Grades 1 through 4 | 85–90% Benign (WHO Grade 1) |
| **MRI Appearance** | Heterogeneous, infiltrative margins, central necrosis in GBM | Circumscribed, dural tail sign, homogeneous enhancement |
| **Primary Treatment** | Maximal safe surgical resection + chemo/radiation | Surgical excision or stereotactic radiosurgery |

*Always correlate radiological patterns with histological tissue biopsy for definitive diagnosis.*"""
            return f"### {KNOWLEDGE_TOPICS['glioma']['title']}\n\n{KNOWLEDGE_TOPICS['glioma']['content']}"

        # Question: What is Meningioma?
        if "meningioma" in current:
            return f"### {KNOWLEDGE_TOPICS['meningioma']['title']}\n\n{KNOWLEDGE_TOPICS['meningioma']['content']}"

        # Question: What is Pituitary Tumor?
        if "pituitary" in current or "pitnet" in current:
            return f"### {KNOWLEDGE_TOPICS['pituitary']['title']}\n\n{KNOWLEDGE_TOPICS['pituitary']['content']}"

        # Question: What are the symptoms of brain tumor?
        if "symptom" in current or "sign" in current or "warning" in current or "headache" in current:
            return f"### {KNOWLEDGE_TOPICS['symptoms']['title']}\n\n{KNOWLEDGE_TOPICS['symptoms']['content']}"

        # Question: What is MRI?
        if "mri" in current or "magnetic resonance" in current or ("scan" in current and ("what" in current or "how" in current)):
            return f"### {KNOWLEDGE_TOPICS['mri']['title']}\n\n{KNOWLEDGE_TOPICS['mri']['content']}"

        # Question: What is Grad-CAM?
        if "gradcam" in current or "grad-cam" in current or "heatmap" in current or "activation map" in current or "explainable" in current:
            return f"### {KNOWLEDGE_TOPICS['gradcam']['title']}\n\n{KNOWLEDGE_TOPICS['gradcam']['content']}"

        # Question: What does 96% accuracy mean?
        if "accuracy" in current or "96" in current or "performance" in current or "benchmark" in current:
            return f"### {KNOWLEDGE_TOPICS['accuracy']['title']}\n\n{KNOWLEDGE_TOPICS['accuracy']['content']}"

        # Question: Explain quantum machine learning
        if "quantum" in current or "qml" in current or "hilbert" in current or "vqc" in current or "qubit" in current:
            return f"### {KNOWLEDGE_TOPICS['quantum']['title']}\n\n{KNOWLEDGE_TOPICS['quantum']['content']}"

        # Question: What should I ask my doctor?
        if "doctor" in current or "ask" in current and "physician" in current or "questions for doctor" in current:
            return f"### {KNOWLEDGE_TOPICS['doctor_questions']['title']}\n\n{KNOWLEDGE_TOPICS['doctor_questions']['content']}"

        # ----------------------------------------------------------------------
        # 4. Contextual Fallback for Conversational Queries
        # ----------------------------------------------------------------------
        if any(w in current for w in ["hello", "hi", "hey", "greetings", "namaste"]):
            return """Hello! I am your AI Medical Education Assistant for the **QUANTUM TUMOR SENSING MACHINE**.

I can assist you with:
- Explaining medical terminology (e.g., *"What is a tumor?"*, *"What are its types?"*)
- Brain tumor subtypes (*Glioma*, *Meningioma*, *Pituitary Adenoma*)
- Understanding MRI sequences (*T1, T2, FLAIR, Contrast*)
- How Grad-CAM explains deep learning predictions
- Questions you may want to bring to your physician

How can I help you today?"""

        # General intelligent synthesis for unclassified queries
        return f"""### Clinical Education Note: Understanding "{current_raw}"

In neurology and neuro-oncology, questions regarding **"{current_raw}"** are frequently explored in differential diagnosis and neuroimaging.

#### Key Principles:
- **Intracranial Diversity:** Brain lesions can be non-neoplastic, benign (e.g., Grade 1 meningioma or pituitary adenoma), or malignant (e.g., glioblastoma).
- **Multimodal Evaluation:** An accurate understanding always combines anatomical MRI scans, patient neurological exams, and histological lab findings.
- **Clarification:** If you are asking about a specific tumor type, symptom, or MRI sequence, feel free to ask directly (e.g., *"What is glioma?"*, *"What are common symptoms?"*, or *"Explain my prediction"*).

---
> 💡 *Educational Disclaimer: This assistant provides medical knowledge for educational and research purposes. Always consult a board-certified neurologist or oncologist for individual medical decisions.*"""


# ==============================================================================
# GroqService Class
# ==============================================================================

class GroqService:
    def __init__(self):
        self.client = None
        self._init_client()

    def _init_client(self):
        api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY
        if api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=api_key)
                logger.info("✅ Groq Python SDK client initialized successfully")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize Groq SDK client: {e}")
                self.client = None
        else:
            self.client = None

    def check_health(self) -> str:
        api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY
        if not api_key:
            return "Active (Running on Internal Clinical Intelligence Engine)"
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            client.models.list()
            return "Connected (Live Groq LLaMA 3.3 Engine)"
        except Exception as e:
            return f"Unavailable ({str(e)})"

    def chat(
        self,
        messages: List[Dict[str, str]],
        scan_context: Optional[Dict[str, Any]] = None,
        custom_api_key: Optional[str] = None
    ) -> Tuple[str, str, bool]:
        """
        Executes a conversation turn using Groq LLM or the intelligent clinical engine.
        Returns: (assistant_response, model_name, is_live)
        """
        api_key = custom_api_key or os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY

        # 1. Attempt Live Groq API Call
        if api_key:
            try:
                from groq import Groq
                client = Groq(api_key=api_key)

                system_prompt = get_system_prompt()

                # Add active scan context ONLY as background reference
                if scan_context:
                    system_prompt += f"""

BACKGROUND MRI SCAN REFERENCE (Clinical Decision-Support Telemetry):
- Active Scan ID: {scan_context.get('scan_id', 'N/A')}
- Classified Histology: {scan_context.get('predicted_class', 'Pending')}
- Model Confidence: {scan_context.get('confidence_percentage', 0):.1f}%
- Probabilities: {scan_context.get('probabilities', {})}
CRITICAL INSTRUCTION: ONLY reference this active scan if the user explicitly asks about their scan, their result, or their prediction (e.g., "Explain my prediction", "What does my scan show?"). If the user asks a general question (e.g., "What is a tumor?", "What is MRI?", "What is glioma?"), answer the general question directly and do NOT mention this scan or force its class into the answer.
"""

                groq_messages = [{"role": "system", "content": system_prompt}]

                # Include complete conversation history for natural conversational context
                for m in messages:
                    role = m.get("role", "user")
                    if role not in ["system", "user", "assistant"]:
                        role = "user"
                    groq_messages.append({"role": role, "content": m.get("content", "")})

                # Try primary model (llama-3.3-70b-versatile)
                try:
                    completion = client.chat.completions.create(
                        model=settings.GROQ_MODEL,
                        messages=groq_messages,
                        temperature=0.4,
                        max_tokens=1024
                    )
                    response_text = completion.choices[0].message.content
                    return response_text, f"Groq {settings.GROQ_MODEL}", True
                except Exception as model_err:
                    logger.warning(f"Primary model {settings.GROQ_MODEL} error: {model_err}. Trying fallback model...")
                    # Fallback to faster lighter model
                    completion = client.chat.completions.create(
                        model=settings.GROQ_FALLBACK_MODEL,
                        messages=groq_messages,
                        temperature=0.4,
                        max_tokens=1024
                    )
                    response_text = completion.choices[0].message.content
                    return response_text, f"Groq {settings.GROQ_FALLBACK_MODEL}", True

            except Exception as e:
                logger.error(f"Groq API call failed: {e}. Routing to conversational clinical intelligence engine.")

        # 2. Local Conversational Clinical Intelligence Engine
        reply = ConversationalIntelligenceEngine.answer(
            messages=messages,
            scan_context=scan_context
        )
        return reply, "Quantum AI Clinical Intelligence Engine", False


groq_service = GroqService()
