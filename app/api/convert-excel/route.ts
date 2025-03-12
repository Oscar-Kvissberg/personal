import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'

function getNextWorkingDay(date: Date): Date {
  const nextDay = new Date(date)
  nextDay.setDate(date.getDate() + 1)
  
  // Om det är lördag, lägg till 2 dagar
  if (nextDay.getDay() === 6) nextDay.setDate(nextDay.getDate() + 2)
  // Om det är söndag, lägg till 1 dag
  else if (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1)
  
  return nextDay
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function extractOrderNumber(text: string, prefix: string): string {
  const match = text?.match(new RegExp(`${prefix}:\\s*(\\w+)`))
  return match ? match[1] : ''
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const packingFile = formData.get('packingFile') as File
    const orderFile = formData.get('orderFile') as File
    
    if (!packingFile || !orderFile) {
      return NextResponse.json({ error: 'Båda filerna krävs' }, { status: 400 })
    }

    // Läs orderfilen först för att få order numbers
    const orderBytes = await orderFile.arrayBuffer()
    const orderWorkbook = XLSX.read(orderBytes, { type: 'array' })
    const orderSheet = orderWorkbook.Sheets[orderWorkbook.SheetNames[0]]

    // Läs rad 21 och 23 för att få order numbers
    let dispatchAdviceNumber = ''
    let booztPurchaseNumber = ''

    // Läs hela rad 21 och 23 som raw data
    const row21Data = XLSX.utils.sheet_to_json(orderSheet, { 
      header: 1,
      range: 20, // 21-1 eftersom det är 0-baserat
      raw: true 
    })[0] as any[]  // Explicit typning som array
    
    const row23Data = XLSX.utils.sheet_to_json(orderSheet, { 
      header: 1,
      range: 22, // 23-1 eftersom det är 0-baserat
      raw: true 
    })[0] as any[]  // Explicit typning som array

    console.log('Row 21:', row21Data)
    console.log('Row 23:', row23Data)

    // Sök igenom raderna efter de specifika texterna
    if (Array.isArray(row21Data)) {  // Kontrollera att det är en array
      const orderNoText = row21Data.find((cell: any) => 
        cell && typeof cell === 'string' && cell.includes('Customer order no:')
      )
      if (orderNoText) {
        dispatchAdviceNumber = extractOrderNumber(orderNoText, 'Customer order no')
      }
    }

    if (Array.isArray(row23Data)) {  // Kontrollera att det är en array
      const orderRefText = row23Data.find((cell: any) => 
        cell && typeof cell === 'string' && cell.includes('Customer order ref:')
      )
      if (orderRefText) {
        booztPurchaseNumber = extractOrderNumber(orderRefText, 'Customer order ref')
      }
    }

    console.log('Found numbers:', {
      dispatchAdviceNumber,
      booztPurchaseNumber,
      row21: row21Data,
      row23: row23Data
    })

    // Läs packinglist-filen
    const packingBytes = await packingFile.arrayBuffer()
    const packingWorkbook = XLSX.read(packingBytes, { type: 'array' })
    const packingSheet = packingWorkbook.Sheets[packingWorkbook.SheetNames[0]]

    // Läs data från rad 18 och framåt
    const range = XLSX.utils.decode_range(packingSheet['!ref'] || 'A1')
    range.s.r = 17  // Börja från rad 18 (0-baserat index)
    packingSheet['!ref'] = XLSX.utils.encode_range(range)

    const jsonData = XLSX.utils.sheet_to_json(packingSheet, { 
      raw: false,
      header: 'A'
    }) as any[]

    const today = new Date()
    const nextWorkDay = getNextWorkingDay(today)

    // Läs hela packing list för att hitta box numbers och deras artiklar
    console.log('Starting box number search...')
    console.log('Range:', range)
    
    let currentBoxNo = ''
    const boxMappings = new Map<string, string>()

    // Läs igenom alla rader från början av filen
    for (let row = 1; row <= range.e.r; row++) {
      const rowNum = row + 1
      
      // Kolla efter box number (artikelnummer i kolumn J)
      const boxCell = packingSheet[`J${rowNum}`]
      if (boxCell?.v && boxCell.v.toString().match(/^\d{8}$/)) {  // 8-siffrigt nummer
        currentBoxNo = boxCell.v.toString()
        console.log(`Found new box number ${currentBoxNo} at row ${rowNum}`)
        continue  // Hoppa till nästa rad
      }

      // Om raden har en EAN, mappa den till aktuellt box number
      for (const col of ['AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP']) {
        const cellRef = `${col}${rowNum}`
        const cell = packingSheet[cellRef]
        
        if (cell?.v) {
          const ean = cell.v.toString().trim()
          if (ean && ean.match(/^\d{13}$/)) {  // 13-siffrigt EAN nummer
            boxMappings.set(ean, currentBoxNo)
            console.log(`Mapped EAN ${ean} to box number ${currentBoxNo}`)
            break
          }
        }
      }
    }

    console.log('Final box mappings:', Object.fromEntries(boxMappings))

    // Uppdatera convertedData för att inkludera box number
    const convertedData = jsonData
      .filter(row => row['AJ'] || row['AK'] || row['AL'] || row['AM'] || row['AN'] || row['AO'] || row['AP'])
      .map((row) => {
        const ean = (row['AJ'] || row['AK'] || row['AL'] || row['AM'] || row['AN'] || row['AO'] || row['AP']).toString().trim()
        const quantity = row['AQ'] || row['AR'] || row['AS']

        if (ean && quantity) {
          const boxNo = boxMappings.get(ean)
          console.log(`Processing EAN: ${ean}, Box No: ${boxNo}`)
          
          return {
            'Dispatch Advice form': dispatchAdviceNumber,
            'EAN Code': ean,
            'Quantity dispatched': quantity.toString().trim(),
            'Purchase order number': dispatchAdviceNumber,
            'Boozt Purchase number': booztPurchaseNumber,
            'Dispatch Date': formatDate(today),
            'Scheduled Arrival Date': formatDate(nextWorkDay),
            'Box No.': boxNo || ''
          }
        }
        return null
      })
      .filter(row => row !== null)

    console.log('Converted data:', convertedData)

    // Skapa en ny workbook med ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Converted Data')

    // Definiera kolumner och lägg till headers i ny ordning
    const headers = [
      'Dispatch Advice form',
      'EAN Code',
      'Quantity dispatched',
      'Purchase order number',
      'Boozt Purchase number',
      'Dispatch Date',
      'Scheduled Arrival Date',
      'Box No.'  // Flyttad till slutet
    ]
    
    worksheet.columns = headers.map((header, i) => ({
      header,
      key: header,
      width: i === headers.length - 1 ? 12 : // Box No.
             i < 2 || (i >= 3 && i <= 4) ? 20 : 15
    }))

    // Styla header-raden
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
      }
      cell.font = {
        bold: true
      }
      cell.alignment = {
        horizontal: 'center'
      }
    })

    // Lägg till data rad för rad i ny ordning
    convertedData.forEach((row: any) => {
      worksheet.addRow({
        'Dispatch Advice form': row['Dispatch Advice form'],
        'EAN Code': row['EAN Code'],
        'Quantity dispatched': row['Quantity dispatched'],
        'Purchase order number': row['Purchase order number'],
        'Boozt Purchase number': row['Boozt Purchase number'],
        'Dispatch Date': row['Dispatch Date'],
        'Scheduled Arrival Date': row['Scheduled Arrival Date'],
        'Box No.': row['Box No.']  // Flyttad till slutet
      })
    })

    // Generera buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="converted_${formatDate(new Date())}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

  } catch (error) {
    console.error('Fel vid filkonvertering:', error)
    return NextResponse.json(
      { error: 'Ett fel uppstod vid konvertering av filen' },
      { status: 500 }
    )
  }
} 