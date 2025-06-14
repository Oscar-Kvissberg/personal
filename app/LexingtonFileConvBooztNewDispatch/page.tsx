'use client'
import React, { useState, DragEvent } from 'react'

const LexingtonFileConverterBooztNewDispatch = () => {
  const [packingFile, setPackingFile] = useState<File | null>(null)
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [quantityFile, setQuantityFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragOver, setDragOver] = useState({ packing: false, order: false, quantity: false })
  const [dispatchSuffix, setDispatchSuffix] = useState('')

  const handleDragOver = (e: DragEvent, type: 'packing' | 'order' | 'quantity') => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (e: DragEvent, type: 'packing' | 'order' | 'quantity') => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: false }))
  }

  const handleDrop = (e: DragEvent, type: 'packing' | 'order' | 'quantity') => {
    e.preventDefault()
    setDragOver(prev => ({ ...prev, [type]: false }))

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'application/vnd.ms-excel' || 
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      if (type === 'packing') {
        setPackingFile(droppedFile)
      } else if (type === 'order') {
        setOrderFile(droppedFile)
      } else {
        setQuantityFile(droppedFile)
      }
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'packing' | 'order' | 'quantity') => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile && (uploadedFile.type === 'application/vnd.ms-excel' || 
        uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      if (type === 'packing') {
        setPackingFile(uploadedFile)
      } else if (type === 'order') {
        setOrderFile(uploadedFile)
      } else {
        setQuantityFile(uploadedFile)
      }
    } else {
      alert('Var god välj en giltig Excel-fil (.xls eller .xlsx)')
    }
  }

  const handleConversion = async () => {
    if (!packingFile || !orderFile || !quantityFile) {
      alert('Var god välj alla tre filer först')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('packingFile', packingFile)
      formData.append('orderFile', orderFile)
      formData.append('quantityFile', quantityFile)
      formData.append('dispatchSuffix', dispatchSuffix)

      const response = await fetch('/api/convert-excel', {
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
        : 'converted.xlsx'

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename  // Använder filnamnet från servern
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

    <>
    {/* Bakgrundsskuggor */}
    <div className="fixed inset-0 z-[-2] overflow-hidden">
      <div className="absolute top-[2%] left-[10%] w-[500px] h-[500px] bg-purple-500/60 rounded-full blur-[128px]" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[800px] bg-purple-500/30 rounded-full blur-[128px]" />
      <div className="absolute top-[40%] right-[25%] w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[128px]" />
    </div>

    <div className="container mx-auto p-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Skapa Batch för att ladda upp till Boozt</h1>
      
      <div className="space-y-4">
        {/* Packing List File Upload */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center
            ${dragOver.packing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => handleDragOver(e, 'packing')}
          onDragLeave={(e) => handleDragLeave(e, 'packing')}
          onDrop={(e) => handleDrop(e, 'packing')}
        >
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => handleFileUpload(e, 'packing')}
            className="hidden"
            id="packing-file-upload"
          />
          <label 
            htmlFor="packing-file-upload"
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja Packing List fil
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {packingFile && (
            <p className="mt-2 text-gray-600">
              Packing List: {packingFile.name}
            </p>
          )}
        </div>

        {/* Order File Upload */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center
            ${dragOver.order ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => handleDragOver(e, 'order')}
          onDragLeave={(e) => handleDragLeave(e, 'order')}
          onDrop={(e) => handleDrop(e, 'order')}
        >
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => handleFileUpload(e, 'order')}
            className="hidden"
            id="order-file-upload"
          />
          <label 
            htmlFor="order-file-upload"
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja Delivery Note
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {orderFile && (
            <p className="mt-2 text-gray-600">
              Order fil: {orderFile.name}
            </p>
          )}
        </div>

        {/* Quantity File Upload */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center
            ${dragOver.quantity ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => handleDragOver(e, 'quantity')}
          onDragLeave={(e) => handleDragLeave(e, 'quantity')}
          onDrop={(e) => handleDrop(e, 'quantity')}
        >
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => handleFileUpload(e, 'quantity')}
            className="hidden"
            id="quantity-file-upload"
          />
          <label 
            htmlFor="quantity-file-upload"
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja Faktura
          </label>
          <p className="mt-2 text-sm text-gray-500">
            eller dra och släpp filen här
          </p>
          {quantityFile && (
            <p className="mt-2 text-gray-600">
              Kvantitetsfil: {quantityFile.name}
            </p>
          )}
        </div>

        {/* Dispatch Suffix Input */}
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Antal restorders (valfritt, inget = initial faktura)
          </label>
          <input
            type="number"
            min="0"
            value={dispatchSuffix}
            onChange={(e) => {
              if (e.target.value === '0') {
                setDispatchSuffix('')
              } else {
                setDispatchSuffix(e.target.value)
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            placeholder="T.ex. 1"
          />
        </div>

        <button
          onClick={handleConversion}
          disabled={!packingFile || !orderFile || !quantityFile || isLoading}
          className={`w-full font-bold py-2 px-4 rounded transition-all duration-300
            ${(!packingFile || !orderFile || !quantityFile || isLoading) 
              ? 'bg-black text-white border-2 border-white/40 opacity-50 cursor-not-allowed' 
              : 'bg-[#03e9f4] text-[#050801] shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_50px_#03e9f4,0_0_200px_#03e9f4] hover:shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_100px_#03e9f4,0_0_300px_#03e9f4] hover:scale-[1.02]'}`}
        >
          {isLoading ? 'Konverterar...' : 'Konvertera filer'}
        </button>

        <h2>
          Obs. Glöm inte att gå in på SESO&apos;n i NAV- klicka post and print invoice.
          Sen gå till Posted Documents och printa fakturan som excel fil. 
          (Denna fukturan ska sedan in här för att få ut dispatchen.)
        </h2>
      </div>
    </div>
    </>
  )
}

export default LexingtonFileConverterBooztNewDispatch