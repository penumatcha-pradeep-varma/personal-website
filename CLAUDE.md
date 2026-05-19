# Personal Website — CLAUDE.md

Career + personal website for **Pradeep Varma Penumatcha**, Senior Data Engineer.
Primary purpose: job applications + personal branding.

## Owner Info

| Field | Value |
|---|---|
| Name | Pradeep Varma Penumatcha |
| Title | Senior Data Engineer |
| Experience | 11+ Years |
| Current Role | Senior Data Engineer (SSE III), JPMorgan Chase & Co. |
| Location | Hyderabad, India |
| Email | pradeep.penumatcha@outlook.com |
| LinkedIn | linkedin.com/in/pradeep-varma-p |
| Certifications | HashiCorp Terraform Associate, Databricks Hands-On |

## Navigation & Tone

| Tab | URL | Tone | Purpose |
|---|---|---|---|
| Home | `/` | Professional | Hero, intro, quick highlights |
| Experience | `/experience` | Professional | Work timeline, skills, resume download |
| About Me | `/about` | Professional | Bio, photo, values |
| Personal Blog | `/blog` | Structured/Technical | Data engineering articles, tutorials |
| Blogs | `/blogs` | Creative/Expressive | Travel, bike trips, life adventures — personal lifestyle |

**Blogs = lifestyle/personal (travel, bikes, adventures). More creative palette, expressive typography.**
**Personal Blog = technical writing. Cleaner, readable, code-friendly.**

## Stack

| Layer | Tool |
|---|---|
| Framework | Astro (static site generation) |
| 3D / Hero | Three.js — rotating geometric shapes (polyhedra, abstract geometry) |
| Scroll & Animations | GSAP + ScrollTrigger + ScrollSmoother |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Blog content | Astro Content Collections (MDX) |
| Hosting | Vercel (free tier, auto-deploy from GitHub) |

## Design

- **Hero**: Rotating 3D geometric shapes + ambient glow, dark background
- **Scroll**: GSAP ScrollSmoother — full inertia/smooth scroll
- **Color palette**:
  - Background: `#0a0a0f`
  - Primary: `#00d4ff` (electric cyan)
  - Accent: `#7c3aed` (purple)
  - Text: `#e2e8f0`
- **Photo**: `/public/images/pradeep-hero.jpg` — professional blue suit, spotlight, dark bg

## Experience Content (from resume)

### JPMorgan Chase & Co. — Senior Data Engineer (SSE III) | Sep 2021 – Present
- PySpark ETL/ELT on AWS EMR, multi-TB daily datasets for analytics + ML feature stores
- Spark tuning via partitioning, broadcast joins, shuffle reduction
- Databricks Delta Lake medallion (bronze/silver/gold) architecture
- Terraform IaC — dev/staging/prod AWS infrastructure
- Apache Airflow + Control-M orchestration; S3, RDBMS, REST API integration
- Feature engineering pipelines, ML-ready datasets

### BA Continuum – Bank of America — Data Engineer (Apps Analyst II) | Jul 2019 – Sep 2021
- Oracle/SQL Server → Hadoop/Spark migration via Apache Sqoop
- Spark Scala curated datasets, star schema, SCD Type 1 & 2 in Hive + Spark SQL
- Apache Kafka near-real-time ingestion + Hive/Spark SQL query tuning

### Tech Mahindra — Senior Software Engineer | Aug 2018 – Jul 2019
- Kafka + Spark Streaming real-time pipelines for telecom network analytics
- Events stored in Apache Cassandra; sub-second latency for SLA monitoring

### Cognizant Technology Solutions — Big Data Engineer (Analyst) | May 2014 – Jul 2018
- Batch pipelines (Sqoop, Hive, Spark Scala); Kafka + Flume real-time ingestion
- ORC/Parquet storage for BI and reporting

## Core Skills (for skills section)
- **Distributed**: PySpark · Spark Scala · Spark SQL · Spark Streaming · Hadoop · HDFS · YARN
- **Cloud & Lakehouse**: AWS (EMR, Glue, S3, Athena, Lambda) · Databricks · Delta Lake · Medallion Architecture
- **Streaming & Orchestration**: Apache Kafka · Spark Structured Streaming · Airflow · Control-M · AutoSys
- **Languages & Databases**: Python · Scala · SQL · PostgreSQL · MySQL · Oracle · Cassandra · Apache Hive
- **DevOps & IaC**: Terraform (HashiCorp Certified) · CI/CD · Git · GitHub Actions
- **Practices**: ETL/ELT · Data Modeling (Star Schema, SCD) · Data Quality · Feature Engineering · Agile/Scrum

## Key Achievements
- Reduced multi-TB daily ETL runtime at JPMorgan via Spark partitioning + shuffle optimization
- Architected Delta Lake medallion lakehouse on Databricks for reliable ML workloads
- Automated AWS infra with Terraform, eliminating manual config drift across environments
- Migrated enterprise RDBMS to Hadoop/Spark at Bank of America for scalable regulatory analytics

## Assets

| Asset | Path |
|---|---|
| Hero photo | `public/images/pradeep-hero.jpg` (needs to be saved here) |
| Resume PDF | `public/Pradeep_Resume.pdf` |

## Project Structure

```
src/
  components/
    three/          # Three.js scene components (HeroScene.ts, etc.)
    ui/             # Navbar, Footer, shared UI
    sections/       # Page section components
  layouts/
    BaseLayout.astro
    BlogLayout.astro
  pages/
    index.astro           # Home
    experience.astro
    about.astro
    blog/[...slug].astro       # Personal Blog (technical posts)
    blogs/[...slug].astro      # Blogs (lifestyle: travel, bikes)
  content/
    personal-blog/   # MDX: data engineering articles
    blogs/           # MDX: travel, bike trips, adventures
  styles/
    global.css
public/
  images/
    pradeep-hero.jpg
  Pradeep_Resume.pdf
```

## Key Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

## Rules

- No code comments unless WHY is non-obvious.
- Three.js scenes live in `src/components/three/` as standalone TypeScript modules.
- GSAP animations initialized client-side only (`<script>` tags in Astro, not top-level).
- All pages use `BaseLayout.astro`.
- Mobile-first: test at 375px, 768px, 1440px.
- Three.js canvas: use `powerPreference: "high-performance"`, dispose on unmount.
- Images in `public/images/`, resume in `public/`.
