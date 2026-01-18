/**
 * ArtFlow CRM - Data Store Module
 * Gestione localStorage e operazioni CRUD
 */

const Store = (() => {
    const STORAGE_KEY = 'artflow_artworks';

    // Dati di esempio - Artisti contemporanei italiani
    const sampleData = [
        {
            id: 'art_001',
            title: 'Combustione Plastica',
            artist: 'Alberto Burri',
            year: 1958,
            price: 850000,
            status: 'available',
            createdAt: Date.now()
        },
        {
            id: 'art_002',
            title: 'Concetto Spaziale - Attese',
            artist: 'Lucio Fontana',
            year: 1965,
            price: 1200000,
            status: 'sold',
            createdAt: Date.now()
        },
        {
            id: 'art_003',
            title: 'Grande Sacco',
            artist: 'Alberto Burri',
            year: 1952,
            price: 720000,
            status: 'loan',
            createdAt: Date.now()
        },
        {
            id: 'art_004',
            title: 'Achrome',
            artist: 'Piero Manzoni',
            year: 1959,
            price: 450000,
            status: 'available',
            createdAt: Date.now()
        },
        {
            id: 'art_005',
            title: 'Senza Titolo (Mappa)',
            artist: 'Alighiero Boetti',
            year: 1984,
            price: 680000,
            status: 'loan',
            createdAt: Date.now()
        }
    ];

    /**
     * Genera un ID univoco
     * @returns {string} - ID univoco
     */
    const generateId = () => {
        return 'art_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    /**
     * Ottiene tutte le opere dal localStorage
     * @returns {Array} - Array di opere
     */
    const getAll = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Errore lettura localStorage:', error);
            return [];
        }
    };

    /**
     * Salva tutte le opere nel localStorage
     * @param {Array} artworks - Array di opere
     */
    const saveAll = (artworks) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
        } catch (error) {
            console.error('Errore scrittura localStorage:', error);
        }
    };

    /**
     * Ottiene un'opera per ID
     * @param {string} id - ID dell'opera
     * @returns {Object|null} - Opera trovata o null
     */
    const getById = (id) => {
        const artworks = getAll();
        return artworks.find(a => a.id === id) || null;
    };

    /**
     * Aggiunge una nuova opera
     * @param {Object} artwork - Dati dell'opera
     * @returns {Object} - Opera creata
     */
    const add = (artwork) => {
        const artworks = getAll();
        const newArtwork = {
            id: generateId(),
            ...artwork,
            createdAt: Date.now()
        };
        artworks.push(newArtwork);
        saveAll(artworks);
        return newArtwork;
    };

    /**
     * Aggiorna un'opera esistente
     * @param {string} id - ID dell'opera
     * @param {Object} updates - Dati da aggiornare
     * @returns {Object|null} - Opera aggiornata o null
     */
    const update = (id, updates) => {
        const artworks = getAll();
        const index = artworks.findIndex(a => a.id === id);
        
        if (index !== -1) {
            artworks[index] = {
                ...artworks[index],
                ...updates,
                updatedAt: Date.now()
            };
            saveAll(artworks);
            return artworks[index];
        }
        return null;
    };

    /**
     * Elimina un'opera
     * @param {string} id - ID dell'opera
     * @returns {boolean} - True se eliminata
     */
    const remove = (id) => {
        const artworks = getAll();
        const filtered = artworks.filter(a => a.id !== id);
        
        if (filtered.length !== artworks.length) {
            saveAll(filtered);
            return true;
        }
        return false;
    };

    /**
     * Cerca opere per query
     * @param {string} query - Termine di ricerca
     * @returns {Array} - Opere filtrate
     */
    const search = (query) => {
        const artworks = getAll();
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) return artworks;
        
        return artworks.filter(a => 
            a.title.toLowerCase().includes(lowerQuery) ||
            a.artist.toLowerCase().includes(lowerQuery) ||
            a.year.toString().includes(lowerQuery)
        );
    };

    /**
     * Ottiene le statistiche dell'inventario
     * @returns {Object} - Statistiche
     */
    const getStats = () => {
        const artworks = getAll();
        
        return {
            total: artworks.length,
            totalValue: artworks.reduce((sum, a) => sum + (a.price || 0), 0),
            onLoan: artworks.filter(a => a.status === 'loan').length,
            available: artworks.filter(a => a.status === 'available').length,
            sold: artworks.filter(a => a.status === 'sold').length
        };
    };

    /**
     * Inizializza lo store con dati di esempio se vuoto
     */
    const init = () => {
        const artworks = getAll();
        
        if (artworks.length === 0) {
            console.log('🎨 Inizializzazione con dati di esempio...');
            saveAll(sampleData);
        }
    };

    /**
     * Resetta lo store ai dati di esempio
     */
    const reset = () => {
        saveAll(sampleData);
    };

    // Public API
    return {
        getAll,
        getById,
        add,
        update,
        remove,
        search,
        getStats,
        init,
        reset
    };
})();