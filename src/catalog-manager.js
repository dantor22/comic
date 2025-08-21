class CatalogManager {
    constructor() {
        this.catalogData = null;
        this.defaultComic = null;
    }

    async loadCatalog() {
        try {
            const response = await fetch('/catalog/catalog.json');
            if (response.ok) {
                this.catalogData = await response.json();
                this.defaultComic = this.catalogData.comics.find(comic => comic.isDefault);
                return this.catalogData;
            }
        } catch (error) {
            console.log('No se pudo cargar el catálogo:', error);
        }
        return null;
    }

    async loadDefaultComic() {
        if (!this.defaultComic) {
            await this.loadCatalog();
        }

        if (this.defaultComic) {
            try {
                const response = await fetch(`/catalog/${this.defaultComic.filename}`);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const typedarray = new Uint8Array(arrayBuffer);
                    
                    return {
                        name: this.defaultComic.title,
                        filename: this.defaultComic.filename,
                        data: typedarray,
                        isFromCatalog: true,
                        catalogInfo: this.defaultComic
                    };
                }
            } catch (error) {
                console.error('Error cargando PDF predeterminado:', error);
            }
        }
        return null;
    }

    async loadComicFromCatalog(comicId) {
        if (!this.catalogData) {
            await this.loadCatalog();
        }

        const comic = this.catalogData?.comics.find(c => c.id === comicId);
        if (!comic) return null;

        try {
            const response = await fetch(`/catalog/${comic.filename}`);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const typedarray = new Uint8Array(arrayBuffer);
                
                return {
                    name: comic.title,
                    filename: comic.filename,
                    data: typedarray,
                    isFromCatalog: true,
                    catalogInfo: comic
                };
            }
        } catch (error) {
            console.error('Error cargando PDF del catálogo:', error);
        }
        return null;
    }

    getCatalogComics() {
        return this.catalogData?.comics || [];
    }

    renderCatalogGrid(container) {
        if (!this.catalogData || !container) return;

        container.innerHTML = `
            <div class="catalog-header">
                <h3>📚 Catálogo de Comics</h3>
                <p>Selecciona una historieta para comenzar a leer</p>
            </div>
            <div class="catalog-grid">
                ${this.catalogData.comics.map(comic => `
                    <div class="catalog-item" data-comic-id="${comic.id}">
                        <div class="catalog-cover">
                            <div class="catalog-icon">📖</div>
                            <div class="catalog-title">${comic.title}</div>
                        </div>
                        <div class="catalog-info">
                            <div class="catalog-author">${comic.author || 'Autor desconocido'}</div>
                            ${comic.description ? `<div class="catalog-description">${comic.description}</div>` : ''}
                        </div>
                        ${comic.isDefault ? '<div class="default-badge">Por defecto</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        // Agregar event listeners
        container.querySelectorAll('.catalog-item').forEach(item => {
            item.addEventListener('click', async () => {
                const comicId = item.dataset.comicId;
                const comic = await this.loadComicFromCatalog(comicId);
                if (comic && window.comicReader) {
                    await window.comicReader.loadPDFFromData(comic);
                    if (window.comicReader.elements.sidebar) {
                        window.comicReader.closeSidebarMenu();
                    }
                }
            });
        });
    }
}

// Instancia global
window.catalogManager = new CatalogManager();