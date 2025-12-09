        const searchToggleBtn = document.getElementById('search-toggle-btn'); 
        const searchBar = document.getElementById('search-bar');
        const mainNav = document.getElementById('main-nav');
        const body = document.body;
        const visitorEncart = document.querySelector('.visitor-encart'); 

        const headerMainHeight = 90; 
        const searchBarHeight = 100; 
        const encartBaseTop = 505;

        searchToggleBtn.addEventListener('click', () => {
            const isSearchBarActive = searchBar.classList.contains('active');
            
            searchBar.classList.toggle('active');
            body.classList.toggle('search-active');
            
            if (isSearchBarActive) {
                mainNav.style.top = `${headerMainHeight}px`;
                visitorEncart.style.top = `${encartBaseTop}px`; 
                
            } else {
                mainNav.style.top = `${headerMainHeight + searchBarHeight}px`;
                visitorEncart.style.top = `${encartBaseTop + searchBarHeight}px`; 
                
                searchBar.querySelector('input').focus();
            }
        });

        const scrollToTopBtn = document.getElementById('scrollToTopBtn'); 

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'flex'; 
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        const parallaxSection = document.getElementById('parallaxImageSection');
        const parallaxImage = parallaxSection ? parallaxSection.querySelector('.Parallax_image') : null; 

        const parallaxImageHeightPercentage = 200; 

        function updateParallax() {
            if (!parallaxSection || !parallaxImage) return;

            const rect = parallaxSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const scrollPercent = 1 - (rect.bottom / (viewportHeight + rect.height));
            const containerHeight = parallaxSection.offsetHeight;
            
            const travelRange = (parallaxImageHeightPercentage - 100) / 100; 
            const maxTravel = containerHeight * travelRange; 

            let translateY = maxTravel * (scrollPercent - 1);
            
            parallaxImage.style.transform = `translateY(${translateY}px)`;
        }


        window.addEventListener('scroll', updateParallax);

        window.addEventListener('DOMContentLoaded', updateParallax);
        window.addEventListener('resize', updateParallax);


document.addEventListener('DOMContentLoaded', () => {
    const artifactItems = document.querySelectorAll('.artifact-item');


    const firstRowItems = [
        artifactItems[0], 
        artifactItems[1], 
        artifactItems[2]
    ];

    if ('IntersectionObserver' in window) {

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {

                    artifactItems.forEach(img => img.classList.add('is-visible'));

                    observer.disconnect(); 
                }
            });
        }, observerOptions);

        firstRowItems.forEach(item => observer.observe(item));

    } else {
        artifactItems.forEach(item => {
            item.classList.add('is-visible');
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('heroVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (heroVideo && playPauseBtn) {
        let isPlaying = true; 

        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                heroVideo.pause(); 
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; 
                isPlaying = false;
            } else {
                heroVideo.play(); 
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; 
                isPlaying = true;
            }
        });

    }
});