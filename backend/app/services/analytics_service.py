from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.scan import MRIScan
from app.models.prediction import Prediction
from app.schemas import AnalyticsOverviewResponse, ClassDistributionItem, DailyTrendItem
from app.config import settings

class AnalyticsService:
    @staticmethod
    def get_overview(db: Session, days: int = 30) -> AnalyticsOverviewResponse:
        """
        Calculates all key metrics strictly from actual database records.
        """
        total_scans = db.query(MRIScan).count()
        total_preds = db.query(Prediction).count()

        # Average confidence and latency
        avg_conf_row = db.query(func.avg(Prediction.confidence)).scalar()
        avg_latency_row = db.query(func.avg(Prediction.inference_time_ms)).scalar()

        avg_confidence = round(float(avg_conf_row or 0) * 100, 2)
        avg_latency = round(float(avg_latency_row or 0), 2)

        # Class distribution
        class_counts = (
            db.query(Prediction.predicted_class, func.count(Prediction.id))
            .group_by(Prediction.predicted_class)
            .all()
        )
        counts_dict = {c: 0 for c in settings.CLASS_NAMES}
        for c_name, count in class_counts:
            counts_dict[c_name] = count

        dist_items = []
        for c_name in settings.CLASS_NAMES:
            c = counts_dict.get(c_name, 0)
            pct = round((c / total_preds * 100), 1) if total_preds > 0 else 0.0
            dist_items.append(ClassDistributionItem(name=c_name, count=c, percentage=pct))

        # Daily trends over specified days
        since_date = datetime.now(timezone.utc) - timedelta(days=days)
        preds_in_range = (
            db.query(Prediction)
            .filter(Prediction.created_at >= since_date)
            .order_by(Prediction.created_at.asc())
            .all()
        )

        # Group by day
        trend_map = {}
        # Pre-seed last 7 days minimum
        for d in range(min(days, 14), -1, -1):
            day_str = (datetime.now(timezone.utc) - timedelta(days=d)).strftime("%b %d")
            trend_map[day_str] = {"scans": 0, "glioma": 0, "meningioma": 0, "pituitary": 0}

        for p in preds_in_range:
            d_str = p.created_at.strftime("%b %d")
            if d_str not in trend_map:
                trend_map[d_str] = {"scans": 0, "glioma": 0, "meningioma": 0, "pituitary": 0}
            trend_map[d_str]["scans"] += 1
            if "glioma" in p.predicted_class.lower():
                trend_map[d_str]["glioma"] += 1
            elif "meningioma" in p.predicted_class.lower():
                trend_map[d_str]["meningioma"] += 1
            elif "pituitary" in p.predicted_class.lower():
                trend_map[d_str]["pituitary"] += 1

        daily_trends = [
            DailyTrendItem(
                date=k,
                scans=v["scans"],
                glioma=v["glioma"],
                meningioma=v["meningioma"],
                pituitary=v["pituitary"]
            )
            for k, v in trend_map.items()
        ]

        recent_activity_count = len(preds_in_range)

        return AnalyticsOverviewResponse(
            total_scans=total_scans,
            total_predictions=total_preds,
            average_confidence=avg_confidence,
            average_inference_time_ms=avg_latency,
            class_distribution=dist_items,
            daily_trends=daily_trends,
            recent_activity_count=recent_activity_count
        )

analytics_service = AnalyticsService()
