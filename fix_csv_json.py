#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
สคริปต์แก้ไข CSV เพื่อให้ JSON format ถูกต้อง
"""
import csv
import json
import re

def fix_json_string(json_str):
    """แก้ไข JSON string ที่มีปัญหา"""
    if not json_str or json_str.strip() == '':
        return '{"polo":0,"jacket":0,"belt":0,"tung_ting":0,"tie_clip":0}'
    
    # ล้างข้อมูลพื้นฐาน
    fixed = json_str.strip()
    
    # เพิ่ม { ถ้าขาด
    if not fixed.startswith('{'):
        fixed = '{' + fixed
    
    # เพิ่ม } ถ้าขาด  
    if not fixed.endswith('}'):
        fixed = fixed + '}'
    
    # แก้ไข quote ที่ผิด
    fixed = fixed.replace('""', '"')
    
    # ลองแปลง JSON ถ้าไม่ได้ให้ return default
    try:
        parsed = json.loads(fixed)
        return json.dumps(parsed, ensure_ascii=False)
    except:
        # ถ้าแก้ไม่ได้ ให้ default
        return '{"polo":0,"jacket":0,"belt":0,"tung_ting":0,"tie_clip":0}'

def fix_sizes_string(sizes_str):
    """แก้ไข sizes string ที่มีปัญหา"""
    if not sizes_str or sizes_str.strip() == '':
        return '{"polo":[],"jacket":[]}'
    
    # ล้างข้อมูลพื้นฐาน
    fixed = sizes_str.strip()
    
    # เพิ่ม { ถ้าขาด
    if not fixed.startswith('{'):
        fixed = '{' + fixed
    
    # เพิ่ม } ถ้าขาด
    if not fixed.endswith('}'):
        fixed = fixed + '}'
    
    # แก้ไข quote ที่ผิด
    fixed = fixed.replace('""', '"')
    
    # ลองแปลง JSON ถ้าไม่ได้ให้ return default
    try:
        parsed = json.loads(fixed)
        return json.dumps(parsed, ensure_ascii=False)
    except:
        # ถ้าแก้ไม่ได้ ให้ default
        return '{"polo":[],"jacket":[]}'

def main():
    input_file = 'public/backendData.csv'
    output_file = 'public/backendData_fixed.csv'
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            rows = list(reader)
        
        # แก้ไขแต่ละแถว
        for i, row in enumerate(rows):
            if i == 0:  # header row
                continue
            
            if len(row) >= 18:  # ตรวจสอบว่ามีคอลัมน์เพียงพอ
                # คอลัมน์ที่ 16 คือ sizes (0-indexed)
                if len(row) > 16:
                    row[16] = fix_sizes_string(row[16])
                
                # คอลัมน์ที่ 17 คือ items (0-indexed)  
                if len(row) > 17:
                    row[17] = fix_json_string(row[17])
        
        # เขียนไฟล์ใหม่
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(rows)
        
        print(f"✅ แก้ไขเรียบร้อย: {output_file}")
        print("📋 ตัวอย่างการแก้ไข:")
        
        # แสดงตัวอย่างการแก้ไข
        for i, row in enumerate(rows[1:6]):  # แสดง 5 แถวแรก
            if len(row) > 17:
                print(f"แถว {i+2}:")
                print(f"  Sizes: {row[16]}")
                print(f"  Items: {row[17]}")
                print()
        
    except FileNotFoundError:
        print(f"❌ ไม่พบไฟล์: {input_file}")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")

if __name__ == "__main__":
    main()
