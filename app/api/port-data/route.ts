import { NextResponse } from 'next/server'

// Simulerad data - ersätt med riktig Python API call
const mockPortData = {
  current: {
    container_availability: {
      availability: 85,
      in_use: 892,
      maintenance: 156,
      total: 1247,
      timestamp: new Date().toISOString()
    },
    port_queue: {
      ships_in_queue: 14,
      avg_wait_time: 4.2,
      max_wait_time: 12.5,
      min_wait_time: 1.8,
      timestamp: new Date().toISOString()
    },
    ships_in_port: {
      ships_in_port: 7,
      capacity_used: 78,
      capacity_available: 22,
      timestamp: new Date().toISOString()
    },
    stress_index: 68
  },
  weekly: {
    container_availability: {
      labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      data: [85, 72, 68, 90, 78, 82, 88],
      trend: 'up'
    },
    port_queue: {
      labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      data: [12, 18, 25, 15, 22, 19, 14],
      trend: 'down'
    },
    ships_in_port: {
      labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      data: [8, 12, 15, 11, 14, 9, 7],
      trend: 'up'
    },
    stress_index: {
      labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
      data: [65, 78, 85, 72, 80, 75, 68],
      trend: 'down'
    }
  },
  timestamp: new Date().toISOString()
}

export async function GET() {
  try {
    // Anropa Azure Python API
    const response = await fetch('https://dataanalysisapi-e4cmf6c4anexceee.northeurope-01.azurewebsites.net/api/port-data')
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // Fallback till mock data om Azure API misslyckas
      console.warn('Azure API failed, using mock data')
      return NextResponse.json(mockPortData)
    }
  } catch (error) {
    console.error('Error fetching port data:', error)
    // Fallback till mock data
    return NextResponse.json(mockPortData)
  }
} 