"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Search,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Table,
} from "lucide-react";

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
  pickupStatus?: "pending" | "picked_up" | "shipping" | "shipped";
  datapickup?: string;
}

const statusLabels = {
  pending: "รอการรับ",
  picked_up: "รับแล้ว",
  shipping: "รอจัดส่ง",
  shipped: "จัดส่งแล้ว",
};

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  picked_up: "bg-emerald-50 text-emerald-700 border-emerald-200",
  shipping: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
};

const ITEMS_PER_PAGE = 10;

export default function ShirtPickupSystem() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // เพิ่ม state สำหรับ filter สถานะ
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchOrders();
    
    // Auto-save ทุก 30 วินาที (เป็นการ backup เพิ่มเติม)
    const autoSaveInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const lastAction = localStorage.getItem('lastOrderAction');
        const now = Date.now();
        
        // ถ้ามีการเปลี่ยนแปลงใน 30 วินาทีที่ผ่านมา
        if (lastAction && (now - parseInt(lastAction)) < 30000) {
          console.log('Auto-saving data...');
          syncData();
        }
      }
    }, 30000); // ทุก 30 วินาที
    
    return () => clearInterval(autoSaveInterval);
  }, []);

  useEffect(() => {
    let filtered = orders;

    // กรองตามการค้นหา
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามสถานะ
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => (order.pickupStatus || "pending") === statusFilter
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      const ordersArray = Array.isArray(data) ? data : [];

      const processedOrders = ordersArray.map((order) => ({
        ...order,
        pickupStatus:
          order.deliveryType === "shipping"
            ? "shipping"
            : order.pickupStatus || "pending",
      }));

      // โหลด status ที่บันทึกไว้ใน localStorage
      if (typeof window !== 'undefined') {
        const savedStatuses = localStorage.getItem('orderStatuses');
        if (savedStatuses) {
          try {
            const parsedStatuses = JSON.parse(savedStatuses);
            const ordersWithSavedStatus = processedOrders.map(order => {
              const savedData = parsedStatuses[order.orderNo];
              
              // ทำความสะอาดข้อมูล datapickup ที่อาจเป็น "0"
              let cleanDatepickup = '';
              if (typeof savedData === 'object' && savedData?.datapickup) {
                if (savedData.datapickup !== "0" && !isNaN(Date.parse(savedData.datapickup))) {
                  cleanDatepickup = savedData.datapickup;
                }
              }
              
              return {
                ...order,
                pickupStatus: typeof savedData === 'string' ? savedData : savedData?.status || order.pickupStatus,
                datapickup: cleanDatepickup || order.datapickup || ''
              };
            });
            setOrders(ordersWithSavedStatus);
            setFilteredOrders(ordersWithSavedStatus);
            return;
          } catch (error) {
            console.error('Error parsing saved statuses:', error);
            // ลบข้อมูลที่เสียหายออก
            localStorage.removeItem('orderStatuses');
          }
        }
      }

      setOrders(processedOrders);
      setFilteredOrders(processedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePickupStatus = async (orderNo: string, newStatus: string, datapickup?: string) => {
    try {
      setUpdating(orderNo);
      
      // บันทึก timestamp สำหรับ auto-save
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastOrderAction', Date.now().toString());
      }
      
      // ส่งไปยัง API ก่อน (เป็น primary storage)
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNo,
          pickupStatus: newStatus,
          datapickup: datapickup || '',
        }),
      });

      if (response.ok) {
        // อัปเดต state ใน React
        const updatedOrders = orders.map((order) =>
          order.orderNo === orderNo
            ? { ...order, pickupStatus: newStatus as Order["pickupStatus"], datapickup: datapickup || order.datapickup }
            : order
        );
        setOrders(updatedOrders);
        
        // อัปเดตใน localStorage เป็น backup
        if (typeof window !== 'undefined') {
          const savedStatuses = localStorage.getItem('orderStatuses');
          const currentStatuses = savedStatuses ? JSON.parse(savedStatuses) : {};
          currentStatuses[orderNo] = { status: newStatus, datapickup: datapickup || '' };
          localStorage.setItem('orderStatuses', JSON.stringify(currentStatuses));
        }
        
        console.log(`✓ Successfully updated ${orderNo} to ${newStatus}`);
      } else {
        console.error("API update failed");
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setUpdating(null);
    }
  };

  const updateDatepickup = async (orderNo: string, datapickup: string) => {
    try {
      setUpdating(orderNo);
      
      // ตรวจสอบรูปแบบวันที่ก่อนส่ง
      if (datapickup && isNaN(Date.parse(datapickup))) {
        console.error("Invalid date format:", datapickup);
        alert("รูปแบบวันที่ไม่ถูกต้อง กรุณาเลือกวันที่ใหม่");
        return;
      }
      
      // บันทึก timestamp สำหรับ auto-save
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastOrderAction', Date.now().toString());
      }
      
      // อัปเดตในฐานข้อมูล
      const response = await fetch("/api/datapickup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNo,
          datapickup: datapickup || '',
        }),
      });

      if (response.ok) {
        // อัปเดต state ใน React
        const updatedOrders = orders.map((order) =>
          order.orderNo === orderNo
            ? { ...order, datapickup: datapickup || '', pickupStatus: datapickup ? 'picked_up' as Order["pickupStatus"] : order.pickupStatus }
            : order
        );
        setOrders(updatedOrders);
        
        console.log(`✓ Successfully updated datapickup for ${orderNo}: ${datapickup}`);
      } else {
        console.error("Failed to update datapickup");
        alert("เกิดข้อผิดพลาดในการบันทึกวันที่ กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Error updating datapickup:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบการเชื่อมต่อ");
    } finally {
      setUpdating(null);
    }
  };

  const importDatapickup = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/import/datapickup", {
        method: "POST",
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Import result:", result);
        
        // รีเฟรชข้อมูล
        await fetchOrders();
        
        setLastSync(new Date().toLocaleString('th-TH'));
        alert(`นำเข้าข้อมูลเรียบร้อย: ${result.imported} รายการ จากไฟล์ ${result.source || 'unknown'}`);
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error || 'ไม่ทราบสาเหตุ'}`);
      }
    } catch (error) {
      console.error("Error importing datapickup:", error);
      alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert('กรุณาเลือกไฟล์ .csv หรือ .json');
      return;
    }

    setUploadingFile(true);
    try {
      const text = await file.text();
      
      // Parse ข้อมูลจากไฟล์
      let importData: Array<{
        order_no: string;
        pickup_status: string;
        datapickup: string;
        updated_at: string;
      }> = [];

      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',');
          if (values.length >= 2) {
            const orderNo = values[0]?.trim()?.replace(/"/g, '');
            const datapickup = values[1]?.trim()?.replace(/"/g, '');
            
            if (orderNo && orderNo !== 'Order No' && orderNo !== 'order_no') {
              importData.push({
                order_no: orderNo,
                pickup_status: 'picked_up',
                datapickup: datapickup || '',
                updated_at: new Date().toISOString()
              });
            }
          }
        }
      } else {
        importData = JSON.parse(text);
      }

      // ส่งข้อมูลไปยัง API โดยตรง
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: importData })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchOrders();
        setLastSync(new Date().toLocaleString('th-TH'));
        alert(`อัปโหลดและนำเข้าข้อมูลเรียบร้อย: ${importData.length} รายการ`);
      } else {
        alert('เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
      setUploadingFile(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);
      
      // ส่งข้อมูลปัจจุบันไปยัง server อื่น (ถ้ามี)
      const currentData = await fetch("/api/sync").then(res => res.json());
      
      console.log("Sync completed:", currentData);
      setLastSync(new Date().toLocaleString('th-TH'));
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setSyncing(false);
    }
  };

  const clearCorruptedData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orderStatuses');
      localStorage.removeItem('lastOrderAction');
      alert('ล้างข้อมูล cache เรียบร้อยแล้ว จะรีเฟรชหน้าเว็บ');
      window.location.reload();
    }
  };

  const getStatusCount = (status: string) => {
    return orders.filter(
      (order) => (order.pickupStatus || "pending") === status
    ).length;
  };

  const parseOrderItems = (sizesStr: string, itemsStr: string) => {
    // helper function ตัดอิโมจิออกจากข้อความ
    const removeEmoji = (str: string) =>
      str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");

    // helper function เช็คว่า string เป็น JSON ที่ถูกต้อง
    const safeParse = (str: string) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    };

    try {
      const sizes = safeParse(sizesStr);
      const items = safeParse(itemsStr);

      if (!sizes || !items) {
        return ["ข้อมูลสินค้าไม่สมบูรณ์"];
      }

      const itemDetails = [];

      if (items.polo && items.polo > 0) {
        const poloSizes = sizes.polo || [];
        if (poloSizes.length > 0) {
          itemDetails.push(
            removeEmoji(
              `เสื้อโปโล (${items.polo} ตัว) - ไซส์: ${poloSizes.join(", ")}`
            )
          );
        } else {
          itemDetails.push(removeEmoji(`เสื้อโปโล (${items.polo} ตัว)`));
        }
      }

      if (items.jacket && items.jacket > 0) {
        const jacketSizes = sizes.jacket || [];
        if (jacketSizes.length > 0) {
          itemDetails.push(
            removeEmoji(
              `เสื้อแจ็คเก็ต (${items.jacket} ตัว) - ไซส์: ${jacketSizes.join(
                ", "
              )}`
            )
          );
        } else {
          itemDetails.push(removeEmoji(`เสื้อแจ็คเก็ต (${items.jacket} ตัว)`));
        }
      }

      if (items.belt && items.belt > 0) {
        itemDetails.push(removeEmoji(`หัวเข็มขัด (${items.belt} ชิ้น)`));
      }

      if (items.tung_ting && items.tung_ting > 0) {
        itemDetails.push(removeEmoji(`ตุ้งติ้ง (${items.tung_ting} ชิ้น)`));
      }

      if (items.tie_clip && items.tie_clip > 0) {
        itemDetails.push(removeEmoji(`ที่หนีบเนคไท (${items.tie_clip} ชิ้น)`));
      }

      return itemDetails.length > 0 ? itemDetails : ["ไม่มีรายการสินค้า"];
    } catch (error) {
      console.error("Error parsing order items:", error);
      return ["ข้อมูลสินค้าไม่สมบูรณ์"];
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ฟังก์ชั่นสำหรับ export ข้อมูล
  const exportToCSV = () => {
    const csvData = filteredOrders.map(order => ({
      'เลขออเดอร์': order.orderNo,
      'ชื่อ': order.firstname,
      'นามสกุล': order.lastname,
      'อีเมล': order.email,
      'รหัสนักศึกษา': order.studentId,
      'สาขา': order.studentMajor,
      'คณะ': order.studentFaculty,
      'เบอร์โทร': order.phone,
      'ปีการศึกษา': order.year,
      'แพ็คเกจ': order.packageName,
      'ราคา': order.price,
      'ประเภทการส่ง': order.deliveryType === 'pickup' ? 'มารับเอง' : 'จัดส่ง',
      'ที่อยู่': order.address || '-',
      'สถานะ': statusLabels[(order.pickupStatus || 'pending') as keyof typeof statusLabels],
      'วันที่รับสินค้า': order.datapickup ? new Date(order.datapickup).toLocaleDateString('th-TH') : '-',
      'วันที่สั่ง': new Date(order.timestamp).toLocaleDateString('th-TH'),
      'รายการสินค้า': parseOrderItems(order.sizes, order.items).join(', '),
      'หมายเหตุ': order.note || '-'
    }));

    const csv = convertToCSV(csvData);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcel = () => {
    const excelData = filteredOrders.map(order => ({
      'เลขออเดอร์': order.orderNo,
      'ชื่อ': order.firstname,
      'นามสกุล': order.lastname,
      'อีเมล': order.email,
      'รหัสนักศึกษา': order.studentId,
      'สาขา': order.studentMajor,
      'คณะ': order.studentFaculty,
      'เบอร์โทร': order.phone,
      'ปีการศึกษา': order.year,
      'แพ็คเกจ': order.packageName,
      'ราคา': parseFloat(order.price) || 0,
      'ประเภทการส่ง': order.deliveryType === 'pickup' ? 'มารับเอง' : 'จัดส่ง',
      'ที่อยู่': order.address || '-',
      'สถานะ': statusLabels[(order.pickupStatus || 'pending') as keyof typeof statusLabels],
      'วันที่รับสินค้า': order.datapickup ? new Date(order.datapickup).toLocaleDateString('th-TH') : '-',
      'วันที่สั่ง': new Date(order.timestamp).toLocaleDateString('th-TH'),
      'รายการสินค้า': parseOrderItems(order.sizes, order.items).join(', '),
      'หมายเหตุ': order.note || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    
    // กำหนดความกว้างของคอลัมน์
    const wscols = [
      { wch: 15 }, // เลขออเดอร์
      { wch: 15 }, // ชื่อ
      { wch: 15 }, // นามสกุล
      { wch: 25 }, // อีเมล
      { wch: 15 }, // รหัสนักศึกษา
      { wch: 20 }, // สาขา
      { wch: 20 }, // คณะ
      { wch: 15 }, // เบอร์โทร
      { wch: 10 }, // ปีการศึกษา
      { wch: 20 }, // แพ็คเกจ
      { wch: 10 }, // ราคา
      { wch: 15 }, // ประเภทการส่ง
      { wch: 30 }, // ที่อยู่
      { wch: 15 }, // สถานะ
      { wch: 15 }, // วันที่สั่ง
      { wch: 40 }, // รายการสินค้า
      { wch: 20 }, // หมายเหตุ
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const convertToCSV = (data: Record<string, string | number>[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // ห่อด้วย quotes และ escape quotes ใน value
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#30319D] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <nav className="bg-[#30319D] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src="/image/SMOLOGO.webp"
                  alt="SMOCP Logo"
                  width={40}
                  height={40}
                  className="mr-3"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">SMOCP</h1>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                หน้าหลัก
              </Link>
              <a
                href="#"
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors border-b-2 border-white"
              >
                ระบบรับเสื้อ
              </a>
              <a
                href=""
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                ปฏิทินกิจกรรม
              </a>
              <a
                href=""
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                บริการสำหรับนักศึกษา
              </a>
              <Link
                href="/shop"
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                ร้านค้าสโมสร
              </Link>
              <a
                href="https://www.facebook.com/profile.php?id=100083108863117&mibextid=wwXIfr&rdid=SjHPRnXMQKJ5FEDh&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BUay9x1MG%2F%3Fmibextid%3DwwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-indigo-200 px-3 py-2 text-sm font-medium transition-colors"
              >
                Facebook
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-indigo-200 focus:outline-none focus:text-indigo-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#30319D] border-t border-indigo-400">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-white hover:text-indigo-200 hover:bg-indigo-700 rounded-md"
              >
                หน้าหลัก
              </Link>
              <a
                href="#"
                className="block px-3 py-2 text-white font-semibold bg-indigo-700 rounded-md"
              >
                ระบบรับเสื้อ
              </a>
              <a
                href=""
                className="block px-3 py-2 text-white hover:text-indigo-200 hover:bg-indigo-700 rounded-md"
              >
                ปฏิทินกิจกรรม
              </a>
              <a
                href=""
                className="block px-3 py-2 text-white hover:text-indigo-200 hover:bg-indigo-700 rounded-md"
              >
                บริการสำหรับนักศึกษา
              </a>
              <Link
                href="/shop"
                className="block px-3 py-2 text-white hover:text-indigo-200 hover:bg-indigo-700 rounded-md"
              >
                ร้านค้าสโมสร
              </Link>
              <a
                href="https://www.facebook.com/profile.php?id=100083108863117&mibextid=wwXIfr&rdid=SjHPRnXMQKJ5FEDh&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BUay9x1MG%2F%3Fmibextid%3DwwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-white hover:text-indigo-200 hover:bg-indigo-700 rounded-md"
              >
                Facebook
              </a>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div
              key={status}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      statusColors[status as keyof typeof statusColors]
                    } border-2`}
                  >
                    <span className="text-lg font-bold">
                      {getStatusCount(status)}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {label}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {getStatusCount(status)} รายการ
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter และ Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Search Box */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อ, เลขออเดอร์, รหัสนักศึกษา หรืออีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-black block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#30319D] focus:border-[#30319D] transition-all duration-200"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-black">
            
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-4 py-4 border border-gray-300 rounded-xl text-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#30319D] focus:border-[#30319D] transition-all duration-200"
            >
              <option value="all">ทั้งหมด ({orders.length} รายการ)</option>
              <option value="pending">
                รอการรับ ({getStatusCount("pending")} รายการ)
              </option>
              <option value="picked_up">
                รับแล้ว ({getStatusCount("picked_up")} รายการ)
              </option>
              <option value="shipping">
                รอจัดส่ง ({getStatusCount("shipping")} รายการ)
              </option>
              <option value="shipped">
                จัดส่งแล้ว ({getStatusCount("shipped")} รายการ)
              </option>
            </select>
          </div>
        </div>

        {searchTerm === "" && statusFilter === "all" && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  <span className="text-green-600">ข้อมูลทั้งหมด:</span> {orders.length} รายการ
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ดาวน์โหลดข้อมูลออเดอร์ทั้งหมดพร้อมสถานะการรับสินค้า
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 bg-white border border-green-300 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 transition-colors duration-200 shadow-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center px-4 py-2 bg-green-600 border border-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors duration-200 shadow-sm"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        )}

        {(searchTerm || statusFilter !== "all") && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">
                <span className="font-medium">ผลการกรอง:</span> พบ{" "}
                {filteredOrders.length} รายการ
                {searchTerm && <span> จากการค้นหา &quot;{searchTerm}&quot;</span>}
                {statusFilter !== "all" && (
                  <span>
                    {" "}
                    ที่มีสถานะ &quot;
                    {statusLabels[statusFilter as keyof typeof statusLabels]}&quot;
                  </span>
                )}{" "}
                จากทั้งหมด {orders.length} รายการ
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-3 py-1.5 bg-blue-600 border border-blue-600 rounded-md text-xs font-medium text-white hover:bg-blue-700 transition-colors duration-200 cursor-pointer ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingFile ? "อัปโหลด..." : "📁 อัปโหลด CSV/JSON"}
                </label>
                <button
                  onClick={importDatapickup}
                  disabled={syncing}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 border border-green-600 rounded-md text-xs font-medium text-white hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {syncing ? "นำเข้า..." : "📥 นำเข้า Datapickup"}
                </button>
                <button
                  onClick={syncData}
                  disabled={syncing}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-600 border border-purple-600 rounded-md text-xs font-medium text-white hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {syncing ? "Sync..." : "🔄 Sync ข้อมูล"}
                </button>
                <button
                  onClick={clearCorruptedData}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 border border-red-600 rounded-md text-xs font-medium text-white hover:bg-red-700 transition-colors duration-200"
                >
                  ล้าง Cache
                </button>
                {lastSync && (
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                    Sync ล่าสุด: {lastSync}
                  </span>
                )}
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-blue-300 rounded-md text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 border border-blue-600 rounded-md text-xs font-medium text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">{/* Orders list */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  รายการออเดอร์ ({filteredOrders.length} รายการ)
                </h3>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    หน้า {currentPage} จาก {totalPages}
                  </p>
                )}
              </div>
              
              {/* <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 shadow-sm"
                >
                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                  Export CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center px-4 py-2 bg-[#30319D] border border-[#30319D] rounded-lg text-sm font-medium text-white hover:bg-[#2a2a8a] transition-colors duration-200 shadow-sm"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Export Excel
                </button>
              </div> */}
            </div>
          </div>

          {paginatedOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                ไม่พบรายการ
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? "ไม่พบรายการที่ตรงกับการค้นหา"
                  : "ยังไม่มีรายการออเดอร์"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <div
                  key={order.orderNo}
                  className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-[#30319D] rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {order.firstname} {order.lastname}
                          </h4>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                            statusColors[
                              (order.pickupStatus ||
                                "pending") as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {
                            statusLabels[
                              (order.pickupStatus ||
                                "pending") as keyof typeof statusLabels
                            ]
                          }
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#30319D]" />
                          <span className="font-medium">{order.orderNo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#30319D]" />
                          <span>{order.studentId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#30319D]" />
                          <span>{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#30319D]" />
                          <span>
                            {new Date(order.timestamp).toLocaleDateString(
                              "th-TH"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-semibold text-gray-700">
                            แพ็คเกจ:{" "}
                          </span>
                          <span className="text-gray-900">
                            {order.packageName}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-semibold text-gray-700">
                            ประเภทการส่ง:{" "}
                          </span>
                          <span className="text-gray-900">
                            {order.deliveryType === "pickup"
                              ? "มารับเอง"
                              : "จัดส่ง"}
                          </span>
                        </div>
                      </div>

                      {/* รายละเอียดสินค้า */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg mb-3">
                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Package className="h-4 w-4 text-[#30319D] mr-2" />
                          รายการสินค้าที่สั่งซื้อ:
                        </h5>
                        <div className="space-y-1">
                          {parseOrderItems(order.sizes, order.items).map(
                            (item, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-700 bg-white px-3 py-2 rounded border-l-3 border-[#30319D]"
                              >
                                • {item}
                              </div>
                            )
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">ราคารวม: </span>
                          <span className="text-[#30319D] font-bold">
                            {order.price} บาท
                          </span>
                        </div>
                      </div>

                      {order.deliveryType === "shipping" && order.address && (
                        <div className="mt-3 flex items-start gap-2 text-sm bg-indigo-50 p-3 rounded-lg">
                          <MapPin className="h-4 w-4 mt-0.5 text-[#30319D]" />
                          <span className="text-gray-700">{order.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 ml-6">
                      <div className="flex flex-col gap-2">
                        {["pending", "picked_up", "shipping", "shipped"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updatePickupStatus(order.orderNo, status)
                              }
                              disabled={updating === order.orderNo}
                              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
                                (order.pickupStatus || "pending") === status
                                  ? statusColors[
                                      status as keyof typeof statusColors
                                    ]
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                              } ${
                                updating === order.orderNo
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:shadow-md"
                              }`}
                            >
                              {updating === order.orderNo
                                ? "กำลังอัปเดต..."
                                : statusLabels[
                                    status as keyof typeof statusLabels
                                  ]}
                            </button>
                          )
                        )}
                        
                        {/* ส่วนสำหรับใส่วันที่รับสินค้า */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            วันที่รับสินค้า:
                          </label>
                          <input
                            type="date"
                            value={order.datapickup && order.datapickup !== "0" ? order.datapickup : ''}
                            onChange={(e) => updateDatepickup(order.orderNo, e.target.value)}
                            disabled={updating === order.orderNo}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-[#30319D] focus:ring-1 focus:ring-[#30319D] outline-none transition-colors duration-200"
                          />
                          {order.datapickup && order.datapickup !== "0" && (
                            <div className="mt-1 text-xs text-green-600 font-medium">
                              ✓ รับเมื่อ: {new Date(order.datapickup).toLocaleDateString('th-TH', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} ถึง{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredOrders.length
                  )}{" "}
                  จาก {filteredOrders.length} รายการ
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              currentPage === page
                                ? "bg-[#30319D] text-white border border-[#30319D]"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-sm text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-[#30319D] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              STUDENT UNION | College Of Computing
            </h3>
            <p className="text-indigo-200">
              สโมสรนักศึกษาวิทยาลัยการคอมพิวเตอร์
            </p>
            <p className="text-indigo-200">
              วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
            </p>
            <div className="mt-4 pt-4 border-t border-indigo-400">
              <p className="text-sm text-indigo-200">
                © 2025 SMOCP68. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
