// Sprite engine: pixel art defined in code as strings + palette, pre-rendered to offscreen canvases.
window.Farm = window.Farm || {};

Farm.Sprites = (function () {
  var cache = {};
  var warned = {};

  // palette: { 'k': '#2b1d14', 'w': '#ffffff', ... }  — '.' and ' ' are transparent.
  // rows: array of equal-length strings, one char = one pixel.
  function define(name, palette, rows) {
    var h = rows.length, w = rows[0].length;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      var row = rows[y];
      if (row.length !== w) console.warn('[sprites] ' + name + ': row ' + y + ' has length ' + row.length + ', expected ' + w);
      for (var x = 0; x < row.length; x++) {
        var ch = row[x];
        if (ch === '.' || ch === ' ') continue;
        var col = palette[ch];
        if (!col) { console.warn('[sprites] ' + name + ': unknown palette char "' + ch + '"'); continue; }
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    cache[name] = c;
    return c;
  }

  function has(name) { return !!cache[name]; }
  function get(name) { return cache[name] || null; }

  // Draw at integer pixel position (top-left). flip = mirror horizontally.
  function draw(ctx, name, x, y, flip) {
    var c = cache[name];
    x = Math.round(x); y = Math.round(y);
    if (!c) {
      if (!warned[name]) { console.warn('[sprites] missing sprite: ' + name); warned[name] = true; }
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(x, y, 16, 16);
      return;
    }
    if (flip) {
      ctx.save();
      ctx.translate(x + c.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(c, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(c, x, y);
    }
  }

  // PNG data URL scaled up (for DOM <img> in the UI). Pixelated scaling.
  function dataURL(name, scale) {
    var c = cache[name];
    if (!c) return '';
    scale = scale || 3;
    var o = document.createElement('canvas');
    o.width = c.width * scale; o.height = c.height * scale;
    var g = o.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(c, 0, 0, o.width, o.height);
    return o.toDataURL();
  }

  function list() { return Object.keys(cache); }

  return { define: define, has: has, get: get, draw: draw, dataURL: dataURL, list: list };
})();
