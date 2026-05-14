# Yadhra Closet - E-commerce Project

## Overview
E-commerce platform for Pavithra Creations with frontend (Vercel) and backend (Render) deployment.

## Project Structure

```
yadhra-closet-template-main/
├── frontend/          # React/TypeScript + Vite + TanStack Start
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── routes/        # Page routes
│   │   ├── lib/           # Utilities (API, cart, WhatsApp)
│   │   └── context/       # Auth context
│   └── vercel.json        # Vercel config
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── controller/    # Route handlers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation
│   │   └── config/       # DB, Cloudinary config
│   └── render.yaml        # Render config
└── DEPLOYMENT_REPORT.md   # Deployment documentation
```

## Deployment

### Frontend → Vercel
- Auto-deploys on push to main
- Framework: Vite/TanStack Start
- Environment: Node.js 18+

### Backend → Render
- Auto-deploys on push to main
- Environment: Node.js
- Database: MongoDB (Atlas)
- Storage: Cloudinary (images)

## Key Commands

```bash
# Frontend
cd frontend && bun install && bun run dev

# Backend
cd backend && npm install && npm run dev
```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `PORT`
