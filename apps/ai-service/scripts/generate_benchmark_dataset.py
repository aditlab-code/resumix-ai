
"""
generate_benchmark_dataset_v2.py
=================================
Generator dataset benchmark 200 CV PDF sintetis yang lebih robust & realistis.
Mensimulasikan berbagai template CV nyata yang beredar di dunia kerja:
  - ATS-Friendly (single column, reverse-chronological)
  - Harvard Style (education-first, XYZ bullets, serif, centered header)
  - Modern Two-Column (sidebar kiri untuk kontak/skill)
  - Creative Three-Column (sidebar + foto placeholder + timeline warna)
  - Functional / Skill-Based (dikelompokkan per kompetensi, bukan kronologis)
  - Academic CV (multi-halaman, publikasi, riset, konferensi)
  - Executive / Minimalist (padat, ringkas, fokus pencapaian)
  - Europass-like (tabel terstruktur, umum di Eropa)
  - Edge-case: CV hasil scan (gambar tanpa text layer) untuk uji rejection rule
  - Edge-case: CV "berantakan" (multi-font, spasi tidak konsisten, OCR-noise) untuk uji robustness parser

Setiap CV punya ground-truth (nama, role, skills, exp, email, phone, layout)
disimpan ke metadata.csv agar bisa dipakai untuk evaluasi otomatis (precision/recall
ekstraksi field oleh sistem parsing CV / ATS Anda).

Requirement: reportlab, pillow
    pip install reportlab pillow
"""

import os
import io
import csv
import random
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage,
    ListFlowable, ListItem, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

random.seed(42)

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "benchmark_dataset"))
os.makedirs(DATASET_DIR, exist_ok=True)


TOTAL_CV = 200

# --------------------------------------------------------------------------
# 1. DATA POOLS (untuk variasi konten realistis)
# --------------------------------------------------------------------------

FIRST_NAMES_ID = ["Budi","Siti","Ahmad","Dewi","Fajar","Maya","Reza","Indah","Eko","Dian",
    "Gilang","Hani","Irwan","Joko","Kiki","Lukman","Mega","Nanda","Oki","Putri",
    "Qori","Rian","Siska","Taufik","Umar","Vina","Wawan","Yusuf","Zahra","Adi",
    "Bagus","Cinta","Doni","Endang","Farah","Galih","Hesti","Ika","Jaka","Kartika",
    "Lina","Made","Nur","Okta","Prasetyo","Ratna","Sari","Tono","Utami","Wulan"]
LAST_NAMES_ID = ["Santoso","Rahma","Rizky","Lestari","Nugraha","Putri","Pratama","Permata",
    "Prasetyo","Sastro","Ramadhan","Wijaya","Shah","Widodo","Amalia","Hakim","Utami",
    "Kusuma","Susilo","Iskandar","Habibah","Setiawan","Handoko","Kurniawan","Saputra",
    "Wibowo","Hidayat","Gunawan","Firmansyah","Nasution","Simanjuntak","Siregar","Panjaitan"]
FIRST_NAMES_INTL = ["John","Emily","Michael","Sarah","David","Laura","James","Anna",
    "Robert","Linda","Thomas","Maria","Daniel","Jessica","Kevin","Olivia"]
LAST_NAMES_INTL = ["Smith","Johnson","Brown","Williams","Miller","Davis","Garcia",
    "Wilson","Anderson","Taylor","Thomas","Moore","Martin"]

CITIES = ["Jakarta","Bandung","Surabaya","Semarang","Yogyakarta","Medan","Makassar",
    "Denpasar","Malang","Ungaran","Solo","Bekasi","Depok","Tangerang"]

UNIVERSITIES = ["Universitas Indonesia","Institut Teknologi Bandung","Universitas Gadjah Mada",
    "Institut Teknologi Sepuluh Nopember","Universitas Diponegoro","Universitas Airlangga",
    "Universitas Padjadjaran","Universitas Brawijaya","Telkom University","Binus University"]

DEGREES = ["S.Kom","S.T","S.Si","M.Kom","M.T","B.Sc Computer Science","M.Sc Information Technology"]

DOMAIN_ROLES = {
    "tech": [
        ("Senior Python Engineer", "Python, PostgreSQL, Docker, FastAPI, Redis"),
        ("Fullstack Developer", "React, TypeScript, Node.js, PostgreSQL, Docker"),
        ("Machine Learning Engineer", "Python, PyTorch, LLMs, RAG, HuggingFace, Docker"),
        ("DevOps Engineer", "Docker, Kubernetes, AWS, Terraform, CI/CD, Linux"),
        ("Backend Go Engineer", "Go, Golang, PostgreSQL, Redis, Docker, gRPC"),
        ("Frontend React Specialist", "React, Next.js, TypeScript, Tailwind, Redux"),
        ("Data Engineer", "Python, SQL, Spark, Airflow, PostgreSQL, Snowflake"),
        ("QA Automation Engineer", "Python, Selenium, Cypress, Playwright, CI/CD"),
        ("Java Backend Engineer", "Java, Spring Boot, PostgreSQL, Docker, Kafka"),
        ("Mobile Flutter Engineer", "Flutter, Dart, Mobile Development, REST API"),
        ("Cloud Architect", "AWS, GCP, Terraform, Kubernetes, Linux, Docker"),
        ("UI/UX Designer", "Figma, User Research, Wireframing, Prototyping"),
        ("Cyber Security Specialist", "Linux, Penetration Testing, Python, Cyber Security"),
        ("Product Manager", "Product Management, Agile, Scrum, JIRA, Strategy"),
        ("Data Scientist", "Python, scikit-learn, Pandas, SQL, Statistics"),
        ("System Administrator", "Linux, Bash, Nginx, Docker, Networking, Firewall"),
        ("Android Developer", "Kotlin, Android Studio, Java, REST API, SQLite"),
        ("iOS Swift Developer", "Swift, SwiftUI, iOS SDK, CoreData, Xcode"),
        ("Site Reliability Engineer", "Kubernetes, Prometheus, Grafana, Go, Python"),
        ("Database Administrator", "PostgreSQL, MySQL, Oracle, Performance Tuning"),
        ("Business Analyst", "SQL, Requirements Gathering, BPMN, Excel"),
        ("Technical Writer", "API Documentation, Markdown, Git, Technical Writing"),
        ("AI Researcher", "Python, PyTorch, Transformers, Deep Learning"),
        ("Embedded Systems Developer", "C, C++, RTOS, Microcontrollers, IoT"),
        ("Scrum Master", "Scrum, Agile, JIRA, Confluence, Facilitation"),
    ],
    "nontech": [
        ("Guru Matematika & Fisika SMA", "Kurikulum Merdeka, Manajemen Kelas, Pengajaran Matematika"),
        ("Staff Front Desk & Guest Relations", "Hospitality Management, Public Relations, Handling Complaints"),
        ("Executive Chef & Pastry Specialist", "Culinary Arts, Pastry & Bakery, Kitchen Management"),
        ("Perawat Medis Rawat Inap", "Keperawatan Kritis, Perawatan Pasien, Infus, Triase Medis"),
        ("Sales Manager Properti", "Penjualan Properti, Negosiasi, Canvas Sales, CRM"),
        ("Akuntan Pajak", "Perpajakan, Akuntansi, Excel, SAP, Audit Internal"),
        ("HR Generalist", "Rekrutmen, Payroll, Employee Relations, HRIS"),
        ("Apoteker Klinis", "Farmakologi, Manajemen Apotek, Pelayanan Resep"),
        ("Marketing Communication Specialist", "Content Marketing, SEO, Social Media, Branding"),
        ("Insinyur Sipil Lapangan", "AutoCAD, Manajemen Proyek Konstruksi, K3, RAB"),
    ],
}

ACTION_VERBS = ["Memimpin","Mengembangkan","Merancang","Mengoptimalkan","Mengelola",
    "Membangun","Menganalisis","Mengimplementasikan","Meningkatkan","Mengotomasi",
    "Led","Developed","Designed","Optimized","Managed","Built","Analyzed",
    "Implemented","Improved","Automated"]

BULLET_TEMPLATES = [
    "{verb} sistem {system} yang melayani {n} pengguna aktif per bulan.",
    "{verb} proses {process}, menghasilkan efisiensi {pct}%.",
    "{verb} tim beranggotakan {n2} orang untuk menyelesaikan proyek {system} tepat waktu.",
    "{verb} pipeline {process} yang mengurangi waktu deployment sebesar {pct}%.",
    "{verb} integrasi antara {system} dan {process} menggunakan REST API.",
]
SYSTEMS = ["ERP","SIMRS","payment gateway","sistem inventori","dashboard analitik",
    "aplikasi mobile","platform e-commerce","sistem rekrutmen","CRM","data warehouse"]
PROCESSES = ["CI/CD","onboarding pelanggan","migrasi database","testing otomatis",
    "reporting bulanan","monitoring server","backup data"]

COMPANIES = ["PT Tech Nusantara","Digital Solution Indonesia","Data Labs Asia",
    "Cloud Systems Group","FinTech Indonesia","E-Commerce Corp","BigData Co",
    "Software House Prima","Bank Tech Digital","App Studio Kreatif","Global IT Consulting",
    "Creative Agency Studio","SecureNet Cyber","Startup Unicorn ID","Analytics Corp",
    "Enterprise Cloud Services","Mega Tech Industries","Web Agency Kreatif","Research Institute Nasional"]

CERTS = ["AWS Certified Solutions Architect","Certified Kubernetes Administrator",
    "Google Data Analytics Professional Certificate","PMP - Project Management Professional",
    "Certified Scrum Master","TOEFL ITP 550","CompTIA Security+"]
LANGUAGES = ["Bahasa Indonesia (Native)","English (Professional Working Proficiency)","Mandarin (Basic)"]
HOBBIES = ["Membaca","Fotografi","Traveling","Bermain musik","Olahraga","Menulis blog teknis"]

FONT_CHOICES = ["Helvetica","Times-Roman","Courier"]

# --------------------------------------------------------------------------
# 2. HELPER: random content generator
# --------------------------------------------------------------------------

def rand_name(intl=False):
    if intl:
        return f"{random.choice(FIRST_NAMES_INTL)} {random.choice(LAST_NAMES_INTL)}"
    return f"{random.choice(FIRST_NAMES_ID)} {random.choice(LAST_NAMES_ID)}"

def rand_phone():
    fmt = random.choice([
        f"+62 8{random.randint(11,99)}-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        f"08{random.randint(11,99)}{random.randint(10000000,99999999)}",
        f"(021) {random.randint(1000000,9999999)}",
    ])
    return fmt

def rand_bullet():
    t = random.choice(BULLET_TEMPLATES)
    return t.format(
        verb=random.choice(ACTION_VERBS),
        system=random.choice(SYSTEMS),
        process=random.choice(PROCESSES),
        n=random.choice([500,1200,5000,10000,25000]),
        n2=random.randint(3,12),
        pct=random.randint(10,65),
    )

def rand_experience_entries(n_entries):
    entries = []
    year = 2024
    for i in range(n_entries):
        dur = random.randint(6, 36)
        start_year = year - (dur // 12) - i
        end_label = "Sekarang" if i == 0 else f"{year - i}"
        title, _ = random.choice(DOMAIN_ROLES["tech"] + DOMAIN_ROLES["nontech"])
        company = random.choice(COMPANIES)
        bullets = [rand_bullet() for _ in range(random.randint(2,4))]
        entries.append({
            "title": title, "company": company,
            "period": f"{start_year} - {end_label}",
            "bullets": bullets,
        })
    return entries

def rand_education(n=1):
    edu = []
    y = 2020
    for i in range(n):
        edu.append({
            "degree": random.choice(DEGREES),
            "school": random.choice(UNIVERSITIES),
            "period": f"{y-4-i*4} - {y-i*4}",
            "gpa": round(random.uniform(3.1, 3.95), 2),
        })
    return edu

def build_spec(idx, layout, domain_bias=None):
    intl = random.random() < 0.12
    name = rand_name(intl=intl)
    domain = domain_bias or random.choices(["tech","nontech"], weights=[0.8,0.2])[0]
    role, skills = random.choice(DOMAIN_ROLES[domain])
    n_exp = random.randint(1,4)
    spec = {
        "id": f"cv_{idx:03d}",
        "name": name,
        "role": role,
        "skills": skills,
        "email": f"{name.lower().replace(' ', '.')}{random.randint(1,99)}@example.com",
        "phone": rand_phone(),
        "city": random.choice(CITIES),
        "experience": rand_experience_entries(n_exp),
        "education": rand_education(random.choice([1,1,2])),
        "certs": random.sample(CERTS, k=random.randint(0,3)),
        "languages": random.sample(LANGUAGES, k=random.randint(1,3)),
        "hobbies": random.sample(HOBBIES, k=random.randint(0,3)),
        "layout": layout,
        "font": random.choice(FONT_CHOICES),
        "domain": domain,
    }
    return spec

# --------------------------------------------------------------------------
# 3. PDF BUILDERS per TEMPLATE STYLE
# --------------------------------------------------------------------------

def _styles(font="Helvetica"):
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("T", parent=styles["Heading1"], fontName=font+"-Bold" if font!="Times-Roman" else "Times-Bold",
                                 fontSize=18, alignment=TA_LEFT, textColor=colors.HexColor("#111827"), spaceAfter=2),
        "title_center": ParagraphStyle("TC", parent=styles["Heading1"], fontName=font+"-Bold" if font!="Times-Roman" else "Times-Bold",
                                        fontSize=16, alignment=TA_CENTER, textColor=colors.black, spaceAfter=2),
        "subtitle": ParagraphStyle("S", parent=styles["Normal"], fontName=font, fontSize=10,
                                    textColor=colors.HexColor("#374151"), spaceAfter=6, alignment=TA_LEFT),
        "subtitle_center": ParagraphStyle("SC", parent=styles["Normal"], fontName=font, fontSize=10,
                                           textColor=colors.black, spaceAfter=6, alignment=TA_CENTER),
        "heading": ParagraphStyle("H", parent=styles["Heading2"], fontName=font+"-Bold" if font!="Times-Roman" else "Times-Bold",
                                   fontSize=12, spaceBefore=8, spaceAfter=3, textColor=colors.HexColor("#111827")),
        "heading_center": ParagraphStyle("HC", parent=styles["Heading2"], fontName=font+"-Bold" if font!="Times-Roman" else "Times-Bold",
                                          fontSize=11, spaceBefore=8, spaceAfter=3, alignment=TA_CENTER, textColor=colors.black),
        "body": ParagraphStyle("B", parent=styles["Normal"], fontName=font, fontSize=9.5,
                                leading=13, textColor=colors.HexColor("#1F2937"), alignment=TA_JUSTIFY),
        "small": ParagraphStyle("SM", parent=styles["Normal"], fontName=font, fontSize=8.5,
                                 leading=11, textColor=colors.HexColor("#374151")),
    }

def _bullet_list(items, style):
    return ListFlowable(
        [ListItem(Paragraph(b, style), leftIndent=8) for b in items],
        bulletType="bullet", start="•", leftIndent=12, spaceBefore=1, spaceAfter=4,
    )

def build_ats_pdf(filepath, spec):
    """Single-column, reverse-chronological, tanpa tabel/grafis -> murni ATS-safe."""
    font = spec["font"]
    st = _styles(font)
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=48, bottomMargin=48)
    story = [
        Paragraph(spec["name"], st["title"]),
        Paragraph(f"{spec['role']} | {spec['email']} | {spec['phone']} | {spec['city']}", st["subtitle"]),
        Spacer(1, 4),
        Paragraph("PROFESSIONAL SUMMARY", st["heading"]),
        Paragraph(f"Profesional berpengalaman sebagai {spec['role']} dengan rekam jejak kuat dalam "
                  f"{spec['skills'].split(',')[0]} dan {spec['skills'].split(',')[-1].strip()}.", st["body"]),
        Paragraph("WORK EXPERIENCE", st["heading"]),
    ]
    for e in spec["experience"]:
        story.append(Paragraph(f"<b>{e['title']}</b> — {e['company']} ({e['period']})", st["body"]))
        story.append(_bullet_list(e["bullets"], st["small"]))
    story.append(Paragraph("EDUCATION", st["heading"]))
    for ed in spec["education"]:
        story.append(Paragraph(f"{ed['degree']}, {ed['school']} ({ed['period']}) — GPA {ed['gpa']}", st["body"]))
    story.append(Paragraph("SKILLS", st["heading"]))
    story.append(Paragraph(spec["skills"], st["body"]))
    if spec["certs"]:
        story.append(Paragraph("CERTIFICATIONS", st["heading"]))
        story.append(Paragraph(", ".join(spec["certs"]), st["body"]))
    story.append(Paragraph("LANGUAGES", st["heading"]))
    story.append(Paragraph(", ".join(spec["languages"]), st["body"]))
    doc.build(story)

def build_harvard_pdf(filepath, spec):
    """Header center, Education dulu, XYZ bullets, serif font."""
    st = _styles("Times-Roman")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=60, rightMargin=60, topMargin=54, bottomMargin=54)
    story = [
        Paragraph(spec["name"], st["title_center"]),
        Paragraph(f"{spec['city']} | {spec['phone']} | {spec['email']} | linkedin.com/in/{spec['name'].split()[0].lower()}", st["subtitle_center"]),
        Spacer(1, 6),
        Paragraph("EDUCATION", st["heading_center"]),
    ]
    for ed in spec["education"]:
        story.append(Paragraph(f"<b>{ed['school']}</b>, {spec['city']}", st["body"]))
        story.append(Paragraph(f"{ed['degree']}, GPA {ed['gpa']} — {ed['period']}", st["small"]))
    story.append(Paragraph("EXPERIENCE", st["heading_center"]))
    for e in spec["experience"]:
        story.append(Paragraph(f"<b>{e['company']}</b>, {spec['city']}", st["body"]))
        story.append(Paragraph(f"<i>{e['title']}</i> — {e['period']}", st["small"]))
        story.append(_bullet_list(e["bullets"], st["small"]))
    story.append(Paragraph("LEADERSHIP &amp; ACTIVITIES", st["heading_center"]))
    story.append(Paragraph(f"Anggota aktif komunitas profesional {spec['role']}; mentor {random.randint(2,10)} junior developer.", st["body"]))
    story.append(Paragraph("SKILLS &amp; INTERESTS", st["heading_center"]))
    story.append(Paragraph(f"<b>Skills:</b> {spec['skills']}", st["body"]))
    story.append(Paragraph(f"<b>Interests:</b> {', '.join(spec['hobbies']) if spec['hobbies'] else 'Teknologi, Riset'}", st["body"]))
    doc.build(story)

def build_two_col_pdf(filepath, spec):
    """Modern: sidebar kiri (kontak, skill, bahasa), kolom kanan (ringkasan, pengalaman)."""
    font = spec["font"]
    st = _styles(font)
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=0, rightMargin=36, topMargin=36, bottomMargin=36)
    accent = random.choice(["#2563EB", "#0D9488", "#7C3AED", "#DC2626"])
    heading_side = ParagraphStyle("HS", parent=st["heading"], textColor=colors.white, fontSize=10.5)
    body_side = ParagraphStyle("BS", parent=st["small"], textColor=colors.whitesmoke)

    left = [
        Paragraph(spec["name"], ParagraphStyle("N", fontName=font+"-Bold" if font!="Times-Roman" else "Times-Bold", fontSize=13, textColor=colors.white)),
        Paragraph(spec["role"], ParagraphStyle("R", fontName=font, fontSize=9.5, textColor=colors.whitesmoke, spaceAfter=8)),
        Paragraph("CONTACT", heading_side),
        Paragraph(f"{spec['email']}<br/>{spec['phone']}<br/>{spec['city']}", body_side),
        Spacer(1, 8),
        Paragraph("SKILLS", heading_side),
        Paragraph(spec["skills"].replace(", ", "<br/>"), body_side),
        Spacer(1, 8),
        Paragraph("LANGUAGES", heading_side),
        Paragraph("<br/>".join(spec["languages"]), body_side),
    ]
    right = [
        Paragraph("PROFESSIONAL SUMMARY", st["heading"]),
        Paragraph(f"Profesional {spec['role']} dengan keahlian pada {spec['skills']}.", st["body"]),
        Paragraph("WORK EXPERIENCE", st["heading"]),
    ]
    for e in spec["experience"]:
        right.append(Paragraph(f"<b>{e['title']}</b> - {e['company']} ({e['period']})", st["body"]))
        right.append(_bullet_list(e["bullets"], st["small"]))
    right.append(Paragraph("EDUCATION", st["heading"]))
    for ed in spec["education"]:
        right.append(Paragraph(f"{ed['degree']}, {ed['school']} ({ed['period']})", st["body"]))

    tbl = Table([[left, right]], colWidths=[170, 372])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("BACKGROUND", (0,0), (0,-1), colors.HexColor(accent)),
        ("LEFTPADDING", (0,0), (0,-1), 16),
        ("RIGHTPADDING", (0,0), (0,-1), 12),
        ("TOPPADDING", (0,0), (0,-1), 20),
        ("LEFTPADDING", (1,0), (1,-1), 18),
        ("TOPPADDING", (1,0), (1,-1), 20),
    ]))
    doc.build([tbl])

def build_three_col_creative_pdf(filepath, spec):
    """Sidebar + placeholder foto + timeline warna, sering dipakai desainer/marketing."""
    font = spec["font"]
    st = _styles(font)
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
    accent = random.choice(["#0D9488", "#EA580C", "#7C3AED", "#DB2777"])

    photo_buf = io.BytesIO()
    img = Image.new("RGB", (120,120), color=tuple(random.randint(150,220) for _ in range(3)))
    d = ImageDraw.Draw(img)
    d.ellipse([10,10,110,110], outline=(80,80,80), width=3)
    img.save(photo_buf, format="PNG")
    photo_buf.seek(0)

    sidebar = [
        RLImage(photo_buf, width=70, height=70),
        Spacer(1,6),
        Paragraph("PROFIL", st["heading"]),
        Paragraph(f"{spec['name']}<br/>{spec['role']}", st["small"]),
        Spacer(1,6),
        Paragraph("KONTAK", st["heading"]),
        Paragraph(f"{spec['email']}<br/>{spec['phone']}<br/>{spec['city']}", st["small"]),
        Spacer(1,6),
        Paragraph("SKILL", st["heading"]),
        Paragraph(spec["skills"].replace(", ","<br/>"), st["small"]),
        Spacer(1,6),
        Paragraph("HOBI", st["heading"]),
        Paragraph(", ".join(spec["hobbies"]) if spec["hobbies"] else "-", st["small"]),
    ]
    main = [
        Paragraph("RINGKASAN PROFESIONAL", st["heading"]),
        Paragraph(f"Berpengalaman sebagai {spec['role']} dengan fokus pada hasil terukur.", st["body"]),
        Paragraph("PENGALAMAN KERJA", st["heading"]),
    ]
    for e in spec["experience"]:
        main.append(Paragraph(f"<b>{e['title']}</b> | {e['company']} | {e['period']}", st["body"]))
        main.append(_bullet_list(e["bullets"], st["small"]))
    main.append(Paragraph("PENDIDIKAN", st["heading"]))
    for ed in spec["education"]:
        main.append(Paragraph(f"{ed['degree']} - {ed['school']} ({ed['period']})", st["body"]))

    tbl = Table([[sidebar, main]], colWidths=[150, 372])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#F1F5F9")),
        ("LINEAFTER", (0,0), (0,-1), 2, colors.HexColor(accent)),
        ("LEFTPADDING", (0,0), (0,-1), 10),
        ("RIGHTPADDING", (0,0), (0,-1), 8),
        ("LEFTPADDING", (1,0), (1,-1), 16),
    ]))
    doc.build([tbl])

def build_functional_pdf(filepath, spec):
    """Skill-based / functional resume: dikelompokkan per kategori kompetensi, minim kronologi."""
    st = _styles(spec["font"])
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=48, bottomMargin=48)
    skills_list = [s.strip() for s in spec["skills"].split(",")]
    groups = {
        "Kompetensi Teknis": skills_list[:max(1,len(skills_list)//2)],
        "Kompetensi Pendukung": skills_list[max(1,len(skills_list)//2):] or ["Komunikasi","Kerja Tim"],
    }
    story = [
        Paragraph(spec["name"], st["title"]),
        Paragraph(f"{spec['role']} | {spec['email']} | {spec['phone']}", st["subtitle"]),
        Paragraph("RINGKASAN KUALIFIKASI", st["heading"]),
        Paragraph(f"Kandidat dengan kompetensi inti pada {spec['role']}, siap berkontribusi lintas fungsi.", st["body"]),
    ]
    for gname, gskills in groups.items():
        story.append(Paragraph(gname.upper(), st["heading"]))
        story.append(_bullet_list([f"{s}: {rand_bullet()}" for s in gskills], st["small"]))
    story.append(Paragraph("RIWAYAT PEKERJAAN (RINGKAS)", st["heading"]))
    for e in spec["experience"]:
        story.append(Paragraph(f"{e['title']}, {e['company']} ({e['period']})", st["small"]))
    story.append(Paragraph("PENDIDIKAN", st["heading"]))
    for ed in spec["education"]:
        story.append(Paragraph(f"{ed['degree']}, {ed['school']} ({ed['period']})", st["body"]))
    doc.build(story)

def build_academic_pdf(filepath, spec):
    """Academic CV multi-halaman: riwayat pendidikan, publikasi, konferensi, riset."""
    st = _styles("Times-Roman")
    doc = SimpleDocTemplate(filepath, pagesize=A4, leftMargin=54, rightMargin=54, topMargin=48, bottomMargin=48)
    story = [
        Paragraph(spec["name"], st["title_center"]),
        Paragraph(f"{spec['email']} | {spec['phone']} | {spec['city']}", st["subtitle_center"]),
        Paragraph("RIWAYAT PENDIDIKAN", st["heading"]),
    ]
    for ed in spec["education"]:
        story.append(Paragraph(f"{ed['degree']}, {ed['school']} ({ed['period']}), GPA {ed['gpa']}", st["body"]))
    story.append(Paragraph("PENGALAMAN RISET & AKADEMIK", st["heading"]))
    for e in spec["experience"]:
        story.append(Paragraph(f"<b>{e['title']}</b>, {e['company']} ({e['period']})", st["body"]))
        story.append(_bullet_list(e["bullets"], st["small"]))
    story.append(Paragraph("PUBLIKASI", st["heading"]))
    pubs = [f"{spec['name']} ({2020+i}). \"Studi tentang {random.choice(SYSTEMS)} berbasis {random.choice(spec['skills'].split(','))}\". Jurnal Nasional Vol. {random.randint(1,20)}."
            for i in range(random.randint(2,5))]
    story.append(_bullet_list(pubs, st["small"]))
    story.append(PageBreak())
    story.append(Paragraph("KONFERENSI & SEMINAR", st["heading"]))
    confs = [f"Pembicara pada seminar {random.choice(SYSTEMS)} tingkat nasional, {2021+i}." for i in range(3)]
    story.append(_bullet_list(confs, st["small"]))
    story.append(Paragraph("SERTIFIKASI", st["heading"]))
    story.append(Paragraph(", ".join(spec["certs"]) if spec["certs"] else "-", st["body"]))
    doc.build(story)

def build_messy_edge_case_pdf(filepath, spec):
    """CV 'berantakan': campuran font, indentasi tidak konsisten, simbol non-standar,
    kontak diletakkan di posisi tidak lazim -> menguji robustness parser."""
    st = _styles(random.choice(FONT_CHOICES))
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=30, bottomMargin=30)
    weird_bullets = ["»", "→", "◆", "*", "~"]
    story = [
        Paragraph(f"~~ {spec['name'].upper()} ~~", st["title_center"]),
        Paragraph(f"cari kerja sebagai {spec['role']}!! hub: {spec['phone']} / {spec['email']}", st["small"]),
        Spacer(1, 3),
        Paragraph("::: PENGALAMAN :::", st["heading_center"]),
    ]
    for e in spec["experience"]:
        story.append(Paragraph(f"{e['title']} @ {e['company']} [{e['period']}]", st["small"]))
        for b in e["bullets"]:
            story.append(Paragraph(f"{random.choice(weird_bullets)} {b}", st["small"]))
    story.append(Paragraph("SKILL:", st["heading_center"]))
    story.append(Paragraph(" // ".join(spec["skills"].split(",")), st["small"]))
    story.append(Paragraph("EDU", st["heading_center"]))
    for ed in spec["education"]:
        story.append(Paragraph(f"{ed['school']} ({ed['period']})", st["small"]))
    doc.build(story)

def build_scanned_image_pdf(filepath, spec):
    """PDF hasil scan: hanya raster image tanpa text layer (edge case zero-text)."""
    img = Image.new("RGB", (600, 800), color=(245, 245, 245))
    d = ImageDraw.Draw(img)
    d.rectangle([50, 50, 550, 750], outline=(100, 100, 100), width=2)
    d.text((100, 150), f"SCANNED RESUME: {spec['name']}", fill=(50, 50, 50))
    d.text((100, 200), "Dokumen hasil scan, tidak memiliki text layer.", fill=(80, 80, 80))
    d.text((100, 250), "Digunakan untuk uji Zero-Text Rejection Rule.", fill=(200, 50, 50))
    img.save(filepath, "PDF", resolution=100.0)

# --------------------------------------------------------------------------
# 4. DISTRIBUSI TEMPLATE UNTUK 200 CV (proporsional & realistis)
# --------------------------------------------------------------------------

LAYOUT_DISTRIBUTION = [
    ("ats",           60, build_ats_pdf),
    ("harvard",       40, build_harvard_pdf),
    ("two_col",       35, build_two_col_pdf),
    ("three_col",     25, build_three_col_creative_pdf),
    ("functional",    12, build_functional_pdf),
    ("academic",      10, build_academic_pdf),
    ("messy_edge",    10, build_messy_edge_case_pdf),
    ("scanned_edge",   8, build_scanned_image_pdf),
]

assert sum(n for _, n, _ in LAYOUT_DISTRIBUTION) == TOTAL_CV, "Distribusi harus total 200"

def main():
    print(f"[Dataset Generator v2] Membuat {TOTAL_CV} CV PDF sintetis di: {DATASET_DIR}")
    metadata_rows = []
    idx = 1
    for layout, count, builder in LAYOUT_DISTRIBUTION:
        for _ in range(count):
            domain_bias = "nontech" if layout in ("messy_edge",) and random.random()<0.3 else None
            spec = build_spec(idx, layout, domain_bias=domain_bias)
            filename = f"{spec['id']}_{layout}.pdf"
            filepath = os.path.join(DATASET_DIR, filename)
            try:
                builder(filepath, spec)
            except Exception as exc:
                print(f"  [WARN] gagal build {filename}: {exc}")
                idx += 1
                continue
            row = {
                "file": filename, "layout": layout, "name": spec["name"],
                "role": spec["role"], "email": spec["email"], "phone": spec["phone"],
                "city": spec["city"], "skills": spec["skills"],
                "n_experience": len(spec["experience"]), "n_education": len(spec["education"]),
                "domain": spec["domain"],
            }
            metadata_rows.append(row)
            idx += 1

    meta_path = os.path.join(DATASET_DIR, "metadata_ground_truth.csv")
    with open(meta_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(metadata_rows[0].keys()))
        writer.writeheader()
        writer.writerows(metadata_rows)

    print(f"[Dataset Generator v2] Selesai. {len(metadata_rows)} CV + metadata tersimpan di {meta_path}")

if __name__ == "__main__":
    main()
