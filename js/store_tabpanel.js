const tabInputs = document.querySelectorAll('input[name="tab"]');
const tabPanels = document.querySelectorAll('.tabpanel');

tabInputs.forEach(input => {
    input.addEventListener('change', () => {
        if (input.checked) {
            // 모든 탭 패널 숨기기
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });
                    
            // 선택된 탭 패널 표시
            const selectedPanel = document.querySelector(`[data-tab="${input.id}"]`);
            if (selectedPanel) {
                selectedPanel.classList.add('active');
            }
        }
    });
});


// 관심상품 버튼 기능
document.addEventListener('click', (e) => {
    if (e.target.closest('.wishlist-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const btn = e.target.closest('.wishlist-btn');
        const svg = btn.querySelector('svg');
        const card = btn.closest('.card');
        const productLink = card.querySelector('a');
        const productId = new URLSearchParams(productLink.href.split('?')[1]).get('id');
                
        // 로그인 확인 - 2410552 임유미 코드
        const currentUser = sessionStorage.getItem("currentUser");

        if (!currentUser) {
            // 로그인되어 있지 않은 경우
            alert("로그인 후 사용 가능합니다.");
            window.location.href = "login.html";
        } else {
            // 로그인되어 있는 경우
            // 상품 데이터 찾기
            const allProducts = [];
            for (let tabKey in cardData) {
                allProducts.push(...cardData[tabKey]);
            }
            const product = allProducts.find(p => p.id === parseInt(productId));
        
            // 관심상품 목록 가져오기
            let wishlist = JSON.parse(sessionStorage.getItem('wishlist')) || [];


            // 관심상품 상태 토글
            if (svg.style.fill === 'red') {
                svg.style.fill = 'none';
                svg.style.stroke = '#ffffff';
                alert('관심상품에서 삭제되었습니다.');

                wishlist = wishlist.filter(item => item.id !== product.id);
                sessionStorage.setItem('wishlist', JSON.stringify(wishlist));
            }
            else {
                svg.style.fill = 'red';
                svg.style.stroke = 'red';
                alert('관심상품에 추가되었습니다.');

                const existingItem = wishlist.find(item => item.id === product.id);
                if (!existingItem) {
                    wishlist.push(product);
                    sessionStorage.setItem('wishlist', JSON.stringify(wishlist));
                }
            }
        }
    }
});


// 카드 생성 함수
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card';

    // 태그 HTML 생성
    const tagsHTML = product.tags.map(tag => {
        const tagName = tag === 'new' ? 'NEW' : 
                        tag === 'best' ? 'BEST' : 'MD추천';
        return `<span class="tag ${tag}">${tagName}</span>`;
    }).join('');

    card.innerHTML = `
        <a href="store_detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
            <div class="pic_box">
                <img src="${product.image}" class="tabpanel-pic" alt="상품 이미지">
                <button class="wishlist-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
            <div class="info_box">
                <span class="info">${product.category}</span>
                <span class="info">${product.name}</span>
                <span class="info">${product.description}</span>
                <span class="info">${product.price.toLocaleString()}</span>
                <div class="product-tags">
                    ${tagsHTML}
                </div>
            </div>
        </a>
    `;
    return card;
}


document.addEventListener('DOMContentLoaded', function() {
    // 모든 tabpanel-container를 찾아서 처리
    const containers = document.querySelectorAll('.tabpanel-container');
    
    containers.forEach(function(container) {
        // 부모 tabpanel의 data-tab 속성 가져오기
        const tabPanel = container.closest('.tabpanel');
        const tabName = tabPanel.getAttribute('data-tab');
        
        // 해당 탭의 상품 데이터 가져오기
        const products = cardData[tabName];
        
        if (products && products.length > 0) {
            products.forEach(function(product) {
                const card = createProductCard(product);
                container.appendChild(card);
            });
        }
    });


    // 찜 목록 불러오기
    const wishlist = JSON.parse(sessionStorage.getItem('wishlist')) || [];
    const wishlistIds = wishlist.map(item => item.id);

    // 찜한 상품의 하트 아이콘 빨갛게 표시
    document.querySelectorAll('.card').forEach(card => {
        const productLink = card.querySelector('a');
        const productId = new URLSearchParams(productLink.href.split('?')[1]).get('id');
        
        if (wishlistIds.includes(parseInt(productId))) {
            const svg = card.querySelector('.wishlist-btn svg');
            svg.style.fill = 'red';
            svg.style.stroke = 'red';
        }
    });
});