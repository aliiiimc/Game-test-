// Farmer Simulator — keyboard input, camera, game loop and boot.
// Classic script: attaches Farm.Input and Farm.Camera; the loop starts on window load.
window.Farm = window.Farm || {};

// ---------- Input ----------
Farm.Input = (function () {
  var held = {};     // e.code and lowercase e.key of keys currently down
  var pending = {};  // one-shot presses: 'action', 'escape', 'slot1'..'slot6'
  var inited = false;
  var PREVENT = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, Space: 1 };

  // Buttons/inputs own Enter and Space, so those must not also trigger an action.
  function isControl(t) {
    var n = t && t.tagName;
    return n === 'BUTTON' || n === 'INPUT' || n === 'SELECT' || n === 'TEXTAREA';
  }

  function onDown(e) {
    var code = e.code || '';
    var key = (e.key || '').toLowerCase();
    if (PREVENT[code]) e.preventDefault();
    held[code] = true;
    if (key) held[key] = true;
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

    if (key === 'e' || code === 'Space' || code === 'Enter') {
      if (!isControl(e.target)) pending.action = true;
    }
    if (code === 'Escape' || key === 'escape') pending.escape = true;
    var m = /^(?:Digit|Numpad)([1-6])$/.exec(code);
    if (m) pending['slot' + m[1]] = true;
  }

  function onUp(e) {
    delete held[e.code || ''];
    delete held[(e.key || '').toLowerCase()];
  }

  function onBlur() {
    held = {};
    pending = {};
  }

  function init() {
    if (inited) return;
    inited = true;
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
  }

  function down(names) {
    for (var i = 0; i < names.length; i++) if (held[names[i]]) return true;
    return false;
  }

  return {
    init: init,
    dirX: function () {
      var l = down(['ArrowLeft', 'a', 'q']);
      var r = down(['ArrowRight', 'd']);
      return (r ? 1 : 0) - (l ? 1 : 0);
    },
    dirY: function () {
      var u = down(['ArrowUp', 'w', 'z']);
      var d = down(['ArrowDown', 's']);
      return (d ? 1 : 0) - (u ? 1 : 0);
    },
    // True once per key press for one-shot names ('action', 'escape', 'slot1'..'slot6').
    consume: function (name) {
      if (pending[name]) { pending[name] = false; return true; }
      return false;
    }
  };
})();

// ---------- Camera ----------
// Farm.Camera is the world pixel at the canvas top-left (cam.x, cam.y).
Farm.Camera = { x: 0, y: 0 };

Farm.Camera.follow = function (state) {
  var C = Farm.CONFIG;
  var cam = Farm.Camera;
  if (!state || !state.player) return;
  var maxX = C.MAP_W * C.TILE - C.VIEW_W;
  var maxY = C.MAP_H * C.TILE - C.VIEW_H;
  var x = Math.round(state.player.x - C.VIEW_W / 2);
  var y = Math.round(state.player.y - C.VIEW_H / 2);
  cam.x = Math.max(0, Math.min(maxX, x));
  cam.y = Math.max(0, Math.min(maxY, y));
};

// ---------- Game loop ----------
(function () {
  var canvas = null;
  var ctx = null;
  var last = 0;
  var saveTimer = 0;
  var SAVE_EVERY = 20;     // seconds
  var reported = {};       // error messages already logged

  function report(where, e) {
    var msg = where + ': ' + (e && e.message ? e.message : e);
    if (reported[msg]) return;
    reported[msg] = true;
    console.error('[Farm] ' + msg, e);
  }

  // One failing subsystem must not freeze the rest of the frame.
  function guard(where, fn) {
    try { fn(); } catch (e) { report(where, e); }
  }

  function update(dt) {
    var C = Farm.CONFIG;
    var modal = Farm.UI.isModalOpen();

    if (!modal) {
      guard('advanceTime', function () { Farm.Game.advanceTime(dt); });
      guard('player', function () { Farm.Player.update(dt); });
      guard('animals', function () { Farm.Animals.update(dt); });
      guard('tasks', function () { Farm.Tasks.update(Farm.Game.state); });
    }

    // Consume every one-shot press each frame, even when a modal swallows it.
    var slot = -1;
    for (var i = 1; i <= 6; i++) {
      if (Farm.Input.consume('slot' + i) && slot < 0) slot = i - 1;
    }
    var act = Farm.Input.consume('action');

    // Re-check: advanceTime may have opened a modal (e.g. passing out at midnight).
    if (!Farm.UI.isModalOpen()) {
      if (slot >= 0) guard('slot', function () { Farm.Game.state.selectedSlot = slot; });
      if (act) guard('interact', function () { Farm.Interact.interact(); });
    }

    if (Farm.Input.consume('escape')) guard('escape', function () { Farm.UI.closeModal(); });

    guard('ui', function () { Farm.UI.update(); });

    saveTimer += dt;
    if (saveTimer >= SAVE_EVERY) {
      saveTimer = 0;
      guard('save', function () { Farm.Game.save(); });
    }
  }

  function render() {
    var C = Farm.CONFIG;
    var s = Farm.Game.state;
    var cam = Farm.Camera;
    var W = C.VIEW_W, H = C.VIEW_H, T = C.TILE;

    ctx.fillStyle = '#5fa83a';
    ctx.fillRect(0, 0, W, H);
    if (!s) return;

    guard('ground', function () { Farm.World.drawGround(ctx, cam); });
    guard('objects', function () { Farm.World.drawObjects(ctx, cam); });

    // Entities sorted by feet y so nearer things draw on top.
    var list = [];
    s.animals.forEach(function (a) {
      list.push({ y: a.y, draw: function () { Farm.Animals.drawOne(ctx, cam, a); } });
    });
    list.push({ y: s.player.y, draw: function () { Farm.Player.draw(ctx, cam); } });
    list.sort(function (p, q) { return p.y - q.y; });
    list.forEach(function (e) { guard('entity', e.draw); });

    // Facing tile highlight (not while a modal is open).
    if (!Farm.UI.isModalOpen()) {
      guard('highlight', function () {
        var ft = Farm.Player.getFacingTile();
        if (ft.tx < 0 || ft.ty < 0 || ft.tx >= C.MAP_W || ft.ty >= C.MAP_H) return;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(ft.tx * T - cam.x + 0.5, ft.ty * T - cam.y + 0.5, T - 1, T - 1);
        ctx.restore();
      });
    }

    guard('icons', function () { Farm.Animals.drawIcons(ctx, cam); });

    // Night: alpha 0 at NIGHT_START (18:00), 0.55 at 22:00.
    guard('night', function () {
      var NIGHT_END = 22 * 60;
      var t = (s.minutes - C.NIGHT_START) / (NIGHT_END - C.NIGHT_START);
      var a = Math.max(0, Math.min(1, t)) * 0.55;
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#0a1030';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    });
  }

  function frame(now) {
    var dt = last ? Math.max(0, Math.min(0.05, (now - last) / 1000)) : 0;
    last = now;
    try { update(dt); } catch (e) { report('update', e); }
    try {
      Farm.Camera.follow(Farm.Game.state);
      render();
    } catch (e) { report('render', e); }
    requestAnimationFrame(frame);
  }

  // Scale the canvas to the window: whole steps (x2 halves) when it fits, exact fit when smaller.
  function resize() {
    if (!canvas) return;
    var C = Farm.CONFIG;
    var fit = Math.min(window.innerWidth / C.VIEW_W, window.innerHeight / C.VIEW_H);
    var scale = fit >= 1 ? Math.max(1, Math.floor(fit * 2) / 2) : Math.max(0.1, Math.floor(fit * 100) / 100);
    var w = Math.round(C.VIEW_W * scale);
    var h = Math.round(C.VIEW_H * scale);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var game = document.getElementById('game');
    if (game) {
      game.style.width = w + 'px';
      game.style.height = h + 'px';
    }
  }

  window.addEventListener('load', function () {
    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    Farm.Input.init();
    try {
      Farm.World.init();
      Farm.UI.init();
      Farm.Game.init();
    } catch (e) { report('boot', e); }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  });
})();
