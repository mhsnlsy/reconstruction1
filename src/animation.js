(() => {
  const obelisk = document.getElementById("obelisk");
  const ropeLift = document.getElementById("ropeLift");
  const ropeHaul = document.getElementById("ropeHaul");
  const phase = document.getElementById("phase");
  const timeEl = document.getElementById("time");
  const bar = document.getElementById("bar");
  const play = document.getElementById("play");
  const reset = document.getElementById("reset");
  const speed = document.getElementById("speed");
  const speedValue = document.getElementById("speedValue");

  const DURATION = 12.0; // seconds at 1.0x
  let t = 0;
  let running = false;
  let last = performance.now();

  function easeInOut(x) {
    return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2;
  }

  function setScene(seconds) {
    const p = Math.min(1, Math.max(0, seconds / DURATION));
    const eased = easeInOut(p);

    // One continuous lift: from horizontal (-90°) to vertical (0°).
    const angle = -90 + 90 * eased;
    obelisk.setAttribute("transform", "translate(600 425) rotate(" + angle + ")");

    // Keep the lifting rope visually attached to the moving head.
    const rad = angle * Math.PI / 180;
    const headX = 600 + Math.sin(rad) * 330;
    const headY = 425 - Math.cos(rad) * 330;
    ropeLift.setAttribute("d", "M600 190 L600 95 L" + headX.toFixed(1) + " " + headY.toFixed(1));

    // Hauling rope follows the top pulley into the capstan/crew.
    ropeHaul.setAttribute("d",
      "M600 190 C650 250 700 300 745 355 L930 510"
    );

    let text = "Hazırlık";
    if (p < .12) text = "Halatlar geriliyor";
    else if (p < .72) text = "Dikilitaş kaldırılıyor";
    else if (p < .94) text = "Son derece";
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
