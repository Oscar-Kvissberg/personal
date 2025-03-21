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
    const quantityFile = formData.get('quantityFile') as File
    const dispatchSuffix = formData.get('dispatchSuffix') as string
    
    if (!packingFile || !orderFile || !quantityFile) {
      return NextResponse.json({ error: 'Alla tre filer krävs' }, { status: 400 })
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

    // Modifiera dispatchAdviceNumber om det finns ett suffix
    if (dispatchSuffix && dispatchSuffix.trim() !== '' && dispatchSuffix !== '0') {
      dispatchAdviceNumber = `${dispatchAdviceNumber}-${dispatchSuffix}`
    }

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

    // Läs kvantitetsfilen för att få rätt kvantiteter
    const quantityBytes = await quantityFile.arrayBuffer()
    const quantityWorkbook = XLSX.read(quantityBytes, { type: 'array' })
    const quantitySheet = quantityWorkbook.Sheets[quantityWorkbook.SheetNames[0]]

    // Skapa en map för att lagra EAN -> kvantitet
    const quantityMap = new Map<string, string>()

    // Läs igenom kvantitetsfilen
    const quantityRange = XLSX.utils.decode_range(quantitySheet['!ref'] || 'A1')
    
    console.log('Reading quantity file...')
    console.log('Sheet range:', quantityRange)
    console.log('Merged cells:', quantitySheet['!merges'])

    // Gå igenom varje rad
    for (let row = quantityRange.s.r; row <= quantityRange.e.r; row++) {
      // Försök hitta EAN i de mergade kolumnerna (T-AC)
      let ean = ''
      
      // Kolla först kolumn T (index 19)
      const cellT = quantitySheet[XLSX.utils.encode_cell({ r: row, c: 19 })]
      if (cellT?.v) {
        const value = cellT.v.toString().trim()
        if (value.match(/^\d{13}$/)) {
          ean = value
          console.log(`Found EAN in column T: ${ean} at row ${row + 1}`)
        }
      }

      if (ean) {
        // Om vi hittade ett EAN, läs kvantiteten från AD (index 29)
        const quantityCell = quantitySheet[XLSX.utils.encode_cell({ r: row, c: 29 })]
        if (quantityCell?.v) {
          const quantity = quantityCell.v.toString().trim()
          console.log(`Found quantity for EAN ${ean}: ${quantity} at row ${row + 1}`)
          quantityMap.set(ean, quantity)
        } else {
          console.log(`No quantity found for EAN ${ean} at row ${row + 1}`)
        }
      }
    }

    console.log('Final Quantity mappings:', Object.fromEntries(quantityMap))

    // Uppdatera convertedData för att använda kvantiteter från den nya filen
    const convertedData = jsonData
      .filter(row => {
        const ean = (row['AJ'] || row['AK'] || row['AL'] || row['AM'] || row['AN'] || row['AO'] || row['AP'])?.toString().trim()
        return ean && ean.match(/^\d{13}$/)
      })
      .map((row) => {
        const ean = (row['AJ'] || row['AK'] || row['AL'] || row['AM'] || row['AN'] || row['AO'] || row['AP']).toString().trim()
        const boxNo = boxMappings.get(ean)
        const quantity = quantityMap.get(ean)
        
        console.log(`Processing EAN: ${ean}, Found quantity: ${quantity}, Box: ${boxNo}`)
        
        return {
          'Dispatch Advice form': dispatchAdviceNumber,
          'EAN Code': ean,
          'Quantity dispatched': quantity || '0',
          'Purchase order number': dispatchAdviceNumber.split('-')[0],
          'Boozt Purchase number': booztPurchaseNumber,
          'Dispatch Date': formatDate(today),
          'Scheduled Arrival Date': formatDate(nextWorkDay),
          'Box No.': boxNo || ''
        }
      })

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
      cell.alignment = {
        horizontal: 'left'
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
        'Content-Disposition': `attachment; filename="${booztPurchaseNumber}.xlsx"`,
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