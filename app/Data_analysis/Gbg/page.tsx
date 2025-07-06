'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  TruckIcon, 
  BuildingOfficeIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

// Mock data för demonstration
const mockData = {
  containerAvailability: {
    labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
    data: [85, 72, 68, 90, 78, 82, 88],
    trend: 'up'
  },
  portQueue: {
    labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
    data: [12, 18, 25, 15, 22, 19, 14],
    trend: 'down'
  },
  shipsInPort: {
    labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
    data: [8, 12, 15, 11, 14, 9, 7],
    trend: 'up'
  },
  stressIndex: {
    labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'],
    data: [65, 78, 85, 72, 80, 75, 68],
    trend: 'down'
  }
}

const GBDataPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [portData, setPortData] = useState(mockData)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/port-data')
        if (response.ok) {
          const data = await response.json()
          // Konvertera API data till rätt format
          setPortData({
            containerAvailability: data.weekly.container_availability,
            portQueue: data.weekly.port_queue,
            shipsInPort: data.weekly.ships_in_port,
            stressIndex: data.weekly.stress_index
          })
        }
      } catch (error) {
        console.error('Error fetching port data:', error)
        // Använd mock data som fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" /> : 
      <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
  }

  const getStressLevel = (value: number) => {
    if (value < 50) return { level: 'Låg', color: 'text-green-400', bgColor: 'bg-green-400/20' }
    if (value < 75) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' }
    return { level: 'Hög', color: 'text-red-400', bgColor: 'bg-red-400/20' }
  }

  const renderChart = (data: any, title: string, unit: string = '') => {
    const maxValue = Math.max(...data.data)
    
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {getTrendIcon(data.trend)}
        </div>
        
        <div className="flex items-end justify-between h-32 mb-4">
          {data.data.map((value: number, index: number) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <span className="text-xs text-gray-300 mt-2">{data.labels[index]}</span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <span className="text-2xl font-bold text-white">
            {data.data[data.data.length - 1]}{unit}
          </span>
          <p className="text-sm text-gray-400">Senaste värde</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Laddar data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Bakgrundsskuggor */}
      <div className="fixed inset-0 z-[-2] overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px]" />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Göteborgs hamn data projekt
            </h1>
            <p className="text-gray-300 text-lg">
              Övervakning av faktorer som påverkar stress index
            </p>
          </div>

          {/* Stress Index Overview */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Stress Index Översikt</h2>
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="text-center">
                   <div className="text-4xl font-bold text-white mb-2">
                     {portData.stressIndex.data[portData.stressIndex.data.length - 1]}
                   </div>
                   <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStressLevel(portData.stressIndex.data[portData.stressIndex.data.length - 1]).bgColor} ${getStressLevel(portData.stressIndex.data[portData.stressIndex.data.length - 1]).color}`}>
                     {getStressLevel(portData.stressIndex.data[portData.stressIndex.data.length - 1]).level} Stress
                   </div>
                 </div>
                 
                 <div className="text-center">
                   <div className="text-2xl font-bold text-white mb-2">
                     {portData.shipsInPort.data[portData.shipsInPort.data.length - 1]}
                   </div>
                   <p className="text-gray-300">Skepp i hamn</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="text-4xl font-bold text-white mb-2">
                     {portData.portQueue.data[portData.portQueue.data.length - 1]}
                   </div>
                   <p className="text-gray-300">Skepp i kö</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Grafer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {renderChart(portData.containerAvailability, 'Container Tillgänglighet', '%')}
            {renderChart(portData.portQueue, 'Kö till Hamnen', ' skepp')}
            {renderChart(portData.shipsInPort, 'Skepp i Hamnen', ' skepp')}
            {renderChart(portData.stressIndex, 'Stress Index', '')}
          </div>

          {/* Detaljerad Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <TruckIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Container Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Tillgängliga</span>
                  <span className="text-white font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">I användning</span>
                  <span className="text-white font-medium">892</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Underhåll</span>
                  <span className="text-white font-medium">156</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Väntetider</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Genomsnitt</span>
                  <span className="text-white font-medium">4.2h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Max</span>
                  <span className="text-white font-medium">12.5h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Min</span>
                  <span className="text-white font-medium">1.8h</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <BuildingOfficeIcon className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Hamn Kapacitet</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Använd</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Ledig</span>
                  <span className="text-white font-medium">22%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Trends</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Container</span>
                  <div className="flex items-center gap-1">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">+12%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Kö</span>
                  <div className="flex items-center gap-1">
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">-8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Stress</span>
                  <div className="flex items-center gap-1">
                    <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">-5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GBDataPage