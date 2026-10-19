#!/usr/bin/env python3
"""Build the one-page text-only English guide (requires reportlab)."""
from pathlib import Path
import re
from shutil import copyfile
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/guides'
OUT.mkdir(parents=True, exist_ok=True)
RED = colors.HexColor('#B64847')
INK = colors.HexColor('#303030')
STYLES = {
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=24, leading=29, textColor=RED, spaceAfter=6),
    'heading': ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=RED, spaceBefore=11, spaceAfter=6, keepWithNext=True),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=10.5, leading=14.5, textColor=INK, spaceAfter=6),
    'step': ParagraphStyle('step', fontName='Helvetica', fontSize=10.5, leading=14.5, textColor=INK, leftIndent=14, firstLineIndent=-14, spaceAfter=7),
}

def rich(text):
    return re.sub(r'(https://[^\s]+)', r'<link href="\1" color="#B64847">\1</link>', escape(text))

def decorate(canvas, doc):
    if doc.page != 1:
        raise ValueError('Guide must fit on one page; shorten the source.')
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(RED)
    canvas.setFont('Helvetica-Bold', 9)
    canvas.drawString(42, height - 32, 'PPIAQ  |  QUEENSLAND')
    canvas.setStrokeColor(colors.HexColor('#FEB602'))
    canvas.setLineWidth(2)
    canvas.line(42, height - 41, width - 42, height - 41)
    canvas.setFillColor(colors.HexColor('#886644'))
    canvas.setFont('Helvetica', 8)
    canvas.drawString(42, 26, '19 October 2026  |  ppiaqueensland.org')
    canvas.drawRightString(width - 42, 26, 'Admin + Voter Guide  /  1')
    canvas.restoreState()

story = []
for line in (ROOT / 'docs/election-quick-guide.md').read_text().splitlines():
    line = line.strip()
    if not line:
        continue
    if line.startswith('# '):
        kind, line = 'title', line[2:]
    elif line.startswith('## '):
        kind, line = 'heading', line[3:]
    else:
        kind = 'step' if re.match(r'^\d+\. ', line) else 'body'
    story.append(Paragraph(rich(line), STYLES[kind]))

output = OUT / 'PPIAQ_Election_Quick_Guide.pdf'
SimpleDocTemplate(str(output), pagesize=A4, leftMargin=42, rightMargin=42,
                  topMargin=56, bottomMargin=43, title='PPIAQ Election Quick Guide',
                  author='PPIAQ', subject='One-page English admin and voter instructions').build(
                      story, onFirstPage=decorate, onLaterPages=decorate)
for legacy in ('PPIAQ_Election_Admin_Guide.pdf', 'PPIAQ_Election_Voter_Guide.pdf'):
    copyfile(output, OUT / legacy)
print(output.relative_to(ROOT))
