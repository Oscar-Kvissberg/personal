import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const invoiceFile = formData.get('invoiceFile') as File
    const dispatchSuffix = formData.get('dispatchSuffix') as string
    const invoiceNumber = formData.get('invoiceNumber') as string
    
    if (!invoiceFile || !dispatchSuffix || !invoiceNumber) {
      return NextResponse.json({ error: 'Alla fält krävs' }, { status: 400 })
    }

    // Läs input-filen
    const bytes = await invoiceFile.arrayBuffer()
    const workbook = XLSX.read(bytes, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Konvertera till JSON för enklare hantering
    const jsonData = XLSX.utils.sheet_to_json(sheet, { 
      raw: false,
      header: ['A', 'B', 'C', 'D', 'E', 'F', 'G']  // Använd bokstäver som headers
    }) as any[]

    // Hämta Boozt order number från E2 (index 1 eftersom vi börjar från 0)
    const booztOrderNumber = jsonData[1]?.['E'] || ''

    // Ta bort header-raden och konvertera data till nytt format
    const data = jsonData.slice(1).map(row => ({
      'Dispatch advice number': `${row['A']}-${dispatchSuffix}`,  // Lägg till suffix
      'Supplier order number': row['A'],
      'Boozt order number': row['E'],
      'EAN code': row['B'],
      'Quantity': row['C']
    }))

    // Skapa ny Excel-fil med ExcelJS
    const newWorkbook = new ExcelJS.Workbook()
    const worksheet = newWorkbook.addWorksheet('Converted Invoice')

    // Definiera kolumner
    worksheet.columns = [
      { header: 'Dispatch advice number', key: 'Dispatch advice number', width: 20 },
      { header: 'Supplier order number', key: 'Supplier order number', width: 20 },
      { header: 'Boozt order number', key: 'Boozt order number', width: 20 },
      { header: 'EAN code', key: 'EAN code', width: 15 },
      { header: 'Quantity', key: 'Quantity', width: 10 }
    ]

    // Styla header-raden - bara vänsterjustering
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'left'
      }
    })

    // Lägg till data
    data.forEach(row => {
      worksheet.addRow(row)
    })

    // Generera Excel-filen
    const buffer = await newWorkbook.xlsx.writeBuffer()

    // Använd det nya filnamnsformatet
    const fileName = `${invoiceNumber}-${booztOrderNumber}`

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

  } catch (error) {
    console.error('Fel vid konvertering:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid konvertering av filen' },
      { status: 500 }
    )
  }
} 