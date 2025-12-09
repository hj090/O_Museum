// 페이지당 보여줄 카드 개수
const ITEMS_PER_PAGE = 12;

// 전역 상태
let allItems = []; // 기본 소장품 × 8번 반복한 전체 목록
let filteredItems = []; // 검색/필터 적용 후 목록
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
    const paginationEl = document.getElementById("pagination");

    // 1) JSON 데이터 불러오기 (Fetch + JSON)
    fetch("data/03_OMuseum_collections.json")
        .then((res) => res.json())
        .then((data) => {
            const baseItems = data.items || [];

            // 10개 소장품을 8번씩 반복해서 80개 만들기
            const repeated = [];
            baseItems.forEach((item) => {
                for (let i = 0; i < 4; i++) {
                    repeated.push({
                        ...item,
                    });
                }
            });

            allItems = repeated;
            filteredItems = allItems.slice(); // 처음에는 전체 보여주기
            currentPage = 1;
            renderAll(); // 첫 렌더링
        })
        .catch((err) => {
            console.error("JSON 로드 에러:", err);
        });

    // 2) 검색 / 체크박스 이벤트 등록
    const applyFiltersHandler = () => {
        applyFilters();
    };

    // 검색 버튼 클릭
    searchBtn.addEventListener("click", applyFiltersHandler);

    // 엔터 키로 검색
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            applyFiltersHandler();
        }
    });

    // 체크박스 변경
    filterCheckboxes.forEach((cb) => {
        cb.addEventListener("change", applyFiltersHandler);
    });

    // 3) 페이지네이션 클릭 이벤트 (한 번만 등록)
    paginationEl.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link || !link.dataset.page) return;

        e.preventDefault();

        const newPage = parseInt(link.dataset.page, 10);
        const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            currentPage = newPage;
            renderAll();
        }
    });
});

// 🔹 검색 + 체크박스 필터 적용
function applyFilters() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const checkedValues = Array.from(document.querySelectorAll(".filter-checkbox:checked")).map((cb) => cb.value);

    filteredItems = allItems.filter((item) => {
        // 1) 제목(소장품 이름)으로 검색
        const matchKeyword = keyword === "" || item.title.toLowerCase().includes(keyword);

        // 2) 카테고리(checkbox) 필터
        const matchCategory = checkedValues.length === 0 || checkedValues.includes(item.category);

        return matchKeyword && matchCategory;
    });

    // 검색/필터할 때마다 1페이지로 이동
    currentPage = 1;
    renderAll();
}

// 전체 렌더링 (카드 + 결과 개수 + 페이지 정보 + 페이지네이션)
function renderAll() {
    renderResultCount();
    renderItems();
    renderPageInfo();
    renderPagination();
}

// "총 n건이 검색되었습니다." 문구 업데이트
function renderResultCount() {
    const resultCountEl = document.getElementById("resultCount");
    if (!resultCountEl) return;

    resultCountEl.textContent = `총 ${filteredItems.length}건이 검색되었습니다.`;
}

// 현재 페이지의 12개 카드 그리기
function renderItems() {
    const itemGrid = document.getElementById("itemGrid");
    if (!itemGrid) return;

    itemGrid.innerHTML = "";

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    pageItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
  <div class="thumb-frame">
    <a href="03_OMuseum_collection_detail.html?id=${item.id}" class="item-link">
      <img src="${item.image}" alt="${item.title}" class="item-image">
    </a>
  </div>
  <h3 class="item-title">${item.title}</h3>
`;
        itemGrid.appendChild(card);
    });
}

// "페이지 1 / 7" 정보 업데이트
function renderPageInfo() {
    const pageInfo = document.getElementById("pageInfo");
    if (!pageInfo) return;

    const currentPageSpan = pageInfo.querySelector(".current-page");
    const totalPageSpan = pageInfo.querySelector(".total-page");

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

    if (currentPageSpan) {
        currentPageSpan.textContent = `페이지 ${currentPage}`;
    }
    if (totalPageSpan) {
        totalPageSpan.textContent = totalPages;
    }
}

// 페이지네이션(« ‹ 1 2 3 ... › ») 업데이트
function renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

    // a 태그 생성 헬퍼
    const createLink = (label, page, disabled = false, isActive = false) => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = label;

        if (disabled) {
            a.style.pointerEvents = "none";
            a.style.opacity = "0.3";
        } else {
            a.dataset.page = page;
        }

        if (isActive) {
            a.classList.add("active");
        }

        return a;
    };

    // « 첫 페이지
    pagination.appendChild(createLink("«", 1, currentPage === 1));

    // ‹ 이전 페이지
    pagination.appendChild(createLink("‹", Math.max(1, currentPage - 1), currentPage === 1));

    // 숫자 페이지들 (1 ~ totalPages)
    for (let p = 1; p <= totalPages; p++) {
        pagination.appendChild(createLink(String(p), p, false, p === currentPage));
    }

    // › 다음 페이지
    pagination.appendChild(createLink("›", Math.min(totalPages, currentPage + 1), currentPage === totalPages));

    // » 마지막 페이지
    pagination.appendChild(createLink("»", totalPages, currentPage === totalPages));
}
