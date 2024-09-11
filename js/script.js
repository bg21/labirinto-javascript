// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const step = 20;
const playerSize = 20;
const exitSize = 20;
const levels = 3; // Número de níveis

const mazeWidth = canvas.width / step;
const mazeHeight = canvas.height / step;
let playerX, playerY, exitX, exitY;
let maze = [];
let currentLevel = 1;
let levelComplete = false;

// Elementos do modal
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.getElementById('closeModal');

// Inicializa o labirinto com paredes e células não visitadas
function initializeMaze() {
    maze = Array.from({ length: mazeWidth }, () => Array(mazeHeight).fill(false));
    console.log("Labirinto inicializado.");
}

// Gera um labirinto usando o algoritmo de backtracking
function generateMaze(level) {
    console.log(`Gerando labirinto para o nível ${level}...`);
    initializeMaze();

    const stack = [];
    const startX = 1;
    const startY = 1;
    const endX = mazeWidth - 2;
    const endY = mazeHeight - 2;

    // Marca as células inicial e final como visitadas
    maze[startX][startY] = true;
    stack.push([startX, startY]);

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const neighbors = getUnvisitedNeighbors(x, y);

        if (neighbors.length > 0) {
            stack.push([x, y]);

            const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];

            removeWall(x, y, nextX, nextY);
            maze[nextX][nextY] = true;
            stack.push([nextX, nextY]);
        }
    }

    // Atualiza a posição da saída
    exitX = (mazeWidth - 2) * step;
    exitY = (mazeHeight - 2) * step;

    playerX = startX * step;
    playerY = startY * step;

    levelComplete = false; // Reseta o status de conclusão do nível

    console.log(`Labirinto gerado. Posição de saída: (${exitX}, ${exitY}).`);
}

// Obtém vizinhos não visitados
function getUnvisitedNeighbors(x, y) {
    const neighbors = [];

    if (x > 1 && !maze[x - 2][y]) neighbors.push([x - 2, y]);
    if (x < mazeWidth - 2 && !maze[x + 2][y]) neighbors.push([x + 2, y]);
    if (y > 1 && !maze[x][y - 2]) neighbors.push([x, y - 2]);
    if (y < mazeHeight - 2 && !maze[x][y + 2]) neighbors.push([x, y + 2]);

    return neighbors;
}

// Remove a parede entre duas células vizinhas
function removeWall(x1, y1, x2, y2) {
    const wallX = (x1 + x2) / 2;
    const wallY = (y1 + y2) / 2;

    maze[wallX][wallY] = true;
}

// Desenha o labirinto e o jogador
function updateLevelDisplay() {
    const levelDisplay = document.getElementById('levelDisplay');
    levelDisplay.textContent = `Nível: ${currentLevel}`;
}

// Modifique a função de desenho para incluir a atualização do nível
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();

    // Desenha paredes
    ctx.fillStyle = '#aaa';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;

    for (let x = 0; x < mazeWidth; x++) {
        for (let y = 0; y < mazeHeight; y++) {
            if (!maze[x][y]) {
                ctx.fillRect(x * step, y * step, step, step);
                ctx.strokeRect(x * step, y * step, step, step);
            }
        }
    }

    // Desenha a saída
    ctx.fillStyle = 'gold';
    ctx.strokeStyle = '#aa0'; // Contorno da saída
    ctx.lineWidth = 2;
    ctx.strokeRect(exitX, exitY, exitSize, exitSize);
    ctx.fillRect(exitX, exitY, exitSize, exitSize);

    // Desenha o jogador
    ctx.fillStyle = 'royalblue';
    ctx.strokeStyle = '#003'; // Contorno do jogador
    ctx.lineWidth = 2;
    ctx.strokeRect(playerX, playerY, playerSize, playerSize);
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Atualiza a exibição do nível
    updateLevelDisplay();

    // Verifica vitória
    if (isCollidingWithExit()) {
        if (!levelComplete) {
            levelComplete = true;
            console.log(`Nível ${currentLevel} completado.`);
            showModal(`Você venceu o nível ${currentLevel}!`);
            setTimeout(() => {
                if (currentLevel < levels) {
                    currentLevel++;
                    resetGame();
                } else {
                    showModal('Parabéns! Você completou todos os níveis!');
                }
            }, 100); // Adiciona um pequeno atraso para garantir que o alerta apareça corretamente
        }
    }
}
// Exibe o modal
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}

// Fecha o modal
function closeModalHandler() {
    modal.style.display = 'none';
}

// Verifica se o jogador está colidindo com a saída
function isCollidingWithExit() {
    return !(playerX + playerSize < exitX ||
             playerX > exitX + exitSize ||
             playerY + playerSize < exitY ||
             playerY > exitY + exitSize);
}

// Desenha a grade
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Move o jogador
function movePlayer(dx, dy) {
    const newX = playerX + dx;
    const newY = playerY + dy;

    if (isValidMove(newX, newY)) {
        playerX = newX;
        playerY = newY;
        draw();
    } else {
        console.log(`Movimento inválido para (${newX}, ${newY}).`);
    }
}

// Verifica se o movimento é válido
function isValidMove(x, y) {
    const gridX = Math.floor(x / step);
    const gridY = Math.floor(y / step);

    if (gridX < 0 || gridX >= mazeWidth || gridY < 0 || gridY >= mazeHeight) {
        return false;
    }

    return maze[gridX][gridY];
}

// Adiciona os eventos de teclado para mover o jogador
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -step);
            break;
        case 'ArrowDown':
            movePlayer(0, step);
            break;
        case 'ArrowLeft':
            movePlayer(-step, 0);
            break;
        case 'ArrowRight':
            movePlayer(step, 0);
            break;
    }
});

// Fecha o modal quando o botão "Fechar" é clicado
closeModal.addEventListener('click', closeModalHandler);

// Inicializa o jogo
function resetGame() {
    generateMaze(currentLevel);
    draw();
}

// Inicializa o primeiro nível
resetGame();
