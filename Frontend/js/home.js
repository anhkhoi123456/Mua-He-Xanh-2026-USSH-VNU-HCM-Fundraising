

/* Copyright (c) 2026 Tran Duong Anh Khoi. Licensed under the MIT License. */


const API_URL = 'https://api.yourwebsite.com/fundraiser-stats'; 
const FALLBACK_RAISED = 9280000; 
const FALLBACK_GOAL = 16000000;

document.addEventListener('DOMContentLoaded', () => {
    
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


    async function fetchFundraiserData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network error');
            
            const data = await response.json();
            updateLiveTracker(data.currentRaised, data.targetGoal);
            
        } catch (error) {
            console.warn("Backend API offline or placeholder URL used. Falling back to local data.");
            // Uses real progress values so the user dashboard stays filled
            updateLiveTracker(FALLBACK_RAISED, FALLBACK_GOAL); 
        }
    }

    function updateLiveTracker(raised, goal) {
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

    // Initialize the metrics lookups immediately
    fetchFundraiserData();
});