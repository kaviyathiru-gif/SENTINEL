FROM node:18-alpine as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package
COPY package.json package-lock.json* ./

# Copy workspaces
COPY frontend ./frontend
COPY backend ./backend

# Install dependencies
RUN npm ci

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies only
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose ports
EXPOSE 3001 5173

# Set environment
ENV NODE_ENV=production

# Start backend (frontend served as static)
CMD ["node", "backend/dist/index.js"]
