'use client'
import React, { useState, DragEvent } from 'react'

const LexingtonFileConvBooztInvoice = () => {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dispatchSuffix, setDispatchSuffix] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')

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

    if (!invoiceNumber) {
      alert('Var god fyll i fakturanummer')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('invoiceFile', invoiceFile)
      formData.append('dispatchSuffix', dispatchSuffix)
      formData.append('invoiceNumber', invoiceNumber)

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
      <h1 className="text-2xl font-bold mb-6">Konvertera Dispatch till faktura format för uppladdning i Boozt portal</h1>
      
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
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja Dispatch fil
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {invoiceFile && (
            <p className="mt-2 text-gray-600">
              Dispatch fil: {invoiceFile.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[#03e9f4] text-sm">
              Internt nummer för Dispatch Advice Number (hur många restorders...)
            </label>
            <input
              type="number"
              min="0"
              value={dispatchSuffix}
              onChange={(e) => setDispatchSuffix(e.target.value)}
              className="w-full px-3 py-2 bg-black border-2 border-white/40 rounded text-white focus:border-[#03e9f4] focus:outline-none transition-colors"
              placeholder="(Valfritt), 0 & tomt = initial faktura"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#03e9f4] text-sm">
              Fakturanummer
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-black border-2 border-white/40 rounded text-white focus:border-[#03e9f4] focus:outline-none transition-colors"
              placeholder="Ange fakturanummer"
            />
          </div>
        </div>

        <button
          onClick={handleConversion}
          disabled={!invoiceFile || !invoiceNumber || isLoading}
          className={`w-full font-bold py-2 px-4 rounded transition-all duration-300
            ${(!invoiceFile || !invoiceNumber || isLoading) 
              ? 'bg-black text-white border-2 border-white/40 opacity-50 cursor-not-allowed' 
              : 'bg-[#03e9f4] text-[#050801] shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_50px_#03e9f4,0_0_200px_#03e9f4] hover:shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_100px_#03e9f4,0_0_300px_#03e9f4] hover:scale-[1.02]'}`}
        >
          {isLoading ? 'Konverterar...' : 'Konvertera fil'}
        </button>
      </div>
    </div>
  )
}

export default LexingtonFileConvBooztInvoice