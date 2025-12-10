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
        chatLimitAlert: '채팅 횟수 제한에 도달했습니다!',
        todoCompleted: '🎉 휴식 TODO 완료!',
        fishCollection: '🐠 물고기 도감',
        unlockFish: '🎁 랜덤 물고기 3마리 받기',
        fishUnlockInfo: '💡 후원 기능은 곧 추가됩니다',
        fishUnlocked: '새로운 물고기를 획득했습니다!',
        fishSelected: '물고기를 선택했습니다!',
        fishLocked: '이 물고기는 아직 잠겨있습니다 🔒'
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
        chatLimitAlert: 'Chat limit reached!',
        todoCompleted: '🎉 Break TODO Completed!',
        fishCollection: '🐠 Fish Collection',
        unlockFish: '🎁 Get 3 Random Fish',
        fishUnlockInfo: '💡 Donation feature coming soon',
        fishUnlocked: 'New fish unlocked!',
        fishSelected: 'Fish selected!',
        fishLocked: 'This fish is locked 🔒'
    }
};

let currentLanguage = 'ko';
let currentTimezone = 'Asia/Seoul'; // 기본값: 한국 시간

// 언어 변경 함수
function changeLanguage(lang) {
    currentLanguage = lang;
    userSettings.language = lang;
    
    // 언어에 따라 시간대 설정
    if (lang === 'ko') {
        currentTimezone = 'Asia/Seoul';
    } else if (lang === 'en') {
        currentTimezone = 'America/New_York'; // EST/EDT
    }
    userSettings.timezone = currentTimezone;
    
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
let connectedRef = null;
let beforeUnloadHandlerAdded = false;

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
function getOrCreateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

const userId = getOrCreateUserId();

// ============ 설정 저장/불러오기 시스템 ============
const userSettings = {
    selectedServer: '1',
    selectedPomodoroType: 25,
    userName: '',
    sessionGoal: '',
    userCharacter: '🐠',
    userColor: '#4DD0E1',
    theme: 'light',
    language: 'ko',
    timezone: 'Asia/Seoul',
    lastSaved: null
};

// 설정 저장 함수
function saveUserSettings() {
    userSettings.lastSaved = new Date().toISOString();
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

// 설정 불러오기 함수
function loadUserSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(userSettings, loaded);
            
            selectedServer = userSettings.selectedServer;
            selectedPomodoroType = userSettings.selectedPomodoroType;
            WORK_DURATION = userSettings.selectedPomodoroType === 25 ? 25 : 50;
            BREAK_DURATION = userSettings.selectedPomodoroType === 25 ? 5 : 10;
            CYCLE_DURATION = userSettings.selectedPomodoroType === 25 ? 30 : 60;
            maxChatCount = userSettings.selectedPomodoroType === 25 ? 5 : 10;
            
            userName = userSettings.userName || '익명' + Math.floor(Math.random() * 1000);
            sessionGoal = userSettings.sessionGoal || '';
            userCharacter = userSettings.userCharacter || '🐠';
            userColor = userSettings.userColor || '#4DD0E1';
            
            // 시간대 설정
            if (userSettings.timezone) {
                currentTimezone = userSettings.timezone;
            }
            
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
            
            applySettingsToUI();
        } catch (e) {
            console.error('설정 불러오기 실패:', e);
        }
    } else {
        userName = '익명' + Math.floor(Math.random() * 1000);
    }
}

// UI에 설정 적용
function applySettingsToUI() {
    const nicknameInput = document.getElementById('nicknameInput');
    if (nicknameInput && userName && !userName.startsWith('익명')) {
        nicknameInput.value = userName;
    }
    
    const goalInput = document.getElementById('sessionGoalInput');
    if (goalInput && sessionGoal) {
        goalInput.value = sessionGoal;
    }
    
    document.querySelectorAll('.option-btn[data-server]').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.server === selectedServer) {
            btn.classList.add('selected');
        }
    });
    
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

// 물고기 도감 관련
let fishCollectionOpen = false;
const allFish = [
    { id: 'basicFish', name: '기본 물고기', nameEn: 'Basic Fish', image: 'images/basicFish.png', unlocked: true },
    { id: 'bluehornFish', name: '파란뿔 물고기', nameEn: 'Blue Horn Fish', image: 'images/bluehornFish.png', unlocked: false },
    { id: 'bluewigFish', name: '파란지느러미 물고기', nameEn: 'Blue Wig Fish', image: 'images/bluewigFish.png', unlocked: false },
    { id: 'rainbowhornFish', name: '무지개뿔 물고기', nameEn: 'Rainbow Horn Fish', image: 'images/rainbowhornFish.png', unlocked: false },
    { id: 'redhornFish', name: '빨간뿔 물고기', nameEn: 'Red Horn Fish', image: 'images/redhornFish.png', unlocked: false },
    { id: 'santaFish', name: '산타 물고기', nameEn: 'Santa Fish', image: 'images/santaFish.png', unlocked: false },
    { id: 'twintailFish', name: '쌍꼬리 물고기', nameEn: 'Twin Tail Fish', image: 'images/twintailFIish.png', unlocked: false }
];
let unlockedFish = ['basicFish']; // 기본 물고기는 처음부터 해금

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
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💤', this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
        } else {
            ctx.save();
            ctx.translate(this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
            
            const vx = Math.cos(this.angle);
            if (vx > 0) {
                ctx.scale(-1, 1);
            }
            
            if (this.imageLoaded && this.emoji === '🐠') {
                const imgWidth = fishImage.width;
                const imgHeight = fishImage.height;
                const aspectRatio = imgWidth / imgHeight;
                
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
                maxChatCount = 5;
            } else {
                WORK_DURATION = 50;
                BREAK_DURATION = 10;
                CYCLE_DURATION = 60;
                maxChatCount = 10;
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
    if (confirm(translations[currentLanguage].homeConfirm)) {
        disconnectFromServer();
        
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
        
        applySettingsToUI();
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `<div class="system-message">${translations[currentLanguage].chatWelcome}</div>`;
        
        document.getElementById('chatInput').value = '';
    }
}

// ============ Firebase 실시간 기능 ============
function connectToServer() {
    if (usersRef || messagesRef || connectedRef) {
        disconnectFromServer();
    }
    
    if (!firebaseInitialized || !database) {
        console.log('Firebase가 초기화되지 않아 로컬 모드로 실행됩니다.');
        updateOnlineCount(1);
        return;
    }
    
    const serverId = `server${selectedServer}`;
    currentServerRef = database.ref(`servers/${serverId}`);
    usersRef = currentServerRef.child('users');
    messagesRef = currentServerRef.child('messages');
    userRef = usersRef.child(userId);
    
    connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
        const connected = snapshot.val();
        if (connected === true) {
            if (userRef) {
                userRef.onDisconnect().remove();
            }

            userRef.once('value', (userSnapshot) => {
                const userData = userSnapshot.val();
                if (!userData || !userData.joinedAt) {
                    userRef.set({
                        userId: userId,
                        userName: userName,
                        character: userCharacter,
                        color: userColor,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    });
                } else {
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
    
    usersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const onlineCount = Object.keys(users).length;
        updateOnlineCount(onlineCount);
    });
    
    messagesRef.limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        const messageId = snapshot.key;
        
        if (message && message.userId !== userId && !sentMessageIds.has(messageId)) {
            addMessage(message.userName, message.content, false);
        }
    });
    
    if (!beforeUnloadHandlerAdded) {
        window.addEventListener('beforeunload', () => {
            disconnectFromServer();
        });
        beforeUnloadHandlerAdded = true;
    }
}

function disconnectFromServer() {
    if (connectedRef) {
        connectedRef.off();
        connectedRef = null;
    }

    if (userRef) {
        userRef.remove();
        userRef = null;
    }

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
    
    connectToServer();
    
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

// 선택된 시간대의 현재 시간 가져오기
function getCurrentTimeInTimezone() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: currentTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;
    
    return {
        hours: parseInt(getPart('hour')),
        minutes: parseInt(getPart('minute')),
        seconds: parseInt(getPart('second'))
    };
}

// 타이머 로직
function getCurrentStatus() {
    const time = getCurrentTimeInTimezone();
    const minutes = time.minutes;
    const seconds = time.seconds;
    
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
    const time = getCurrentTimeInTimezone();
    const minutes = time.minutes;
    const cycleMinute = minutes % CYCLE_DURATION;
    
    // 선택된 시간대로 Date 객체 생성
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: currentTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    if (cycleMinute < WORK_DURATION) {
        const nextBreakMinute = Math.floor(minutes / CYCLE_DURATION) * CYCLE_DURATION + WORK_DURATION;
        return { 
            type: 'break', 
            hours: time.hours,
            minutes: nextBreakMinute % 60
        };
    } else {
        const nextWorkMinute = (Math.floor(minutes / CYCLE_DURATION) + 1) * CYCLE_DURATION;
        return { 
            type: 'work',
            hours: nextWorkMinute >= 60 ? (time.hours + 1) % 24 : time.hours,
            minutes: nextWorkMinute % 60
        };
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
        statusText.textContent = translations[currentLanguage].working;
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = false);
        
        document.getElementById('nextBreak').textContent = 
            `${String(nextTransition.hours).padStart(2, '0')}:${String(nextTransition.minutes).padStart(2, '0')} ${translations[currentLanguage].nextBreak}`;
        
        if (lastStatus === false && !memoNotificationShown) {
            showAlarmNotification(false);
            memoNotificationShown = true;
            resetChatCount();
        }
    } else {
        statusIndicator.className = 'status-indicator status-breaking';
        statusText.textContent = translations[currentLanguage].breaking;
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = true);
        
        document.getElementById('nextBreak').textContent = 
            `${String(nextTransition.hours).padStart(2, '0')}:${String(nextTransition.minutes).padStart(2, '0')} ${translations[currentLanguage].nextWork}`;
        
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
    
    alarmTimeout = setTimeout(() => {
        stopAlarmSound();
    }, 15000);
}

function playAlarmBeep() {
    if (!alarmPlaying) return;
    
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
        title.textContent = translations[currentLanguage].breakStart;
        message.textContent = translations[currentLanguage].breakMessage;
    } else {
        title.textContent = translations[currentLanguage].workStart;
        message.textContent = translations[currentLanguage].workMessage;
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
    
    todoItems.push(todo);
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
            
            // 체크 후 남은 미완료 TODO 확인
            const remainingTodos = todoItems.filter(t => !t.completed);
            
            if (remainingTodos.length === 0) {
                // 모든 TODO 완료 시
                closeMemoNotification();
                setTimeout(() => {
                    alert(translations[currentLanguage].todoCompleted || '🎉 휴식 TODO 완료!');
                }, 300);
            } else {
                // 아직 남은 TODO가 있으면 알림 새로고침
                showMemoNotification();
            }
        };
        
        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;
        
        item.appendChild(checkbox);
        item.appendChild(text);
        content.appendChild(item);
    });
    
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
let sentMessageIds = new Set();
let chatCount = 0;
let maxChatCount = 5;

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    if (chatCount >= maxChatCount) {
        alert(translations[currentLanguage].chatLimitAlert);
        return;
    }
    
    chatCount++;
    updateChatCountDisplay();
    
    if (firebaseInitialized && messagesRef) {
        const messageRef = messagesRef.push({
            userId: userId,
            userName: userName,
            content: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            serverId: `server${selectedServer}`
        });
        
        const messageId = messageRef.key;
        sentMessageIds.add(messageId);
        addMessage(userName, message, true);
    } else {
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

function updateChatCountDisplay() {
    const input = document.getElementById('chatInput');
    if (input) {
        const remaining = maxChatCount - chatCount;
        if (remaining > 0) {
            input.placeholder = `${translations[currentLanguage].chatPlaceholder} (${remaining}/${maxChatCount})`;
        } else {
            input.placeholder = translations[currentLanguage].chatLimitReached;
            input.disabled = true;
        }
    }
}

function resetChatCount() {
    chatCount = 0;
    const input = document.getElementById('chatInput');
    if (input) {
        input.disabled = false;
        updateChatCountDisplay();
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
        alert(translations[currentLanguage].nicknameAlert);
        return;
    }
    
    const oldNickname = userName;
    userName = newNickname;
    userSettings.userName = userName;
    
    saveUserSettings();
    
    if (firebaseInitialized && userRef) {
        userRef.update({ userName: userName });
    }
    
    const messagesDiv = document.getElementById('chatMessages');
    const systemMsg = document.createElement('div');
    systemMsg.className = 'system-message';
    systemMsg.textContent = `${oldNickname}${translations[currentLanguage].nicknameChangedTo}${userName}`;
    messagesDiv.appendChild(systemMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    alert(translations[currentLanguage].nicknameChanged);
}

function changeGoal() {
    const newGoal = document.getElementById('goalChange').value.trim();
    sessionGoal = newGoal;
    userSettings.sessionGoal = sessionGoal;
    
    saveUserSettings();
    
    alert(translations[currentLanguage].goalChanged);
}

// 테마 전환 함수
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        document.body.classList.remove('dark-mode');
        userSettings.theme = 'light';
        updateThemeUI('light');
    } else {
        document.body.classList.add('dark-mode');
        userSettings.theme = 'dark';
        updateThemeUI('dark');
    }
    
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

// ============ 물고기 도감 기능 ============
function toggleFishCollection() {
    fishCollectionOpen = !fishCollectionOpen;
    const panel = document.getElementById('fishCollectionPanel');
    const overlay = document.getElementById('fishCollectionOverlay');
    
    if (fishCollectionOpen) {
        panel.classList.add('open');
        overlay.classList.add('show');
        renderFishGrid();
    } else {
        panel.classList.remove('open');
        overlay.classList.remove('show');
    }
}

function renderFishGrid() {
    const grid = document.getElementById('fishGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    allFish.forEach(fish => {
        const isUnlocked = unlockedFish.includes(fish.id);
        const fishCard = document.createElement('div');
        fishCard.className = 'fish-card' + (isUnlocked ? '' : ' locked');
        
        if (isUnlocked) {
            fishCard.onclick = () => selectFish(fish);
        } else {
            fishCard.onclick = () => {
                alert(translations[currentLanguage].fishLocked);
            };
        }
        
        const fishImg = document.createElement('img');
        fishImg.src = fish.image;
        fishImg.alt = currentLanguage === 'ko' ? fish.name : fish.nameEn;
        fishImg.className = 'fish-image';
        
        const fishName = document.createElement('div');
        fishName.className = 'fish-name';
        fishName.textContent = currentLanguage === 'ko' ? fish.name : fish.nameEn;
        
        if (!isUnlocked) {
            const lockIcon = document.createElement('div');
            lockIcon.className = 'fish-lock-icon';
            lockIcon.textContent = '🔒';
            fishCard.appendChild(lockIcon);
        }
        
        fishCard.appendChild(fishImg);
        fishCard.appendChild(fishName);
        grid.appendChild(fishCard);
    });
}

function selectFish(fish) {
    // 선택된 물고기로 캐릭터 변경
    userCharacter = '🐠'; // 일단 이모티콘은 그대로
    userSettings.selectedFish = fish.id;
    saveUserSettings();
    
    // 캔버스의 물고기 이미지 업데이트
    if (characters.length > 0) {
        characters[0].emoji = '🐠';
        // 이미지 경로 업데이트를 위해 새로운 Image 객체 생성
        const newFishImage = new Image();
        newFishImage.src = fish.image;
        newFishImage.onload = () => {
            fishImage.src = fish.image;
        };
    }
    
    alert(translations[currentLanguage].fishSelected + '\n' + (currentLanguage === 'ko' ? fish.name : fish.nameEn));
    toggleFishCollection();
}

function unlockRandomFish() {
    const lockedFish = allFish.filter(f => !unlockedFish.includes(f.id));
    
    if (lockedFish.length === 0) {
        alert(currentLanguage === 'ko' ? '모든 물고기를 획득했습니다! 🎉' : 'All fish unlocked! 🎉');
        return;
    }
    
    const toUnlock = Math.min(3, lockedFish.length);
    const unlocked = [];
    
    for (let i = 0; i < toUnlock; i++) {
        const randomIndex = Math.floor(Math.random() * lockedFish.length);
        const fish = lockedFish.splice(randomIndex, 1)[0];
        unlockedFish.push(fish.id);
        unlocked.push(currentLanguage === 'ko' ? fish.name : fish.nameEn);
    }
    
    saveFishCollection();
    renderFishGrid();
    
    alert(translations[currentLanguage].fishUnlocked + '\n\n' + unlocked.join('\n'));
}

function saveFishCollection() {
    localStorage.setItem('unlockedFish', JSON.stringify(unlockedFish));
}

function loadFishCollection() {
    const saved = localStorage.getItem('unlockedFish');
    if (saved) {
        unlockedFish = JSON.parse(saved);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    loadUserSettings();
    loadTodos();
    loadFishCollection();
})