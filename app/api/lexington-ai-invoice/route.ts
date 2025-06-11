import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';

export const runtime = 'nodejs';

// Azure Form Recognizer configuration
const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

if (!endpoint || !apiKey) {
  throw new Error('Azure Form Recognizer configuration is missing');
}

const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

// Helper function to split text into chunks
function splitIntoChunks(text: string, maxLength: number = 30000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  const lines = text.split('\n');
  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLength) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

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
    
    // Kör Layout/Read-analys (OCR)
    const poller = await client.beginAnalyzeDocument('prebuilt-layout', buffer);
    const result = await poller.pollUntilDone();

    // Extrahera all text rad för rad
    const allLines: string[] = [];
    if (result.pages) {
      for (const page of result.pages) {
        if (page.lines) {
          for (const line of page.lines) {
            allLines.push(line.content);
          }
        }
      }
    }

    // Extrahera tabeller (om några finns)
    const allTables: string[][][] = [];
    if (result.tables) {
      for (const table of result.tables) {
        const rows: string[][] = [];
        for (let r = 0; r < table.rowCount; r++) {
          const row: string[] = [];
          for (let c = 0; c < table.columnCount; c++) {
            const cell = table.cells?.find(cell => cell.rowIndex === r && cell.columnIndex === c);
            row.push(cell ? cell.content : '');
          }
          rows.push(row);
        }
        allTables.push(rows);
      }
    }

    // Skapa Excel
    const wb = XLSX.utils.book_new();
    // Ark 1: All text
    const wsText = XLSX.utils.aoa_to_sheet([
      ['Line'],
      ...allLines.map(line => [line])
    ]);
    wsText['!cols'] = [{ wch: 120 }];
    XLSX.utils.book_append_sheet(wb, wsText, 'All Text');

    // Ark 2: Tabeller (en tabell per ark)
    if (allTables.length > 0) {
      allTables.forEach((table, idx) => {
        const wsTable = XLSX.utils.aoa_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, wsTable, `Table${idx + 1}`);
      });
    }

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="lexington_invoice_ocr.xlsx"',
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