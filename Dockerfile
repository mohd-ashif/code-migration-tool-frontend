# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and frontend package files
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies for workspace
RUN npm ci --workspace=packages/frontend

# Copy frontend source
COPY packages/frontend ./packages/frontend

# Build time environment arguments
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

# Build Vite static assets
RUN npm --prefix packages/frontend run build

# Stage 2: Nginx Web Server stage
FROM nginx:alpine AS runner
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
