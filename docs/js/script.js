// Gallery and Lightbox functionality
let currentPhotoIndex = 0;
let imageObserver = null;

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

// Performance optimization utilities
const PerformanceUtils = {
    // Debounce function for scroll events and other high-frequency events
    debounce: function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Throttle function for smooth performance
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Request idle callback with fallback
    requestIdleCallback: function(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback, options);
        }
        // Fallback for browsers without requestIdleCallback
        return setTimeout(() => callback({ timeRemaining: () => 50 }), 1);
    },

    // Cancel idle callback with fallback
    cancelIdleCallback: function(id) {
        if ('cancelIdleCallback' in window) {
            return window.cancelIdleCallback(id);
        }
        return clearTimeout(id);
    }
};

// Virtual Scrolling Implementation
class VirtualScroller {
    constructor(options = {}) {
        this.container = options.container;
        this.items = options.items || [];
        this.itemHeight = options.itemHeight || 200;
        this.bufferSize = options.bufferSize || 5;
        this.visibleItems = [];
        this.scrollTop = 0;
        this.containerHeight = 0;

        this.init();
    }

    init() {
        if (!this.container) return;

        this.containerHeight = this.container.clientHeight;
        this.setupScrollHandler();
        this.render();

        // Observe container size changes
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    if (entry.target === this.container) {
                        this.containerHeight = entry.contentRect.height;
                        this.render();
                    }
                }
            });
            resizeObserver.observe(this.container);
        }
    }

    setupScrollHandler() {
        const throttledScroll = PerformanceUtils.throttle(() => {
            this.scrollTop = this.container.scrollTop;
            this.render();
        }, 16);

        this.container.addEventListener('scroll', throttledScroll, { passive: true });
    }

    render() {
        const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
        const endIndex = Math.min(
            this.items.length - 1,
            Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.bufferSize
        );

        // Calculate visible items
        const visibleItems = [];
        for (let i = startIndex; i <= endIndex; i++) {
            if (this.items[i]) {
                visibleItems.push({
                    ...this.items[i],
                    index: i,
                    top: i * this.itemHeight
                });
            }
        }

        this.visibleItems = visibleItems;

        // Update DOM
        PerformanceUtils.requestIdleCallback(() => {
            this.updateDOM();
        });
    }

    updateDOM() {
        // This would be implemented based on the specific rendering needs
        // For now, it's a placeholder for virtual scrolling logic
    }

    // Update items and re-render
    updateItems(newItems) {
        this.items = newItems;
        this.render();
    }

    // Scroll to specific item
    scrollToItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.container.scrollTop = index * this.itemHeight;
        }
    }

    // Get visible item indices
    getVisibleRange() {
        return {
            start: this.visibleItems.length > 0 ? this.visibleItems[0].index : 0,
            end: this.visibleItems.length > 0 ? this.visibleItems[this.visibleItems.length - 1].index : 0
        };
    }
}

// Infinite Scroll Implementation (for future use with many images)
class InfiniteScroll {
    constructor(options = {}) {
        this.container = options.container;
        this.loadMoreCallback = options.loadMoreCallback;
        this.threshold = options.threshold || 100; // pixels from bottom
        this.isLoading = false;
        this.hasMore = true;

        this.init();
    }

    init() {
        if (!this.container) return;

        const throttledScroll = PerformanceUtils.throttle(() => {
            this.checkLoadMore();
        }, 200);

        this.container.addEventListener('scroll', throttledScroll, { passive: true });
    }

    checkLoadMore() {
        if (this.isLoading || !this.hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = this.container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        if (distanceFromBottom < this.threshold) {
            this.loadMore();
        }
    }

    async loadMore() {
        if (this.isLoading || !this.hasMore) return;

        this.isLoading = true;
        console.log('🔄 Loading more items...');

        try {
            const hasMore = await this.loadMoreCallback();
            this.hasMore = hasMore !== false;

            if (!this.hasMore) {
                console.log('✅ No more items to load');
            }
        } catch (error) {
            console.error('❌ Error loading more items:', error);
        } finally {
            this.isLoading = false;
        }
    }

    reset() {
        this.isLoading = false;
        this.hasMore = true;
    }
}

// Optimized scroll handler example (for future use)
function createOptimizedScrollHandler(callback, options = {}) {
    const { debounceDelay = 16, throttleLimit = 16 } = options;

    if (options.debounce) {
        return PerformanceUtils.debounce(callback, debounceDelay);
    } else if (options.throttle) {
        return PerformanceUtils.throttle(callback, throttleLimit);
    }

    return callback;
}

// Initialize Intersection Observer for efficient lazy loading
function initImageObserver() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without Intersection Observer support
        console.warn('Intersection Observer not supported, using fallback lazy loading');
        return;
    }

    const options = {
        root: null,
        rootMargin: '50px 0px', // Start loading 50px before image enters viewport
        threshold: 0.01
    };

    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                imageObserver.unobserve(img);
            }
        });
    }, options);
}

// Preload critical images for better performance
function preloadCriticalImages() {
    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    if (photos.length === 0) return;

    // Preload first 3 images (critical for initial view)
    const criticalImages = photos.slice(0, 3);

    criticalImages.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
            // Cache the image for immediate use when needed
            if (index === 0) {
                // First image is most critical, preload with high priority
                preloadImage(photo.src, 'high');
            }
        };
        img.src = photo.src;
    });
}

// Enhanced image preloading with priority support
function preloadImage(src, priority = 'auto') {
    if (!src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;

    if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
    }

    // Add to head temporarily for preloading
    document.head.appendChild(link);

    // Remove after a short delay to avoid cluttering head
    setTimeout(() => {
        if (link.parentNode) {
            link.parentNode.removeChild(link);
        }
    }, 3000);
}

// Load image with optimized loading
function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create new image for preloading
    const newImg = new Image();
    newImg.onload = () => {
        img.src = src;
        // Apply responsive attributes if available
        const srcset = img.dataset.srcset;
        const sizes = img.dataset.sizes;
        if (srcset) img.srcset = srcset;
        if (sizes) img.sizes = sizes;

        img.style.opacity = '1';
        const placeholder = img.parentElement?.querySelector('.gallery-item-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        img.classList.add('loaded');
    };

    newImg.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23333"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23666"%3EImage not found%3C%2Ftext%3E%3C%2Fsvg%3E';
        img.alt = 'Image not found';
        img.style.opacity = '1';
        const placeholder = img.parentElement?.querySelector('.gallery-item-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    };

    newImg.src = src;
}

// Initialize Gallery
function initGallery() {
    initTheme();
    initImageObserver();

    // galleryPhotosReady가 있으면 데이터 로드 이후 렌더링
    const readyPromise = window.galleryPhotosReady instanceof Promise
        ? window.galleryPhotosReady
        : Promise.resolve(window.galleryPhotos || []);

    readyPromise.then(() => {
        preloadCriticalImages();
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

// Render Gallery Items with optimized DOM manipulation
function renderGallery() {
    const photos = Array.isArray(window.galleryPhotos) ? window.galleryPhotos : [];
    if (photos.length === 0) {
        galleryGrid.innerHTML = '<p style="text-align:center;color:var(--text-tertiary)">이미지를 찾을 수 없습니다.</p>';
        return;
    }

    // Shuffle photos randomly each time
    const shuffledPhotos = shuffleArray(photos);

    // Create DocumentFragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    // Calculate ad insertion point (around middle of gallery)
    const totalItems = shuffledPhotos.length;
    const adInsertionPoint = Math.floor(totalItems / 2); // Insert ad in the middle

    // Render all images using fragment
    shuffledPhotos.forEach((photo, index) => {
        // Insert ad in the middle
        if (index === adInsertionPoint) {
            const adElement = createAdElement();
            fragment.appendChild(adElement);
        }

        // Find original index for lightbox navigation
        const originalIndex = photos.findIndex(p => p.src === photo.src);
        const galleryItem = createGalleryItem(photo, originalIndex);
        fragment.appendChild(galleryItem);
    });

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        galleryGrid.innerHTML = ''; // Clear existing content
        galleryGrid.appendChild(fragment);

        // Add fade-in animation class after insertion
        galleryGrid.classList.add('rendered');

        // Initialize ads after gallery is rendered
        initializeAds();
    });
}

// Create Ad Element for gallery
function createAdElement() {
    const adContainer = document.createElement('div');
    adContainer.className = 'gallery-ad-item';
    adContainer.style.cssText = `
        grid-column: 1 / -1;
        margin: 30px 0;
        padding: 20px;
        background: var(--bg-primary, #ffffff);
        border-radius: 12px;
        border: 1px solid var(--border-color, #e0e0e0);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 120px;
    `;

    adContainer.innerHTML = `
        <div class="gallery-ad-content">
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8699046198561974"
                 crossorigin="anonymous"></script>
            <ins class="adsbygoogle"
                 style="display:block; text-align:center;"
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-8699046198561974"
                 data-ad-slot="6646530638"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        </div>
    `;

    return adContainer;
}

// Initialize Ads after gallery rendering
function initializeAds() {
    // Ensure AdSense is loaded and initialize any new ads
    if (window.adsbygoogle && window.adsbygoogle.loaded) {
        try {
            // Initialize ads with error handling
            const ads = document.querySelectorAll('.adsbygoogle');
            ads.forEach(ad => {
                if (!ad.hasAttribute('data-adsbygoogle-status')) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            });
        } catch (e) {
            console.warn('AdSense initialization error:', e);
        }
    }

    // Setup lazy loading for ads that are not immediately visible
    setupAdLazyLoading();
}

// Setup lazy loading for ads
function setupAdLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer not supported, ads will load immediately');
        return;
    }

    const adObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const adContainer = entry.target;
                const adElement = adContainer.querySelector('.adsbygoogle');

                if (adElement && !adElement.hasAttribute('data-adsbygoogle-status')) {
                    loadAdWithFallback(adContainer, adElement);
                }

                // Stop observing once loaded
                adObserver.unobserve(adContainer);
            }
        });
    }, {
        root: null,
        rootMargin: '50px 0px', // Load 50px before ad enters viewport
        threshold: 0.1
    });

    // Observe all ad containers
    const adContainers = document.querySelectorAll('.gallery-ad-item, .ads-section');
    adContainers.forEach(container => {
        adObserver.observe(container);
    });
}

// Load ad with fallback handling
function loadAdWithFallback(container, adElement) {
    const startTime = performance.now();

    try {
        // Check if AdSense is ready
        if (!window.adsbygoogle) {
            console.warn('AdSense not loaded, showing fallback');
            showAdFallback(container);
            return;
        }

        // Load the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        // Monitor ad loading success/failure
        const checkAdStatus = () => {
            const loadTime = performance.now() - startTime;

            if (adElement.hasAttribute('data-adsbygoogle-status')) {
                const status = adElement.getAttribute('data-adsbygoogle-status');
                console.log(`Ad loaded in ${loadTime.toFixed(2)}ms with status: ${status}`);

                if (status === 'done') {
                    // Ad loaded successfully
                    container.classList.add('ad-loaded');
                } else {
                    // Ad failed to load
                    console.warn('Ad failed to load properly');
                    showAdFallback(container);
                }
            } else {
                // Check again after a short delay
                setTimeout(checkAdStatus, 100);
            }
        };

        // Start monitoring after a brief delay
        setTimeout(checkAdStatus, 500);

    } catch (e) {
        console.warn('Ad loading error:', e);
        showAdFallback(container);
    }
}

// Show fallback content when ad fails to load
function showAdFallback(container) {
    const loadTime = performance.now();

    // Create fallback content
    const fallback = document.createElement('div');
    fallback.className = 'ad-fallback';
    fallback.innerHTML = `
        <div style="
            padding: 20px;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
            background: var(--bg-secondary);
            border-radius: 8px;
            border: 1px dashed var(--border-color);
        ">
            <div style="margin-bottom: 10px;">📸</div>
            <div>Advertisement</div>
        </div>
    `;

    // Replace ad content with fallback
    container.innerHTML = '';
    container.appendChild(fallback);
    container.classList.add('ad-fallback-shown');

    console.log(`Ad fallback shown after ${loadTime.toFixed(2)}ms`);
}

// Create Gallery Item Element
function createGalleryItem(photo, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;
    
    // Determine if this is the first image (LCP candidate)
    const isFirstImage = index === 0;
    const fetchPriority = isFirstImage ? 'high' : 'auto';
    
    // Create placeholder to prevent layout shift
    item.innerHTML = `
        <div class="gallery-item-placeholder" style="width: 100%; height: 100%; background-color: var(--gallery-item-bg); display: flex; align-items: center; justify-content: center;">
            <div style="color: var(--text-tertiary); font-size: 0.9rem;">Loading...</div>
        </div>
        <img data-src="${photo.src}"
             data-srcset="${photo.src} 900w"
             data-sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
             alt="${photo.title}"
             fetchpriority="${fetchPriority}"
             style="position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 0.3s ease;">
    `;
    
    const img = item.querySelector('img');

    // For first image, load immediately for LCP optimization
    if (isFirstImage) {
        loadImage(img);
    } else if (imageObserver) {
        // Use Intersection Observer for other images
        imageObserver.observe(img);
    } else {
        // Fallback for browsers without Intersection Observer
        img.src = photo.src;
        img.onload = function() {
            this.style.opacity = '1';
            const placeholder = this.parentElement?.querySelector('.gallery-item-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            this.classList.add('loaded');
        };
        img.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23333"%2F%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23666"%3EImage not found%3C%2Ftext%3E';
            this.alt = 'Image not found';
            this.style.opacity = '1';
            const placeholder = this.parentElement?.querySelector('.gallery-item-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };
    }

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

// Setup Event Listeners with event delegation optimization
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Gallery item click delegation (event delegation for better performance)
    galleryGrid.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            const index = parseInt(galleryItem.dataset.index);
            if (!isNaN(index)) {
                openLightbox(index);
            }
        }
    });

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

// Performance monitoring and Core Web Vitals tracking
function initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window || 'PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime, 'ms');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP monitoring not supported');
            }
        }

        // FID (First Input Delay) - only when user interacts
        if ('PerformanceObserver' in window) {
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log('FID:', entry.processingStart - entry.startTime, 'ms');
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID monitoring not supported');
            }
        }

        // CLS (Cumulative Layout Shift)
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    console.log('CLS:', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS monitoring not supported');
            }
        }
    }

    // Monitor image loading performance
    const imageLoadTimes = new Map();

    // Override loadImage to track performance
    const originalLoadImage = loadImage;
    loadImage = function(img) {
        const startTime = performance.now();
        const src = img.dataset.src;

        originalLoadImage.call(this, img);

        // Track when image finishes loading
        const originalOnload = img.onload;
        img.onload = function() {
            const loadTime = performance.now() - startTime;
            console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`);
            imageLoadTimes.set(src, loadTime);

            if (originalOnload) {
                originalOnload.call(this);
            }
        };
    };

    // Log performance summary
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Performance Summary:');
                console.log('DNS Lookup:', perfData.domainLookupEnd - perfData.domainLookupStart, 'ms');
                console.log('TCP Connect:', perfData.connectEnd - perfData.connectStart, 'ms');
                console.log('Server Response:', perfData.responseStart - perfData.requestStart, 'ms');
                console.log('Page Load:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
                console.log('DOM Processing:', perfData.domContentLoadedEventEnd - perfData.responseEnd, 'ms');
            }
        }, 100);
    });
}

// Memory management and cleanup
function initMemoryManagement() {
    // Track active event listeners for cleanup
    const activeEventListeners = new Map();

    // Track Intersection Observer instances
    const activeObservers = new Set();

    // Cleanup function
    window.galleryCleanup = function() {
        // Disconnect all Intersection Observers
        activeObservers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        activeObservers.clear();

        // Clear image cache
        if (window.imageCache) {
            window.imageCache.clear();
        }

        // Remove event listeners
        activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        activeEventListeners.clear();

        console.log('🧹 Memory cleanup completed');
    };

    // Track event listeners for cleanup
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(event, handler, options) {
        if (!activeEventListeners.has(this)) {
            activeEventListeners.set(this, []);
        }
        activeEventListeners.get(this).push({ event, handler });

        return originalAddEventListener.call(this, event, handler, options);
    };

    // Track Intersection Observers
    const originalObserve = IntersectionObserver.prototype.observe;
    IntersectionObserver.prototype.observe = function(target) {
        activeObservers.add(this);
        return originalObserve.call(this, target);
    };

    // Auto cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.galleryCleanup) {
            window.galleryCleanup();
        }
    });

    // Periodic cleanup (every 5 minutes)
    setInterval(() => {
        // Clean up completed image promises
        if (window.imagePromises) {
            window.imagePromises = window.imagePromises.filter(promise => {
                return promise && typeof promise.then === 'function' && promise.status !== 'fulfilled';
            });
        }
    }, 300000); // 5 minutes
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPerformanceMonitoring();
        initMemoryManagement();
        initGallery();
    });
} else {
    initPerformanceMonitoring();
    initMemoryManagement();
    initGallery();
}