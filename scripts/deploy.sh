#!/usr/bin/env bash
set -euo pipefail

# ============================================
# AI Interview Assistant - Production Deploy
# ============================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="ai-interview-assistant"
DEPLOY_ENV="${1:-production}"
IMAGE_TAG="${2:-latest}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io/ai-interview-assistant}"
KUBE_CONTEXT="${KUBE_CONTEXT:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
  if [ $? -ne 0 ]; then
    log_error "Deployment failed! Initiating rollback..."
    rollback
  fi
}
trap cleanup EXIT

rollback() {
  log_warn "Rolling back to previous deployment..."
  if [ -n "${PREVIOUS_BACKEND_IMAGE:-}" ]; then
    kubectl set image deployment/backend-deployment \
      -n "$NAMESPACE" \
      "backend=$PREVIOUS_BACKEND_IMAGE" \
      --record 2>/dev/null || true
  fi
  if [ -n "${PREVIOUS_FRONTEND_IMAGE:-}" ]; then
    kubectl set image deployment/frontend-deployment \
      -n "$NAMESPACE" \
      "frontend=$PREVIOUS_FRONTEND_IMAGE" \
      --record 2>/dev/null || true
  fi
  log_ok "Rollback complete. Waiting for pods to stabilize..."
  kubectl rollout status deployment/backend-deployment -n "$NAMESPACE" --timeout=120s 2>/dev/null || true
  kubectl rollout status deployment/frontend-deployment -n "$NAMESPACE" --timeout=120s 2>/dev/null || true
  log_ok "Rollback finished."
}

log_info "Starting deployment for environment: $DEPLOY_ENV"
log_info "Image tag: $IMAGE_TAG"
echo ""

# -----------------------
# 1. Build Docker Images
# -----------------------
log_info "Building Docker images..."
docker build -t "${DOCKER_REGISTRY}/backend:${IMAGE_TAG}" \
  -f "$ROOT_DIR/docker/Dockerfile.backend" "$ROOT_DIR"
log_ok "Backend image built: ${DOCKER_REGISTRY}/backend:${IMAGE_TAG}"

docker build -t "${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}" \
  -f "$ROOT_DIR/docker/Dockerfile.frontend" "$ROOT_DIR"
log_ok "Frontend image built: ${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}"

if [ "$DEPLOY_ENV" = "production" ]; then
  docker tag "${DOCKER_REGISTRY}/backend:${IMAGE_TAG}" "${DOCKER_REGISTRY}/backend:latest"
  docker tag "${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}" "${DOCKER_REGISTRY}/frontend:latest"
fi

# -----------------------
# 2. Push to Registry
# -----------------------
log_info "Pushing images to registry..."
docker push "${DOCKER_REGISTRY}/backend:${IMAGE_TAG}"
docker push "${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}"

if [ "$DEPLOY_ENV" = "production" ]; then
  docker push "${DOCKER_REGISTRY}/backend:latest"
  docker push "${DOCKER_REGISTRY}/frontend:latest"
fi
log_ok "Images pushed successfully"

# -----------------------
# 3. Apply Kubernetes Manifests
# -----------------------
log_info "Applying Kubernetes manifests..."
KUBECTL_ARGS=""
if [ -n "$KUBE_CONTEXT" ]; then
  KUBECTL_ARGS="--context $KUBE_CONTEXT"
fi

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/namespace.yaml"
log_ok "Namespace applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/configmap.yaml"
kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/secrets.yaml"
log_ok "Config and secrets applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/pvc.yaml"
log_ok "PVCs applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/mongodb-deployment.yaml"
kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/mongodb-service.yaml"
log_ok "MongoDB manifests applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/backend-deployment.yaml"
kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/backend-service.yaml"
log_ok "Backend manifests applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/frontend-deployment.yaml"
kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/frontend-service.yaml"
log_ok "Frontend manifests applied"

kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/ingress.yaml"
kubectl $KUBECTL_ARGS apply -f "$ROOT_DIR/k8s/hpa.yaml"
log_ok "Ingress and HPA applied"

# Save current images for rollback
PREVIOUS_BACKEND_IMAGE=$(kubectl get deployment backend-deployment -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "")
PREVIOUS_FRONTEND_IMAGE=$(kubectl get deployment frontend-deployment -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "")

# Update image tags
kubectl $KUBECTL_ARGS set image deployment/backend-deployment \
  -n "$NAMESPACE" \
  "backend=${DOCKER_REGISTRY}/backend:${IMAGE_TAG}" \
  --record

kubectl $KUBECTL_ARGS set image deployment/frontend-deployment \
  -n "$NAMESPACE" \
  "frontend=${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}" \
  --record

# -----------------------
# 4. Health Check
# -----------------------
log_info "Waiting for rollout to complete..."
kubectl $KUBECTL_ARGS rollout status deployment/backend-deployment -n "$NAMESPACE" --timeout=300s
kubectl $KUBECTL_ARGS rollout status deployment/frontend-deployment -n "$NAMESPACE" --timeout=300s
log_ok "Rollout completed successfully"

log_info "Running health checks..."
sleep 15

BACKEND_POD=$(kubectl get pod -n "$NAMESPACE" -l component=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$BACKEND_POD" ]; then
  if kubectl exec "$BACKEND_POD" -n "$NAMESPACE" -- curl -sf http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    log_ok "Backend health check passed"
  else
    log_error "Backend health check failed"
    exit 1
  fi
fi

FRONTEND_POD=$(kubectl get pod -n "$NAMESPACE" -l component=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$FRONTEND_POD" ]; then
  if kubectl exec "$FRONTEND_POD" -n "$NAMESPACE" -- curl -sf http://localhost:80/ > /dev/null 2>&1; then
    log_ok "Frontend health check passed"
  else
    log_error "Frontend health check failed"
    exit 1
  fi
fi

echo ""
log_info "========================================"
log_ok "  Deployment Complete!"
log_info "========================================"
echo ""
log_info "Application URLs:"
echo "  Frontend: https://interview-assistant.example.com"
echo "  Backend:  https://interview-assistant.example.com/api/v1/health"
echo "  Grafana:  https://interview-assistant.example.com:3000"
echo "  Prometheus: https://interview-assistant.example.com:9090"
echo ""
log_info "Image tag deployed: $IMAGE_TAG"
log_info "Environment: $DEPLOY_ENV"
echo ""
