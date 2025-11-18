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

// 캔버스 관련
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

// 사용자 설정
let userCharacter = '🐰';
let userColor = '#FFB6C1';

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
        
        // 폴짝폴짝 모션 관련
        this.state = 'waiting'; // 'waiting', 'bouncing', 'moving'
        this.bounceCount = 0;
        this.maxBounces = 3; // 좌/우로 3번 콩콩콩
        this.bounceFrame = 0;
        this.bounceHeight = 0;
        this.bounceDirection = 1; // 1: 오른쪽, -1: 왼쪽
        this.bounceDistance = 25; // 한 번 뛸 때 좌우 이동 거리
        this.targetX = this.x;
        this.targetY = this.y;
        this.moveSpeed = 1.5; // 이동 속도 (더 느리게)
        this.waitTime = 0;
        this.waitDuration = 150; // 대기 시간 (2.5초)
    }

    update() {
        if (this.isSleeping) return;

        if (this.state === 'waiting') {
            this.waitTime++;
            if (this.waitTime >= this.waitDuration) {
                this.startBouncing();
            }
        } else if (this.state === 'bouncing') {
            this.performBounce();
        } else if (this.state === 'moving') {
            this.performMove();
        }
    }

    startBouncing() {
        this.state = 'bouncing';
        this.bounceCount = 0;
        this.bounceFrame = 0;
        this.waitTime = 0;
        
        // 랜덤하게 좌/우 방향 결정
        this.bounceDirection = Math.random() > 0.5 ? 1 : -1;
        this.bounceDistance = Math.floor(Math.random() * 20) + 20; // 20-40px
    }

    performBounce() {
        // 좌/우로 콩콩콩 뛰기
        this.bounceFrame++;
        
        // 사인파로 부드러운 점프 효과 (더 느리게)
        const bounceSpeed = 0.15; // 속도 (더 느리게)
        this.bounceHeight = Math.sin(this.bounceFrame * bounceSpeed) * 20;
        
        // 한 번의 바운스 완료 (사인파 한 주기)
        if (this.bounceFrame * bounceSpeed >= Math.PI) {
            // 좌/우로 한 칸 이동
            this.x += this.bounceDirection * this.bounceDistance;
            
            // 벽 충돌 체크
            if (this.x < 0) {
                this.x = 0;
                this.bounceDirection *= -1; // 방향 반대로
            }
            if (this.x > canvas.width - this.size) {
                this.x = canvas.width - this.size;
                this.bounceDirection *= -1; // 방향 반대로
            }
            
            this.bounceFrame = 0;
            this.bounceHeight = 0;
            this.bounceCount++;
            
            // 3번 콩콩콩 완료
            if (this.bounceCount >= this.maxBounces) {
                this.startMoving();
            }
        }
    }

    startMoving() {
        this.state = 'moving';
        
        // 랜덤한 방향 결정 (상하 위주)
        const directions = ['up', 'down', 'up', 'down', 'stay']; // 상하 확률 높임
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        const distance = Math.floor(Math.random() * 60) + 30; // 30-90px
        
        switch(direction) {
            case 'up':
                this.targetY = this.y - distance;
                break;
            case 'down':
                this.targetY = this.y + distance;
                break;
            case 'stay':
                this.targetY = this.y;
                break;
        }
        
        // 경계 체크
        this.targetX = this.x;
        this.targetY = Math.max(0, Math.min(this.targetY, canvas.height - this.size));
    }

    performMove() {
        // 목표 지점으로 천천히 이동
        const dy = this.targetY - this.y;
        const distance = Math.abs(dy);
        
        if (distance < this.moveSpeed) {
            // 목표 도착
            this.y = this.targetY;
            this.state = 'waiting';
            this.waitDuration = Math.floor(Math.random() * 90) + 120; // 2-3.5초 대기
        } else {
            // 이동 중
            this.y += (dy / distance) * this.moveSpeed;
        }
    }

    draw() {
        // 색상 원 그리기 (바운스 효과 적용)
        const drawY = this.y - this.bounceHeight;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, drawY + this.size/2, this.size/2, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.isSleeping) {
            ctx.fillText('💤', this.x + this.size/2, drawY + this.size/2);
        } else {
            ctx.fillText(this.emoji, this.x + this.size/2, drawY + this.size/2);
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
    ctx.fillStyle = '#7EC850';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6BB33F';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
    }

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
    
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        `현재 시간: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (status.isWorking) {
        statusIndicator.className = 'status-indicator status-working';
        statusText.textContent = '작업 시간';
        timerDisplay.style.color = '#FF6B6B';
        
        characters.forEach(char => char.isSleeping = false);
        
        const breakTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `다음 휴식: ${String(breakTime.getHours()).padStart(2, '0')}:${String(breakTime.getMinutes()).padStart(2, '0')}`;
    } else {
        statusIndicator.className = 'status-indicator status-breaking';
        statusText.textContent = '휴식 시간';
        timerDisplay.style.color = '#4CAF50';
        
        characters.forEach(char => char.isSleeping = true);
        
        const workTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `다음 작업: ${String(workTime.getHours()).padStart(2, '0')}:${String(workTime.getMinutes()).padStart(2, '0')}`;
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
    
    if (settingsOpen) {
        settingsPanel.classList.add('open');
    } else {
        settingsPanel.classList.remove('open');
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
        'rabbit': '🐰',
        'cat': '🐱',
        'dog': '🐶',
        'bear': '🐻'
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
});