const pressedClass = "pressed";

    function clearPressed() {
      document.querySelectorAll(".button").forEach(el => el.classList.remove(pressedClass));
    }

    window.addEventListener("gamepadconnected", () => {
      requestAnimationFrame(updateGamepad);
    });

    function updateGamepad() {
      const gp = navigator.getGamepads()[0];
      if (gp) {
        clearPressed();
        gp.buttons.forEach((btn, i) => {
          const el = document.getElementById("button" + i);
          if (btn.pressed && el) {
            el.classList.add(pressedClass);
          }
        });
      }
      requestAnimationFrame(updateGamepad);
    }

    // Allow mouse clicking on virtual buttons
    document.querySelectorAll(".button").forEach(button => {
      button.addEventListener("mousedown", () => {
        button.classList.add(pressedClass);
      });
      button.addEventListener("mouseup", () => {
        button.classList.remove(pressedClass);
      });
      button.addEventListener("mouseleave", () => {
        button.classList.remove(pressedClass);
      });
    });