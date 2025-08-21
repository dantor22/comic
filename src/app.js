pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class ComicReader {
    constructor() {
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.0;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentPDF = null;
        this.availableComics = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadAvailableComics();
    }

    initializeElements() {
        this.elements = {
            comicsList: document.getElementById('comicsList'),
            comicTitle: document.getElementById('comicTitle'),
            pageNum: document.getElementById('pageNum'),
            pageCount: document.getElementById('pageCount'),
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            zoomIn: document.getElementById('zoomIn'),
            zoomOut: document.getElementById('zoomOut'),
            zoomLevel: document.getElementById('zoomLevel'),
            fitPage: document.getElementById('fitPage'),
            fullscreen: document.getElementById('fullscreen'),
            fileInput: document.getElementById('fileInput'),
            searchInput: document.getElementById('searchInput'),
            sidebar: document.querySelector('.sidebar'),
            menuBtn: document.getElementById('menuBtn'),
            toggleSidebar: document.getElementById('toggleSidebar'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            canvasContainer: document.getElementById('canvasContainer'),
            navLeft: document.getElementById('navLeft'),
            navRight: document.getElementById('navRight')
        };
    }

    attachEventListeners() {
        this.elements.prevPage.addEventListener('click', () => this.onPrevPage());
        this.elements.nextPage.addEventListener('click', () => this.onNextPage());
        this.elements.zoomIn.addEventListener('click', () => this.adjustZoom(0.2));
        this.elements.zoomOut.addEventListener('click', () => this.adjustZoom(-0.2));
        this.elements.fitPage.addEventListener('click', () => this.fitToPage());
        this.elements.fullscreen.addEventListener('click', () => this.toggleFullscreen());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.searchInput.addEventListener('input', (e) => this.filterComics(e.target.value));
        
        this.elements.pageNum.addEventListener('change', (e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= this.pdfDoc.numPages) {
                this.pageNum = page;
                this.queueRenderPage(page);
            }
        });

        this.elements.menuBtn.addEventListener('click', () => this.toggleSidebar());
        this.elements.toggleSidebar.addEventListener('click', () => this.toggleSidebar());

        this.elements.navLeft.addEventListener('click', () => this.onPrevPage());
        this.elements.navRight.addEventListener('click', () => this.onNextPage());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    async loadAvailableComics() {
        // En Netlify no podemos listar archivos del servidor
        // Los comics se cargan desde archivos locales del usuario
        this.availableComics = [];
        
        // Cargar comics guardados en localStorage
        const savedComics = localStorage.getItem('savedComics');
        if (savedComics) {
            this.availableComics = JSON.parse(savedComics);
        }
        
        this.renderComicsList();
    }

    renderComicsList() {
        this.elements.comicsList.innerHTML = '';
        
        if (this.availableComics.length === 0) {
            this.elements.comicsList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <p>No hay historietas disponibles</p>
                    <p style="margin-top: 10px; font-size: 12px;">Carga un PDF usando el botón de abajo</p>
                </div>
            `;
            return;
        }

        this.availableComics.forEach((comic, index) => {
            const comicItem = document.createElement('div');
            comicItem.className = 'comic-item';
            comicItem.innerHTML = `
                <span class="comic-item-icon">📖</span>
                <span class="comic-item-name">${comic.name.replace('.pdf', '')}</span>
            `;
            comicItem.addEventListener('click', (e) => this.loadSavedComic(comic, e.currentTarget));
            this.elements.comicsList.appendChild(comicItem);
        });
    }

    async loadSavedComic(comic, clickedElement = null) {
        // Convertir data de array a Uint8Array
        const comicToLoad = {
            ...comic,
            data: new Uint8Array(comic.data)
        };
        await this.loadPDFFromData(comicToLoad, clickedElement);
    }

    filterComics(searchTerm) {
        const items = this.elements.comicsList.querySelectorAll('.comic-item');
        items.forEach(item => {
            const name = item.querySelector('.comic-item-name').textContent.toLowerCase();
            if (name.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async loadComic(comic, clickedElement = null) {
        this.currentPDF = comic;
        this.elements.comicTitle.textContent = comic.name.replace('.pdf', '');
        this.elements.welcomeMessage.classList.add('hidden');
        
        document.querySelectorAll('.comic-item').forEach(item => {
            item.classList.remove('active');
        });
        if (clickedElement) {
            clickedElement.classList.add('active');
        }

        try {
            const loadingTask = pdfjsLib.getDocument(comic.path);
            this.pdfDoc = await loadingTask.promise;
            this.elements.pageCount.textContent = this.pdfDoc.numPages;
            this.elements.pageNum.max = this.pdfDoc.numPages;
            this.pageNum = 1;
            this.elements.pageNum.value = 1;
            this.renderPage(1);
            this.updateNavButtons();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error al cargar el PDF. Por favor, intenta con otro archivo.');
        }
    }

    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const typedarray = new Uint8Array(e.target.result);
                
                const newComic = {
                    name: file.name,
                    data: Array.from(typedarray), // Convertir a array para localStorage
                    lastOpened: Date.now()
                };
                
                // Verificar si ya existe
                const existingIndex = this.availableComics.findIndex(comic => comic.name === file.name);
                if (existingIndex >= 0) {
                    this.availableComics[existingIndex] = newComic;
                } else {
                    this.availableComics.push(newComic);
                }
                
                // Guardar en localStorage
                localStorage.setItem('savedComics', JSON.stringify(this.availableComics));
                this.renderComicsList();
                
                // Convertir de vuelta a Uint8Array para cargar
                const comicToLoad = {
                    ...newComic,
                    data: new Uint8Array(newComic.data)
                };
                
                await this.loadPDFFromData(comicToLoad);
            };
            fileReader.readAsArrayBuffer(file);
        }
    }

    async loadPDFFromData(comic, clickedElement = null) {
        this.currentPDF = comic;
        this.elements.comicTitle.textContent = comic.name.replace('.pdf', '');
        this.elements.welcomeMessage.classList.add('hidden');
        
        if (clickedElement) {
            document.querySelectorAll('.comic-item').forEach(item => {
                item.classList.remove('active');
            });
            clickedElement.classList.add('active');
        }

        try {
            const loadingTask = pdfjsLib.getDocument({ data: comic.data });
            this.pdfDoc = await loadingTask.promise;
            this.elements.pageCount.textContent = this.pdfDoc.numPages;
            this.elements.pageNum.max = this.pdfDoc.numPages;
            this.pageNum = 1;
            this.elements.pageNum.value = 1;
            this.renderPage(1);
            this.updateNavButtons();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error al cargar el PDF.');
        }
    }

    renderPage(num) {
        this.pageRendering = true;
        
        this.pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({ scale: this.scale });
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                this.pageRendering = false;
                if (this.pageNumPending !== null) {
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            });
        });

        this.elements.pageNum.value = num;
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    onPrevPage() {
        if (this.pageNum <= 1) {
            return;
        }
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
        this.updateNavButtons();
    }

    onNextPage() {
        if (!this.pdfDoc || this.pageNum >= this.pdfDoc.numPages) {
            return;
        }
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
        this.updateNavButtons();
    }

    updateNavButtons() {
        if (!this.pdfDoc) return;
        
        this.elements.prevPage.disabled = this.pageNum <= 1;
        this.elements.nextPage.disabled = this.pageNum >= this.pdfDoc.numPages;
    }

    adjustZoom(delta) {
        if (!this.pdfDoc) return;
        
        this.scale = Math.max(0.5, Math.min(3.0, this.scale + delta));
        this.elements.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        this.queueRenderPage(this.pageNum);
    }

    fitToPage() {
        if (!this.pdfDoc) return;
        
        this.pdfDoc.getPage(this.pageNum).then((page) => {
            const viewport = page.getViewport({ scale: 1.0 });
            const containerWidth = this.elements.canvasContainer.clientWidth - 40;
            const containerHeight = this.elements.canvasContainer.clientHeight - 40;
            
            const scaleX = containerWidth / viewport.width;
            const scaleY = containerHeight / viewport.height;
            
            this.scale = Math.min(scaleX, scaleY);
            this.elements.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
            this.queueRenderPage(this.pageNum);
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('collapsed');
    }

    handleKeyPress(e) {
        if (!this.pdfDoc) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.onPrevPage();
                break;
            case 'ArrowRight':
                this.onNextPage();
                break;
            case '+':
            case '=':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.adjustZoom(0.2);
                }
                break;
            case '-':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.adjustZoom(-0.2);
                }
                break;
            case '0':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.scale = 1.0;
                    this.elements.zoomLevel.textContent = '100%';
                    this.queueRenderPage(this.pageNum);
                }
                break;
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.fitToPage();
                }
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.comicReader = new ComicReader();
    
    // Load default PDF from catalog if available
    if (window.catalogManager) {
        const defaultComic = await window.catalogManager.loadDefaultComic();
        if (defaultComic) {
            await window.comicReader.loadPDFFromData(defaultComic);
        }
    }
});