import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderStatus } from '@/lib/database-json';

export async function PUT(request: NextRequest) {
  try {
    const { orderNo, datapickup } = await request.json();
    
    if (!orderNo || !datapickup) {
      return NextResponse.json({ error: 'orderNo and datapickup are required' }, { status: 400 });
    }
    
    // ดึงข้อมูลสถานะปัจจุบัน
    const currentStatus = getOrderStatus(orderNo);
    const pickupStatus = currentStatus?.pickup_status || 'picked_up'; // ถ้ามี datapickup แสดงว่ารับแล้ว
    
    // อัปเดต datapickup ใน database
    updateOrderStatus(orderNo, pickupStatus, datapickup);
    
    console.log('Datapickup update request:', { orderNo, datapickup });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datapickup updated successfully',
      orderNo,
      datapickup 
    });
  } catch (error) {
    console.error('Error updating datapickup:', error);
    return NextResponse.json({ error: 'Failed to update datapickup' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');
    
    if (!orderNo) {
      return NextResponse.json({ error: 'orderNo is required' }, { status: 400 });
    }
    
    const statusData = getOrderStatus(orderNo);
    
    return NextResponse.json({
      orderNo,
      pickupStatus: statusData?.pickup_status || 'pending',
      datapickup: statusData?.datapickup || ''
    });
  } catch (error) {
    console.error('Error getting datapickup:', error);
    return NextResponse.json({ error: 'Failed to get datapickup' }, { status: 500 });
  }
}
