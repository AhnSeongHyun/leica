// Gallery and Lightbox functionality
let currentPhotoIndex = 0;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const themeToggle = document.getElementById('themeToggle');

// Shuffle array randomly using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize Gallery
function initGallery() {
    initTheme();
    // galleryPhotosReady가 있으면 데이터 로드 이후 렌더링
    const readyPromise = window.galleryPhotosReady instanceof Promise
        ? window.galleryPhotosReady
        : Promise.resolve(window.galleryPhotos || []);

    readyPromise.then(() => {
        renderGallery();
        setupEventListeners();
    });
}

// Initialize Theme
function initTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Render Gallery Items
function renderGallery() {
    galleryGrid.innerHTML = '';

    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    if (photos.length === 0) {
        galleryGrid.innerHTML = '<p style="text-align:center;color:var(--muted-text)">이미지를 찾을 수 없습니다.</p>';
        return;
    }

    // Shuffle photos randomly each time
    const shuffledPhotos = shuffleArray(photos);

    shuffledPhotos.forEach((photo, index) => {
        // Find original index for lightbox navigation
        const originalIndex = photos.findIndex(p => p.src === photo.src);
        const galleryItem = createGalleryItem(photo, originalIndex);
        galleryGrid.appendChild(galleryItem);
    });
}

// Create Gallery Item Element
function createGalleryItem(photo, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;
    
    item.innerHTML = `
        <img src="${photo.src}" alt="${photo.title}" loading="lazy">
        <div class="gallery-item-overlay">
            <h3 class="gallery-item-title">${photo.title}</h3>
            <p class="gallery-item-date">${photo.date}</p>
        </div>
    `;
    
    // Handle image load error
    const img = item.querySelector('img');
    img.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23333"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23666"%3EImage not found%3C%2Ftext%3E%3C%2Fsvg%3E';
        this.alt = 'Image not found';
    };
    
    item.addEventListener('click', () => openLightbox(index));
    
    return item;
}

// Open Lightbox
function openLightbox(index) {
    currentPhotoIndex = index;
    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    const photo = photos[currentPhotoIndex];
    
    if (photo) {
        lightboxImage.src = photo.src;
        lightboxImage.alt = photo.title || '';
        const captionTitle = photo.title || '';
        const captionBody = photo.caption || '';
        lightboxCaption.textContent = captionBody ? `${captionTitle} - ${captionBody}` : captionTitle;
    }
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Handle lightbox image load error
    lightboxImage.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23333"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23666"%3EImage not found%3C%2Ftext%3E%3C%2Fsvg%3E';
        this.alt = 'Image not found';
    };
}

// Close Lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImage.src = '';
}

// Navigate to Previous Photo
function prevPhoto() {
    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    if (photos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    openLightbox(currentPhotoIndex);
}

// Navigate to Next Photo
function nextPhoto() {
    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    if (photos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    openLightbox(currentPhotoIndex);
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevPhoto);
    lightboxNext.addEventListener('click', nextPhoto);
    
    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevPhoto();
                break;
            case 'ArrowRight':
                nextPhoto();
                break;
        }
    });
    
    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left
                nextPhoto();
            } else {
                // Swiped right
                prevPhoto();
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}