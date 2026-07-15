# ─────────────────────────────────────────────────────────────────────────────
#  MediCare AI — AI Service  (FastAPI + LangChain RAG + Groq + faster-whisper)
#  Base: python:3.11-slim  (matches requirements.txt constraints)
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS base
WORKDIR /app

# System dependencies for:
#   - faster-whisper  (ffmpeg)
#   - sentence-transformers / torch  (build tools, libgomp)
#   - pdfkit  (wkhtmltopdf)
#   - faiss-cpu  (libopenblas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    build-essential \
    libgomp1 \
    libopenblas-dev \
    curl \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python dependencies ───────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Copy application source ───────────────────────────────────────────────────
COPY . .

# Pre-build dirs expected at runtime
RUN mkdir -p vectorstore models data

# Run as non-root
RUN useradd -m -u 1001 medicare
RUN chown -R medicare:medicare /app
USER medicare

EXPOSE 8000

# Start FastAPI via uvicorn
CMD ["uvicorn", "API.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
