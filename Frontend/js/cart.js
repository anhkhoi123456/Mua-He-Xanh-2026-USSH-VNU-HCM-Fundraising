document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('cart-list-container');
    const totalPriceDisplay = document.getElementById('summary-total-price');
    const stickyHeaderTotalDisplay = document.getElementById('sticky-header-total'); // 🌟 New Sticky element reference
    const orderForm = document.getElementById('order-submission-form');
    const clearCartBtn = document.getElementById('btn-clear-cart');
    
    // Modal Variables
    const confirmModal = document.getElementById('orderConfirmModal');
    const confirmTotalMsg = document.getElementById('confirm-total-msg');
    const btnCloseConfirm = document.getElementById('btn-close-confirm');

    let cart = JSON.parse(localStorage.getItem('site_cart')) || [];

    function renderCart() {
        if (cart.length === 0) {
            listContainer.innerHTML = `<p class="empty-message">Đơn hàng của bạn đang trống</p>`;
            totalPriceDisplay.textContent = '0 VND';
            if (stickyHeaderTotalDisplay) stickyHeaderTotalDisplay.textContent = 'Tổng: 0 VND'; // 🌟 Handle empty states
            if (clearCartBtn) clearCartBtn.style.display = 'none'; 
            return;
        }

        if (clearCartBtn) clearCartBtn.style.display = 'inline-block'; 

        let htmlContent = '';
        let calculatedTotal = 0;

        cart.forEach((item, index) => {
            const itemTotalCost = item.price * item.quantity;
            calculatedTotal += itemTotalCost;

            htmlContent += `
                <div class="cart-item-row">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.onerror=null; this.src='images/placeholder.png';">
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <div class="cart-item-price">${item.price.toLocaleString('vi-VN')} VND</div>
                    </div>
                    <div class="quantity-control">
                        <button type="button" class="btn-qty" data-action="decrease" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="btn-qty" data-action="increase" data-index="${index}">+</button>
                    </div>
                    <button type="button" class="btn-remove" data-index="${index}">Xóa</button>
                </div>
            `;
        });

        listContainer.innerHTML = htmlContent;
        
        // Format Currency Values cleanly
        const formattedPriceString = calculatedTotal.toLocaleString('vi-VN') + ' VND';
        
        // Synchronize display text fields simultaneously 
        totalPriceDisplay.textContent = formattedPriceString;
        if (stickyHeaderTotalDisplay) {
            stickyHeaderTotalDisplay.textContent = `Tổng: ${formattedPriceString}`; // 🌟 Synchronize Sticky header view state
        }
        
        bindCartEvents();
    }

    function bindCartEvents() {
        const decButtons = document.querySelectorAll('.btn-qty[data-action="decrease"]');
        const incButtons = document.querySelectorAll('.btn-qty[data-action="increase"]');
        const remButtons = document.querySelectorAll('.btn-remove');

        decButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                updateCart();
            });
        });

        incButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart[index].quantity += 1;
                updateCart();
            });
        });

        remButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);
                updateCart();
            });
        });
    }

    function updateCart() {
        localStorage.setItem('site_cart', JSON.stringify(cart));
        renderCart();
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
                cart = []; 
                updateCart(); 
            }
        });
    }

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert("Đơn hàng của bạn còn trống.");
                return;
            }

            const productCountMap = {};
            cart.forEach(item => {
                const productId = item.id; 
                if (productCountMap[productId]) {
                    productCountMap[productId] += item.quantity;
                } else {
                    productCountMap[productId] = item.quantity;
                }
            });

            // Inside cart.js, update the finalOrderPayload object:
            const finalOrderPayload = {
                fullName: document.getElementById('customer-name').value,
                uniName: document.getElementById('customer-uni').value,
                phone: document.getElementById('customer-phone').value,
                zaloPhone: document.getElementById('customer-zalo').value || document.getElementById('customer-phone').value,
                email: document.getElementById('customer-email').value,
                deliveryAddress: document.getElementById('customer-address').value, // 🌟 NEW FIELD ADDED
                productCount: productCountMap
            };

            console.log("=== OUTBOUND BACKEND CHECKOUT JSON DATA POOL ===");
            console.log(JSON.stringify(finalOrderPayload, null, 2));

            try {
                const response = await fetch('https://mua-he-xanh-2026-ussh-vnu-hcm-fundraising.onrender.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalOrderPayload)
                });
                if(!response.ok) throw new Error('Failed to post');

                const currentTotalStr = document.getElementById('summary-total-price').textContent;
                confirmTotalMsg.textContent = `Tổng cộng: ${currentTotalStr}`;
                
                confirmModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; 

            } catch (error) {
                console.error("Order submission failure:", error);
                alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        });
    }

    if (btnCloseConfirm) {
        btnCloseConfirm.addEventListener('click', () => {
            localStorage.removeItem('site_cart'); 
            window.location.href = 'shop.html';   
        });
    }

    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const qrCodeImg = document.querySelector('.qr-code');

    if (qrCodeImg && lightbox) {
        qrCodeImg.style.cursor = 'zoom-in';

        qrCodeImg.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImg.src = qrCodeImg.src;
            document.body.style.overflow = 'hidden'; 
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

    // INITIALIZE
    renderCart();
});