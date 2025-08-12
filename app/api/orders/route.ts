import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderStatus, getAllStatusUpdates, saveOrderToDatabase } from '@/lib/database-json';

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
  total?: string;
  date?: string;
  pickupStatus?: 'pending' | 'picked_up' | 'shipping' | 'shipped';
  datapickup?: string;
}

function parseCSV(csvText: string): Order[] {
  const lines = csvText.split('\n');
  const data: Order[] = [];
  
  // โหลดข้อมูล status จาก database
  const statusUpdates = getAllStatusUpdates();
  const statusMap: { [orderNo: string]: { pickupStatus: string; datapickup: string } } = {};
  statusUpdates.forEach((update) => {
    statusMap[update.order_no] = {
      pickupStatus: update.pickup_status,
      datapickup: update.datapickup || ''
    };
  });
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    // เปลี่ยนจาก comma เป็น tab สำหรับ TSV
    const values = lines[i].split('\t');
    
    // ลดเงื่อนไขลงเป็น 10 เพื่อรองรับข้อมูลที่ไม่ครบ
    if (values.length >= 10) { 
      const orderNo = values[2] || '';
      const statusUpdate = statusMap[orderNo];
      
      data.push({
        timestamp: values[0] || '',
        email: values[1] || '',
        orderNo: orderNo,
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
        total: values[20] || '',
        date: values[21] || '',
        pickupStatus: (statusUpdate?.pickupStatus as Order['pickupStatus']) || 'pending',
        datapickup: (() => {
          // ตรวจสอบและทำความสะอาดข้อมูล datapickup
          const tsvDatepickup = values[22] || '';
          const dbDatepickup = statusUpdate?.datapickup || '';
          
          // ถ้าค่าจาก TSV หรือ DB เป็น "0" หรือค่าผิดพลาด ให้คืนค่าว่าง
          if (tsvDatepickup && tsvDatepickup !== "0" && !isNaN(Date.parse(tsvDatepickup))) {
            return tsvDatepickup;
          } else if (dbDatepickup && dbDatepickup !== "0" && !isNaN(Date.parse(dbDatepickup))) {
            return dbDatepickup;
          }
          
          return ''; // คืนค่าว่างถ้าไม่มีวันที่ที่ถูกต้อง
        })()
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
    const { orderNo, pickupStatus, datapickup } = await request.json();
    
    // ตรวจสอบและทำความสะอาดข้อมูล datapickup
    let cleanDatepickup = '';
    if (datapickup && datapickup !== "0" && !isNaN(Date.parse(datapickup))) {
      cleanDatepickup = datapickup;
    }
    
    // อัปเดต status ใน database
    updateOrderStatus(orderNo, pickupStatus, cleanDatepickup);
    
    console.log('Update request:', { orderNo, pickupStatus, datapickup, cleanDatepickup });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully',
      orderNo,
      pickupStatus,
      datapickup: cleanDatepickup
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
