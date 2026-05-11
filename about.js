// ── Navbar scroll effect ──
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('s-navbar--scrolled', window.scrollY > 10);
});

// ── Fetch 3 random products from DummyJSON ──
async function loadProducts() {
    try {
        // There are 194 products total; pick a random offset so cards vary each visit
        const skip = Math.floor(Math.random() * 191); // 194 - 3 = 191 max skip
        const response = await fetch(`https://dummyjson.com/products?limit=3&skip=${skip}`);
        const data = await response.json();
        const container = document.getElementById('product-container');

        data.products.forEach(p => {
            container.innerHTML += `
                <div class="col-md-4">
                    <div class="s-card h-100">
                        <img src="${p.thumbnail}" class="img-fluid rounded mb-3"
                             style="height:200px;width:100%;object-fit:cover;"
                             alt="${p.title}">
                        <h4 style="font-family:var(--font-display);">${p.title}</h4>
                        <p class="text-muted small">${p.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fw-bold">$${p.price}</span>
                            <span class="s-badge">⭐ ${p.rating}</span>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error('Failed to load products:', err);
    }
}

// ── Scroll reveal ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            entry.target.style.opacity = '1';
        }
    });
}, { threshold: 0.1 });

window.onload = () => {
    loadProducts();
    document.querySelectorAll('.s-reveal').forEach(el => observer.observe(el));
};
