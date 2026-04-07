# 文件条目生成工具

这个工具可以帮助你自动生成Vue.js应用中使用的文件JSON代码段，避免手动编辑JSON文件。

## 工具列表

### 1. Python脚本 (`file_entry_generator.py`)

**功能：**
- 交互式命令行界面
- 批量从文本文件导入
- 生成JavaScript和JSON格式代码

**使用方法：**

```bash
# 进入工具目录
cd tools

# 交互式模式
python file_entry_generator.py

# 批量模式（从文件导入）
python file_entry_generator.py files.txt
```

**输入文件格式 (`files.txt`):**
```
文件名.pdf,https://example.com/file.pdf,2026-03-14,19.64KB,pdf
音乐文件.mp3,https://example.com/music.mp3,2026-03-27,2.58MB,mp3
```

### 2. Web界面 (`file_generator.html`)

**功能：**
- 图形化用户界面
- 实时预览生成的代码
- 一键复制到剪贴板
- 支持添加/删除多个文件

**使用方法：**
1. 直接在浏览器中打开 `file_generator.html`
2. 填写文件信息
3. 点击"生成代码"按钮
4. 复制生成的代码到你的Vue.js应用中

## 生成的代码格式

### JavaScript格式（用于Vue.js的data()）
```javascript
{
    id:1,
    name:'测试PDF文件.pdf',
    url:'https://github.com/ycnihao/MyTool/releases/download/v0.1/HELLO.WORLD.pdf',
    date:'2026-03-14',
    size:'19.64KB',
    type: 'pdf'
},
{
    id:2,
    name:'测试mp3音乐.mp3',
    url:'https://example.com/music.mp3',
    date:'2026-03-27',
    size:'2.58MB',
    type:'mp3'
}
```

### JSON格式
```json
[
    {
        "name": "测试PDF文件.pdf",
        "url": "https://github.com/ycnihao/MyTool/releases/download/v0.1/HELLO.WORLD.pdf",
        "date": "2026-03-14",
        "size": "19.64KB",
        "type": "pdf"
    },
    {
        "name": "测试mp3音乐.mp3",
        "url": "https://example.com/music.mp3",
        "date": "2026-03-27",
        "size": "2.58MB",
        "type": "mp3"
    }
]
```

## 字段说明

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| name | 是 | 文件名 | `测试文件.pdf` |
| url | 是 | 文件下载URL | `https://example.com/file.pdf` |
| date | 否 | 日期（YYYY-MM-DD） | `2026-03-14` |
| size | 否 | 文件大小 | `19.64KB`, `2.58MB` |
| type | 否 | 文件类型 | `pdf`, `mp3`, `video` |

## 自动类型检测

如果未指定文件类型，工具会根据文件扩展名自动检测：
- `.pdf`, `.doc`, `.docx`, `.txt`, `.md` → `document`
- `.mp3`, `.wav`, `.flac` → `audio`
- `.mp4`, `.avi`, `.mov` → `video`
- `.jpg`, `.jpeg`, `.png`, `.gif` → `image`
- 其他扩展名 → 使用扩展名作为类型

## 集成到现有项目

1. 使用工具生成代码
2. 复制JavaScript代码段
3. 替换 `JS/app.js` 中的 `files` 数组
4. 或者将JSON代码保存到 `Data/` 目录，然后在Vue.js中通过API加载

## 后续扩展建议

1. **文件上传功能**：直接上传文件到GitHub Releases或云存储，自动生成URL
2. **GitHub集成**：连接到GitHub API，自动获取Releases中的文件
3. **本地文件扫描**：扫描本地目录，自动生成文件列表
4. **浏览器扩展**：开发Chrome/Firefox扩展，从网页中提取文件信息
5. **API服务**：创建REST API，支持程序化添加文件条目