'use client'

import React, { useState } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

const IllumInvoiceSegmentation = () => {
  const [file, setFile] = useState<File | null>(null)
  const [documentNo, setDocumentNo] = useState('')
  const [store, setStore] = useState('')
  const [isDragging, setIsDragging] = useState(false)

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

    console.log('Starting conversion...') // Debug log

    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentNo', documentNo)
    formData.append('store', store)

    try {
      console.log('Sending request...') // Debug log
      const response = await fetch('/api/convertIllumInvoice', {
        method: 'POST',
        body: formData,
      })

      console.log('Response received:', response.status) // Debug log

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText) // Debug log
        throw new Error(`Conversion failed: ${errorText}`)
      }

      const blob = await response.blob()
      console.log('Blob received:', blob.size) // Debug log
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted_invoice.xlsx'
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('Download complete') // Debug log
    } catch (error) {
      console.error('Detailed error:', error) // Mer detaljerad error logging
      alert('Failed to convert file: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8">Illum Invoice Segmentation</h1>
        
        {/* Input fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="documentNo" className="block text-sm font-medium text-gray-300 mb-1">
              Document No.
            </label>
            <input
              type="text"
              id="documentNo"
              value={documentNo}
              onChange={(e) => setDocumentNo(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter document number"
            />
          </div>
          
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-gray-300 mb-1">
              Store
            </label>
            <input
              type="text"
              id="store"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter store name"
            />
          </div>
        </div>

        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
          }`}
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
            className="cursor-pointer flex flex-col items-center"
          >
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mb-3" />
            <span className="text-gray-300">
              {file ? file.name : 'Drop your CSV file here or click to browse'}
            </span>
          </label>
        </div>

        {/* Convert button */}
        <button
          onClick={handleSubmit}
          disabled={!file || !documentNo || !store}
          className={`mt-6 w-full py-2 px-4 rounded-lg font-medium
            ${
              file && documentNo && store
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Convert to Excel
        </button>
      </div>
    </div>
  )
}

export default IllumInvoiceSegmentation