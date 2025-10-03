# HuLib Backend - Azure Deployment Guide

Complete guide to deploy HuLib NestJS backend to Azure Container Apps using Docker.

## Prerequisites

- Azure account with active subscription
- Docker installed locally
- Azure CLI installed (`az --version`)
- Access to your Neon PostgreSQL database

## Step 1: Create Azure Resources (Azure Portal)

### 1.1 Resource Group
1. Go to [Azure Portal](https://portal.azure.com) → **Resource groups** → **+ Create**
2. Configure:
    - **Resource group name**: `hulib-rg`
    - **Region**: `East US`
3. Click **Review + create** → **Create**

### 1.2 Container Registry
1. Search **"Container registries"** → **+ Create**
2. Configure:
    - **Resource group**: `hulib-rg`
    - **Registry name**: `hulibregistry` (globally unique)
    - **Location**: `East US`
    - **SKU**: `Standard`
3. After creation: Go to **Access keys** → Enable **Admin user**
4. **Save username and password**

### 1.3 Redis Cache
1. Search **"Azure Cache for Redis"** → **+ Create**
2. Configure:
    - **Resource group**: `hulib-rg`
    - **DNS name**: `hulib-redis`
    - **Location**: `East US`
    - **Cache type**: `Basic C0`
3. After creation: Go to **Access keys** → Save **Primary connection string**

### 1.4 Container Apps Environment
1. Search **"Container Apps"** → **+ Create**
2. **Basics**:
    - **Resource group**: `hulib-rg`
    - **Container app name**: `hulib-backend`
    - **Region**: `East US`
3. **Environment**: Create new → `hulib-env`
4. **Container**:
    - **Image**: `mcr.microsoft.com/azuredocs/containerapps-helloworld:latest` (temporary)
    - **CPU**: `0.5`, **Memory**: `1Gi`
5. **Ingress**: Enable → **Target port**: `3000`

### 1.5 Key Vault (Optional)
1. Search **"Key vaults"** → **+ Create**
2. Configure:
    - **Resource group**: `hulib-rg`
    - **Name**: `hulib-keyvault`
    - **Region**: `East US`

## Step 2: Update Environment Configuration

Update your existing `.env.production` file with Azure-specific configurations:

```bash
NODE_ENV=production
APP_NAME=HuLib Backend
APP_PORT=3000
API_PREFIX=api
FRONTEND_DOMAIN=https://hulib.vercel.app

# Neon PostgreSQL Database
DATABASE_TYPE=postgres
DATABASE_HOST=your-neon-host.aws.neon.tech
DATABASE_PORT=5432
DATABASE_USERNAME=your-neon-username
DATABASE_PASSWORD=your-neon-password
DATABASE_NAME=your-neon-database
DATABASE_SYNCHRONIZE=false
DATABASE_SSL_ENABLED=true
DATABASE_URL="postgresql://username:password@host.aws.neon.tech:5432/database?sslmode=require"

# Azure Redis Cache
REDIS_HOST=hulib-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-password
REDIS_USERNAME=default

# File Storage (AWS S3 or Azure Blob)
FILE_DRIVER=s3
ACCESS_KEY_ID=your-access-key
SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_S3_BUCKET=hulib-files
AWS_S3_REGION=us-east-1

# Authentication Secrets
AUTH_JWT_SECRET=your-jwt-secret-256-chars
AUTH_REFRESH_SECRET=your-refresh-secret-256-chars
AUTH_FORGOT_SECRET=your-forgot-secret-256-chars
AUTH_CONFIRM_EMAIL_SECRET=your-confirm-email-secret-256-chars

# Email Configuration
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_DEFAULT_EMAIL=noreply@hulib.org
MAIL_DEFAULT_NAME=HuLib

# Social Authentication
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Agora Video Calling
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
AGORA_CUSTOMER_ID=your-agora-customer-id
AGORA_CUSTOMER_SECRET=your-agora-customer-secret
```

**Key Azure-specific updates:**
- **REDIS_HOST**: Update to your Azure Redis Cache endpoint
- **REDIS_PORT**: Use 6380 (SSL port) for Azure Redis
- **REDIS_PASSWORD**: Use Primary access key from Azure Redis
- **BACKEND_DOMAIN**: Will be updated after Container App deployment

## Step 3: Optimize Production Dockerfile

**Note**: You can use your existing `Dockerfile` or update it with these Azure optimizations. No need to create a separate `Dockerfile.azure`.

Update your existing `Dockerfile` for Azure production deployment:

```dockerfile
FROM node:20.17.0-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# Builder stage
FROM base AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --frozen-lockfile

COPY . .

# Generate Prisma client (required for your dual DB strategy)
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install runtime dependencies
RUN apk add --no-cache curl bash

# Copy production files
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Create directories for file handling
RUN mkdir -p /app/files && \
    chown -R nestjs:nodejs /app/files

# Switch to non-root user
USER nestjs

# Health check for Azure Container Apps
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

**Key optimizations for your HuLib architecture:**
- **Multi-stage build**: Optimizes image size
- **Prisma generation**: Required for your dual database strategy
- **File directories**: Creates `/app/files` for your file upload module
- **Non-root user**: Azure Container Apps security requirement
- **Health check**: Uses your existing `/api/v1/health` endpoint

## Step 4: Database Migration

Run migrations against your Neon database before deployment:

```bash
# Set your Neon DATABASE_URL
export DATABASE_URL="postgresql://username:password@host.aws.neon.tech:5432/database?sslmode=require"

# Run Prisma migrations
npx prisma migrate deploy

# Run TypeORM migrations
npm run migration:run

# Seed database (optional)
npm run seed:run:relational
```

## Step 5: Build and Deploy

### 5.1 Login to Azure and Container Registry

```bash
# Login to Azure
az login

# Login to Container Registry
az acr login --name hulibregistry
```

### 5.2 Build and Push Docker Image

```bash
# Build image using your updated Dockerfile
docker build -t hulibregistry.azurecr.io/hulib-backend:latest .

# Push to registry
docker push hulibregistry.azurecr.io/hulib-backend:latest
```

### 5.3 Update Container App

```bash
# Update container app with new image
az containerapp update \
  --name hulib-backend \
  --resource-group hulib-rg \
  --image hulibregistry.azurecr.io/hulib-backend:latest
```

## Step 6: Configure Environment Variables

In Azure Portal:

1. Go to **Container Apps** → `hulib-backend`
2. Navigate to **Configuration** → **Environment variables**
3. Add all variables from your `.env.production` file
4. Click **Save**

## Step 7: Configure Custom Domain (Optional)

1. In Container App → **Custom domains**
2. Add your domain: `api.hulib.org`
3. Configure DNS CNAME record pointing to your Container App URL
4. Add SSL certificate

## Step 8: Set Up CI/CD with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Log in to Azure Container Registry
      uses: azure/docker-login@v1
      with:
        login-server: hulibregistry.azurecr.io
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - name: Build and push Docker image
      run: |
        docker build -t hulibregistry.azurecr.io/hulib-backend:${{ github.sha }} .
        docker push hulibregistry.azurecr.io/hulib-backend:${{ github.sha }}

    - name: Deploy to Container Apps
      uses: azure/CLI@v1
      with:
        azcliversion: 2.30.0
        inlineScript: |
          az containerapp update \
            --name hulib-backend \
            --resource-group hulib-rg \
            --image hulibregistry.azurecr.io/hulib-backend:${{ github.sha }}
```

## Step 9: Monitoring and Logging

### Enable Application Insights

1. Create Application Insights resource in Azure Portal
2. Add connection string to Container App environment variables:
   ```
   APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
   ```

### View Logs

```bash
# View container logs
az containerapp logs show \
  --name hulib-backend \
  --resource-group hulib-rg \
  --follow
```

## Step 10: Health Check and Verification

1. **Check deployment status**:
   ```bash
   az containerapp show \
     --name hulib-backend \
     --resource-group hulib-rg \
     --query "properties.configuration.ingress.fqdn"
   ```

2. **Test API endpoint**:
   ```
   https://your-container-app-url/api/v1/health
   ```

3. **Verify database connectivity**: Check your application logs for successful database connections

## Important Security Notes

- Store sensitive data in Azure Key Vault
- Use managed identities for Azure resource access
- Enable HTTPS-only traffic
- Configure proper CORS settings
- Set up monitoring and alerting

## Troubleshooting

- **Container won't start**: Check logs with `az containerapp logs show`
- **Database connection issues**: Verify Neon connection string and SSL settings
- **Image pull errors**: Ensure Container Registry credentials are correct
- **Port binding**: Verify application listens on port 3000 (not localhost)

## Cost Optimization

- Use **Consumption plan** for Container Apps (pay per request)
- Set **scale-to-zero** for development environments
- Monitor resource usage with Azure Cost Management
- Use **Reserved Instances** for Redis if running 24/7

Your HuLib backend is now deployed to Azure Container Apps with Neon PostgreSQL! 🚀
