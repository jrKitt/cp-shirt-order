import { NextResponse } from 'next/server';
import { syncStatusUpdates } from '@/lib/database-json';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // ลองหาไฟล์จากหลายๆ ที่
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'datapickup_import.json'),
      path.join(process.cwd(), 'data', 'datapickup.csv'),
      path.join(process.cwd(), 'public', 'datapickup.csv'),
      path.join(process.cwd(), 'public', 'datapickup_import.json')
    ];
    
    let importData: Array<{
      order_no: string;
      pickup_status: string;
      datapickup: string;
      updated_at: string;
    }> = [];
    let importFile = '';
    
    // หาไฟล์ที่มีอยู่
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        importFile = filePath;
        break;
      }
    }
    
    if (!importFile) {
      return NextResponse.json({ 
        error: 'Import file not found. Please place datapickup.csv or datapickup_import.json in /public or /data folder' 
      }, { status: 404 });
    }
    
    console.log('Found import file:', importFile);
    
    // อ่านข้อมูลตามประเภทไฟล์
    if (importFile.endsWith('.csv')) {
      // อ่านไฟล์ CSV
      const csvData = fs.readFileSync(importFile, 'utf-8');
      const lines = csvData.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        if (values.length >= 2) {
          const orderNo = values[0]?.trim()?.replace(/"/g, ''); // ลบเครื่องหมาย quotes
          const datapickup = values[1]?.trim()?.replace(/"/g, '');
          
          if (orderNo && orderNo !== 'Order No' && orderNo !== 'order_no') {
            importData.push({
              order_no: orderNo,
              pickup_status: 'picked_up', // สมมติว่าถ้ามี datapickup แล้ว ก็คือรับแล้ว
              datapickup: datapickup || '',
              updated_at: new Date().toISOString()
            });
          }
        }
      }
    } else {
      // อ่านไฟล์ JSON
      importData = JSON.parse(fs.readFileSync(importFile, 'utf-8'));
    }
    
    if (importData.length === 0) {
      return NextResponse.json({ 
        error: 'No valid data found in import file' 
      }, { status: 400 });
    }
    
    // Sync ข้อมูลที่นำเข้า
    const result = syncStatusUpdates(importData);
    
    console.log(`Imported ${importData.length} pickup records from ${importFile}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importData.length} pickup records`,
      imported: importData.length,
      source: importFile,
      ...result
    });
  } catch (error) {
    console.error('Error importing datapickup:', error);
    return NextResponse.json({ 
      error: `Failed to import datapickup data: ${error}` 
    }, { status: 500 });
  }
}
