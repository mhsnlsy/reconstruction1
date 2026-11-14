(() => {
  const obelisk = document.getElementById("obelisk");
  const ropeFront = document.getElementById("ropeFront");
  const ropeReturn = document.getElementById("ropeReturn");
  const ropeRear = document.getElementById("ropeRear");
  const ropeCollar = document.getElementById("ropeCollar");
  const phase = document.getElementById("phase");
  const timeEl = document.getElementById("time");
  const bar = document.getElementById("bar");
  const play = document.getElementById("play");
  const reset = document.getElementById("reset");
  const speed = document.getElementById("speed");
  const speedValue = document.getElementById("speedValue");

  const DURATION = 13.0;
  const HOLD = 0.18;
  let t = 0, running = false, last = performance.now();

  const ease = x => x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2;

  function setScene(seconds) {
    const p = Math.max(0, Math.min(1, seconds / DURATION));

    // Fixed isometric camera. The obelisk rotates about its lower end.
    let u = 0, angle = 90;
    if (p > HOLD) {
      u = ease((p - HOLD) / (1 - HOLD));
      angle = 90 - 90*u;
    }

    // Foot approaches the socket as the final erection proceeds.
    const px = 430 + 130*u;
    const py = 555 - 100*u;

    obelisk.setAttribute("transform",
      "translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") rotate(" + angle.toFixed(2) + ")");

    // Attachment point is 365 px along the obelisk axis.
    const r = angle * Math.PI / 180;
    const headX = px + 365*Math.sin(r);
    const headY = py - 365*Math.cos(r);

    // Collar stays on the stone's head/working attachment point.
    ropeCollar.setAttribute("transform", "translate(" + headX.toFixed(1) + " " + headY.toFixed(1) + ")");

    // Two visible lifting legs: one in the foreground and one offset behind it.
    ropeFront.setAttribute("d",
      "M700 178 L700 105 L" + headX.toFixed(1) + " " + headY.toFixed(1));

    ropeRear.setAttribute("d",
      "M610 178 L610 96 L" + (headX+18).toFixed(1) + " " + (headY+7).toFixed(1));

    // Return leg runs from the attachment region back through the upper block.
    const midX = headX + 55;
    const midY = headY - 25;
    ropeReturn.setAttribute("d",
      "M" + headX.toFixed(1) + " " + headY.toFixed(1) +
      " C" + midX.toFixed(1) + " " + midY.toFixed(1) +
      " 655 300 700 178");

    let label = "Yatay konum — hazırlık";
    if (p >= HOLD && p < .45) label = "Halatlar geriliyor";
    else if (p < .82) label = "Dikilitaş kaldırılıyor";
    else if (p < .96) label = "Kaideye hizalanıyor";
    else label = "Dikilitaş dikildi";

    phase.textContent = label;
    timeEl.textContent = seconds.toFixed(1);
    bar.style.width = (p*100).toFixed(2) + "%";
  }

  function tick(now) {
    const dt = Math.min(.05, (now-last)/1000);
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