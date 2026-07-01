/* Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License. */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy tham số id và amount từ thanh địa chỉ (URL)
    // Ví dụ: checkout.html?id=MHX_123&amount=150000
    const urlParams = new URLSearchParams(window.location.search);
    const orderID = urlParams.get('id');
    const amount = urlParams.get('amount');

    if (!orderID || !amount) {
        alert("Không tìm thấy thông tin thanh toán. Vui lòng thử lại!");
        window.location.href = 'shop.html';
        return;
    }

    // 2. Hiển thị thông tin lên giao diện
    const idDisplay = document.getElementById('display-order-id');
    const amountDisplay = document.getElementById('display-total-amount');
    const qrImage = document.getElementById('sepay-qr-image');

    if (idDisplay) idDisplay.innerText = orderID;
    if (amountDisplay) amountDisplay.innerText = Number(amount).toLocaleString('vi-VN');

    // 3. TỰ ĐỘNG TẠO QR SEPAY (KHÔNG CẦN ID)
    
    // Bạn chỉ cần điền đúng Số tài khoản và Mã ngân hàng của thủ quỹ vào 2 biến này:
    const BANK_ACCOUNT = "0783821787"; // <-- Sửa thành số tài khoản thật
    const BANK_NAME = "MB";            // <-- Sửa thành mã ngân hàng thật (VD: VCB, MB, ACB, TPB...)
    
    // Ráp link QR tự động bằng tài khoản và ngân hàng
    const sepayLink = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_NAME}&amount=${amount}&des=${orderID}`;

    // Nạp link vào thẻ img để nó tự render cái ảnh QR
    if (qrImage) {
        qrImage.src = sepayLink;
    }
});