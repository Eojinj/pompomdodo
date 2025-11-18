// ============ 설정 변수 ============
let selectedServer = '1';
let selectedPomodoroType = 25;
let WORK_DURATION = 25;
let BREAK_DURATION = 5;
let CYCLE_DURATION = 30;

// 채팅 관련
let chatOpen = false;
let settingsOpen = false;
let userName = '익명' + Math.floor(Math.random() * 1000);

// 메모 관련
let memoOpen = false;
let breakMemo = '';
let lastStatus = null; // 이전 상태 추적용
let memoNotificationShown = false;

// 캔버스 관련
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

// 사용자 설정
let userCharacter = '🐠';
let userColor = '#4DD0E1';

// 캐릭터 배열
let characters = [];

// ============ 캐릭터 클래스 ============
class Character {
    constructor(emoji, color, id) {
        this.emoji = emoji;
        this.color = color;
        this.id = id;
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * (canvas.height - 50);
        this.size = 40;
        this.isSleeping = false;
        
        // 자연스러운 헤엄치기
        this.angle = Math.random() * Math.PI * 2; // 이동 방향
        this.speed = 0.8; // 느린 속도
        this.turnSpeed = 0.03; // 방향 전환 속도
        this.targetAngle = this.angle;
        
        // 물결 효과
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveSpeed = 0.05;
        this.waveAmplitude = 3;
        
        // 방향 전환 타이머
        this.changeDirectionTimer = Math.floor(Math.random() * 180) + 120; // 2-5초마다
    }

    update() {
        if (this.isSleeping) return;

        // 일정 시간마다 새로운 방향 선택
        this.changeDirectionTimer--;
        if (this.changeDirectionTimer <= 0) {
            this.targetAngle = Math.random() * Math.PI * 2;
            this.changeDirectionTimer = Math.floor(Math.random() * 180) + 120;
        }

        // 부드럽게 목표 방향으로 회전
        let angleDiff = this.targetAngle - this.angle;
        
        // 각도 차이를 -π ~ π 범위로 정규화
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.angle += angleDiff * this.turnSpeed;

        // 이동
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        
        this.x += vx;
        this.y += vy;

        // 벽에 닿으면 부드럽게 방향 전환 (튕기지 않고)
        if (this.x < 20) {
            this.targetAngle = 0; // 오른쪽으로
            this.x = 20;
        }
        if (this.x > canvas.width - this.size - 20) {
            this.targetAngle = Math.PI; // 왼쪽으로
            this.x = canvas.width - this.size - 20;
        }
        if (this.y < 20) {
            this.targetAngle = Math.PI / 2; // 아래로
            this.y = 20;
        }
        if (this.y > canvas.height - this.size - 20) {
            this.targetAngle = -Math.PI / 2; // 위로
            this.y = canvas.height - this.size - 20;
        }

        // 물결 효과
        this.waveOffset += this.waveSpeed;
    }

    draw() {
        // 물결 효과 적용
        const waveX = Math.sin(this.waveOffset) * this.waveAmplitude;
        const waveY = Math.cos(this.waveOffset * 0.5) * (this.waveAmplitude * 0.5);
        
        // 색상 원 그리기
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + this.size/2 + waveX, 
            this.y + this.size/2 + waveY, 
            this.size/2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.isSleeping) {
            ctx.fillText('💤', this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
        } else {
            // 이동 방향에 따라 물고기 회전
            ctx.save();
            ctx.translate(this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
            
            // 좌우 반전 (왼쪽으로 가면 뒤집기)
            const vx = Math.cos(this.angle);
            if (vx < 0) {
                ctx.scale(-1, 1);
            }
            
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
        }
    }
}

// ============ 시작 화면 이벤트 ============
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const group = this.parentElement;
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        
        if (this.dataset.server) {
            selectedServer = this.dataset.server;
        }
        if (this.dataset.pomodoro) {
            selectedPomodoroType = parseInt(this.dataset.pomodoro);
            if (selectedPomodoroType === 25) {
                WORK_DURATION = 25;
                BREAK_DURATION = 5;
                CYCLE_DURATION = 30;
            } else {
                WORK_DURATION = 50;
                BREAK_DURATION = 10;
                CYCLE_DURATION = 60;
            }
        }
    });
});

// ============ 게임 시작 ============
function startGame() {
    // 닉네임 확인
    const nicknameInput = document.getElementById('nicknameInput');
    const nickname = nicknameInput.value.trim();
    
    if (nickname === '') {
        alert('닉네임을 입력해주세요!');
        nicknameInput.focus();
        return;
    }
    
    userName = nickname;
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    // 설정 패널에 닉네임 표시
    document.getElementById('currentNickname').textContent = userName;
    document.getElementById('nicknameChange').value = userName;
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    initGame();
}

// ============ 게임 초기화 ============
function initGame() {
    characters = [];
    characters.push(new Character(userCharacter, userColor, 1));
    
    animate();
    updateUI();
    setInterval(updateUI, 1000);
}

// ============ 캔버스 크기 조정 ============
function resizeCanvas() {
    const container = document.querySelector('.field-container');
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    const aspectRatio = 16 / 9;
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// ============ 애니메이션 루프 ============
function animate() {
    // 바다 배경 그리기 (그라데이션)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(0.5, '#0288d1');
    gradient.addColorStop(1, '#01579b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 물방울/기포 효과 (훨씬 적게)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 모든 캐릭터 업데이트 및 그리기
    characters.forEach(char => {
        char.update();
        char.draw();
    });

    requestAnimationFrame(animate);
}

// ============ 타이머 로직 ============
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

// ============ UI 업데이트 ============
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
        
        // 작업 중일 때는 메모 알림 초기화
        memoNotificationShown = false;
    } else {
        statusIndicator.className = 'status-indicator status-breaking';
        statusText.textContent = '휴식 중';
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = true);
        
        const workTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `${String(workTime.getHours()).padStart(2, '0')}:${String(workTime.getMinutes()).padStart(2, '0')} 작업`;
        
        // 휴식 시간 시작 시 메모 표시 (한 번만)
        if (lastStatus === true && !memoNotificationShown) {
            showMemoNotification();
            memoNotificationShown = true;
        }
    }
    
    lastStatus = status.isWorking;
}

// ============ 메모 기능 ============
function toggleMemo() {
    memoOpen = !memoOpen;
    const memoPanel = document.getElementById('memoPanel');
    const memoPanelOverlay = document.getElementById('memoPanelOverlay');
    
    if (memoOpen) {
        memoPanel.classList.add('open');
        memoPanelOverlay.classList.add('show');
    } else {
        memoPanel.classList.remove('open');
        memoPanelOverlay.classList.remove('show');
    }
}

function showMemoNotification() {
    const memoTextarea = document.getElementById('breakMemo');
    breakMemo = memoTextarea ? memoTextarea.value.trim() : '';
    
    if (breakMemo === '') return;
    
    const notification = document.getElementById('memoNotification');
    const content = document.getElementById('memoNotificationContent');
    
    content.textContent = breakMemo;
    
    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'memo-overlay';
    overlay.id = 'memoOverlay';
    document.body.appendChild(overlay);
    
    // 애니메이션을 위한 약간의 딜레이
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

// ============ 채팅 기능 ============
function toggleChat() {
    chatOpen = !chatOpen;
    const chatPanel = document.getElementById('chatPanel');
    const chatToggle = document.getElementById('chatToggle');
    const fieldContainer = document.getElementById('fieldContainer');
    
    if (chatOpen) {
        chatPanel.classList.add('open');
        chatToggle.classList.add('open');
        fieldContainer.classList.add('chat-open');
    } else {
        chatPanel.classList.remove('open');
        chatToggle.classList.remove('open');
        fieldContainer.classList.remove('chat-open');
    }
    
    setTimeout(resizeCanvas, 300);
}

// ============ 설정 패널 기능 ============
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
    document.getElementById('currentNickname').textContent = userName;
    
    // 채팅에 시스템 메시지 추가
    const messagesDiv = document.getElementById('chatMessages');
    const systemMsg = document.createElement('div');
    systemMsg.className = 'system-message';
    systemMsg.textContent = `${oldNickname}님이 ${userName}(으)로 닉네임을 변경했습니다`;
    messagesDiv.appendChild(systemMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    alert('닉네임이 변경되었습니다!');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    addMessage(userName, message, true);
    input.value = '';
    
    // 테스트: 자동 응답
    setTimeout(() => {
        const responses = [
            '화이팅!',
            '같이 공부해요~',
            '집중 모드 ON!',
            '잠시만 쉬었다 올게요',
            '좋은 하루 보내세요!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage('익명' + Math.floor(Math.random() * 1000), randomResponse, false);
    }, 1000 + Math.random() * 2000);
}

function addMessage(author, content, isOwn) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message' + (isOwn ? ' own' : '');
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    messageDiv.innerHTML = `
        ${!isOwn ? `<div class="message-author">${author}</div>` : ''}
        <div class="message-content">${content}</div>
        <div class="message-time">${timeStr}</div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// ============ 캐릭터 커스터마이징 ============
document.getElementById('characterSelect').addEventListener('change', (e) => {
    const emojiMap = {
        'fish': '🐠',
        'octopus': '🐙',
        'turtle': '🐢',
        'whale': '🐋',
        'dolphin': '🐬',
        'crab': '🦀'
    };
    userCharacter = emojiMap[e.target.value];
    if (characters.length > 0) {
        characters[0].emoji = userCharacter;
    }
});

// 색상 선택은 페이지 로드 후 설정
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(opt => 
                opt.classList.remove('selected'));
            e.target.classList.add('selected');
            userColor = e.target.dataset.color;
            if (characters.length > 0) {
                characters[0].color = userColor;
            }
        });
    });
    
    // 메모 저장 (자동 저장)
    const memoTextarea = document.getElementById('breakMemo');
    if (memoTextarea) {
        // 로컬 스토리지에서 메모 불러오기
        const savedMemo = localStorage.getItem('breakMemo');
        if (savedMemo) {
            memoTextarea.value = savedMemo;
        }
        
        // 메모 변경 시 자동 저장
        memoTextarea.addEventListener('input', () => {
            localStorage.setItem('breakMemo', memoTextarea.value);
        });
    }
});
