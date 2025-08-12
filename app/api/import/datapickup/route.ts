import { NextResponse } from 'next/server';
import { syncStatusUpdates } from '@/lib/database-json';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const importFile = path.join(process.cwd(), 'data', 'datapickup_import.json');
    
    if (!fs.existsSync(importFile)) {
      return NextResponse.json({ error: 'Import file not found' }, { status: 404 });
    }
    
    const importData = JSON.parse(fs.readFileSync(importFile, 'utf-8'));
    
    // Sync ข้อมูลที่นำเข้า
    const result = syncStatusUpdates(importData);
    
    console.log(`Imported ${result.total} pickup records`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importData.length} pickup records`,
      imported: importData.length,
      ...result
    });
  } catch (error) {
    console.error('Error importing datapickup:', error);
    return NextResponse.json({ error: 'Failed to import datapickup data' }, { status: 500 });
  }
}
