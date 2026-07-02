/* Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License. */

// Gắn link API của bạn vào đây (Ví dụ: Link Google Apps Script Web App hoặc link Server C++ của bạn)
const API_URL = 'https://script.google.com/macros/s/AKfycby6yAlVXBruKYRGN94xtjD8Jin9FEQjrq8cNGtnJdNR-PcgrGwgw1nhrXIUHWBw8RNF8g/exec'; 

const FALLBACK_RAISED = 9280000; 
const FALLBACK_GOAL = 18000000;

document.addEventListener('DOMContentLoaded', () => {
    
    // Xử lý hiệu ứng cuộn mượt (Smooth scroll)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            try {
                const target = document.querySelector(targetId);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                // Fails silently if href is not a valid CSS selector
            }
        });
    });

    // Kéo dữ liệu từ API
    async function fetchFundraiserData() {
        try {
            // Đi "hút" dữ liệu từ Server
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Lỗi kết nối mạng! Mã lỗi: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Ép kiểu đảm bảo dữ liệu là số, đề phòng API trả về dạng chuỗi.
            // (Giả sử API của bạn trả về object JSON có key là 'raised' hoặc 'total')
            const liveRaised = parseInt(data.raised || data.total, 10);
            
            // Nếu API trả về bị NaN hoặc undefined, dùng luôn số Fallback cho an toàn
            const finalRaised = isNaN(liveRaised) ? FALLBACK_RAISED : liveRaised;
            
            // Bạn có thể cho API trả về cả Goal, hoặc fix cứng Goal ở Frontend cũng được
            const finalGoal = data.goal ? parseInt(data.goal, 10) : FALLBACK_GOAL;

            updateLiveTracker(finalRaised, finalGoal); 
            
        } catch (error) {
            console.error('Không thể lấy API, đang sử dụng dữ liệu Fallback:', error);
            // Kích hoạt "kế hoạch B": Lỗi API thì web vẫn hiện số cũ, không bị sập giao diện
            updateLiveTracker(FALLBACK_RAISED, FALLBACK_GOAL); 
        }
    }

    // Cập nhật giao diện thanh Progress Bar
    function updateLiveTracker(raised, goal) {
        console.log(`Hàm updateLiveTracker VỪA BỊ GỌI! Số tiền: ${raised}`);
        console.trace();

        const percentage = Math.min(Math.round((raised / goal) * 100), 100);

        const raisedDisplay = document.getElementById('raised-display');
        if (raisedDisplay) {
            raisedDisplay.textContent = raised.toLocaleString('vi-VN') + ' VND';
        }

        const percentDisplay = document.getElementById('percent-display');
        if (percentDisplay) {
            percentDisplay.textContent = percentage + '%';
        }

        const subtextDisplay = document.getElementById('subtext-display');
        if (subtextDisplay) {
            subtextDisplay.textContent = `Đã được quyên góp trên tổng ${goal.toLocaleString('vi-VN')} VND`;
        }
        
        const progressBar = document.getElementById('progress-bar') || document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
    }

    // Kích hoạt ngay khi load trang
    fetchFundraiserData();
});