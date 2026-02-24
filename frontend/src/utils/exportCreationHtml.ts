import type { CreationDraft } from '../generation/types';
import { normalizeGameData } from '../generation/gameSchema';
import { generateGameRuntimeScript, generateGameRuntimeStyles } from './exportedGameRuntime';

export function exportCreationToHtml(creation: CreationDraft): string {
  const title = (creation.data?.title || creation.prompt || creation.type).substring(0, 100);
  const type = creation.type;
  
  // Generate type-specific HTML content
  let bodyContent = '';
  let additionalStyles = '';
  let additionalScripts = '';

  switch (type) {
    case 'app':
      if (creation.data?.appKind === 'calculator') {
        bodyContent = generateCalculatorHtml(creation);
        additionalStyles = getCalculatorStyles();
        additionalScripts = getCalculatorScripts(creation.data?.mode || 'basic');
      } else {
        bodyContent = generateTaskListHtml(creation);
        additionalStyles = getTaskListStyles();
        additionalScripts = getTaskListScripts();
      }
      break;
    case 'website':
      bodyContent = generateWebsiteHtml(creation);
      additionalStyles = getWebsiteStyles();
      additionalScripts = getWebsiteScripts();
      break;
    case 'chatbot':
      bodyContent = generateChatbotHtml(creation);
      additionalStyles = getChatbotStyles();
      additionalScripts = getChatbotScripts(creation);
      break;
    case 'image':
      bodyContent = generateImageHtml(creation);
      additionalStyles = getImageStyles();
      break;
    case 'game':
      bodyContent = generateGameHtml(creation);
      additionalStyles = generateGameRuntimeStyles();
      additionalScripts = generateGameRuntimeScript(normalizeGameData(creation.data));
      break;
    default:
      bodyContent = `<div class="container"><h1>${escapeHtml(title)}</h1><p>Unsupported creation type: ${escapeHtml(type)}</p></div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: oklch(0.98 0.005 264);
            color: oklch(0.25 0.02 264);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
            color: oklch(0.25 0.02 264);
        }
        button {
            cursor: pointer;
            border: none;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        button:active {
            transform: scale(0.98);
        }
        input, textarea {
            font-family: inherit;
            font-size: 14px;
            border: 1px solid oklch(0.85 0.01 264);
            border-radius: 8px;
            padding: 8px 12px;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus, textarea:focus {
            border-color: oklch(0.55 0.15 264);
        }
        .error-fallback {
            padding: 16px;
            background: oklch(0.95 0.01 264);
            border-radius: 8px;
            color: oklch(0.45 0.02 264);
            text-align: center;
        }
        ${additionalStyles}
    </style>
</head>
<body>
    ${bodyContent}
    <script>
        ${additionalScripts}
    </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Calculator HTML generation
function generateCalculatorHtml(creation: CreationDraft): string {
  const mode = creation.data?.mode || 'basic';
  const isScientific = mode === 'scientific';
  
  return `
    <div class="calc-container">
      <div class="calc-display" id="display">0</div>
      <div class="calc-buttons">
        ${isScientific ? `
        <button class="calc-btn func-btn" onclick="handleFunction('sin')">sin</button>
        <button class="calc-btn func-btn" onclick="handleFunction('cos')">cos</button>
        <button class="calc-btn func-btn" onclick="handleFunction('tan')">tan</button>
        <button class="calc-btn func-btn" onclick="handleFunction('log')">log</button>
        <button class="calc-btn func-btn" onclick="handleFunction('sqrt')">√</button>
        <button class="calc-btn func-btn" onclick="handleFunction('pow')">x^y</button>
        <button class="calc-btn func-btn" onclick="handleFunction('pi')">π</button>
        <button class="calc-btn func-btn" onclick="handleFunction('e')">e</button>
        <button class="calc-btn func-btn" onclick="handleInput('(')">(</button>
        <button class="calc-btn func-btn" onclick="handleInput(')')">)</button>
        ` : ''}
        <button class="calc-btn op-btn" onclick="handleClear()">C</button>
        <button class="calc-btn op-btn" onclick="handleBackspace()">⌫</button>
        <button class="calc-btn op-btn" onclick="handleInput('/')">/</button>
        <button class="calc-btn op-btn" onclick="handleInput('*')">×</button>
        <button class="calc-btn" onclick="handleInput('7')">7</button>
        <button class="calc-btn" onclick="handleInput('8')">8</button>
        <button class="calc-btn" onclick="handleInput('9')">9</button>
        <button class="calc-btn op-btn" onclick="handleInput('-')">-</button>
        <button class="calc-btn" onclick="handleInput('4')">4</button>
        <button class="calc-btn" onclick="handleInput('5')">5</button>
        <button class="calc-btn" onclick="handleInput('6')">6</button>
        <button class="calc-btn op-btn" onclick="handleInput('+')">+</button>
        <button class="calc-btn" onclick="handleInput('1')">1</button>
        <button class="calc-btn" onclick="handleInput('2')">2</button>
        <button class="calc-btn" onclick="handleInput('3')">3</button>
        <button class="calc-btn equals-btn" onclick="handleEquals()" style="grid-row: span 2">=</button>
        <button class="calc-btn" onclick="handleInput('0')" style="grid-column: span 2">0</button>
        <button class="calc-btn" onclick="handleInput('.')">.</button>
      </div>
    </div>
  `;
}

function getCalculatorStyles(): string {
  return `
    .calc-container {
      max-width: 400px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .calc-display {
      background: oklch(0.96 0.005 264);
      border-radius: 12px;
      padding: 24px;
      text-align: right;
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 20px;
      min-height: 60px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .calc-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .calc-btn {
      padding: 20px;
      font-size: 18px;
      font-weight: 600;
      background: oklch(0.96 0.005 264);
      color: oklch(0.25 0.02 264);
    }
    .calc-btn:hover {
      background: oklch(0.92 0.01 264);
    }
    .calc-btn.op-btn {
      background: oklch(0.55 0.15 264);
      color: white;
    }
    .calc-btn.op-btn:hover {
      background: oklch(0.50 0.15 264);
    }
    .calc-btn.equals-btn {
      background: oklch(0.45 0.18 264);
      color: white;
    }
    .calc-btn.equals-btn:hover {
      background: oklch(0.40 0.18 264);
    }
    .calc-btn.func-btn {
      background: oklch(0.65 0.12 264);
      color: white;
      font-size: 14px;
      padding: 16px 8px;
    }
    .calc-btn.func-btn:hover {
      background: oklch(0.60 0.12 264);
    }
  `;
}

function getCalculatorScripts(mode: string): string {
  return `
    let currentInput = '0';
    let lastResult = null;
    const display = document.getElementById('display');
    
    function updateDisplay() {
      display.textContent = currentInput || '0';
    }
    
    function handleInput(value) {
      if (currentInput === '0' || currentInput === 'Error') {
        currentInput = value;
      } else {
        currentInput += value;
      }
      updateDisplay();
    }
    
    function handleClear() {
      currentInput = '0';
      lastResult = null;
      updateDisplay();
    }
    
    function handleBackspace() {
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = '0';
      }
      updateDisplay();
    }
    
    function handleFunction(func) {
      switch(func) {
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'sqrt':
          currentInput += func + '(';
          break;
        case 'pow':
          currentInput += '^';
          break;
        case 'pi':
          currentInput += Math.PI.toString();
          break;
        case 'e':
          currentInput += Math.E.toString();
          break;
      }
      updateDisplay();
    }
    
    function handleEquals() {
      try {
        let expr = currentInput;
        
        // Replace functions
        expr = expr.replace(/sin\\(/g, 'Math.sin(');
        expr = expr.replace(/cos\\(/g, 'Math.cos(');
        expr = expr.replace(/tan\\(/g, 'Math.tan(');
        expr = expr.replace(/log\\(/g, 'Math.log10(');
        expr = expr.replace(/sqrt\\(/g, 'Math.sqrt(');
        expr = expr.replace(/\\^/g, '**');
        
        const result = eval(expr);
        
        if (!isFinite(result)) {
          currentInput = 'Error';
        } else {
          currentInput = result.toString();
          lastResult = result;
        }
      } catch (e) {
        currentInput = 'Error';
      }
      updateDisplay();
    }
  `;
}

// Task List HTML generation
function generateTaskListHtml(creation: CreationDraft): string {
  const title = creation.data?.title || 'Task List';
  const tasks = creation.data?.tasks || [];
  
  return `
    <div class="container">
      <h1>${escapeHtml(title)}</h1>
      <div class="task-input-container">
        <input type="text" id="taskInput" placeholder="Add a new task..." />
        <button class="add-btn" onclick="addTask()">Add</button>
      </div>
      <div id="taskList" class="task-list">
        ${tasks.map((task: any, idx: number) => `
          <div class="task-item ${task.completed ? 'completed' : ''}" data-index="${idx}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${idx})" />
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${idx})">×</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getTaskListStyles(): string {
  return `
    .task-input-container {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    #taskInput {
      flex: 1;
    }
    .add-btn {
      background: oklch(0.55 0.15 264);
      color: white;
      padding: 8px 24px;
    }
    .add-btn:hover {
      background: oklch(0.50 0.15 264);
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .task-item.completed .task-text {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .task-text {
      flex: 1;
    }
    .delete-btn {
      background: oklch(0.55 0.15 0);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 20px;
      line-height: 1;
    }
    .delete-btn:hover {
      background: oklch(0.50 0.15 0);
    }
  `;
}

function getTaskListScripts(): string {
  return `
    let tasks = Array.from(document.querySelectorAll('.task-item')).map(el => ({
      text: el.querySelector('.task-text').textContent,
      completed: el.querySelector('input[type="checkbox"]').checked
    }));
    
    function renderTasks() {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = tasks.map((task, idx) => \`
        <div class="task-item \${task.completed ? 'completed' : ''}" data-index="\${idx}">
          <input type="checkbox" \${task.completed ? 'checked' : ''} onchange="toggleTask(\${idx})" />
          <span class="task-text">\${task.text}</span>
          <button class="delete-btn" onclick="deleteTask(\${idx})">×</button>
        </div>
      \`).join('');
    }
    
    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (text) {
        tasks.push({ text, completed: false });
        input.value = '';
        renderTasks();
      }
    }
    
    function toggleTask(index) {
      tasks[index].completed = !tasks[index].completed;
      renderTasks();
    }
    
    function deleteTask(index) {
      tasks.splice(index, 1);
      renderTasks();
    }
    
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });
  `;
}

// Website HTML generation
function generateWebsiteHtml(creation: CreationDraft): string {
  const pages = creation.data?.pages || [];
  
  return `
    <div class="website-container">
      <nav class="website-nav">
        ${pages.map((page: any, idx: number) => `
          <button class="nav-btn ${idx === 0 ? 'active' : ''}" onclick="showPage(${idx})">${escapeHtml(page.title)}</button>
        `).join('')}
      </nav>
      <div class="website-content">
        ${pages.map((page: any, idx: number) => `
          <div class="page-content ${idx === 0 ? 'active' : ''}" data-page="${idx}">
            <h1>${escapeHtml(page.title)}</h1>
            <div class="page-body">${escapeHtml(page.content)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getWebsiteStyles(): string {
  return `
    .website-container {
      min-height: 100vh;
    }
    .website-nav {
      background: white;
      padding: 16px;
      display: flex;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      flex-wrap: wrap;
    }
    .nav-btn {
      padding: 8px 16px;
      background: oklch(0.96 0.005 264);
      color: oklch(0.25 0.02 264);
    }
    .nav-btn.active {
      background: oklch(0.55 0.15 264);
      color: white;
    }
    .website-content {
      padding: 40px 20px;
    }
    .page-content {
      display: none;
      max-width: 800px;
      margin: 0 auto;
    }
    .page-content.active {
      display: block;
    }
    .page-body {
      margin-top: 24px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  `;
}

function getWebsiteScripts(): string {
  return `
    function showPage(index) {
      document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.querySelector(\`[data-page="\${index}"]\`).classList.add('active');
      document.querySelectorAll('.nav-btn')[index].classList.add('active');
    }
  `;
}

// Chatbot HTML generation
function generateChatbotHtml(creation: CreationDraft): string {
  const botName = creation.data?.botName || 'Bot';
  
  return `
    <div class="chat-container">
      <div class="chat-header">
        <h2>${escapeHtml(botName)}</h2>
      </div>
      <div id="chatMessages" class="chat-messages">
        <div class="message bot-message">
          <div class="message-content">Hello! How can I help you today?</div>
        </div>
      </div>
      <div class="chat-input-container">
        <input type="text" id="chatInput" placeholder="Type a message..." />
        <button class="send-btn" onclick="sendMessage()">Send</button>
      </div>
    </div>
  `;
}

function getChatbotStyles(): string {
  return `
    .chat-container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      height: calc(100vh - 40px);
    }
    .chat-header {
      padding: 20px;
      border-bottom: 1px solid oklch(0.90 0.01 264);
    }
    .chat-header h2 {
      font-size: 20px;
      font-weight: 600;
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .message {
      display: flex;
      max-width: 80%;
    }
    .user-message {
      align-self: flex-end;
    }
    .bot-message {
      align-self: flex-start;
    }
    .message-content {
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
    }
    .user-message .message-content {
      background: oklch(0.55 0.15 264);
      color: white;
    }
    .bot-message .message-content {
      background: oklch(0.96 0.005 264);
      color: oklch(0.25 0.02 264);
    }
    .chat-input-container {
      padding: 20px;
      border-top: 1px solid oklch(0.90 0.01 264);
      display: flex;
      gap: 12px;
    }
    #chatInput {
      flex: 1;
    }
    .send-btn {
      background: oklch(0.55 0.15 264);
      color: white;
      padding: 8px 24px;
    }
    .send-btn:hover {
      background: oklch(0.50 0.15 264);
    }
  `;
}

function getChatbotScripts(creation: CreationDraft): string {
  const responses = creation.data?.responses || [];
  const responsesJson = JSON.stringify(responses);
  
  return `
    const responses = ${responsesJson};
    
    function sendMessage() {
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text) return;
      
      const messagesContainer = document.getElementById('chatMessages');
      
      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'message user-message';
      userMsg.innerHTML = '<div class="message-content">' + text + '</div>';
      messagesContainer.appendChild(userMsg);
      
      input.value = '';
      
      // Add bot response
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        
        let response = 'I understand. Can you tell me more?';
        if (responses.length > 0) {
          const match = responses.find(r => 
            text.toLowerCase().includes(r.trigger?.toLowerCase() || '')
          );
          response = match ? match.response : responses[0].response;
        }
        
        botMsg.innerHTML = '<div class="message-content">' + response + '</div>';
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 500);
      
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  `;
}

// Image HTML generation
function generateImageHtml(creation: CreationDraft): string {
  const caption = creation.data?.caption || '';
  const emoji = creation.data?.emoji || '🖼️';
  
  return `
    <div class="container">
      <div class="image-container">
        <div class="image-placeholder">
          <span class="emoji">${escapeHtml(emoji)}</span>
        </div>
        ${caption ? `<p class="image-caption">${escapeHtml(caption)}</p>` : ''}
      </div>
    </div>
  `;
}

function getImageStyles(): string {
  return `
    .image-container {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      text-align: center;
    }
    .image-placeholder {
      background: oklch(0.96 0.005 264);
      border-radius: 12px;
      padding: 60px;
      margin-bottom: 16px;
    }
    .emoji {
      font-size: 120px;
      line-height: 1;
    }
    .image-caption {
      font-size: 16px;
      color: oklch(0.45 0.02 264);
      line-height: 1.6;
    }
  `;
}

// Game HTML generation
function generateGameHtml(creation: CreationDraft): string {
  const gameData = normalizeGameData(creation.data);
  
  return `
    <div class="game-container">
      <div class="game-header">
        <h1 class="game-title">${escapeHtml(gameData.title)}</h1>
        <div class="game-hud">
          <span>${escapeHtml(gameData.hud.scoreLabel)}: <strong id="score">0</strong></span>
          <span>${escapeHtml(gameData.hud.levelLabel)}: <strong id="level">1</strong></span>
          ${gameData.hud.healthLabel ? `<span>${escapeHtml(gameData.hud.healthLabel)}: <strong id="health">3</strong></span>` : ''}
        </div>
      </div>
      
      <div class="canvas-container">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        
        <!-- Start Overlay -->
        <div id="startOverlay" class="overlay">
          <div class="overlay-content">
            <h2 class="overlay-title">${escapeHtml(gameData.title)}</h2>
            <p class="overlay-text">${escapeHtml(gameData.instructions)}</p>
            <button id="startBtn" class="game-btn game-btn-primary">▶ Start Game</button>
          </div>
        </div>
        
        <!-- Paused Overlay -->
        <div id="pausedOverlay" class="overlay" style="display: none;">
          <div class="overlay-content">
            <h2 class="overlay-title">Paused</h2>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button id="resumeBtn" class="game-btn game-btn-primary">▶ Resume</button>
              <button id="restartBtn" class="game-btn game-btn-secondary">↻ Restart</button>
            </div>
          </div>
        </div>
        
        <!-- Game Over Overlay -->
        <div id="gameoverOverlay" class="overlay" style="display: none;">
          <div class="overlay-content">
            <h2 class="overlay-title" style="color: oklch(0.50 0.20 0);">Game Over</h2>
            <div style="margin: 16px 0;">
              <p class="overlay-score">Final Score: <span id="finalScore">0</span></p>
              <p class="overlay-score">Level: <span id="finalLevel">1</span></p>
            </div>
            <button id="restartBtn2" class="game-btn game-btn-primary">↻ Play Again</button>
          </div>
        </div>
      </div>
      
      <div class="game-controls" style="display: none;" id="gameControls">
        <button id="pauseBtn" class="game-btn game-btn-secondary">⏸ Pause</button>
      </div>
      
      <p class="game-instructions">${escapeHtml(gameData.instructions)}</p>
    </div>
  `;
}
