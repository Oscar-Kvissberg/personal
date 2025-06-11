import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil hittades' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Filen måste vara en PDF' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    // Extract relevant data
    const lines = text.split('\n').filter(line => line.trim());
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Extract data from PDF text
    const data = [];
    let currentInvoice = {
      fakturanummer: '',
      datum: '',
      belopp: '',
      beskrivning: ''
    };

    // Basic parsing logic - adjust based on your PDF structure
    for (const line of lines) {
      if (line.includes('Fakturanummer:')) {
        currentInvoice.fakturanummer = line.split('Fakturanummer:')[1].trim();
      } else if (line.includes('Datum:')) {
        currentInvoice.datum = line.split('Datum:')[1].trim();
      } else if (line.includes('Belopp:')) {
        currentInvoice.belopp = line.split('Belopp:')[1].trim();
      } else if (line.includes('Beskrivning:')) {
        currentInvoice.beskrivning = line.split('Beskrivning:')[1].trim();
        data.push([...Object.values(currentInvoice)]);
        currentInvoice = {
          fakturanummer: '',
          datum: '',
          belopp: '',
          beskrivning: ''
        };
      }
    }

    const ws = XLSX.utils.aoa_to_sheet([
      ['Fakturanummer', 'Datum', 'Belopp', 'Beskrivning'],
      ...data
    ]);

    XLSX.utils.book_append_sheet(wb, ws, 'Faktura');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="konverterad_faktura.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error converting PDF:', error);
    return NextResponse.json(
      { error: 'Kunde inte konvertera PDF-filen' },
      { status: 500 }
    );
  }
} 