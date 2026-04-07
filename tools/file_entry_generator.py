#!/usr/bin/env python3
"""
文件条目生成器
用于生成Vue.js应用中的文件JSON代码段
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

def generate_file_entry(id_counter, name, url, date=None, size=None, file_type=None):
    """
    生成单个文件条目
    
    Args:
        id_counter: 文件ID计数器
        name: 文件名
        url: 文件URL
        date: 日期 (格式: YYYY-MM-DD)
        size: 文件大小 (如: '19.64KB', '2.58MB')
        file_type: 文件类型 (如: 'pdf', 'mp3')
    
    Returns:
        dict: 文件条目字典
    """
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    if file_type is None:
        # 根据文件扩展名猜测类型
        ext = os.path.splitext(name)[1].lower().replace('.', '')
        if ext in ['pdf', 'doc', 'docx', 'txt', 'md']:
            file_type = 'document'
        elif ext in ['mp3', 'wav', 'flac']:
            file_type = 'audio'
        elif ext in ['mp4', 'avi', 'mov']:
            file_type = 'video'
        elif ext in ['jpg', 'jpeg', 'png', 'gif']:
            file_type = 'image'
        else:
            file_type = ext
    
    entry = {
        'id': id_counter,
        'name': name,
        'url': url,
        'date': date,
        'type': file_type
    }
    
    if size:
        entry['size'] = size
    
    return entry

def generate_js_code(entries):
    """
    生成JavaScript代码段
    
    Args:
        entries: 文件条目列表
    
    Returns:
        str: JavaScript代码
    """
    lines = []
    for i, entry in enumerate(entries):
        indent = '                    '
        lines.append(f'{indent}{{')
        lines.append(f'{indent}    id:{entry["id"]},')
        lines.append(f'{indent}    name:\'{entry["name"]}\',')
        lines.append(f'{indent}    url:\'{entry["url"]}\',')
        lines.append(f'{indent}    date:\'{entry["date"]}\',')
        if 'size' in entry:
            lines.append(f'{indent}    size:\'{entry["size"]}\',')
        lines.append(f'{indent}    type: \'{entry["type"]}\'')
        lines.append(f'{indent}}}{"," if i < len(entries) - 1 else ""}')
    
    return '\n'.join(lines)

def generate_json_code(entries):
    """
    生成JSON代码段
    
    Args:
        entries: 文件条目列表
    
    Returns:
        str: JSON代码
    """
    return json.dumps(entries, indent=4, ensure_ascii=False)

def interactive_mode():
    """交互式模式"""
    print("=== 文件条目生成器 ===")
    print("输入文件信息，输入空行结束")
    print()
    
    entries = []
    id_counter = 1
    
    while True:
        print(f"\n--- 文件 #{id_counter} ---")
        
        name = input("文件名: ").strip()
        if not name:
            break
        
        url = input("文件URL: ").strip()
        if not url:
            print("URL不能为空，跳过此文件")
            continue
        
        date = input(f"日期 (YYYY-MM-DD) [默认: {datetime.now().strftime('%Y-%m-%d')}]: ").strip()
        if not date:
            date = None
        
        size = input("文件大小 (如: 19.64KB, 2.58MB) [可选]: ").strip()
        if not size:
            size = None
        
        file_type = input("文件类型 (如: pdf, mp3) [可选]: ").strip()
        if not file_type:
            file_type = None
        
        entry = generate_file_entry(id_counter, name, url, date, size, file_type)
        entries.append(entry)
        id_counter += 1
    
    if entries:
        print(f"\n=== 生成了 {len(entries)} 个文件条目 ===")
        print("\n1. JavaScript代码段:")
        print("-" * 50)
        print(generate_js_code(entries))
        print("-" * 50)
        
        print("\n2. JSON格式:")
        print("-" * 50)
        print(generate_json_code(entries))
        print("-" * 50)
        
        # 询问是否保存到文件
        save = input("\n是否保存到文件? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("文件名 [默认: generated_files.json]: ").strip()
            if not filename:
                filename = 'generated_files.json'
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(entries, f, indent=4, ensure_ascii=False)
            print(f"已保存到 {filename}")
    else:
        print("没有生成任何文件条目")

def batch_mode_from_file(file_path):
    """
    从文件批量导入
    
    Args:
        file_path: 包含文件信息的文本文件路径
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        entries = []
        id_counter = 1
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # 假设每行格式: 文件名,URL,日期,大小,类型
            parts = [p.strip() for p in line.split(',')]
            if len(parts) < 2:
                continue
            
            name = parts[0]
            url = parts[1]
            date = parts[2] if len(parts) > 2 else None
            size = parts[3] if len(parts) > 3 else None
            file_type = parts[4] if len(parts) > 4 else None
            
            entry = generate_file_entry(id_counter, name, url, date, size, file_type)
            entries.append(entry)
            id_counter += 1
        
        if entries:
            print(f"从 {file_path} 导入了 {len(entries)} 个文件")
            print("\nJavaScript代码段:")
            print("-" * 50)
            print(generate_js_code(entries))
            print("-" * 50)
        else:
            print("没有找到有效的文件信息")
    
    except Exception as e:
        print(f"读取文件失败: {e}")

def main():
    """主函数"""
    if len(sys.argv) > 1:
        # 批量模式
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            batch_mode_from_file(file_path)
        else:
            print(f"文件不存在: {file_path}")
    else:
        # 交互式模式
        interactive_mode()

if __name__ == '__main__':
    main()