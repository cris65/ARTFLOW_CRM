/**
 * ArtFlow CRM - Main Application Module
 * Logica UI e gestione eventi
 */

const App = (() => {
    // Riferimenti DOM
    let elements = {};
    let currentEditId = null;

    /**
     * Inizializza i riferimenti agli elementi DOM
     */
    const cacheDOM = () => {
        elements = {
            // Dashboard
            statTotal: document.getElementById('statTotal'),
            statValue: document.getElementById('statValue'),
            statLoan: document.getElementById('statLoan'),
            
            // Table
            tableBody: document.getElementById('artworksTableBody'),
            emptyStateTable: document.getElementById('emptyStateTable'),
            
            // Mobile Cards
            cardsContainer: document.getElementById('artworksCardsContainer'),
            emptyStateMobile: document.getElementById('emptyStateMobile'),
            
            // Search
            searchInput: document.getElementById('searchInput'),
            
            // Modal
            artworkModal: document.getElementById('artworkModal'),
            artworkForm: document.getElementById('artworkForm'),
            artworkId: document.getElementById('artworkId'),
            artworkTitle: document.getElementById('artworkTitle'),
            artworkArtist: document.getElementById('artworkArtist'),
            artworkYear: document.getElementById('artworkYear'),
            artworkPrice: document.getElementById('artworkPrice'),
            artworkStatus: document.getElementById('artworkStatus'),
            modalTitle: document.getElementById('artworkModalLabel'),
            btnSave: document.getElementById('btnSaveArtwork'),
            btnAddNew: document.getElementById('btnAddNew'),
            
            // Delete Modal
            deleteModal: document.getElementById('deleteModal'),
            deleteArtworkId: document.getElementById('deleteArtworkId'),
            btnConfirmDelete: document.getElementById('btnConfirmDelete'),
            
            // Toast
            toast: document.getElementById('toastNotification'),
            toastMessage: document.getElementById('toastMessage'),
            
            // Language
            langDropdown: document.querySelectorAll('[data-lang]')
        };
    };

    /**
     * Formatta un numero come valuta Euro
     * @param {number} value - Valore numerico
     * @returns {string} - Stringa formattata
     */
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    /**
     * Ottiene la classe CSS per lo stato
     * @param {string} status - Stato dell'opera
     * @returns {string} - Nome classe CSS
     */
    const getStatusClass = (status) => {
        const classes = {
            available: 'status-available',
            sold: 'status-sold',
            loan: 'status-loan'
        };
        return classes[status] || 'status-available';
    };

    /**
     * Ottiene il testo tradotto per lo stato
     * @param {string} status - Stato dell'opera
     * @returns {string} - Testo tradotto
     */
    const getStatusText = (status) => {
        const keys = {
            available: 'statusAvailable',
            sold: 'statusSold',
            loan: 'statusLoan'
        };
        return I18n.t(keys[status] || 'statusAvailable');
    };

    /**
     * Aggiorna le statistiche dashboard
     */
    const updateDashboard = () => {
        const stats = Store.getStats();
        
        elements.statTotal.textContent = stats.total;
        elements.statValue.textContent = formatCurrency(stats.totalValue);
        elements.statLoan.textContent = stats.onLoan;
    };

    /**
     * Renderizza la tabella delle opere (Desktop)
     * @param {Array} artworks - Array di opere
     */
    const renderTable = (artworks) => {
        if (artworks.length === 0) {
            elements.tableBody.innerHTML = '';
            elements.emptyStateTable.classList.remove('d-none');
            return;
        }

        elements.emptyStateTable.classList.add('d-none');
        
        elements.tableBody.innerHTML = artworks.map(artwork => `
            <tr data-id="${artwork.id}">
                <td>
                    <div class="artwork-title">${escapeHtml(artwork.title)}</div>
                </td>
                <td>
                    <div class="artwork-artist">${escapeHtml(artwork.artist)}</div>
                </td>
                <td>${artwork.year}</td>
                <td>
                    <span class="artwork-price">${formatCurrency(artwork.price)}</span>
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(artwork.status)}">
                        ${getStatusText(artwork.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="App.editArtwork('${artwork.id}')" title="Modifica">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="App.confirmDelete('${artwork.id}')" title="Elimina">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    /**
     * Renderizza le card delle opere (Mobile)
     * @param {Array} artworks - Array di opere
     */
    const renderCards = (artworks) => {
        if (artworks.length === 0) {
            elements.cardsContainer.innerHTML = '';
            elements.emptyStateMobile.classList.remove('d-none');
            return;
        }

        elements.emptyStateMobile.classList.add('d-none');
        
        elements.cardsContainer.innerHTML = artworks.map(artwork => `
            <div class="col-12 col-sm-6">
                <div class="artwork-card" data-id="${artwork.id}">
                    <div class="artwork-card-image">
                        <i class="bi bi-image"></i>
                        <div class="artwork-card-status">
                            <span class="status-badge ${getStatusClass(artwork.status)}">
                                ${getStatusText(artwork.status)}
                            </span>
                        </div>
                    </div>
                    <div class="artwork-card-body">
                        <h5 class="artwork-card-title">${escapeHtml(artwork.title)}</h5>
                        <p class="artwork-card-artist">${escapeHtml(artwork.artist)}</p>
                        <div class="artwork-card-details">
                            <span class="artwork-card-year">
                                <i class="bi bi-calendar3 me-1"></i>${artwork.year}
                            </span>
                            <span class="artwork-card-price">${formatCurrency(artwork.price)}</span>
                        </div>
                    </div>
                    <div class="artwork-card-actions">
                        <button class="btn btn-outline-gold btn-sm" onclick="App.editArtwork('${artwork.id}')">
                            <i class="bi bi-pencil me-1"></i>${I18n.t('modalTitleEdit').split(' ')[0]}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="App.confirmDelete('${artwork.id}')">
                            <i class="bi bi-trash me-1"></i>${I18n.t('btnDelete')}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    /**
     * Renderizza tutte le opere
     * @param {Array} artworks - Array di opere (opzionale)
     */
    const render = (artworks = null) => {
        const data = artworks || Store.getAll();
        updateDashboard();
        renderTable(data);
        renderCards(data);
    };

    /**
     * Gestisce la ricerca
     */
    const handleSearch = () => {
        const query = elements.searchInput.value;
        const results = Store.search(query);
        renderTable(results);
        renderCards(results);
    };

    /**
     * Resetta il form del modal
     */
    const resetForm = () => {
        elements.artworkForm.reset();
        elements.artworkId.value = '';
        currentEditId = null;
        elements.modalTitle.textContent = I18n.t('modalTitleAdd');
    };

    /**
     * Popola il form per la modifica
     * @param {Object} artwork - Dati dell'opera
     */
    const populateForm = (artwork) => {
        elements.artworkId.value = artwork.id;
        elements.artworkTitle.value = artwork.title;
        elements.artworkArtist.value = artwork.artist;
        elements.artworkYear.value = artwork.year;
        elements.artworkPrice.value = artwork.price;
        elements.artworkStatus.value = artwork.status;
        elements.modalTitle.textContent = I18n.t('modalTitleEdit');
        currentEditId = artwork.id;
    };

    /**
     * Mostra un toast di notifica
     * @param {string} message - Messaggio
     * @param {string} type - Tipo (success, danger)
     */
    const showToast = (message, type = 'success') => {
        elements.toastMessage.textContent = message;
        elements.toast.className = `toast align-items-center text-bg-${type} border-0`;
        
        const toast = new bootstrap.Toast(elements.toast);
        toast.show();
    };

    /**
     * Salva l'opera (create o update)
     */
    const saveArtwork = () => {
        // Validazione
        if (!elements.artworkForm.checkValidity()) {
            elements.artworkForm.reportValidity();
            return;
        }

        const artworkData = {
            title: elements.artworkTitle.value.trim(),
            artist: elements.artworkArtist.value.trim(),
            year: parseInt(elements.artworkYear.value),
            price: parseFloat(elements.artworkPrice.value),
            status: elements.artworkStatus.value
        };

        if (currentEditId) {
            // Update
            Store.update(currentEditId, artworkData);
            showToast(I18n.t('toastUpdated'));
        } else {
            // Create
            Store.add(artworkData);
            showToast(I18n.t('toastAdded'));
        }

        // Chiudi modal e aggiorna UI
        bootstrap.Modal.getInstance(elements.artworkModal).hide();
        render();
    };

    /**
     * Apre il modal per modificare un'opera
     * @param {string} id - ID dell'opera
     */
    const editArtwork = (id) => {
        const artwork = Store.getById(id);
        if (artwork) {
            populateForm(artwork);
            new bootstrap.Modal(elements.artworkModal).show();
        }
    };

    /**
     * Mostra il modal di conferma eliminazione
     * @param {string} id - ID dell'opera
     */
    const confirmDelete = (id) => {
        elements.deleteArtworkId.value = id;
        new bootstrap.Modal(elements.deleteModal).show();
    };

    /**
     * Elimina l'opera
     */
    const deleteArtwork = () => {
        const id = elements.deleteArtworkId.value;
        if (id) {
            Store.remove(id);
            bootstrap.Modal.getInstance(elements.deleteModal).hide();
            showToast(I18n.t('toastDeleted'));
            render();
        }
    };

    /**
     * Escape HTML per prevenire XSS
     * @param {string} text - Testo da escapare
     * @returns {string} - Testo escapato
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * Collega gli event listener
     */
    const bindEvents = () => {
        // Ricerca
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

        // Salva opera
        elements.btnSave.addEventListener('click', saveArtwork);

        // Reset form quando si apre per nuovo inserimento
        elements.btnAddNew.addEventListener('click', resetForm);

        // Reset form quando si chiude il modal
        elements.artworkModal.addEventListener('hidden.bs.modal', resetForm);

        // Conferma eliminazione
        elements.btnConfirmDelete.addEventListener('click', deleteArtwork);

        // Cambio lingua
        elements.langDropdown.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.currentTarget.getAttribute('data-lang');
                I18n.setLanguage(lang);
                render(); // Re-render per aggiornare i testi dinamici
            });
        });

        // Submit form con Enter
        elements.artworkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveArtwork();
        });
    };

    /**
     * Debounce utility
     * @param {Function} func - Funzione da debouncare
     * @param {number} wait - Millisecondi di attesa
     * @returns {Function} - Funzione debounced
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Inizializza l'applicazione
     */
    const init = () => {
        console.log('🎨 ArtFlow CRM - Inizializzazione...');
        
        // Inizializza lo store con dati di esempio
        Store.init();
        
        // Cache elementi DOM
        cacheDOM();
        
        // Inizializza i18n
        I18n.init();
        
        // Collega eventi
        bindEvents();
        
        // Render iniziale
        render();
        
        console.log('✅ ArtFlow CRM - Pronto!');
    };

    // Esponi metodi pubblici
    return {
        init,
        editArtwork,
        confirmDelete,
        render
    };
})();

// Avvia l'app quando il DOM è pronto
document.addEventListener('DOMContentLoaded', App.init);