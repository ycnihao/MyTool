/**
 * 文件浏览器组件
 * 用于在静态页面中展示文件目录结构并提供下载链接
 * 使用方法：
 * 1. 在HTML中引入Vue和本文件
 * 2. 在页面中定义配置：window.pageConfig = { dataUrl: './data.json', title: '标题', description: '描述' };
 * 3. 添加一个容器元素：<div id="file-browser"></div>
 * 4. 调用 FileBrowser.createApp('#file-browser', window.pageConfig);
 */

const FileBrowser = {
    // 默认配置
    defaultConfig: {
        dataUrl: '../Data/Data.json',
        title: '文件下载',
        description: '提供相关文件下载服务',
        showTree: true,
        showBreadcrumb: true
    },

    // 创建Vue应用并挂载
    createApp(selector, userConfig = {}) {
        const config = { ...this.defaultConfig, ...userConfig };
        
        const { createApp } = Vue;
        
        const app = createApp({
            data() {
                return {
                    loading: true,
                    allData: null,
                    currentPath: '/',
                    selectedCategory: null,
                    showCategoryDropdown: false,
                    showSortDropdown: false,
                    pageTitle: config.title,
                    pageDescription: config.description,
                    showTree: config.showTree,
                    showBreadcrumb: config.showBreadcrumb,
                    searchQuery: '',
                    sortOrder: 'date', // 'name', 'size', 'date' (默认按日期)
                    sortAsc: false, // 默认时间倒序（最新在前）
                    currentPage: 1,
                    itemsPerPage: 20
                    ,
                    isMobile: false
                };
            },
            computed: {
                // 所有分类（由文件的 category 字段自动推导）
                categories() {
                    const set = new Set();
                    (this.allData?.children || []).forEach(item => {
                        if (item.type === 'file' && item.category) set.add(item.category);
                    });
                    return Array.from(set).sort((a, b) => a.localeCompare(b));
                },
                // 所有文件扁平列表
                allFiles() {
                    return (this.allData?.children || []).filter(item => item.type === 'file');
                },
                // 当前显示的文件：默认显示所有文件，选中分类后只显示该分类文件
                currentItems() {
                    if (!this.allData) return [];
                    if (this.selectedCategory) {
                        return this.allFiles.filter(f => f.category === this.selectedCategory);
                    }
                    return this.allFiles;
                },
                filteredItems() {
                    if (!this.currentItems) return [];
                    let items = [...this.currentItems];

                    // 搜索过滤
                    if (this.searchQuery.trim()) {
                        const query = this.searchQuery.toLowerCase().trim();
                        items = items.filter(item => item.name.toLowerCase().includes(query));
                    }

                    // 排序
                    items.sort((a, b) => {
                        let aVal, bVal;

                        switch (this.sortOrder) {
                            case 'name':
                                aVal = a.name.toLowerCase();
                                bVal = b.name.toLowerCase();
                                break;
                            case 'size':
                                aVal = a.size || 0;
                                bVal = b.size || 0;
                                break;
                            case 'date':
                                aVal = a.date ? new Date(a.date).getTime() : 0;
                                bVal = b.date ? new Date(b.date).getTime() : 0;
                                break;
                            default:
                                aVal = a.name.toLowerCase();
                                bVal = b.name.toLowerCase();
                        }

                        if (aVal < bVal) return this.sortAsc ? -1 : 1;
                        if (aVal > bVal) return this.sortAsc ? 1 : -1;
                        return 0;
                    });

                    return items;
                },
                paginatedItems() {
                    const start = (this.currentPage - 1) * this.itemsPerPage;
                    const end = start + this.itemsPerPage;
                    return this.filteredItems.slice(start, end);
                },
                totalPages() {
                    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
                },
                // 左侧树（现在为分类列表）
                filteredTreeItems() {
                    if (!this.allData || !this.showTree) return [];
                    const map = new Map();
                    (this.allData.children || []).forEach(item => {
                        if (item.type !== 'file') return;
                        const cat = item.category || '未分类';
                        if (!map.has(cat)) map.set(cat, { name: cat, count: 0 });
                        map.get(cat).count++;
                    });
                    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
                },
                breadcrumb() {
                    if (!this.showBreadcrumb || !this.selectedCategory) return [];
                    return [{ name: this.selectedCategory, path: '/' + this.selectedCategory }];
                },
                treeItems() {
                    // 兼容旧接口（若需要）
                    if (!this.allData || !this.showTree) return [];
                    return this.filteredTreeItems.map(i => ({ name: i.name }));
                }
            },
            methods: {
                async loadData() {
                    try {
                        this.loading = true;
                        const response = await fetch(config.dataUrl);
                        this.allData = await response.json();
                    } catch (error) {
                        console.error('加载数据失败:', error);
                        this.showError('无法加载文件列表，请检查数据文件。');
                    } finally {
                        this.loading = false;
                    }
                },
                enterDirectory(item) {
                    if (item.type !== 'directory') return;
                    if (this.currentPath === '/') {
                        this.currentPath = '/' + item.name;
                    } else {
                        this.currentPath += '/' + item.name;
                    }
                    this.currentPage = 1;
                },
                selectCategory(categoryName) {
                    this.selectedCategory = categoryName;
                    this.currentPage = 1;
                    this.showCategoryDropdown = false;
                },
                selectSort(option) {
                    switch (option) {
                        case 'date_desc':
                            this.sortOrder = 'date';
                            this.sortAsc = false;
                            break;
                        case 'date_asc':
                            this.sortOrder = 'date';
                            this.sortAsc = true;
                            break;
                        case 'name_asc':
                            this.sortOrder = 'name';
                            this.sortAsc = true;
                            break;
                        case 'name_desc':
                            this.sortOrder = 'name';
                            this.sortAsc = false;
                            break;
                        case 'size_asc':
                            this.sortOrder = 'size';
                            this.sortAsc = true;
                            break;
                        case 'size_desc':
                            this.sortOrder = 'size';
                            this.sortAsc = false;
                            break;
                        default:
                            this.sortOrder = 'date';
                            this.sortAsc = false;
                    }
                    this.currentPage = 1;
                    this.showSortDropdown = false;
                },
                clearCategory() {
                    this.selectedCategory = null;
                    this.currentPage = 1;
                    this.showCategoryDropdown = false;
                },
                handleDocumentClick(e) {
                    // 点击页面任意位置，若不在下拉或切换按钮内，则关闭下拉
                    try {
                        const ctrlCat = document.querySelector('.category-control');
                        const ctrlSort = document.querySelector('.sort-control');
                        if (ctrlCat && (!e.target.closest || !e.target.closest('.category-control'))) {
                            this.showCategoryDropdown = false;
                        }
                        if (ctrlSort && (!e.target.closest || !e.target.closest('.sort-control'))) {
                            this.showSortDropdown = false;
                        }
                    } catch (err) {
                        // 忽略
                    }
                },
                goToPath(path) {
                    if (!path || path === '/') {
                        this.goToRoot();
                        return;
                    }
                    const parts = path.split('/').filter(p => p);
                    this.selectedCategory = parts.length ? parts[0] : null;
                    this.currentPage = 1;
                },
                goToRoot() {
                    this.selectedCategory = null;
                    this.currentPage = 1;
                },
                onTreeItemClick(item) {
                    this.selectCategory(item.name);
                },
                onSearch() {
                    // 搜索功能已经通过计算属性filteredItems实现
                    this.currentPage = 1;
                },
                sortByName() {
                    this.toggleSort('name');
                },
                sortBySize() {
                    this.toggleSort('size');
                },
                sortByDate() {
                    this.toggleSort('date');
                },
                toggleSortDirection() {
                    this.sortAsc = !this.sortAsc;
                    this.currentPage = 1;
                },
                // 新的统一表头排序切换方法
                toggleSort(column) {
                    // 默认方向：name -> A→Z (asc = true), size -> 大→小 (desc = false), date -> 最新优先 (desc = false)
                    const defaults = { name: true, size: false, date: false };
                    if (this.sortOrder === column) {
                        // 切换方向
                        this.sortAsc = !this.sortAsc;
                    } else {
                        this.sortOrder = column;
                        this.sortAsc = defaults[column] === undefined ? false : defaults[column];
                    }
                    this.currentPage = 1;
                },
                updateIsMobile() {
                    try {
                        this.isMobile = window.innerWidth <= 768;
                    } catch (e) {
                        this.isMobile = false;
                    }
                },
                getFileIcon(item) {
                    if (item.type === 'directory') {
                        return 'fa-solid fa-folder';
                    }
                    const ext = item.name.split('.').pop().toLowerCase();
                    const iconMap = {
                        pdf: 'fa-solid fa-file-pdf',
                        mp3: 'fa-solid fa-file-music',
                        mp4: 'fa-solid fa-file-video',
                        doc: 'fa-solid fa-file-word',
                        docx: 'fa-solid fa-file-word',
                        xls: 'fa-solid fa-file-excel',
                        xlsx: 'fa-solid fa-file-excel',
                        ppt: 'fa-solid fa-file-powerpoint',
                        pptx: 'fa-solid fa-file-powerpoint',
                        zip: 'fa-solid fa-file-archive',
                        rar: 'fa-solid fa-file-archive',
                        '7z': 'fa-solid fa-file-archive',
                        txt: 'fa-solid fa-file-alt',
                        md: 'fa-solid fa-file-code',
                        json: 'fa-solid fa-file-code',
                        js: 'fa-solid fa-file-code',
                        html: 'fa-solid fa-file-code',
                        css: 'fa-solid fa-file-code',
                        exe: 'fa-solid fa-file-code',
                        dmg: 'fa-solid fa-compact-disc',
                        iso: 'fa-solid fa-compact-disc'
                    };
                    return iconMap[ext] || 'fa-solid fa-file';
                },
                getFileIconColor(item){
                    if (!item || !item.name) return null;
                    const ext = (item.name.split('.').pop() || '').toLowerCase();
                    const colorMap = {
                        pdf: 'rgb(225, 29, 24)',
                        doc: 'rgb(116, 192, 252)',
                        docx: 'rgb(116, 192, 252)',
                        xls: 'rgb(34, 177, 76)',
                        xlsx: 'rgb(34, 177, 76)',
                        ppt: 'rgb(255, 140, 0)',
                        pptx: 'rgb(255, 140, 0)',
                        zip: 'rgb(170, 85, 255)',
                        rar: 'rgb(170, 85, 255)',
                        '7z': 'rgb(170, 85, 255)',
                        mp3: 'rgb(15, 164, 234)',
                        mp4: 'rgb(170, 85, 255)',
                        json: 'rgb(120, 120, 120)',
                        js: 'rgb(226, 233, 14)',
                        html: 'rgb(14, 179, 121)',
                        css: 'rgb(120, 120, 120)',
                        md: 'rgb(13, 171, 206)',
                        txt: 'rgb(13, 139, 11)'
                    };
                    return colorMap[ext] || null;
                },
                getTreeIcon(item) {
                    // 左侧为分类，始终显示文件夹图标
                    return 'fa-solid fa-folder';
                },
                formatSize(bytes) {
                    if (bytes === undefined || bytes === null) return '-';
                    if (bytes === 0) return '0 B';
                    const k = 1024;
                    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                },
                formatDate(dateStr) {
                    if (!dateStr) return '-';
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('zh-CN');
                },
                downloadFile(item) {
                    if (item.url) {
                        window.open(item.url, '_blank');
                    } else {
                        this.showError('文件链接无效');
                    }
                },
                changePage(page) {
                    this.currentPage = page;
                },
                showError(message) {
                    alert(message);
                }
            },
            mounted() {
                this.loadData();
                // 响应式：初始检查并监听窗口尺寸变化
                this.updateIsMobile();
                window.addEventListener('resize', this.updateIsMobile);
                // 用于点击外部时关闭分类下拉
                window.addEventListener('click', this.handleDocumentClick);
            },
            beforeUnmount() {
                window.removeEventListener('click', this.handleDocumentClick);
                window.removeEventListener('resize', this.updateIsMobile);
            }
        });
        
        app.mount(selector);
    }
};

// 全局可用
window.FileBrowser = FileBrowser;