(() => {
  const obelisk = document.getElementById("obelisk");
  const ropeLift = document.getElementById("ropeLift");
  const phase = document.getElementById("phase");
  const timeEl = document.getElementById("time");
  const bar = document.getElementById("bar");
  const play = document.getElementById("play");
  const reset = document.getElementById("reset");
  const speed = document.getElementById("speed");
  const speedValue = document.getElementById("speedValue");

  const DURATION = 12.5;
  const HOLD = 0.20;
  let t = 0;
  let running = false;
  let last = performance.now();

  function easeInOut(x) {
    return x < 0.5
      ? 2 * x * x
      : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  function setScene(seconds) {
    const p = Math.min(1, Math.max(0, seconds / DURATION));

    // Isometric scene: the stone begins flat on the ground.
    // It rotates around its foot; the pivot also moves toward the pedestal
    // during the final placement.
    let angle = 90;
    let pivotX = 470;
    let pivotY = 545;

    if (p > HOLD) {
      const liftP = (p - HOLD) / (1 - HOLD);
      const eased = easeInOut(liftP);
      angle = 90 - 90 * eased;

      // Foot travels slightly toward the pedestal while rising.
      pivotX = 470 + 130 * eased;
      pivotY = 545 - 120 * eased;
    }

    obelisk.setAttribute(
      "transform",
      "translate(" + pivotX.toFixed(1) + " " + pivotY.toFixed(1) + ") rotate(" + angle.toFixed(2) + ")"
    );

    // Local shaft tip is 355 px above the foot.
    const rad = angle * Math.PI / 180;
    const headX = pivotX + 355 * Math.sin(rad);
    const headY = pivotY - 355 * Math.cos(rad);

    // Rope follows the actual head.
    ropeLift.setAttribute(
      "d",
      "M600 190 L600 95 L" + headX.toFixed(1) + " " + headY.toFixed(1)
    );

    let text = "Yatay konum — hazırlık";
    if (p >= HOLD && p < 0.48) text = "Halatlar geriliyor";
    else if (p < 0.82) text = "Dikilitaş kaldırılıyor";
    else if (p < 0.96) text = "Kaideye hizalanıyor";
    else text = "Dikilitaş dikildi";

    phase.textContent = text;
    timeEl.textContent = seconds.toFixed(1);
    bar.style.width = (p * 100).toFixed(2) + "%";
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (running) {
      t += dt * Number(speed.value);
      if (t >= DURATION) {
        t = DURATION;
        running = false;
        play.textContent = "▶ Tekrar oynat";
      }
      setScene(t);
    }
    requestAnimationFrame(tick);
  }

  play.addEventListener("click", () => {
    if (t >= DURATION) t = 0;
    running = !running;
    play.textContent = running ? "❚❚ Duraklat" : "▶ Devam et";
  });

  reset.addEventListener("click", () => {
    running = false;
    t = 0;
    play.textContent = "▶ Başlat";
    setScene(0);
  });

  speed.addEventListener("input", () => {
    speedValue.textContent = Number(speed.value).toFixed(2) + "×";
  });

  setScene(0);
  requestAnimationFrame(tick);
})();
