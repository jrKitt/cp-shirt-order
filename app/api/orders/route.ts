import { NextRequest, NextResponse } from 'next/server';
// ไม่ใช้ fs เพื่อรองรับ Vercel
// ใช้ in-memory storage สำหรับการอัปเดตสถานะ
const statusUpdates: { [orderNo: string]: string } = {};

interface Order {
  timestamp: string;
  email: string;
  orderNo: string;
  firstname: string;
  lastname: string;
  status: string;
  studentId: string;
  studentMajor: string;
  studentFaculty: string;
  phone: string;
  year: string;
  deliveryType: string;
  address: string;
  packageName: string;
  price: string;
  quantity: string;
  sizes: string;
  items: string;
  note: string;
  slip: string;
  pickupStatus?: 'pending' | 'picked_up' | 'shipping' | 'shipped';
}

function parseCSV(csvText: string): Order[] {
  const lines = csvText.split('\n');
  const data: Order[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    // เปลี่ยนจาก comma เป็น tab สำหรับ TSV
    const values = lines[i].split('\t');
    
    // ลดเงื่อนไขลงเป็น 10 เพื่อรองรับข้อมูลที่ไม่ครบ
    if (values.length >= 10) { 
      data.push({
        timestamp: values[0] || '',
        email: values[1] || '',
        orderNo: values[2] || '',
        firstname: values[3] || '',
        lastname: values[4] || '',
        status: values[5] || '',
        studentId: values[6] || '',
        studentMajor: values[7] || '',
        studentFaculty: values[8] || '',
        phone: values[9] || '',
        year: values[10] || '',
        deliveryType: values[11] || '',
        address: values[12] || '',
        packageName: values[13] || '',
        price: values[14] || '',
        quantity: values[15] || '',
        sizes: values[16] || '{}',
        items: values[17] || '{}',
        note: values[18] || '',
        slip: values[19] || '',
        pickupStatus: (statusUpdates[values[2]] as Order['pickupStatus']) || 'pending' // ใช้ status ที่อัปเดตแล้ว หรือ default เป็น pending
      });
    }
  }
  
  return data;
}

export async function GET(request: NextRequest) {
  try {
    // fetch TSV จาก public
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://orders.smocp.com`
      : 'http://localhost:3000';
    const csvUrl = `${baseUrl}/backendData.tsv`;
    const res = await fetch(csvUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'TSV not found' }, { status: 404 });
    }
    const csvText = await res.text();
    const orders = parseCSV(csvText);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(order => 
        order.firstname.toLowerCase().includes(searchLower) ||
        order.lastname.toLowerCase().includes(searchLower) ||
        order.orderNo.toLowerCase().includes(searchLower) ||
        order.email.toLowerCase().includes(searchLower) ||
        order.studentId.toLowerCase().includes(searchLower)
      );
    }
    return NextResponse.json(filteredOrders);
  } catch (error) {
    console.error('Error reading TSV:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderNo, pickupStatus } = await request.json();
    
    // อัปเดต status ใน memory storage
    statusUpdates[orderNo] = pickupStatus;
    
    console.log('Update request:', { orderNo, pickupStatus });
    console.log('Current status updates:', statusUpdates);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully',
      orderNo,
      pickupStatus 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
