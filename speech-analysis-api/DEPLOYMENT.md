# Deployment Guide

## Local Development Setup

### Prerequisites
- Python 3.11+
- Docker and Docker Compose (optional, for containerized deployment)
- Google Gemini API key

### Step 1: Clone and Setup

```bash
cd speech-analysis-api
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` and add your Google Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
WHISPER_MODEL=base
LANGUAGE=vi
API_PORT=8000
```

### Step 3: Install Dependencies (Local)

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Step 4: Run Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit: http://localhost:8000

## Docker Deployment

### Build Image

```bash
docker build -t speech-analysis-api:latest .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

Check status:
```bash
docker-compose ps
docker-compose logs -f speech-api
```

Stop:
```bash
docker-compose down
```

## Production Deployments

### AWS Deployment

#### Option 1: EC2 with Docker

1. Launch EC2 instance (Ubuntu 22.04, t3.medium or larger)

2. Install Docker:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

3. Clone and deploy:
```bash
git clone <your-repo>
cd speech-analysis-api
cp .env.example .env
# Edit .env with API keys
docker-compose up -d
```

4. Configure security group:
   - Allow port 80 (HTTP)
   - Allow port 443 (HTTPS)
   - Allow port 8000 from your IP

#### Option 2: ECS + ECR

1. Create ECR repository:
```bash
aws ecr create-repository --repository-name speech-analysis-api
```

2. Build and push:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t speech-analysis-api:latest .
docker tag speech-analysis-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/speech-analysis-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/speech-analysis-api:latest
```

3. Create ECS task definition and service

#### Option 3: Elastic Beanstalk

```bash
eb init -p "Docker running on 64bit Amazon Linux 2" speech-analysis-api
eb create speech-api-env
eb deploy
```

### Google Cloud Deployment

#### Cloud Run

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/speech-analysis-api

# Deploy
gcloud run deploy speech-analysis-api \
  --image gcr.io/PROJECT_ID/speech-analysis-api \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --set-env-vars "GEMINI_API_KEY=your_key" \
  --allow-unauthenticated
```

#### GKE Kubernetes

```bash
# Create cluster
gcloud container clusters create speech-api --num-nodes 2

# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/speech-analysis-api

# Deploy
kubectl create deployment speech-api \
  --image=gcr.io/PROJECT_ID/speech-analysis-api
kubectl expose deployment speech-api \
  --type=LoadBalancer --port 80 --target-port 8000
```

### Azure Deployment

#### Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name speech-api \
  --image myregistry.azurecr.io/speech-analysis-api:latest \
  --cpu 2 --memory 4 \
  --port 8000 \
  --environment-variables GEMINI_API_KEY=your_key
```

#### App Service with Docker

```bash
az appservice plan create \
  --name speech-plan \
  --resource-group myResourceGroup \
  --sku B2 --is-linux

az webapp create \
  --resource-group myResourceGroup \
  --plan speech-plan \
  --name speech-api \
  --deployment-container-image-name myregistry.azurecr.io/speech-analysis-api:latest
```

## Performance Optimization

### Caching Whisper Model

The Whisper model is downloaded on first use (~3GB). Cache it in Docker:

```dockerfile
# In Dockerfile, before COPY . .
RUN python -c "import whisper; whisper.load_model('base')"
```

### GPU Support (NVIDIA)

For faster inference, use GPU-enabled instance:

1. Install NVIDIA drivers and CUDA
2. Modify Dockerfile:
```dockerfile
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

# ... rest of Dockerfile
```

3. Run with GPU:
```bash
docker run --gpus all -p 8000:8000 speech-analysis-api:latest
```

### Load Balancing

For high traffic, deploy multiple instances:

```yaml
# docker-compose.yml
services:
  speech-api-1:
    build: .
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "8001:8000"
  
  speech-api-2:
    build: .
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "8002:8000"
  
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - speech-api-1
      - speech-api-2
```

## Monitoring & Logging

### Docker Logs

```bash
docker-compose logs -f speech-api
```

### CloudWatch (AWS)

```bash
docker run -d \
  --log-driver awslogs \
  --log-opt awslogs-group=/ecs/speech-api \
  --log-opt awslogs-region=us-east-1 \
  speech-analysis-api:latest
```

### Application Insights (Azure)

Add to requirements.txt:
```
opentelemetry-api
opentelemetry-sdk
opentelemetry-exporter-azure-monitor
```

### Health Checks

Automated monitoring:
```bash
# Every 30 seconds
watch -n 30 'curl http://localhost:8000/api/v1/health'
```

## Security Best Practices

1. **API Keys**: Never commit `.env` file
   ```bash
   git add .env.example
   git add .gitignore
   ```

2. **HTTPS**: Use reverse proxy (Nginx/HAProxy)
   ```bash
   ssl_certificate /path/to/cert.pem;
   ssl_certificate_key /path/to/key.pem;
   ssl_protocols TLSv1.2 TLSv1.3;
   ```

3. **Rate Limiting**: Add to FastAPI
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   ```

4. **Authentication**: Protect API with JWT
   ```python
   from fastapi_jwt_auth import AuthJWT
   ```

## Troubleshooting

### Container won't start
```bash
docker logs speech-api
# Check for missing env vars or port conflicts
```

### Out of memory
- Use smaller Whisper model (`tiny` or `small`)
- Increase container memory in docker-compose.yml
- Use GPU-based deployment

### API slow
- Pre-load Whisper model in Dockerfile
- Use multi-instance load balancing
- Enable GPU acceleration

### API returns 500 errors
- Check `GEMINI_API_KEY` is valid
- Verify audio file format (WAV/MP3)
- Check file size < 50MB
