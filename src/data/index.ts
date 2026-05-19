// ── Edit this file to update site content ─────────────────────────────────
// Skills, stats, and highlight cards are all here.
// For blog posts, add/edit MDX files in src/content/blogs/ or src/content/personal-blog/

export const stats = [
  { value: '11+',      label: 'Years Experience' },
  { value: 'Multi-TB', label: 'Daily Pipelines' },
];

export const highlights = [
  {
    icon: '⚡',
    title: 'Real-Time Pipelines',
    desc: 'Built Kafka + Spark Streaming systems with sub-second latency for telecom and banking analytics.',
    tags: ['Kafka', 'Spark Streaming'],
  },
  {
    icon: '☁️',
    title: 'Cloud & Lakehouse',
    desc: 'Architected Delta Lake medallion (bronze/silver/gold) on Databricks for ML-ready, versioned data layers.',
    tags: ['Databricks', 'Delta Lake', 'AWS EMR'],
  },
  {
    icon: '🏗️',
    title: 'Infrastructure as Code',
    desc: 'HashiCorp Terraform Certified. Automated AWS infra across dev/staging/prod — zero config drift.',
    tags: ['Terraform', 'AWS', 'CI/CD'],
  },
  {
    icon: '🤖',
    title: 'AI Data Engineering',
    desc: 'Building Databricks Pipelines for LLM/GenAI feature stores, enabling AI-driven analytics at enterprise scale.',
    tags: ['AI Data Eng', 'LLM/GenAI', 'Databricks'],
  },
];

export const skillGroups = [
  {
    label: 'Distributed Processing',
    skills: ['PySpark', 'Spark Scala', 'Spark SQL', 'Spark Streaming', 'Hadoop', 'HDFS', 'YARN'],
  },
  {
    label: 'Cloud & Lakehouse',
    skills: ['AWS EMR', 'AWS Glue', 'S3', 'Athena', 'Lambda', 'Databricks', 'Delta Lake', 'Medallion Arch'],
  },
  {
    label: 'AI & Streaming',
    skills: ['LLM/GenAI', 'AI Pipelines', 'Apache Kafka', 'Spark Structured Streaming', 'Airflow', 'Control-M'],
  },
  {
    label: 'Languages & Databases',
    skills: ['Python', 'Scala', 'SQL', 'PostgreSQL', 'MySQL', 'Oracle', 'Cassandra', 'Apache Hive'],
  },
  {
    label: 'DevOps & IaC',
    skills: ['Terraform', 'CI/CD', 'Git', 'GitHub Actions', 'AutoSys'],
  },
  {
    label: 'Practices',
    skills: ['ETL/ELT', 'Data Modeling', 'Star Schema', 'SCD', 'Data Quality', 'Feature Engineering', 'Agile'],
  },
];
