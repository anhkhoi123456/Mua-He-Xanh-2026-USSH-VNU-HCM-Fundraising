document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('cart-list-container');
    const totalPriceDisplay = document.getElementById('summary-total-price');
    const stickyHeaderTotalDisplay = document.getElementById('sticky-header-total'); 
    const orderForm = document.getElementById('order-submission-form');
    const clearCartBtn = document.getElementById('btn-clear-cart');

    let cart = JSON.parse(localStorage.getItem('site_cart')) || [];

    function renderCart() {
        if (cart.length === 0) {
            listContainer.innerHTML = `<p class="empty-message">Đơn hàng của bạn đang trống</p>`;
            totalPriceDisplay.textContent = '0 VND';
            if (stickyHeaderTotalDisplay) stickyHeaderTotalDisplay.textContent = 'Tổng: 0 VND'; 
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
            stickyHeaderTotalDisplay.textContent = `Tổng: ${formattedPriceString}`; 
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

            // Convert product ID to string
            const productCountMap = {};
            cart.forEach(item => {
                const numericStringId = String(item.id).trim();
                const quantityInt = parseInt(item.quantity, 10) || 0;

                if (productCountMap[numericStringId]) {
                    productCountMap[numericStringId] += quantityInt;
                } else {
                    productCountMap[numericStringId] = quantityInt;
                }
            });

            const finalOrderPayload = {
                orderID: "", // To match the struct ClientData.
                fullName: document.getElementById('customer-name').value,
                uniName: document.getElementById('customer-uni').value,
                phone: document.getElementById('customer-phone').value,
                zaloPhone: document.getElementById('customer-zalo').value || document.getElementById('customer-phone').value,
                email: document.getElementById('customer-email').value,
                deliveryAddress: document.getElementById('customer-address').value,
                productCount: productCountMap,
                totalProductCount: 0, // Dummy Payload
                totalMoneyCount: 0 // Dummy Payload
            };

            console.log("=== OUTBOUND BACKEND CHECKOUT JSON DATA POOL ===");
            console.log(JSON.stringify(finalOrderPayload, null, 2));

            try {
                // Khóa nút submit để tránh spam click
                const submitBtn = orderForm.querySelector('button[type="submit"]');
                if(submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Đang xử lý...";
                }

                // FORCE the request to go directly to your Docker backend domain
                const response = await fetch('https://mua-he-xanh-2026-ussh-vnu-hcm-fundraising.onrender.com/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalOrderPayload)
                });
                
                if (!response.ok) throw new Error('Failed to post');

                // CRITICAL: Consume the backend response body to close the network stream cleanly!
                const data = await response.json(); 
                console.log("Backend response received:", data);

                // Only show success if the backend confirmed it
                if (data.status === "success" || data.status === "partial_success") {
                    
                    // 1. Xóa giỏ hàng vì đơn đã lên server thành công
                    localStorage.removeItem('site_cart'); 

                    // 2. Chuyển hướng sang trang checkout.html kèm tham số
                    window.location.href = `checkout.html?id=${data.orderID}&amount=${data.totalMoneyCount}`;
                    
                } else {
                    if(submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Xác nhận đặt hàng";
                    }
                    throw new Error(data.message || "Unknown server error");
                }

            } catch (error) {
                console.error("Order submission failure:", error);
                alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
                
                const submitBtn = orderForm.querySelector('button[type="submit"]');
                if(submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Xác nhận đặt hàng";
                }
            }
        });
    }

    // INITIALIZE
    renderCart();
});