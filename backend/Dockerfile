FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    git \
    git-lfs \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads outputs reports sample_scans .keras_home .matplotlib_home models

RUN if [ ! -s models/brain_tumor_model.keras ] || [ $(wc -c < models/brain_tumor_model.keras 2>/dev/null || echo 0) -lt 100000 ]; then \
        echo "⬇️ Downloading 221MB trained weights into Docker image..."; \
        curl -L -o models/brain_tumor_model.keras "https://media.githubusercontent.com/media/anandbabl/quantum-tumor-sensing-machine/main/backend/models/brain_tumor_model.keras"; \
    fi

ENV PORT=10000
EXPOSE 10000 8000

CMD ["python", "run.py"]
