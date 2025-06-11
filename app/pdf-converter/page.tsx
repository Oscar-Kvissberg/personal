'use client';

import React, { useState, DragEvent } from 'react';
import { toast } from 'sonner';

export default function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Var god välj en giltig PDF-fil');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      toast.error('Var god välj en giltig PDF-fil');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Välj en PDF-fil först');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);


    //?debug=1 for debug mode
    try {
      const response = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Kunde inte konvertera filen');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        alert(JSON.stringify(json, null, 2));
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'konverterad_faktura.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Filen har konverterats framgångsrikt!');
    } catch (error) {
      toast.error('Ett fel uppstod vid konverteringen');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">PDF till Excel Konverterare</h1>
      
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
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-file-upload"
          />
          <label 
            htmlFor="pdf-file-upload"
            className="cursor-pointer text-[#03e9f4] transition-all duration-300 hover:scale-110 inline-block"
          >
            Klicka för att välja PDF-fil
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

        <button
          onClick={handleConvert}
          disabled={!file || isLoading}
          className={`w-full font-bold py-2 px-4 rounded transition-all duration-300
            ${(!file || isLoading) 
              ? 'bg-black text-white border-2 border-white/40 opacity-50 cursor-not-allowed' 
              : 'bg-[#03e9f4] text-[#050801] shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_50px_#03e9f4,0_0_200px_#03e9f4] hover:shadow-[0_0_5px_#03e9f4,0_0_25px_#03e9f4,0_0_100px_#03e9f4,0_0_300px_#03e9f4] hover:scale-[1.02]'}`}
        >
          {isLoading ? 'Konverterar...' : 'Konvertera till Excel'}
        </button>
      </div>
    </div>
  );
} 