// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let calendarData = null;

// 달력 데이터 로드
async function loadCalendarData() {
    try {
        const response = await fetch("calendar-data.json");
        if (!response.ok) {
            throw new Error("JSON 파일을 불러올 수 없습니다.");
        }
        calendarData = await response.json();
        console.log("달력 데이터 로드 완료:", calendarData);
    } catch (error) {
        console.error("JSON 로드 실패:", error);
        console.log("기본 설정으로 달력 생성");
        // JSON 없이도 작동하도록 기본 데이터 설정
        calendarData = {
            closedDays: {
                202512: [1, 8, 15, 22, 29],
                202601: [5, 12, 19, 26],
            },
        };
    }
}

// 월 선택 옵션 생성
function generateMonthOptions() {
    const select = document.getElementById("calendar_date");
    if (!select) return;

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

// 페이지 로드 시 초기화
async function initCalendar() {
    await loadCalendarData();
    generateMonthOptions();
    buildCalendar();
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

// 빈 링크 클릭 시 기본 동작 방지
function preventDefaultLink(event) {
    event.preventDefault();
    return false;
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
    const firstDayOfWeek = firstDay.getDay(); // 0(일요일) ~ 6(토요일)
    const lastDate = lastDay.getDate();

    // tbody 초기화
    const tbody = document.getElementById("calendar_body");
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
        const dateString = `${year}${String(month + 1).padStart(2, "0")}${String(date).padStart(2, "0")}`;

        // 날짜 분류
        const isPast = currentDateObj < today;
        const isBeyondTwoWeeks = currentDateObj > twoWeeksLater;
        const isClosed = isClosedDay(yearMonth, date);
        const isToday = isTodayDate(currentDateObj);

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
}

// 이전 달
function prevCalendar() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    buildCalendar();
}

// 다음 달
function nextCalendar() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    buildCalendar();
}

// select 변경 시
function changeCalendarView() {
    const select = document.getElementById("calendar_date");
    if (!select) return;

    const value = select.value; // 예: "202512"
    const year = parseInt(value.substring(0, 4));
    const month = parseInt(value.substring(4, 6)) - 1;

    currentDate = new Date(year, month, 1);
    buildCalendar();
}

// 날짜 선택
function selectDate(dateString, event) {
    event.preventDefault();

    // 기존 선택 제거
    document.querySelectorAll(".pick_day").forEach((td) => {
        td.classList.remove("pick_day");
    });

    // 새로운 선택 추가
    const clickedTd = event.currentTarget.closest("td");
    clickedTd.classList.add("pick_day");

    selectedDate = dateString;
    console.log("선택된 날짜:", selectedDate);

    updateReceiptDate(dateString);
    openTimeSelection(dateString);
}

// 영수증에 날짜 업데이트
function updateReceiptDate(dateString) {
    // dateString 형식: "20241128" (YYYYMMDD)
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    // Date 객체 생성
    const date = new Date(year, parseInt(month) - 1, day);

    // 요일 배열
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = weekDays[date.getDay()];

    const formattedDate = `${parseInt(month)}월 ${parseInt(day)}일 (${dayOfWeek})`;

    // HTML 요소에 출력
    const receiptDateElement = document.getElementById("receipt_date");
    if (receiptDateElement) {
        receiptDateElement.textContent = formattedDate;
    }
}

// 시간 선택 열기 (예시)
function openTimeSelection(dateString) {
    // 날짜 선택 후 시간 선택 토글 열기
    const step1 = document.getElementById("step1");
    if (step1) {
        step1.classList.add("open");
    }

    // 선택된 날짜 표시 등 추가 로직
    console.log("시간 선택 화면으로 이동:", dateString);
}

// 영수증에 시간 업데이트
function updateReceiptTime(timeString) {
    const receiptTimeElement = document.getElementById("receipt_time");
    if (receiptTimeElement) {
        receiptTimeElement.textContent = timeString;
        console.log("시간 업데이트 완료:", timeString);
    } else {
        console.error("receipt_time 요소를 찾을 수 없습니다!");
    }
}

// 시간 선택
function selectTime(timeString, event) {
    event.preventDefault();

    // 클릭한 요소가 sold_out이면 무시
    const clickedLi = event.currentTarget.closest("li");
    if (clickedLi.classList.contains("sold_out")) {
        return;
    }

    // 기존 선택 제거
    document.querySelectorAll(".select_time").forEach((li) => {
        li.classList.remove("pick");
        const link = li.querySelector("a");
        if (link) {
            link.title = "";
        }
    });

    // 새로운 선택 추가
    clickedLi.classList.add("pick");
    const link = clickedLi.querySelector("a");
    if (link) {
        link.title = "시간 선택됨";
    }

    // 영수증에 시간 업데이트
    updateReceiptTime(timeString);

    console.log("선택된 시간:", timeString);
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", function () {
    initCalendar();
});
