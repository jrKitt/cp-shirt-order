# 🎽 SMOCP Shirt Order Management System

ระบบจัดการการสั่งซื้อและรับเสื้อสำหรับ SMOCP (Student Major Organization - Computer Programming)

## Features

- จัดการสถานะการรับสินค้า (pending, picked_up, shipping, shipped)
- กำหนดวันที่รับของ (datapickup)
- ซิงค์ข้อมูลระหว่างหลายเครื่อง
- Export ข้อมูลเป็น Excel
- Responsive design รองรับมือถือ
- ระบบ backup อัตโนมัติทุก 30 วินาที
- รองรับ deployment บน Vercel

## Quick Start

### Development

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูเว็บไซต์

### Production Build

```bash
npm run build
npm start
```

## 🌐 Deploy on Vercel

1. Push โค้ดขึ้น GitHub
2. เข้า [Vercel Dashboard](https://vercel.com)
3. Import project จาก GitHub
4. Vercel จะ deploy อัตโนมัติ

**หมายเหตุ**: ระบบได้ปรับให้รองรับ Vercel โดยใช้ in-memory storage และ `/tmp` directory

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
