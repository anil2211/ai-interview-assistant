# AI Interview Assistant — Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        FE[React SPA<br/>Vite + Tailwind]
        PWA[PWA<br/>Mobile Support]
        WS[WebSocket<br/>Socket.io Client]
    end

    subgraph "CDN / Load Balancer"
        CF[CloudFront / CDN]
        LB[ALB / Load Balancer]
    end

    subgraph "Application Layer"
        API[REST API<br/>Express + TypeScript]
        WSS[WebSocket Server<br/>Socket.io]
        RT[Real-time Transcription]
    end

    subgraph "Service Layer"
        AI[AI Service<br/>OpenAI / LLM]
        STT[Speech-to-Text<br/>Google / Azure / Whisper]
        EXP[Export Service<br/>PDFKit]
    end

    subgraph "Data Layer"
        MQ[MongoDB<br/>Primary Database]
        REDIS[Redis<br/>Caching / Sessions]
        S3[S3 / Storage<br/>Audio Files / Reports]
    end

    subgraph "Monitoring & Observability"
        PROM[Prometheus<br/>Metrics Collection]
        GRAF[Grafana<br/>Dashboards]
        FLU[Fluent Bit<br/>Log Aggregation]
        ALERT[AlertManager<br/>Alerting]
    end

    subgraph "DevOps & Infrastructure"
        K8S[Kubernetes<br/>AWS EKS]
        DKR[Docker<br/>Containerization]
        GH[GitHub Actions<br/>CI/CD]
        TF[Terraform<br/>IaC]
    end

    FE --> CF
    PWA --> CF
    CF --> LB
    LB --> API
    LB --> WSS
    WS --> WSS
    API --> AI
    API --> STT
    API --> EXP
    WSS --> RT
    RT --> STT
    API --> MQ
    API --> REDIS
    API --> S3
    PROM --> API
    GRAF --> PROM
    FLU --> API
    ALERT --> PROM
    K8S --> API
    K8S --> MQ
    GH --> K8S
    DKR --> K8S
    TF --> K8S
```

## Component Architecture (Frontend)

```mermaid
graph TB
    subgraph "Frontend Application"
        RT[Router<br/>React Router v6]
        ST[State<br/>Zustand]
        QS[Query<br/>TanStack Query]
        WS[WebSocket<br/>Socket.io Client]
    end

    subgraph "Pages"
        DASH[Dashboard]
        INT[Interview]
        NEWINT[New Interview]
        QUES[Questions]
        ANL[Analytics]
        STPL[Study Plan]
        HIST[History]
        SETT[Settings]
    end

    subgraph "Shared Components"
        LAY[Layout]
        SIDE[Sidebar]
        HEAD[Header]
        PROTC[ProtectedRoute]
        TP[TranscriptionPanel]
        AP[AnswerPanel]
        FC[FeedbackCard]
        QC[QuestionCard]
        SG[ScoreGauge]
        PC[ProgressChart]
        CR[CategoryRadar]
    end

    subgraph "Services"
        API[API Client<br/>Axios]
        AUTH[Auth Service]
        IV[Interview Service]
        ANLS[Analytics Service]
        STPLSV[Study Plan Service]
    end

    RT --> DASH
    RT --> INT
    RT --> NEWINT
    RT --> QUES
    RT --> ANL
    RT --> STPL
    RT --> HIST
    RT --> SETT

    DASH --> LAY
    INT --> LAY
    LAY --> SIDE
    LAY --> HEAD

    INT --> TP
    INT --> AP
    INT --> FC
    INT --> QC
    ANL --> PC
    ANL --> CR
    ANL --> SG

    ST --> AUTH
    ST --> IV
    QS --> API
    API --> AUTH
    API --> IV
    API --> ANLS
    API --> STPLSV
    WS --> INT
```

## Data Flow — Interview Session

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant WS as WebSocket
    participant API as REST API
    participant AI as AI Service
    participant STT as Speech-to-Text
    participant DB as MongoDB

    U->>FE: Select interview type & difficulty
    FE->>API: POST /api/v1/interview/start
    API->>DB: Create interview session
    API->>AI: Generate questions
    AI-->>API: Questions array
    API-->>FE: Session ID + first question

    rect rgb(200, 220, 240)
        Note over U,DB: Interview Loop
        U->>FE: Click "Start Recording"
        FE->>WS: join-interview room
        U->>FE: Speak answer
        FE->>WS: transcribe-audio (stream)
        WS->>STT: Stream audio chunks
        STT-->>WS: Transcription result
        WS-->>FE: transcription-result (real-time)
        FE-->>U: Display live transcription

        U->>FE: Click "Submit Answer"
        FE->>API: POST /api/v1/interview/:id/answer
        API->>AI: Evaluate answer
        AI-->>API: Score + feedback + model answer
        API->>AI: Generate follow-up questions
        AI-->>API: Follow-up questions
        API->>DB: Store answer + feedback
        API-->>FE: Feedback + score + model answer + follow-ups
        FE-->>U: Display feedback card

        U->>FE: Request next question
        FE->>API: GET /api/v1/interview/:id/next
        API-->>FE: Next question
    end

    U->>FE: Click "End Interview"
    FE->>API: POST /api/v1/interview/:id/complete
    API->>AI: Calculate overall assessment
    API->>DB: Update analytics
    API-->>FE: Final score + summary + recommendations
    FE-->>U: Interview complete dashboard

    U->>FE: Export report
    FE->>API: GET /api/v1/interview/:id/export
    API->>API: Generate PDF
    API-->>FE: PDF download
```

## Directory Structure

```
ai-interview-assistant/
├── frontend/                     # React + TypeScript SPA
│   ├── public/                   # Static assets, PWA manifest
│   ├── src/
│   │   ├── components/           # Shared UI components
│   │   ├── pages/                # Route pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API clients, WebSocket
│   │   ├── store/                # Zustand state stores
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # Formatters, validators
│   │   └── styles/               # Global CSS, Tailwind
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # Env, database config
│   │   ├── controllers/          # Route handlers
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # Express route definitions
│   │   ├── middleware/           # Auth, validation, logging
│   │   ├── services/             # Business logic (AI, STT, etc.)
│   │   ├── websocket/            # Socket.io handlers
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Helpers, constants
│   ├── tests/                    # Jest test suites
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                       # Docker configs
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── mongodb-deployment.yaml
│   ├── mongodb-service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── pvc.yaml
│
├── monitoring/                   # Observability configs
│   ├── prometheus.yml
│   ├── grafana-dashboard.json
│   ├── fluent-bit.conf
│   └── alertmanager.yml
│
├── database/                     # DB init & seed
│   ├── init.js
│   └── Dockerfile
│
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions pipeline
│
├── scripts/                      # Dev/Deploy scripts
│   ├── setup-dev.sh
│   ├── setup-dev.ps1
│   └── deploy.sh
│
└── docs/
    ├── architecture.md
    └── deployment-guide.md
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript | UI framework |
| | Vite | Build tool |
| | Tailwind CSS | Styling |
| | React Router v6 | Routing |
| | Zustand | State management |
| | TanStack Query | Server state |
| | Socket.io Client | WebSocket |
| | Recharts | Analytics charts |
| | Framer Motion | Animations |
| **Backend** | Node.js, Express | API server |
| | TypeScript | Type safety |
| | Socket.io | Real-time |
| | Mongoose | ODM |
| | JWT | Auth |
| | Winston | Logging |
| | OpenAI API | LLM integration |
| **Database** | MongoDB 7 | Primary DB |
| | Redis | Caching |
| **Infrastructure** | Docker | Containerization |
| | Kubernetes (EKS) | Orchestration |
| | nginx | Reverse proxy |
| | GitHub Actions | CI/CD |
| **Monitoring** | Prometheus | Metrics |
| | Grafana | Dashboards |
| | Fluent Bit | Log aggregation |
| | AlertManager | Alerting |
