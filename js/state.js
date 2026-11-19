// Farmer Simulator — game state, save/load and day cycle (Farm.Game).
// Classic script: only defines Farm.Game at load time. Other modules are used lazily.
window.Farm = window.Farm || {};

Farm.Game = (function () {
  var SAVE_KEY = 'farmsim_save_v1';
  var current = null; // the live state object (exposed through Farm.Game.state)
  var ending = false; // guards the end-of-day processing against re-entry

  function toast(m) { if (Farm.UI && Farm.UI.toast) Farm.UI.toast(m); }
  function cfg() { return Farm.CONFIG; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function num(v, def) { return (typeof v === 'number' && isFinite(v)) ? v : def; }

  function storage() {
    try { return window.localStorage || null; } catch (e) { return null; }
  }

  function emptyStats() {
    return { soldToday: 0, plantedToday: 0, harvestedToday: 0 };
  }

  // Every ITEMS key present, integer >= 0. Unknown keys are dropped.
  function makeInventory(src) {
    var inv = {};
    var ITEMS = cfg().ITEMS;
    Object.keys(ITEMS).forEach(function (k) {
      var v = src ? src[k] : 0;
      inv[k] = (typeof v === 'number' && v >= 0) ? Math.floor(v) : 0;
    });
    return inv;
  }

  function makePlots() {
    var F = cfg().FIELD, plots = [];
    for (var ty = F.y; ty < F.y + F.h; ty++) {
      for (var tx = F.x; tx < F.x + F.w; tx++) {
        plots.push({ tx: tx, ty: ty, tilled: false, crop: null, daysGrown: 0, watered: false });
      }
    }
    return plots;
  }

  function makePens() {
    return cfg().PENS.map(function (p) { return { id: p.id, troughFull: false }; });
  }

  function makeAnimals() {
    var C = cfg(), animals = [];
    C.PENS.forEach(function (pen) {
      var r = C.penInterior(pen);
      var names = C.ANIMAL_NAMES[pen.type] || [];
      var typeName = C.ANIMALS[pen.type] ? C.ANIMALS[pen.type].name : pen.type;
      for (var i = 0; i < pen.count; i++) {
        animals.push({
          id: pen.id + '_' + i,
          type: pen.type,
          pen: pen.id,
          name: names[i] || (typeName + ' ' + (i + 1)),
          x: r.x0 + Math.random() * (r.x1 - r.x0),
          y: r.y0 + Math.random() * (r.y1 - r.y0),
          dir: 'right',
          frame: 0,
          moving: false,
          targetX: null,
          targetY: null,
          waitTimer: Math.random() * 2,
          hasProduct: pen.type === 'chicken',
          petted: false,
          happiness: 50,
          heartTimer: 0,
          animTimer: 0,
        });
      }
    });
    return animals;
  }

  function makePlayer() {
    var sp = cfg().PLAYER_SPAWN;
    return { x: sp.x, y: sp.y, dir: 'down', frame: 0, moving: false, animTimer: 0 };
  }

  function newGame() {
    var C = cfg();
    current = {
      day: 1,
      minutes: C.DAY_START,
      money: C.START_MONEY,
      energy: C.MAX_ENERGY,
      water: C.WATER_MAX,
      selectedSlot: 0,
      inventory: makeInventory(C.START_INVENTORY),
      plots: makePlots(),
      pens: makePens(),
      animals: makeAnimals(),
      player: makePlayer(),
      tasks: [],
      stats: emptyStats(),
      allTasksDone: false,
    };
    return current;
  }

  function startDay() {
    var s = current;
    if (!s) return;
    s.stats = emptyStats();
    s.allTasksDone = false;
    s.tasks = (Farm.Tasks && Farm.Tasks.generate) ? Farm.Tasks.generate(s) : [];
    save();
    if (Farm.UI && Farm.UI.showMorning) Farm.UI.showMorning(s);
  }

  function penState(s, id) {
    for (var i = 0; i < s.pens.length; i++) if (s.pens[i].id === id) return s.pens[i];
    return null;
  }

  function sleep(passedOut) {
    var s = current;
    if (!s || ending) return;
    ending = true;
    try {
      var C = cfg();

      // Animals: fed -> happier + product; unfed -> unhappier. Petting resets.
      s.animals.forEach(function (a) {
        var ps = penState(s, a.pen);
        if (ps && ps.troughFull) {
          a.happiness = clamp(a.happiness + 5, 0, 100);
          a.hasProduct = true;
        } else {
          a.happiness = clamp(a.happiness - 10, 0, 100);
        }
        a.petted = false;
        a.moving = false;
        a.targetX = null;
        a.targetY = null;
      });

      // Troughs are emptied.
      s.pens.forEach(function (ps) { ps.troughFull = false; });

      // Crops grow when watered; watering resets.
      s.plots.forEach(function (p) {
        if (p.crop && p.watered && !C.isRipe(p)) p.daysGrown++;
        p.watered = false;
      });

      // Energy and money.
      var lost = 0;
      if (passedOut) {
        s.energy = Math.floor(C.MAX_ENERGY / 2);
        lost = Math.min(50, Math.floor(s.money * 0.1));
        s.money -= lost;
      } else {
        s.energy = C.MAX_ENERGY;
      }

      s.day += 1;
      s.minutes = C.DAY_START;
      s.player = makePlayer();

      if (passedOut) {
        toast('Vous vous êtes évanoui de fatigue… (-' + lost + ' $)');
      }
    } finally {
      ending = false;
    }
    startDay();
  }

  function advanceTime(dt) {
    var s = current;
    if (!s || ending) return;
    var C = cfg();
    s.minutes += dt * C.MINUTES_PER_SECOND;
    if (s.minutes >= C.DAY_END) {
      s.minutes = C.DAY_END;
      sleep(true);
    }
  }

  function save() {
    if (!current) return false;
    try {
      var st = storage();
      if (!st) return false;
      st.setItem(SAVE_KEY, JSON.stringify(current));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var st = storage();
      if (!st) return false;
      var raw = st.getItem(SAVE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || typeof data.day !== 'number' ||
          !Array.isArray(data.plots) || !Array.isArray(data.animals)) {
        return false;
      }

      var C = cfg();
      data.inventory = makeInventory(data.inventory);
      data.minutes = num(data.minutes, C.DAY_START);
      data.money = num(data.money, C.START_MONEY);
      data.energy = num(data.energy, C.MAX_ENERGY);
      data.water = num(data.water, C.WATER_MAX);
      data.selectedSlot = (typeof data.selectedSlot === 'number' &&
        data.selectedSlot >= 0 && data.selectedSlot < C.HOTBAR.length) ? data.selectedSlot : 0;

      // Pens: one entry per CONFIG.PENS id, in config order.
      var oldPens = Array.isArray(data.pens) ? data.pens : [];
      data.pens = C.PENS.map(function (p) {
        for (var i = 0; i < oldPens.length; i++) {
          if (oldPens[i] && oldPens[i].id === p.id) {
            return { id: p.id, troughFull: !!oldPens[i].troughFull };
          }
        }
        return { id: p.id, troughFull: false };
      });

      if (!data.player || typeof data.player !== 'object') data.player = makePlayer();
      if (!Array.isArray(data.tasks)) data.tasks = [];
      if (!data.stats || typeof data.stats !== 'object') data.stats = emptyStats();
      data.allTasksDone = !!data.allTasksDone;

      current = data;
      return true;
    } catch (e) {
      return false;
    }
  }

  function init() {
    if (!load()) {
      newGame();
      startDay();
    } else {
      if (!current.tasks.length && Farm.Tasks && Farm.Tasks.generate) {
        current.tasks = Farm.Tasks.generate(current);
      }
      toast('Partie chargée — Jour ' + current.day);
    }
  }

  function reset() {
    try {
      var st = storage();
      if (st) st.removeItem(SAVE_KEY);
    } catch (e) { /* ignore */ }
    newGame();
    startDay();
  }

  function getPlot(tx, ty) {
    if (!current) return null;
    for (var i = 0; i < current.plots.length; i++) {
      var p = current.plots[i];
      if (p.tx === tx && p.ty === ty) return p;
    }
    return null;
  }

  function useEnergy(n) {
    if (!current) return false;
    if (current.energy < n) {
      toast('Trop fatigué… allez dormir.');
      return false;
    }
    current.energy -= n;
    return true;
  }

  function addItem(key, n) {
    if (!current) return false;
    n = (n === undefined) ? 1 : n;
    if (!(n > 0)) return false;
    current.inventory[key] = (current.inventory[key] || 0) + n;
    return true;
  }

  function removeItem(key, n) {
    if (!current) return false;
    n = (n === undefined) ? 1 : n;
    var have = current.inventory[key] || 0;
    if (!(n > 0) || have < n) return false;
    current.inventory[key] = have - n;
    return true;
  }

  var api = {
    init: init,
    newGame: newGame,
    startDay: startDay,
    sleep: sleep,
    advanceTime: advanceTime,
    save: save,
    load: load,
    reset: reset,
    getPlot: getPlot,
    useEnergy: useEnergy,
    addItem: addItem,
    removeItem: removeItem,
  };

  // Farm.Game.state always returns the current state object.
  Object.defineProperty(api, 'state', {
    enumerable: true,
    configurable: true,
    get: function () { return current; },
    set: function (v) { current = v; },
  });

  return api;
})();
