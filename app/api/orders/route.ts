import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    
    const values = lines[i].split(',');
    if (values.length >= 20) {
      data.push({
        timestamp: values[0],
        email: values[1],
        orderNo: values[2],
        firstname: values[3],
        lastname: values[4],
        status: values[5],
        studentId: values[6],
        studentMajor: values[7],
        studentFaculty: values[8],
        phone: values[9],
        year: values[10],
        deliveryType: values[11],
        address: values[12],
        packageName: values[13],
        price: values[14],
        quantity: values[15],
        sizes: values[16],
        items: values[17],
        note: values[18],
        slip: values[19],
        pickupStatus: (values[20] as 'pending' | 'picked_up' | 'shipping' | 'shipped') || 'pending'
      });
    }
  }
  
  return data;
}

function generateCSV(orders: Order[]): string {
  const header = 'แพงมา,email,OrderNo.,firstname,lastname,status,student-id,student-major,student-faculty,phone,year(student),deliveryType,addressForSending,packageName,price,quantity,sizes(for polo and shirt),items,note,slip,pickupStatus';
  
  const rows = orders.map(order => 
    [
      order.timestamp,
      order.email,
      order.orderNo,
      order.firstname,
      order.lastname,
      order.status,
      order.studentId,
      order.studentMajor,
      order.studentFaculty,
      order.phone,
      order.year,
      order.deliveryType,
      order.address,
      order.packageName,
      order.price,
      order.quantity,
      order.sizes,
      order.items,
      order.note,
      order.slip,
      order.pickupStatus || 'pending'
    ].join(',')
  );
  
  return [header, ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'public', 'backendData.csv');
    const csvText = readFileSync(filePath, 'utf-8');
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
    console.error('Error reading CSV:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderNo, pickupStatus } = await request.json();
    
    const filePath = join(process.cwd(), 'public', 'backendData.csv');
    const csvText = readFileSync(filePath, 'utf-8');
    const orders = parseCSV(csvText);
    
    const orderIndex = orders.findIndex(order => order.orderNo === orderNo);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    orders[orderIndex].pickupStatus = pickupStatus;
    
    const updatedCSV = generateCSV(orders);
    writeFileSync(filePath, updatedCSV, 'utf-8');
    
    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    console.error('Error updating CSV:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
