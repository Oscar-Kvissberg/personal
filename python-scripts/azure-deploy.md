# Azure Deployment Guide

## Steg för att deploya till Azure Web App

### 1. Förberedelse
Se till att du har Azure CLI installerat:
```bash
# Installera Azure CLI om du inte har det
brew install azure-cli
```

### 2. Logga in på Azure
```bash
az login
```

### 3. Sätt upp deployment
```bash
# Navigera till python-scripts mappen
cd python-scripts

# Skapa en zip-fil för deployment
zip -r ../python-api.zip . -x "venv/*" "*.pyc" "__pycache__/*"

# Deploya till Azure Web App
az webapp deploy --resource-group Ogge --name DataAnalysisAPI --src-path ../python-api.zip
```

### 4. Konfigurera Azure Web App

I Azure Portal:
1. Gå till din Web App: `DataAnalysisAPI`
2. Under "Configuration" → "General settings"
3. Sätt "Startup Command" till: `./startup.sh`
4. Under "Configuration" → "Application settings"
5. Lägg till miljövariabel: `PORT=8000`
6. Under "Configuration" → "Stack settings"
7. Sätt "Stack" till: `Python`
8. Sätt "Major version" till: `3.13`

### 5. Testa API:et
```bash
# Testa health endpoint
curl https://dataanalysisapi-e4cmf6c4anexceee.northeurope-01.azurewebsites.net/health

# Testa port data endpoint
curl https://dataanalysisapi-e4cmf6c4anexceee.northeurope-01.azurewebsites.net/api/port-data
```

### 6. Uppdatera Next.js API
Uppdatera `app/api/port-data/route.ts` med din Azure URL:
```typescript
const response = await fetch('https://dataanalysisapi-e4cmf6c4anexceee.northeurope-01.azurewebsites.net/api/port-data')
```

## Alternativ: GitHub Actions (Automatisk deployment)

Skapa `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Azure
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'DataAnalysisAPI'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./python-scripts
```

## Felsökning

### Vanliga problem:
1. **Port fel**: Säkerställ att Azure Web App är konfigurerad för Python
2. **Dependencies**: Se till att alla packages i requirements.txt installeras
3. **CORS**: Kontrollera att CORS är korrekt konfigurerat
4. **Environment variables**: Lägg till nödvändiga miljövariabler i Azure

### Loggar:
```bash
# Visa loggar från Azure
az webapp log tail --name DataAnalysisAPI --resource-group Ogge
```

### Viktiga inställningar i Azure Portal:
- **Stack**: Python
- **Major version**: 3.13
- **Startup Command**: `./startup.sh`
- **Port**: 8000

### Startup Script
`startup.sh` installerar automatiskt alla dependencies från requirements.txt innan appen startar. 