// Constants
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://your-backend-url.com') + '/api/v1/open/package/list';
const ACCESS_CODE = ''; // Proxied
const HUF_EXCHANGE_RATE = 360;
const PROFIT_MARGIN = 1.6;

// State
let packagesData = [];
let countriesMap = new Map();
let currentLang = 'hu';
let cart = JSON.parse(localStorage.getItem('esim_cart')) || [];

// Translations
const i18n = {
    'hu': {
        'heroTitle': 'Maradj Kapcsolatban Világszerte',
        'heroSubtitle': 'Azonnali eSIM kézbesítés. Nincs roaming díj. Válassz több mint 150 úti cél közül.',
        'btnExplore': 'Fedezd fel az Úti Célokat',
        'howItWorks': 'Hogyan működik',
        'step1Title': '1. Válassz Úti Célt',
        'step1Desc': 'Válaszd ki, hová utazol, és válaszd a legjobb adatcsomagot.',
        'step2Title': '2. Szkenneld be a QR kódot',
        'step2Desc': 'Kapd meg az eSIM-et azonnal e-mailben. Szkenneld be a telepítéshez.',
        'step3Title': '3. Kapcsolódj',
        'step3Desc': 'Kapcsold be az eSIM-et, amikor megérkezel, és élvezd az internetet.',
        'destTitle': 'Népszerű Úti Célok',
        'searchPlaceholder': 'Ország keresése...',
        'backToDest': 'Vissza az úti célokhoz',
        'networks': 'Elérhető hálózatok:',
        'data': 'Adat',
        'validity': 'Érvényesség',
        'days': 'Nap',
        'speed': 'Sebesség',
        'addToCart': 'Kosárba',
        'cartTitle': 'A te kosarad',
        'continueShopping': 'Vásárlás folytatása',
        'emptyCart': 'A kosarad üres.',
        'orderSummary': 'Rendelés összesítő',
        'subtotal': 'Részösszeg',
        'tax': 'Adó (0%)',
        'total': 'Fizetendő',
        'checkout': 'Biztonságos Fizetés',
        'checkoutNote': 'Ez egy bemutató. Valódi fizetés nem történik.',
        'footerDesc': 'A legokosabb módja, hogy globálisan kapcsolatban maradj.',
        'itemAdded': 'Termék a kosárba helyezve!'
    },
    'en': {
        'heroTitle': 'Stay Connected Worldwide',
        'heroSubtitle': 'Instant eSIM delivery. No roaming charges. Choose from over 150 destinations.',
        'btnExplore': 'Explore Destinations',
        'howItWorks': 'How it works',
        'step1Title': '1. Choose Destination',
        'step1Desc': 'Select where you are traveling and pick the best data plan.',
        'step2Title': '2. Scan QR Code',
        'step2Desc': 'Receive your eSIM instantly via email. Scan it to install.',
        'step3Title': '3. Get Connected',
        'step3Desc': 'Turn on your eSIM when you arrive and enjoy instant internet.',
        'destTitle': 'Popular Destinations',
        'searchPlaceholder': 'Search country...',
        'backToDest': 'Back to Destinations',
        'networks': 'Available networks:',
        'data': 'Data',
        'validity': 'Validity',
        'days': 'Days',
        'speed': 'Speed',
        'addToCart': 'Add to Cart',
        'cartTitle': 'Your Cart',
        'continueShopping': 'Continue Shopping',
        'emptyCart': 'Your cart is empty.',
        'orderSummary': 'Order Summary',
        'subtotal': 'Subtotal',
        'tax': 'Tax (0%)',
        'total': 'Total',
        'checkout': 'Secure Checkout',
        'checkoutNote': 'This is a demonstration. No real payments are processed.',
        'footerDesc': 'The smartest way to stay connected globally.',
        'itemAdded': 'Item added to cart!'
    },
    'de': {
        "heroTitle": "Bleiben Sie weltweit in Verbindung",
        "heroSubtitle": "Sofortige eSIM-Zustellung. Keine Roaming-Gebühren. Wählen Sie aus über 150 Reisezielen.",
        "btnExplore": "Reiseziele erkunden",
        "howItWorks": "Wie es funktioniert",
        "step1Title": "1. Ziel wählen",
        "step1Desc": "Wählen Sie Ihr Reiseziel und den besten Datentarif.",
        "step2Title": "2. QR-Code scannen",
        "step2Desc": "Erhalten Sie Ihre eSIM sofort per E-Mail. Scannen zum Installieren.",
        "step3Title": "3. Verbinden",
        "step3Desc": "Schalten Sie Ihre eSIM bei der Ankunft ein und genießen Sie das Internet.",
        "destTitle": "Beliebte Reiseziele",
        "searchPlaceholder": "Land suchen...",
        "backToDest": "Zurück zu den Zielen",
        "networks": "Verfügbare Netzwerke:",
        "data": "Daten",
        "validity": "Gültigkeit",
        "days": "Tage",
        "speed": "Geschwindigkeit",
        "addToCart": "In den Warenkorb",
        "cartTitle": "Ihr Warenkorb",
        "continueShopping": "Weiter einkaufen",
        "emptyCart": "Ihr Warenkorb ist leer.",
        "orderSummary": "Bestellübersicht",
        "subtotal": "Zwischensumme",
        "tax": "Steuer (0%)",
        "total": "Gesamt",
        "checkout": "Sichere Kasse",
        "checkoutNote": "Dies ist eine Demo. Es werden keine echten Zahlungen verarbeitet.",
        "footerDesc": "Der intelligenteste Weg, weltweit verbunden zu bleiben.",
        "itemAdded": "Artikel hinzugefügt!"
},
    'fr': {
        "heroTitle": "Restez connecté dans le monde entier",
        "heroSubtitle": "Livraison eSIM instantanée. Pas de frais d'itinérance. Choisissez parmi plus de 150 destinations.",
        "btnExplore": "Explorer les destinations",
        "howItWorks": "Comment ça marche",
        "step1Title": "1. Choisir la destination",
        "step1Desc": "Sélectionnez votre destination et le meilleur forfait de données.",
        "step2Title": "2. Scanner le code QR",
        "step2Desc": "Recevez votre eSIM instantanément par e-mail. Scannez pour installer.",
        "step3Title": "3. Se connecter",
        "step3Desc": "Activez votre eSIM à l'arrivée et profitez d'internet.",
        "destTitle": "Destinations populaires",
        "searchPlaceholder": "Rechercher un pays...",
        "backToDest": "Retour aux destinations",
        "networks": "Réseaux disponibles:",
        "data": "Données",
        "validity": "Validité",
        "days": "Jours",
        "speed": "Vitesse",
        "addToCart": "Ajouter au panier",
        "cartTitle": "Votre panier",
        "continueShopping": "Continuer vos achats",
        "emptyCart": "Votre panier est vide.",
        "orderSummary": "Résumé de la commande",
        "subtotal": "Sous-total",
        "tax": "Taxes (0%)",
        "total": "Total",
        "checkout": "Paiement sécurisé",
        "checkoutNote": "Ceci est une démo. Aucun paiement réel n'est traité.",
        "footerDesc": "La façon la plus intelligente de rester connecté.",
        "itemAdded": "Article ajouté!"
},
    'es': {
        "heroTitle": "Mantente conectado en todo el mundo",
        "heroSubtitle": "Entrega instantánea de eSIM. Sin cargos por roaming. Elige entre más de 150 destinos.",
        "btnExplore": "Explorar destinos",
        "howItWorks": "Cómo funciona",
        "step1Title": "1. Elegir destino",
        "step1Desc": "Selecciona a dónde viajas y elige el mejor plan de datos.",
        "step2Title": "2. Escanear código QR",
        "step2Desc": "Recibe tu eSIM al instante por correo electrónico. Escanea para instalar.",
        "step3Title": "3. Conectarse",
        "step3Desc": "Enciende tu eSIM cuando llegues y disfruta de internet.",
        "destTitle": "Destinos populares",
        "searchPlaceholder": "Buscar país...",
        "backToDest": "Volver a destinos",
        "networks": "Redes disponibles:",
        "data": "Datos",
        "validity": "Validez",
        "days": "Días",
        "speed": "Velocidad",
        "addToCart": "Añadir al carrito",
        "cartTitle": "Tu carrito",
        "continueShopping": "Seguir comprando",
        "emptyCart": "Tu carrito está vacío.",
        "orderSummary": "Resumen del pedido",
        "subtotal": "Subtotal",
        "tax": "Impuestos (0%)",
        "total": "Total",
        "checkout": "Pago seguro",
        "checkoutNote": "Esto es una demostración. No se procesan pagos reales.",
        "footerDesc": "La forma más inteligente de estar conectado.",
        "itemAdded": "Artículo añadido!"
},
    'it': {
        "heroTitle": "Resta connesso in tutto il mondo",
        "heroSubtitle": "Consegna istantanea della eSIM. Nessun costo di roaming. Scegli tra oltre 150 destinazioni.",
        "btnExplore": "Esplora destinazioni",
        "howItWorks": "Come funziona",
        "step1Title": "1. Scegli la destinazione",
        "step1Desc": "Seleziona dove viaggi e scegli il miglior piano dati.",
        "step2Title": "2. Scansiona il codice QR",
        "step2Desc": "Ricevi la tua eSIM istantaneamente via email. Scansiona per installare.",
        "step3Title": "3. Connettiti",
        "step3Desc": "Accendi la tua eSIM all'arrivo e goditi internet.",
        "destTitle": "Destinazioni popolari",
        "searchPlaceholder": "Cerca paese...",
        "backToDest": "Torna alle destinazioni",
        "networks": "Reti disponibili:",
        "data": "Dati",
        "validity": "Validità",
        "days": "Giorni",
        "speed": "Velocità",
        "addToCart": "Aggiungi al carrello",
        "cartTitle": "Il tuo carrello",
        "continueShopping": "Continua lo shopping",
        "emptyCart": "Il tuo carrello è vuoto.",
        "orderSummary": "Riepilogo ordine",
        "subtotal": "Subtotale",
        "tax": "Tasse (0%)",
        "total": "Totale",
        "checkout": "Pagamento sicuro",
        "checkoutNote": "Questa è una dimostrazione. Nessun pagamento reale viene elaborato.",
        "footerDesc": "Il modo più intelligente per restare connessi.",
        "itemAdded": "Articolo aggiunto!"
}

    // Other languages can be added similarly
};

// Initialize
async function initApp() {
    setupEventListeners();
    updateCartCount();
    autoSetLanguage();
    applyTranslations();
    await fetchPackages();
}

// Fetch data from API
async function fetchPackages() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-AccessCode': ACCESS_CODE
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (data.success && data.obj && data.obj.packageList) {
            packagesData = data.obj.packageList;
            processCountries(packagesData);
            document.getElementById('loading-countries').classList.add('hidden');
            document.getElementById('countries-grid').classList.remove('hidden');
            renderCountries();
        } else {
            console.error('API Error:', data.errorMessage);
            document.getElementById('loading-text').innerText = 'Hiba történt az adatok betöltésekor.';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        document.getElementById('loading-text').innerText = 'Hálózat hiba. Kérjük frissítse az oldalt.';
    }
}

function processCountries(packages) {
    countriesMap.clear();
    packages.forEach(pkg => {
        if (pkg.locationNetworkList && Array.isArray(pkg.locationNetworkList)) {
            pkg.locationNetworkList.forEach(loc => {
                if (!countriesMap.has(loc.locationCode)) {
                    // Use a reliable flag source
                    const flagUrl = `https://flagcdn.com/w80/${loc.locationCode.toLowerCase()}.png`;
                    countriesMap.set(loc.locationCode, {
                        code: loc.locationCode,
                        name: loc.locationName,
                        logo: flagUrl,
                        networks: loc.operatorList.map(op => op.operatorName).join(', '),
                        packages: []
                    });
                }
                // Avoid duplicates in the country's package list if needed, or just push
                const countryObj = countriesMap.get(loc.locationCode);
                if (!countryObj.packages.find(p => p.packageCode === pkg.packageCode)) {
                    countryObj.packages.push(pkg);
                }
            });
        }
    });

    countriesMap = new Map([...countriesMap.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)));
}

function calculatePriceHUF(apiPrice) {
    const priceInUSD = apiPrice / 10000;
    const finalPriceHUF = priceInUSD * HUF_EXCHANGE_RATE * PROFIT_MARGIN;
    return Math.ceil(finalPriceHUF / 100) * 100;
}

// Rendering UI
function renderCountries(searchTerm = '') {
    const grid = document.getElementById('countries-grid');
    grid.innerHTML = '';

    const term = searchTerm.toLowerCase();

    countriesMap.forEach((country, code) => {
        if (term && !country.name.toLowerCase().includes(term)) return;

        let descHtml = '';
        if (pkg.fupPolicy) {
            descHtml += `<p class="text-xs text-gray-500 mt-2"><i class="fa-solid fa-circle-info"></i> ${pkg.fupPolicy}</p>`;
        }

        const card = document.createElement('div');
        card.className = 'country-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer flex items-center';
        card.innerHTML = `
            <img src="${country.logo}" alt="${country.name} flag" class="w-10 h-auto rounded shadow-sm mr-4" onerror="this.src='https://via.placeholder.com/40x30?text=Flag'">
            <span class="font-semibold text-gray-800">${country.name}</span>
        `;

        card.addEventListener('click', () => showPackages(code));
        grid.appendChild(card);
    });
}

function showPackages(countryCode) {
    const country = countriesMap.get(countryCode);
    if (!country) return;

    // Switch views
    document.getElementById('view-home').classList.remove('active');
    document.getElementById('view-packages').classList.add('active');

    // Update Header
    document.getElementById('pkg-country-name').innerText = country.name;
    document.getElementById('pkg-country-flag').src = country.logo;
    let networkHtml = '';
    if (country.packages.length > 0 && country.packages[0].locationNetworkList && country.packages[0].locationNetworkList[0].operatorList) {
        networkHtml = country.packages[0].locationNetworkList[0].operatorList.map(op => `<span class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">${op.operatorName} (${op.networkType.join('/')})</span>`).join(' ');
    } else {
        networkHtml = `<span class="text-gray-600">${country.networks}</span>`;
    }
    document.getElementById('pkg-country-networks').innerHTML = `${i18n[currentLang].networks} <br> ${networkHtml}`;

    // Render Packages
    const grid = document.getElementById('packages-grid');
    grid.innerHTML = '';

    // Sort by price
    const sortedPackages = country.packages.sort((a, b) => a.price - b.price);

    sortedPackages.forEach(pkg => {
        const priceHUF = calculatePriceHUF(pkg.price);
        const dataAmount = pkg.volume >= 1073741824 ? `${(pkg.volume / 1073741824).toFixed(0)} GB` : `${(pkg.volume / 1048576).toFixed(0)} MB`;

        const card = document.createElement('div');
        card.className = 'package-card bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-gray-200 border';

        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${dataAmount}</h3>
                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">${pkg.duration} ${i18n[currentLang].days}</span>
                </div>
                <div class="space-y-2 mb-6">
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fa-solid fa-gauge-high w-5 text-gray-400"></i>
                        <span>${pkg.speed}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fa-solid fa-calendar-days w-5 text-gray-400"></i>
                        <span>${pkg.unusedValidTime} ${i18n[currentLang].days} ${i18n[currentLang].validity.toLowerCase()}</span>
                    </div>
                </div>
            </div>
            <div class="mt-auto">
                <div class="text-2xl font-extrabold text-gray-900 mb-4">${priceHUF.toLocaleString('hu-HU')} HUF</div>
                <button class="add-to-cart-btn w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" data-code="${pkg.packageCode}">
                    ${i18n[currentLang].addToCart}
                </button>
            </div>
        `;

        const btn = card.querySelector('.add-to-cart-btn');
        btn.addEventListener('click', () => addToCart(pkg, country, priceHUF));

        grid.appendChild(card);
    });
}

// Cart Logic
function addToCart(pkg, country, priceHUF) {
    const dataAmount = pkg.volume >= 1073741824 ? `${(pkg.volume / 1073741824).toFixed(0)} GB` : `${(pkg.volume / 1048576).toFixed(0)} MB`;

    cart.push({
        id: Date.now(),
        code: pkg.packageCode,
        countryName: country.name,
        data: dataAmount,
        duration: pkg.duration,
        price: priceHUF
    });

    saveCart();
    updateCartCount();
    showToast(i18n[currentLang].itemAdded);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
}

function saveCart() {
    localStorage.setItem('esim_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (cart.length > 0) {
        badge.innerText = cart.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-msg');

    container.innerHTML = '';

    if (cart.length === 0) {
        emptyMsg.classList.remove('hidden');
        document.getElementById('cart-subtotal').innerText = '0 HUF';
        document.getElementById('cart-total').innerText = '0 HUF';
        return;
    }

    emptyMsg.classList.add('hidden');
    let total = 0;

    cart.forEach(item => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'p-6 flex justify-between items-center';
        div.innerHTML = `
            <div>
                <h4 class="text-lg font-bold text-gray-800">${item.countryName} - ${item.data}</h4>
                <p class="text-sm text-gray-500">${item.duration} ${i18n[currentLang].days} validity</p>
            </div>
            <div class="flex items-center space-x-6">
                <span class="font-bold text-gray-900">${item.price.toLocaleString('hu-HU')} HUF</span>
                <button class="text-red-500 hover:text-red-700" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('cart-subtotal').innerText = `${total.toLocaleString('hu-HU')} HUF`;
    document.getElementById('cart-total').innerText = `${total.toLocaleString('hu-HU')} HUF`;
}

// Translations and Utilities
function autoSetLanguage() {
    // Simple mock logic for auto-detect based on browser language
    const lang = navigator.language.split('-')[0];
    if (i18n[lang]) {
        currentLang = lang;
        document.getElementById('lang-selector').value = lang;
    } else {
        currentLang = 'hu'; // Fallback to Hungarian as requested
        document.getElementById('lang-selector').value = 'hu';
    }
}

function applyTranslations() {
    const t = i18n[currentLang] || i18n['hu'];

    // Check if elements exist before setting innerText to avoid errors
    const els = {
        'hero-title': t.heroTitle,
        'hero-subtitle': t.heroSubtitle,
        'btn-explore': t.btnExplore,
        'how-it-works-title': t.howItWorks,
        'step1-title': t.step1Title,
        'step1-desc': t.step1Desc,
        'step2-title': t.step2Title,
        'step2-desc': t.step2Desc,
        'step3-title': t.step3Title,
        'step3-desc': t.step3Desc,
        'destinations-title': t.destTitle,
        'back-text': t.backToDest,
        'continue-shopping-text': t.continueShopping,
        'cart-title': t.cartTitle,
        'empty-cart-text': t.emptyCart,
        'summary-title': t.orderSummary,
        'summary-subtotal': t.subtotal,
        'summary-tax': t.tax,
        'summary-total-text': t.total,
        'btn-checkout-text': t.checkout,
        'checkout-note': t.checkoutNote,
        'footer-desc': t.footerDesc
    };

    for (const [id, text] of Object.entries(els)) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    const searchInput = document.getElementById('search-country');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Search
    document.getElementById('search-country').addEventListener('input', (e) => {
        renderCountries(e.target.value);
    });

    // Navigation
    document.getElementById('nav-logo').addEventListener('click', () => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    });

    document.getElementById('btn-back-home').addEventListener('click', () => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    });

    document.getElementById('btn-explore').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
    });

    // Cart Navigation
    document.getElementById('cart-btn').addEventListener('click', () => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-cart').classList.add('active');
        renderCart();
    });

    document.getElementById('btn-back-cart').addEventListener('click', () => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    });

    document.getElementById('btn-checkout').addEventListener('click', async () => {
        if (cart.length === 0) {
            alert('A kosarad üres / Your cart is empty!');
            return;
        }

        const emailInput = document.getElementById('checkout-email').value;
        const nameInput = document.getElementById('checkout-name').value;

        if (!emailInput || !nameInput) {
            alert('Kérjük, adja meg a nevét és e-mail címét! / Please provide your name and email!');
            return;
        }

        const originalBtnText = document.getElementById('btn-checkout-text').innerText;
        document.getElementById('btn-checkout-text').innerText = 'Feldolgozás... / Processing...';
        document.getElementById('btn-checkout').disabled = true;

        try {
            const orderItems = cart.map(item => ({
                countryName: item.countryName,
                data: item.data,
                duration: item.duration,
                durationUnit: 'DAY',
                dataType: 2,
                quantity: 1,
                logo: item.logo || 'https://img.icons8.com/color/80/000000/globe--v1.png'
            }));

            // Use the proxy endpoint. On Github Pages, this needs to point to where the backend is hosted.
            const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://your-backend-url.com';

            const response = await fetch(backendUrl + '/api/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderItems,
                    customerEmail: emailInput,
                    customerName: nameInput
                })
            });

            if (response.ok) {
                alert('Sikeres fizetés! A QR kódot elküldtük a megadott e-mail címre. / Successful payment! The QR code has been sent to your email.');
                cart = [];
                saveCart();
                updateCartCount();
                renderCart();
                document.getElementById('checkout-email').value = '';
                document.getElementById('checkout-name').value = '';
                document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
                document.getElementById('view-home').classList.add('active');
            } else {
                const errData = await response.json();
                console.error(errData);
                alert('Hiba történt az e-mail küldésekor. Kérjük, ellenőrizze az adatokat. / Error sending email.');
            }
        } catch (error) {
            console.error(error);
            alert('Hálózati hiba történt. / Network error occurred.');
        } finally {
            document.getElementById('btn-checkout-text').innerText = originalBtnText;
            document.getElementById('btn-checkout').disabled = false;
        }
    });

    // Language Change
    document.getElementById('lang-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        applyTranslations();
        // Re-render views if they are active to update dynamic buttons
        if (document.getElementById('view-packages').classList.contains('active')) {
            // Need to know current country to re-render, simple workaround is go home
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.getElementById('view-home').classList.add('active');
        }
        if (document.getElementById('view-cart').classList.contains('active')) {
            renderCart();
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
