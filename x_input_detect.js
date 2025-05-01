let log = document.getElementById("log");
    let prevButtons = [];
    let prevAxes = [];

    function appendLog(message) {
      const time = new Date().toLocaleTimeString();
      log.textContent += `\n[${time}] ${message}`;
      log.scrollTop = log.scrollHeight;
    }

    window.addEventListener("gamepadconnected", (e) => {
      appendLog(`✅ Gamepad connected: ${e.gamepad.id}`);
      requestAnimationFrame(updateGamepad);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      appendLog(`❌ Gamepad disconnected: ${e.gamepad.id}`);
    });

    function updateGamepad() {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0]; // 첫 번째 컨트롤러만 사용

      if (gp) {
        // 버튼 상태 확인
        gp.buttons.forEach((button, i) => {
          if (!prevButtons[i]) prevButtons[i] = false;
          if (button.pressed && !prevButtons[i]) {
            appendLog(`🔘 Button ${i} pressed`);
          } else if (!button.pressed && prevButtons[i]) {
            appendLog(`🔴 Button ${i} released`);
          }
          prevButtons[i] = button.pressed;
        });

        // 아날로그 스틱 축 상태 확인
        gp.axes.forEach((value, i) => {
          if (!prevAxes[i]) prevAxes[i] = 0;
          if (Math.abs(value - prevAxes[i]) > 0.05) {
            appendLog(`🕹️ Axis ${i} moved to ${value.toFixed(2)}`);
            prevAxes[i] = value;
          }
        });
      }

      requestAnimationFrame(updateGamepad);
    }