import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import Papa from 'papaparse'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const documentNo = formData.get('documentNo') as string
        const store = formData.get('store') as string

        // Läs CSV-filen
        const csvText = await file.text()
        const { data } = Papa.parse(csvText, {
            header: false,
            skipEmptyLines: true
        })

        // Skippa de första 10 raderna och börja från rad 11, och ta bort sista raden
        const dataRows = data.slice(11, -1)  // -1 tar bort sista elementet i arrayen
        
        console.log('First data row:', dataRows[0])
        console.log('Number of rows:', dataRows.length)

        // Transformera data
        const transformedData = dataRows.map((row: any, index: number) => {
            // Använd index 1 för kolumn B där Vendor Item Number finns
            const vendorItemNumber = row[1] || ''
            
            // Rensa och konvertera numeriska värden
            const cleanNumber = (value: string) => {
                if (!value) return 0
                
                console.log('Raw value:', value)
                
                // Ta bort alla mellanslag först och normalisera minustecken
                let cleanValue = value.replace(/\s/g, '')
                                    .replace(/−/g, '-')  // Konvertera Unicode minus till standard minus
                console.log('After removing spaces:', cleanValue)
                
                // Spara minustecknet om det finns och ta bort det tillfälligt
                const isNegative = cleanValue.startsWith('-')
                if (isNegative) {
                    cleanValue = cleanValue.substring(1)
                }
                console.log('Is negative:', isNegative)
                console.log('Value without minus:', cleanValue)
                
                let result = 0
                // Om värdet innehåller både punkt och komma
                // (t.ex. "1.900,455" -> 1900.455)
                if (cleanValue.includes('.') && cleanValue.includes(',')) {
                    result = parseFloat(
                        cleanValue
                            .replace(/\./g, '')     // Ta bort alla punkter (tusentalsavgränsare)
                            .replace(',', '.')       // Byt komma mot punkt för decimaler
                    ) || 0
                }
                // Om värdet bara innehåller punkt
                // (t.ex. "1.900" -> 1900)
                else if (cleanValue.includes('.') && !cleanValue.includes(',')) {
                    result = parseFloat(cleanValue.replace(/\./g, '')) || 0
                }
                // Om värdet bara innehåller komma
                // (t.ex. "1,455" -> 1.455)
                else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
                    result = parseFloat(cleanValue.replace(',', '.')) || 0
                }
                // Om värdet är ett rent nummer
                // (t.ex. "880" -> 880)
                else {
                    result = parseFloat(cleanValue) || 0
                }
                
                // Lägg tillbaka minustecknet om det fanns
                const finalResult = isNegative ? -result : result
                console.log('Final result:', finalResult)
                return finalResult
            }

            const quantity = cleanNumber(row[5])  // F kolumnen
            const netSales = cleanNumber(row[8])  // I kolumnen
            
            console.log('Final values:', {
                vendorItemNumber,
                rawQuantity: row[5],
                quantity,
                rawNetSales: row[8],
                netSales
            })

            // Extrahera de första 8 siffrorna som itemNo
            const itemNo = vendorItemNumber.substring(0, 8)
            // Resten efter de 8 siffrorna (och eventuellt efterföljande - eller _) blir variant code
            const variantCode = vendorItemNumber.substring(8).replace(/^[-_]/, '')

            // Beräkna Unit Price baserat på vendor number
            let unitPrice = 0
            if (quantity !== 0) {  // Behåll denna check för att undvika division med noll
                const basePrice = netSales / Math.abs(quantity)  // Använd absolut värde av quantity
                if (vendorItemNumber.startsWith('1')) {
                    unitPrice = basePrice / 2
                } else if (vendorItemNumber.startsWith('2')) {
                    unitPrice = basePrice * 0.446
                }
            }

            return {
                'Document Type': 'Invoice',
                'Document No.': documentNo,
                'Line No.': (index + 1) * 10000,
                'Type': 'Item',
                'No.': itemNo,
                'Variant Code': variantCode,
                'Location Code': store,
                'Quantity': quantity,  // Kan vara negativt för returer
                'Unit Price': Number(unitPrice.toFixed(2)),
                'Drop shipment': 'False'
            }
        })

        // Skapa ny Excel-fil med ExcelJS
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Sheet1')

        // Lägg till specifika värden i första raden
        worksheet.getCell('A1').value = 'ILLUM BOLIGHUS'
        worksheet.getCell('C1').value = '37'

        // Lägg till headers i rad 3
        const headers = Object.keys(transformedData[0])
        worksheet.getRow(3).values = headers

        // Lägg till data från rad 4
        transformedData.forEach((row, index) => {
            const excelRow = worksheet.getRow(index + 4)
            excelRow.values = Object.values(row)
            
            // Sätt nummerformat för Unit Price kolumnen (index 9 eftersom det är den 9:e kolumnen)
            excelRow.getCell(9).numFmt = '#,##0.00'
        })

        // Generera buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // Returnera Excel-filen
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="converted_invoice.xlsx"'
            }
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to convert file' }, { status: 500 })
    }
} 