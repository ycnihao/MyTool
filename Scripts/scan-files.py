import os #必要的库函数
import json
import datetime
from pathlib import Path

def get_file_info(filepath):#这个定义了扫描的时候的文件的判断标准（比如该输出为什么样子）
    stat = filepath.stat()
    ext = filepath.suffix.lower()
    file_types = {
        '.pdf': 'pdf',
        '.doc': 'word',
        '.docx':'word',
        '.ppt':'powerpoint',
        '.pptx':'powerpoint',
        '.jpg':'image',
        '.png':'image',
        '.tiff':'vector',
        '.svg':'vector',
        '.jpeg':'image',
        '.txt':'text',
        '.md':'markdown'
    }

    return {
        'id': str(filepath),
        'name': filepath.name,
        'path': str(filepath.relative_to('../Downloads/')),
        'size': stat.st_size,
        'size_display': format_size(stat.st_size),
        'modified': stat.st_mtime,
        'modified_display': datetime.datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
        'type': file_types.get(ext,'other'),
        'extension':ext[1:] if ext else '',
        'category': filepath.parent.name if filepath.parent.name != 'Downloads' else 'uncategorized'
    }

def format_size(size_bytes):#这个是用来计算文件大小的通用函数
    if size_bytes == 0:
        return '0B'
    
    size_names = ["B","KB","MB","GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names)-1:
        size_bytes /= 1024.0
        i += 1

    return f"{size_bytes:.1f}{size_names[i]}"

def scan_directory(directory='../Downloads/'):#这个是为了路径的容错，让系统能够找到我们的目标文件夹
    files =[]
    dir_path = Path(directory)

    if not dir_path.exists():
        print(f'目录不存在:{directory}')
        return files
    
    for filepath in dir_path.rglob('*'):
        if filepath.is_file():
            try:
                file_info = get_file_info(filepath)
                files.append(file_info)
                print(f"扫描:{file_info['name']}({file_info['size_display']})")
            except Exception as e:
                print(f"错误扫描文件 {filepath}:{e}")

    files.sort(key=lambda x : x['modified'],reverse=True)
    return files

def main(): #这个是主扫描函数，它的输入是目标文件夹（在我这里是Downloads),输出是目标文件夹里的文件的信息。
    print('开始扫描文件')
    files = scan_directory('../Downloads/')
    files_by_category = {}
    for file in files:
        category = file['category']
        if category not in files_by_category:
            files_by_category[category] = []
        files_by_category[category].append(file)
    
    output = {
        'generated_at':datetime.datetime.now().isoformat(),
        'total_files':len(files),
        'categories':list(files_by_category.keys()),
        'files_by_category': files_by_category,
        'all_files': files
    }
    output_dir =Path('../Data/scan_data')
    output_dir.mkdir(parents=True,exist_ok=True)
    output_file = output_dir / 'files.json'
    with open(output_file,'w',encoding='utf-8') as f:
        json.dump(output,f,indent=2,ensure_ascii=False)

    print(f'\n扫描完成')
    print(f"找到{len(files)}个文件")
    print(f"分类:{','.join(files_by_category.keys())}")
    print(f"数据已保存到:{output_file}")

if __name__ == '__main__':# 扫描 ？ 启动！
    main()