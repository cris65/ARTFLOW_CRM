/**
 * ArtFlow CRM - Internationalization Module
 * Gestione multilingua IT/EN
 */

const I18n = (() => {
    // Traduzioni
    const translations = {
        it: {
            // Navbar
            addArtwork: "Nuova Opera",
            
            // Dashboard
            totalArtworks: "Opere Totali",
            totalValue: "Valore Inventario",
            onLoan: "In Prestito",
            
            // Search
            searchPlaceholder: "Cerca per titolo, artista...",
            
            // Table Headers
            thTitle: "Titolo",
            thArtist: "Artista",
            thYear: "Anno",
            thPrice: "Prezzo",
            thStatus: "Stato",
            thActions: "Azioni",
            
            // Status
            statusAvailable: "Disponibile",
            statusSold: "Venduto",
            statusLoan: "In Prestito",
            
            // Modal
            modalTitleAdd: "Aggiungi Opera",
            modalTitleEdit: "Modifica Opera",
            labelTitle: "Titolo",
            labelArtist: "Artista",
            labelYear: "Anno",
            labelPrice: "Prezzo (€)",
            labelStatus: "Stato",
            btnCancel: "Annulla",
            btnSave: "Salva",
            btnDelete: "Elimina",
            
            // Delete Modal
            deleteTitle: "Conferma Eliminazione",
            deleteConfirm: "Sei sicuro di voler eliminare questa opera?",
            
            // Empty State
            noArtworks: "Nessuna opera trovata",
            noArtworksDesc: "Inizia aggiungendo la tua prima opera d'arte",
            
            // Toast Messages
            toastAdded: "Opera aggiunta con successo!",
            toastUpdated: "Opera aggiornata con successo!",
            toastDeleted: "Opera eliminata con successo!",
            
            // Footer
            footerText: "Gestione Galleria d'Arte"
        },
        en: {
            // Navbar
            addArtwork: "New Artwork",
            
            // Dashboard
            totalArtworks: "Total Artworks",
            totalValue: "Inventory Value",
            onLoan: "On Loan",
            
            // Search
            searchPlaceholder: "Search by title, artist...",
            
            // Table Headers
            thTitle: "Title",
            thArtist: "Artist",
            thYear: "Year",
            thPrice: "Price",
            thStatus: "Status",
            thActions: "Actions",
            
            // Status
            statusAvailable: "Available",
            statusSold: "Sold",
            statusLoan: "On Loan",
            
            // Modal
            modalTitleAdd: "Add Artwork",
            modalTitleEdit: "Edit Artwork",
            labelTitle: "Title",
            labelArtist: "Artist",
            labelYear: "Year",
            labelPrice: "Price (€)",
            labelStatus: "Status",
            btnCancel: "Cancel",
            btnSave: "Save",
            btnDelete: "Delete",
            
            // Delete Modal
            deleteTitle: "Confirm Deletion",
            deleteConfirm: "Are you sure you want to delete this artwork?",
            
            // Empty State
            noArtworks: "No artworks found",
            noArtworksDesc: "Start by adding your first artwork",
            
            // Toast Messages
            toastAdded: "Artwork added successfully!",
            toastUpdated: "Artwork updated successfully!",
            toastDeleted: "Artwork deleted successfully!",
            
            // Footer
            footerText: "Art Gallery Management"
        }
    };

    // Lingua corrente
    let currentLang = localStorage.getItem('artflow_lang') || 'it';

    /**
     * Ottiene una traduzione per chiave
     * @param {string} key - Chiave di traduzione
     * @returns {string} - Testo tradotto
     */
    const t = (key) => {
        return translations[currentLang][key] || translations['it'][key] || key;
    };

    /**
     * Cambia la lingua dell'applicazione
     * @param {string} lang - Codice lingua ('it' o 'en')
     */
    const setLanguage = (lang) => {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem('artflow_lang', lang);
            applyTranslations();
            
            // Aggiorna il dropdown
            document.getElementById('currentLang').textContent = lang.toUpperCase();
        }
    };

    /**
     * Applica le traduzioni a tutti gli elementi con data-i18n
     */
    const applyTranslations = () => {
        // Elementi con testo
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        // Elementi con placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });

        // Aggiorna le opzioni del select status
        const statusSelect = document.getElementById('artworkStatus');
        if (statusSelect) {
            statusSelect.options[0].textContent = t('statusAvailable');
            statusSelect.options[1].textContent = t('statusSold');
            statusSelect.options[2].textContent = t('statusLoan');
        }
    };

    /**
     * Ottiene la lingua corrente
     * @returns {string} - Codice lingua corrente
     */
    const getCurrentLang = () => currentLang;

    /**
     * Inizializza il modulo i18n
     */
    const init = () => {
        applyTranslations();
        document.getElementById('currentLang').textContent = currentLang.toUpperCase();
    };

    // Public API
    return {
        t,
        setLanguage,
        applyTranslations,
        getCurrentLang,
        init
    };
})();