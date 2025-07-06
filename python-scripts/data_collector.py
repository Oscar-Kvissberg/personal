import requests
import pandas as pd
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class GothenburgPortDataCollector:
    def __init__(self):
        self.base_url = "https://api.portofgothenburg.com"  # Exempel URL
        self.api_key = os.getenv('PORT_API_KEY', 'demo_key')
        
    def get_container_availability(self):
        """Hämtar container tillgänglighet data"""
        try:
            # Simulerad data - ersätt med riktig API call
            data = {
                'availability': 85,
                'in_use': 892,
                'maintenance': 156,
                'total': 1247,
                'timestamp': datetime.now().isoformat()
            }
            return data
        except Exception as e:
            print(f"Error fetching container data: {e}")
            return None
    
    def get_port_queue(self):
        """Hämtar kö-data för hamnen"""
        try:
            # Simulerad data
            data = {
                'ships_in_queue': 14,
                'avg_wait_time': 4.2,
                'max_wait_time': 12.5,
                'min_wait_time': 1.8,
                'timestamp': datetime.now().isoformat()
            }
            return data
        except Exception as e:
            print(f"Error fetching queue data: {e}")
            return None
    
    def get_ships_in_port(self):
        """Hämtar data om skepp i hamnen"""
        try:
            # Simulerad data
            data = {
                'ships_in_port': 7,
                'capacity_used': 78,
                'capacity_available': 22,
                'timestamp': datetime.now().isoformat()
            }
            return data
        except Exception as e:
            print(f"Error fetching ships data: {e}")
            return None
    
    def calculate_stress_index(self, container_data, queue_data, ships_data):
        """Beräknar stress index baserat på olika faktorer"""
        try:
            # Enkel stress index beräkning
            availability_score = (container_data['availability'] / 100) * 30
            queue_score = max(0, (30 - queue_data['ships_in_queue']) / 30) * 30
            capacity_score = (ships_data['capacity_used'] / 100) * 40
            
            stress_index = 100 - (availability_score + queue_score + capacity_score)
            return max(0, min(100, stress_index))
        except Exception as e:
            print(f"Error calculating stress index: {e}")
            return 50
    
    def get_weekly_data(self):
        """Hämtar veckodata för alla mätvärden"""
        try:
            # Simulerad veckodata
            days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
            
            weekly_data = {
                'container_availability': {
                    'labels': days,
                    'data': [85, 72, 68, 90, 78, 82, 88],
                    'trend': 'up'
                },
                'port_queue': {
                    'labels': days,
                    'data': [12, 18, 25, 15, 22, 19, 14],
                    'trend': 'down'
                },
                'ships_in_port': {
                    'labels': days,
                    'data': [8, 12, 15, 11, 14, 9, 7],
                    'trend': 'up'
                },
                'stress_index': {
                    'labels': days,
                    'data': [65, 78, 85, 72, 80, 75, 68],
                    'trend': 'down'
                }
            }
            return weekly_data
        except Exception as e:
            print(f"Error fetching weekly data: {e}")
            return None
    
    def collect_all_data(self):
        """Samlar all data och returnerar komplett dataset"""
        container_data = self.get_container_availability()
        queue_data = self.get_port_queue()
        ships_data = self.get_ships_in_port()
        
        if all([container_data, queue_data, ships_data]):
            stress_index = self.calculate_stress_index(container_data, queue_data, ships_data)
            
            complete_data = {
                'current': {
                    'container_availability': container_data,
                    'port_queue': queue_data,
                    'ships_in_port': ships_data,
                    'stress_index': stress_index
                },
                'weekly': self.get_weekly_data(),
                'timestamp': datetime.now().isoformat()
            }
            
            return complete_data
        else:
            return None

# Exempel användning
if __name__ == "__main__":
    collector = GothenburgPortDataCollector()
    data = collector.collect_all_data()
    
    if data:
        print("Data collected successfully:")
        print(json.dumps(data, indent=2, default=str))
    else:
        print("Failed to collect data") 