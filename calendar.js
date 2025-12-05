// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let calendarData = null;

let peopleData = [];
let timeData = [];

const MAX_PEOPLE = 4;

// json 데이터 로드
async function loadAllData() {
    try {
        const response = await fetch("./ticket.json");
        if (!response.ok) {
            throw new Error("ticket.json 파일을 불러올 수 없습니다.");
        }
        const data = await response.json();

        // localStorage에서 저장된 데이터가 있는지 확인
        const savedTimeData = localStorage.getItem("timeData");

        // localStorage에 저장된 시간 데이터가 있으면 사용, 없으면 JSON에서 로드
        if (savedTimeData) {
            timeData = JSON.parse(savedTimeData);
            console.log("localStorage에서 시간 데이터 로드");
        } else {
            timeData = data.times || {};
            // 최초 로드 시 localStorage에 저장
            localStorage.setItem("timeData", JSON.stringify(timeData));
            console.log("JSON에서 시간 데이터 로드 및 localStorage에 저장");
        }

        // 데이터 할당
        peopleData = data.people || [];
        calendarData = data.calendar || {};

        console.log("모든 데이터 로드 완료:", { peopleData, timeData, calendarData });

        // UI 생성
        generatePeopleUI();
        generateTimeUI();
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        // 기본값 설정
        peopleData = [];
        timeData = [];
        calendarData = {};
    }
}

// 페이지 로드 시 초기화
async function initTicket() {
    await loadAllData(); // 모든 데이터 한 번에 로드
    generateMonthOptions();
    buildCalendar();
    updateNavigationButtons();

    // 페이지 접근 시 첫번째 토글만 접근 가능
    enableStep("step0", true);

    disableStep("step1");
    disableStep("step2");

    // 다음 버튼 초기 상태 비활성화
    updateNextButton();
}

// ====================
// 토글 제어 공통 함수
// ====================

/**
 * 토글을 열고 해당 위치로 스크롤하는 재사용 가능한 함수
 * @param {string} stepId - 열 토글의 ID (예: 'step1', 'step2')
 * @param {number} delay - 스크롤 지연 시간 (ms) - 기본값 100ms
 * @param {string} scrollBlock - 스크롤 위치 ('start', 'center', 'end') - 기본값 'start'
 */
function openToggleAndScroll(stepId, delay = 100, scrollBlock = "start") {
    const element = document.getElementById(stepId);

    if (!element) {
        console.error(`${stepId} 요소를 찾을 수 없습니다.`);
        return;
    }

    // 토글 열기
    element.classList.add("open");

    // 스크롤 애니메이션
    setTimeout(() => {
        element.scrollIntoView({
            behavior: "smooth",
            block: scrollBlock,
        });
    }, delay);

    console.log(`${stepId} 토글 열림 및 스크롤 완료`);
}

// 토글 활성화
/*
 * @param {string} stepId - 활성화할 토글 ID
 * @param {boolean} autoOpen - 자동으로 열고 스크롤할지 여부
 */
function enableStep(stepId, autoOpen = false) {
    const element = document.getElementById(stepId);
    if (!element) return;

    const wasDisabled = element.classList.contains("disabled");

    // 활성화
    element.classList.remove("disabled");
    element.style.pointerEvents = "auto";
    element.style.opacity = "1";

    // 제목 클릭 가능하게
    const header = element.querySelector(".tit");
    if (header) {
        header.style.cursor = "pointer";
    }

    console.log(`${stepId} 활성화`);

    // 처음 활성화될 때만 자동으로 열고 스크롤
    if (autoOpen && wasDisabled) {
        element.classList.add("open");
        setTimeout(() => {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);
        console.log(`${stepId} 자동 열림 및 스크롤`);
    }
}

// 토글 비활성화
function disableStep(stepId) {
    const element = document.getElementById(stepId);
    if (!element) return;

    element.classList.add("disabled");
    element.classList.remove("open");
    element.style.pointerEvents = "none";
    element.style.opacity = "0.5";

    // 제목 클릭 불가능하게
    const header = element.querySelector(".tit");
    if (header) {
        header.style.cursor = "not-allowed";
    }

    console.log(`${stepId} 비활성화`);
}

/**
 * 영수증 항목 업데이트 통합 함수
 * @param {string} type - 업데이트할 항목 타입 ('date', 'time', 'people', 'total')
 * @param {*} value - 업데이트할 값
 */
function updateReceipt(type, value) {
    switch (type) {
        case "date":
            const year = value.substring(0, 4);
            const month = value.substring(4, 6);
            const day = value.substring(6, 8);
            const date = new Date(year, parseInt(month) - 1, day);
            const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
            const dayOfWeek = weekDays[date.getDay()];
            const formattedDate = `${parseInt(month)}월 ${parseInt(day)}일 (${dayOfWeek})`;

            const receiptDateElement = document.getElementById("receipt_date");
            if (receiptDateElement) {
                receiptDateElement.textContent = formattedDate;
                console.log("날짜 업데이트:", formattedDate);
            }
            break;

        case "time":
            const receiptTimeElement = document.getElementById("receipt_time");
            if (receiptTimeElement) {
                receiptTimeElement.textContent = value;
                console.log("시간 업데이트:", value);
            } else {
                console.error("receipt_time 요소를 찾을 수 없습니다!");
            }
            break;

        case "people":
            const receiptPeopleEl = document.getElementById("receipt_people");
            const totalPriceEl = document.getElementById("total_price");

            if (!Array.isArray(peopleData) || peopleData.length === 0) {
                return;
            }

            const parts = [];
            let totalPrice = 0;

            peopleData.forEach((item) => {
                const countEl = document.getElementById(`${item.key}-count`);
                const cnt = countEl ? Number(countEl.textContent) : 0;
                if (cnt > 0) {
                    parts.push(`${item.type} ${cnt}`);
                    totalPrice += (item.price || 0) * cnt;
                }
            });

            if (receiptPeopleEl) {
                receiptPeopleEl.textContent = parts.length ? parts.join(", ") : "";
            }
            if (totalPriceEl) {
                totalPriceEl.textContent = totalPrice.toLocaleString();
            }
            console.log("인원 및 금액 업데이트:", { people: parts.join(", "), total: totalPrice });
            break;
    }

    updateNextButton();
}

// 빈 링크 클릭 시 기본 동작 방지
function preventDefaultLink(event) {
    event.preventDefault();
    return false;
}

// ==========
// STEP1 함수
// ==========

// 월 선택 옵션 생성
function generateMonthOptions() {
    const select = document.getElementById("calendar_date");
    if (!select) return;

    // 기존 옵션 제거
    select.innerHTML = "";

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // 현재 달과 다음 달까지만 생성
    for (let i = 0; i < 2; i++) {
        const date = new Date(currentYear, currentMonth + i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const value = `${year}${String(month).padStart(2, "0")}`;
        const text = `${year}년 ${month}월`;

        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;

        if (i === 0) {
            option.selected = true;
        }

        select.appendChild(option);
    }
}

// 사용 가능한 월 범위 가져오기
function getAvailableMonthRange() {
    const select = document.getElementById("calendar_date");
    if (!select || select.options.length === 0) return null;

    const firstOption = select.options[0].value; // 예: "202512"
    const lastOption = select.options[select.options.length - 1].value; // 예: "202601"

    return {
        first: {
            year: parseInt(firstOption.substring(0, 4)),
            month: parseInt(firstOption.substring(4, 6)) - 1, // 0부터 시작
        },
        last: {
            year: parseInt(lastOption.substring(0, 4)),
            month: parseInt(lastOption.substring(4, 6)) - 1, // 0부터 시작
        },
    };
}

// 현재 달이 범위의 첫 달인지 확인
function isFirstMonth() {
    const range = getAvailableMonthRange();
    if (!range) return false;

    const current = currentDate;
    return current.getFullYear() === range.first.year && current.getMonth() === range.first.month;
}

// 현재 달이 범위의 마지막 달인지 확인
function isLastMonth() {
    const range = getAvailableMonthRange();
    if (!range) return false;

    const current = currentDate;
    return current.getFullYear() === range.last.year && current.getMonth() === range.last.month;
}

// 이전/다음 버튼 상태 업데이트
function updateNavigationButtons() {
    const prevBtn = document.getElementById("calendar_previousBtn");
    const nextBtn = document.getElementById("calendar_nextBtn");

    if (!prevBtn || !nextBtn) return;

    // 이전 달 버튼
    if (isFirstMonth()) {
        prevBtn.classList.add("disabled");
        prevBtn.style.pointerEvents = "none";
        prevBtn.style.opacity = "0.4";
        prevBtn.style.cursor = "not-allowed";
    } else {
        prevBtn.classList.remove("disabled");
        prevBtn.style.pointerEvents = "auto";
        prevBtn.style.opacity = "1";
        prevBtn.style.cursor = "pointer";
    }

    // 다음 달 버튼
    if (isLastMonth()) {
        nextBtn.classList.add("disabled");
        nextBtn.style.pointerEvents = "none";
        nextBtn.style.opacity = "0.4";
        nextBtn.style.cursor = "not-allowed";
    } else {
        nextBtn.classList.remove("disabled");
        nextBtn.style.pointerEvents = "auto";
        nextBtn.style.opacity = "1";
        nextBtn.style.cursor = "pointer";
    }

    console.log("버튼 상태 업데이트:", {
        isFirst: isFirstMonth(),
        isLast: isLastMonth(),
    });
}

// 휴관일 체크
function isClosedDay(yearMonth, date) {
    if (!calendarData || !calendarData.closedDays) return false;
    const closedDays = calendarData.closedDays[yearMonth] || [];
    return closedDays.includes(date);
}

// 오늘 날짜 체크
function isTodayDate(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

// 달력 생성 메인 함수
function buildCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2주 후 일자 계산
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    twoWeeksLater.setHours(0, 0, 0, 0);

    const yearMonth = `${year}${String(month + 1).padStart(2, "0")}`;

    // 해당 월의 첫날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();

    // tbody 초기화
    const tbody = document.getElementById("calendar_body");
    if (!tbody) {
        console.error("calendar_body 요소를 찾을 수 없습니다.");
        return;
    }
    tbody.innerHTML = "";

    let row = document.createElement("tr");
    let dayCount = 0;

    // 첫 주 빈 칸 채우기
    for (let i = 0; i < firstDayOfWeek; i++) {
        const td = document.createElement("td");
        td.className = "past_day";
        row.appendChild(td);
        dayCount++;
    }

    // 날짜 채우기
    for (let date = 1; date <= lastDate; date++) {
        const td = document.createElement("td");
        const currentDateObj = new Date(year, month, date);
        currentDateObj.setHours(0, 0, 0, 0);
        const dateString = `${year}${String(month + 1).padStart(2, "0")}${String(date).padStart(2, "0")}`;

        // 날짜 분류
        const isPast = currentDateObj < today;
        const isBeyondTwoWeeks = currentDateObj > twoWeeksLater;
        const isClosed = isClosedDay(yearMonth, date);

        // 클래스 및 내용 설정
        if (isClosed) {
            td.className = "closed_day";
            td.innerHTML = `<a href="#" onclick="preventDefaultLink(event)" title=""><span>휴관</span></a>`;
        } else if (isPast || isBeyondTwoWeeks) {
            td.className = "past_day";
            td.innerHTML = `<a href="#" onclick="preventDefaultLink(event)" title=""><span>${date}</span></a>`;
        } else {
            td.className = "select_day";
            td.innerHTML = `
                <a href="#" title="예약 가능일" onclick="selectDate('${dateString}', event)">
                    <span>${date}</span>
                </a>
                <input class="select_date" type="hidden" value="${dateString}" />
                <input class="culture_check" type="hidden" value="N" />
            `;
        }

        row.appendChild(td);
        dayCount++;

        // 토요일마다 새로운 행 시작
        if (dayCount % 7 === 0) {
            tbody.appendChild(row);
            row = document.createElement("tr");
        }
    }

    // 마지막 주 빈 칸 채우기
    if (dayCount % 7 !== 0) {
        for (let i = dayCount % 7; i < 7; i++) {
            const td = document.createElement("td");
            td.className = "past_day";
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }

    // select 옵션 동기화
    const selectElement = document.getElementById("calendar_date");
    if (selectElement) {
        const yearMonth2 = `${year}${String(month + 1).padStart(2, "0")}`;
        selectElement.value = yearMonth2;
    }

    console.log(`달력 생성 완료: ${year}년 ${month + 1}월`);
}

// 이전 달 이동
function prevCalendar() {
    // 첫 달이면 실행하지 않음
    if (isFirstMonth()) {
        console.log("첫 달입니다. 더 이상 이전 달로 이동할 수 없습니다.");
        return;
    }

    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    buildCalendar();
    updateNavigationButtons(); // 버튼 상태 업데이트
    console.log("이전 달로 이동");
}

// 다음 달 이동
function nextCalendar() {
    // 마지막 달이면 실행하지 않음
    if (isLastMonth()) {
        console.log("마지막 달입니다. 더 이상 다음 달로 이동할 수 없습니다.");
        return;
    }

    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    buildCalendar();
    updateNavigationButtons(); // 버튼 상태 업데이트
    console.log("다음 달로 이동");
}

// select 변경 시
function changeCalendarSelectView(selectElement) {
    if (!selectElement) return;

    const value = selectElement.value; // 예: "202512"
    const year = parseInt(value.substring(0, 4));
    const month = parseInt(value.substring(4, 6)) - 1;

    currentDate = new Date(year, month, 1);
    buildCalendar();
    updateNavigationButtons(); // 버튼 상태 업데이트
    console.log(`Select 변경: ${year}년 ${month + 1}월`);
}

// 날짜 선택
function selectDate(dateString, event) {
    event.preventDefault();

    // 기존 선택 제거
    document.querySelectorAll(".pick_day").forEach((td) => {
        td.classList.remove("pick_day");
    });

    // 선택 추가
    const clickedTd = event.currentTarget.closest("td");
    clickedTd.classList.add("pick_day");

    selectedDate = dateString;
    console.log("선택된 날짜:", selectedDate);

    updateReceipt("date", dateString);

    // 선택한 날짜 별 시간 선택 창 생성
    generateTimeUI(dateString);

    // 다음 스탭 활성화
    enableStep("step1", true);
}

// ====================
// 시간 선택 기능
// ====================

// 시간 선택 UI 생성
function generateTimeUI(dateString) {
    const left = document.getElementById("time-left");
    const right = document.getElementById("time-right");

    left.innerHTML = "";
    right.innerHTML = "";

    // 선택된 날짜의 시간 데이터 가져오기 (없으면 default 사용)
    const timesForDate = timeData[dateString] || timeData["default"] || [];

    if (timesForDate.length === 0) {
        console.warn("해당 날짜의 시간 데이터가 없습니다.");
        return;
    }

    timesForDate.forEach((item, i) => {
        const li = document.createElement("li");
        li.classList.add("select_time");

        if (item.quantity === 0) li.classList.add("sold_out");

        li.innerHTML = `
            <a href="#" onclick="selectTime('${item.time}', event)">
                <span class="date">${item.time}
                    <span class="time_quantity">남은 수량
                        <span>${item.quantity}</span>
                    </span>
                </span>
                <span>${item.quantity === 0 ? "마감" : "예약 가능"}</span>
            </a>
        `;

        (i < 4 ? left : right).appendChild(li);
    });

    console.log(`${dateString} 날짜의 시간 UI 생성 완료`);
}

// 시간 선택
// 선택한 시간대의 남은 수량 가져오기
function getSelectedTimeQuantity() {
    if (!selectedDate || !selectedTime) return 0;

    const timesForDate = timeData[selectedDate] || timeData["default"] || [];
    const timeSlot = timesForDate.find((t) => t.time === selectedTime);

    return timeSlot ? timeSlot.quantity : 0;
}

function selectTime(timeString, event) {
    event.preventDefault();

    const clickedLi = event.currentTarget.closest("li");
    if (clickedLi.classList.contains("sold_out")) {
        console.log("마감된 시간입니다.");
        return;
    }

    document.querySelectorAll(".select_time").forEach((li) => {
        li.classList.remove("pick");
        const link = li.querySelector("a");
        if (link) {
            link.title = "";
        }
    });

    clickedLi.classList.add("pick");
    const link = clickedLi.querySelector("a");
    if (link) {
        link.title = "시간 선택됨";
    }

    selectedTime = timeString;
    updateReceipt("time", timeString);

    console.log("선택된 시간:", timeString);
    updateButtons();

    // 다음 스탭 진행
    enableStep("step2", true);
}

// ======================
// 인원 선택 기능
// ======================

// 인원 선택 UI 생성
function generatePeopleUI() {
    const container = document.getElementById("step2-body");
    container.innerHTML = "";

    peopleData.forEach((item) => {
        const html = `
            <div class="choice_box">
                <dl>
                    <dt>${item.type} <span>${item.desc}</span></dt>
                    <dd><strong>${item.price.toLocaleString()}</strong> <span>원</span></dd>
                </dl>
                <div class="counter" id="${item.key}">
                    <button type="button" class="decrease" onclick="decrease('${item.key}')">-</button>
                    <span id="${item.key}-count">0</span>
                    <button type="button" class="increase" onclick="increase('${item.key}')">+</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML("beforeend", html);
    });
}

// 증가 & 감소 버튼 기능
function increase(key) {
    const countSpan = document.getElementById(`${key}-count`);
    let count = parseInt(countSpan.textContent);

    const currentTotal = getTotalCount();
    const maxQuantity = getSelectedTimeQuantity();

    // 최대 인원(4명) 또는 선택한 시간대의 남은 수량을 초과하면 증가 불가
    if (currentTotal >= MAX_PEOPLE || currentTotal >= maxQuantity) {
        if (currentTotal >= maxQuantity) {
            console.log(`선택한 시간대의 남은 수량(${maxQuantity}명)을 초과할 수 없습니다.`);
        }
        return;
    }

    count++;
    countSpan.textContent = count;

    updateReceipt("people");
    updateButtons();
}

function decrease(key) {
    const countSpan = document.getElementById(`${key}-count`);
    let count = parseInt(countSpan.textContent);

    if (count === 0) return;

    count--;
    countSpan.textContent = count;

    updateReceipt("people");
    updateButtons();
}

//  총 인원 계산
function getTotalCount() {
    let total = 0;

    peopleData.forEach((item) => {
        const el = document.getElementById(`${item.key}-count`);
        const val = el ? parseInt(el.textContent, 10) || 0 : 0;
        total += val;
    });

    return total;
}

// 버튼 상태 업데이트
function updateButtons() {
    const total = getTotalCount();
    const maxQuantity = getSelectedTimeQuantity();

    peopleData.forEach((item) => {
        const countEl = document.getElementById(`${item.key}-count`);
        const count = countEl ? Number(countEl.textContent) : 0;

        const decBtn = document.querySelector(`#${item.key} .decrease`);
        const incBtn = document.querySelector(`#${item.key} .increase`);

        if (decBtn) decBtn.disabled = count === 0;

        if (incBtn) {
            let shouldDisable = total >= MAX_PEOPLE;

            if (selectedTime && maxQuantity > 0) {
                shouldDisable = shouldDisable || total >= maxQuantity;
            }

            incBtn.disabled = shouldDisable;
        }
    });

    updateReceipt("people");
}

// 결제 기능

// 다음 버튼 제어
function updateNextButton() {
    const nextBtn = document.querySelector(".next_btn");
    if (!nextBtn) return;

    // 모든 조건 확인
    const isDateSelected = selectedDate !== null;
    const isTimeSelected = selectedTime !== null;
    const isPeopleSelected = getTotalCount() > 0;

    const allCompleted = isDateSelected && isTimeSelected && isPeopleSelected;

    if (allCompleted) {
        nextBtn.classList.remove("disabled");
        nextBtn.disabled = false;
        nextBtn.style.opacity = "1";
        nextBtn.style.cursor = "pointer";
        console.log("다음 버튼 활성화");
    } else {
        nextBtn.classList.add("disabled");
        nextBtn.disabled = true;
        nextBtn.style.opacity = "0.4";
        nextBtn.style.cursor = "not-allowed";
        console.log("다음 버튼 비활성화 - 날짜:", isDateSelected, "시간:", isTimeSelected, "인원:", isPeopleSelected);
    }
}

// 날짜를 표시용 형식으로 변환
function formatDateForDisplay(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

// ====================
// 결제 처리
// ====================
async function goToPayment() {
    // 버튼이 비활성화 상태면 실행하지 않음
    const nextBtn = document.querySelector(".next_btn");
    if (nextBtn && nextBtn.disabled) {
        console.log("모든 항목을 선택해주세요.");
        alert("날짜, 시간, 인원을 모두 선택해주세요.");
        return;
    }

    // 선택된 정보 수집
    const bookingInfo = {
        date: selectedDate,
        time: selectedTime,
        people: [],
        totalPrice: 0,

        totalPeople: getTotalCount(), // 전체 인원수
    };

    // 인원 정보 수집 (선택된 항목만)
    peopleData.forEach((item) => {
        const countEl = document.getElementById(`${item.key}-count`);
        const count = countEl ? Number(countEl.textContent) : 0;
        if (count > 0) {
            bookingInfo.people.push({
                type: item.type,
                key: item.key,
                count: count,
                price: item.price,
            });
            bookingInfo.totalPrice += item.price * count;
        }
    });

    // 1. 결제 정보 확인
    const peopleDetail = bookingInfo.people.map((p) => `${p.type} ${p.count}명`).join(", ");
    const confirmMessage = `예약 정보를 확인해주세요.\n\n날짜: ${formatDateForDisplay(selectedDate)}\n시간: ${selectedTime}\n인원: ${peopleDetail}\n총 인원: ${bookingInfo.totalPeople}명\n총 금액: ${bookingInfo.totalPrice.toLocaleString()}원`;

    alert(confirmMessage);

    // 2. 결제 확인
    const confirmPayment = confirm("결제하시겠습니까?");

    if (confirmPayment) {
        // 결제 진행
        try {
            const success = await processPayment(bookingInfo);

            if (success) {
                alert("결제가 완료되었습니다.\n예매정보는 마이페이지>예매 내역에서 확인할 수 있습니다.");
                window.location.href = "/info.html";
            }
        } catch (error) {
            alert(`결제 처리 중 오류가 발생했습니다.\n${error.message}`);
            window.location.href = "/info.html";
        }
    } else {
        // 취소
        alert("결제가 취소되었습니다.");
        window.location.href = "/info.html";
    }
}

async function processPayment(bookingInfo) {
    console.log("결제 처리 시작:", bookingInfo);

    // localStorage를 사용한 로컬 결제 처리
    return await updateTicketQuantity(bookingInfo.date, bookingInfo.time, bookingInfo.totalPeople);
}

// 티켓 수량 수정
async function updateTicketQuantity(dateString, timeString, peopleCount) {
    try {
        // timeData에서 해당 날짜의 시간 정보 찾기
        const timesForDate = timeData[dateString];

        if (!timesForDate) {
            throw new Error("해당 날짜의 시간 데이터를 찾을 수 없습니다.");
        }

        // 해당 시간 슬롯 찾기
        const timeSlot = timesForDate.find((t) => t.time === timeString);

        if (!timeSlot) {
            throw new Error("해당 시간을 찾을 수 없습니다.");
        }

        // 수량 확인
        if (timeSlot.quantity < peopleCount) {
            throw new Error(`남은 수량이 부족합니다. (남은 수량: ${timeSlot.quantity}명)`);
        }

        // 수량 감소
        timeSlot.quantity -= peopleCount;

        localStorage.setItem("timeData", JSON.stringify(timeData));

        console.log(`수량 업데이트 완료: ${dateString} ${timeString}`);
        console.log(`차감된 인원: ${peopleCount}명`);
        console.log(`남은 수량: ${timeSlot.quantity}명`);

        return true;
    } catch (error) {
        console.error("수량 업데이트 오류:", error);
        throw error;
    }
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", async function () {
    await initTicket(); // async로 변경하여 데이터 로드 완료 대기
    updateButtons(); // 이제 peopleData가 로드된 후 실행됨
});
