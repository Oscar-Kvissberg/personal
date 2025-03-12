'use client'
import React, { useState } from 'react'

const LexingtonFileConverter = () => {
  const [packingFile, setPackingFile] = useState<File | null>(null)
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePackingFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && uploadedFile.type === 'application/vnd.ms-excel' || 
        uploadedFile?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setPackingFile(uploadedFile)
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleOrderFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && uploadedFile.type === 'application/vnd.ms-excel' || 
        uploadedFile?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setOrderFile(uploadedFile)
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleConversion = async () => {
    if (!packingFile || !orderFile) {
      alert('Var god välj båda filerna först')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('packingFile', packingFile)
      formData.append('orderFile', orderFile)

      const response = await fetch('/api/convert-excel', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Konvertering misslyckades')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Ett fel uppstod:', error)
      alert('Ett fel uppstod vid konvertering av filen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Lexington Filkonverterare</h1>
      
      <div className="space-y-4">
        {/* Packing List File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handlePackingFileUpload}
            className="hidden"
            id="packing-file-upload"
          />
          <label 
            htmlFor="packing-file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            Klicka för att välja Packing List fil
          </label>
          {packingFile && (
            <p className="mt-2 text-gray-600">
              Packing List: {packingFile.name}
            </p>
          )}
        </div>

        {/* Order File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleOrderFileUpload}
            className="hidden"
            id="order-file-upload"
          />
          <label 
            htmlFor="order-file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            Klicka för att välja Order fil
          </label>
          {orderFile && (
            <p className="mt-2 text-gray-600">
              Order fil: {orderFile.name}
            </p>
          )}
        </div>

        <button
          onClick={handleConversion}
          disabled={!packingFile || !orderFile || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Konverterar...' : 'Konvertera filer'}
        </button>
      </div>
    </div>
  )
}

export default LexingtonFileConverter