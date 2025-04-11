'use client'

import React, { useState } from 'react'


const IllumInvoiceSegmentation = () => {
  const [file, setFile] = useState<File | null>(null)
  const [documentNo, setDocumentNo] = useState('')
  const [store, setStore] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file || !documentNo || !store) {
      alert('Please fill in all fields and select a file')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentNo', documentNo)
    formData.append('store', store)

    try {
      const response = await fetch('/api/convertIllumInvoice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Conversion failed: ${errorText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted_invoice.xlsx'
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Detailed error:', error)
      alert('Failed to convert file: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Konvertera Illum Invoice till NAV format</h1>
      
      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label 
            htmlFor="fileInput"
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja CSV fil
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {file && (
            <p className="mt-2 text-gray-600">
              Vald fil: {file.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[#03e9f4] text-sm">
              Document No.
            </label>
            <input
              type="text"
              value={documentNo}
              onChange={(e) => setDocumentNo(e.target.value)}
              className="w-full px-3 py-2 bg-black border-2 border-white/40 rounded text-white focus:border-[#03e9f4] focus:outline-none transition-colors"
              placeholder="Enter document number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#03e9f4] text-sm">
              Location Code
            </label>
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full px-3 py-2 bg-black border-2 border-white/40 rounded text-white focus:border-[#03e9f4] focus:outline-none transition-colors"
              placeholder="E.g. CON-ILLSTV"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || !documentNo || !store || isLoading}
          className={`w-full font-bold py-2 px-4 rounded transition-all duration-300
            ${(!file || !documentNo || !store || isLoading) 
              ? 'bg-black text-white border-2 border-white/40 opacity-50 cursor-not-allowed' 
              : 'bg-[#03e9f4] text-[#050801] shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_50px_#03e9f4,0_0_200px_#03e9f4] hover:shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_100px_#03e9f4,0_0_300px_#03e9f4] hover:scale-[1.02]'}`}
        >
          {isLoading ? 'Konverterar...' : 'Konvertera fil'}
        </button>
      </div>
    </div>
  )
}

export default IllumInvoiceSegmentation