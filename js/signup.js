const idInput = document.getElementById('id');
        const pwInput = document.getElementById('password');
        const pwConfirmInput = document.getElementById('password-confirm');
        
        const tel1 = document.getElementById('tel1');
        const tel2 = document.getElementById('tel2');
        const tel3 = document.getElementById('tel3');
        const telMsg = document.getElementById('telMsg');

        const idMsg = document.getElementById('idMsg');
        const pwMsg = document.getElementById('pwMsg');
        const pwConfirmMsg = document.getElementById('pwConfirmMsg');

        const allowedCharRegex = /^[a-z0-9\-_]+$/;
        const startEndAlphanumericRegex = /^[a-z0-9].*[a-z0-9]$/;

        let userDB = [];

        async function loadUserDB() {
            const localData = localStorage.getItem('userDB');
            
            if (localData) {
                userDB = JSON.parse(localData);
            } else {
                try {
                    const response = await fetch('./data.json');
                    userDB = await response.json();
                    localStorage.setItem('userDB', JSON.stringify(userDB));
                } catch (error) {
                    console.error("데이터 로드 실패:", error);
                    userDB = [];
                }
            }
        }
        
        loadUserDB();

        function onlyNumbers(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }

        function validateId() {
            const value = idInput.value;
            
            if (value.length === 0) {
                idMsg.textContent = "";
                return false;
            }

            if (value.length < 5 || value.length > 20) {
                idMsg.textContent = "5~20자여야 합니다.";
                idMsg.className = "validation-msg msg-error";
                return false;
            }

            if (!allowedCharRegex.test(value)) {
                idMsg.textContent = "영문 소문자, 숫자, 특수기호(_, -)만 가능합니다.";
                idMsg.className = "validation-msg msg-error";
                return false;
            }

            if (!startEndAlphanumericRegex.test(value) && value.length >= 2) {
                idMsg.textContent = "시작과 끝은 특수기호를 쓸 수 없습니다.";
                idMsg.className = "validation-msg msg-error";
                return false;
            }

            const isDuplicate = userDB.some(user => user.id === value);
            
            if (isDuplicate) {
                idMsg.textContent = "이미 사용 중인 아이디입니다.";
                idMsg.className = "validation-msg msg-error";
                return false;
            }

            idMsg.textContent = "사용 가능한 아이디입니다.";
            idMsg.className = "validation-msg msg-success";
            return true;
        }

        function validatePw() {
            const value = pwInput.value;
            if (pwConfirmInput.value.length > 0) validatePwConfirm();
            if (value.length === 0) { pwMsg.textContent = ""; return false; }
            if (value.length < 8) {
                pwMsg.textContent = "8글자 이상이어야 합니다.";
                pwMsg.className = "validation-msg msg-error";
                return false;
            }
            pwMsg.textContent = "사용 가능한 비밀번호입니다.";
            pwMsg.className = "validation-msg msg-success";
            return true;
        }

        function validatePwConfirm() {
            const pwValue = pwInput.value;
            const confirmValue = pwConfirmInput.value;
            if (confirmValue.length === 0) { pwConfirmMsg.textContent = ""; return false; }
            if (pwValue !== confirmValue) {
                pwConfirmMsg.textContent = "비밀번호가 일치하지 않습니다.";
                pwConfirmMsg.className = "validation-msg msg-error";
                return false;
            } else {
                pwConfirmMsg.textContent = "비밀번호가 일치합니다.";
                pwConfirmMsg.className = "validation-msg msg-success";
                return true;
            }
        }

        function validatePhone() {
            const t1 = tel1.value;
            const t2 = tel2.value;
            const t3 = tel3.value;

            if(!t1 || !t2 || !t3) {
                telMsg.textContent = "";
                return false;
            }
            const regExpHead = /^0([0-9]{1,2})$/;
            if (!regExpHead.test(t1)) {
                telMsg.textContent = "앞자리는 010, 02 등이어야 합니다.";
                telMsg.className = "validation-msg msg-error";
                return false;
            }
            if (t2.length < 3) {
                telMsg.textContent = "중간자리는 3자리 이상이어야 합니다.";
                telMsg.className = "validation-msg msg-error";
                return false;
            }
            if (t3.length < 4) {
                telMsg.textContent = "뒷자리는 4자리여야 합니다.";
                telMsg.className = "validation-msg msg-error";
                return false;
            }
            telMsg.textContent = "유효한 전화번호 형식입니다.";
            telMsg.className = "validation-msg msg-success";
            return true;
        }

        idInput.addEventListener('input', validateId);
        pwInput.addEventListener('input', validatePw);
        pwConfirmInput.addEventListener('input', validatePwConfirm);
        [tel1, tel2, tel3].forEach(el => {
            el.addEventListener('input', (e) => {
                onlyNumbers(e);
                validatePhone();
            });
        });

        document.getElementById('signupForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const isIdValid = validateId();
            const isPwValid = validatePw();
            const isPwConfirmValid = validatePwConfirm();
            const isPhoneValid = validatePhone();

            if (isIdValid && isPwValid && isPwConfirmValid && isPhoneValid) {
                const newUser = {
                    name: document.getElementById('name').value,
                    id: idInput.value,
                    pw: pwInput.value,
                    phone: tel1.value + tel2.value + tel3.value,
                    email: document.getElementById('email').value
                };

                userDB.push(newUser);
                localStorage.setItem('userDB', JSON.stringify(userDB));

                alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
                location.href = 'login.html';
            } else {
                alert("입력 정보를 다시 확인해주세요.");
            }
        });