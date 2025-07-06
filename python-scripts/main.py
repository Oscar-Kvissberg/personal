from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from data_collector import GothenburgPortDataCollector
import uvicorn
import os
from datetime import datetime

app = FastAPI(
    title="Göteborgs Hamn Data API",
    description="API för att hämta data från Göteborgs hamn",
    version="1.0.0"
)

# CORS middleware för att tillåta requests från Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # I produktion, specificera din Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skapa en instans av data collector
collector = GothenburgPortDataCollector()

@app.get("/")
async def root():
    return {
        "message": "Göteborgs Hamn Data API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/port-data")
async def get_port_data():
    """Hämtar all port data"""
    try:
        data = collector.collect_all_data()
        if data:
            return JSONResponse(content=data)
        else:
            raise HTTPException(status_code=500, detail="Failed to collect data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/container-availability")
async def get_container_availability():
    """Hämtar container tillgänglighet data"""
    try:
        data = collector.get_container_availability()
        if data:
            return JSONResponse(content=data)
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch container data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/port-queue")
async def get_port_queue():
    """Hämtar kö-data för hamnen"""
    try:
        data = collector.get_port_queue()
        if data:
            return JSONResponse(content=data)
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch queue data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ships-in-port")
async def get_ships_in_port():
    """Hämtar data om skepp i hamnen"""
    try:
        data = collector.get_ships_in_port()
        if data:
            return JSONResponse(content=data)
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch ships data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weekly-data")
async def get_weekly_data():
    """Hämtar veckodata för alla mätvärden"""
    try:
        data = collector.get_weekly_data()
        if data:
            return JSONResponse(content=data)
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch weekly data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint för Azure"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # För lokal utveckling
    uvicorn.run(app, host="0.0.0.0", port=8000) 