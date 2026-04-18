const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';

let packagesData = [];
let groupedPackages = {};
let currentCountry = null;

// Pricing constants
const EXCHANGE_RATE_HUF = 380; // Example: 1 USD = 380 HUF
const PROFIT_MARGIN = 1.6; // We apply a 60% margin on top of the base cost

// Translations
const translations = {
    en: {
        "nav-title": "eSIM Connect",
        "hero-title": "Stay Connected Anywhere",
        "hero-subtitle": "Instant eSIM delivery. No physical SIM needed. Get online in minutes in over 190 countries.",
        "destination-title": "Choose Your Destination",
        "search-input": "Search countries...",
        "back-btn-text": "Back to Destinations",
        "how-it-works-title": "How it Works",
        "step1-title": "1. Choose a Plan",
        "step1-desc": "Select your destination and the data package that fits your needs.",
        "step2-title": "2. Scan QR Code",
        "step2-desc": "Receive a QR code via email and scan it with your phone.",
        "step3-title": "3. Stay Connected",
        "step3-desc": "Turn on your eSIM and enjoy internet access anywhere.",
        "cart-title": "Your Cart",
        "empty-cart-text": "Your cart is empty.",
        "total-text": "Total:",
        "checkout-btn-text": "Checkout",
        "checkout-modal-title": "Complete Purchase",
        "email-label": "Email Address (for QR Code)",
        "final-total-text": "Final Total:",
        "pay-btn-text": "Pay Now",
        "success-title": "Payment Successful!",
        "success-desc": "Your eSIM QR code has been sent to your email. Check your inbox to get started.",
        "packages-suffix": "Packages",
        "add-to-cart": "Add to Cart",
        "days": "Days",
        "unlimited-data": "Unlimited Data",
        "unknown-data": "Unknown Data"
    },
    hu: {
        "nav-title": "eSIM Kapcsolat",
        "hero-title": "Maradj kapcsolatban bárhol",
        "hero-subtitle": "Azonnali eSIM kézbesítés. Nincs szükség fizikai SIM-re. Perc alatt online 190+ országban.",
        "destination-title": "Válassz Úticélt",
        "search-input": "Országok keresése...",
        "back-btn-text": "Vissza az úticélokhoz",
        "how-it-works-title": "Hogyan működik",
        "step1-title": "1. Válassz csomagot",
        "step1-desc": "Válaszd ki az úticélt és a megfelelő adatcsomagot.",
        "step2-title": "2. Szkenneld a QR kódot",
        "step2-desc": "Kapni fogsz egy QR kódot e-mailben, amit csak le kell szkennelned.",
        "step3-title": "3. Maradj online",
        "step3-desc": "Kapcsold be az eSIM-et és élvezd az internetet bárhol.",
        "cart-title": "Kosarad",
        "empty-cart-text": "A kosarad üres.",
        "total-text": "Összesen:",
        "checkout-btn-text": "Fizetés",
        "checkout-modal-title": "Vásárlás befejezése",
        "email-label": "E-mail cím (a QR kódhoz)",
        "final-total-text": "Végösszeg:",
        "pay-btn-text": "Fizetés Most",
        "success-title": "Sikeres Fizetés!",
        "success-desc": "Az eSIM QR kódot elküldtük az e-mail címedre.",
        "packages-suffix": "csomagok",
        "add-to-cart": "Kosárba",
        "days": "Nap",
        "unlimited-data": "Korlátlan Adat",
        "unknown-data": "Ismeretlen Adat"
    },
    de: {
        "nav-title": "eSIM Connect",
        "hero-title": "Überall verbunden bleiben",
        "hero-subtitle": "Sofortige eSIM-Lieferung. Keine physische SIM erforderlich.",
        "destination-title": "Wählen Sie Ihr Reiseziel",
        "search-input": "Länder suchen...",
        "back-btn-text": "Zurück zu den Reisezielen",
        "how-it-works-title": "Wie es funktioniert",
        "step1-title": "1. Plan wählen",
        "step1-desc": "Wählen Sie Ihr Ziel und das passende Datenpaket.",
        "step2-title": "2. QR-Code scannen",
        "step2-desc": "Erhalten Sie einen QR-Code per E-Mail und scannen Sie ihn.",
        "step3-title": "3. Verbunden bleiben",
        "step3-desc": "Aktivieren Sie Ihre eSIM und surfen Sie überall.",
        "cart-title": "Ihr Warenkorb",
        "empty-cart-text": "Ihr Warenkorb ist leer.",
        "total-text": "Gesamt:",
        "checkout-btn-text": "Zur Kasse",
        "checkout-modal-title": "Kauf abschließen",
        "email-label": "E-Mail (für QR-Code)",
        "final-total-text": "Endbetrag:",
        "pay-btn-text": "Jetzt bezahlen",
        "success-title": "Zahlung erfolgreich!",
        "success-desc": "Ihr eSIM QR-Code wurde an Ihre E-Mail gesendet.",
        "packages-suffix": "Pakete",
        "add-to-cart": "In den Warenkorb",
        "days": "Tage",
        "unlimited-data": "Unbegrenztes Datenvolumen",
        "unknown-data": "Unbekannt"
    },
    fr: {
        "nav-title": "eSIM Connect",
        "hero-title": "Restez connecté partout",
        "hero-subtitle": "Livraison eSIM instantanée. Aucune SIM physique nécessaire.",
        "destination-title": "Choisissez votre destination",
        "search-input": "Rechercher des pays...",
        "back-btn-text": "Retour aux destinations",
        "how-it-works-title": "Comment ça marche",
        "step1-title": "1. Choisissez un forfait",
        "step1-desc": "Sélectionnez votre destination et le forfait de données.",
        "step2-title": "2. Scannez le code QR",
        "step2-desc": "Recevez un code QR par e-mail et scannez-le.",
        "step3-title": "3. Restez connecté",
        "step3-desc": "Activez votre eSIM et profitez d'Internet partout.",
        "cart-title": "Votre Panier",
        "empty-cart-text": "Votre panier est vide.",
        "total-text": "Total :",
        "checkout-btn-text": "Payer",
        "checkout-modal-title": "Finaliser l'achat",
        "email-label": "Adresse e-mail (pour le code QR)",
        "final-total-text": "Total final :",
        "pay-btn-text": "Payer maintenant",
        "success-title": "Paiement réussi !",
        "success-desc": "Votre code QR eSIM a été envoyé à votre adresse e-mail.",
        "packages-suffix": "Forfaits",
        "add-to-cart": "Ajouter au panier",
        "days": "Jours",
        "unlimited-data": "Données illimitées",
        "unknown-data": "Inconnu"
    },
    es: {
        "nav-title": "eSIM Connect",
        "hero-title": "Mantente conectado en cualquier lugar",
        "hero-subtitle": "Entrega instantánea de eSIM. No se necesita SIM física.",
        "destination-title": "Elige tu destino",
        "search-input": "Buscar países...",
        "back-btn-text": "Volver a destinos",
        "how-it-works-title": "Cómo funciona",
        "step1-title": "1. Elige un plan",
        "step1-desc": "Selecciona tu destino y el paquete de datos.",
        "step2-title": "2. Escanea el código QR",
        "step2-desc": "Recibe un código QR por correo electrónico y escanéalo.",
        "step3-title": "3. Mantente conectado",
        "step3-desc": "Activa tu eSIM y disfruta de internet en cualquier lugar.",
        "cart-title": "Tu carrito",
        "empty-cart-text": "Tu carrito está vacío.",
        "total-text": "Total:",
        "checkout-btn-text": "Pagar",
        "checkout-modal-title": "Completar compra",
        "email-label": "Correo electrónico (para código QR)",
        "final-total-text": "Total final:",
        "pay-btn-text": "Pagar ahora",
        "success-title": "¡Pago exitoso!",
        "success-desc": "Tu código QR de eSIM ha sido enviado a tu correo.",
        "packages-suffix": "Paquetes",
        "add-to-cart": "Añadir",
        "days": "Días",
        "unlimited-data": "Datos ilimitados",
        "unknown-data": "Desconocido"
    }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', async () => {
    await detectUserLanguage();
    initApp();
    setupLanguageSelector();
});

async function detectUserLanguage() {
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/country.json');
        const data = await response.json();

        if (data && data.country) {
            // Map some country codes to our supported languages
            const langMap = {
                'HU': 'hu',
                'DE': 'de', 'AT': 'de', 'CH': 'de',
                'FR': 'fr', 'BE': 'fr',
                'ES': 'es', 'MX': 'es', 'AR': 'es'
            };

            if (langMap[data.countryCode]) {
                currentLang = langMap[data.countryCode];
            }
        }
    } catch(e) {
        console.log("Could not detect IP, defaulting to English");
    }

    document.getElementById('language-selector').value = currentLang;
    applyTranslations();
}

function setupLanguageSelector() {
    document.getElementById('language-selector').addEventListener('change', (e) => {
        currentLang = e.target.value;
        applyTranslations();

        // Re-render packages if currently showing
        if (currentCountry) {
            showPackagesForLocation(currentCountry);
        }
    });
}

function applyTranslations() {
    const t = translations[currentLang];

    // Update simple text elements
    const elementsToUpdate = [
        'nav-title', 'hero-title', 'hero-subtitle', 'destination-title',
        'back-btn-text', 'how-it-works-title', 'step1-title', 'step1-desc',
        'step2-title', 'step2-desc', 'step3-title', 'step3-desc',
        'cart-title', 'empty-cart-text', 'total-text', 'checkout-btn-text',
        'checkout-modal-title', 'email-label', 'final-total-text', 'pay-btn-text',
        'success-title', 'success-desc'
    ];

    elementsToUpdate.forEach(id => {
        const el = document.getElementById(id);
        if (el && t[id]) {
            // Special handling if the element has icons inside we want to preserve
            // In our HTML, most text is purely text inside the spans or headers
            if(el.children.length > 0 && el.tagName === 'BUTTON') {
                // E.g., back-btn-text is inside a span
                el.innerHTML = el.innerHTML; // keep as is, we use specific spans for text usually
            } else {
                el.innerText = t[id];
            }
        }
    });

    // Handle spans specifically
    const spanTextIds = ['back-btn-text', 'checkout-btn-text', 'pay-btn-text'];
    spanTextIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && t[id]) {
            el.innerText = t[id];
        }
    });

    // Update placeholders
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t['search-input'];

    // Update dynamically rendered sections if needed
    if (currentCountry) {
        const titleEl = document.getElementById('selected-country-title');
        if(titleEl) {
            titleEl.innerText = `${currentCountry} ${t['packages-suffix']}`;
        }
    }
}

function t(key) {
    return translations[currentLang][key] || key;
}

async function initApp() {
    showLoading(true);
    await fetchPackages();
    showLoading(false);
    renderCountries();

    // Setup search
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderCountries(e.target.value);
    });

    // Back button
    document.getElementById('back-to-countries').addEventListener('click', () => {
        document.getElementById('packages-section').classList.add('hidden');
        document.getElementById('countries-grid').classList.remove('hidden');
        document.getElementById('search-input').parentElement.classList.remove('hidden');
        document.getElementById('destination-title').style.display = 'block';
    });
}

function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

async function fetchPackages() {
    try {
        // Fetch statically generated packages.json
        // This file is updated periodically by a GitHub Actions workflow
        // to securely fetch from the live API without exposing the secret key in the browser.
        const response = await fetch('packages.json');
        const data = await response.json();

        if (data && data.success && data.obj && data.obj.packageList) {
            packagesData = data.obj.packageList;
            groupPackagesByLocation();
        } else {
            console.error('Failed to parse packages data:', data);
        }
    } catch (error) {
        console.error('Error in fetchPackages:', error);
    }
}

function groupPackagesByLocation() {
    groupedPackages = {};
    packagesData.forEach(pkg => {
        const loc = pkg.locationName || pkg.location || "Global";
        if (!groupedPackages[loc]) {
            groupedPackages[loc] = {
                locationName: loc,
                locationCode: pkg.locationCode || 'UNKNOWN',
                packages: []
            };
        }
        groupedPackages[loc].packages.push(pkg);
    });
}

function renderCountries(searchTerm = '') {
    const grid = document.getElementById('countries-grid');
    grid.innerHTML = '';

    const term = searchTerm.toLowerCase();
    const sortedLocations = Object.values(groupedPackages).sort((a, b) => a.locationName.localeCompare(b.locationName));

    sortedLocations.forEach(location => {
        if (location.locationName.toLowerCase().includes(term)) {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-blue-300';

            // Try to extract an image from the packages if available
            let imgHtml = '<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500"><i class="fas fa-map-marker-alt text-2xl"></i></div>';

            // Many eSIM apis provide locationNetworkList with logos
            if(location.packages[0] && location.packages[0].locationNetworkList && location.packages[0].locationNetworkList[0] && location.packages[0].locationNetworkList[0].locationLogo) {
               // Assuming the logo might be a relative path from the api provider, but usually we just use the API domain or a generic flag
               // Let's use a flag icon api for simplicity if we have a valid 2-letter location code
               if(location.locationCode && location.locationCode.length === 2 && location.locationCode !== 'UNKNOWN') {
                   imgHtml = `<img src="https://flagcdn.com/w80/${location.locationCode.toLowerCase()}.png" alt="${location.locationName}" class="w-16 h-16 object-cover rounded-full mb-4 shadow-sm">`;
               }
            } else if(location.locationCode && location.locationCode.length === 2 && location.locationCode !== 'UNKNOWN') {
                imgHtml = `<img src="https://flagcdn.com/w80/${location.locationCode.toLowerCase()}.png" alt="${location.locationName}" class="w-16 h-16 object-cover rounded-full mb-4 shadow-sm">`;
            }

            card.innerHTML = `
                ${imgHtml}
                <h3 class="text-lg font-semibold text-gray-800">${location.locationName}</h3>
                <p class="text-sm text-gray-500 mt-1">${location.packages.length} Packages</p>
            `;

            card.addEventListener('click', () => {
                showPackagesForLocation(location.locationName);
            });

            grid.appendChild(card);
        }
    });
}

function calculatePriceHUF(basePriceUSD_cents) {
    // API returns price in cents or tiny units (e.g., 18000 for $1.8)
    // Wait, let's look at the data: price: 18000, retailPrice: 36000. currencyCode: "USD".
    // Usually 10000 = $1.00 in these APIs. So 18000 = $1.80.
    const priceUSD = basePriceUSD_cents / 10000;

    // Calculate our selling price
    const priceHUF = priceUSD * EXCHANGE_RATE_HUF * PROFIT_MARGIN;

    // Round to a nice number (e.g., nearest 90 or nearest 100)
    return Math.ceil(priceHUF / 100) * 100 - 10; // Ends in 90, e.g., 1490 HUF
}

function formatBytes(bytes, decimals = 0) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function showPackagesForLocation(locationName) {
    currentCountry = locationName;
    const locationData = groupedPackages[locationName];

    document.getElementById('countries-grid').classList.add('hidden');
    document.getElementById('search-input').parentElement.classList.add('hidden');
    document.getElementById('destination-title').style.display = 'none';

    document.getElementById('packages-section').classList.remove('hidden');

    document.getElementById('selected-country-title').innerText = `${locationName} ${t('packages-suffix')}`;

    const grid = document.getElementById('packages-grid');
    grid.innerHTML = '';

    // Sort packages by price
    const sortedPackages = [...locationData.packages].sort((a, b) => a.price - b.price);

    sortedPackages.forEach(pkg => {
        const sellingPriceHUF = calculatePriceHUF(pkg.price);
        const dataVolume = pkg.volume ? formatBytes(pkg.volume) : (pkg.dataType === 2 ? t('unlimited-data') : t('unknown-data'));
        const durationText = pkg.duration ? `${pkg.duration} ${t('days')}` : '';

        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col';

        card.innerHTML = `
            <div class="bg-blue-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg text-gray-800">${dataVolume}</h4>
                    <p class="text-sm text-gray-500">${durationText}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold text-xl text-blue-600">${sellingPriceHUF.toLocaleString('hu-HU')} HUF</div>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between">
                <ul class="text-sm text-gray-600 space-y-2 mb-6">
                    <li class="flex items-start"><i class="fas fa-check text-green-500 mt-1 mr-2"></i> ${pkg.name}</li>
                    <li class="flex items-start"><i class="fas fa-network-wired text-blue-500 mt-1 mr-2"></i> Networks: ${pkg.speed || '4G/5G'}</li>
                    ${pkg.fupPolicy ? `<li class="flex items-start"><i class="fas fa-info-circle text-blue-500 mt-1 mr-2"></i> FUP: ${pkg.fupPolicy}</li>` : ''}
                </ul>
                <button class="add-to-cart-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors" data-pkg='${JSON.stringify({id: pkg.packageCode, name: pkg.name, price: sellingPriceHUF, location: locationName, volume: dataVolume, duration: durationText}).replace(/'/g, "&apos;")}'>
                    ${t('add-to-cart')}
                </button>
            </div>
        `;

        grid.appendChild(card);
    });

    // Re-attach cart event listeners (will implement in next step)
    attachCartListeners();
}

let cart = [];

function attachCartListeners() {
    const btns = document.querySelectorAll('.add-to-cart-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pkgData = JSON.parse(e.currentTarget.getAttribute('data-pkg'));
            addToCart(pkgData);
        });
    });
}

function addToCart(pkg) {
    cart.push(pkg);
    updateCartUI();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-button');
    const finalTotalEl = document.getElementById('final-total-amount');

    countEl.innerText = cart.length;

    if (cart.length === 0) {
        itemsEl.innerHTML = `<p class="text-gray-500 text-center mt-10" id="empty-cart-text">${t('empty-cart-text')}</p>`;
        totalEl.innerText = '0 HUF';
        finalTotalEl.innerText = '0 HUF';
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    let total = 0;
    itemsEl.innerHTML = '';

    cart.forEach((item, index) => {
        total += item.price;
        const itemEl = document.createElement('div');
        itemEl.className = 'flex justify-between items-center py-3 border-b border-gray-100';
        itemEl.innerHTML = `
            <div class="flex-1 pr-2">
                <h4 class="text-sm font-bold text-gray-800">${item.location} - ${item.volume}</h4>
                <p class="text-xs text-gray-500">${item.duration}</p>
                <div class="text-sm font-semibold text-blue-600 mt-1">${item.price.toLocaleString('hu-HU')} HUF</div>
            </div>
            <button class="text-red-500 hover:text-red-700 focus:outline-none remove-item-btn" data-index="${index}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        itemsEl.appendChild(itemEl);
    });

    totalEl.innerText = `${total.toLocaleString('hu-HU')} HUF`;
    finalTotalEl.innerText = `${total.toLocaleString('hu-HU')} HUF`;

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'));
            removeFromCart(idx);
        });
    });
}

function openCart() {
    document.getElementById('cart-sidebar').classList.remove('translate-x-full');
    document.getElementById('cart-overlay').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.add('translate-x-full');
    document.getElementById('cart-overlay').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function openCheckoutModal() {
    closeCart();
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('modal-active');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('modal-active');
}

function openSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('modal-active');
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('modal-active');
}

// Setup Cart Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cart-button').addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    document.getElementById('checkout-button').addEventListener('click', openCheckoutModal);

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', () => {
            closeCheckoutModal();
            closeSuccessModal();
        });
    });

    document.getElementById('close-success-btn').addEventListener('click', closeSuccessModal);

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email').value;
        if (!emailInput) return;

        // Mock payment processing
        const btn = document.querySelector('#checkout-form button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        btn.disabled = true;

        // Generate a mock eSIM profile and QR code
        const mockEsimId = Math.random().toString(36).substring(2, 10);
        const mockEsimString = `LPA:1$esim.test$${mockEsimId}`;
        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(mockEsimString)}`;

        try {
            // Send email using Brevo API
            // SECURITY WARNING: Do not put your Brevo API key directly in client-side code!
            // Doing so allows anyone to steal your key and send spam from your account.
            // Because this is a static site on GitHub Pages, you must create a small backend
            // (like a Cloudflare Worker, Netlify Function, or a simple Node.js/Python server)
            // that holds your API key securely. The frontend should call your secure server,
            // which then calls Brevo.
            //
            // Example of what the frontend call to your secure backend should look like:
            // const response = await fetch('https://your-secure-backend.com/send-email', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: emailInput, qrUrl: qrUrl })
            // });

            console.log("Mocking email send to:", emailInput, "with QR:", qrUrl);
            console.log("To make this live, deploy the provided Python script to a backend server.");

            // To simulate the network delay
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (err) {
            console.error("Failed to send email:", err);
        }

        setTimeout(() => {
            // Reset state
            btn.innerHTML = originalText;
            btn.disabled = false;

            // Clear cart
            cart = [];
            updateCartUI();

            // Show success
            closeCheckoutModal();
            openSuccessModal();
            document.getElementById('checkout-form').reset();
        }, 1500);
    });
});
