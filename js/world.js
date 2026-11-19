// Farm.World: the tile map (ground sprites, solidity, objects) built once from Farm.CONFIG, and its drawing.
window.Farm = window.Farm || {};

Farm.World = (function () {
  var api = {
    ground: null,    // ground[ty][tx] = sprite name (base layer, plots not included)
    objects: [],     // [{ type: 'trough'|'well'|'bin'|'shop'|'door', tx, ty, pen? }]
    init: init,
    getObjectAt: getObjectAt,
    isSolidTile: isSolidTile,
    isBlockedRect: isBlockedRect,
    drawGround: drawGround,
    drawObjects: drawObjects
  };

  var solid = null;    // solid[ty][tx] = boolean
  var objGrid = null;  // objGrid[ty][tx] = object or null

  var GRASS = 'tile_grass';
  var GRASS2 = 'tile_grass2';

  // Deterministic integer hash of a tile (the map must not depend on Math.random).
  function hash(tx, ty) {
    var h = Math.imul(tx, 73856093) ^ Math.imul(ty, 19349663);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
    return h >>> 0;
  }

  function grassAt(tx, ty) {
    return hash(tx, ty) % 8 === 0 ? GRASS2 : GRASS;
  }

  function isGrass(name) {
    return name === GRASS || name === GRASS2;
  }

  function inBounds(tx, ty) {
    var C = Farm.CONFIG;
    return tx >= 0 && ty >= 0 && tx < C.MAP_W && ty < C.MAP_H;
  }

  function init() {
    var C = Farm.CONFIG;
    var W = C.MAP_W, H = C.MAP_H;
    var ground = [];
    var objects = [];
    solid = [];
    objGrid = [];
    var tx, ty;

    for (ty = 0; ty < H; ty++) {
      ground.push([]);
      solid.push([]);
      objGrid.push([]);
      for (tx = 0; tx < W; tx++) {
        ground[ty].push(grassAt(tx, ty));
        solid[ty].push(false);
        objGrid[ty].push(null);
      }
    }

    // Set a ground sprite and its solidity.
    function put(x, y, sprite, isSolid) {
      if (!inBounds(x, y)) return;
      ground[y][x] = sprite;
      solid[y][x] = !!isSolid;
    }

    // Dirt path, only over plain grass.
    function paint(x, y) {
      if (inBounds(x, y) && isGrass(ground[y][x])) {
        ground[y][x] = 'tile_path';
        solid[y][x] = false;
      }
    }

    // Every object is solid and occupies its tile.
    function addObject(type, x, y, pen) {
      var o = { type: type, tx: x, ty: y };
      if (pen) o.pen = pen;
      objects.push(o);
      objGrid[y][x] = o;
      solid[y][x] = true;
    }

    // 1. Border ring of trees.
    for (tx = 0; tx < W; tx++) {
      put(tx, 0, 'tile_tree', true);
      put(tx, H - 1, 'tile_tree', true);
    }
    for (ty = 0; ty < H; ty++) {
      put(0, ty, 'tile_tree', true);
      put(W - 1, ty, 'tile_tree', true);
    }

    // 2. Paths: horizontal rows x = 1..W-2, vertical columns y = 6..19 (from the config comment).
    C.PATH_ROWS.forEach(function (row) {
      for (var x = 1; x <= W - 2; x++) paint(x, row);
    });
    C.PATH_COLS.forEach(function (col) {
      for (var y = 6; y <= 19; y++) paint(col, y);
    });

    // 3. Connector from the tile just outside each pen gate to the nearest path row.
    C.PENS.forEach(function (pen) {
      var gate = C.penGate(pen);
      var start = gate.ty + 1;
      var best = null;
      C.PATH_ROWS.forEach(function (r) {
        if (best === null || Math.abs(r - start) < Math.abs(best - start)) best = r;
      });
      if (best === null) return;
      var step = best >= start ? 1 : -1;
      for (var y = start; ; y += step) {
        paint(gate.tx, y);
        if (y === best) break;
      }
    });

    // 4. House: roof rows, wall rows, windows on the bottom row, door tile, all solid.
    var Hs = C.HOUSE;
    for (ty = Hs.y; ty < Hs.y + Hs.h; ty++) {
      for (tx = Hs.x; tx < Hs.x + Hs.w; tx++) {
        var s = ty < Hs.y + 2 ? 'tile_house_roof' : 'tile_house_wall';
        if (ty === Hs.y + Hs.h - 1 && (tx === Hs.x + 1 || tx === Hs.x + Hs.w - 2)) {
          s = 'tile_house_window';
        }
        if (tx === Hs.door.x && ty === Hs.door.y) s = 'tile_house_door';
        put(tx, ty, s, true);
      }
    }
    addObject('door', Hs.door.x, Hs.door.y);

    // 5. Pens (coop and barns), layout as in the config comment.
    C.PENS.forEach(function (pen) {
      var x0 = pen.x, y0 = pen.y;
      var x1 = pen.x + pen.w - 1, y1 = pen.y + pen.h - 1;
      var doorX = pen.x + Math.floor(pen.w / 2);
      var gate = C.penGate(pen);

      // roof row and wall row (barn door in the middle column)
      for (tx = x0; tx <= x1; tx++) {
        put(tx, y0, 'tile_roof', true);
        put(tx, y0 + 1, tx === doorX ? 'tile_barn_door' : 'tile_wall', true);
      }
      // side fences
      for (ty = y0 + 2; ty <= y1 - 1; ty++) {
        put(x0, ty, 'tile_fence_v', true);
        put(x1, ty, 'tile_fence_v', true);
      }
      // bottom row: corner posts, fence, and the walkable gate gap
      for (tx = x0; tx <= x1; tx++) {
        if (tx === x0 || tx === x1) put(tx, y1, 'tile_fence_post', true);
        else if (tx === gate.tx) put(tx, y1, 'tile_path', false);
        else put(tx, y1, 'tile_fence_h', true);
      }
      // interior: straw for the coop, grass for barns
      for (ty = y0 + 2; ty <= y1 - 1; ty++) {
        for (tx = x0 + 1; tx <= x1 - 1; tx++) {
          put(tx, ty, pen.type === 'chicken' ? 'tile_straw' : grassAt(tx, ty), false);
        }
      }
      var trough = C.penTrough(pen);
      addObject('trough', trough.tx, trough.ty, pen.id);
    });

    // 6. Fields: untilled soil, walkable.
    var F = C.FIELD;
    for (ty = F.y; ty < F.y + F.h; ty++) {
      for (tx = F.x; tx < F.x + F.w; tx++) put(tx, ty, 'tile_soil', false);
    }

    // 7. Pond: solid water.
    var P = C.POND;
    for (ty = P.y; ty < P.y + P.h; ty++) {
      for (tx = P.x; tx < P.x + P.w; tx++) put(tx, ty, 'tile_water', true);
    }

    // 8. Shop, shipping bin, well: objects over grass.
    addObject('shop', C.SHOP.x, C.SHOP.y);
    addObject('bin', C.BIN.x, C.BIN.y);
    addObject('well', C.WELL.x, C.WELL.y);

    // 9. Decorative trees on plain grass, with a 1-tile margin around everything else,
    //    never within 2 tiles of the player spawn. Each new tree also blocks its 3x3 area,
    //    so trees stay isolated and never cut the walkable space.
    var blocked = [];
    for (ty = 0; ty < H; ty++) {
      blocked.push([]);
      for (tx = 0; tx < W; tx++) blocked[ty].push(false);
    }
    function block(x, y, r) {
      for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
          var bx = x + dx, by = y + dy;
          if (inBounds(bx, by)) blocked[by][bx] = true;
        }
      }
    }
    for (ty = 0; ty < H; ty++) {
      for (tx = 0; tx < W; tx++) {
        if (!isGrass(ground[ty][tx]) || solid[ty][tx] || objGrid[ty][tx]) block(tx, ty, 1);
      }
    }
    var spawnTx = Math.floor(C.PLAYER_SPAWN.x / C.TILE);
    var spawnTy = Math.floor(C.PLAYER_SPAWN.y / C.TILE);
    block(spawnTx, spawnTy, 2);

    var cands = [];
    for (ty = 0; ty < H; ty++) {
      for (tx = 0; tx < W; tx++) {
        if (!blocked[ty][tx]) cands.push({ tx: tx, ty: ty, h: hash(tx, ty) });
      }
    }
    cands.sort(function (a, b) { return a.h - b.h || a.ty - b.ty || a.tx - b.tx; });
    var placed = 0;
    for (var i = 0; i < cands.length && placed < 15; i++) {
      var c = cands[i];
      if (blocked[c.ty][c.tx]) continue;
      put(c.tx, c.ty, 'tile_tree', true);
      block(c.tx, c.ty, 1);
      placed++;
    }

    api.ground = ground;
    api.objects = objects;
  }

  function getObjectAt(tx, ty) {
    if (!objGrid || !inBounds(tx, ty)) return null;
    return objGrid[ty][tx];
  }

  function isSolidTile(tx, ty) {
    if (!solid || !inBounds(tx, ty)) return true;
    return solid[ty][tx];
  }

  // True if the world-pixel rect overlaps any solid tile.
  function isBlockedRect(x, y, w, h) {
    var T = Farm.CONFIG.TILE;
    var tx0 = Math.floor(x / T), ty0 = Math.floor(y / T);
    var tx1 = Math.floor((x + w - 0.01) / T), ty1 = Math.floor((y + h - 0.01) / T);
    for (var ty = ty0; ty <= ty1; ty++) {
      for (var tx = tx0; tx <= tx1; tx++) {
        if (isSolidTile(tx, ty)) return true;
      }
    }
    return false;
  }

  function getPlot(tx, ty) {
    if (!Farm.Game || typeof Farm.Game.getPlot !== 'function') return null;
    return Farm.Game.getPlot(tx, ty) || null;
  }

  function findPenState(id) {
    var st = Farm.Game && Farm.Game.state;
    if (!st || !st.pens) return null;
    for (var i = 0; i < st.pens.length; i++) {
      if (st.pens[i].id === id) return st.pens[i];
    }
    return null;
  }

  function drawGround(ctx, cam) {
    if (!api.ground) return;
    var C = Farm.CONFIG, T = C.TILE;
    var tx0 = Math.max(0, Math.floor(cam.x / T));
    var tx1 = Math.min(C.MAP_W - 1, Math.floor((cam.x + C.VIEW_W - 1) / T));
    var ty0 = Math.max(0, Math.floor(cam.y / T));
    var ty1 = Math.min(C.MAP_H - 1, Math.floor((cam.y + C.VIEW_H - 1) / T));

    for (var ty = ty0; ty <= ty1; ty++) {
      for (var tx = tx0; tx <= tx1; tx++) {
        var name = api.ground[ty][tx];
        var plot = null;
        if (name === 'tile_soil') {
          plot = getPlot(tx, ty);
          if (plot && plot.tilled) name = plot.watered ? 'tile_watered' : 'tile_tilled';
        }
        var px = tx * T - cam.x, py = ty * T - cam.y;
        Farm.Sprites.draw(ctx, name, px, py, false);
        if (plot && plot.crop) {
          var stage = C.cropStage(plot);
          if (stage >= 0) Farm.Sprites.draw(ctx, 'crop_' + plot.crop + '_' + stage, px, py, false);
        }
      }
    }
  }

  function drawObjects(ctx, cam) {
    var C = Farm.CONFIG, T = C.TILE;
    var objects = api.objects || [];
    for (var i = 0; i < objects.length; i++) {
      var o = objects[i];
      var name = null;
      switch (o.type) {
        case 'trough':
          var pen = findPenState(o.pen);
          name = pen && pen.troughFull ? 'obj_trough_full' : 'obj_trough_empty';
          break;
        case 'well': name = 'obj_well'; break;
        case 'bin': name = 'obj_bin'; break;
        case 'shop': name = 'obj_shop'; break;
        default: name = null; // door: nothing extra drawn
      }
      if (!name) continue;
      var px = o.tx * T - cam.x, py = o.ty * T - cam.y;
      if (px + T <= 0 || py + T <= 0 || px >= C.VIEW_W || py >= C.VIEW_H) continue;
      Farm.Sprites.draw(ctx, name, px, py, false);
    }
  }

  return api;
})();
