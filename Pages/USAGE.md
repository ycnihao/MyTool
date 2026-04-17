# 文件浏览器模板使用说明

## 概述

这是一个类似清华大学开源软件镜像站的文件下载页面模板，专为GitHub Pages静态网站设计。无需后端支持，通过JSON数据文件定义文件目录结构，使用直链提供文件下载。

## 文件结构

```
Pages/
├── template.html          # 模板文件
├── data.json             # 示例数据文件
├── Computer.html         # 计算机技术页面示例
├── Computer.json        # 计算机技术数据文件
├── Maths.json           # 数学数据文件示例
├── English.json         # 英语数据文件示例
└── USAGE.md            # 本使用说明
JS/
├── file-browser.js      # 文件浏览器核心组件
└── app.js              # 主站应用（已存在）
```

## 快速开始

### 1. 创建新分页面

复制 `template.html` 为新文件，例如 `Maths.html`：

```html
<!DOCTYPE html>
<html>
    <head>
        <!-- 头部内容与template.html相同 -->
    </head>
    <body>
        <!-- 主体内容与template.html相同 -->
        <script>
            // 页面配置
            window.pageConfig = {
                dataUrl: './Maths.json',     // JSON数据文件路径
                title: '数学资料 - 文件下载',  // 页面标题
                description: '数学学习资料和工具下载', // 页面描述
                showTree: true,              // 是否显示目录树
                showBreadcrumb: true         // 是否显示面包屑导航
            };
            
            // 创建文件浏览器应用
            document.addEventListener('DOMContentLoaded', function() {
                FileBrowser.createApp('#file-browser', window.pageConfig);
            });
        </script>
    </body>
</html>
```

### 2. 创建JSON数据文件

创建对应的JSON文件，例如 `Maths.json`：

```json
{
    "name": "数学资料",
    "type": "directory",
    "path": "/",
    "children": [
        {
            "name": "线性代数",
            "type": "directory",
            "children": [
                {
                    "name": "线性代数讲义.pdf",
                    "type": "file",
                    "size": 3500000,
                    "date": "2026-03-25",
                    "url": "https://实际直链地址/线性代数讲义.pdf"
                }
            ]
        }
    ]
}
```

### 3. 更新首页导航

在 `index.html` 中添加新页面的链接：

```html
<li><a href="Pages/Maths.html">数学</a></li>
```

## JSON数据结构说明

### 基本属性

| 属性 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `name` | string | 文件或目录名称 | 是 |
| `type` | string | 类型：`"directory"` 或 `"file"` | 是 |
| `path` | string | 路径（根目录为 `"/"`） | 是 |
| `children` | array | 子项数组（仅目录需要） | 目录必填 |
| `size` | number | 文件大小（字节） | 文件推荐 |
| `date` | string | 修改日期（YYYY-MM-DD格式） | 文件推荐 |
| `url` | string | 文件下载直链地址 | 文件必填 |

### 示例

```json
{
    "name": "文档",
    "type": "directory",
    "path": "/",
    "children": [
        {
            "name": "用户手册.pdf",
            "type": "file",
            "size": 2048000,
            "date": "2026-03-15",
            "url": "https://example.com/files/用户手册.pdf"
        },
        {
            "name": "子目录",
            "type": "directory",
            "children": [
                // 更多文件或目录
            ]
        }
    ]
}
```

## 功能特性

### 1. 搜索功能
- 实时搜索文件/文件夹名称
- 不区分大小写
- 支持中文搜索

### 2. 排序功能
- **名称排序**：按文件名排序（目录优先）
- **大小排序**：按文件大小排序
- **日期排序**：按修改日期排序
- **排序方向**：升序/降序切换

### 3. 导航功能
- 面包屑导航：显示当前路径
- 目录树：快速跳转到根目录下的子目录
- 返回首页：带有Awesome图标的返回按钮

### 4. 响应式设计
- 适配桌面、平板和手机
- 移动设备自动调整布局
- 触屏友好

### 5. 文件类型图标
自动根据文件扩展名显示对应图标：
- 📁 文件夹
- 📄 PDF文件
- 🎵 音频文件
- 📹 视频文件
- 📝 文档文件
- 📊 表格文件
- 等等...

## 配置选项

在页面中配置 `window.pageConfig`：

```javascript
window.pageConfig = {
    dataUrl: './data.json',      // JSON数据文件路径
    title: '文件下载',           // 页面标题
    description: '文件下载服务',  // 页面描述
    showTree: true,              // 是否显示目录树
    showBreadcrumb: true         // 是否显示面包屑导航
};
```

## 自定义样式

模板使用与主站一致的CSS样式（`../CSS/style.css`），同时内嵌了文件浏览器专用样式。如需修改：

1. **修改全局样式**：编辑 `../CSS/style.css`
2. **修改文件浏览器样式**：在页面 `<style>` 标签中修改
3. **添加新图标**：在 `getFileIcon()` 方法中添加新的文件类型映射

## 文件直链获取

由于使用GitHub Pages，文件需托管在可公开访问的位置：

### 选项1：GitHub Releases
- 将文件上传到GitHub Releases
- 获取直链：`https://github.com/用户名/仓库名/releases/download/版本号/文件名`

### 选项2：GitHub Raw
- 将文件放在仓库中
- 获取直链：`https://raw.githubusercontent.com/用户名/仓库名/分支名/文件路径`

### 选项3：外部存储
- 使用云存储服务（如阿里云OSS、腾讯云COS等）
- 使用CDN服务

## 注意事项

1. **文件大小限制**：GitHub有文件大小限制，大文件建议使用外部存储
2. **访问频率**：GitHub Raw有访问频率限制
3. **更新数据**：修改JSON文件后，刷新页面即可生效
4. **浏览器兼容**：支持现代浏览器（Chrome、Firefox、Edge、Safari）

## 示例页面

已创建示例页面：
- `Computer.html`：计算机技术资料下载
- 使用 `Computer.json` 作为数据源
- 包含完整的搜索、排序、导航功能

## 故障排除

### 问题1：无法加载JSON文件
- 检查文件路径是否正确
- 检查JSON格式是否有效（可使用JSON验证工具）
- 检查文件编码是否为UTF-8

### 问题2：文件无法下载
- 检查直链地址是否有效
- 检查文件是否可公开访问
- 检查是否有跨域限制

### 问题3：样式异常
- 检查CSS文件路径是否正确
- 检查Font Awesome图标库是否加载
- 检查浏览器控制台是否有错误

## 扩展建议

1. **添加文件描述**：在JSON中添加 `description` 字段，在页面中显示
2. **添加下载计数**：使用第三方统计服务跟踪下载次数
3. **添加文件预览**：对图片、PDF等文件添加预览功能
4. **添加分享功能**：添加社交媒体分享按钮

---

如有问题，请参考 `template.html` 和 `Computer.html` 示例，或检查浏览器控制台错误信息。