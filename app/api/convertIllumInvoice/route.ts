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
                // Ta bort mellanslag och konvertera punkt-tusentalsavgränsare
                // '2.400' blir '2400'
                return parseFloat(value.replace(/\s/g, '').replace('.', '')) || 0
            }

            const quantity = cleanNumber(row[5])  // F kolumnen
            const netSales = cleanNumber(row[8])  // I kolumnen
            
            console.log('Processing row:', {
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
            if (quantity !== 0) {
                const basePrice = netSales / quantity
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
                'Quantity': quantity,
                'Unit Price': Math.round(unitPrice), // Avrundar till heltal
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
            worksheet.getRow(index + 4).values = Object.values(row)
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