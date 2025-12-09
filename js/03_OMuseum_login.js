async function initUserDB() {
    if (localStorage.getItem("userDB")) {
        console.log("로컬 스토리지 userDB 사용 (변경된 정보 유지)");
        return;
    }
    try {
        const response = await fetch("./03_OMuseum_data.json");
        const initialData = await response.json();
        localStorage.setItem("userDB", JSON.stringify(initialData));
        console.log("데이터가 새로 로드되었습니다:", initialData);
    } catch (error) {
        console.error("초기 데이터 로드 실패", error);
        if (!localStorage.getItem("userDB")) {
            localStorage.setItem("userDB", JSON.stringify([]));
        }
    }
}
initUserDB();

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const inputId = document.getElementById("loginId").value;
    const inputPw = document.getElementById("loginPw").value;

    const userDB = JSON.parse(localStorage.getItem("userDB")) || [];

    const targetUser = userDB.find((user) => user.id === inputId);

    if (targetUser) {
        if (targetUser.pw === inputPw) {
            alert(`${targetUser.name}님 환영합니다!`);
            sessionStorage.setItem("currentUser", JSON.stringify(targetUser));
            location.href = "03_OMuseum_index.html";
        } else {
            alert("비밀번호가 일치하지 않습니다.");
        }
    } else {
        alert("입력하신 정보가 없습니다. 회원가입이 필요합니다.");
    }
});
