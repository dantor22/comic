class APIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async getAvailableComics() {
        try {
            const response = await fetch(`${this.baseURL}/api/comics`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.log('Using local mode - API not available');
            return [];
        }
    }
}

const apiClient = new APIClient();

async function loadComicsFromServer() {
    const comics = await apiClient.getAvailableComics();
    if (window.comicReader && comics.length > 0) {
        window.comicReader.availableComics = comics;
        window.comicReader.renderComicsList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadComicsFromServer, 500);
});