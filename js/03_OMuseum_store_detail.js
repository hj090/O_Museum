// URL에서 상품 ID 가져오기
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

// 모든 탭의 데이터를 하나로 합치기
function getAllProducts() {
    const allProducts = [];
    for (let tabKey in cardData) {
        allProducts.push(...cardData[tabKey]);
    }
    return allProducts;
}

// ID로 상품 찾기
function findProductById(id) {
    const allProducts = getAllProducts();
    return allProducts.find((product) => product.id === parseInt(id));
}

// 태그를 HTML로 변환
function createTagHTML(tags) {
    const tagMap = {
        new: { text: "NEW", class: "tag-new" },
        best: { text: "BEST", class: "tag-best" },
        recommend: { text: "MD추천", class: "tag-recommend" },
    };

    return tags
        .map((tag) => {
            const tagInfo = tagMap[tag];
            return `<span class="tag ${tagInfo.class}">${tagInfo.text}</span>`;
        })
        .join("");
}

// 상품 상세 정보 표시
function displayProductDetail() {
    const productId = getProductIdFromURL();

    if (!productId) {
        console.error("상품 ID가 없습니다.");
        return;
    }

    const product = findProductById(productId);

    if (!product) {
        console.error("상품을 찾을 수 없습니다.");
        return;
    }

    // 이미지
    document.getElementById("detailImage").src = product.image;
    document.getElementById("detailImage").alt = product.name;

    // 태그
    document.getElementById("detailTags").innerHTML = createTagHTML(product.tags);

    // 제목
    document.getElementById("detailTitle").textContent = product.name;

    // 부제목 (설명)
    document.getElementById("detailSubtitle").textContent = `<${product.description}>`;

    // 가격
    document.getElementById("detailPrice").textContent = product.price.toLocaleString() + "원";

    // 상세 설명
    document.getElementById("detailDescription").textContent = product.description;
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", displayProductDetail);

// 장바구니 데이터 저장
document.getElementById("addCartBtn").addEventListener("click", function () {
    const productId = getProductIdFromURL();
    const product = findProductById(productId);

    // 로그인 확인 - 2410552 임유미 코드
    const currentUser = sessionStorage.getItem("currentUser");

    if (!currentUser) {
        // 로그인되어 있지 않은 경우
        alert("로그인 후 사용 가능합니다.");
        window.location.href = "03_OMuseum_login.html";
    } else {
        // 로그인되어 있는 경우
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        cart.push(product);
        sessionStorage.setItem("cart", JSON.stringify(cart));

        alert("장바구니에 상품이 추가되었습니다.");
    }
});
