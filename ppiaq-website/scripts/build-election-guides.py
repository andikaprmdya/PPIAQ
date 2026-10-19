#!/usr/bin/env python3
"""Generate the two public election PDFs. Requires: python3 -m pip install reportlab."""
from pathlib import Path
import re
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak, Image, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'guides'
OUT.mkdir(parents=True, exist_ok=True)
REGULAR = 'Helvetica'
BOLD = 'Helvetica-Bold'
for normal, bold in [
    ('/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'),
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
]:
    if Path(normal).exists() and Path(bold).exists():
        pdfmetrics.registerFont(TTFont('GuideSans', normal))
        pdfmetrics.registerFont(TTFont('GuideSansBold', bold))
        REGULAR, BOLD = 'GuideSans', 'GuideSansBold'
        break
RED = colors.HexColor('#B64847')
INK = colors.HexColor('#303030')
TAN = colors.HexColor('#886644')
styles = {
    'title': ParagraphStyle('title', fontName=BOLD, fontSize=24, leading=30, textColor=RED, spaceAfter=16, keepWithNext=True),
    'heading': ParagraphStyle('heading', fontName=BOLD, fontSize=13, leading=18, textColor=RED, spaceBefore=13, spaceAfter=7, keepWithNext=True),
    'body': ParagraphStyle('body', fontName=REGULAR, fontSize=10, leading=15, textColor=INK, spaceAfter=8, alignment=TA_LEFT),
    'list': ParagraphStyle('list', fontName=REGULAR, fontSize=10, leading=15, textColor=INK, leftIndent=16, firstLineIndent=-12, spaceAfter=6),
    'caption': ParagraphStyle('caption', fontName=REGULAR, fontSize=8, leading=12, textColor=TAN, spaceAfter=8),
}

def rich(text):
    result = escape(text)
    result = re.sub(r'(https://[^\s]+)', r'<link href="\1" color="#B64847">\1</link>', result)
    return result

def footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor('#E4DBCA'))
    canvas.line(45, height-36, width-45, height-36)
    canvas.setFont(BOLD, 8)
    canvas.setFillColor(RED)
    canvas.drawString(45, height-25, 'PPIAQ  /  PEMILIHAN PRESIDEN')
    canvas.setFont(REGULAR, 8)
    canvas.setFillColor(TAN)
    canvas.drawString(45, 27, 'Panduan 19 Oktober 2026  |  ppiaqueensland.org')
    canvas.drawRightString(width-45, 27, str(doc.page))
    canvas.restoreState()

def build(source, output):
    story = []
    buffer = []
    def flush():
        if buffer:
            story.append(Paragraph(rich(' '.join(buffer)), styles['body']))
            buffer.clear()
    for raw in source.read_text().splitlines():
        line = raw.strip()
        if not line:
            flush(); continue
        flush()
        if line == '<!-- pagebreak -->':
            story.append(PageBreak())
        elif line.startswith('[SCREENSHOT:'):
            name = line[len('[SCREENSHOT:'):-1]
            image = ROOT / 'docs' / 'election-guide-images' / name
            if image.exists():
                from PIL import Image as PILImage
                w, h = PILImage.open(image).size
                max_w, max_h = A4[0]-100, 190
                scale = min(max_w/w, max_h/h)
                story.append(KeepTogether([Image(str(image), width=w*scale, height=h*scale), Paragraph('Contoh tampilan dengan data DEMO, bukan anggota atau suara sungguhan.', styles['caption'])]))
        elif line.startswith('# '):
            story.append(Paragraph(rich(line[2:]), styles['title']))
        elif line.startswith('## '):
            story.append(Paragraph(rich(line[3:]), styles['heading']))
        elif line.startswith('- ') or re.match(r'^\d+\. ', line):
            text = '• ' + line[2:] if line.startswith('- ') else line
            story.append(Paragraph(rich(text), styles['list']))
        else:
            buffer.append(line)
    flush()
    doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=45, leftMargin=45, topMargin=52, bottomMargin=48,
                            title=source.read_text().splitlines()[0][2:], author='PPIAQ', subject='Panduan pengelolaan pemilihan dan penggunaan hak pilih')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(output.relative_to(ROOT))

build(ROOT/'docs/election-admin-guide.md', OUT/'PPIAQ_Election_Admin_Guide.pdf')
build(ROOT/'docs/election-voter-guide.md', OUT/'PPIAQ_Election_Voter_Guide.pdf')
