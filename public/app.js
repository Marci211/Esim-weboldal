// Constants
const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
// TODO: Változtasd meg ezt a saját backend szervered URL-jére, ha Github Pages-re töltöd fel (pl. https://backend-szervered.onrender.com)
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'https://ide-kell-a-backend-url.com';
const ACCESS_CODE = 'c0685d58acac45dc953883ced2fe0a45';
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
    }
    // Other languages can be added similarly
};

// Initialize

async function initApp() {
    setupEventListeners();
    updateCartCount();
    await autoSetLanguage();
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
    document.getElementById('pkg-country-networks').innerText = `${i18n[currentLang].networks} ${country.networks}`;

    // Coverage & Operators Map setup
    const operatorsContainer = document.getElementById('coverage-map-container');
    const operatorsList = document.getElementById('operators-list');

    if (country.networks && country.networks.length > 0) {
        operatorsContainer.classList.remove('hidden');
        operatorsList.innerHTML = country.networks.split(', ').map(op =>
            `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                <i class="fa-solid fa-tower-cell mr-1"></i> ${op}
            </span>`
        ).join('');
    } else {
        operatorsContainer.classList.add('hidden');
    }

    // Render Packages
    const grid = document.getElementById('packages-grid');
    grid.innerHTML = '';

    if (country.packages.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-gray-500">Nincsenek elérhető csomagok ehhez az országhoz.</p>';
        return;
    }

    country.packages.forEach(pkg => {
        const isDaily = pkg.dataType === 2 || pkg.dataType === 3 || !!pkg.fupPolicy;
        let dataAmount = '';
        let fupDesc = '';

        if (pkg.volume >= 1073741824) {
            dataAmount = `${(pkg.volume / 1073741824).toFixed(0)} GB`;
        } else if (pkg.volume > 0) {
            dataAmount = `${(pkg.volume / 1048576).toFixed(0)} MB`;
        } else {
            dataAmount = "Korlátlan / Unlimited";
        }

        if (isDaily && pkg.fupPolicy) {
            dataAmount = `Napi / Daily ${dataAmount}`;
            fupDesc = `<div class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                <i class="fa-solid fa-circle-info"></i> FUP Limit: Napi keret elérése után a sebesség ${pkg.fupPolicy}-ra korlátozódik.
            </div>`;
        } else if (pkg.volume > 100000000000 || pkg.name.toLowerCase().includes('unlimited')) {
            dataAmount = "Korlátlan / Unlimited";
            fupDesc = `<div class="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                <i class="fa-solid fa-infinity"></i> Valódi korlátlan adatforgalom!
            </div>`;
        }

        const priceHUF = calculatePriceHUF(pkg.price);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden';

        const badge = isDaily ? `<div class="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">DAILY</div>` : '';

        card.innerHTML = `
            ${badge}
            <div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${dataAmount}</h3>
                <div class="flex items-center text-gray-500 mb-4">
                    <i class="fa-regular fa-clock mr-2"></i> <span>${pkg.duration} ${i18n[currentLang].days}</span>
                </div>
                ${fupDesc}
            </div>
            <div class="mt-6 flex items-end justify-between">
                <div>
                    <p class="text-xs text-gray-400 mb-1">Ár / Price</p>
                    <p class="text-2xl font-bold text-blue-600">${priceHUF.toLocaleString('hu-HU')} HUF</p>
                </div>
                <button class="add-to-cart-btn bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
                    <i class="fa-solid fa-cart-plus mr-1"></i> ${i18n[currentLang].addToCart}
                </button>
            </div>
        `;

        const btn = card.querySelector('.add-to-cart-btn');
        btn.addEventListener('click', () => addToCart(pkg, country, priceHUF, isDaily));

        grid.appendChild(card);
    });
}

// Cart Logic

function addToCart(pkg, country, priceHUF, isDaily) {
    let dataAmount = '';
    if (pkg.volume >= 1073741824) {
        dataAmount = `${(pkg.volume / 1073741824).toFixed(0)} GB`;
    } else if (pkg.volume > 0) {
        dataAmount = `${(pkg.volume / 1048576).toFixed(0)} MB`;
    } else {
        dataAmount = "Korlátlan / Unlimited";
    }
    if (isDaily && pkg.fupPolicy) {
        dataAmount = `Napi / Daily ${dataAmount}`;
    }

    const existingItem = cart.find(i => i.code === pkg.packageCode);
    if (existingItem && !isDaily) {
        existingItem.quantity += 1;
        existingItem.totalPrice += priceHUF;
    } else {
        cart.push({
            id: Date.now(),
            code: pkg.packageCode,
            countryName: country.name,
            logo: country.logo,
            data: dataAmount,
            duration: pkg.duration,
            price: priceHUF,
            totalPrice: priceHUF,
            quantity: 1,
            isDaily: isDaily
        });
    }

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
        total += item.totalPrice;
        const div = document.createElement('div');
        div.className = 'p-6 flex justify-between items-center';
        div.innerHTML = `
            <div>
                <h4 class="text-lg font-bold text-gray-800">${item.countryName} - ${item.data}</h4>
                <p class="text-sm text-gray-500">${item.duration} ${i18n[currentLang].days} validity ${item.quantity > 1 ? `| ${item.quantity} db` : ''}</p>
            </div>
            <div class="flex items-center space-x-6">
                <span class="font-bold text-gray-900">${item.totalPrice.toLocaleString('hu-HU')} HUF</span>
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

async function autoSetLanguage() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/config`);
        if (response.ok) {
            const data = await response.json();
            const lang = data.lang;
            if (i18n[lang]) {
                currentLang = lang;
            } else {
                currentLang = 'hu'; // Fallback
            }
        } else {
            currentLang = 'hu';
        }
    } catch (e) {
        console.error("Language detection failed", e);
        currentLang = 'hu';
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
            const payload = {
                email: emailInput,
                name: nameInput,
                items: cart.map(item => ({
                    countryName: item.countryName,
                    data: item.data,
                    duration: item.duration,
                    logo: item.logo,
                    isDaily: item.isDaily,
                    quantity: item.quantity,
                    qr_text: `LPA:1$smdp.plus$TEST-ACTIVATION-CODE-${Date.now()}-${item.id}`
                }))
            };

            const response = await fetch(`${BACKEND_URL}/api/email`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
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
                console.error("Checkout Error:", errData);
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

    // We don't have lang-selector anymore, so no need for that event listener, but let's replace the whole checkout block.


}

document.addEventListener('DOMContentLoaded', initApp);
