import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import settings

class ReportService:
    @staticmethod
    def generate_pdf_report(
        prediction,
        scan,
        patient=None,
        output_filename: str = ""
    ) -> str:
        """
        Generates a professional clinical AI decision-support PDF report using ReportLab.
        Returns the absolute filepath of the generated PDF.
        """
        if not output_filename:
            output_filename = f"report_{prediction.id[:8]}.pdf"

        pdf_path = os.path.join(settings.REPORTS_DIR, output_filename)
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#8B5CF6"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#64748B"),
            fontName="Helvetica"
        )
        section_style = ParagraphStyle(
            "SectionTitle",
            parent=styles["Heading2"],
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica"
        )
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#64748B"),
            fontName="Helvetica-Oblique"
        )

        elements = []

        # Header Title
        elements.append(Paragraph("QUANTUM TUMOR SENSING MACHINE", title_style))
        elements.append(Paragraph("Intelligent Brain MRI Analysis & Tumor Classification Platform", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#8B5CF6"), spaceAfter=12, spaceBefore=4))

        # Metadata Table (Scan, Date, Patient)
        patient_name = patient.name if patient else "Unassigned / Anonymous"
        patient_code = patient.patient_code if patient else "N/A"
        date_str = prediction.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")

        meta_data = [
            [
                Paragraph("<b>Report ID:</b>", body_style), Paragraph(prediction.id, body_style),
                Paragraph("<b>Analysis Date:</b>", body_style), Paragraph(date_str, body_style)
            ],
            [
                Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient_name, body_style),
                Paragraph("<b>Patient ID:</b>", body_style), Paragraph(patient_code, body_style)
            ],
            [
                Paragraph("<b>MRI Scan File:</b>", body_style), Paragraph(scan.original_filename, body_style),
                Paragraph("<b>Model Version:</b>", body_style), Paragraph(prediction.model_version, body_style)
            ]
        ]

        meta_table = Table(meta_data, colWidths=[1.1*inch, 2.4*inch, 1.1*inch, 2.4*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8F9FA")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E0E0E0")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 14))

        # Primary Diagnostic Classification
        elements.append(Paragraph("AI Classification Summary", section_style))

        prob_list = json.loads(prediction.probabilities_json) if isinstance(prediction.probabilities_json, str) else []
        conf_pct = f"{prediction.confidence * 100:.2f}%"

        result_data = [
            [
                Paragraph(f"<b>Predicted Subtype:</b> <font color='#8052FF' size='+2'><b>{prediction.predicted_class}</b></font>", body_style),
                Paragraph(f"<b>Model Confidence:</b> <font color='#15846E' size='+2'><b>{conf_pct}</b></font>", body_style),
                Paragraph(f"<b>Inference Latency:</b> {prediction.inference_time_ms:.1f} ms", body_style)
            ]
        ]
        result_table = Table(result_data, colWidths=[3.2*inch, 2.3*inch, 1.5*inch])
        result_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F3F0FF")),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#8052FF")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(result_table)
        elements.append(Spacer(1, 10))

        # Probability Distribution Table
        elements.append(Paragraph("Comprehensive Class Probability Distribution", section_style))
        table_rows = [["Tumor Subtype", "Probability", "Percentage"]]
        for p in prob_list:
            table_rows.append([
                p.get("class_name", ""),
                f"{p.get('probability', 0):.4f}",
                f"{p.get('percentage', 0):.2f}%"
            ])
        prob_table = Table(table_rows, colWidths=[3.2*inch, 2.0*inch, 1.8*inch])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A1A1A")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E0E0E0")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9F9F9")]),
        ]))
        elements.append(prob_table)
        elements.append(Spacer(1, 14))

        # Images Section: Original Scan & Grad-CAM Heatmap
        elements.append(Paragraph("Radiological Visualizations & Grad-CAM Explainability Map", section_style))
        image_cells = []

        scan_full_path = os.path.join(settings.BASE_DIR, scan.file_path.lstrip("/"))
        if os.path.exists(scan_full_path):
            try:
                rl_scan = RLImage(scan_full_path, width=2.8*inch, height=2.8*inch)
                image_cells.append([rl_scan, Paragraph("<center><b>Original MRI Scan</b></center>", body_style)])
            except Exception:
                image_cells.append([Paragraph("Original scan preview unavailable", body_style)])

        if prediction.heatmap_path:
            heatmap_full_path = os.path.join(settings.BASE_DIR, prediction.heatmap_path.lstrip("/"))
            if os.path.exists(heatmap_full_path):
                try:
                    rl_heatmap = RLImage(heatmap_full_path, width=2.8*inch, height=2.8*inch)
                    if len(image_cells) > 0:
                        image_cells[0].extend([rl_heatmap, Paragraph("<center><b>Grad-CAM Salience Map</b></center>", body_style)])
                    else:
                        image_cells.append([rl_heatmap, Paragraph("<center><b>Grad-CAM Salience Map</b></center>", body_style)])
                except Exception:
                    pass

        if image_cells:
            img_table = Table(
                [
                    [image_cells[0][0], image_cells[0][2] if len(image_cells[0]) > 2 else ""],
                    [image_cells[0][1], image_cells[0][3] if len(image_cells[0]) > 3 else ""]
                ],
                colWidths=[3.5*inch, 3.5*inch]
            )
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            elements.append(img_table)
            elements.append(Spacer(1, 10))

        # Medical Disclaimer & Limitations
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CCCCCC"), spaceAfter=8, spaceBefore=4))
        disclaimer_text = (
            "<b>IMPORTANT REGULATORY & CLINICAL NOTICE:</b> This report contains an AI-generated decision-support "
            "prediction produced by deep neural network inference (reported benchmark accuracy ~96.2%). "
            "It is strictly intended for investigational, research, and assistive clinical reference, NOT as a standalone "
            "or medically confirmed diagnosis. Definitive clinical management requires comprehensive interpretation by "
            "a qualified board-certified radiologist, neuro-oncologist, or neurosurgeon in correlation with formal histopathology."
        )
        elements.append(Paragraph(disclaimer_text, disclaimer_style))

        # Build PDF Document
        doc.build(elements)
        return pdf_path

report_service = ReportService()
