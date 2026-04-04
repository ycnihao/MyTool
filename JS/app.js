const { createApp } = Vue;

const app = createApp(
    {
        //--------------------------------------
        data(){
            return{
                files: [
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
                        url:'https://lw-sycdn.kuwo.cn/edc956c5277e7702bc19072d1fc74ef5/69c5f1b9/resource/30106/trackmedia/M500000wkEN20F4DXa.mp3',
                        date:'2026-03-27',
                        size:'2.58MB',
                        type:'mp3'
                    }
                ],
                sortOrder: 'date-desc',
                changelogHtml:'',
                changelogRaw:'',
                changelogLoading:false,
                changelogSections:[],
                devlineHtml:'',
                devlineRaw:'',
                devlineLoading:false,
                changelogEntries:[],
                currentChangelogPage:1,
                changelogItemsPerPage:3,
            }

        },

        //----------------------------------
        methods:{
            refreshFiles(){
                console.log('刷新文件列表');
            },
            sortByDateDesc(){
                this.files.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.sortOrder = 'date-desc';
            },
            formatDate(dateStr){
                const date = new Date(dateStr);
                return date.toLocaleDateString('zh-CN');
            },
            getFileIcon(file){
                const icons = {
                    'pdf': 'fa-solid fa-file-pdf',
                    'mp3': 'fa-solid fa-music',
                    'doc': 'fa-solid fa-file-word',
                    'mp4': 'fa-solid fa-file-video',
                    'docx':'fa-solid fa-file-word',
                    'md':'fa-brands fa-markdown',
                    'tex':'fa-brands fa-tex',
                    'xlsx':'fa-solid fa-file-excel',
                    'pptx':'fa-solid fa-file-powerpoint'
                };
                const iconAnimations ={
                    'pdf':'fa-beat-fade',
                    'mp3':'fa-shake',
                    'default':''
                };
                const baseicons = icons[file.type] || 'fa-solid fa-file';
                const basemoves = iconAnimations[file.type] || iconAnimations.default;


                return `${baseicons} ${basemoves}`.trim();
            },
            getIconColor(file){
                const iconColors ={
                    'pdf':'rgb(221, 17, 17)',
                    'mp3':'rgb(251, 162, 10)',
                    'doc':'rgb(34, 115, 245)',
                    'xlsx':'rgb(7, 222, 89)',
                    'mp4':'rgb(118, 22, 227)',
                    'md':'rgb(65, 131, 182)',
                    'pptx':'rgb(233, 92, 11)',
                    'tex':'rgb(101, 205, 197)',
                    'docx':'rgb(34, 110, 245)',
                };
                return iconColors[file.type]|| 'rgb(108,117,125)';
            },
            initMermaid() {
                if (typeof mermaid !== 'undefined') {
                    mermaid.initialize({
                        startOnLoad: true,
                        theme: 'default',
                        securityLevel: 'loose'
                    });
                    

                    mermaid.init(undefined, '.markdown-content pre code.language-mermaid');
                }
            },
            //-----------------------            上面是最近更新文件的吧部分，下面是更新日志展示部分-------------------------------
            
            parseChangelogEntries(markdown) {
                    
                    const entries = markdown.split('## ');
                    
                    
                    const parsedEntries = entries
                        .filter(entry => entry.trim())
                        .map((entry, index) => {
                            const lines = entry.split('\n');
                            const titleLine = lines[0];
                            const content = lines.slice(1).join('\n').trim();
                            
                            // 提取版本号（例如从 "1.0.4 - 2026年 3月27日" 中提取 "1.0.4"）
                            const versionMatch = titleLine.match(/^(\d+\.\d+\.\d+)/);
                            const version = versionMatch ? versionMatch[1] : '0.0.0';
                            
                            // 提取日期（例如从 "1.0.4 - 2026年 3月27日" 中提取日期部分）
                            const dateMatch = titleLine.match(/(\d{4}年\s*\d{1,2}月\d{1,2}日)/);
                            const dateStr = dateMatch ? dateMatch[1] : '';
                            
                            return {
                                id: index + 1,
                                title: titleLine,
                                content: content,
                                version: version,
                                dateStr: dateStr,
                                // 生成HTML（添加回##前缀）
                                html: marked.parse('## ' + entry)
                            };
                        });
                    
                    // 按版本号从高到低排序（新到旧）
                    this.changelogEntries = parsedEntries.sort((a, b) => {
                        // 比较版本号，例如 1.0.4 > 1.0.3
                        const versionA = a.version.split('.').map(Number);
                        const versionB = b.version.split('.').map(Number);
                        
                        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
                            const partA = versionA[i] || 0;
                            const partB = versionB[i] || 0;
                            if (partA !== partB) {
                                return partB - partA; // 降序排序
                            }
                        }
                        return 0;
                    });
                    
                    console.log('解析并排序后的日志条目:', this.changelogEntries);
            },
                
            // 切换页码
            changeChangelogPage(pageNum) {
                this.currentChangelogPage = pageNum;
                    // 可以在这里添加滚动到顶部的逻辑
                const changelogElement = document.querySelector('.changelog-viewer');
                if (changelogElement) {
                    window.scrollTo({
                        top: changelogElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            },

            async loadReadme(){
                try{
                    const response = await fetch('./README.md');
                    const markdown = await response.text();
                    this.devlineRaw = markdown;
                    this.devlineHtml = marked.parse(markdown);
                    this.$nextTick(() => {
                        this.initMermaid();
                    });

                } catch(error){console.error('加载失败',error)

                } finally{
                    this.devlineLoading =false;
                }

            },
            async loadchangelog(){
                try{
                    const response = await fetch('../Log/Changelog_simple.md');
                    const markdown = await response.text();
                    this.changelogRaw = markdown;
                    this.parseChangelogEntries(markdown);
                    this.changelogHtml = marked.parse(markdown);
                }catch(error){
                    console.error('加载失败',error)
                }finally{
                    this.changelogLoading =false;
                }
            },
        },


        computed:{
            paginatedChangelog(){
                const start = (this.currentChangelogPage - 1) * this.changelogItemsPerPage;
                const end = start + this.changelogItemsPerPage;
                return this.changelogEntries.slice(start,end);
            },
            totalChangelogPages(){
                return Math.ceil(this.changelogEntries.length / this.changelogItemsPerPage);
            }
        },

        //---------------------------
        mounted(){
            this.sortByDateDesc();
            this.loadReadme();
            this.loadchangelog();
        }

    }
);
app.component('paginate', VuejsPaginateNext);
app.mount('#app');
