#!/bin/bash

# Installera dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Starta FastAPI appen
echo "Starting FastAPI application..."
python main.py 