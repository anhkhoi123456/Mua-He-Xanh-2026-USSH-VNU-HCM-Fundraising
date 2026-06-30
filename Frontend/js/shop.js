/* Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License. */

document.addEventListener('DOMContentLoaded', () => {

    const filterPills = document.querySelectorAll('.pill');
    const productCards = document.querySelectorAll('.products-grid .card');
    const itemsCountSpan = document.querySelector('.items-count');

    // --- FILTER LOGIC ---
    if (filterPills.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const selectedFilter = pill.getAttribute('data-filter');

                // Handle the "Tất cả" (All) button vs specific filter pills
                if (selectedFilter === 'all') {
                    filterPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                } else {
                    pill.classList.toggle('active');
                    
                    const allPill = document.querySelector('.pill[data-filter="all"]');
                    if (allPill) allPill.classList.remove('active');
                }

                // Gather all currently active filters into an array
                const activePills = document.querySelectorAll('.pill.active');
                const activeFiltersList = Array.from(activePills).map(p => p.getAttribute('data-filter').toLowerCase());

                // If user unclicks everything, default back to "All"
                if (activeFiltersList.length === 0) {
                    const allPill = document.querySelector('.pill[data-filter="all"]');
                    if (allPill) {
                        allPill.classList.add('active');
                        activeFiltersList.push('all');
                    }
                }

                let visibleCount = 0;

                productCards.forEach(card => {
                    const cardCategoryText = card.getAttribute('data-category') || '';
                    const cardCategories = cardCategoryText.trim().toLowerCase().split(/\s+/);

                    // Show card if "All" is active OR if card contains at least one active filter tag
                    const matchesFilter = activeFiltersList.includes('all') || 
                                          activeFiltersList.some(filter => cardCategories.includes(filter));

                    if (matchesFilter) {
                        card.style.display = ''; 
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                if (itemsCountSpan) {
                    itemsCountSpan.textContent = `${visibleCount} item${visibleCount !== 1 ? 's' : ''}`;
                }
            });
        });

        // Handle URL parameters for initial filtering
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilter = urlParams.get('filter');

        if (initialFilter) {
            const targetPill = document.querySelector(`.pill[data-filter="${initialFilter}"]`);
            if (targetPill) {
                targetPill.click();
            }
        }
    }

    // --- CART LOGIC ---
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const cartButtons = document.querySelectorAll('.btn-cart');
    
    // Load existing cart contents from memory or start empty
    let cart = JSON.parse(localStorage.getItem('site_cart')) || [];

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartButtons.forEach(btn => {
            btn.textContent = `Xem giỏ hàng (${totalItems})`;
        });
    }
    updateCartUI(); 

    // LINKED TO CART.HTML
    cartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            
            // Added Optional Chaining (?.) to prevent errors if elements are missing
            const product = {
                id: card.getAttribute('data-id') || card.querySelector('h3')?.textContent.toLowerCase().replace(/\s+/g, '-') || 'unknown-item',
                title: card.querySelector('h3')?.textContent || 'Unknown Item',
                price: parseInt(card.querySelector('.card-price')?.textContent.replace(/[^0-9]/g, '')) || 0,
                image: card.querySelector('.card-image')?.getAttribute('src') || 'images/placeholder.png'
            };

            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                product.quantity = 1;
                cart.push(product);
            }

            localStorage.setItem('site_cart', JSON.stringify(cart));
            updateCartUI();

            const originalText = button.textContent;
            button.textContent = '✓ Added';
            button.style.background = '#0E5E3A';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 800);
        });
    });

    // --- LIGHTBOX LOGIC ---
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const productImages = document.querySelectorAll('.card-image');

    // Only run lightbox code if the lightbox elements actually exist on this HTML page
    if (lightbox && lightboxImg && lightboxClose) {
        productImages.forEach(img => {
            img.addEventListener('click', (e) => {
                lightbox.style.display = 'flex'; 
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                document.body.style.overflow = 'hidden'; 
            });
        });

        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = ''; 
        }

        lightboxClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });
    }
});