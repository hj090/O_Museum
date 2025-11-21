
       // ------------------ JavaScript for Header and Search Bar ------------------
        // 기존 파일의 ID를 사용하도록 변수명을 수정합니다.
        const searchToggleBtn = document.getElementById('search-toggle-btn'); 
        const searchBar = document.getElementById('search-bar');
        const mainNav = document.getElementById('main-nav');
        const body = document.body;
        // [추가] visitor-encart 요소를 선택합니다.
        const visitorEncart = document.querySelector('.visitor-encart'); 

        // CSS 변수에서 높이 가져오기 
        const headerMainHeight = 90; 
        const searchBarHeight = 100; 
        // [추가] visitor-encart의 기본 top 위치 (CSS에 설정된 505px)
        const encartBaseTop = 505;

        searchToggleBtn.addEventListener('click', () => {
            const isSearchBarActive = searchBar.classList.contains('active');
            
            // 검색창과 body padding-top을 토글
            searchBar.classList.toggle('active');
            body.classList.toggle('search-active');
            
            // 네비게이션 바와 Visitor Encart의 위치 조정
            if (isSearchBarActive) {
                // 검색창 비활성화 (닫힐 때): 원래 위치로 복귀
                mainNav.style.top = `${headerMainHeight}px`;
                // [수정] visitor-encart를 원래 위치(505px)로 복귀
                visitorEncart.style.top = `${encartBaseTop}px`; 
                
            } else {
                // 검색창 활성화 (열릴 때): 아래로 100px 이동
                mainNav.style.top = `${headerMainHeight + searchBarHeight}px`;
                // [수정] visitor-encart를 아래로 100px 이동 (505px + 100px = 605px)
                visitorEncart.style.top = `${encartBaseTop + searchBarHeight}px`; 
                
                // 검색창이 열릴 때 input에 포커스
                searchBar.querySelector('input').focus();
            }
        });

        // ------------------ JavaScript for Scroll To Top ------------------
        const scrollToTopBtn = document.getElementById('scrollToTopBtn'); // ID를 사용하여 변수명 일치

        window.addEventListener('scroll', () => {
            // 스크롤 위치가 300px 이상일 때 버튼 표시
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'flex'; // CSS에서 flex로 중앙 정렬했으므로 'flex'로 표시
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

        // ------------------ JavaScript for Parallax (최종 수정된 로직) ------------------
        const parallaxSection = document.getElementById('parallaxImageSection');
        const parallaxImage = parallaxSection ? parallaxSection.querySelector('.Parallax_image') : null; 
        // [수정] CSS 변경에 맞춰 이미지 높이 비율을 200%로 변경했습니다.
        const parallaxImageHeightPercentage = 200; 

        function updateParallax() {
            if (!parallaxSection || !parallaxImage) return;

            const rect = parallaxSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // 1. 섹션 노출 비율 계산 (0: 시작 지점, 1: 끝 지점)
            const scrollPercent = 1 - (rect.bottom / (viewportHeight + rect.height));

            // 2. Parallax 효과를 위한 총 이동 거리 계산
            const containerHeight = parallaxSection.offsetHeight;
            
            // [수정] 이미지와 컨테이너 높이 차이 (100%)를 총 이동 범위로 사용합니다.
            const travelRange = (parallaxImageHeightPercentage - 100) / 100; // 1.0 (100%)
            const maxTravel = containerHeight * travelRange; // 컨테이너 높이의 100%
            
            // 3. 최종 Y축 이동 거리 계산 
            // scrollPercent가 0일 때 (시작) translateY는 -maxTravel (이미지 밑부분 정렬)
            // scrollPercent가 1일 때 (끝) translateY는 0 (이미지 윗부분 정렬)
            let translateY = maxTravel * (scrollPercent - 1);
            
            parallaxImage.style.transform = `translateY(${translateY}px)`;
        }

        // 스크롤 이벤트 리스너에 추가
        window.addEventListener('scroll', updateParallax);
        // 초기 로드 및 창 크기 변경 시 위치를 맞추기 위해 추가
        window.addEventListener('DOMContentLoaded', updateParallax);
        window.addEventListener('resize', updateParallax);

        // =========================================================
// ------------------ 4. Artifact Scroll Reveal Logic ------------------
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. 모든 아티팩트 아이템을 선택
    const artifactItems = document.querySelectorAll('.artifact-item');

    // Intersection Observer가 지원되는지 확인
    if ('IntersectionObserver' in window) {
        
        // 2. Observer 설정 정의
        const observerOptions = {
            root: null, // 뷰포트를 기준으로 감지
            rootMargin: '0px 0px -100px 0px', // 뷰포트 하단에서 100px 정도 여유를 두고 나타나게 설정
            threshold: 0.1 // 요소가 10% 이상 보일 때 감지
        };

        // 3. Observer 인스턴스 생성
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // 요소가 뷰포트 안에 들어왔을 때
                if (entry.isIntersecting) {
                    // is-visible 클래스를 추가하여 애니메이션 실행
                    entry.target.classList.add('is-visible');
                    
                    // 애니메이션이 한 번 실행된 후에는 관찰 중지 (리소스 절약)
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 4. 모든 아티팩트 아이템을 관찰 시작
        artifactItems.forEach(item => {
            observer.observe(item);
        });

    } else {
        // Intersection Observer를 지원하지 않는 구형 브라우저를 위한 대체 로직
        // (간단히 모든 항목을 바로 보이게 합니다.)
        artifactItems.forEach(item => {
            item.classList.add('is-visible');
        });
    }
});
// ------------------ Hero Video Play/Pause Logic ------------------
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.getElementById('heroVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (heroVideo && playPauseBtn) {
        // 초기 상태: 영상이 자동 재생 중이므로 버튼은 '정지' 아이콘으로 시작
        let isPlaying = true; 

        // 재생/정지 버튼 클릭 이벤트
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                heroVideo.pause(); // 영상 정지
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; // 재생 아이콘으로 변경
                isPlaying = false;
            } else {
                heroVideo.play(); // 영상 재생
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; // 정지 아이콘으로 변경
                isPlaying = true;
            }
        });

        // 영상이 끝났을 때 다시 자동 재생 (loop 속성이 있으므로 이 로직은 필수 아님)
        // heroVideo.addEventListener('ended', () => {
        //     heroVideo.play();
        // });
    }
});