import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug') === '1';

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
    
    // Split into lines and clean up
    const lines = pdfData.text.split('\n').map(line => line.trim()).filter(Boolean);

    // Extract product data from lines with PCS, handling numbers on next line if needed
    const items: { itemCode: string, quantity: string, unitPrice: string, amount: string, size: string }[] = [];
    const debugRest: string[] = [];
    
    // Find the first PCS line to start looking for items
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('PCS')) {
        break;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pcsIndex = line.indexOf('PCS');
      if (pcsIndex !== -1) {
        let itemCode = '';
        // Look at the next few lines after the PCS line for the item code
        for (let offset = 1; offset <= 5; offset++) {
          if (i + offset < lines.length) {
            const nextLine = lines[i + offset];
            if (nextLine) {
              const commaIndex = nextLine.indexOf(',');
              if (commaIndex !== -1) {
                const afterComma = nextLine.slice(commaIndex + 1).trim();
                const itemCodeMatch = afterComma.match(/^(\d{8}-\d{4}-[A-Z0-9]+)/);
                if (itemCodeMatch) {
                  itemCode = itemCodeMatch[1];
                  break;
                }
              }
            }
          }
        }
        
        let rest = line.slice(pcsIndex + 3);
        // Om rest är tom eller saknar siffror, ta nästa rad
        if (!rest || !/\d/.test(rest)) {
          rest = lines[i + 1] || '';
          i++; // hoppa över nästa rad
        }
        debugRest.push(rest); // logga rest för debug
        
        let unitPrice = '', quantity = '', amount = '', size = '';
        // Now find the unit price (it's the first number with comma and exactly 3 decimal places)
        const priceMatch = rest.match(/^(\d+[.,]\d{3})/);
        if (priceMatch) {
          unitPrice = priceMatch[1];
          rest = rest.slice(priceMatch[1].length);
        }
        // After extracting unit price, find the size at the end (format: XXxXX, first number starts with non-zero)
        const sizeMatch = rest.match(/([1-9]\d{1,2}x\d{2,3})$/);
        if (sizeMatch) {
          size = sizeMatch[1];
          // Remove the size from the end of the string
          rest = rest.slice(0, rest.length - size.length).trim();
        }

        // Now try different splits of the remaining string to find where amount/quantity = unitPrice
        const unitPriceNum = parseFloat(unitPrice.replace(',', '.'));
        let foundValidSplit = false;
        
        // Try different splits from the end
        for (let i = rest.length - 1; i > 0; i--) {
          const potentialAmount = rest.slice(i);
          const potentialQuantity = rest.slice(0, i);
          
          // Try if potentialAmount has a decimal point
          if (potentialAmount.includes(',') || potentialAmount.includes('.')) {
            const quantityNum = parseInt(potentialQuantity, 10);
            const amountNum = parseFloat(potentialAmount.replace(',', '.'));
            
            if (!isNaN(quantityNum) && !isNaN(amountNum) && quantityNum > 0) {
              const calculatedUnitPrice = amountNum / quantityNum;
              // Use a relative tolerance based on the unit price
              const tolerance = unitPriceNum < 5 ? 0.05 : 0.001; // 5% for small prices, 0.1% for larger prices
              if (Math.abs(calculatedUnitPrice - unitPriceNum) < tolerance) {
                // Format amount to always have 2 decimal places
                amount = amountNum.toFixed(2).replace('.', ',');
                quantity = potentialQuantity;
                foundValidSplit = true;
                break;
              }
            }
          }
        }
        
        const valid = foundValidSplit;
        if (itemCode && unitPrice && quantity && amount && size && valid) {
          items.push({ itemCode, quantity, unitPrice, amount, size });
        }
      }
    }

    if (debug) {
      // För debug: kör även parsern på debugRest separat och visa resultatet
      const debugItems: { itemCode: string, unitPrice: string, quantity: string, amount: string, size: string, valid: boolean }[] = [];
      // Find the first PCS line to start looking for items
      let firstPcsIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('PCS')) {
          firstPcsIndex = i;
          break;
        }
      }
      console.log('First PCS line index:', firstPcsIndex); // Debug log

      for (let j = 0; j < debugRest.length; j++) {
        let rest = debugRest[j];
        let unitPrice = '', quantity = '', amount = '', size = '', itemCode = '';
        
        // Find the PCS line for this item
        let currentPcsIndex = -1;
        for (let i = firstPcsIndex + (j * 3); i < lines.length; i++) {
          if (lines[i].includes('PCS')) {
            currentPcsIndex = i;
            break;
          }
        }
        console.log('Current PCS line index:', currentPcsIndex); // Debug log
        
        // Look at the next few lines after the PCS line for the item code
        if (currentPcsIndex !== -1) {
          // Look at up to 5 lines after the PCS line
          for (let offset = 1; offset <= 5; offset++) {
            if (currentPcsIndex + offset < lines.length) {
              const line = lines[currentPcsIndex + offset];
              console.log('Looking at line:', line, 'offset:', offset); // Debug log
              if (line) {
                const commaIndex = line.indexOf(',');
                if (commaIndex !== -1) {
                  const afterComma = line.slice(commaIndex + 1).trim();
                  const itemCodeMatch = afterComma.match(/^(\d{8}-\d{4}-[A-Z0-9]+)/);
                  if (itemCodeMatch) {
                    itemCode = itemCodeMatch[1];
                    console.log('Found item code:', itemCode, 'at offset:', offset); // Debug log
                    break;
                  }
                }
              }
            }
          }
        }
        
        // First get the unit price
        const priceMatch = rest.match(/^(\d+[.,]\d{3})/);
        if (priceMatch) {
          unitPrice = priceMatch[1];
          rest = rest.slice(priceMatch[1].length);
        }
        
        // Find the size at the end (format: XXxXX, first number starts with non-zero)
        const sizeMatch = rest.match(/([1-9]\d{1,2}x\d{2,3})$/);
        if (sizeMatch) {
          size = sizeMatch[1];
          // Remove the size from the end of the string
          rest = rest.slice(0, rest.length - size.length).trim();
        }
        
        // Now try different splits of the remaining string to find where amount/quantity = unitPrice
        const unitPriceNum = parseFloat(unitPrice.replace(',', '.'));
        let foundValidSplit = false;
        
        // Try different splits from the end
        for (let i = rest.length - 1; i > 0; i--) {
          const potentialAmount = rest.slice(i);
          const potentialQuantity = rest.slice(0, i);
          
          // Try if potentialAmount has a decimal point
          if (potentialAmount.includes(',') || potentialAmount.includes('.')) {
            const quantityNum = parseInt(potentialQuantity, 10);
            const amountNum = parseFloat(potentialAmount.replace(',', '.'));
            
            if (!isNaN(quantityNum) && !isNaN(amountNum) && quantityNum > 0) {
              const calculatedUnitPrice = amountNum / quantityNum;
              // Use a relative tolerance based on the unit price
              const tolerance = unitPriceNum < 5 ? 0.05 : 0.001; // 5% for small prices, 0.1% for larger prices
              if (Math.abs(calculatedUnitPrice - unitPriceNum) < tolerance) {
                // Format amount to always have 2 decimal places
                amount = amountNum.toFixed(2).replace('.', ',');
                quantity = potentialQuantity;
                foundValidSplit = true;
                break;
              }
            }
          }
        }
        
        const valid = foundValidSplit;
        debugItems.push({ itemCode, unitPrice, quantity, amount, size, valid });
      }
      return NextResponse.json({ lines, debugRest, items, debugItems });
    }

    // Build Excel
    const ws = XLSX.utils.aoa_to_sheet([
      ['ItemCode', 'Quantity', 'UnitPrice', 'Amount', 'Size'],
      ...items.map(item => [item.itemCode, item.quantity, item.unitPrice, item.amount, item.size])
    ]);
    ws['!cols'] = [
      { wch: 20 }, // ItemCode
      { wch: 10 }, // Quantity
      { wch: 15 }, // UnitPrice
      { wch: 15 }, // Amount
      { wch: 10 }  // Size
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faktura');
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