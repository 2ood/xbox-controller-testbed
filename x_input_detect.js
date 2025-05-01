const buttonNames = {
  0: "A",
  1: "B",
  2: "X",
  3: "Y",
  4: "LB",
  5: "RB",
  6: "LT",
  7: "RT",
  8: "View",
  9: "Menu",
  10: "LS",
  11: "RS",
  12: "↑",
  13: "↓",
  14: "←",
  15: "→",
  16: "Xbox",
};

const log = document.getElementById("log");
let controllers = {};
let buttonStates = {};
let axisLogs = {};

function connecthandler(e) {
  addGamepad(e.gamepad);
}

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  buttonStates[gamepad.index] = new Array(gamepad.buttons.length).fill(false);
  logMessage(`🎮 Gamepad connected: ${gamepad.id}`);
  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
  removeGamepad(e.gamepad);
}

function removeGamepad(gamepad) {
  delete controllers[gamepad.index];
  delete buttonStates[gamepad.index];
  logMessage(`❌ Gamepad disconnected: ${gamepad.id}`);
}

function logMessage(msg, returnElement = false) {
  const el = document.createElement("div");

  // 현재 시간 표시
  const now = new Date();
  const timestamp = `[${now.toLocaleTimeString()}] `;

  el.textContent = timestamp + msg;
  log.append(el);
  log.scrollTop = log.scrollHeight;

  if (returnElement) return el;
}

function updateStickTooltip(gp) {
  // 축 값 가져오기
  const leftX = gp.axes[0].toFixed(2);
  const leftY = gp.axes[1].toFixed(2);
  const rightX = gp.axes[2].toFixed(2);
  const rightY = gp.axes[3].toFixed(2);

  // DOM 요소 찾아서 표시
  const leftText = document.getElementById("left-axis-value");
  const rightText = document.getElementById("right-axis-value");

  if (leftText) {
    leftText.textContent = `X: ${leftX}, Y: ${leftY}`;
  }
  if (rightText) {
    rightText.textContent = `X: ${rightX}, Y: ${rightY}`;
  }
}

function logAxisSummary(gp) {
  const leftX = gp.axes[0].toFixed(2);
  const leftY = gp.axes[1].toFixed(2);
  const rightX = gp.axes[2].toFixed(2);
  const rightY = gp.axes[3].toFixed(2);
  const now = new Date().toLocaleTimeString();

  const msg = `🕹️ (${now}) 🎯 Left (x, y): ${leftX}, ${leftY} / Right (x, y): ${rightX}, ${rightY}`;
  logMessage(msg);
}

function updateAxisSummary(gp) {
  const leftX = gp.axes[0].toFixed(2);
  const leftY = gp.axes[1].toFixed(2);
  const rightX = gp.axes[2].toFixed(2);
  const rightY = gp.axes[3].toFixed(2);
  const now = new Date().toLocaleTimeString();

  const summaryText = `🕹️ Left (x, y): ${leftX}, ${leftY} / Right (x, y): ${rightX}, ${rightY}`;
  document.getElementById("axis-log-summary").textContent = summaryText;
}

let lastLoggedAxis = { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };

function logAxisIfMax(gp, forceLog = false) {
  const left = { x: +gp.axes[0].toFixed(2), y: +gp.axes[1].toFixed(2) };
  const right = { x: +gp.axes[2].toFixed(2), y: +gp.axes[3].toFixed(2) };

  const diff = (a, b) => Math.abs(a - b);
  const leftChanged =
    diff(left.x, lastLoggedAxis.left.x) >= 0.2 ||
    diff(left.y, lastLoggedAxis.left.y) >= 0.2;
  const rightChanged =
    diff(right.x, lastLoggedAxis.right.x) >= 0.2 ||
    diff(right.y, lastLoggedAxis.right.y) >= 0.2;

  const hasMovement =
    Math.abs(left.x) >= 0.1 || Math.abs(left.y) >= 0.1 ||
    Math.abs(right.x) >= 0.1 || Math.abs(right.y) >= 0.1;

  // 강제 로그가 true여도 움직임 없으면 로그 출력하지 않음
  if ((leftChanged || rightChanged || forceLog) && hasMovement) {
    const now = new Date().toLocaleTimeString();
    const msg = `🕹️ (${now}) 🎯 Left (x, y): ${left.x.toFixed(2)}, ${left.y.toFixed(2)} / Right (x, y): ${right.x.toFixed(2)}, ${right.y.toFixed(2)}`;
    logMessage(msg);
    lastLoggedAxis.left = left;
    lastLoggedAxis.right = right;
  }
}



function updateStatus() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp) continue;

    let buttonChanged = false;

    gp.buttons.forEach((btn, index) => {
      const pressed = btn.pressed;
      const prev = buttonStates[gp.index][index];
    
      if (pressed && !prev) {
        const name = buttonNames[index] || `Button ${index}`;
        logMessage(`⬇️ ${name} (Button ${index}) down`);
        buttonChanged = true;
      } else if (!pressed && prev) {
        const name = buttonNames[index] || `Button ${index}`;
        logMessage(`⬆️ ${name} (Button ${index}) up`);
        buttonChanged = true;
      }
    
      // 상태 갱신은 무조건
      buttonStates[gp.index][index] = pressed;
      
      // ✅ 버튼 라이트 업데이트
      const el = document.querySelector(`.button-indicator[data-btn="${index}"]`);
      if (el) {
        el.classList.toggle("active", pressed);
      }
    });

    if (buttonChanged) {
      logAxisIfMax(gp, true); // 버튼이 눌릴 때는 무조건 기록
    } else {
      logAxisIfMax(gp); // 변경이 클 때만 기록
      updateAxisSummary(gp); // UI의 현재값은 항상 갱신
    }
    
    

    updateStickVisual(gp);
    updateStickTooltip(gp);
  }

  requestAnimationFrame(updateStatus);
}

function updateStickVisual(gp) {
  const leftX = gp.axes[0];
  const leftY = gp.axes[1];
  const rightX = gp.axes[2];
  const rightY = gp.axes[3];

  const leftDot = document.getElementById("left-dot");
  const rightDot = document.getElementById("right-dot");

  const radius = 50; // 움직임 반경

  if (leftDot) {
    leftDot.style.left = 50 + leftX * radius + "%";
    leftDot.style.top = 50 + leftY * radius + "%";
  }

  if (rightDot) {
    rightDot.style.left = 50 + rightX * radius + "%";
    rightDot.style.top = 50 + rightY * radius + "%";
  }
}

function updateButtonIndicators(gp) {
  gp.buttons.forEach((btn, index) => {
    const el = document.querySelector(`.button-indicator[data-btn="${index}"]`);
    if (el) {
      if (btn.pressed) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    }
  });
}





window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

window.addEventListener("load", () => {
  const gps = navigator.getGamepads();
  for (let i = 0; i < gps.length; i++) {
    if (gps[i]) addGamepad(gps[i]);
  }
});

document.getElementById("toggle-log-btn").addEventListener("click", () => {
  log.classList.toggle("hidden");
});





