/* ============================================
   MADANA MAHOTSAVA - Main Script
   ============================================ */

// ============================================
// MIXPANEL HELPER
// ============================================

function mpTrack(eventName, properties) {
    try {
        if (window.mixpanel) {
            mixpanel.track(eventName, properties || {});
        }
    } catch (e) {
        console.log('Mixpanel track error:', e);
    }
}

// ============================================
// PAGE NAVIGATION
// ============================================

function nextPage(pageId) {
    // Get current active page
    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(pageId);
    
    if (!targetPage || currentPage === targetPage) return;

    // --- Mixpanel: track page navigation ---
    const pageNames = {
        page1: 'Landing',
        page2: 'History Lesson',
        page3: 'Invitation',
        page4: 'The Grand Plan',
        page5: 'Roast Preview',
        page6: 'Virtual Drive'
    };
    mpTrack('Page Navigated', {
        from_page: currentPage.id,
        from_page_name: pageNames[currentPage.id] || currentPage.id,
        to_page: pageId,
        to_page_name: pageNames[pageId] || pageId
    });
    
    // Remove active class from current page
    currentPage.classList.remove('active');
    
    // Add active class to target page
    targetPage.classList.add('active');
    
    // Reset scroll position to top
    targetPage.scrollTop = 0;
    
    // Trigger animations on new page
    const fadeElements = targetPage.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = null;
    });
    
    // Special handling for specific pages
    if (pageId === 'page3') {
        initScrollInvitation();
        initRunawayButton();
    }
    
    if (pageId === 'page5') {
        initCarousel();
    }
    
    if (pageId === 'page6') {
        initDrivePage();
    }
}

// ============================================
// PAGE 3 - SCROLL INVITATION ANIMATION
// ============================================

let scrollInitialized = false;

function initScrollInvitation() {
    const scrollContainer = document.querySelector('#page3 .scroll-container');
    const scrollRolled = document.getElementById('scrollRolled');
    
    if (!scrollContainer || !scrollRolled) return;
    
    // Reset scroll state when page opens
    scrollContainer.classList.remove('scroll-opened');
    
    // Add click handler to open scroll
    if (!scrollInitialized) {
        scrollRolled.addEventListener('click', openScroll);
        scrollRolled.addEventListener('touchend', (e) => {
            e.preventDefault();
            openScroll();
        });
        scrollInitialized = true;
    }
}

function openScroll() {
    const scrollContainer = document.querySelector('#page3 .scroll-container');
    if (scrollContainer && !scrollContainer.classList.contains('scroll-opened')) {
        scrollContainer.classList.add('scroll-opened');
        mpTrack('Invitation Scroll Opened');
    }
}

// ============================================
// PAGE 3 - RUNAWAY "NO" BUTTON
// ============================================

let noButtonInitialized = false;

function initRunawayButton() {
    if (noButtonInitialized) return;
    
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;
    
    const scrollContainer = document.querySelector('#page3 .scroll-container');
    
    // Event listeners for the runaway effect
    noBtn.addEventListener('mouseenter', runAway);
    noBtn.addEventListener('touchstart', runAway);
    noBtn.addEventListener('focus', runAway);
    
    noButtonInitialized = true;
}

function runAway(e) {
    e.preventDefault();
    const noBtn = document.getElementById('noBtn');
    const page3 = document.getElementById('page3');

    // Move button out of scroll-paper to page3 directly so it isn't clipped by overflow:hidden / transforms
    if (noBtn.parentElement !== page3) {
        page3.appendChild(noBtn);
    }

    mpTrack('No Button Attempted');
    
    // Get button dimensions
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    // Safe margin from edges
    const margin = 20;
    const minX = margin;
    const minY = margin;
    const maxX = window.innerWidth - btnWidth - margin;
    const maxY = window.innerHeight - btnHeight - margin;
    
    // Generate random position clamped within viewport
    let newX, newY;
    const currentRect = noBtn.getBoundingClientRect();
    const minDistance = 120;
    let attempts = 0;
    
    do {
        newX = Math.random() * (maxX - minX) + minX;
        newY = Math.random() * (maxY - minY) + minY;
        attempts++;
    } while (
        attempts < 20 &&
        Math.abs(newX - currentRect.left) < minDistance && 
        Math.abs(newY - currentRect.top) < minDistance
    );
    
    // Clamp to ensure it stays fully within viewport
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
    
    // Apply new position
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    noBtn.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    noBtn.style.margin = '0';
    
    // Add playful messages
    const messages = [
        "Thak jaogi cutie! 😂",
        "Mann Jao!",
        "Nahi karna chahiye! 🤔",
        "Itni jaldi? 😜",
        "Hehe! 😏",
        "Try again! 😂",
    ];
    
    noBtn.textContent = messages[Math.floor(Math.random() * messages.length)];
}

// ============================================
// PAGE 5 - IMAGE CAROUSEL
// ============================================

let currentSlide = 0;
let totalSlides = 0;
let carouselInitialized = false;

function initCarousel() {
    if (carouselInitialized) return;
    
    const slides = document.querySelectorAll('#page5 .slide');
    totalSlides = slides.length;
    
    // Create dots
    const dotsContainer = document.getElementById('carouselDots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            mpTrack('Carousel Dot Clicked', { slide_index: i });
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    }
    
    carouselInitialized = true;
}

function nextSlide() {
    mpTrack('Carousel Next Slide', { slide_index: (currentSlide + 1) % totalSlides });
    goToSlide((currentSlide + 1) % totalSlides);
}

function prevSlide() {
    mpTrack('Carousel Prev Slide', { slide_index: (currentSlide - 1 + totalSlides) % totalSlides });
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('#page5 .slide');
    const dots = document.querySelectorAll('#page5 .dot');
    
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('prev');
    dots[currentSlide]?.classList.remove('active');
    
    // Set new slide
    currentSlide = index;
    
    // Remove prev class and add active
    setTimeout(() => {
        slides.forEach(slide => slide.classList.remove('prev'));
        slides[currentSlide].classList.add('active');
        dots[currentSlide]?.classList.add('active');
    }, 50);
}

// ============================================
// PAGE 6 - VIRTUAL DRIVE & MUSIC PLAYER
// ============================================

let audioPlayer;
let isPlaying = false;
let currentTrack = null;

const tracks = {
    lofi: {
        name: "Lofi Chill Beats",
        // Using a placeholder - in production, use actual audio files
        src: "assets/audio/song1.mp3"
    },
    bollywood: {
        name: "Bollywood Romantic",
        src: "assets/audio/song2.mp3"
    }
};

function initDrivePage() {
    audioPlayer = document.getElementById('audioPlayer');
    const video = document.getElementById('driveVideo');
    
    // Try to play video
    if (video) {
        video.play().catch(e => {
            console.log('Video autoplay prevented:', e);
        });
    }
    
    // Set up audio player events
    if (audioPlayer) {
        audioPlayer.addEventListener('ended', () => {
            // Loop the track
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        });
        
        audioPlayer.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButton();
            document.querySelector('.vinyl')?.classList.add('playing');
        });
        
        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButton();
            document.querySelector('.vinyl')?.classList.remove('playing');
        });
    }
}

function selectTrack(trackKey) {
    const track = tracks[trackKey];
    if (!track || !audioPlayer) return;

    mpTrack('Track Selected', { track: trackKey, track_name: track.name });
    
    // Update UI
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${trackKey}Btn`)?.classList.add('active');
    
    // Update song title
    document.getElementById('songTitle').textContent = track.name;
    
    // Load and play track
    currentTrack = trackKey;
    audioPlayer.src = track.src;
    
    // Try to play
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayButton();
    }).catch(e => {
        console.log('Audio play prevented:', e);
        // Show user they need to click play
        document.getElementById('songTitle').textContent = track.name + ' (Click play)';
    });
}

function togglePlay() {
    if (!audioPlayer) return;
    
    if (!currentTrack) {
        // No track selected, select lofi by default
        selectTrack('lofi');
        return;
    }
    
    if (isPlaying) {
        mpTrack('Music Paused', { track: currentTrack });
        audioPlayer.pause();
    } else {
        mpTrack('Music Played', { track: currentTrack });
        audioPlayer.play().catch(e => {
            console.log('Audio play prevented:', e);
        });
    }
}

function updatePlayButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Madana Mahotsava loaded!');

    mpTrack('Page Loaded', { page: 'Landing' });
    
    // Initialize first page animations
    const firstPage = document.querySelector('.page.active');
    if (firstPage) {
        const fadeElements = firstPage.querySelectorAll('.fade-in');
        fadeElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // --- Mixpanel: track Add to Calendar link ---
    const calendarLink = document.querySelector('.action-buttons a.btn.secondary');
    if (calendarLink) {
        calendarLink.addEventListener('click', () => {
            mpTrack('Add to Calendar Clicked');
        });
    }
    
    // Preload next pages for smooth transitions
    preloadAssets();
});

function preloadAssets() {
    // Preload video if available
    const video = document.getElementById('driveVideo');
    if (video) {
        video.preload = 'auto';
    }
}

// ============================================
// KEYBOARD NAVIGATION (Accessibility)
// ============================================

document.addEventListener('keydown', (e) => {
    // Allow Enter/Space on buttons
    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && focused.classList.contains('btn')) {
            focused.click();
        }
    }
    
    // Arrow keys for carousel on page 5
    const page5 = document.getElementById('page5');
    if (page5 && page5.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    }
    
    // Space to toggle music on page 6
    const page6 = document.getElementById('page6');
    if (page6 && page6.classList.contains('active') && e.key === ' ') {
        e.preventDefault();
        togglePlay();
    }
});

// ============================================
// TOUCH GESTURES FOR MOBILE
// ============================================

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const page5 = document.getElementById('page5');
    if (!page5 || !page5.classList.contains('active')) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next slide
            nextSlide();
        } else {
            // Swiped right - prev slide
            prevSlide();
        }
    }
}

// ============================================
// UTILITY: Google Calendar Link Generator
// ============================================

function generateCalendarLink() {
    // Feb 14, 2026, 8:00 PM IST (UTC+5:30) = 2:30 PM UTC
    const startDate = '20260214T143000Z';
    // End at 11:30 PM IST = 6:00 PM UTC
    const endDate = '20260214T180000Z';
    
    const event = {
        text: 'Vasant Mahotsava 🌸',
        dates: `${startDate}/${endDate}`,
        details: `Virtual celebration of love, Indian style.\n\n8 PM - Virtual Dinner\n9 PM - Roasting Session\n10 PM - Virtual Long Drive`,
        location: 'Google Meet'
    };
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
}
