const sliderWrapper = document.querySelector('.slider-wrapper');
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const stopBtn = document.querySelector('.stop-btn');

let currentSlide = 0;
const totalSlides = slides.length;
let autoSlideInterval;


// 슬라이드 이동
function goToSlide(index) {
    // 인덱스 범위 체크
    if (index < 0) {
        currentSlide = totalSlides - 1;
    } else if (index >= totalSlides) {
        currentSlide = 0;
    } else {
        currentSlide = index;
    }

    // 슬라이드 이동
    sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateIndicators();
}


// 인디케이터 업데이트
function updateIndicators() {
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// 다음 슬라이드로
function nextSlide() {
    goToSlide(currentSlide + 1);
}

// 이전 슬라이드로
function prevSlide() {
    goToSlide(currentSlide - 1);
}

// 자동 슬라이드 시작
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 3000); // 3초마다 자동 전환
}

// 자동 슬라이드 정지
function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// 인디케이터 클릭 이벤트
indicators.forEach((indicator) => {
    indicator.addEventListener('click', () => {
        const slideIndex = parseInt(indicator.getAttribute('data-slide'));
        goToSlide(slideIndex);
        stopAutoSlide();
        startAutoSlide();
    });
});



// 초기 자동 슬라이드 시작
startAutoSlide();