"""
report_generator.py
===================
Generates a clean, documentation-style PDF report.
Uses Times New Roman font, black/white theme, standard box tables.

BEGINNER OVERVIEW:
  This file does not predict colleges by itself. It receives already prepared
  data from the rest of the project, then converts that data into a PDF.

  Main flow:
    1. generate_report() is called from main.py.
    2. Page 1 is created with student info and category ranks.
    3. College result pages are created with one block per college.
    4. College website links are searched automatically using DuckDuckGo HTML.
    5. A colored pie chart or bar chart is generated using Matplotlib.
    6. ReportLab finally joins all parts and saves the PDF file.

PAGE STRUCTURE:
  Page 1        -> Student basic information + category ranks table
  Page 2 onward -> College results table (college, branch, category,
                   quota, opening rank, closing rank, chance%)
  Last Page     -> Pie chart (<=8 colleges) or Bar chart (9+ colleges)

LIBRARIES:
  ReportLab  -> PDF creation, tables, paragraphs
  Matplotlib -> Chart generation embedded as image
  urllib     -> Free web request used to fetch DuckDuckGo HTML search results
"""

import io
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from link_fetcher import COLLEGE_LINK_CACHE, fetch_college_reference_links

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, PageBreak, Image, HRFlowable,
    KeepTogether          # <-- NEW: keeps college name + table + links on same page
)
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT


ACCENT_DARK = colors.HexColor("#1D4ED8")
ACCENT_MID = colors.HexColor("#2563EB")
ACCENT_LIGHT = colors.HexColor("#DBEAFE")
ROW_TINT = colors.HexColor("#F8FAFC")
BORDER_COLOR = colors.HexColor("#93C5FD")
CHART_COLORS = [
    "#2563EB", "#16A34A", "#F97316", "#9333EA",
    "#DC2626", "#0891B2", "#CA8A04", "#DB2777",
    "#4F46E5", "#059669", "#EA580C", "#7C3AED",
]


# ─────────────────────────────────────────────────────────────
#  STYLES
# ─────────────────────────────────────────────────────────────

def build_styles():
    """
    Returns a dict of ParagraphStyle objects using Times New Roman.
    All styles are black text on white — documentation format.
    """

    styles = {}

    # Document title on page 1
    styles["title"] = ParagraphStyle(
        "title",
        fontName="Times-Bold",
        fontSize=20,
        alignment=TA_CENTER,
        spaceAfter=4,
        textColor=colors.black,
    )

    # Subtitle line below title
    styles["subtitle"] = ParagraphStyle(
        "subtitle",
        fontName="Times-Roman",
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=10,
        textColor=colors.black,
    )

    # Bold section heading (e.g. "Student Information", "College Results")
    styles["section_heading"] = ParagraphStyle(
        "section_heading",
        fontName="Times-Bold",
        fontSize=13,
        spaceAfter=6,
        spaceBefore=12,
        textColor=colors.black,
        alignment=TA_LEFT,
    )

    # Standard body text
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Times-Roman",
        fontSize=10,
        spaceAfter=4,
        textColor=colors.black,
        alignment=TA_LEFT,
    )

    # Bold body text for table headers
    styles["body_bold"] = ParagraphStyle(
        "body_bold",
        fontName="Times-Bold",
        fontSize=10,
        textColor=colors.black,
        alignment=TA_LEFT,
    )

    # Link style used for official website / placement reference URLs.
    styles["link"] = ParagraphStyle(
        "link",
        parent=styles["body"],
        fontName="Times-Roman",
        fontSize=9,
        textColor=ACCENT_DARK,
        alignment=TA_LEFT,
    )

    # Small italic text for notes
    styles["note"] = ParagraphStyle(
        "note",
        fontName="Times-Italic",
        fontSize=9,
        textColor=colors.black,
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    # College name heading inside results section
    styles["college_heading"] = ParagraphStyle(
        "college_heading",
        fontName="Times-Bold",
        fontSize=11,
        textColor=ACCENT_DARK,
        spaceBefore=14,
        spaceAfter=4,
        alignment=TA_LEFT,
    )

    return styles


# ─────────────────────────────────────────────────────────────
#  TABLE STYLE HELPER
# ─────────────────────────────────────────────────────────────

def standard_table_style():
    """
    Returns a TableStyle with black border grid and plain white background.
    This is the documentation-style box table used throughout the report.
    """
    return TableStyle([
        # Black outer border around the entire table
        ("BOX",         (0, 0), (-1, -1), 0.8, colors.black),
        # Inner grid lines between all cells
        ("INNERGRID",   (0, 0), (-1, -1), 0.5, colors.black),
        # Header row bold background (light gray — standard document style)
        ("BACKGROUND",  (0, 0), (-1, 0),  colors.HexColor("#EEEEEE")),
        # Consistent padding in all cells
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
        # Middle vertical alignment for all cells
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        # Header row font bold
        ("FONTNAME",    (0, 0), (-1, 0),  "Times-Bold"),
        # Body rows Times Roman
        ("FONTNAME",    (0, 1), (-1, -1), "Times-Roman"),
        ("FONTSIZE",    (0, 0), (-1, -1), 9),
    ])


# ─────────────────────────────────────────────────────────────
#  CHART GENERATOR
# ─────────────────────────────────────────────────────────────

def extract_numeric_chance(chance_str):
    """
    Pulls the first number from a chance string.
    Example: 'Higher Chance (167.0% safe)' -> 100.0 (capped)
             '73.5% Chance'               -> 73.5
             'Borderline (0.5% Chance)'   -> 0.5
    """
    match = re.search(r"[\d.]+", str(chance_str))
    if match:
        val = float(match.group())
        # Cap at 100 for chart display; actual value shown in table
        return min(val, 100.0)
    return 0.0

def is_safe_or_borderline_chance(chance_str):
    """
    Keeps only safe and borderline prediction rows.
    Out-of-range / not-sure rows are intentionally excluded from tables and charts.
    """
    text = str(chance_str).lower()
    excluded = ("not sure", "out of range", "data unavailable")
    return not any(word in text for word in excluded)


def filter_safe_borderline_results(df_results):
    """
    Returns only safe + borderline rows, sorted by pure numeric chance descending.
    """
    df = df_results.copy()
    df = df[df["Chance"].apply(is_safe_or_borderline_chance)].copy()
    if df.empty:
        return df
    df["NumChance"] = df["Chance"].apply(extract_numeric_chance)
    return df.sort_values("NumChance", ascending=False)


def make_label(field_name):
    """
    Converts input keys like exam_type and category_rank into readable table labels.
    """
    words = str(field_name).replace("_", " ").strip().split()
    return " ".join(word.capitalize() for word in words)


def build_link_paragraph(label, url, styles):
    """
    Builds a clickable PDF paragraph when a URL is available.
    If no URL was found, it still explains that the reference could not be fetched.
    """
    # escape() makes sure special characters do not break ReportLab markup.
    safe_label = escape(str(label))
    if not url:
        return Paragraph(f"{safe_label}: Not found automatically", styles["body"])

    # ReportLab supports simple clickable links using <a href="..."> text </a>.
    safe_url = escape(str(url), {'"': "&quot;"})
    visible_url = escape(str(url))
    return Paragraph(
        f'{safe_label}: <a href="{safe_url}" color="#1D4ED8">{visible_url}</a>',
        styles["link"],
    )


def generate_chart(df_results):
    """
    Generates a Matplotlib chart and returns it as an in-memory PNG buffer.
    Pie chart if unique college count <= 8, horizontal bar chart otherwise.

    Steps:
      1. Build label and numeric chance columns
      2. Choose chart type
      3. Plot with Matplotlib
      4. Save to BytesIO buffer (no disk file needed)
      5. Return buffer for ReportLab to embed
    """

    # Use the same safe/borderline filter as the college tables.
    # This keeps chart data and table data consistent.
    df = filter_safe_borderline_results(df_results)

    if df.empty:
        return None

    # Keep one best row per college so the chart threshold truly means colleges.
    df = df.sort_values("NumChance", ascending=False)
    chart_df = df.drop_duplicates(subset=["Institute"], keep="first").copy()

    # Build short label: first part of institute name + best program.
    chart_df["Label"] = (
        chart_df["Institute"].str.split(",").str[0].str.strip().str[:32]
        + "\n"
        + chart_df["Program"].str[:28]
    )

    # Sort highest chance first
    chart_df = chart_df.sort_values("NumChance", ascending=False).head(30)

    # Count unique colleges to decide chart type
    num_unique_colleges = chart_df["Institute"].nunique()

    # BytesIO acts as an in-memory file — matplotlib saves PNG here
    # BytesIO acts like a temporary image file in memory.
    # Matplotlib saves the chart PNG here, then ReportLab reads it from here.
    buffer = io.BytesIO()

    if num_unique_colleges <= 8:
        # PIE CHART
        fig, ax = plt.subplots(figsize=(8, 6))

        # Use a bright fixed palette so the pie chart is always colorful.
        num_slices = len(chart_df)
        pie_colors = [CHART_COLORS[i % len(CHART_COLORS)] for i in range(num_slices)]

        wedges, texts, autotexts = ax.pie(
            chart_df["NumChance"],
            labels=None,
            autopct="%1.1f%%",
            colors=pie_colors,
            startangle=140,
            pctdistance=0.78,
        )

        # Style percentage labels
        for autotext in autotexts:
            autotext.set_fontsize(8)
            autotext.set_fontfamily("serif")

        # Legend with college + program labels
        ax.legend(
            wedges,
            chart_df["Label"].tolist(),
            title="College / Best Branch",
            loc="center left",
            bbox_to_anchor=(1.0, 0.5),
            fontsize=8,
            title_fontsize=9,
        )

        ax.set_title(
            "Admission Chances Distribution",
            fontsize=13,
            fontfamily="serif",
            pad=16,
        )

        fig.tight_layout()

    else:
        # HORIZONTAL BAR CHART
        # More than 8 colleges can make a pie chart crowded,
        # so a bar chart is clearer for bigger result sets.
        fig, ax = plt.subplots(figsize=(11, max(5, len(chart_df) * 0.42)))

        # Color each bar so the graph stays visually attractive.
        bar_colors = [CHART_COLORS[i % len(CHART_COLORS)] for i in range(len(chart_df))]
        ax.barh(
            chart_df["Label"],
            chart_df["NumChance"],
            color=bar_colors,
            edgecolor="#1F2937",
            height=0.55,
        )

        # Value labels at end of each bar
        for index, (val, label) in enumerate(zip(chart_df["NumChance"], chart_df["Label"])):
            ax.text(
                val + 0.5,
                index,
                f"{val:.1f}%",
                va="center",
                fontsize=8,
                fontfamily="serif",
            )

        ax.invert_yaxis()
        ax.set_xlabel("Chance (%)", fontsize=10, fontfamily="serif")
        ax.set_xlim(0, 115)
        ax.set_title(
            "Admission Chances by College",
            fontsize=13,
            fontfamily="serif",
        )
        ax.tick_params(axis="y", labelsize=8)

        # Reference line at 50%
        ax.axvline(x=50, color="#64748B", linestyle="--", linewidth=0.8, alpha=0.7)
        ax.text(51, -0.6, "50%", fontsize=8, fontfamily="serif", color="#334155")

        fig.tight_layout()

    # Save figure into memory buffer as PNG at 150 DPI
    fig.savefig(buffer, format="PNG", dpi=150, bbox_inches="tight",
                facecolor="white")
    # Seek back to start so ReportLab reads from beginning of buffer
    buffer.seek(0)

    plt.close(fig)

    return buffer


# ─────────────────────────────────────────────────────────────
#  PAGE 1: STUDENT INFORMATION
# ─────────────────────────────────────────────────────────────

def build_page1(story, user_data, rank_result, styles):
    """
    Appends Page 1 content to story list.
    Contains document title, student info table, and category ranks table.
    """

    # Every item added to `story` becomes part of the PDF in the same order.
    # ReportLab later places these items page by page when doc.build() runs.

    # Document title
    story.append(Paragraph("JEE College Prediction Report", styles["title"]))
    story.append(Spacer(1, 4))

    # Horizontal rule under title
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 10))

    # Subtitle with exam and year
    exam_label = user_data.get("exam_type", "").upper()
    year_label = str(user_data.get("year", ""))
    story.append(Paragraph(
        f"Exam: {exam_label}     |     Year of Data: {year_label}",
        styles["subtitle"]
    ))
    story.append(Spacer(1, 14))

    # ── STUDENT INFORMATION TABLE ─────────────────────────────
    story.append(Paragraph("Student Information", styles["section_heading"]))

    marks      = rank_result.get("marks")
    percentile = rank_result.get("percentile")

    # Build rows for the first table.
    # Each inner list is one table row: [left cell, right cell].
    info_rows = [
        [Paragraph("Field", styles["body_bold"]),
         Paragraph("Value", styles["body_bold"])],

        [Paragraph("Name", styles["body"]),
         Paragraph(str(user_data.get("name", "N/A")), styles["body"])],

        [Paragraph("Gender", styles["body"]),
         Paragraph(str(user_data.get("gender", "N/A")), styles["body"])],

        [Paragraph("State of Education", styles["body"]),
         Paragraph(str(user_data.get("state", "N/A")), styles["body"])],

        [Paragraph("Exam Type", styles["body"]),
         Paragraph(exam_label, styles["body"])],
    ]

    if year_label:
        info_rows.append([
            Paragraph("Year of Data", styles["body"]),
            Paragraph(year_label, styles["body"]),
        ])

    # Only add marks row if marks are available
    if marks is not None:
        info_rows.append([
            Paragraph("Marks Scored", styles["body"]),
            Paragraph(str(marks), styles["body"]),
        ])

    # Only add percentile row if percentile is available
    if percentile is not None:
        info_rows.append([
            Paragraph("Percentile", styles["body"]),
            Paragraph(str(percentile), styles["body"]),
        ])

    shown_keys = {"name", "gender", "state", "exam_type", "year", "marks", "percentile"}
    for key, value in user_data.items():
        if key in shown_keys:
            continue
        if value is None:
            continue
        if isinstance(value, (dict, list, tuple, set, pd.DataFrame, pd.Series)):
            continue
        try:
            if str(value).strip() == "":
                continue
        except Exception:
            continue

    # Convert the list of rows into an actual ReportLab table.
    info_table = Table(info_rows, colWidths=[7 * cm, 10 * cm])
    info_table.setStyle(standard_table_style())
    story.append(info_table)
    story.append(Spacer(1, 18))

    # ── CATEGORY AND RANK TABLE ───────────────────────────────
    cat_rank_data = rank_result.get("category_and_rank", {})

    if cat_rank_data:
        story.append(Paragraph("Category Ranks", styles["section_heading"]))

        cat_rows = [
            [Paragraph("Category", styles["body_bold"]),
             Paragraph("Rank", styles["body_bold"])]
        ]

        for category, rank in cat_rank_data.items():
            cat_rows.append([
                Paragraph(str(category), styles["body"]),
                Paragraph(str(rank), styles["body"]),
            ])

        # Category ranks are shown as a second table on page 1.
        cat_table = Table(cat_rows, colWidths=[8.5 * cm, 8.5 * cm])
        cat_table.setStyle(standard_table_style())
        story.append(cat_table)

    story.append(Spacer(1, 16))

    # Footer note before page break
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "The following pages list colleges where admission is possible based on "
        "historical JOSAA cutoff data. Results are sorted by admission chance (highest first).",
        styles["note"]
    ))

    story.append(PageBreak())


# ─────────────────────────────────────────────────────────────
#  PAGE 2+: COLLEGE RESULTS
# ─────────────────────────────────────────────────────────────

def build_college_pages(story, df_results, styles, user_data=None, fetch_college_links=True):
    """
    Appends college result tables to story.
    One table per college showing all eligible programs.
    Column order: Program | Category | Quota | Opening Rank | Closing Rank | Chance
    Only safe and borderline rows are included.

    FIX: Each college block (heading + HR + table + links) is wrapped inside
    KeepTogether so that the college name never gets stranded on a different
    page from its table or links.
    For very large tables (many branches) that exceed one full page, only the
    header block (name + HR + first few rows) is kept together; ReportLab then
    flows the rest naturally with the repeated header row.
    """

    # Section title page header
    story.append(Paragraph("College Prediction Results", styles["title"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Colleges listed below are sorted by admission chance percentage (highest first). "
        "Only safe and borderline branches are included.",
        styles["note"]
    ))
    story.append(Spacer(1, 10))

    # Keep only safe + borderline rows. Out-of-range rows stay out of the PDF.
    if df_results is None or df_results.empty:
        return
    df_show = filter_safe_borderline_results(df_results)

    if df_show.empty:
        story.append(Paragraph(
            "No colleges found within the safe or borderline range for the entered rank.",
            styles["body"]
        ))
        story.append(PageBreak())
        return

    # College blocks are ranked by the best available branch chance.
    college_order = (
        df_show.groupby("Institute")["NumChance"]
        .max()
        .sort_values(ascending=False)
        .index
        .tolist()
    )

    year_label = user_data.get("year", "") if user_data else ""

    for college_name in college_order:

        # Pick only this college's rows and sort its branches by chance.
        college_df = (
            df_show[df_show["Institute"] == college_name]
            .sort_values("NumChance", ascending=False)
            .copy()
        )

        # ── Build table rows ──────────────────────────────────
        header_row = [
            Paragraph("Program",        styles["body_bold"]),
            Paragraph("Category",       styles["body_bold"]),
            Paragraph("Quota",          styles["body_bold"]),
            Paragraph("Gender Pool",    styles["body_bold"]),
            Paragraph(f"Opening Rank ({year_label})", styles["body_bold"]),
            Paragraph(f"Closing Rank ({year_label})", styles["body_bold"]),
            Paragraph("Your Rank",      styles["body_bold"]),
            Paragraph("Chance",         styles["body_bold"]),
        ]

        table_rows = [header_row]

        for _, row in college_df.iterrows():
            chance_text = str(row.get("Chance", ""))
            chance_text = chance_text.replace("Limited Data", "").replace("limited data", "").strip()
            if chance_text == "Higher Chance ()":
                chance_text = "Higher Chance (100.0% safe)"
            table_rows.append([
                Paragraph(str(row.get("Program", "")),      styles["body"]),
                Paragraph(str(row.get("Category", "")),     styles["body"]),
                Paragraph(str(row.get("Quota", "")),        styles["body"]),
                Paragraph(str(row.get("Gender Pool", "")),  styles["body"]),
                Paragraph(str(row.get("Opening Rank", "")), styles["body"]),
                Paragraph(str(row.get("Closing Rank", "")), styles["body"]),
                Paragraph(str(row.get("Your Rank", "")),    styles["body"]),
                Paragraph(chance_text,                      styles["body"]),
            ])

        col_widths = [3.6*cm, 2.0*cm, 1.4*cm, 2.4*cm, 1.9*cm, 1.9*cm, 1.6*cm, 2.2*cm]

        # repeatRows=1 keeps the header visible when table spans multiple pages.
        result_table = Table(table_rows, colWidths=col_widths, repeatRows=1)
        result_table.setStyle(standard_table_style())

        # ── Fetch links ───────────────────────────────────────
        reference_links = (
            fetch_college_reference_links(college_name)
            if fetch_college_links else {"official": None, "support": None}
        )
        link_official  = build_link_paragraph(
            "Official college website",
            reference_links.get("official"),
            styles,
        )
        link_support   = build_link_paragraph(
            "Placement / fees / alumni reference",
            reference_links.get("support"),
            styles,
        )

        # ── Wrap entire college block in KeepTogether ─────────
        # KeepTogether tries to place all contained elements on the same page.
        # If the whole block fits on the remaining space of the current page,
        # it stays there.  If it does NOT fit, ReportLab moves the entire block
        # to the next page — so the college name is always just above its table.
        # For very tall tables (more rows than fit on one page), KeepTogether
        # will still split the table across pages, but the heading + at least
        # the first data row will always be together.
        college_block = KeepTogether([
            Paragraph(college_name, styles["college_heading"]),
            HRFlowable(width="100%", thickness=0.5, color=colors.black),
            Spacer(1, 4),
            result_table,
            Spacer(1, 4),
            link_official,
            link_support,
            Spacer(1, 22),
        ])

        story.append(college_block)


# ─────────────────────────────────────────────────────────────
#  LAST PAGE: CHART
# ─────────────────────────────────────────────────────────────

def build_chart_page(story, df_results, styles):
    """
    Appends the chart page to story.
    Embeds Matplotlib chart as an Image flowable inside the PDF.
    """
    print("DEBUG columns:", df_results.columns.tolist() if df_results is not None else None)
    print("DEBUG chance values:", df_results["Chance"].unique() if df_results is not None and not df_results.empty else None)
    story.append(PageBreak())
    story.append(Paragraph("Admission Chances Overview", styles["title"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 12))
     
    # Chart follows the same safe + borderline filter as the results pages.
    if df_results is None or df_results.empty:
        story.append(Paragraph("No chart data available.", styles["body"]))
        return
    df_chart = filter_safe_borderline_results(df_results)

    if df_chart.empty:
        story.append(Paragraph("No chart data available.", styles["body"]))
        return
    
    # Decide chart type based on number of unique colleges
    num_colleges = df_chart["Institute"].nunique()
    chart_type = "Pie Chart" if num_colleges <= 8 else "Bar Chart"
    story.append(Paragraph(
        f"The following {chart_type.lower()} shows admission chance distribution "
        f"across {num_colleges} college(s) found within your rank range.",
        styles["note"]
    ))
    story.append(Spacer(1, 10))

    # Generate chart and get PNG buffer from Matplotlib
    chart_buffer = generate_chart(df_chart)
    if chart_buffer is not None:
        with open("real_chart_debug.png", "wb") as f:
            f.write(chart_buffer.getvalue())
        chart_buffer.seek(0)   # reset pointer since we just read it

    if chart_buffer is None:
        story.append(Paragraph("No chart data available.", styles["body"]))
        return

    # Image flowable: reads directly from in-memory buffer
    from PIL import Image as PILImage

    # Read actual image dimensions to preserve aspect ratio
    chart_buffer.seek(0)
    pil_img = PILImage.open(chart_buffer)
    img_width, img_height = pil_img.size
    chart_buffer.seek(0)

    # Fix width to 16cm, scale height proportionally
    display_width = 16 * cm
    display_height = display_width * (img_height / img_width)

    chart_image = Image(chart_buffer, width=display_width, height=display_height)
    story.append(chart_image)

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Note: Percentage values above 100% indicate that the student rank is "
        "stronger than the historical opening rank for that branch. "
        "All data is based on JOSAA official opening and closing ranks.",
        styles["note"]
    ))


# ─────────────────────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────

def generate_report(
    user_data,
    rank_result,
    df_results,
    output_path="JEE_Report.pdf",
    fetch_college_links=True,
):
    """
    Builds the complete PDF report and saves it to output_path.

    Parameters:
        user_data   -> dict from user_input.py  (name, gender, state, etc.)
        rank_result -> dict from rank_engine     (marks, percentile, category_and_rank)
        df_results  -> DataFrame from college_data.scrape_josaa()
        output_path -> string path where PDF file will be saved
        fetch_college_links -> True fetches official + placement/fee/alumni links
    """

    # SimpleDocTemplate sets page size A4, margins, and output file path
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"JEE Report - {user_data.get('name', 'Student')}",
        author="JEE Prediction Tool",
    )

    # story list holds all content elements in order
    # doc.build() places them sequentially onto pages
    story = []
    styles = build_styles()

    # Build each section and append to story
    build_page1(story, user_data, rank_result, styles)
    build_college_pages(story, df_results, styles, user_data=user_data, fetch_college_links=fetch_college_links)
    build_chart_page(story, df_results, styles)

    # Render all story elements into the final PDF file
    doc.build(story)

    print(f"Report saved: {output_path}")
    return output_path


if __name__ == "__main__":
    print("This file is not meant to run directly.")
    print("Call generate_report(user_data, rank_result, df_results) from main.py")
