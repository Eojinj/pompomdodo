// ============ 다국어 지원 ============
const translations = {
    ko: {
        title: '폼폼도도',
        nickname: '닉네임',
        nicknamePlaceholder: '닉네임을 입력하세요',
        goal: '오늘의 목표',
        goalPlaceholder: '예: 수학 과제 3페이지 완료하기',
        language: '언어 설정',
        pomodoroType: '뽀모도로 유형',
        basic: '기본형',
        'basic-desc': '25분 작업 / 5분 휴식',
        focus: '집중형',
        'focus-desc': '50분 작업 / 10분 휴식',
        start: '시작하기',
        home: '홈',
        working: '작업 중',
        breaking: '휴식 중',
        people: '명',
        chatWelcome: '채팅방에 입장했습니다',
        chatPlaceholder: '메시지를 입력하세요...',
        chatLimitReached: '채팅 횟수를 모두 사용했습니다',
        settings: '설정',
        change: '변경',
        themeSettings: '테마 설정',
        lightMode: '라이트 모드',
        darkMode: '다크 모드',
        todoTitle: '📝 쉬는 시간 TODO',
        todoInfo: '💡 쉬는 시간이 되면 자동으로 표시됩니다',
        todoPlaceholder: '할 일을 입력하고 엔터를 누르세요...',
        alarm: '알람',
        alarmMessage: '메시지',
        confirm: '확인',
        breakStart: '🎉 휴식 시간입니다!',
        breakMessage: '잠시 쉬어가세요. 스트레칭하고 눈을 쉬게 해주세요.',
        workStart: '💪 작업 시간입니다!',
        workMessage: '다시 집중할 시간입니다. 화이팅!',
        nextBreak: '휴식',
        nextWork: '작업',
        nicknameAlert: '닉네임을 입력해주세요!',
        nicknameChanged: '닉네임이 변경되었습니다!',
        goalChanged: '목표가 변경되었습니다!',
        nicknameChangedTo: '님이 (으)로 닉네임을 변경했습니다',
        homeConfirm: '메인 화면으로 돌아가시겠습니까?',
        chatLimitAlert: '채팅 횟수 제한에 도달했습니다!'
    },
    en: {
        title: 'PomPomDoDo',
        nickname: 'Nickname',
        nicknamePlaceholder: 'Enter your nickname',
        goal: "Today's Goal",
        goalPlaceholder: 'e.g., Complete 3 pages of math homework',
        language: 'Language Settings',
        pomodoroType: 'Pomodoro Type',
        basic: 'Basic',
        'basic-desc': '25min work / 5min break',
        focus: 'Focus',
        'focus-desc': '50min work / 10min break',
        start: 'Start',
        home: 'Home',
        working: 'Working',
        breaking: 'Break Time',
        people: ' people',
        chatWelcome: 'Welcome to the chat room',
        chatPlaceholder: 'Type a message...',
        chatLimitReached: 'Chat limit reached',
        settings: 'Settings',
        change: 'Change',
        themeSettings: 'Theme Settings',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        todoTitle: '📝 Break Time TODO',
        todoInfo: '💡 Automatically shown during break time',
        todoPlaceholder: 'Enter a task and press Enter...',
        alarm: 'Alarm',
        alarmMessage: 'Message',
        confirm: 'OK',
        breakStart: '🎉 Break Time!',
        breakMessage: 'Take a break. Stretch and rest your eyes.',
        workStart: '💪 Work Time!',
        workMessage: "Time to focus again. Let's go!",
        nextBreak: 'Break',
        nextWork: 'Work',
        nicknameAlert: 'Please enter a nickname!',
        nicknameChanged: 'Nickname changed!',
        goalChanged: 'Goal changed!',
        nicknameChangedTo: ' changed nickname to ',
        homeConfirm: 'Return to home screen?',
        chatLimitAlert: 'Chat limit reached!'
    }
};

let currentLanguage = 'ko';

// 언어 변경 함수
function changeLanguage(lang) {
    currentLanguage = lang;
    userSettings.language = lang;
    saveUserSettings();
    
    // 모든 data-i18n 속성을 가진 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // placeholder 업데이트
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // 테마 버튼 텍스트 업데이트
    updateThemeUI(document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    
    // 채팅 카운트 업데이트
    updateChatCountDisplay();
}

// ============ Firebase 초기화 ============
let firebaseInitialized = false;
let database = null;
let currentServerRef = null;
let usersRef = null;
let messagesRef = null;
let userRef = null;
let connectedRef = null;            // Firebase 연결 상태(.info/connected)
let beforeUnloadHandlerAdded = false; // beforeunload 중복 등록 방지


// Firebase 초기화 함수
function initializeFirebase() {
    try {
        if (typeof firebase !== 'undefined' && window.firebaseConfig) {
            firebase.initializeApp(window.firebaseConfig);
            database = firebase.database();
            firebaseInitialized = true;
            console.log('Firebase 초기화 완료');
            return true;
        } else {
            console.warn('Firebase가 로드되지 않았거나 설정이 없습니다. 로컬 모드로 실행됩니다.');
            return false;
        }
    } catch (error) {
        console.error('Firebase 초기화 실패:', error);
        return false;
    }
}

// ============ 사용자 식별 시스템 ============
// 사용자 고유 ID 생성 또는 불러오기
function getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        // 고유 ID 생성: 타임스탬프 + 랜덤 문자열
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// 사용자 ID 초기화 (내부적으로만 사용, 사용자에게는 보이지 않음)
const userId = getOrCreateUserId();
// 서버 연동 시 이 ID를 사용하여 사용자를 식별합니다

// ============ 설정 저장/불러오기 시스템 ============
// 저장할 설정 객체
const userSettings = {
    selectedServer: '1',
    selectedPomodoroType: 25,
    userName: '',
    sessionGoal: '',
    userCharacter: '🐠',
    userColor: '#4DD0E1',
    theme: 'light', // 테마 설정 추가
    language: 'ko', // 언어 설정 추가
    lastSaved: null
};

// 설정 저장 함수
function saveUserSettings() {
    userSettings.lastSaved = new Date().toISOString();
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    // 디버깅용 로그 (필요시 주석 해제)
    // console.log('사용자 설정이 저장되었습니다:', userSettings);
}

// 설정 불러오기 함수
function loadUserSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            // 저장된 설정을 현재 설정에 적용
            Object.assign(userSettings, loaded);
            
            // 전역 변수에 적용
            selectedServer = userSettings.selectedServer;
            selectedPomodoroType = userSettings.selectedPomodoroType;
            WORK_DURATION = userSettings.selectedPomodoroType === 25 ? 25 : 50;
            BREAK_DURATION = userSettings.selectedPomodoroType === 25 ? 5 : 10;
            CYCLE_DURATION = userSettings.selectedPomodoroType === 25 ? 30 : 60;
            maxChatCount = userSettings.selectedPomodoroType === 25 ? 5 : 10; // 채팅 횟수 설정
            
            userName = userSettings.userName || '익명' + Math.floor(Math.random() * 1000);
            sessionGoal = userSettings.sessionGoal || '';
            userCharacter = userSettings.userCharacter || '🐠';
            userColor = userSettings.userColor || '#4DD0E1';
            
            // 테마 적용
            if (userSettings.theme === 'dark') {
                document.body.classList.add('dark-mode');
                updateThemeUI('dark');
            } else {
                document.body.classList.remove('dark-mode');
                updateThemeUI('light');
            }
            
            // 언어 적용
            if (userSettings.language) {
                currentLanguage = userSettings.language;
                changeLanguage(currentLanguage);
            }
            
            // UI에 반영 (닉네임과 목표는 제외)
            applySettingsToUI();
            
            // 디버깅용 로그 (필요시 주석 해제)
            // console.log('사용자 설정이 복원되었습니다:', userSettings);
        } catch (e) {
            console.error('설정 불러오기 실패:', e);
        }
    } else {
        // 기본값 사용
        userName = '익명' + Math.floor(Math.random() * 1000);
    }
}

// UI에 설정 적용
function applySettingsToUI() {
    // 닉네임은 저장되어 있고 기본값이 아닐 때만 자동으로 불러오기
    const nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput && userName && !userName.startsWith('익명')) {
        nicknameInput.value = userName;
    }
    
    // 목표는 저장되어 있으면 자동으로 불러오기
    const goalInput = document.getElementById('sessionGoalInput');
    if (goalInput && sessionGoal) {
        goalInput.value = sessionGoal;
    }
    
    // 서버 선택 버튼
    document.querySelectorAll('.option-btn[data-server]').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.server === selectedServer) {
            btn.classList.add('selected');
        }
    });
    
    // 뽀모도로 타입 버튼
    document.querySelectorAll('.option-btn[data-pomodoro]').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.pomodoro) === selectedPomodoroType) {
            btn.classList.add('selected');
        }
    });
}

// 설정 변수
let selectedServer = '1';
let selectedPomodoroType = 25;
let WORK_DURATION = 25;
let BREAK_DURATION = 5;
let CYCLE_DURATION = 30;

// 채팅 관련
let chatOpen = false;
let settingsOpen = false;
let userName = '익명' + Math.floor(Math.random() * 1000);
let sessionGoal = '';

// 메모 관련
let memoOpen = false;
let todoItems = [];
let lastStatus = null;
let memoNotificationShown = false;

// 알람 관련
let alarmPlaying = false;
let audioContext = null;
let oscillator = null;
let gainNode = null;
let alarmTimeout = null;

// 캔버스 관련
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

// 사용자 설정
let userCharacter = '🐠';
let userColor = '#4DD0E1';

// 캐릭터 배열
let characters = [];

// 이미지 로딩
const fishImage = new Image();
fishImage.src = 'images/basicFish.png';

// 캐릭터 클래스
class Character {
    constructor(emoji, color, id) {
        this.emoji = emoji;
        this.color = color;
        this.id = id;
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * (canvas.height - 50);
        this.size = 40;
        this.isSleeping = false;
        this.imageLoaded = false;
        
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8;
        this.turnSpeed = 0.03;
        this.targetAngle = this.angle;
        
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveSpeed = 0.05;
        this.waveAmplitude = 3;
        
        this.changeDirectionTimer = Math.floor(Math.random() * 180) + 120;
        
        // 이미지가 로드되면 플래그 설정
        if (fishImage.complete) {
            this.imageLoaded = true;
        } else {
            fishImage.onload = () => {
                this.imageLoaded = true;
            };
        }
    }

    update() {
        if (this.isSleeping) return;

        this.changeDirectionTimer--;
        if (this.changeDirectionTimer <= 0) {
            this.targetAngle = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = Math.floor(Math.random() * 180) + 120;
        }

        let angleDiff = this.targetAngle - this.angle;
        
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.angle += angleDiff * this.turnSpeed;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        
        this.x += vx;
        this.y += vy;

        if (this.x < 20) {
            this.targetAngle = 0;
            this.x = 20;
        }
        if (this.x > canvas.width - this.size - 20) {
            this.targetAngle = Math.PI;
            this.x = canvas.width - this.size - 20;
        }
        if (this.y < 20) {
            this.targetAngle = Math.PI / 2;
            this.y = 20;
        }
        if (this.y > canvas.height - this.size - 20) {
            this.targetAngle = -Math.PI / 2;
            this.y = canvas.height - this.size - 20;
        }

        this.waveOffset += this.waveSpeed;
    }

    draw() {
        const waveX = Math.sin(this.waveOffset) * this.waveAmplitude;
        const waveY = Math.cos(this.waveOffset * 0.5) * (this.waveAmplitude * 0.5);

        if (this.isSleeping) {
            // 자는 중에는 이모티콘 표시
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💤', this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
        } else {
            // 깨어있을 때는 이미지 또는 이모티콘 표시
            ctx.save();
            ctx.translate(this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
            
            const vx = Math.cos(this.angle);
            // 물고기가 오른쪽으로 갈 때 반전
            if (vx > 0) {
                ctx.scale(-1, 1);
            }
            
            if (this.imageLoaded && this.emoji === '🐠') {
                // 🐠 이모티콘이면 이미지 사용
                // 이미지의 원본 비율 유지
                const imgWidth = fishImage.width;
                const imgHeight = fishImage.height;
                const aspectRatio = imgWidth / imgHeight;
                
                // 크기 2배로 증가
                const drawHeight = this.size * 2;
                const drawWidth = drawHeight * aspectRatio;
                
                ctx.drawImage(
                    fishImage, 
                    -drawWidth/2, 
                    -drawHeight/2, 
                    drawWidth, 
                    drawHeight
                );
            } else {
                // 다른 이모티콘은 텍스트로 표시
                ctx.font = `${this.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);
            }
            
            ctx.restore();
        }
    }
}

// 시작 화면 이벤트
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const group = this.parentElement;
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        
        if (this.dataset.server) {
            selectedServer = this.dataset.server;
            userSettings.selectedServer = selectedServer;
            saveUserSettings();
        }
        if (this.dataset.language) {
            changeLanguage(this.dataset.language);
        }
        if (this.dataset.pomodoro) {
            selectedPomodoroType = parseInt(this.dataset.pomodoro);
            userSettings.selectedPomodoroType = selectedPomodoroType;
            if (selectedPomodoroType === 25) {
                WORK_DURATION = 25;
                BREAK_DURATION = 5;
                CYCLE_DURATION = 30;
                maxChatCount = 5; // 25분: 5번
            } else {
                WORK_DURATION = 50;
                BREAK_DURATION = 10;
                CYCLE_DURATION = 60;
                maxChatCount = 10; // 50분: 10번
            }
            saveUserSettings();
        }
    });
});

// 게임 시작
function startGame() {
    const nicknameInput = document.getElementById('nicknameInput');
    const nickname = nicknameInput.value.trim();
    
    if (nickname === '') {
        alert(translations[currentLanguage].nicknameAlert);
        nicknameInput.focus();
        return;
    }
    
    userName = nickname;
    userSettings.userName = userName;
    
    const goalInput = document.getElementById('sessionGoalInput');
    sessionGoal = goalInput.value.trim();
    userSettings.sessionGoal = sessionGoal;
    
    // 설정 저장
    saveUserSettings();
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    document.getElementById('nicknameChange').value = userName;
    document.getElementById('goalChange').value = sessionGoal;
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    initGame();
}

// 홈으로 돌아가기
function goToHome() {
    if (confirm('메인 화면으로 돌아가시겠습니까?')) {
        // Firebase 연결 해제
        disconnectFromServer();
        
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
        
        // 저장된 설정으로 입력 필드 복원
        applySettingsToUI();
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '<div class="system-message">채팅방에 입장했습니다</div>';
        
        document.getElementById('chatInput').value = '';
    }
}

// ============ Firebase 실시간 기능 ============
// 서버에 연결
function connectToServer() {
    // 기존 연결이 있으면 먼저 해제 (중복 방지)
    if (usersRef || messagesRef || connectedRef) {
        disconnectFromServer();
    }
    
    if (!firebaseInitialized || !database) {
        console.log('Firebase가 초기화되지 않아 로컬 모드로 실행됩니다.');
        updateOnlineCount(1); // 로컬 모드: 1명으로 표시
        return;
    }
    
    const serverId = `server${selectedServer}`;
    currentServerRef = database.ref(`servers/${serverId}`);
    usersRef = currentServerRef.child('users');
    messagesRef = currentServerRef.child('messages');
    userRef = usersRef.child(userId);
    
    // Firebase 연결 상태(.info/connected) 감지
    connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
        const connected = snapshot.val();
        if (connected === true) {
            // 연결되었을 때: onDisconnect로 정리 예약
            if (userRef) {
                userRef.onDisconnect().remove();
            }

            // 사용자 정보 저장 / 갱신
            // joinedAt은 처음 한 번만 설정하고, 이후에는 업데이트하지 않음
            userRef.once('value', (userSnapshot) => {
                const userData = userSnapshot.val();
                if (!userData || !userData.joinedAt) {
                    // 처음 입장하는 경우
                    userRef.set({
                        userId: userId,
                        userName: userName,
                        character: userCharacter,
                        color: userColor,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    });
                } else {
                    // 이미 입장한 경우 (재연결 등) - joinedAt은 유지하고 나머지만 업데이트
                    userRef.update({
                        userId: userId,
                        userName: userName,
                        character: userCharacter,
                        color: userColor
                    });
                }
            });
        }
    });
    
    // 접속자 수 실시간 감지
    usersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const onlineCount = Object.keys(users).length;
        updateOnlineCount(onlineCount);
    });
    
    // 메시지 실시간 감지
    messagesRef.limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        const messageId = snapshot.key;
        
        // 내가 보낸 메시지가 아니고, 아직 표시하지 않은 메시지만 표시
        if (message && message.userId !== userId && !sentMessageIds.has(messageId)) {
            addMessage(message.userName, message.content, false);
        }
    });
    
    
    // 페이지 종료 시 사용자 제거 (한 번만 등록)
    if (!beforeUnloadHandlerAdded) {
        window.addEventListener('beforeunload', () => {
            disconnectFromServer();
        });
        beforeUnloadHandlerAdded = true;
    }
}

// 서버 연결 해제
function disconnectFromServer() {
    // presence 연결 상태 리스너 제거
    if (connectedRef) {
        connectedRef.off();
        connectedRef = null;
    }

    // 내 유저 노드 제거
    if (userRef) {
        userRef.remove();
        userRef = null;
    }

    // 리스너 해제
    if (usersRef) {
        usersRef.off();
        usersRef = null;
    }
    if (messagesRef) {
        messagesRef.off();
        messagesRef = null;
    }

    currentServerRef = null;
}

// 접속자 수 업데이트 (DOM에만 반영)
function updateOnlineCount(count) {
    const onlineCountElement = document.getElementById('onlineCount');
    if (onlineCountElement) {
        onlineCountElement.textContent = count != null ? count : 1;
    }
}

// 게임 초기화
function initGame() {
    characters = [];
    characters.push(new Character(userCharacter, userColor, 1));
    
    // Firebase 연결
    connectToServer();
    
    // 채팅 카운트 표시 초기화
    updateChatCountDisplay();
    
    animate();
    updateUI();
    setInterval(updateUI, 1000);
}

// 캔버스 크기 조정
function resizeCanvas() {
    const container = document.querySelector('.field-container');
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// 애니메이션 루프
function animate() {
    // 테마에 따라 그라디언트 색상 변경
    const isDark = document.body.classList.contains('dark-mode');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    if (isDark) {
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#2a2a2a');
    } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0E0F6');
        gradient.addColorStop(1, '#C8E6F5');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 물방울 개수 줄이고 투명도 낮춤
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    characters.forEach(char => {
        char.update();
        char.draw();
    });

    requestAnimationFrame(animate);
}

// 타이머 로직
function getCurrentStatus() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const cycleMinute = minutes % CYCLE_DURATION;
    const totalSeconds = cycleMinute * 60 + seconds;
    
    const isWorking = cycleMinute < WORK_DURATION;
    
    let remainingSeconds;
    if (isWorking) {
        remainingSeconds = (WORK_DURATION * 60) - totalSeconds;
    } else {
        remainingSeconds = (CYCLE_DURATION * 60) - totalSeconds;
    }
    
    return {
        isWorking,
        remainingSeconds,
        cycleMinute
    };
}

function getNextTransitionTime() {
    const now = new Date();
    const minutes = now.getMinutes();
    const cycleMinute = minutes % CYCLE_DURATION;
    
    if (cycleMinute < WORK_DURATION) {
        const nextBreakMinute = Math.floor(minutes / CYCLE_DURATION) * CYCLE_DURATION + WORK_DURATION;
        const nextBreak = new Date(now);
        nextBreak.setMinutes(nextBreakMinute);
        nextBreak.setSeconds(0);
        return { type: 'break', time: nextBreak };
    } else {
        const nextWorkMinute = (Math.floor(minutes / CYCLE_DURATION) + 1) * CYCLE_DURATION;
        const nextWork = new Date(now);
        nextWork.setMinutes(nextWorkMinute);
        nextWork.setSeconds(0);
        return { type: 'work', time: nextWork };
    }
}

// UI 업데이트
function updateUI() {
    const status = getCurrentStatus();
    const nextTransition = getNextTransitionTime();
    
    const minutes = Math.floor(status.remainingSeconds / 60);
    const seconds = status.remainingSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (status.isWorking) {
        statusIndicator.className = 'status-indicator status-working';
        statusText.textContent = '작업 중';
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = false);
        
        const breakTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `${String(breakTime.getHours()).padStart(2, '0')}:${String(breakTime.getMinutes()).padStart(2, '0')} 휴식`;
        
        // 작업 시작 알람 (휴식에서 작업으로 전환)
        if (lastStatus === false && !memoNotificationShown) {
            showAlarmNotification(false);
            memoNotificationShown = true;
            resetChatCount(); // 작업 시작 시 채팅 카운트 리셋
        }
    } else {
        statusIndicator.className = 'status-indicator status-breaking';
        statusText.textContent = '휴식 중';
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = true);
        
        const workTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `${String(workTime.getHours()).padStart(2, '0')}:${String(workTime.getMinutes()).padStart(2, '0')} 작업`;
        
        // 휴식 시작 알람 (작업에서 휴식으로 전환)
        if (lastStatus === true && !memoNotificationShown) {
            showAlarmNotification(true);
            memoNotificationShown = true;
        }
    }
    
    lastStatus = status.isWorking;
}

// 알람 사운드 기능
function playAlarmSound() {
    if (alarmPlaying) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    alarmPlaying = true;
    
    playAlarmBeep();
    
    // 15초 후 자동으로 알람 멈춤
    alarmTimeout = setTimeout(() => {
        stopAlarmSound();
    }, 15000);
}

function playAlarmBeep() {
    if (!alarmPlaying) return;
    
    // 첫 번째 비프음
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // 두 번째 비프음
    setTimeout(() => {
        if (!alarmPlaying) return;
        
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
        
        // 2초 후 반복
        setTimeout(() => {
            if (alarmPlaying) {
                playAlarmBeep();
            }
        }, 2000);
    }, 300);
}

function stopAlarmSound() {
    alarmPlaying = false;
    
    if (alarmTimeout) {
        clearTimeout(alarmTimeout);
        alarmTimeout = null;
    }
    
    if (oscillator) {
        try {
            oscillator.stop();
        } catch (e) {}
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

function showAlarmNotification(isBreak) {
    playAlarmSound();
    
    const notification = document.getElementById('alarmNotification');
    const title = document.getElementById('alarmTitle');
    const message = document.getElementById('alarmMessage');
    
    if (isBreak) {
        title.textContent = '🎉 휴식 시간입니다!';
        message.textContent = '잠시 쉬어가세요. 스트레칭하고 눈을 쉬게 해주세요.';
    } else {
        title.textContent = '💪 작업 시간입니다!';
        message.textContent = '다시 집중할 시간입니다. 화이팅!';
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'alarm-overlay';
    overlay.id = 'alarmOverlay';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('show');
        notification.classList.add('show');
    }, 10);
}

function closeAlarmNotification() {
    stopAlarmSound();
    
    const notification = document.getElementById('alarmNotification');
    const overlay = document.getElementById('alarmOverlay');
    
    notification.classList.remove('show');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
    
    // 휴식 시간이면 TODO 알림도 표시
    const status = getCurrentStatus();
    if (!status.isWorking) {
        setTimeout(() => {
            showMemoNotification();
        }, 500);
    }
}

// TODO 기능
function toggleMemo() {
    memoOpen = !memoOpen;
    const memoPanel = document.getElementById('memoPanel');
    const memoPanelOverlay = document.getElementById('memoPanelOverlay');
    
    if (memoOpen) {
        memoPanel.classList.add('open');
        memoPanelOverlay.classList.add('show');
        document.getElementById('todoInput').focus();
    } else {
        memoPanel.classList.remove('open');
        memoPanelOverlay.classList.remove('show');
    }
}

function handleTodoKeypress(event) {
    if (event.key === 'Enter') {
        addTodoItem();
    }
}

function addTodoItem() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text === '') return;
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    // 배열 앞에 추가 (상단에 표시)
    todoItems.unshift(todo);
    saveTodos();
    renderTodos();
    
    input.value = '';
    input.focus();
}

function toggleTodo(id) {
    const todo = todoItems.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todoItems = todoItems.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    if (!todoList) return;
    todoList.innerHTML = '';
    
    todoItems.forEach(todo => {
        const item = document.createElement('div');
        item.className = 'todo-item' + (todo.completed ? ' completed' : '');
        
        const checkbox = document.createElement('div');
        checkbox.className = 'todo-checkbox' + (todo.completed ? ' checked' : '');
        checkbox.onclick = () => toggleTodo(todo.id);
        
        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = () => deleteTodo(todo.id);
        
        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(deleteBtn);
        
        todoList.appendChild(item);
    });
}

function saveTodos() {
    localStorage.setItem('todoItems', JSON.stringify(todoItems));
}

function loadTodos() {
    const saved = localStorage.getItem('todoItems');
    if (saved) {
        todoItems = JSON.parse(saved);
        renderTodos();
    }
}

function showMemoNotification() {
    const incompleteTodos = todoItems.filter(t => !t.completed);
    
    if (incompleteTodos.length === 0) return;
    
    const notification = document.getElementById('memoNotification');
    const content = document.getElementById('memoNotificationContent');
    
    content.innerHTML = '';
    
    incompleteTodos.forEach(todo => {
        const item = document.createElement('div');
        item.className = 'todo-item';
        item.style.marginBottom = '8px';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'todo-checkbox';
        checkbox.onclick = () => {
            toggleTodo(todo.id);
            showMemoNotification();
        };
        
        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;
        
        item.appendChild(checkbox);
        item.appendChild(text);
        content.appendChild(item);
    });
    
    // 기존 오버레이가 있는지 확인하고, 없으면 생성
    let overlay = document.getElementById('memoOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'memo-overlay';
        overlay.id = 'memoOverlay';
        document.body.appendChild(overlay);
    }
    
    setTimeout(() => {
        overlay.classList.add('show');
        notification.classList.add('show');
    }, 10);
}

function closeMemoNotification() {
    const notification = document.getElementById('memoNotification');
    const overlay = document.getElementById('memoOverlay');
    
    notification.classList.remove('show');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
}

// ============ 채팅 기능 (횟수 제한 추가) ============
let sentMessageIds = new Set(); // 중복 메시지 방지
let chatCount = 0; // 현재 세션의 채팅 횟수
let maxChatCount = 5; // 세션당 최대 채팅 횟수 (25분: 5번, 50분: 10번)

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // 채팅 횟수 제한 확인
    if (chatCount >= maxChatCount) {
        alert(`이번 세션에는 최대 ${maxChatCount}번까지만 채팅할 수 있습니다. 다음 세션을 기다려주세요!`);
        return;
    }
    
    // 채팅 횟수 증가
    chatCount++;
    updateChatCountDisplay();
    
    // Firebase에 메시지 저장
    if (firebaseInitialized && messagesRef) {
        const messageRef = messagesRef.push({
            userId: userId,
            userName: userName,
            content: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            serverId: `server${selectedServer}`
        });
        
        // 내가 보낸 메시지는 즉시 표시하고 ID 저장 (중복 방지)
        const messageId = messageRef.key;
        sentMessageIds.add(messageId);
        addMessage(userName, message, true);
    } else {
        // 로컬 모드: 즉시 표시
        addMessage(userName, message, true);
    }
    
    input.value = '';
}

function addMessage(author, content, isOwn) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    messageDiv.innerHTML = `<span class="message-author">${author}:</span> <span class="message-content">${content}</span>`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 채팅 카운트 표시 업데이트
function updateChatCountDisplay() {
    const input = document.getElementById('chatInput');
    if (input) {
        const remaining = maxChatCount - chatCount;
        if (remaining > 0) {
            input.placeholder = `메시지를 입력하세요... (${remaining}/${maxChatCount})`;
        } else {
            input.placeholder = '채팅 횟수를 모두 사용했습니다';
            input.disabled = true;
        }
    }
}

// 세션 전환 시 채팅 카운트 리셋
function resetChatCount() {
    chatCount = 0;
    const input = document.getElementById('chatInput');
    if (input) {
        input.disabled = false;
        input.placeholder = `메시지를 입력하세요... (${maxChatCount}/${maxChatCount})`;
    }
}

// 설정 패널 기능
function toggleSettings() {
    settingsOpen = !settingsOpen;
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsOverlay = document.getElementById('settingsOverlay');
    
    if (settingsOpen) {
        settingsPanel.classList.add('open');
        settingsOverlay.classList.add('show');
    } else {
        settingsPanel.classList.remove('open');
        settingsOverlay.classList.remove('show');
    }
}

function changeNickname() {
    const newNickname = document.getElementById('nicknameChange').value.trim();
    
    if (newNickname === '') {
        alert('닉네임을 입력해주세요!');
        return;
    }
    
    const oldNickname = userName;
    userName = newNickname;
    userSettings.userName = userName;
    
    // 설정 저장
    saveUserSettings();
    
    // Firebase에 닉네임 업데이트
    if (firebaseInitialized && userRef) {
        userRef.update({ userName: userName });
    }
    
    const messagesDiv = document.getElementById('chatMessages');
    const systemMsg = document.createElement('div');
    systemMsg.className = 'system-message';
    systemMsg.textContent = `${oldNickname}님이 ${userName}(으)로 닉네임을 변경했습니다`;
    messagesDiv.appendChild(systemMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    alert('닉네임이 변경되었습니다!');
}

function changeGoal() {
    const newGoal = document.getElementById('goalChange').value.trim();
    sessionGoal = newGoal;
    userSettings.sessionGoal = sessionGoal;
    
    // 설정 저장
    saveUserSettings();
    
    alert('목표가 변경되었습니다!');
}

// 테마 전환 함수
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        // 라이트 모드로 전환
        document.body.classList.remove('dark-mode');
        userSettings.theme = 'light';
        updateThemeUI('light');
    } else {
        // 다크 모드로 전환
        document.body.classList.add('dark-mode');
        userSettings.theme = 'dark';
        updateThemeUI('dark');
    }
    
    // 설정 저장
    saveUserSettings();
}

// 테마 UI 업데이트
function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon && themeText) {
        if (theme === 'dark') {
            themeIcon.textContent = '🌙';
            themeText.textContent = translations[currentLanguage].darkMode;
        } else {
            themeIcon.textContent = '☀️';
            themeText.textContent = translations[currentLanguage].lightMode;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Firebase 초기화
    initializeFirebase();
    
    // 사용자 설정 불러오기 (페이지 로드 시)
    loadUserSettings();
    
    // TODO 목록 로드
    loadTodos();
})