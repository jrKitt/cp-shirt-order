#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script สำหรับนำเข้าข้อมูล datapickup จากไฟล์ CSV ไปยัง backendData.tsv
"""

import csv
import sys
import os
from datetime import datetime

def main():
    # เส้นทางไฟล์
    tsv_file = 'public/backendData.tsv'
    datapickup_csv = '/Users/kittichai-macbook/Downloads/datapickup.csv'
    
    if not os.path.exists(datapickup_csv):
        print(f"ไม่พบไฟล์ {datapickup_csv}")
        return
    
    if not os.path.exists(tsv_file):
        print(f"ไม่พบไฟล์ {tsv_file}")
        return
    
    # อ่านข้อมูล datapickup
    datapickup_data = {}
    
    try:
        with open(datapickup_csv, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            headers = next(csv_reader)  # อ่าน header
            print(f"Headers จากไฟล์ datapickup.csv: {headers}")
            
            for row in csv_reader:
                if len(row) >= 2:  # สมมติว่ามี order_no และ date_pickup
                    order_no = row[0].strip()
                    date_pickup = row[1].strip()
                    datapickup_data[order_no] = date_pickup
    
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการอ่านไฟล์ datapickup.csv: {e}")
        return
    
    print(f"พบข้อมูล datapickup จำนวน {len(datapickup_data)} รายการ")
    
    # อ่านและอัปเดต TSV
    updated_lines = []
    updated_count = 0
    
    try:
        with open(tsv_file, 'r', encoding='utf-8') as file:
            for line_no, line in enumerate(file, 1):
                line = line.rstrip('\n')
                if not line.strip():
                    continue
                
                fields = line.split('\t')
                if len(fields) >= 3:  # ควรมีอย่างน้อย 3 fields เพื่อเข้าถึง order_no
                    order_no = fields[2].strip()  # orderNo อยู่ในตำแหน่งที่ 2
                    
                    # ถ้าพบ order_no ในข้อมูล datapickup
                    if order_no in datapickup_data:
                        # เพิ่ม datapickup ที่ท้ายสุด (ถ้ายังไม่มี)
                        if len(fields) == 22:  # ถ้ามี 22 fields แล้ว แสดงว่ามี datapickup column
                            fields[21] = datapickup_data[order_no]  # อัปเดต
                        else:
                            # เพิ่ม datapickup field ใหม่
                            while len(fields) < 22:
                                fields.append('')
                            fields[21] = datapickup_data[order_no]
                        
                        updated_count += 1
                        print(f"อัปเดต {order_no}: {datapickup_data[order_no]}")
                    
                    updated_lines.append('\t'.join(fields))
                else:
                    updated_lines.append(line)
        
        # เขียนไฟล์ใหม่
        with open(tsv_file, 'w', encoding='utf-8') as file:
            for line in updated_lines:
                file.write(line + '\n')
        
        print(f"\nอัปเดตข้อมูลเรียบร้อยแล้ว!")
        print(f"- อัปเดตทั้งหมด: {updated_count} รายการ")
        print(f"- บันทึกลงไฟล์: {tsv_file}")
    
    except Exception as e:
        print(f"เกิดข้อผิดพลาดในการประมวลผลไฟล์ TSV: {e}")

if __name__ == "__main__":
    main()
