// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let calendarData = null;

// 초기화
document.addEventListener("DOMContentLoaded", function () {
    loadCalendarData();
    generateMonthOptions();
    buildCalendar();
});

// 달력 데이터 로드 (JSON 사용 시)
async function loadCalendarData() {
    try {
        const response = await fetch("calendar-data.json");
        calendarData = await response.json();
    } catch (error) {
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

// 월 선택 옵션 생성 (현재 월부터 6개월)
function generateMonthOptions() {
    const select = document.getElementById("calendar_date");
    select.innerHTML = "";

    const today = new Date();

    for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const value = `${year}${month}`;
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

// 달력 생성 메인 함수
function buildCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
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

    // 첫 주의 빈 칸 채우기
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
        const isPast = currentDateObj < today.setHours(0, 0, 0, 0);
        const isClosed = isClosedDay(yearMonth, date);
        const isToday = isTodayDate(currentDateObj);

        // 클래스 및 내용 설정
        if (isClosed) {
            td.className = "closed_day";
            td.innerHTML = `<a href="#" title=""><span>휴관</span></a>`;
        } else if (isPast) {
            td.className = "past_day";
            td.innerHTML = `<a href="#" title=""><span>${date}</span></a>`;
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

    // 마지막 주의 빈 칸 채우기
    if (dayCount % 7 !== 0) {
        for (let i = dayCount % 7; i < 7; i++) {
            const td = document.createElement("td");
            td.className = "past_day";
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }

    // select 옵션 동기화
    const yearMonth2 = `${year}${String(month + 1).padStart(2, "0")}`;
    document.getElementById("calendar_date").value = yearMonth2;
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

    // 여기서 다음 단계(시간 선택) 진행
    // 예: 시간 선택 토글 열기
    openTimeSelection(dateString);
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
    const value = select.value; // 예: "202512"
    const year = parseInt(value.substring(0, 4));
    const month = parseInt(value.substring(4, 6)) - 1;

    currentDate = new Date(year, month, 1);
    buildCalendar();
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
