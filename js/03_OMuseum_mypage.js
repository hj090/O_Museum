document.addEventListener("DOMContentLoaded", () => {
    // =============================================================
    // =========== 0. 로그인 세션 확인 및 사용자 정보 로드 =============
    // =============================================================

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        window.location.href = "03_OMuseum_login.html";
        return;
    }

    // 사용자 정보를 화면에 표시
    function displayUserInfo() {
        const nameInput = document.getElementById("user-name");
        const idInput = document.getElementById("user-id");
        const contactInput = document.getElementById("user-contact");
        const emailInput = document.getElementById("user-email");
        const passwordDisplay = document.getElementById("current-password-display");

        console.log("📝 찾은 요소들:", { nameInput, idInput, contactInput, emailInput, passwordDisplay });

        if (nameInput) {
            nameInput.value = currentUser.name || "";
        }
        if (idInput) {
            idInput.value = currentUser.id || "";
        }
        if (contactInput) {
            contactInput.value = currentUser.phone || "";
        }
        if (emailInput) {
            emailInput.value = currentUser.email || "";
        }
        if (passwordDisplay) {
            passwordDisplay.textContent = "********";
        }
    }

    // =============================================================
    // =========== 1. 데이터 및 공통 요소 정의 ========================
    // =============================================================

    const navLinks = document.querySelectorAll(".mypage-nav li a[data-content-link]");
    const contentDetails = document.querySelectorAll(".mypage-content .content-detail");

    const formatPrice = (price) => price.toLocaleString() + "원";

    // reservationData를 localStorage에서 불러오기
    let reservationData = JSON.parse(localStorage.getItem("reservations") || "[]");

    // =============================================================
    // =========== 2. 예약 내역 렌더링 및 취소 로직 ===================
    // =============================================================

    /** 예약 내역 목록을 동적으로 렌더링하는 함수 */
    function renderReservations() {
        const container = document.getElementById("reservations-content");

        container.innerHTML = "";

        if (reservationData.length === 0) {
            container.innerHTML = '<p class="empty-state">예약 내역이 없습니다.</p>';
            console.log("예약 내역 없음");
            return;
        }

        reservationData.forEach((res) => {
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
            container.insertAdjacentHTML("beforeend", cardHtml);
        });

        // 하단 액션 버튼 영역 추가
        const actionDiv = document.createElement("div");
        actionDiv.className = "reservation-actions";
        actionDiv.innerHTML = `<button class="cancel-selected-btn receipt-btn" id="cancel-reservation-btn">선택 항목 취소</button>`;
        container.appendChild(actionDiv);

        // 취소 버튼 이벤트 연결
        document.getElementById("cancel-reservation-btn").addEventListener("click", deleteSelectedReservations);
    }

    /** 선택된 예약을 취소하고 목록을 업데이트하는 함수 */
    function deleteSelectedReservations() {
        const checkboxes = document.querySelectorAll('#reservations-content input[type="checkbox"]:checked');

        if (checkboxes.length === 0) {
            alert("취소할 예약 항목을 선택해주세요.");
            return;
        }

        const confirmMessage = `선택한 ${checkboxes.length}개의 예약 항목을 취소하시겠습니까?`;
        if (!confirm(confirmMessage)) {
            return;
        }

        const cancelledIds = [];
        checkboxes.forEach((checkbox) => {
            const reservationId = parseInt(checkbox.id.split("-")[1]);
            cancelledIds.push(reservationId);
        });

        reservationData = reservationData.filter((res) => !cancelledIds.includes(res.id));
        localStorage.setItem("reservations", JSON.stringify(reservationData));
        renderReservations();

        alert("취소가 완료되었습니다.");
    }

    // 초기 예매 정보 렌더링
    renderReservations();

    // =============================================================
    // =========== 3. 장바구니/관심상품 렌더링 로직  ==================
    // =============================================================
    // 2415347 윤서영 수정완료

    /**
     * 장바구니/관심상품 목록을 렌더링하는 함수
     * 03_OMuseum_store_detail.js와 03_OMuseum_store_tabpanel.js가 전체 객체를 저장하므로 이에 맞춰 수정
     * @param {string} contentId - 'favorites' 또는 'cart'
     * @param {string} storageKey - 'wishlist' 또는 'cart' (sessionStorage 키)
     */
    function renderShopList(contentId, storageKey) {
        const container = document.getElementById(contentId + "-content");
        container.innerHTML = "";

        // sessionStorage에서 전체 상품 객체 배열 가져오기
        const items = JSON.parse(sessionStorage.getItem(storageKey)) || [];
        console.log(`${storageKey} 항목 수:`, items.length);
        console.log(`${storageKey} 데이터:`, items);

        if (items.length === 0) {
            const emptyMessage = storageKey === "cart" ? '<p class="empty-state">장바구니가 비어있습니다.</p>' : '<p class="empty-state">관심 상품 내역이 없습니다.</p>';
            container.innerHTML = emptyMessage;
            console.log(`${storageKey} 비어있음`);
            return;
        }

        items.forEach((item) => {
            const isCart = storageKey === "cart";
            const cardClass = isCart ? "cart-item-card" : "favorite-item-card";
            const itemIdAttr = `${storageKey}-${item.id}`;

            let cardHtml = `
                <div class="${cardClass}" data-id="${item.id}">
                    ${
                        isCart
                            ? `
                        <div class="checkbox-container">
                            <input type="checkbox" id="${itemIdAttr}" name="${storageKey}-select">
                            <label for="${itemIdAttr}"></label>
                        </div>`
                            : ""
                    }
                    <div class="item-image-wrapper">
                        <img src="${item.image}" alt="상품 이미지: ${item.name}"> 
                    </div>
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">${formatPrice(item.price)}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHtml);
        });

        if (storageKey === "cart") {
            const actionDiv = document.createElement("div");
            actionDiv.className = "cart-actions";
            actionDiv.innerHTML = `<button class="cancel-selected-btn receipt-btn">선택 항목 삭제</button>`;
            container.appendChild(actionDiv);

            actionDiv.querySelector(".cancel-selected-btn").addEventListener("click", () => {
                deleteSelectedItems(storageKey);
            });
        }
    }

    /**
     * 선택된 상품을 sessionStorage에서 삭제하는 함수 (수정됨)
     * 전체 객체 배열에서 해당 ID를 가진 객체 제거
     */
    function deleteSelectedItems(storageKey) {
        const checkboxes = document.querySelectorAll(`#${storageKey}-content input[type="checkbox"]:checked`);

        if (checkboxes.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        const confirmMessage = `선택한 ${checkboxes.length}개의 항목을 삭제하시겠습니까?`;
        if (!confirm(confirmMessage)) {
            return;
        }

        // sessionStorage에서 전체 객체 배열 가져오기
        let currentItems = JSON.parse(sessionStorage.getItem(storageKey)) || [];
        const deletedCount = checkboxes.length;

        // 체크된 항목의 ID 수집
        const idsToDelete = [];
        checkboxes.forEach((checkbox) => {
            const itemId = parseInt(checkbox.id.split("-")[1]);
            idsToDelete.push(itemId);
        });

        // ID가 일치하지 않는 항목만 남기기
        currentItems = currentItems.filter((item) => !idsToDelete.includes(item.id));

        // sessionStorage 업데이트
        sessionStorage.setItem(storageKey, JSON.stringify(currentItems));

        // 목록 다시 렌더링
        const contentId = storageKey === "cart" ? "cart" : "favorites";
        renderShopList(contentId, storageKey);

        alert(`선택 항목 ${deletedCount}개가 삭제되었습니다.`);
    }

    // =============================================================
    // =========== 4. 마이페이지 메뉴 토글 로직 =======================
    // =============================================================

    function setActiveContent(contentId) {
        // 모든 메뉴에서 active 클래스 제거
        navLinks.forEach((l) => l.classList.remove("active"));

        // 모든 콘텐츠 숨김
        contentDetails.forEach((c) => (c.style.display = "none"));

        // 해당 콘텐츠 활성화
        const targetContent = document.getElementById(contentId + "-content");
        console.log("targetContent:", targetContent);

        if (targetContent) {
            targetContent.style.display = "block";
        }

        // 메뉴에 따라 렌더링 함수 실행
        if (contentId === "reservations") {
            renderReservations();
        } else if (contentId === "favorites") {
            renderShopList("favorites", "wishlist");
        } else if (contentId === "cart") {
            renderShopList("cart", "cart");
        } else if (contentId === "edit-info") {
            displayUserInfo();
        }
    }

    // 좌측 메뉴 클릭 이벤트
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const contentId = link.dataset.contentLink;

            setActiveContent(contentId);
            link.classList.add("active");
        });
    });

    // 초기 로딩 시 '예약 내역' 활성화 및 렌더링
    const initialLink = document.querySelector(".mypage-nav li a.active");

    if (initialLink) {
        const initialContentId = initialLink.dataset.contentLink;
        setActiveContent(initialContentId);
    } else {
        // active 클래스가 없는 경우 기본적으로 예약 내역 표시
        setActiveContent("reservations");
    }

    console.log("03_OMuseum_mypage.js 초기화 완료");

    // =============================================================
    // =========== 5. 회원 정보 수정 로직 ===========================
    // =============================================================

    const passwordToggleButton = document.querySelector(".password-change-toggle-btn");
    const passwordFields = document.getElementById("password-change-fields");
    const passwordCancelButton = document.querySelector(".password-cancel-btn");
    const passwordSaveButton = document.querySelector(".password-save-btn");
    const editForm = document.querySelector(".edit-form-container");

    // 비밀번호 변경 토글
    if (passwordToggleButton && passwordFields && passwordCancelButton) {
        passwordToggleButton.addEventListener("click", () => {
            passwordFields.style.display = "block";
            passwordToggleButton.style.display = "none";
            document.getElementById("current-password-display").style.display = "none";
        });

        passwordCancelButton.addEventListener("click", () => {
            passwordFields.style.display = "none";
            passwordToggleButton.style.display = "inline-block";
            document.getElementById("current-password-display").style.display = "block";

            document.getElementById("old-password").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
        });

        // 비밀번호 저장
        passwordSaveButton.addEventListener("click", () => {
            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (!oldPassword || !newPassword || !confirmPassword) {
                alert("모든 비밀번호 필드를 입력해주세요.");
                return;
            }

            if (oldPassword !== currentUser.pw) {
                alert("현재 비밀번호가 일치하지 않습니다.");
                return;
            }

            if (newPassword !== confirmPassword) {
                alert("새 비밀번호가 일치하지 않습니다.");
                return;
            }

            if (newPassword.length < 8) {
                alert("비밀번호는 8자 이상이어야 합니다.");
                return;
            }

            // localStorage의 userDB 업데이트
            const userDB = JSON.parse(localStorage.getItem("userDB")) || [];
            const userIndex = userDB.findIndex((user) => user.id === currentUser.id);

            if (userIndex !== -1) {
                userDB[userIndex].pw = newPassword;
                localStorage.setItem("userDB", JSON.stringify(userDB));

                // sessionStorage의 currentUser 업데이트
                currentUser.pw = newPassword;
                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

                alert("비밀번호가 성공적으로 변경되었습니다.");
                passwordCancelButton.click();
            } else {
                alert("사용자 정보를 찾을 수 없습니다.");
            }
        });
    }

    // 회원 정보 저장 (연락처, 이메일)
    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const newContact = document.getElementById("user-contact").value;
            const newEmail = document.getElementById("user-email").value;

            if (!newContact || !newEmail) {
                alert("모든 필드를 입력해주세요.");
                return;
            }

            // localStorage의 userDB 업데이트
            const userDB = JSON.parse(localStorage.getItem("userDB")) || [];
            const userIndex = userDB.findIndex((user) => user.id === currentUser.id);

            if (userIndex !== -1) {
                userDB[userIndex].phone = newContact;
                userDB[userIndex].email = newEmail;
                localStorage.setItem("userDB", JSON.stringify(userDB));

                // sessionStorage의 currentUser 업데이트
                currentUser.phone = newContact;
                currentUser.email = newEmail;
                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

                alert("회원 정보가 성공적으로 저장되었습니다.");
            } else {
                alert("사용자 정보를 찾을 수 없습니다.");
            }
        });
    }
});
