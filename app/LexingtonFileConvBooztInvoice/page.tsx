'use client'
import React, { useState, DragEvent } from 'react'

const LexingtonFileConvBooztInvoice = () => {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'application/vnd.ms-excel' || 
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setInvoiceFile(droppedFile)
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && (uploadedFile.type === 'application/vnd.ms-excel' || 
        uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setInvoiceFile(uploadedFile)
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleConversion = async () => {
    if (!invoiceFile) {
      alert('Var god välj en fil först')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('invoiceFile', invoiceFile)

      const response = await fetch('/api/convert-invoice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Konvertering misslyckades')
      }

      // Hämta filnamnet från Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'converted-invoice.xlsx'

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
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
    <div className="container mx-auto p-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Konvertera Faktura till Boozt Format</h1>
      
      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="invoice-file-upload"
          />
          <label 
            htmlFor="invoice-file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            Klicka för att välja Fakturafil
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {invoiceFile && (
            <p className="mt-2 text-gray-600">
              Fakturafil: {invoiceFile.name}
            </p>
          )}
        </div>

        <button
          onClick={handleConversion}
          disabled={!invoiceFile || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Konverterar...' : 'Konvertera fil'}
        </button>
      </div>
    </div>
  )
}

export default LexingtonFileConvBooztInvoice