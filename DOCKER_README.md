# Chatbot Docker Setup

## Quick Start

Build and run everything:
```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- Widget URL: http://localhost:8080/dist/chat-widget.umd.js

## Stop Services
```bash
docker-compose down
```

## Individual Services

### Backend Only
```bash
cd backend
docker build -t chatbot-backend .
docker run -p 4000:4000 chatbot-backend
```

### Production Deployment

1. Build the frontend widget:
```bash
cd frontend
npm run build
```

2. Start services:
```bash
docker-compose up -d
```

3. Embed on any website:
```html
<!-- React from CDN -->
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Your widget from Docker -->
<script src="http://your-server:8080/dist/chat-widget.umd.js"></script>

<!-- Auto-initialize -->
<div data-chat data-api-url="http://your-server:4000/chat"></div>
```

## Environment Variables

Create `.env` file in backend directory:
```
OLLAMA_URL=http://3.90.153.55:11434
PORT=4000
```

## Scaling

Scale backend instances:
```bash
docker-compose up -d --scale backend=3
```
