document.addEventListener("DOMContentLoaded", function () {
    // JSON 파일 불러오기
    fetch("./ticket.json")
        .then((response) => response.json())
        .then((data) => {
            const weekOpenHour = data.weekOpenHour;
            const closedDays = data.calendar.closedDays;

            // 오늘 날짜 정보
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const date = today.getDate();
            const day = today.getDay(); // 0(일)~6(토)

            // yyyyMM 문자열 만들기
            const yyyyMM = `${year}${month}`;

            // 오늘 휴관일인지 확인
            const todayIsClosedDay = closedDays[yyyyMM] && closedDays[yyyyMM].includes(date);

            let todayOpenText = "";

            // 휴관일이면 요일과 무관하게 휴관 처리
            if (todayIsClosedDay) {
                todayOpenText = "휴관";
            } else {
                // JSON의 요일 key와 JS 요일 매칭
                const jsonDay = day;
                todayOpenText = weekOpenHour[jsonDay];
            }

            // 출력
            document.getElementById("today_open_time").textContent = todayOpenText;
        })
        .catch((err) => console.error("JSON 불러오는 중 오류 발생:", err));
});
