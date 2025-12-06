// 토글 애니메이션 함수
document.addEventListener("DOMContentLoaded", () => {
    const accordionTitles = document.querySelectorAll(".accordion_wrap .tit");

    accordionTitles.forEach((tit) => {
        tit.addEventListener("click", (e) => {
            e.preventDefault(); // a태그 기본 이동 방지

            const li = tit.closest("li");
            const isOpen = li.classList.contains("open");

            // 이미 열려 있으면 닫기
            if (isOpen) {
                li.classList.remove("open");
                return;
            }

            // 클릭한 항목 열기
            li.classList.add("open");
        });
    });
});

// float 애니메이션 함수
let targetMarginTop = 0;
let currentMarginTop = 0;
const lerpSpeed = 0.5;

function lerp(start, end, speed) {
    return start + (end - start) * speed;
}

function animate() {
    const floatCont = document.querySelector(".float-cont");

    // 현재값을 목표값으로 천천히 이동
    currentMarginTop = lerp(currentMarginTop, targetMarginTop, lerpSpeed);

    // 거의 도달하면 정확한 값으로 설정
    if (Math.abs(targetMarginTop - currentMarginTop) < 0.5) {
        currentMarginTop = targetMarginTop;
    }

    floatCont.style.marginTop = currentMarginTop + "px";

    requestAnimationFrame(animate);
}

animate();

// 스크롤 시 목표값만 업데이트
window.addEventListener(
    "scroll",
    () => {
        const floatCont = document.querySelector(".float-cont");
        const container = floatCont.parentElement;
        const containerRect = container.getBoundingClientRect();

        if (containerRect.top < 0) {
            targetMarginTop = Math.abs(containerRect.top);
        } else {
            targetMarginTop = 0;
        }
    },
    { passive: true }
);
