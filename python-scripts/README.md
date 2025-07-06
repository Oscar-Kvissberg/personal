# Göteborgs Hamn Data Collector

Detta är Python-scriptet för att hämta data från Göteborgs hamn.

## Installation

```bash
cd python-scripts
pip install -r requirements.txt
```

## Användning

### Lokal utveckling
```bash
python data_collector.py
```

### Som API server
```bash
uvicorn main:app --reload --port 8000
```

## Miljövariabler

Skapa en `.env` fil i `python-scripts/` mappen:

```env
PORT_API_KEY=din_api_nyckel_här
```

## Struktur

- `data_collector.py` - Huvudscript för data collection
- `requirements.txt` - Python dependencies
- `main.py` - FastAPI server (kommer snart)

## Integration med Next.js

Scriptet kan användas på två sätt:

1. **Lokal utveckling**: Kör Python script separat och använd mock data i Next.js
2. **Produktion**: Deploya Python som separat API och anropa från Next.js

## Vercel Deployment

För Vercel deployment, rekommenderas att Python backend körs separat (t.ex. på Railway, Heroku, eller AWS). 