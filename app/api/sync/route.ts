import { NextRequest, NextResponse } from 'next/server';
import { getAllStatusUpdates, syncStatusUpdates } from '@/lib/database-json';

export async function GET() {
  try {
    const updates = getAllStatusUpdates();
    return NextResponse.json({
      success: true,
      data: updates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting sync data:', error);
    return NextResponse.json({ error: 'Failed to get sync data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { updates } = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be an array' }, { status: 400 });
    }
    
    const result = syncStatusUpdates(updates);
    
    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      ...result
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
  }
}
