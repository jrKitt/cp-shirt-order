import { NextResponse } from 'next/server';
import { getAllStatusUpdates } from '@/lib/database-json';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const statusFile = path.join(dataDir, 'status_updates.json');
    
    // ตรวจสอบว่าโฟลเดอร์และไฟล์มีอยู่
    const dataDirExists = fs.existsSync(dataDir);
    const statusFileExists = fs.existsSync(statusFile);
    
    let statusCount = 0;
    let lastUpdate = null;
    
    if (statusFileExists) {
      const updates = getAllStatusUpdates();
      statusCount = updates.length;
      
      // หา update ล่าสุด
      if (updates.length > 0) {
        const sorted = updates.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        lastUpdate = sorted[0].updated_at;
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      data: {
        dataDirExists,
        statusFileExists,
        statusCount,
        lastUpdate,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
