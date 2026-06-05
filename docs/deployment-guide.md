# AI Interview Assistant — Deployment Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Kubernetes cluster (AWS EKS recommended)
- MongoDB 7+
- OpenAI API key
- Speech-to-Text API key (Google/Azure/Whisper)
- AWS CLI & kubectl
- Helm (for Prometheus/Grafana)

---

## 1. Local Development

### 1.1 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/ai-interview-assistant.git
cd ai-interview-assistant

# Run setup script (auto-detects OS)
# Windows:
.\scripts\setup-dev.ps1

# macOS/Linux:
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### 1.2 Manual Setup

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys
# MONGODB_URI=mongodb://localhost:27017/interview_assistant
# JWT_SECRET=your-secret-key
# OPENAI_API_KEY=sk-...
# SPEECH_TO_TEXT_API_KEY=...

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongo mongo:7

# Initialize database with seed data
docker exec -i mongo mongosh < database/init.js

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
API Docs: http://localhost:5000/api/v1/health

### 1.3 Test Accounts

After running `database/init.js`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@interviewassistant.com | Admin123! |
| User | user@interviewassistant.com | User123! |

---

## 2. Docker Deployment

### 2.1 Build & Run with Docker Compose

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d --build

# Check status
docker-compose -f docker/docker-compose.yml ps

# View logs
docker-compose -f docker/docker-compose.yml logs -f backend
```

### 2.2 Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| MongoDB Admin | http://localhost:8081 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |

### 2.3 Individual Docker Builds

```bash
# Backend
docker build -f docker/Dockerfile.backend -t interview-assistant-backend:latest .

# Frontend
docker build -f docker/Dockerfile.frontend -t interview-assistant-frontend:latest .

# Run individually
docker run -d -p 5000:5000 --env-file backend/.env interview-assistant-backend
docker run -d -p 80:80 interview-assistant-frontend
```

---

## 3. Kubernetes Deployment (AWS EKS)

### 3.1 Prerequisites

```bash
# Install tools
aws configure
eksctl create cluster --name interview-assistant --region us-east-1 --nodegroup-name standard --node-type t3.medium --nodes 3 --nodes-min 3 --nodes-max 10

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name interview-assistant

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/aws/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
```

### 3.2 Deploy Application

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n ai-interview-assistant --timeout=120s

# Initialize database
# Copy init script to the pod and execute
MONGODB_POD=$(kubectl get pod -l app=mongodb -n ai-interview-assistant -o jsonpath="{.items[0].metadata.name}")
kubectl cp database/init.js $MONGODB_POD:/tmp/init.js -n ai-interview-assistant
kubectl exec $MONGODB_POD -n ai-interview-assistant -- mongosh < /tmp/init.js

# Deploy backend and frontend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Configure ingress
kubectl apply -f k8s/ingress.yaml

# Enable autoscaling
kubectl apply -f k8s/hpa.yaml

# Apply persistent volumes
kubectl apply -f k8s/pvc.yaml

# Check deployment status
kubectl get all -n ai-interview-assistant
kubectl get ingress -n ai-interview-assistant
```

### 3.3 Monitoring Stack

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace ai-interview-assistant \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Install Fluent Bit
helm install fluent-bit fluent/fluent-bit \
  --namespace ai-interview-assistant \
  --values monitoring/fluent-bit-values.yaml

# Access Grafana
kubectl port-forward service/prometheus-grafana 3000:80 -n ai-interview-assistant
# Default credentials: admin / prom-operator
```

### 3.4 Scaling

```bash
# Manual scaling
kubectl scale deployment backend -n ai-interview-assistant --replicas=5
kubectl scale deployment frontend -n ai-interview-assistant --replicas=5

# HPA automatically scales based on CPU (configured in k8s/hpa.yaml)
# View HPA status
kubectl get hpa -n ai-interview-assistant
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Setup

Configure secrets in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS region (e.g., us-east-1) |
| `EKS_CLUSTER_NAME` | EKS cluster name |
| `DOCKER_REGISTRY` | ECR registry URL |
| `OPENAI_API_KEY` | OpenAI API key |
| `SPEECH_TO_TEXT_API_KEY` | STT API key |
| `JWT_SECRET` | JWT signing secret |
| `MONGODB_URI` | MongoDB connection string |
| `SLACK_WEBHOOK_URL` | Slack notification URL |

### 4.2 Pipeline Stages

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) runs:

1. **Lint** — ESLint for frontend & backend
2. **Test** — Jest tests with mongodb-memory-server
3. **Security Scan** — npm audit + Snyk/Trivy
4. **Build** — Docker image builds
5. **Deploy** — Push to ECR + kubectl rollout (main only)

### 4.3 Manual Deployment Script

```bash
# Build and deploy using the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 5. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | API server port |
| `NODE_ENV` | No | development | Environment |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_EXPIRY` | No | 7d | Token expiry |
| `OPENAI_API_KEY` | Yes | — | LLM provider key |
| `SPEECH_TO_TEXT_API_KEY` | Yes | — | STT provider key |
| `CORS_ORIGINS` | No | http://localhost:5173 | Allowed origins |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |
| `LOG_LEVEL` | No | info | Winston log level |
| `PROMETHEUS_ENABLED` | No | true | Metrics endpoint |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | http://localhost:5000 | Backend API URL |
| `VITE_WS_URL` | No | ws://localhost:5000 | WebSocket URL |

---

## 6. Production Hardening

### 6.1 Security Checklist

- [ ] Enable TLS/SSL (cert-manager for K8s, Let's Encrypt)
- [ ] Set strong JWT_SECRET (openssl rand -base64 32)
- [ ] Enable rate limiting (configured in middleware)
- [ ] Set CORS to specific domain
- [ ] Disable debug endpoints
- [ ] Enable Helm's security context for pods
- [ ] Use network policies
- [ ] Enable audit logging
- [ ] Regular dependency updates (Dependabot)
- [ ] Secrets rotation policy
- [ ] WAF (AWS WAF) for ingress
- [ ] VPC with private subnets for databases

### 6.2 Backup & Restore

```bash
# MongoDB backup
kubectl exec $MONGODB_POD -n ai-interview-assistant -- mongodump --out=/tmp/backup
kubectl cp $MONGODB_POD:/tmp/backup ./backup-$(date +%Y%m%d) -n ai-interview-assistant

# MongoDB restore
kubectl cp ./backup $MONGODB_POD:/tmp/restore -n ai-interview-assistant
kubectl exec $MONGODB_POD -n ai-interview-assistant -- mongorestore /tmp/restore
```

### 6.3 Monitoring & Alerts

- **Prometheus** scrapes `/metrics` every 15s
- **Grafana** dashboards for:
  - Request rate, error rate, latency (p50/p95/p99)
  - LLM token usage & cost tracking
  - Active interviews & completion rates
  - System resources (CPU, memory, disk)
- **AlertManager** notifications for:
  - Critical: 5xx errors > 5%, service down
  - Warning: Response time > 2s, CPU > 80%
  - Info: Deployment events, certificate expiry

---

## 7. Database Management

### 7.1 Seed Data

The `database/init.js` script creates:
- 6 collections with proper indexes
- Admin user with full access
- 15 sample questions across 5 categories
- Text indexes for full-text search

### 7.2 Migrations

For schema changes, create migration scripts in `database/migrations/`:

```bash
# Example migration structure
database/
├── init.js              # Initial seed
├── migrations/
│   ├── 001_add_field.js
│   └── 002_update_indexes.js
└── Dockerfile
```

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection refused | Check MONGODB_URI, ensure MongoDB is running |
| WebSocket disconnects | Check WS_PORT, nginx proxy config for socket.io |
| LLM API errors | Verify OPENAI_API_KEY, check rate limits |
| Speech recognition fails | Verify SPEECH_TO_TEXT_API_KEY, check audio format |
| Docker build fails | Check Docker version, disk space, network |
| K8s pod CrashLoopBackOff | `kubectl describe pod <name>` and check logs |
| Ingress not working | Verify ingress controller is installed, check annotations |
| HPA not scaling | Check metrics-server, `kubectl get hpa --v=10` |

---

## 9. Performance Tuning

### 9.1 Backend
- Enable response compression
- Use MongoDB indexes (created in init.js)
- Implement Redis caching for LLM responses
- Connection pooling for MongoDB
- Cluster mode for multi-core

### 9.2 Frontend
- Code splitting with React.lazy
- Image optimization
- Bundle analysis with vite-bundle-analyzer
- Service worker for offline support
- Lazy loading routes

### 9.3 Kubernetes
- HPA based on custom metrics (LLM queue depth)
- Pod Disruption Budgets
- Cluster Autoscaler
- Spot instances for non-critical workloads
- Node taints for MongoDB (dedicated nodes)

---

## 10. Rollback Strategy

```bash
# Kubernetes rollback
kubectl rollout undo deployment/backend -n ai-interview-assistant
kubectl rollout undo deployment/frontend -n ai-interview-assistant

# Rollback to specific revision
kubectl rollout undo deployment/backend -n ai-interview-assistant --to-revision=2

# Docker rollback
docker-compose -f docker/docker-compose.yml down
docker-compose -f docker/docker-compose.yml up -d --force-recreate
```
