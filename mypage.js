document.addEventListener('DOMContentLoaded', () => {
    // [가정] cardData가 전역적으로 사용 가능하다고 가정합니다.
    
    // =============================================================
    // =========== 1. 데이터 및 공통 요소 정의 ==============================
    // =============================================================
    
    const navLinks = document.querySelectorAll('.mypage-nav li a[data-content-link]');
    const contentDetails = document.querySelectorAll('.mypage-content .content-detail');

    // 금액을 포맷팅하는 함수 (예약 내역에는 '0원'으로 하드코딩되어 있으나, 통일성을 위해 유지)
    const formatPrice = (price) => price.toLocaleString() + '원';

    // ------------------ 1-1. 더미 예약 데이터 (인메모리 배열) ------------------
    // 마이페이지에 표시될 초기 예약 목록입니다.
    let reservationData = [
        { id: 202511271063, date: '2025-11-27 (목) / 10:00', people: '성인 1', price: '0원', paymentDate: '2025-11-21 05:44' },
        { id: 202511271064, date: '2025-11-27 (목) / 14:00', people: '성인 2', price: '0원', paymentDate: '2025-11-21 05:50' },
        { id: 202511281065, date: '2025-11-28 (금) / 11:30', people: '성인 3', price: '0원', paymentDate: '2025-11-22 09:00' },
    ];
    
    // =============================================================
    // =========== 2. 예약 내역 렌더링 및 취소 로직 (새로 추가) ===================
    // =============================================================
    
    /** 예약 내역 목록을 동적으로 렌더링하는 함수 */
    function renderReservations() {
        const container = document.getElementById('reservations-content');
        container.innerHTML = ''; // 기존 HTML 내용 (더미 카드) 제거
        
        if (reservationData.length === 0) {
            container.innerHTML = '<p class="empty-state">예약 내역이 없습니다.</p>';
            return;
        }

        // 예약 카드 렌더링
        reservationData.forEach(res => {
            const cardHtml = `
                <div class="reservation-card" data-reservation-id="${res.id}">
                    <div class="checkbox-container">
                        <input type="checkbox" id="res-${res.id}" name="reservation-select">
                        <label for="res-${res.id}"></label>
                    </div>
                    <div class="card-content-wrapper">
                        <div class="card-header">
                            <span>예매번호 ${res.id}</span>
                            <span>${res.price}</span>
                        </div>
                        <div class="card-details">
                            <p><strong>일시</strong> ${res.date}</p>
                            <p><strong>인원</strong> ${res.people}</p>
                            <p>결제일 ${res.paymentDate}</p>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // 하단 액션 버튼 영역 추가
        const actionDiv = document.createElement('div');
        actionDiv.className = 'reservation-actions';
        actionDiv.innerHTML = `<button class="cancel-selected-btn receipt-btn" id="cancel-reservation-btn">선택 항목 취소</button>`;
        container.appendChild(actionDiv);
        
        // 취소 버튼 이벤트 연결
        document.getElementById('cancel-reservation-btn').addEventListener('click', deleteSelectedReservations);
    }

    /** 선택된 예약을 취소하고 목록을 업데이트하는 함수 */
    function deleteSelectedReservations() {
        const checkboxes = document.querySelectorAll('#reservations-content input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            alert('취소할 예약 항목을 선택해주세요.');
            return;
        }

        // 1. 확인 메시지
        const confirmMessage = `선택한 ${checkboxes.length}개의 예약 항목을 취소하시겠습니까?`;
        if (!confirm(confirmMessage)) {
            return; // 취소
        }

        // 2. 실제 취소 로직 (reservationData 배열에서 제거)
        const cancelledIds = [];
        checkboxes.forEach(checkbox => {
            const reservationId = parseInt(checkbox.id.split('-')[1]);
            cancelledIds.push(reservationId);
        });

        // 취소되지 않은 항목만 남깁니다.
        reservationData = reservationData.filter(res => !cancelledIds.includes(res.id));
        
        // 3. 목록을 다시 렌더링하여 취소된 항목을 제거
        renderReservations();

        // 4. 완료 메시지
        alert('취소가 완료되었습니다. ✅');
    }
    
    // =============================================================
    // =========== 3. 장바구니/관심상품 렌더링 로직 (기존 코드 유지) ==================
    // =============================================================

    /**
     * 장바구니/관심상품 목록을 렌더링하는 함수 (sessionStorage 사용)
     * @param {string} contentId - 'favorites' 또는 'cart'
     * @param {string} storageKey - 'wishlist' 또는 'cart' (sessionStorage 키)
     */
    function renderShopList(contentId, storageKey) {
        const container = document.getElementById(contentId + '-content');
        container.innerHTML = ''; 
        

        const itemIds = JSON.parse(sessionStorage.getItem(storageKey)) || [];
        const allItems = window.cardData.tabmenu1; // 전역 cardData 사용 가정
        const matchingItems = allItems.filter(item => itemIds.includes(item.id));
        
        if (matchingItems.length === 0) {
            const emptyMessage = (storageKey === 'cart') 
                ? '<p class="empty-state">장바구니가 비어있습니다.</p>' 
                : '<p class="empty-state">관심 상품 내역이 없습니다.</p>';
            container.innerHTML = emptyMessage;
            return;
        }

        matchingItems.forEach(item => {
            const isCart = (storageKey === 'cart');
            const cardClass = isCart ? 'cart-item-card' : 'favorite-item-card';
            const itemIdAttr = `${storageKey}-${item.id}`;

            let cardHtml = `
                <div class="${cardClass}" data-id="${item.id}">
                    ${isCart ? `
                        <div class="checkbox-container">
                            <input type="checkbox" id="${itemIdAttr}" name="${storageKey}-select">
                            <label for="${itemIdAttr}"></label>
                        </div>` : ''}
                    <div class="item-image-wrapper">
                        <img src="${item.image}" alt="상품 이미지: ${item.name}"> 
                    </div>
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">${formatPrice(item.price)}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        if (storageKey === 'cart') {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'cart-actions';
            actionDiv.innerHTML = `<button class="cancel-selected-btn receipt-btn">선택 항목 삭제</button>`;
            container.appendChild(actionDiv);
            
            actionDiv.querySelector('.cancel-selected-btn').addEventListener('click', () => {
                deleteSelectedItems(storageKey);
            });
        }
    }

// mypage.js 내 deleteSelectedItems 함수
/** 선택된 상품을 sessionStorage에서 삭제하는 함수 (장바구니/관심상품용) */
function deleteSelectedItems(storageKey) {
    const checkboxes = document.querySelectorAll(`#${storageKey}-content input[type="checkbox"]:checked`);
    
    if (checkboxes.length === 0) {
        alert('삭제할 항목을 선택해주세요.');
        return;
    }

    // 1. 확인 메시지 (사용자 요청 반영)
    const confirmMessage = `선택한 ${checkboxes.length}개의 항목을 삭제하시겠습니까?`;
    if (!confirm(confirmMessage)) {
        return; // 취소
    }

    // 2. 실제 삭제 로직
    let currentIds = JSON.parse(sessionStorage.getItem(storageKey)) || [];
    const deletedCount = checkboxes.length; // 삭제될 항목 수

    checkboxes.forEach(checkbox => {
        const itemId = parseInt(checkbox.id.split('-')[1]); 
        currentIds = currentIds.filter(id => id !== itemId);
    });
    
    // sessionStorage 업데이트
    sessionStorage.setItem(storageKey, JSON.stringify(currentIds));
    
    // 3. 목록을 다시 렌더링 (삭제된 박스 없어짐)
    // storageKey에 따라 'cart-content' 또는 'favorites-content'로 컨테이너 ID를 결정
    const contentId = storageKey + '-content';
    renderShopList(contentId, storageKey);
    
    // 4. 완료 메시지 (사용자 요청 반영)
    alert(`선택 항목 ${deletedCount}개가 삭제되었습니다. ✅`);
}


    // =============================================================
    // =========== 4. 마이페이지 메뉴 토글 로직 ============================
    // =============================================================

    function setActiveContent(contentId) {
        // 모든 메뉴 비활성화 및 콘텐츠 숨김
        navLinks.forEach(l => l.classList.remove('active'));
        contentDetails.forEach(c => c.style.display = 'none');

        // 해당 콘텐츠 활성화
        const targetContent = document.getElementById(contentId + '-content');
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        // 메뉴에 따라 렌더링 함수 실행
        if (contentId === 'reservations') {
             renderReservations(); // 👈 예약 내역 렌더링
        } else if (contentId === 'favorites') {
             renderShopList('favorites', 'wishlist');
        } else if (contentId === 'cart') {
             renderShopList('cart', 'cart');
        }
    }

    // 좌측 메뉴 클릭 이벤트
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const contentId = link.dataset.contentLink;
            
            setActiveContent(contentId);
            link.classList.add('active'); 
        });
    });

    // 초기 로딩 시 '예약 내역' 활성화
    const initialLink = document.querySelector('.mypage-nav li a.active');
    if (initialLink) {
        const initialContentId = initialLink.dataset.contentLink;
        document.getElementById(initialContentId + '-content').style.display = 'block';
        setActiveContent(initialContentId); 
    }
    
    // =============================================================
    // =========== 5. 회원 정보 수정 (비밀번호 토글) 로직 ====================
    // =============================================================
    
    const passwordToggleButton = document.querySelector('.password-change-toggle-btn');
    const passwordFields = document.getElementById('password-change-fields');
    const passwordCancelButton = document.querySelector('.password-cancel-btn');

    if (passwordToggleButton && passwordFields && passwordCancelButton) {
        passwordToggleButton.addEventListener('click', () => {
            passwordFields.style.display = 'block';
            passwordToggleButton.style.display = 'none'; 
            document.getElementById('current-password-display').style.display = 'none'; 
        });

        passwordCancelButton.addEventListener('click', () => {
            passwordFields.style.display = 'none';
            passwordToggleButton.style.display = 'inline-block'; 
            document.getElementById('current-password-display').style.display = 'block'; 

            document.getElementById('old-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        });

        document.querySelector('.password-save-btn').addEventListener('click', () => {
             alert('비밀번호가 성공적으로 변경되었습니다. (기능 구현 X)');
             passwordCancelButton.click(); 
        });
    }
});