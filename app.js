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
let breakMemo = '';
let lastStatus = null;
let memoNotificationShown = false;

// 캔버스 관련
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

// 사용자 설정
let userCharacter = '🐠';
let userColor = '#4DD0E1';

// 캐릭터 배열
let characters = [];

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
        
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8;
        this.turnSpeed = 0.03;
        this.targetAngle = this.angle;
        
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveSpeed = 0.05;
        this.waveAmplitude = 3;
        
        this.changeDirectionTimer = Math.floor(Math.random() * 180) + 120;
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
            ctx.save();
            ctx.translate(this.x + this.size/2 + waveX, this.y + this.size/2 + waveY);
            
            const vx = Math.cos(this.angle);
            if (vx < 0) {
                ctx.scale(-1, 1);
            }
            
            ctx.fillText(this.emoji, 0, 0);
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

// 게임 시작
function startGame() {
    const nicknameInput = document.getElementById('nicknameInput');
    const nickname = nicknameInput.value.trim();
    
    if (nickname === '') {
        alert('닉네임을 입력해주세요!');
        nicknameInput.focus();
        return;
    }
    
    userName = nickname;
    
    const goalInput = document.getElementById('sessionGoalInput');
    sessionGoal = goalInput.value.trim();
    
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
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '<div class="system-message">채팅방에 입장했습니다</div>';
        
        document.getElementById('chatInput').value = '';
    }
}

// 게임 초기화
function initGame() {
    characters = [];
    characters.push(new Character(userCharacter, userColor, 1));
    
    animate();
    updateUI();
    setInterval(updateUI, 1000);
}

// 캔버스 크기 조정
function resizeCanvas() {
    const container = document.querySelector('.field-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// 애니메이션 루프
function animate() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(0.5, '#0288d1');
    gradient.addColorStop(1, '#01579b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
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
        
        memoNotificationShown = false;
    } else {
        statusIndicator.className = 'status-indicator status-breaking';
        statusText.textContent = '휴식 중';
        timerDisplay.style.color = 'white';
        
        characters.forEach(char => char.isSleeping = true);
        
        const workTime = nextTransition.time;
        document.getElementById('nextBreak').textContent = 
            `${String(workTime.getHours()).padStart(2, '0')}:${String(workTime.getMinutes()).padStart(2, '0')} 작업`;
        
        if (lastStatus === true && !memoNotificationShown) {
            showMemoNotification();
            memoNotificationShown = true;
        }
    }
    
    lastStatus = status.isWorking;
}

// 메모 기능
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
    
    const overlay = document.createElement('div');
    overlay.className = 'memo-overlay';
    overlay.id = 'memoOverlay';
    document.body.appendChild(overlay);
    
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

// 채팅 기능
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    addMessage(userName, message, true);
    input.value = '';
    
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
    alert('목표가 변경되었습니다!');
}

// 캐릭터 커스터마이징
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
    
    const memoTextarea = document.getElementById('breakMemo');
    if (memoTextarea) {
        const savedMemo = localStorage.getItem('breakMemo');
        if (savedMemo) {
            memoTextarea.value = savedMemo;
        }
        
        memoTextarea.addEventListener('input', () => {
            localStorage.setItem('breakMemo', memoTextarea.value);
        });
    };
})