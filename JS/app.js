const { createApp } = Vue;

createApp(
    {
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
            }

        },
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
//-----------------------            上面是最近更新文件的吧部分，下面是更新日志展示部分-------------------------------
            async loadChangelog(){
                try{
                    const response = await fetch('/Log/Changelog.md');
                    const markdown = await response.text();
                    this.changelogRaw = markdown;
                    this.changelogHtml = marked.parse(markdown);
                } catch(error){console.error('加载失败',error)

                } finally{
                    this.changelogLoading =false;
                }

            } 
//---------------------------------截至2026年3月17日，写到了这里，这里的前端展示更新日志的功能还没实现，也就是loadChangelog还没写完）
        },
        mounted(){
            this.sortByDateDesc();
        }
    }
).mount('#app');
