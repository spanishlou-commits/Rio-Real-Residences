/* ── Config ─────────────────────────────────────────────────────────────── */
const CONFIG = {
  whatsapp: '34687488152',
  email:    'info@riorealresidences.com',
  currency: 'EUR',
};

/* ── Utilities ──────────────────────────────────────────────────────────── */
const formatPrice = (price, note) => {
  const formatted = new Intl.NumberFormat('en-EU', {
    style: 'currency', currency: CONFIG.currency,
    maximumFractionDigits: 0
  }).format(price);
  return note ? `${formatted} <span class="property-card__price-note">${note}</span>` : formatted;
};

const formatDetailPrice = (price, note) => {
  const formatted = new Intl.NumberFormat('en-EU', {
    style: 'currency', currency: CONFIG.currency,
    maximumFractionDigits: 0
  }).format(price);
  return note ? `${formatted}<span style="font-size:0.6em;color:var(--light-text);font-family:var(--font-sans);margin-left:8px">${note}</span>` : formatted;
};

const whatsappLink = (msg = '') =>
  `https://wa.me/${CONFIG.whatsapp}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;

const emailLink = (subject = '') =>
  `mailto:${CONFIG.email}${subject ? '?subject=' + encodeURIComponent(subject) : ''}`;

const getParam = (key) => new URLSearchParams(window.location.search).get(key);

const pinSVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

const waIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;

const mailIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

/* ── Nav behaviour ──────────────────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  const hamburger = nav.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileClose = document.querySelector('.nav__mobile-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
  }

  // Active link
  document.querySelectorAll('.nav__link').forEach(link => {
    if (link.href === window.location.href ||
        (link.getAttribute('href') !== '/' && window.location.pathname.startsWith(link.getAttribute('href')))) {
      link.classList.add('active');
    }
  });
}

/* ── Intersection observer animations ──────────────────────────────────── */
function initAnimations() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

/* ── Lightbox ───────────────────────────────────────────────────────────── */
function initLightbox(images) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const img = lb.querySelector('.lightbox__img');
  let current = 0;

  const show = (i) => {
    current = (i + images.length) % images.length;
    img.src = images[current];
  };

  lb.querySelector('.lightbox__close').addEventListener('click', () => lb.classList.remove('open'));
  lb.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
    el.addEventListener('click', () => {
      lb.classList.add('open');
      show(i);
    });
  });
}

/* ── Hero parallax & load animation ────────────────────────────────────── */
function initHero() {
  const bg = document.querySelector('.hero__bg');
  if (!bg) return;
  setTimeout(() => bg.classList.add('loaded'), 100);

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) bg.style.transform = `scale(1) translateY(${y * 0.3}px)`;
  }, { passive: true });
}

/* ── Properties index ───────────────────────────────────────────────────── */
async function initPropertiesPage() {
  const grid = document.getElementById('properties-grid');
  if (!grid) return;

  const allProps = await fetchProperties();

  // ── Price options ──────────────────────────────────────────────────────────
  const pricePoints = [];
  for (let p = 150000; p <= 500000; p += 50000)   pricePoints.push(p);
  for (let p = 600000; p <= 1000000; p += 100000) pricePoints.push(p);
  for (let p = 1250000; p <= 3000000; p += 250000) pricePoints.push(p);
  for (let p = 3500000; p <= 5000000; p += 500000) pricePoints.push(p);
  for (let p = 6000000; p <= 10000000; p += 1000000) pricePoints.push(p);
  for (let p = 12500000; p <= 20000000; p += 2500000) pricePoints.push(p);

  const fmtPrice = v => v >= 1000000
    ? `€${(v / 1000000).toLocaleString('en', { maximumFractionDigits: 2 })}m`
    : `€${(v / 1000).toFixed(0)}k`;

  const minSel = document.getElementById('filter-price-min');
  const maxSel = document.getElementById('filter-price-max');
  minSel.innerHTML = '<option value="">From</option>' + pricePoints.map(v => `<option value="${v}">${fmtPrice(v)}</option>`).join('');
  maxSel.innerHTML = '<option value="">To</option>'   + pricePoints.map(v => `<option value="${v}">${fmtPrice(v)}</option>`).join('');

  // ── Normalise area name (strip accents, lowercase) ─────────────────────────
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  // ── Read current filter state ──────────────────────────────────────────────
  const getFilters = () => ({
    area:       document.getElementById('filter-area').value,
    type:       document.querySelector('.type-btn.active')?.dataset.type || '',
    priceMin:   Number(minSel.value) || 0,
    priceMax:   Number(maxSel.value) || Infinity,
    beds:       Number(document.getElementById('filter-beds').value)  || 0,
    baths:      Number(document.getElementById('filter-baths').value) || 0,
    poolPriv:   document.getElementById('feat-pool-private').checked,
    poolComm:   document.getElementById('feat-pool-communal').checked,
    gardenPriv: document.getElementById('feat-garden-private').checked,
    gardenComm: document.getElementById('feat-garden-communal').checked,
    seaViews:   document.getElementById('feat-sea').checked,
    lift:       document.getElementById('feat-lift').checked,
    garage:     document.getElementById('feat-garage').checked,
  });

  // ── Match a property against active filters ────────────────────────────────
  const matches = (p, f) => {
    if (f.area && norm(p.neighbourhood || '') !== norm(f.area)) return false;
    if (f.type && !p.type.toLowerCase().includes(f.type.toLowerCase())) return false;
    if (f.priceMin && p.price < f.priceMin) return false;
    if (f.priceMax < Infinity && p.price > f.priceMax) return false;
    if (f.beds  && (p.bedrooms  || 0) < f.beds)  return false;
    if (f.baths && (p.bathrooms || 0) < f.baths) return false;

    const feats = (p.features || []).map(s => s.toLowerCase());
    const hasPrivate = feats.includes('private');
    const hasCommunal = feats.includes('communal');

    if (f.poolPriv   && !(p.pool   && hasPrivate))  return false;
    if (f.poolComm   && !(p.pool   && hasCommunal)) return false;
    if (f.gardenPriv && !(p.garden && hasPrivate))  return false;
    if (f.gardenComm && !(p.garden && hasCommunal)) return false;
    if (f.seaViews   && !feats.some(ft => ft.includes('sea')))  return false;
    if (f.lift       && !feats.includes('lift'))    return false;
    if (f.garage     && !p.garage)                  return false;

    return true;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const countEl = document.getElementById('results-count');
  const render = () => {
    const f = getFilters();
    const filtered = allProps.filter(p => matches(p, f));
    grid.innerHTML = filtered.length
      ? filtered.map(p => propertyCardHTML(p)).join('')
      : '<p style="padding:40px;color:var(--light-text);font-family:var(--font-sans);font-size:0.9rem;">No properties match your search. Try adjusting the filters.</p>';
    if (countEl) countEl.textContent = `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} found`;
  };

  // ── Wire up controls ───────────────────────────────────────────────────────
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  ['filter-area','filter-price-min','filter-price-max','filter-beds','filter-baths'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', render);
  });

  ['feat-pool-private','feat-pool-communal','feat-garden-private','feat-garden-communal',
   'feat-sea','feat-lift','feat-garage'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', render);
  });

  document.getElementById('search-clear')?.addEventListener('click', () => {
    document.getElementById('filter-area').value = '';
    minSel.value = ''; maxSel.value = '';
    document.getElementById('filter-beds').value  = '';
    document.getElementById('filter-baths').value = '';
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.type-btn[data-type=""]')?.classList.add('active');
    document.querySelectorAll('.feat-check input').forEach(cb => cb.checked = false);
    render();
  });

  render();
}

async function fetchProperties() {
  const [localResult, resalesResult] = await Promise.allSettled([
    fetch('data/properties.json').then(r => r.json()),
    fetch('data/resales-properties.json').then(r => r.json()).then(d => d.properties || [])
  ]);

  const local   = localResult.status   === 'fulfilled' ? localResult.value   : [];
  const resales = resalesResult.status === 'fulfilled' ? resalesResult.value : [];

  return [...local, ...resales];
}

function propertyCardHTML(p) {
  const priceHTML = formatPrice(p.price, p.priceNote);
  return `
    <a href="property.html?id=${p.id}" class="property-card" data-id="${p.id}">
      <div class="property-card__image">
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <span class="property-card__badge${p.status === 'For Rent' ? ' property-card__badge--rent' : ''}">${p.status}</span>
        ${p.source === 'resales' ? '<span class="property-card__network">Network</span>' : ''}
      </div>
      <div class="property-card__body">
        <div class="property-card__type">${p.type}</div>
        <h4 class="property-card__title">${p.title}</h4>
        <div class="property-card__location">${pinSVG} ${p.location}</div>
        <div class="property-card__specs">
          <div class="property-card__spec">
            <span class="property-card__spec-value">${p.bedrooms}</span>
            <span class="property-card__spec-label">Beds</span>
          </div>
          <div class="property-card__spec">
            <span class="property-card__spec-value">${p.bathrooms}</span>
            <span class="property-card__spec-label">Baths</span>
          </div>
          ${p.built ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.built}</span>
            <span class="property-card__spec-label">m² Built</span>
          </div>` : p.terrace ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.terrace}</span>
            <span class="property-card__spec-label">m² Terrace</span>
          </div>` : ''}
          ${p.plot ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.plot}</span>
            <span class="property-card__spec-label">m² Plot</span>
          </div>` : ''}
        </div>
        <div class="property-card__price">${priceHTML}</div>
      </div>
    </a>
  `;
}

function attachCardLinks() {
  // Links handled by <a> tags natively
}

/* ── Homepage featured properties ───────────────────────────────────────── */
async function initHomePage() {
  const featuredContainer = document.getElementById('featured-properties');
  if (!featuredContainer) return;

  const props = await fetchProperties();
  const featured = props.filter(p => p.featured);

  featuredContainer.innerHTML = featured.map(p => `
    <a href="property.html?id=${p.id}" class="property-card" data-id="${p.id}">
      <div class="property-card__image">
        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <span class="property-card__badge${p.status === 'For Rent' ? ' property-card__badge--rent' : ''}">${p.status}</span>
        ${p.source === 'resales' ? '<span class="property-card__network">Network</span>' : ''}
      </div>
      <div class="property-card__body">
        <div class="property-card__type">${p.type}</div>
        <h4 class="property-card__title">${p.title}</h4>
        <div class="property-card__location">${pinSVG} ${p.location}</div>
        <div class="property-card__specs">
          <div class="property-card__spec">
            <span class="property-card__spec-value">${p.bedrooms}</span>
            <span class="property-card__spec-label">Beds</span>
          </div>
          <div class="property-card__spec">
            <span class="property-card__spec-value">${p.bathrooms}</span>
            <span class="property-card__spec-label">Baths</span>
          </div>
          ${p.built ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.built}</span>
            <span class="property-card__spec-label">m² Built</span>
          </div>` : p.terrace ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.terrace}</span>
            <span class="property-card__spec-label">m² Terrace</span>
          </div>` : ''}
          ${p.plot ? `<div class="property-card__spec">
            <span class="property-card__spec-value">${p.plot}</span>
            <span class="property-card__spec-label">m² Plot</span>
          </div>` : ''}
        </div>
        <div class="property-card__price">${formatPrice(p.price, p.priceNote)}</div>
      </div>
    </a>
  `).join('');

  setTimeout(initAnimations, 100);
}

/* ── Property detail page ───────────────────────────────────────────────── */
async function initPropertyDetail() {
  const container = document.getElementById('property-detail-root');
  if (!container) return;

  const id = getParam('id');
  if (!id) { window.location.href = 'properties.html'; return; }

  const props = await fetchProperties();
  const p = props.find(p => p.id === id);
  if (!p) { window.location.href = 'properties.html'; return; }

  document.title = `${p.title} — Rio Real Residences`;

  const waMsg = `Hello, I'm interested in ${p.title} (${p.id}). Could you please provide more details?`;

  // Gallery
  const galleryEl = document.getElementById('property-gallery');
  const thumbs = p.images.slice(1, 3);
  const extraImgs = p.images.slice(3);
  galleryEl.innerHTML = `
    <div class="property-gallery__main" data-lightbox style="cursor:zoom-in">
      <img src="${p.images[0]}" alt="${p.title}">
    </div>
    ${thumbs.map(img => `
      <div class="property-gallery__thumb" data-lightbox>
        <img src="${img}" alt="${p.title}" loading="lazy">
      </div>
    `).join('')}
    ${extraImgs.map(img => `
      <div class="property-gallery__thumb property-gallery__thumb--extra" data-lightbox>
        <img src="${img}" alt="${p.title}" loading="lazy">
      </div>
    `).join('')}
  `;

  // Detail
  container.innerHTML = `
    <div class="property-detail__main">
      <div class="label">${p.type} · ${p.status}</div>
      <h1>${p.title}</h1>
      <div class="property-detail__location">${pinSVG} ${p.location}</div>

      <div class="property-detail__specs">
        <div class="property-detail__spec">
          <div class="property-detail__spec-value">${p.bedrooms}</div>
          <div class="property-detail__spec-label">Bedrooms</div>
        </div>
        <div class="property-detail__spec">
          <div class="property-detail__spec-value">${p.bathrooms}</div>
          <div class="property-detail__spec-label">Bathrooms</div>
        </div>
        ${p.built ? `<div class="property-detail__spec">
          <div class="property-detail__spec-value">${p.built}</div>
          <div class="property-detail__spec-label">m² Built</div>
        </div>` : p.terrace ? `<div class="property-detail__spec">
          <div class="property-detail__spec-value">${p.terrace}</div>
          <div class="property-detail__spec-label">m² Terrace</div>
        </div>` : ''}
        ${p.plot ? `<div class="property-detail__spec">
          <div class="property-detail__spec-value">${p.plot}</div>
          <div class="property-detail__spec-label">m² Plot</div>
        </div>` : p.pool ? `<div class="property-detail__spec">
          <div class="property-detail__spec-value" style="font-size:1.2rem">${p.pool}</div>
          <div class="property-detail__spec-label">Pool</div>
        </div>` : ''}
      </div>

      <div class="property-detail__description">${p.description.split('\n\n').map(para => `<p>${para}</p>`).join('')}</div>

      ${p.floorplan ? `<div class="property-detail__floorplan">
        <h3>Floor plan</h3>
        <img src="${p.floorplan}" alt="Floor plan — ${p.title}" style="max-width:100%; border:1px solid var(--border); margin-top:16px;">
      </div>` : ''}

      ${p.costs ? `<div class="property-detail__costs">
        <h3>Annual costs</h3>
        <div class="costs-grid">
          ${p.costs.ibi ? `<div class="cost-item"><span class="cost-label">IBI</span><span class="cost-value">${p.costs.ibi}</span></div>` : ''}
          ${p.costs.garbage ? `<div class="cost-item"><span class="cost-label">Rubbish</span><span class="cost-value">${p.costs.garbage}</span></div>` : ''}
          ${p.costs.community ? `<div class="cost-item"><span class="cost-label">Community</span><span class="cost-value">${p.costs.community}</span></div>` : ''}
        </div>
      </div>` : ''}

      <div class="property-detail__features">
        <h3>Features & amenities</h3>
        <ul class="features-list">
          ${p.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>

    <aside class="property-sidebar">
      <div class="property-sidebar__price-card">
        <div class="property-sidebar__price">${formatDetailPrice(p.price, p.priceNote)}</div>
        <div class="property-sidebar__price-note">${p.status}${p.priceNote ? ' · ' + p.priceNote : ''}</div>
        <div class="property-sidebar__actions">
          <a href="${whatsappLink(waMsg)}" class="btn btn--whatsapp" target="_blank" rel="noopener">
            ${waIconSVG} WhatsApp
          </a>
          <a href="${emailLink('Enquiry: ' + p.title + ' (' + p.id + ')')}" class="btn btn--outline">
            ${mailIconSVG} Email Us
          </a>
          <a href="contact.html" class="btn btn--primary" style="margin-top:4px">
            Request a Viewing
          </a>
        </div>
        <div class="property-sidebar__ref">Ref: ${p.id}</div>
      </div>
    </aside>
  `;

  initLightbox(p.images);
  setTimeout(initAnimations, 100);
}

/* ── Contact form ───────────────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const subject = `Enquiry from ${data.name}${data.property ? ' — ' + data.property : ''}`;
    const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nInterest: ${data.interest || 'General'}\nMessage:\n${data.message}`;

    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const success = document.getElementById('form-success');
    if (success) {
      success.classList.add('visible');
      form.reset();
      setTimeout(() => success.classList.remove('visible'), 8000);
    }
  });
}

/* ── Wire up WhatsApp / email links ─────────────────────────────────────── */
function initContactLinks() {
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.href = whatsappLink(el.dataset.wa || '');
  });
  document.querySelectorAll('[data-email]').forEach(el => {
    el.href = emailLink(el.dataset.email || '');
  });
}

/* ── Area guide page ────────────────────────────────────────────────────── */
async function initAreaPage(neighbourhood) {
  const grid = document.getElementById('area-properties-grid');
  if (!grid) return;

  const props = await fetchProperties();
  const areaProps = props.filter(p =>
    p.neighbourhood && p.neighbourhood.toLowerCase() === neighbourhood.toLowerCase()
  );

  const empty = document.getElementById('area-props-empty');
  if (areaProps.length === 0) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  grid.innerHTML = areaProps.map(p => propertyCardHTML(p)).join('');
}

/* ── Boot ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initAnimations();
  initHero();
  initContactLinks();
  initHomePage();
  initPropertiesPage();
  initPropertyDetail();
  initContactForm();
});
