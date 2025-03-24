export async function loadLayout() {
const layoutContainer = document.getElementById('layout-container');
  if (!layoutContainer) return;

try {
const res = await fetch('/components/layout.html');
const html = await res.text();
layoutContainer.innerHTML = html;

requestAnimationFrame(() => {
setTimeout(() => {
initLayout();
}, 0);
});
} catch (err) {
console.error('Failed to load layout:', err);
}
}

function initLayout() {
const toggleClass = (el, className, state = null) => {
if (!el) return;
if (state === null) {
el.classList.toggle(className);
} else {
el.classList.toggle(className, state);
}
};

const updateIcon = (el, isActive, baseSrc) => {
const img = el?.querySelector('img');
if (img && baseSrc) {
img.src = isActive
? baseSrc.replace('.svg', '-active.svg')
: baseSrc.replace('-active.svg', '.svg');
}
};

const exitBtn = document.getElementById('exit-btn');
exitBtn?.addEventListener('click', () => {
window.location.href = 'https://www.google.com';
});

const navButtons = document.querySelectorAll('.nav-btn');
const currentPath = window.location.pathname.endsWith('/')
    ? '/'
: window.location.pathname;

navButtons.forEach((btn) => {
const href = btn.getAttribute('href');
const isActive = currentPath === href;
toggleClass(btn, 'active', isActive);
updateIcon(btn, isActive, btn.querySelector('img')?.getAttribute('src'));
  });

const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const menuPanel = document.querySelector('.menu-panel');

const toggleMenu = () => toggleClass(menuPanel, 'open');
const closeMenu = () => toggleClass(menuPanel, 'open', false);
menuBtn?.addEventListener('click', toggleMenu);
closeBtn?.addEventListener('click', closeMenu);

const menuItems = document.querySelectorAll('.menu-item a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

menuItems.forEach((item) => {
const href = item.getAttribute('href');
const isActive = href === currentPage || (currentPage === 'index.html' && href === '/');
toggleClass(item, 'active', isActive);
  });

const footerLinks = document.querySelectorAll('.footer-link');
const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');

footerLinks.forEach((link) => {
const linkPath = link.getAttribute('href')?.replace(/\.html$/, '').replace(/\/$/, '');
const isHome = (path === '' || path === 'index') && linkPath === '';
const isActive = path === linkPath || isHome;
toggleClass(link, 'active', isActive);
updateIcon(link, isActive, link.querySelector('img')?.getAttribute('src'));
  });

const languageDropdown = document.getElementById('language-dropdown');
const languageContent = document.getElementById('language-content');
const languageArrow = languageDropdown?.querySelector('.arrow');
const loadingOverlay = document.getElementById('loading-overlay');
let translations = {};

const showLoading = () => loadingOverlay?.classList.add('active');
const hideLoading = () => loadingOverlay?.classList.remove('active');

const fetchTranslations = async () => {
showLoading();
try {
const res = await fetch(
'https://script.google.com/macros/s/AKfycbwfpV7jXdT9UMIWGvMCnopnZIvrdF6MEtrdaUff1p3NUi3UYGI2LvEtFc18-aKmk2RzTg/exec'
);
return await res.json();
} catch (err) {
console.error('Translation fetch error:', err);
return {};
} finally {
hideLoading();
}
};

const applyTranslations = () => {
const currentLang = localStorage.getItem('language') || 'English';
document.querySelectorAll('[data-translate]').forEach((el) => {
const key = el.getAttribute('data-translate');
if (translations[key]?.[currentLang]) {
el.innerHTML = translations[key][currentLang];
}
});
};

const changeLanguage = async (lang) => {
localStorage.setItem('language', lang);
translations = await fetchTranslations();
applyTranslations();
languageDropdown?.classList.remove('active');
languageContent?.classList.remove('open');
closeMenu();

document.querySelectorAll('.dropdown-item button').forEach((btn) => {
toggleClass(btn, 'active', btn.dataset.lang === lang);
});
};

  languageDropdown?.addEventListener('click', () => {
const isOpen = languageDropdown.classList.toggle('active');
toggleClass(languageContent, 'open', isOpen);
if (languageArrow) languageArrow.textContent = isOpen ? '▲' : '▼';
languageDropdown.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.dropdown-item button').forEach((btn) => {
btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
  });

const savedLang = localStorage.getItem('language') || 'English';
fetchTranslations().then((res) => {
translations = res;
applyTranslations();
});
                }
