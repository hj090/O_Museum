document.addEventListener("DOMContentLoaded", () => {
    // 1) URL에서 ?id=숫자 읽기
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
        alert("잘못된 소장품 번호입니다.");
        return;
    }

    // 2) JSON 불러오기
    fetch("data/03_OMuseum_collections.json")
        .then((res) => res.json())
        .then((data) => {
            const items = data.items || [];
            const item = items.find((it) => it.id === id);

            if (!item) {
                alert("소장품 정보를 찾을 수 없습니다.");
                return;
            }

            // 3) 이미지 채우기
            const img = document.getElementById("mainImg");
            if (img) {
                img.src = item.image;
                img.alt = item.title;
            }

            // 4) 텍스트 채우기
            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value || "";
            };

            setText("detailTitle", item.title);
            setText("detailOtherNames", item.otherNames);
            setText("detailExhibitionName", item.exhibitionName);
            setText("detailNationEra", item.nationEra);
            setText("detailMaterial", item.material);
            setText("detailClassification", item.classification);
            setText("detailSize", item.size);
            setText("detailHeritage", item.heritage);
            setText("detailInventoryNo", item.inventoryNo);
            setText("detailLocation", item.location);
            setText("detailDescription", item.description);

            // 이미지가 세팅된 후에 확대 기능 초기화
            initZoom();
        })
        .catch((err) => {
            console.error("디테일 JSON 로드 에러:", err);
        });
});

// ----------------------
// 돋보기 확대 기능
// ----------------------
function initZoom() {
    const img = document.getElementById("mainImg"); // 실제 이미지
    const lens = document.getElementById("lens"); // 돋보기 렌즈
    const container = document.querySelector(".img-zoom-container"); // 2번 박스 안쪽

    if (!img || !lens || !container) return;

    const lensSize = 150; // 렌즈 한 변
    const zoom = 2.5; // 확대 배율

    lens.style.width = lensSize + "px";
    lens.style.height = lensSize + "px";

    function setupBackground() {
        const imgRect = img.getBoundingClientRect();
        lens.style.backgroundImage = `url('${img.src}')`;
        lens.style.backgroundSize = `${imgRect.width * zoom}px ${imgRect.height * zoom}px`;
    }

    if (img.complete) {
        setupBackground();
    } else {
        img.addEventListener("load", setupBackground);
    }

    img.addEventListener("mouseenter", () => {
        lens.style.display = "block";
    });

    img.addEventListener("mouseleave", () => {
        lens.style.display = "none";
    });

    img.addEventListener("mousemove", (e) => {
        moveLensOnImage(e, img, container, lens, zoom, lensSize);
    });
}

function moveLensOnImage(e, img, container, lens, zoom, lensSize) {
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 마우스 위치 (이미지 기준)
    let x = e.clientX - imgRect.left;
    let y = e.clientY - imgRect.top;

    // 1) 마우스 좌표를 "이미지 내부"로 클램프
    if (x < 0) x = 0;
    if (x > imgRect.width) x = imgRect.width;
    if (y < 0) y = 0;
    if (y > imgRect.height) y = imgRect.height;

    // 2) 컨테이너 기준에서 이미지가 얼마나 떨어져 있는지
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    // 3) 렌즈 왼쪽/위 위치 (컨테이너 기준, 마우스 중앙에 오도록)
    let lensLeft = offsetX + x - lensSize / 2;
    let lensTop = offsetY + y - lensSize / 2;

    // 4) 렌즈가 "이미지 네모" 밖으로는 안 나가도록 다시 클램프
    const minLeft = offsetX;
    const maxLeft = offsetX + imgRect.width - lensSize;
    const minTop = offsetY;
    const maxTop = offsetY + imgRect.height - lensSize;

    if (lensLeft < minLeft) lensLeft = minLeft;
    if (lensLeft > maxLeft) lensLeft = maxLeft;
    if (lensTop < minTop) lensTop = minTop;
    if (lensTop > maxTop) lensTop = maxTop;

    lens.style.left = lensLeft + "px";
    lens.style.top = lensTop + "px";

    // 5) 최종적으로 "렌즈의 중심이 이미지 안에서 어느 위치인지" 다시 계산
    const centerXInImg = lensLeft - offsetX + lensSize / 2; // 0 ~ imgRect.width
    const centerYInImg = lensTop - offsetY + lensSize / 2; // 0 ~ imgRect.height

    // 이 중심 기준으로 배경 위치 계산 → 경계에서 더 이상 안 밀려나도록
    const bgPosX = -(centerXInImg * zoom - lensSize / 2);
    const bgPosY = -(centerYInImg * zoom - lensSize / 2);

    lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
}
