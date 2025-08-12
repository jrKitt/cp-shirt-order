import fs from 'fs';
import path from 'path';

// ใช้ /tmp สำหรับ Vercel deployment หรือ local data directory
const DATA_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');
const STATUS_FILE = path.join(DATA_DIR, 'status_updates.json');

// ตัวแปรสำหรับเก็บข้อมูลในหน่วยความจำ (fallback สำหรับ Vercel)
let inMemoryData: StatusUpdate[] = [];
let useFileSystem = true;

export interface StatusUpdate {
  id: string;
  order_no: string;
  pickup_status: string;
  datapickup: string;
  updated_at: string;
}

// สร้างโฟลเดอร์ data ถ้ายังไม่มี
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    useFileSystem = true;
  } catch (error) {
    console.error('Failed to create data directory:', error);
    // ถ้าไม่สามารถสร้าง directory ได้ ให้ fallback เป็นในหน่วยความจำ
    if (process.env.VERCEL) {
      console.log('Running on Vercel - using in-memory fallback');
    }
    useFileSystem = false;
  }
}

// อ่านข้อมูลสถานะทั้งหมด
function readStatusUpdates(): StatusUpdate[] {
  // พยายามใช้ file system ก่อน
  try {
    ensureDataDir();
    
    if (!useFileSystem) {
      console.log('Using in-memory data storage');
      // ถ้าใช้ครั้งแรกและไม่มีข้อมูล ให้โหลดข้อมูลเริ่มต้น
      if (inMemoryData.length === 0) {
        try {
          // ลองโหลดจาก initial-data.json ก่อน
          const initialDataPath = process.env.VERCEL 
            ? '/var/task/public/initial-data.json'
            : './public/initial-data.json';
          
          if (fs.existsSync(initialDataPath)) {
            const initialData = fs.readFileSync(initialDataPath, 'utf-8');
            const parsed = JSON.parse(initialData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              inMemoryData = parsed;
              console.log(`✓ Loaded ${parsed.length} initial records from JSON`);
              return inMemoryData;
            }
          }
          
          // ถ้าไม่มีใน JSON ให้ลองโหลดจาก CSV
          const csvPath = process.env.VERCEL 
            ? '/var/task/public/backendData.tsv'
            : './public/backendData.tsv';
            
          if (fs.existsSync(csvPath)) {
            console.log('Loading initial status updates from CSV...');
            // สร้างข้อมูลเริ่มต้นจาก CSV (ทุกรายการจะเป็น pending)
            const csvData = fs.readFileSync(csvPath, 'utf-8');
            const lines = csvData.split('\n');
            const initialUpdates: StatusUpdate[] = [];
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              const values = line.split('\t');
              if (values.length >= 3) {
                const orderNo = values[2]?.trim(); // orderNo อยู่ในคอลัมน์ที่ 3
                if (orderNo && orderNo !== 'Order No') {
                  initialUpdates.push({
                    id: Date.now().toString() + i,
                    order_no: orderNo,
                    pickup_status: 'pending',
                    datapickup: '',
                    updated_at: new Date().toISOString()
                  });
                }
              }
            }
            
            if (initialUpdates.length > 0) {
              inMemoryData = initialUpdates;
              console.log(`✓ Created ${initialUpdates.length} initial status records from CSV`);
            }
          }
        } catch {
          console.log('No initial data found, starting with empty array');
        }
      }
      return inMemoryData;
    }
    
    if (!fs.existsSync(STATUS_FILE)) {
      console.log('Status file does not exist, creating new one...');
      return [];
    }
    
    const data = fs.readFileSync(STATUS_FILE, 'utf-8');
    
    // ตรวจสอบว่าไฟล์ไม่ว่าง
    if (!data.trim()) {
      throw new Error('Status file is empty');
    }
    
    const parsed = JSON.parse(data);
    
    // ตรวจสอบว่าเป็น array
    if (!Array.isArray(parsed)) {
      throw new Error('Status file format is invalid (not an array)');
    }
    
    // validate ข้อมูลแต่ละรายการ
    const validated = parsed.filter(item => {
      return item && 
             typeof item.order_no === 'string' && 
             typeof item.pickup_status === 'string' &&
             item.order_no.length > 0;
    });
    
    console.log(`✓ Loaded ${validated.length} valid status updates from ${STATUS_FILE}`);
    return validated;
  } catch (error) {
    console.error('Error reading status file:', error);
    
    // ถ้าอ่านไฟล์ไม่ได้ ให้ fallback เป็น in-memory
    if (process.env.VERCEL) {
      console.log('File system error on Vercel, using in-memory storage');
      useFileSystem = false;
      return inMemoryData;
    }
    
    // พยายามอ่านจาก backup (สำหรับ local development)
    const backupFile = STATUS_FILE.replace('.json', '_backup.json');
    if (useFileSystem && fs.existsSync(backupFile)) {
      console.log('Attempting to read from backup...');
      try {
        const backupData = fs.readFileSync(backupFile, 'utf-8');
        const parsed = JSON.parse(backupData);
        
        if (Array.isArray(parsed)) {
          console.log('Successfully loaded from backup, restoring main file...');
          // restore main file จาก backup
          fs.copyFileSync(backupFile, STATUS_FILE);
          return parsed;
        }
      } catch (backupError) {
        console.error('Failed to read from backup:', backupError);
      }
    }
    
    console.log('Returning empty array as fallback');
    return inMemoryData.length > 0 ? inMemoryData : [];
  }
}

// เขียนข้อมูลสถานะ
function writeStatusUpdates(updates: StatusUpdate[]) {
  // อัปเดต in-memory data เสมอ
  inMemoryData = [...updates];
  
  // ถ้าไม่สามารถใช้ file system ได้ ให้ใช้ in-memory อย่างเดียว
  if (!useFileSystem) {
    console.log(`✓ Saved ${updates.length} status updates to in-memory storage`);
    return;
  }
  
  try {
    ensureDataDir();
    
    // สร้าง backup ก่อนเขียนไฟล์ใหม่ (เฉพาะ local)
    if (fs.existsSync(STATUS_FILE)) {
      const backupFile = STATUS_FILE.replace('.json', '_backup.json');
      fs.copyFileSync(STATUS_FILE, backupFile);
    }
    
    // เขียนไฟล์ใหม่
    const data = JSON.stringify(updates, null, 2);
    fs.writeFileSync(STATUS_FILE, data, 'utf-8');
    
    // ตรวจสอบว่าไฟล์ถูกเขียนสำเร็จ
    if (!fs.existsSync(STATUS_FILE)) {
      throw new Error('Failed to write status file');
    }
    
    console.log(`✓ Saved ${updates.length} status updates to ${STATUS_FILE}`);
  } catch (error) {
    console.error('Error writing status file:', error);
    
    // ถ้าเขียนไฟล์ไม่ได้ บน Vercel ให้ใช้ in-memory
    if (process.env.VERCEL) {
      console.log('File write error on Vercel, using in-memory storage only');
      useFileSystem = false;
      console.log(`✓ Saved ${updates.length} status updates to in-memory storage`);
      return;
    }
    
    // พยายาม restore จาก backup (สำหรับ local)
    const backupFile = STATUS_FILE.replace('.json', '_backup.json');
    if (fs.existsSync(backupFile)) {
      console.log('Attempting to restore from backup...');
      try {
        fs.copyFileSync(backupFile, STATUS_FILE);
        console.log('Successfully restored from backup');
      } catch (restoreError) {
        console.error('Failed to restore from backup:', restoreError);
      }
    }
    
    throw error;
  }
}

export function updateOrderStatus(orderNo: string, pickupStatus: string, datapickup: string = '') {
  const updates = readStatusUpdates();
  const existingIndex = updates.findIndex(update => update.order_no === orderNo);
  
  const newUpdate: StatusUpdate = {
    id: existingIndex >= 0 ? updates[existingIndex].id : Date.now().toString(),
    order_no: orderNo,
    pickup_status: pickupStatus,
    datapickup,
    updated_at: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    updates[existingIndex] = newUpdate;
  } else {
    updates.push(newUpdate);
  }
  
  writeStatusUpdates(updates);
  return newUpdate;
}

export function getOrderStatus(orderNo: string): StatusUpdate | undefined {
  const updates = readStatusUpdates();
  return updates.find(update => update.order_no === orderNo);
}

export function getAllStatusUpdates(): StatusUpdate[] {
  return readStatusUpdates();
}

export function saveOrderToDatabase(orderNo: string, orderData: Record<string, unknown>) {
  // สำหรับ backup ข้อมูล - อาจใช้ในอนาคต
  console.log('Saving order to backup:', orderNo, Object.keys(orderData));
}

// ฟังก์ชันสำหรับ sync ข้อมูลจาก external source
export function syncStatusUpdates(externalUpdates: Partial<StatusUpdate>[]) {
  const currentUpdates = readStatusUpdates();
  let hasChanges = false;
  
  externalUpdates.forEach(extUpdate => {
    if (!extUpdate.order_no) return;
    
    const existingIndex = currentUpdates.findIndex(update => update.order_no === extUpdate.order_no);
    
    if (existingIndex >= 0) {
      // อัปเดตถ้าข้อมูลใหม่กว่า
      const existing = currentUpdates[existingIndex];
      const extUpdatedAt = new Date(extUpdate.updated_at || 0);
      const existingUpdatedAt = new Date(existing.updated_at);
      
      if (extUpdatedAt > existingUpdatedAt) {
        currentUpdates[existingIndex] = {
          ...existing,
          ...extUpdate,
          updated_at: extUpdate.updated_at || existing.updated_at
        };
        hasChanges = true;
      }
    } else if (extUpdate.pickup_status) {
      // เพิ่มใหม่
      currentUpdates.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        order_no: extUpdate.order_no,
        pickup_status: extUpdate.pickup_status,
        datapickup: extUpdate.datapickup || '',
        updated_at: extUpdate.updated_at || new Date().toISOString()
      });
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    writeStatusUpdates(currentUpdates);
  }
  
  return { synced: hasChanges, total: currentUpdates.length };
}
