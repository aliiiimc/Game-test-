// World pixel art: ground tiles, buildings, objects, crops, crop items and tools.
// Every sprite is 16x16. Grids are built in code (helpers below) and passed to Farm.Sprites.define.
(function () {
  var S = Farm.Sprites;

  // Shared palette. '.' is transparent. Light comes from the top-left.
  var P = {
    // outline and grass
    'o': '#3b2a20', 'g': '#5fa83a', 'G': '#4a8a2c', 'l': '#7cc350', 'T': '#2f6b24',
    // flowers, fruit and accents
    'w': '#fff7e6', 'y': '#f5d142', 'r': '#b8382c', '&': '#f08a24', '%': '#8a5cb3', 'X': '#c8661c',
    // path
    'a': '#e3c08c', 'b': '#c9a06a', 'c': '#a77d4c', 's': '#8a6238', 'p': '#efd9ae',
    // untilled soil
    'e': '#94643f', 'f': '#b07c52', 'h': '#6e4628',
    // tilled soil
    'u': '#5a3a22', 'v': '#3a2516', 'x': '#7a5230', 'L': '#8f6440',
    // watered soil
    'm': '#4b2f1c', 'n': '#2f1d11', 'z': '#6a4a33', 'd': '#5f3f26',
    // water
    'W': '#3d8fd6', 'I': '#8fd3f5', 'D': '#2a6aa8',
    // straw and hay, wheat
    'Y': '#f2d56b', 'Z': '#cfa640', 'K': '#fff3b0',
    // light wood
    'F': '#d9a866', 'E': '#b98249', 'R': '#8c5a2e',
    // barn planks and roof
    'M': '#9c3b2c', 'N': '#6f2619', 'O': '#b8604a', 'q': '#8a2320', 'Q': '#d9574c',
    // house slate roof
    'S': '#5b7fa6', 'U': '#3f5f82', 'V': '#86a9cc',
    // house plaster, glass
    'C': '#f1e4c4', 'H': '#d8c7a0', 'J': '#fbf6e6', 'B': '#a8dcf5', 'A': '#4f96c9',
    // stone
    'k': '#b5afa5', 'j': '#8e8880', 'i': '#5f5a54',
    // seed packet blue, metal
    'P': '#4c7fc4', '*': '#dfe6ec', '^': '#8a96a2'
  };

  // ---------- helpers ----------
  function blank() {
    var g = [];
    for (var y = 0; y < 16; y++) {
      var row = [];
      for (var x = 0; x < 16; x++) row.push('.');
      g.push(row);
    }
    return g;
  }
  function px(g, x, y, c) { if (x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = c; }
  function rect(g, x0, y0, x1, y1, c) {
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) px(g, x, y, c);
  }
  function fillAll(g, c) { rect(g, 0, 0, 15, 15, c); }
  // Deterministic pseudo-random value in [0, 1) for speckles.
  function noise(x, y, s) {
    var v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return v - Math.floor(v);
  }
  // Add a 1px dark outline around every opaque pixel (transparent pixels touching the sprite).
  function outline(g) {
    var add = [];
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      if (g[y][x] !== '.') continue;
      var near = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
      for (var i = 0; i < 4; i++) {
        var nx = near[i][0], ny = near[i][1];
        if (nx >= 0 && nx < 16 && ny >= 0 && ny < 16 && g[ny][nx] !== '.') { add.push([x, y]); break; }
      }
    }
    for (var j = 0; j < add.length; j++) g[add[j][1]][add[j][0]] = 'o';
  }
  function out(g) { return g.map(function (r) { return r.join(''); }); }
  function def(name, g) { S.define(name, P, out(g)); }

  // Grass background with sparse darker specks and tufts (tufts kept inside 1..14 so tiles stay seamless).
  function grassBase(g, tufts) {
    fillAll(g, 'g');
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var n = noise(x, y, 1);
      if (n < 0.07) g[y][x] = 'G';
      else if (n > 0.96) g[y][x] = 'l';
    }
    for (var i = 0; i < tufts.length; i++) {
      var t = tufts[i], tx = t[0], ty = t[1];
      px(g, tx, ty - 1, 'G'); px(g, tx - 1, ty, 'G'); px(g, tx, ty, 'G'); px(g, tx + 1, ty, 'G');
    }
  }
  function flower(g, x, y) {
    px(g, x, y, 'y'); px(g, x - 1, y, 'w'); px(g, x + 1, y, 'w'); px(g, x, y - 1, 'w'); px(g, x, y + 1, 'w');
  }
  // Shingled roof: light edge on top of each row, dark edge below, staggered joints.
  function shingles(g, base, dark, light) {
    fillAll(g, base);
    for (var y = 0; y < 16; y++) {
      var band = y % 4;
      for (var x = 0; x < 16; x++) {
        if (band === 0) g[y][x] = light;
        else if (band === 3) g[y][x] = dark;
        else if ((x + 2 * (y >> 2)) % 4 === 0) g[y][x] = dark;
      }
    }
  }
  // Plowed earth: ridge k has a light edge row and a dark shadow row below it, both inside rows 4k..4k+3.
  // Each column's edge wobbles by one row now and then and sometimes breaks, so the lines are not flat
  // planks. Clods are sprinkled on the base colour. Rows wrap at 16, so the tile repeats seamlessly.
  function furrows(g, base, dark, light, clod, rate) {
    fillAll(g, base);
    for (var k = 0; k < 4; k++) for (var x = 0; x < 16; x++) {
      var w = noise(x, k, 11);
      var r = 4 * k + 1 + (w < 0.1 ? -1 : (w > 0.9 ? 1 : 0));
      if (noise(x, k, 12) > 0.08) g[r][x] = light;
      g[r + 1][x] = dark;
    }
    for (var y = 0; y < 16; y++) for (var cx = 0; cx < 16; cx++) {
      if (g[y][cx] === base && noise(cx, y, 7) < rate) g[y][cx] = clod;
    }
  }
  // Vertical plank pattern (period 4 horizontally).
  function planks(g, dark, light, mid) {
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var m = x % 4;
      g[y][x] = m === 0 ? dark : (m === 1 ? light : mid);
    }
  }
  // Seed mound for stage 0 crops: a light-brown heap with bright seeds on top.
  function seedMound(g, dot) {
    rect(g, 7, 12, 8, 12, 'f');
    rect(g, 6, 13, 9, 13, 'f');
    rect(g, 5, 14, 10, 14, 'e');
    px(g, 6, 12, dot); px(g, 9, 12, dot); px(g, 8, 11, dot);
  }

  // ================= GROUND TILES (no outline, tile seamlessly) =================
  var g;

  g = blank();
  grassBase(g, [[3, 4], [11, 3], [6, 9], [13, 10], [3, 13], [9, 12]]);
  def('tile_grass', g);

  g = blank();
  grassBase(g, [[5, 3], [12, 6], [2, 9], [8, 7], [11, 13]]);
  flower(g, 4, 11); flower(g, 10, 4); flower(g, 13, 13);
  def('tile_grass2', g);

  // Dirt path with light speckles and small pebbles.
  g = blank();
  fillAll(g, 'b');
  for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
    var n = noise(x, y, 2);
    if (n < 0.1) g[y][x] = 'c';
    else if (n > 0.93) g[y][x] = 'a';
  }
  var pebbles = [[3, 4], [10, 7], [5, 12], [12, 13]];
  for (var i = 0; i < pebbles.length; i++) {
    var pxp = pebbles[i][0], pyp = pebbles[i][1];
    px(g, pxp, pyp, 'p'); px(g, pxp + 1, pyp, 's'); px(g, pxp, pyp + 1, 's');
  }
  def('tile_path', g);

  // Untilled soil: brown earth with clods.
  g = blank();
  fillAll(g, 'e');
  for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
    n = noise(x, y, 3);
    if (n < 0.14) g[y][x] = 'f';
    else if (n > 0.9) g[y][x] = 'h';
  }
  def('tile_soil', g);

  g = blank();
  furrows(g, 'u', 'v', 'x', 'L', 0.07);
  def('tile_tilled', g);

  g = blank();
  furrows(g, 'm', 'n', 'z', 'd', 0.06);
  // Dark puddle spots.
  [[2, 6], [9, 3], [12, 10], [5, 13]].forEach(function (p) {
    px(g, p[0], p[1], 'n'); px(g, p[0] + 1, p[1], 'n');
  });
  def('tile_watered', g);

  // Pond: blue water with light wave crests.
  g = blank();
  fillAll(g, 'W');
  for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
    if (noise(x, y, 4) < 0.05) g[y][x] = 'D';
  }
  var waves = [[2, 3], [9, 2], [5, 8], [11, 7], [3, 12], [9, 12]];
  for (i = 0; i < waves.length; i++) {
    var wx = waves[i][0], wy = waves[i][1];
    px(g, wx, wy, 'I'); px(g, wx + 1, wy, 'I'); px(g, wx + 2, wy, 'I'); px(g, wx + 1, wy + 1, 'D');
  }
  def('tile_water', g);

  // Straw floor: diagonal strands with period 8 (divides 16, so it tiles).
  g = blank();
  fillAll(g, 'Y');
  for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
    if ((x + y) % 8 === 0) g[y][x] = 'Z';
    else if ((x + y) % 8 === 4) g[y][x] = 'K';
    else if (noise(x, y, 5) < 0.04) g[y][x] = 'Z';
  }
  def('tile_straw', g);

  // ================= FENCES (grass baked in) =================
  g = blank();
  grassBase(g, [[3, 7], [12, 8], [8, 14]]);
  rect(g, 0, 3, 15, 3, 'F'); rect(g, 0, 4, 15, 4, 'E'); rect(g, 0, 5, 15, 5, 'R');
  rect(g, 0, 10, 15, 10, 'F'); rect(g, 0, 11, 15, 11, 'E'); rect(g, 0, 12, 15, 12, 'R');
  def('tile_fence_h', g);

  g = blank();
  grassBase(g, [[2, 4], [13, 11], [3, 13]]);
  for (y = 0; y < 16; y++) {
    px(g, 6, y, 'F'); px(g, 7, y, 'F'); px(g, 8, y, 'E'); px(g, 9, y, 'R');
  }
  def('tile_fence_v', g);

  g = blank();
  grassBase(g, [[2, 9], [12, 12], [4, 3]]);
  rect(g, 0, 4, 5, 4, 'F'); rect(g, 0, 5, 5, 5, 'E');
  rect(g, 10, 4, 15, 4, 'F'); rect(g, 10, 5, 15, 5, 'E');
  rect(g, 6, 1, 9, 15, 'E');
  rect(g, 6, 1, 7, 15, 'F');
  rect(g, 9, 1, 9, 15, 'R');
  rect(g, 5, 1, 10, 2, 'F');
  def('tile_fence_post', g);

  // ================= BARN =================
  g = blank();
  shingles(g, 'r', 'q', 'Q');
  def('tile_roof', g);

  g = blank();
  planks(g, 'N', 'O', 'M');
  def('tile_wall', g);

  // Big wooden barn door with a white X brace (the wall row sits in the middle of the barn).
  g = blank();
  planks(g, 'R', 'F', 'E');
  for (i = 0; i < 16; i++) { px(g, i, 0, 'o'); px(g, i, 15, 'o'); px(g, 0, i, 'o'); px(g, 15, i, 'o'); }
  for (i = 2; i <= 13; i++) {
    px(g, i, i, 'w'); px(g, i + 1, i, 'w');
    px(g, 15 - i, i, 'w'); px(g, 14 - i, i, 'w');
  }
  def('tile_barn_door', g);

  // ================= HOUSE =================
  g = blank();
  shingles(g, 'S', 'U', 'V');
  def('tile_house_roof', g);

  g = blank();
  fillAll(g, 'C');
  for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
    if (noise(x, y, 6) < 0.06) g[y][x] = 'H';
  }
  rect(g, 0, 0, 15, 0, 'J');
  rect(g, 0, 15, 15, 15, 'H');
  def('tile_house_wall', g);

  g = blank();
  fillAll(g, 'C');
  rect(g, 0, 0, 15, 0, 'J');
  rect(g, 0, 15, 15, 15, 'H');
  rect(g, 4, 4, 11, 10, 'w');   // window frame
  rect(g, 5, 5, 10, 9, 'B');    // glass
  rect(g, 5, 5, 6, 5, 'J');     // glass highlight
  rect(g, 9, 5, 10, 9, 'A');    // glass shade
  rect(g, 7, 5, 8, 9, 'w');     // mullions
  rect(g, 5, 7, 10, 7, 'w');
  rect(g, 3, 11, 12, 11, 'F'); // sill
  rect(g, 3, 12, 12, 12, 'E');
  def('tile_house_window', g);

  g = blank();
  fillAll(g, 'C');
  rect(g, 0, 0, 15, 0, 'J');
  rect(g, 0, 15, 15, 15, 'H');
  rect(g, 4, 2, 11, 2, 'o');      // door frame
  rect(g, 4, 3, 4, 15, 'o');
  rect(g, 11, 3, 11, 15, 'o');
  rect(g, 5, 3, 10, 15, 'E');     // door
  for (y = 3; y <= 15; y++) {
    px(g, 5, y, 'F');              // lit edge
  }
  rect(g, 6, 6, 9, 6, 'R');      // panels
  rect(g, 6, 10, 9, 10, 'R');
  px(g, 9, 11, 'Y');             // knob
  def('tile_house_door', g);

  // Round leafy canopy seen from above, trunk peeking out at the bottom.
  g = blank();
  grassBase(g, [[2, 3], [13, 2], [2, 13], [13, 13]]);
  var cx = 7.5, cy = 6.5;
  for (y = 0; y < 16; y++) for (x = 0; x < 16; x++) {
    var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
    if (d > 6.2) continue;
    if (d > 5.2) g[y][x] = 'T';
    else if (dx + dy <= -4) g[y][x] = 'l';
    else if (dx + dy >= 4) g[y][x] = 'G';
    else g[y][x] = 'g';
  }
  rect(g, 7, 13, 8, 15, 'R');
  def('tile_tree', g);

  // ================= OBJECTS (transparent background, outlined) =================
  function trough(full) {
    var g2 = blank();
    rect(g2, 1, 5, 14, 12, 'E');   // front body
    rect(g2, 1, 5, 14, 5, 'F');    // rim
    rect(g2, 2, 6, 13, 7, 'n');    // hollow inside
    rect(g2, 5, 9, 5, 12, 'R');    // boards
    rect(g2, 10, 9, 10, 12, 'R');
    rect(g2, 1, 12, 14, 12, 'R');  // bottom shade
    rect(g2, 2, 13, 3, 14, 'R');   // legs
    rect(g2, 12, 13, 13, 14, 'R');
    if (full) {
      rect(g2, 3, 4, 12, 4, 'Y');  // hay heaped above the rim
      rect(g2, 4, 3, 11, 3, 'K');
      rect(g2, 2, 6, 13, 7, 'Y');
      rect(g2, 2, 6, 13, 6, 'K');
      px(g2, 4, 7, 'Z'); px(g2, 9, 7, 'Z'); px(g2, 12, 7, 'Z');
    }
    outline(g2);
    return g2;
  }
  def('obj_trough_empty', trough(false));
  def('obj_trough_full', trough(true));

  // Stone well with a small wooden roof and crank.
  g = blank();
  rect(g, 4, 0, 11, 0, 'E');
  rect(g, 2, 1, 13, 1, 'E');
  rect(g, 2, 2, 13, 2, 'R');
  rect(g, 3, 3, 3, 5, 'R');
  rect(g, 12, 3, 12, 5, 'R');
  rect(g, 7, 3, 8, 3, 'F');
  px(g, 8, 4, 'R');
  for (y = 6; y <= 15; y++) for (x = 1; x <= 14; x++) {
    var ex = (x - 7.5) / 6.5, ey = (y - 10.5) / 4.6;
    if (ex * ex + ey * ey > 1) continue;
    g[y][x] = y < 10 ? 'k' : (y > 13 ? 'i' : 'j');
  }
  for (y = 7; y <= 14; y++) for (x = 2; x <= 13; x++) {
    var ix = (x - 7.5) / 4.8, iy = (y - 10.5) / 3;
    if (ix * ix + iy * iy <= 1) g[y][x] = 'D';
  }
  px(g, 5, 9, 'I'); px(g, 6, 9, 'I');
  outline(g);
  def('obj_well', g);

  // Wooden shipping crate with a lid.
  g = blank();
  rect(g, 1, 4, 14, 5, 'F');
  rect(g, 1, 6, 14, 6, 'R');
  rect(g, 2, 7, 13, 14, 'E');
  rect(g, 2, 9, 13, 9, 'R');
  rect(g, 2, 12, 13, 12, 'R');
  rect(g, 5, 7, 5, 14, 'R');
  rect(g, 10, 7, 10, 14, 'R');
  px(g, 3, 8, 'F'); px(g, 6, 13, 'F');
  rect(g, 7, 6, 8, 6, 'Y');
  outline(g);
  def('obj_bin', g);

  // Market stall: red/white striped awning, wooden counter, produce.
  g = blank();
  for (y = 0; y <= 3; y++) for (x = 1; x <= 14; x++) g[y][x] = ((x >> 1) % 2 === 0) ? 'r' : 'w';
  for (x = 1; x <= 14; x++) if (x % 2 === 1) g[4][x] = 'r';
  rect(g, 2, 5, 2, 14, 'R');
  rect(g, 13, 5, 13, 14, 'R');
  rect(g, 3, 9, 12, 14, 'E');
  rect(g, 3, 9, 12, 9, 'F');
  rect(g, 3, 14, 12, 14, 'R');
  rect(g, 6, 10, 6, 13, 'R');
  rect(g, 9, 10, 9, 13, 'R');
  px(g, 4, 8, '&'); px(g, 6, 8, 'r'); px(g, 8, 8, 'y'); px(g, 10, 8, 'g'); px(g, 11, 8, '%');
  outline(g);
  def('obj_shop', g);

  // ================= CROPS (transparent, outlined, drawn over tilled soil) =================
  // Crops are written as text rows: y0 is the top row, '.' is transparent. Bases sit on rows 13-15.
  function art(y0, rows) {
    var a = blank();
    for (var r = 0; r < rows.length; r++) for (var x = 0; x < 16; x++) {
      var c = rows[r].charAt(x);
      if (c !== '.') a[y0 + r][x] = c;
    }
    outline(a);
    return a;
  }
  // Stage 0 (all crops): seed mound with bright dots, outlined.
  function cropStage0(dot) {
    var c = blank();
    seedMound(c, dot);
    outline(c);
    return c;
  }
  // Stage 1 (all crops): two bright leaves in a V over a short stem.
  var SPROUT = [
    '....lg....gl....',
    '.....gl..lg.....',
    '......gGGg......',
    '.......GG.......',
    '.......GG.......'
  ];

  // Wheat
  def('crop_wheat_0', cropStage0('K'));
  def('crop_wheat_1', art(10, SPROUT));
  def('crop_wheat_2', art(6, [
    '.......ll.......',
    '.....lllgll.....',
    '.....lglglg.....',
    '...lllglglgll...',
    '...lglglglglg...',
    '...glglglglgl...',
    '...gGgGgGgGgG...',
    '...gGgGgGgGgG...',
    '...GGGGGGGGGG...'
  ]));
  def('crop_wheat_3', art(2, [
    '.......KK.......',
    '.....KKYZKK.....',
    '...KKYZYZYZKK...',
    '...YZYZYZYZYZ...',
    '...YZYZYZYZYZ...',
    '...ZZZZZZZZZZ...',
    '....Z.Z.Z.Z.....',
    '...GZ.Z.Z.ZG....',
    '...GZ.Z.Z.ZG....',
    '.....GZZZZG.....',
    '.....gGZZGg.....',
    '......gGGg......',
    '.......GG.......'
  ]));

  // Corn
  def('crop_corn_0', cropStage0('y'));
  def('crop_corn_1', art(10, SPROUT));
  def('crop_corn_2', art(6, [
    '.......lg.......',
    '.......gG.......',
    '....gllGGllg....',
    '...gllgGGgllg...',
    '....glgGGglg....',
    '.....ggGGgg.....',
    '....gGGGGGGg....',
    '.......GG.......',
    '.......GG.......'
  ]));
  def('crop_corn_3', art(1, [
    '.......Z........',
    '.......gG.......',
    '......ggGg......',
    '.....glgGg......',
    '....glggGYyyg...',
    '...glgggGYyyg...',
    '.......gGYyyg...',
    '.......gGgyyg...',
    '....gyygGgl.....',
    '...gYyygGgl.....',
    '...gYyygGgl.....',
    '....gygGGg......',
    '.....gGGG.......',
    '.......GG.......'
  ]));

  // Carrot
  def('crop_carrot_0', cropStage0('l'));
  def('crop_carrot_1', art(10, SPROUT));
  def('crop_carrot_2', art(6, [
    '.......l........',
    '......lgl.......',
    '.....glglg......',
    '....lglglgl.....',
    '....glgGglg.....',
    '.....glglg......',
    '......gGg.......',
    '.......G........',
    '.......G........'
  ]));
  def('crop_carrot_3', art(1, [
    '.......ll.......',
    '......gllg......',
    '.....glGGlg.....',
    '....glgGGglg....',
    '...glglGGlglg...',
    '...gglgGGglgg...',
    '....glgGGglg....',
    '....gglGGlgg....',
    '.....glGGlg.....',
    '......gGGg......',
    '......&&&X......',
    '.....&&&&&X.....',
    '.....&&&&XX.....',
    '......&&&X......',
    '.......XX.......'
  ]));

  // ================= ITEMS (transparent, outlined, ~10-12px) =================
  // Golden wheat bundle tied with twine.
  g = blank();
  rect(g, 6, 2, 9, 4, 'Y');
  px(g, 7, 2, 'K'); px(g, 8, 2, 'K');
  rect(g, 5, 5, 10, 13, 'Y');
  rect(g, 5, 5, 5, 13, 'K');
  rect(g, 10, 5, 10, 13, 'Z');
  rect(g, 5, 9, 10, 9, 'E');
  px(g, 7, 10, 'E'); px(g, 8, 10, 'E');
  outline(g);
  def('item_wheat', g);

  // Yellow corn cob with green husk.
  g = blank();
  for (y = 3; y <= 14; y++) for (x = 4; x <= 11; x++) {
    var ax = (x - 7.5) / 4, ay = (y - 8.5) / 6;
    if (ax * ax + ay * ay <= 1) g[y][x] = 'y';
  }
  for (y = 4; y <= 13; y++) for (x = 4; x <= 11; x++) {
    if (g[y][x] === 'y' && noise(x, y, 8) < 0.2) g[y][x] = 'Y';
  }
  for (y = 9; y <= 14; y++) for (x = 3; x <= 11; x++) {
    if (g[y][x] !== '.' && (x <= 6 || (x >= 10 && y >= 11))) {
      if (noise(x, y, 9) < 0.7) g[y][x] = 'l';
    }
  }
  px(g, 7, 2, 'g'); px(g, 8, 2, 'g'); px(g, 6, 3, 'g'); px(g, 9, 3, 'g');
  outline(g);
  def('item_corn', g);

  // Orange carrot with leafy green top.
  g = blank();
  for (y = 6; y <= 14; y++) {
    var cw = Math.round((14 - y) / 2.2);
    if (cw > 0) rect(g, 8 - cw, y, 7 + cw, y, '&');
  }
  rect(g, 6, 10, 9, 10, 'R');
  px(g, 6, 7, 'y');
  rect(g, 6, 4, 9, 4, 'g');
  px(g, 5, 3, 'l'); px(g, 7, 3, 'l'); px(g, 9, 3, 'l'); px(g, 10, 3, 'l'); px(g, 8, 2, 'l');
  px(g, 8, 5, 'G'); px(g, 7, 5, 'G');
  outline(g);
  def('item_carrot', g);

  // Seed packets: each has its own colour and a tiny picture of the crop.
  g = blank();
  rect(g, 3, 2, 12, 13, 'C');
  rect(g, 3, 2, 12, 3, 'E');
  rect(g, 7, 7, 7, 12, 'Z');
  rect(g, 6, 5, 8, 6, 'Y');
  px(g, 7, 4, 'K');
  rect(g, 4, 13, 11, 13, 'H');
  outline(g);
  def('item_seed_wheat', g);

  g = blank();
  rect(g, 3, 2, 12, 13, 'P');
  rect(g, 3, 2, 12, 3, 'U');
  rect(g, 6, 6, 9, 11, 'y');
  px(g, 5, 10, 'l'); px(g, 5, 11, 'l'); px(g, 10, 10, 'l');
  rect(g, 4, 13, 11, 13, 'w');
  outline(g);
  def('item_seed_corn', g);

  g = blank();
  rect(g, 3, 2, 12, 13, 'l');
  rect(g, 3, 2, 12, 3, 'G');
  for (y = 7; y <= 12; y++) {
    var pw = Math.round((12 - y) / 2);
    if (pw > 0) rect(g, 7 - pw, y, 8 + pw, y, '&');
  }
  px(g, 7, 5, 'G'); px(g, 8, 5, 'G'); px(g, 6, 4, 'G'); px(g, 9, 4, 'G');
  px(g, 5, 13, 'w'); px(g, 6, 13, 'w');
  outline(g);
  def('item_seed_carrot', g);

  // Hay bale with twine.
  g = blank();
  rect(g, 2, 4, 13, 12, 'Y');
  rect(g, 2, 4, 13, 4, 'K');
  rect(g, 2, 12, 13, 12, 'Z');
  for (y = 5; y <= 11; y++) for (x = 2; x <= 13; x++) {
    var nn = noise(x, y, 10);
    if (nn < 0.12) g[y][x] = 'Z';
    else if (nn > 0.94) g[y][x] = 'K';
  }
  rect(g, 5, 4, 5, 12, 'E');
  rect(g, 10, 4, 10, 12, 'E');
  outline(g);
  def('item_feed', g);

  // ================= TOOLS (transparent, outlined) =================
  // Hoe: wooden handle on a diagonal, grey metal blade at the top right.
  g = blank();
  for (var t = 0; t <= 8; t++) {
    px(g, 3 + t, 12 - t, 'E');
    px(g, 4 + t, 12 - t, 'R');
  }
  rect(g, 10, 1, 14, 3, '*');
  rect(g, 10, 3, 14, 3, '^');
  px(g, 14, 2, '^');
  outline(g);
  def('tool_hoe', g);

  // Green watering can with handle, spout and rose.
  g = blank();
  rect(g, 3, 7, 11, 14, 'g');
  rect(g, 3, 7, 11, 7, 'G');
  rect(g, 4, 8, 4, 13, 'l');
  rect(g, 10, 8, 10, 13, 'G');
  px(g, 5, 6, 'G'); px(g, 6, 5, 'G'); px(g, 7, 5, 'G'); px(g, 8, 5, 'G'); px(g, 9, 6, 'G');
  px(g, 12, 10, 'G'); px(g, 13, 9, 'G'); px(g, 14, 8, 'G');
  rect(g, 14, 6, 15, 7, 'G');
  outline(g);
  def('tool_can', g);
})();
