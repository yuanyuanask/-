// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#00f0f0', // I - 青色
    '#0000f0', // J - 蓝色
    '#f0a000', // L - 橙色
    '#f0f000', // O - 黄色
    '#00f000', // S - 绿色
    '#a000f0', // T - 紫色
    '#f00000'  // Z - 红色
];

// 方块形状定义
const SHAPES = [
    // I
    [[1, 1, 1, 1]],
    
    // J
    [[1, 0, 0],
     [1, 1, 1]],
    
    // L
    [[0, 0, 1],
     [1, 1, 1]],
    
    // O
    [[1, 1],
     [1, 1]],
    
    // S
    [[0, 1, 1],
     [1, 1, 0]],
    
    // T
    [[0, 1, 0],
     [1, 1, 1]],
    
    // Z
    [[1, 1, 0],
     [0, 1, 1]]
];

// 游戏状态
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000;
let lastDropTime = 0;
let gameOver = false;
let isPaused = false;

// 获取DOM元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');

// 初始化游戏
function init() {
    // 初始化游戏板
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    
    // 重置游戏状态
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameOver = false;
    isPaused = false;
    
    // 更新UI
    updateScore();
    gameOverElement.classList.add('hidden');
    
    // 生成初始方块
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 创建新方块
function createPiece() {
    const typeId = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[typeId];
    
    return {
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        shape: shape,
        color: COLORS[typeId]
    };
}

// 游戏主循环
function gameLoop(time = 0) {
    if (gameOver) return;
    
    if (!isPaused) {
        // 自动下落
        if (time - lastDropTime > dropInterval) {
            moveDown();
            lastDropTime = time;
        }
        
        // 绘制游戏
        draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制已固定的方块
    drawBoard();
    
    // 绘制当前方块
    if (currentPiece) {
        drawPiece(currentPiece, ctx);
    }
    
    // 绘制下一个方块
    drawNextPiece();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }
}

// 绘制游戏板上的方块
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x], ctx);
            }
        }
    }
}

// 绘制单个方块
function drawBlock(x, y, color, context) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 添加边框
    context.strokeStyle = '#000';
    context.lineWidth = 1;
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 绘制方块
function drawPiece(piece, context) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, piece.y + y, piece.color, context);
            }
        }
    }
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        // 计算居中位置
        const blockSize = 20;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    // 添加边框
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
}

// 检查碰撞
function checkCollision(piece, dx = 0, dy = 0, newShape = null) {
    const shape = newShape || piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = piece.x + x + dx;
                const newY = piece.y + y + dy;
                
                // 检查边界
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                // 检查与已有方块的碰撞
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 固定方块到游戏板
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                
                // 检查游戏是否结束
                if (boardY < 0) {
                    endGame();
                    return;
                }
                
                board[boardY][boardX] = currentPiece.color;
            }
        }
    }
    
    // 检查并清除完整的行
    clearLines();
    
    // 生成新方块
    currentPiece = nextPiece;
    nextPiece = createPiece();
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新的空行
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // 重新检查当前行
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数和等级
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // 每消除10行提升一个等级
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
        
        updateScore();
    }
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 移动方块
function moveDown() {
    if (!checkCollision(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
    }
}

function moveLeft() {
    if (!checkCollision(currentPiece, -1, 0)) {
        currentPiece.x--;
    }
}

function moveRight() {
    if (!checkCollision(currentPiece, 1, 0)) {
        currentPiece.x++;
    }
}

function rotatePiece() {
    // 旋转方块
    const rotated = [];
    const rows = currentPiece.shape.length;
    const cols = currentPiece.shape[0].length;
    
    for (let x = 0; x < cols; x++) {
        rotated[x] = [];
        for (let y = rows - 1; y >= 0; y--) {
            rotated[x][rows - 1 - y] = currentPiece.shape[y][x];
        }
    }
    
    // 检查旋转后是否碰撞
    if (!checkCollision(currentPiece, 0, 0, rotated)) {
        currentPiece.shape = rotated;
    } else {
        // 尝试墙踢
        for (let offset of [-1, 1, -2, 2]) {
            if (!checkCollision(currentPiece, offset, 0, rotated)) {
                currentPiece.x += offset;
                currentPiece.shape = rotated;
                break;
            }
        }
    }
}

// 游戏结束
function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (!isPaused) moveLeft();
            break;
        case 'ArrowRight':
            if (!isPaused) moveRight();
            break;
        case 'ArrowDown':
            if (!isPaused) moveDown();
            break;
        case 'ArrowUp':
            if (!isPaused) rotatePiece();
            break;
        case ' ':
            isPaused = !isPaused;
            break;
    }
});

// 重新开始按钮
restartBtn.addEventListener('click', init);
playAgainBtn.addEventListener('click', init);

// 初始化游戏
init();