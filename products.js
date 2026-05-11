// =============================================
//   SAMARA — products.js
//   1. Scroll-reveal & navbar behaviour
//   2. Star rating renderer
//   3. Relevance scoring
//   4. Sorting helper
//   5. Card builder (shared by featured & results)
//   6. Skeleton loading state
//   7. Featured products (shown on page load)
//   8. Search function (DummyJSON API)
//   9. Cart toast notification
// =============================================


// ─── 1. SCROLL-REVEAL & NAVBAR ───────────────

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.s-reveal').forEach(el => revealObserver.observe(el));

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.style.borderBottomColor = window.scrollY > 10 ? 'var(--clr-beige-mid)' : 'transparent';
  nav.style.boxShadow         = window.scrollY > 10 ? 'var(--shadow-sm)'      : 'none';
});


// ─── 2. STAR RATING RENDERER ─────────────────

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = (rating % 1) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  const star  = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  const hstar = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="opacity:.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  const estar = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="opacity:.2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

  return star.repeat(full) + (half ? hstar : '') + estar.repeat(empty);
}


// ─── 3. RELEVANCE SCORING ─────────────────────
// Scores how closely a product matches the search query.
// Higher score = better match. Breakdown:
//   +10  title is an exact match (case-insensitive)
//   +6   title starts with the query
//   +4   title contains the query as a whole word
//   +2   title contains the query anywhere
//   +3   every individual query word appears in the title
//   +1   every individual query word appears in the description
//   +0.5 category contains the query

function scoreProduct(product, query) {
  const q         = query.toLowerCase().trim();
  const words     = q.split(/\s+/).filter(Boolean);
  const title     = product.title.toLowerCase();
  const desc      = product.description.toLowerCase();
  const category  = (product.category || '').toLowerCase();

  let score = 0;

  if (title === q)                               score += 10;
  else if (title.startsWith(q))                  score += 6;
  else if (new RegExp(`\\b${q}\\b`).test(title)) score += 4;
  else if (title.includes(q))                    score += 2;

  if (words.every(w => title.includes(w)))       score += 3;
  if (words.every(w => desc.includes(w)))        score += 1;
  if (category.includes(q))                      score += 0.5;

  return score;
}


// ─── 4. SORTING HELPER ───────────────────────
// Sorts a product array by the chosen sort option.
// "relevance" keeps the caller's already-scored order.

function applySort(products, sortValue) {
  const sorted = [...products]; // don't mutate the original
  switch (sortValue) {
    case 'price-asc':    return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':   return sorted.sort((a, b) => b.price - a.price);
    case 'rating-desc':  return sorted.sort((a, b) => b.rating - a.rating);
    case 'name-asc':     return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:             return sorted; // "relevance" — keep existing order
  }
}


// ─── 5. CARD BUILDER ─────────────────────────
// Shared template used for both featured and search-result cards.

function buildCard(p, index) {
  return `
    <div class="col-lg-4 col-md-6">
      <div class="p-card p-card-anim" style="animation-delay:${index * 0.08}s">
        <div class="p-card-img-wrap">
          <img
            src="${p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/300x300?text=Product'}"
            alt="${p.title}"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/300x300?text=Product'"
          />
        </div>
        <div class="p-card-body">
          <span class="p-card-cat">${p.category || 'General'}</span>
          <h3 class="p-card-name">${p.title}</h3>
          <p class="p-card-desc">${p.description}</p>
          <div class="p-card-meta">
            <span class="p-card-price">$${p.price.toFixed(2)}</span>
            <span class="p-card-rating">
              ${renderStars(p.rating)}
              ${p.rating.toFixed(1)}
            </span>
          </div>
          <button class="p-card-btn" onclick="addToCart('${p.title.replace(/'/g, "\\'")}')">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}


// ─── 6. SKELETON LOADING STATE ───────────────

function showSkeletons() {
  document.getElementById('featuredArea').innerHTML = '';
  document.getElementById('resultsArea').innerHTML = `
    <div class="p-results-header">
      <span class="p-results-title">Searching…</span>
    </div>
    <div class="row g-3">
      ${[0, 1, 2].map(() => `
        <div class="col-lg-4 col-md-6">
          <div class="p-skeleton-card">
            <div class="p-skeleton p-skeleton-img"></div>
            <div class="p-skeleton-body">
              <div class="p-skeleton p-skeleton-line w-40"></div>
              <div class="p-skeleton p-skeleton-line w-70"></div>
              <div class="p-skeleton p-skeleton-line w-90"></div>
              <div class="p-skeleton p-skeleton-line w-40"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}


// ─── 7. FEATURED PRODUCTS (on page load) ─────
// Fetches the top-rated products from DummyJSON and displays 6
// as "Featured" cards before the user runs any search.

async function loadFeatured() {
  try {
    // Fetch all products sorted by rating descending, limit 6
    const res  = await fetch('https://dummyjson.com/products?limit=100&sortBy=rating&order=desc');
    const data = await res.json();

    // Pick the top 6 highest-rated
    const featured = (data.products || []).slice(0, 6);
    if (!featured.length) return;

    document.getElementById('featuredArea').innerHTML = `
      <div class="p-featured-header">
        <span class="p-featured-title">Featured <em>Products</em></span>
        <span class="p-results-count">Top-rated picks from our catalogue</span>
      </div>
      <div class="row g-3">
        ${featured.map((p, i) => buildCard(p, i)).join('')}
      </div>
    `;
    lucide.createIcons();
  } catch (err) {
    // Silently fail — featured section just won't show if the network is down
    console.warn('Could not load featured products:', err);
  }
}


// ─── 8. SEARCH FUNCTION ──────────────────────
// 1. Reads the query, category filter, and sort preference
// 2. Fetches matching products from DummyJSON (up to 100)
// 3. Optionally filters down to a chosen category client-side
// 4. Scores every result for relevance to the query
// 5. Sorts by the chosen sort option (relevance keeps score order)
// 6. Displays the top 3

async function searchProducts() {
  const input    = document.getElementById('searchInput');
  const catSel   = document.getElementById('categorySelect');
  const sortSel  = document.getElementById('sortSelect');
  const query    = input.value.trim();
  const category = catSel ? catSel.value : '';
  const sortVal  = sortSel ? sortSel.value : 'relevance';

  // Require at least a query OR a category selection
  if (!query && !category) {
    input.focus();
    input.style.borderColor = 'var(--clr-accent)';
    setTimeout(() => (input.style.borderColor = ''), 1200);
    return;
  }

  showSkeletons();

  try {
    // Build the API URL — use category endpoint if a category is selected and no text query,
    // otherwise use the search endpoint (DummyJSON search also returns category info we can filter on)
    let url;
    if (query) {
      url = `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=100`;
    } else {
      url = `https://dummyjson.com/products/category/${encodeURIComponent(category)}?limit=100`;
    }

    const res  = await fetch(url);
    const data = await res.json();
    let products = data.products || [];

    // If both query and category are set, filter the search results by category client-side
    if (query && category) {
      products = products.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }

    if (!products.length) {
      document.getElementById('resultsArea').innerHTML = `
        <div class="p-empty">
          <i data-lucide="package-x"></i>
          <p>No products found. Try a different keyword or category!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    // Score each product for relevance (only meaningful when there's a text query)
    const displayLabel = query || category;
    const scored = query
      ? products.map(p => ({ ...p, _score: scoreProduct(p, query) }))
               .sort((a, b) => b._score - a._score)   // best match first
      : products; // no text query — keep API order (already sorted by rating)

    // Apply the user's chosen sort on top (relevance keeps current score-based order)
    const sorted = applySort(scored, sortVal);

    // Take the top 3
    const top3 = sorted.slice(0, 3);

    document.getElementById('resultsArea').innerHTML = `
      <div class="p-results-header">
        <span class="p-results-title">Results for <em>"${displayLabel}"</em></span>
        <span class="p-results-count">${products.length} products found — showing top 3</span>
      </div>
      <div class="row g-3">
        ${top3.map((p, i) => buildCard(p, i)).join('')}
      </div>
    `;
    lucide.createIcons();

  } catch (err) {
    document.getElementById('resultsArea').innerHTML = `
      <div class="p-empty">
        <i data-lucide="wifi-off"></i>
        <p>Something went wrong. Please check your connection and try again.</p>
      </div>
    `;
    lucide.createIcons();
  }
}

// Allow pressing Enter to trigger search
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchProducts();
});


// ─── 9. CART TOAST NOTIFICATION ──────────────

let cartCount  = 0;
let toastEl    = null;
let toastTimer = null;

function addToCart(name) {
  cartCount++;
  showToast(`"${name}" added to cart 🎉`);
}

function showToast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText = `
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(70px);
      background: var(--clr-text);
      color: var(--clr-white);
      padding: 12px 24px;
      border-radius: 100px;
      font-family: var(--font-body);
      font-size: .88rem;
      font-weight: 400;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      transition: transform .32s ease, opacity .32s ease;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = msg;

  requestAnimationFrame(() => {
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    toastEl.style.opacity   = '1';
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.transform = 'translateX(-50%) translateY(70px)';
    toastEl.style.opacity   = '0';
  }, 2400);
}


// ─── INIT ─────────────────────────────────────
// Load featured products as soon as the page is ready.
loadFeatured();
