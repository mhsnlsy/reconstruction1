(() => {
  const NS = "http://www.w3.org/2000/svg";

  const $ = id => document.getElementById(id);
  const phase = $("phase");
  const timeEl = $("time");
  const bar = $("bar");
  const play = $("play");
  const reset = $("reset");
  const speed = $("speed");
  const speedValue = $("speedValue");

  const DURATION = 13.0;
  const HOLD = 0.18;

  // Fixed high-angle isometric camera.
  const ORIGIN = { x: 610, y: 360 };
  const S = 0.62;
  const ZS = 0.90;
  const COS30 = 0.8660254;
  const SIN30 = 0.5;

  const iso = (x, y, z = 0) => ({
    x: ORIGIN.x + (x - y) * COS30 * S,
    y: ORIGIN.y + (x + y) * SIN30 * S - z * ZS * S
  });

  const pts = arr => arr.map(p => iso(...p)).map(p => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");

  const line = (id, a, b) => {
    const e = $(id), p1 = iso(...a), p2 = iso(...b);
    e.setAttribute("x1", p1.x); e.setAttribute("y1", p1.y);
    e.setAttribute("x2", p2.x); e.setAttribute("y2", p2.y);
  };

  // Site grid: two true isometric ground directions.
  const grid = $("grid");
  for (let x = -40; x <= 700; x += 55) {
    const p1 = iso(x, -60, 1), p2 = iso(x, 430, 1);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", p1.x); l.setAttribute("y1", p1.y);
    l.setAttribute("x2", p2.x); l.setAttribute("y2", p2.y);
    grid.appendChild(l);
  }
  for (let y = -60; y <= 430; y += 55) {
    const p1 = iso(-80, y, 1), p2 = iso(700, y, 1);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", p1.x); l.setAttribute("y1", p1.y);
    l.setAttribute("x2", p2.x); l.setAttribute("y2", p2.y);
    grid.appendChild(l);
  }

  $("ground").setAttribute("points", pts([
    [-100,-50,0],[700,-50,0],[700,400,0],[-100,400,0]
  ]));

  // Pedestal: centered on the working socket.
  const B = {x:350,y:180};
  const W = 105, D = 82, H1 = 34, H2 = 24;
  $("pedBaseTop").setAttribute("points", pts([
    [B.x-W/2,B.y-D/2,H1],[B.x+W/2,B.y-D/2,H1],
    [B.x+W/2,B.y+D/2,H1],[B.x-W/2,B.y+D/2,H1]
  ]));
  $("pedBaseFront").setAttribute("points", pts([
    [B.x-W/2,B.y-D/2,0],[B.x+W/2,B.y-D/2,0],
    [B.x+W/2,B.y-D/2,H1],[B.x-W/2,B.y-D/2,H1]
  ]));
  $("pedBaseSide").setAttribute("points", pts([
    [B.x+W/2,B.y-D/2,0],[B.x+W/2,B.y+D/2,0],
    [B.x+W/2,B.y+D/2,H1],[B.x+W/2,B.y-D/2,H1]
  ]));
  $("pedUpperTop").setAttribute("points", pts([
    [B.x-44,B.y-34,H1+H2],[B.x+44,B.y-34,H1+H2],
    [B.x+44,B.y+34,H1+H2],[B.x-44,B.y+34,H1+H2]
  ]));
  $("pedUpperFront").setAttribute("points", pts([
    [B.x-44,B.y-34,H1],[B.x+44,B.y-34,H1],
    [B.x+44,B.y-34,H1+H2],[B.x-44,B.y-34,H1+H2]
  ]));
  $("pedUpperSide").setAttribute("points", pts([
    [B.x+44,B.y-34,H1],[B.x+44,B.y+34,H1],
    [B.x+44,B.y+34,H1+H2],[B.x+44,B.y-34,H1+H2]
  ]));
  const socket = iso(B.x,B.y,H1+H2+1);
  $("socket").setAttribute("cx", socket.x);
  $("socket").setAttribute("cy", socket.y);

  // Heavy timber frame: two depth planes and cross bracing.
  const z0 = 0, zTop = 300;
  const posts = [
    ["postBL","post2BL",[180,75,z0],[180,75,zTop]],
    ["postBR","post2BR",[500,75,z0],[500,75,zTop]],
    ["postFL","post2FL",[180,285,z0],[180,285,zTop]],
    ["postFR","post2FR",[500,285,z0],[500,285,zTop]]
  ];
  for (const [a,b,p1,p2] of posts) { line(a,p1,p2); line(b,p1,p2); }

  line("beamTopA",[180,75,zTop],[500,75,zTop]);
  line("beamTopB",[180,285,zTop],[500,285,zTop]);
  line("beamMidA",[180,75,150],[500,75,150]);
  line("beamMidB",[180,285,150],[500,285,150]);

  line("brace1",[180,75,zTop],[500,75,150]);
  line("brace2",[500,75,zTop],[180,75,150]);
  line("brace3",[180,285,zTop],[500,285,150]);
  line("brace4",[500,285,zTop],[180,285,150]);

  // Pulley positions in the upper beam.
  const P1 = [315,75,285];
  const P2 = [435,75,285];
  const P3 = [500,285,145];

  function setCircle(world) {
    return iso(...world);
  }

  // Obelisk dimensions. It starts completely flat on the ground and rotates
  // around a fixed lower pivot. The shaft is represented as a real 3D prism.
  const L = 365;
  const half = 12;
  const baseZ = H1 + H2 + 2;

  function shaftPoint(theta, s, yOffset, sideOffset) {
    // theta: 0 = horizontal, PI/2 = upright.
    const c = Math.cos(theta), sn = Math.sin(theta);
    const x = B.x + s*c + sideOffset*(-sn);
    const y = B.y + yOffset;
    const z = baseZ + s*sn + sideOffset*c;
    return [x,y,z];
  }

  function setObelisk(theta) {
    const baseCorners = [
      shaftPoint(theta,0,-half,-half),
      shaftPoint(theta,0, half,-half),
      shaftPoint(theta,0, half, half),
      shaftPoint(theta,0,-half, half)
    ];
    const headCorners = [
      shaftPoint(theta,L,-half,-half),
      shaftPoint(theta,L, half,-half),
      shaftPoint(theta,L, half, half),
      shaftPoint(theta,L,-half, half)
    ];

    $("obeliskFace1").setAttribute("points", pts([baseCorners[0],baseCorners[1],headCorners[1],headCorners[0]]));
    $("obeliskFace2").setAttribute("points", pts([baseCorners[1],baseCorners[2],headCorners[2],headCorners[1]]));
    $("obeliskFace3").setAttribute("points", pts([baseCorners[2],baseCorners[3],headCorners[3],headCorners[2]]));
    $("obeliskFace4").setAttribute("points", pts([baseCorners[3],baseCorners[0],headCorners[0],headCorners[3]]));

    // Pyramid cap, with a slightly reduced square at the very top.
    const tip = shaftPoint(theta,L+18,0,0);
    const capBase = headCorners;
    $("obeliskCap").setAttribute("points", pts([
      capBase[0],capBase[1],tip,capBase[2],capBase[3]
    ]));

    const markA1 = iso(...shaftPoint(theta,70,half+0.5,half+0.5));
    const markA2 = iso(...shaftPoint(theta,285,half+0.5,half+0.5));
    $("obeliskMark1").setAttribute("d", "M"+markA1.x+" "+markA1.y+" L"+markA2.x+" "+markA2.y);

    const markB1 = iso(...shaftPoint(theta,165,-half-0.5,half+0.5));
    const markB2 = iso(...shaftPoint(theta,255,-half-0.5,half+0.5));
    $("obeliskMark2").setAttribute("d", "M"+markB1.x+" "+markB1.y+" L"+markB2.x+" "+markB2.y);

    const pivot = iso(B.x,B.y,baseZ);
    $("pivot").setAttribute("cx", pivot.x);
    $("pivot").setAttribute("cy", pivot.y);

    const collar = iso(...shaftPoint(theta,L-7,0,0));
    $("collarA").setAttribute("cx", collar.x);
    $("collarA").setAttribute("cy", collar.y);

    const c1 = iso(...shaftPoint(theta,L-18,-18,0));
    const c2 = iso(...shaftPoint(theta,L-18,18,0));
    $("collarB").setAttribute("d", "M"+c1.x+" "+c1.y+" L"+c2.x+" "+c2.y);

    return {head: iso(...shaftPoint(theta,L,0,0)), collar};
  }

  function path(points) {
    return points.map((p,i) => {
      const q = iso(...p);
      return (i ? "L" : "M") + q.x.toFixed(1) + " " + q.y.toFixed(1);
    }).join(" ");
  }

  function setRopes(theta, head) {
    const p1 = setCircle(P1);
    const p2 = setCircle(P2);
    const p3 = setCircle(P3);

    // Main load line: head -> upper pulley -> direction pulley -> capstan.
    const slack = Math.max(0, 1 - theta/(Math.PI/2));
    const sag = 45 * slack;

    $("ropeA").setAttribute("d", path([
      [B.x + L*Math.cos(theta), B.y, baseZ + L*Math.sin(theta)],
      P1,
      P3,
      [590,325,45],
      [650,350,0]
    ]));

    $("ropeB").setAttribute("d", path([
      [B.x + L*Math.cos(theta), B.y, baseZ + L*Math.sin(theta)],
      P2,
      P3
    ]));

    $("ropeC").setAttribute("d", path([
      P3,[590,325,45],[650,350,0]
    ]));

    $("ropeD").setAttribute("d", path([
      [B.x + L*Math.cos(theta), B.y, baseZ + L*Math.sin(theta)],
      [300,40,285],[220,40,285]
    ]));

    $("ropeHighlight").setAttribute("d",
      path([[B.x + L*Math.cos(theta), B.y, baseZ + L*Math.sin(theta)],P1]));

    // Make the pulleys rotate as rope passes over them.
    const spin = (-theta*180/Math.PI*2.4).toFixed(1);
    $("pulley1").setAttribute("transform","translate("+p1.x+" "+p1.y+") rotate("+spin+")");
    $("pulley2").setAttribute("transform","translate("+p2.x+" "+p2.y+") rotate("+(spin*0.8)+")");
    $("directionPulley").setAttribute("transform","translate("+p3.x+" "+p3.y+") rotate("+(-spin)+" )");
  }

  function placeCrew() {
    const c = iso(650,350,0);
    $("capstan").setAttribute("transform","translate("+c.x+" "+c.y+")");
    const offsets = [[-38,18],[5,35],[46,10]];
    [["worker1",offsets[0]],["worker2",offsets[1]],["worker3",offsets[2]]].forEach(([id,[dx,dy]],i) => {
      $(id).setAttribute("transform","translate("+(c.x+dx)+" "+(c.y+dy)+")");
      $(id).style.transformOrigin = "center";
      $(id).style.transformBox = "fill-box";
    });
  }

  placeCrew();

  const ease = x => x < .5
    ? 2*x*x
    : 1 - Math.pow(-2*x+2,2)/2;

  let t = 0, running = false, last = performance.now();

  function setScene(seconds) {
    const p = Math.max(0, Math.min(1, seconds / DURATION));

    let u = 0;
    if (p > HOLD) u = ease((p - HOLD) / (1 - HOLD));

    // 0° = fully horizontal. 90° = vertical.
    const theta = (Math.PI/2) * u;
    const result = setObelisk(theta);
    setRopes(theta,result.head);

    // The hauling crew leans into the rope as tension rises.
    const effort = p < HOLD ? 0 : Math.min(1, (p-HOLD)/0.55);
    ["worker1","worker2","worker3"].forEach((id,i)=>{
      const lean = (i===1 ? -2 : 2) * effort;
      const lift = Math.sin((seconds*5.2)+i*1.7) * 1.2 * effort;
      const base = [[-38,18],[5,35],[46,10]][i];
      const c = iso(650,350,0);
      $(id).setAttribute("transform",
        "translate("+(c.x+base[0])+" "+(c.y+base[1]+lift)+") rotate("+lean+")");
    });

    let label = "Yatay konum — hazırlık";
    if (p >= HOLD && p < .36) label = "Halatlar geriliyor";
    else if (p < .78) label = "Dikilitaş kaldırılıyor";
    else if (p < .96) label = "Kaideye hizalanıyor";
    else label = "Dikilitaş dikildi";

    phase.textContent = label;
    timeEl.textContent = seconds.toFixed(1);
    bar.style.width = (p*100).toFixed(2) + "%";
  }

  function tick(now) {
    const dt = Math.min(.05,(now-last)/1000);
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