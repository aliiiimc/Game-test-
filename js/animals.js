// Farm.Animals: wander AI, drawing and icons for the animals stored in Farm.Game.state.animals.
window.Farm = window.Farm || {};

Farm.Animals = (function () {
  var FRAME_TIME = 0.25; // seconds per walk frame

  function getState() {
    return (Farm.Game && Farm.Game.state) || null;
  }

  // Pen runtime state (troughFull) from Farm.Game.state.pens.
  function penState(id) {
    var st = getState();
    if (!st || !st.pens) return null;
    for (var i = 0; i < st.pens.length; i++) {
      if (st.pens[i].id === id) return st.pens[i];
    }
    return null;
  }

  function now() {
    return (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
  }

  function pickTarget(a, box) {
    a.targetX = box.x0 + Math.random() * (box.x1 - box.x0);
    a.targetY = box.y0 + Math.random() * (box.y1 - box.y0);
  }

  function clampToBox(a, box) {
    if (a.x < box.x0) a.x = box.x0;
    if (a.x > box.x1) a.x = box.x1;
    if (a.y < box.y0) a.y = box.y0;
    if (a.y > box.y1) a.y = box.y1;
  }

  function idle(a) {
    a.moving = false;
    a.frame = 0;
    a.animTimer = 0;
  }

  function update(dt) {
    var st = getState();
    if (!st || !st.animals) return;
    var C = Farm.CONFIG;

    for (var i = 0; i < st.animals.length; i++) {
      var a = st.animals[i];
      if (a.heartTimer > 0) a.heartTimer = Math.max(0, a.heartTimer - dt);

      var pen = C.getPen(a.pen);
      if (!pen) continue;
      var box = C.penInterior(pen);
      if (typeof a.animTimer !== 'number') a.animTimer = 0;
      clampToBox(a, box);

      if (a.waitTimer > 0) {
        a.waitTimer = Math.max(0, a.waitTimer - dt);
        idle(a);
        continue;
      }

      if (a.targetX == null || a.targetY == null) pickTarget(a, box);

      var dx = a.targetX - a.x, dy = a.targetY - a.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        // arrived: rest for 1..4 s, then pick a new target
        a.targetX = null;
        a.targetY = null;
        a.waitTimer = 1 + Math.random() * 3;
        idle(a);
        continue;
      }

      var step = C.ANIMAL_SPEED * dt;
      if (step >= dist) {
        a.x = a.targetX;
        a.y = a.targetY;
      } else {
        a.x += dx / dist * step;
        a.y += dy / dist * step;
      }
      if (Math.abs(dx) > 0.01) a.dir = dx < 0 ? 'left' : 'right';
      a.moving = true;

      a.animTimer += dt;
      if (a.animTimer >= FRAME_TIME) {
        a.animTimer -= FRAME_TIME;
        a.frame = a.frame === 1 ? 0 : 1;
      }
      clampToBox(a, box);
    }
  }

  function drawOne(ctx, cam, a) {
    var sx = a.x - cam.x, sy = a.y - cam.y;

    // shadow under the feet
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(Math.round(sx), Math.round(sy) - 1, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    Farm.Sprites.draw(ctx, a.type + '_' + (a.frame === 1 ? 1 : 0), sx - 8, sy - 16, a.dir === 'left');
  }

  function draw(ctx, cam) {
    var st = getState();
    if (!st || !st.animals) return;
    var list = st.animals.slice().sort(function (p, q) { return p.y - q.y; });
    for (var i = 0; i < list.length; i++) drawOne(ctx, cam, list[i]);
  }

  function drawIcons(ctx, cam) {
    var st = getState();
    if (!st || !st.animals) return;
    var C = Farm.CONFIG;
    var bob = Math.round(Math.sin(now() * 4));

    for (var i = 0; i < st.animals.length; i++) {
      var a = st.animals[i];
      var name = null;
      if (a.heartTimer > 0) {
        name = 'icon_heart';
      } else if (a.hasProduct) {
        var spec = C.ANIMALS[a.type];
        var item = spec && C.ITEMS[spec.product];
        if (item) name = item.sprite;
      } else {
        var ps = penState(a.pen);
        if (ps && !ps.troughFull) name = 'icon_hungry';
      }
      if (name) {
        Farm.Sprites.draw(ctx, name, a.x - 8 - cam.x, a.y - 30 - cam.y + bob, false);
      }
    }
  }

  // Nearest animal whose body centre (x, y - 6) is within r px of (x, y), or null.
  function findNear(x, y, r) {
    var st = getState();
    if (!st || !st.animals) return null;
    var best = null, bestD = Infinity;
    for (var i = 0; i < st.animals.length; i++) {
      var a = st.animals[i];
      var dx = x - a.x, dy = y - (a.y - 6);
      var d = Math.sqrt(dx * dx + dy * dy);
      // Animals carrying a product are preferred when several are in reach.
      var score = a.hasProduct ? d - r : d;
      if (d <= r && score < bestD) {
        best = a;
        bestD = score;
      }
    }
    return best;
  }

  return {
    update: update,
    drawOne: drawOne,
    draw: draw,
    drawIcons: drawIcons,
    findNear: findNear
  };
})();
