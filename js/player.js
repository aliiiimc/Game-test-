// Farm.Player: the farmer's movement, collision, animation and drawing.
// The data lives in Farm.Game.state.player.
window.Farm = window.Farm || {};

Farm.Player = (function () {
  var FRAME_TIME = 0.2;   // seconds per walk frame
  var DIAG = 0.7071;      // diagonal speed normalisation

  function getPlayer() {
    var st = Farm.Game && Farm.Game.state;
    return st ? st.player : null;
  }

  function axis(name) {
    return (Farm.Input && typeof Farm.Input[name] === 'function') ? Farm.Input[name]() : 0;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function update(dt) {
    var p = getPlayer();
    if (!p) return;
    var C = Farm.CONFIG;
    var ix = axis('dirX'), iy = axis('dirY');
    var moving = ix !== 0 || iy !== 0;

    // facing: vertical only -> up/down; horizontal (including diagonals) -> left/right
    if (iy !== 0 && ix === 0) p.dir = iy < 0 ? 'up' : 'down';
    else if (ix !== 0) p.dir = ix < 0 ? 'left' : 'right';

    var dx = ix, dy = iy;
    if (dx !== 0 && dy !== 0) { dx *= DIAG; dy *= DIAG; }
    var step = C.PLAYER_SPEED * dt;

    // axis-separated movement against the feet hitbox (x-5, y-6, 10, 6)
    var nx = p.x + dx * step;
    if (!Farm.World.isBlockedRect(nx - 5, p.y - 6, 10, 6)) p.x = nx;
    var ny = p.y + dy * step;
    if (!Farm.World.isBlockedRect(p.x - 5, ny - 6, 10, 6)) p.y = ny;

    p.x = clamp(p.x, 5, C.MAP_W * C.TILE - 5);
    p.y = clamp(p.y, 6, C.MAP_H * C.TILE - 1);

    p.moving = moving;
    if (moving) {
      p.animTimer = (p.animTimer || 0) + dt;
      if (p.animTimer >= FRAME_TIME) {
        p.animTimer -= FRAME_TIME;
        p.frame = p.frame === 1 ? 0 : 1;
      }
    } else {
      p.frame = 0;
      p.animTimer = 0;
    }
  }

  function draw(ctx, cam) {
    var p = getPlayer();
    if (!p) return;
    var sx = p.x - cam.x, sy = p.y - cam.y;

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(Math.round(sx), Math.round(sy) - 1, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    var view = p.dir === 'up' ? 'up' : (p.dir === 'down' ? 'down' : 'side');
    var name = 'farmer_' + view + '_' + (p.frame === 1 ? 1 : 0);
    Farm.Sprites.draw(ctx, name, sx - 8, sy - 16, p.dir === 'left');
  }

  function getFacingPoint() {
    var p = getPlayer();
    if (!p) return { x: 0, y: 0 };
    var dx = 0, dy = 0;
    if (p.dir === 'left') dx = -1;
    else if (p.dir === 'right') dx = 1;
    else if (p.dir === 'up') dy = -1;
    else dy = 1; // down
    return { x: p.x + dx * 12, y: p.y - 3 + dy * 12 };
  }

  function getFacingTile() {
    var pt = getFacingPoint();
    return { tx: Math.floor(pt.x / Farm.CONFIG.TILE), ty: Math.floor(pt.y / Farm.CONFIG.TILE) };
  }

  return {
    update: update,
    draw: draw,
    getFacingPoint: getFacingPoint,
    getFacingTile: getFacingTile
  };
})();
