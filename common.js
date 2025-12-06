document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('currentUser');
    
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');

    if (currentUser) {
        
        if (signupBtn) {
            signupBtn.href = 'mypage.html';
            signupBtn.title = '마이페이지';
            const span = signupBtn.querySelector('span');
            if (span) span.textContent = '마이페이지';
        }

        if (loginBtn) {
            loginBtn.href = '#'; 
            loginBtn.title = '로그아웃';
            const span = loginBtn.querySelector('span');
            if (span) span.textContent = '로그아웃';

            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('currentUser');
                alert('로그아웃 되었습니다.');
                if(window.location.pathname.includes('mypage.html')){
                    window.location.href = 'index.html';
                } else {
                    window.location.reload();
                }
            });
        }
    }
});