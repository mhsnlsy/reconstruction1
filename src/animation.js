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

  // 12.5 s at 1.0x; at the default 0.95x it is ~13.2 s.
  const DURATION = 12.5;
  const HOLD = 0.22; // first 22%: stone remains horizontal on the ground
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

    // The stone starts completely horizontal on the ground.
    // Then its foot rises from the ground/pedestal level while the shaft
    // rotates around the foot until it is vertical.
    let angle = 90;
    let pivotX = 600;
    let pivotY = 590;

    if (p > HOLD) {
      const liftP = (p - HOLD) / (1 - HOLD);
      const eased = easeInOut(liftP);
      angle = 90 - 90 * eased;
      pivotY = 590 - 165 * eased;
    }

    obelisk.setAttribute(
      "transform",
      "translate(" + pivotX + " " + pivotY + ") rotate(" + angle + ")"
    );

    // Obelisk head in world coordinates. The local shaft runs from
    // (0,0) to (0,-355), so this point is always exactly on the stone.
    const rad = angle * Math.PI / 180;
    const headX = pivotX + 355 * Math.sin(rad);
    const headY = pivotY - 355 * Math.cos(rad);

    // Lifting rope stays attached to the upper end of the stone.
    ropeLift.setAttribute(
      "d",
      "M600 190 L600 95 L" +
        headX.toFixed(1) +
        " " +
        headY.toFixed(1)
    );

    let text = "Yatay konum — hazırlık";
    if (p >= HOLD && p < 0.48) text = "Dikilitaş kaldırılıyor";
    else if (p < 0.88) text = "Dikilitaş dikiliyor";
    else if (p < 0.99) text = "Kaideye oturtuluyor";
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
