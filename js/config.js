// Farmer Simulator — shared configuration (the contract every module reads).
// Classic script (no ES modules) so the game runs from file:// without a server.
window.Farm = window.Farm || {};

Farm.CONFIG = {
  TILE: 16,                 // logical pixels per tile
  MAP_W: 40, MAP_H: 30,     // map size in tiles
  VIEW_W: 480, VIEW_H: 320, // canvas internal resolution (30 x 20 tiles)

  // ---- Time ----
  DAY_START: 360,           // 06:00 in game minutes
  DAY_END: 1440,            // 24:00 -> farmer passes out
  MINUTES_PER_SECOND: 4,    // 1 real second = 4 game minutes (~4.5 min per day)
  NIGHT_START: 1080,        // 18:00 sky starts darkening

  // ---- Player ----
  PLAYER_SPEED: 60,         // px per second
  PLAYER_SPAWN: { x: 4 * 16 + 8, y: 6 * 16 + 14 }, // feet position (pixels), just below the house door
  MAX_ENERGY: 100,
  WATER_MAX: 20,            // watering can capacity
  ENERGY_COST: { till: 3, plant: 1, water: 2, harvest: 1, feed: 2, collect: 1, pet: 0 },

  START_MONEY: 200,
  START_INVENTORY: {
    seed_wheat: 5, seed_corn: 0, seed_carrot: 5, feed: 12,
    wheat: 0, corn: 0, carrot: 0,
    egg: 0, milk: 0, truffle: 0, wool: 0, goat_milk: 0,
  },

  // ---- Items (inventory keys) ----
  // buy > 0 : sold in the shop. sell > 0 : can be sold in the shipping bin.
  ITEMS: {
    seed_wheat:  { name: 'Graines de blé',     sprite: 'item_seed_wheat',  buy: 10, sell: 0 },
    seed_corn:   { name: 'Graines de maïs',    sprite: 'item_seed_corn',   buy: 15, sell: 0 },
    seed_carrot: { name: 'Graines de carotte', sprite: 'item_seed_carrot', buy: 8,  sell: 0 },
    feed:        { name: 'Foin',               sprite: 'item_feed',        buy: 5,  sell: 0 },
    wheat:       { name: 'Blé',                sprite: 'item_wheat',       buy: 0,  sell: 30 },
    corn:        { name: 'Maïs',               sprite: 'item_corn',        buy: 0,  sell: 50 },
    carrot:      { name: 'Carotte',            sprite: 'item_carrot',      buy: 0,  sell: 20 },
    egg:         { name: 'Œuf',                sprite: 'item_egg',         buy: 0,  sell: 15 },
    milk:        { name: 'Lait',               sprite: 'item_milk',        buy: 0,  sell: 40 },
    truffle:     { name: 'Truffe',             sprite: 'item_truffle',     buy: 0,  sell: 60 },
    wool:        { name: 'Laine',              sprite: 'item_wool',        buy: 0,  sell: 50 },
    goat_milk:   { name: 'Lait de chèvre',     sprite: 'item_goat_milk',   buy: 0,  sell: 45 },
  },

  // ---- Hotbar (keys 1..6) ----
  HOTBAR: [
    { id: 'hoe',         name: 'Houe',      sprite: 'tool_hoe' },
    { id: 'can',         name: 'Arrosoir',  sprite: 'tool_can' },
    { id: 'seed_wheat',  name: 'Graines de blé',     sprite: 'item_seed_wheat' },
    { id: 'seed_corn',   name: 'Graines de maïs',    sprite: 'item_seed_corn' },
    { id: 'seed_carrot', name: 'Graines de carotte', sprite: 'item_seed_carrot' },
    { id: 'feed',        name: 'Foin',      sprite: 'item_feed' },
  ],

  // ---- Crops ----  days = number of watered nights needed to be ripe
  CROPS: {
    wheat:  { name: 'Blé',     days: 3, seed: 'seed_wheat',  item: 'wheat' },
    corn:   { name: 'Maïs',    days: 4, seed: 'seed_corn',   item: 'corn' },
    carrot: { name: 'Carotte', days: 2, seed: 'seed_carrot', item: 'carrot' },
  },

  // ---- Animals ----
  ANIMALS: {
    chicken: { name: 'Poule',   product: 'egg' },
    cow:     { name: 'Vache',   product: 'milk' },
    pig:     { name: 'Cochon',  product: 'truffle' },
    sheep:   { name: 'Mouton',  product: 'wool' },
    goat:    { name: 'Chèvre',  product: 'goat_milk' },
  },
  ANIMAL_SPEED: 14,
  ANIMAL_NAMES: {
    chicken: ['Cocotte', 'Plume', 'Noisette', 'Paprika'],
    cow:     ['Marguerite', 'Blanchette'],
    pig:     ['Rillette', 'Truffo'],
    sheep:   ['Frisette', 'Nuage'],
    goat:    ['Biquette', 'Caramel'],
  },

  // ---- Pens: 1 chicken coop + 4 barns (étables) ----
  // Rectangle in tiles. Layout of every pen (see ARCHITECTURE.md):
  //   row y      : roof   (solid)
  //   row y+1    : wall   (solid, decorative barn door in the middle column)
  //   rows y+2 .. y+h-2 : interior (walkable), trough at (x+w-2, y+2)
  //   column x and x+w-1 (rows y+2..y+h-1) : fence ; row y+h-1 : fence
  //   gate (walkable gap) at (x + floor(w/2), y+h-1)
  PENS: [
    { id: 'coop',  type: 'chicken', label: 'Poulailler',             x: 2,  y: 10, w: 9, h: 7, count: 4 },
    { id: 'barn0', type: 'cow',     label: 'Étable des vaches',      x: 16, y: 2,  w: 8, h: 7, count: 2 },
    { id: 'barn1', type: 'pig',     label: 'Étable des cochons',     x: 26, y: 2,  w: 8, h: 7, count: 2 },
    { id: 'barn2', type: 'sheep',   label: 'Bergerie',               x: 16, y: 11, w: 8, h: 7, count: 2 },
    { id: 'barn3', type: 'goat',    label: 'Étable des chèvres',     x: 26, y: 11, w: 8, h: 7, count: 2 },
  ],

  // ---- Other zones (tiles) ----
  HOUSE: { x: 2, y: 2, w: 6, h: 4, door: { x: 4, y: 5 } }, // whole rect solid; door tile = sleep
  SHOP:  { x: 10, y: 4 },   // market stall object
  BIN:   { x: 9,  y: 6 },   // shipping bin object
  WELL:  { x: 12, y: 6 },   // well object
  FIELD: { x: 4,  y: 20, w: 10, h: 5 }, // farmable plots (50)
  POND:  { x: 28, y: 21, w: 7, h: 5 },  // water (solid, decorative)
  PATH_ROWS: [9, 18],       // dirt path rows, x from 1 to 38
  PATH_COLS: [14],          // dirt path column, y from 6 to 19
};

// Interior of a pen in PIXELS (where animals may wander, feet positions).
Farm.CONFIG.penInterior = function (pen) {
  var T = Farm.CONFIG.TILE;
  return {
    x0: (pen.x + 1) * T + 6,
    y0: (pen.y + 2) * T + 12,
    x1: (pen.x + pen.w - 1) * T - 6,
    y1: (pen.y + pen.h - 1) * T - 2,
  };
};
Farm.CONFIG.penTrough = function (pen) { return { tx: pen.x + pen.w - 2, ty: pen.y + 2 }; };
Farm.CONFIG.penGate = function (pen) { return { tx: pen.x + Math.floor(pen.w / 2), ty: pen.y + pen.h - 1 }; };
Farm.CONFIG.getPen = function (id) {
  return Farm.CONFIG.PENS.filter(function (p) { return p.id === id; })[0] || null;
};

// Sprite stage (0..3) for a planted plot.
Farm.CONFIG.cropStage = function (plot) {
  if (!plot.crop) return -1;
  var days = Farm.CONFIG.CROPS[plot.crop].days;
  if (plot.daysGrown >= days) return 3;
  if (plot.daysGrown === 0) return 0;
  return plot.daysGrown < days / 2 ? 1 : 2;
};
Farm.CONFIG.isRipe = function (plot) {
  return !!plot.crop && plot.daysGrown >= Farm.CONFIG.CROPS[plot.crop].days;
};

// "08:30"
Farm.CONFIG.formatTime = function (minutes) {
  var m = Math.floor(minutes) % 1440;
  var h = Math.floor(m / 60), mm = m % 60;
  return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
};
