# Farmer Simulator — Architecture & module contracts

Vanilla JS + Canvas 2D, **no build, no modules, no dependencies**. Every file is a classic
`<script>` that attaches to the global `window.Farm` namespace. The game must run by simply
opening `index.html` (file://). All in-game text is **French**. Code/comments in English.

## Files & load order (index.html loads them in this exact order)

| # | File | Owner | Exposes |
|---|------|-------|---------|
| 1 | `js/config.js` | lead (done) | `Farm.CONFIG` + helpers |
| 2 | `js/sprites.js` | lead (done) | `Farm.Sprites` (define/draw/get/has/dataURL/list) |
| 3 | `js/sprites_world.js` | agent A | world tiles, objects, crops, crop items, tools |
| 4 | `js/sprites_animals.js` | agent B | farmer, animals, animal products, icons |
| 5 | `js/world.js` | agent C | `Farm.World` |
| 6 | `js/animals.js` | agent C | `Farm.Animals` |
| 7 | `js/player.js` | agent C | `Farm.Player` |
| 8 | `js/state.js` | agent D | `Farm.Game` |
| 9 | `js/tasks.js` | agent D | `Farm.Tasks` |
| 10 | `js/interact.js` | agent D | `Farm.Interact` |
| 11 | `js/ui.js` | agent E | `Farm.UI` |
| 12 | `js/main.js` | agent E | `Farm.Input`, `Farm.Camera`, game loop, boot |

Files must only **define** things at load time. Nothing may touch another module at load
time, except the sprite files which call `Farm.Sprites.define(...)` immediately.
Booting happens in `main.js` on `window.addEventListener('load', ...)`.

## Coordinates

* `TILE = 16`. Map is `MAP_W x MAP_H = 40 x 30` tiles. Canvas internal size 480 x 320.
* Entities (player, animals) store `x, y` = **feet position in world pixels** (bottom-center).
  A 16x16 sprite is drawn at `(x - 8, y - 16)` (minus camera).
* Tile of a pixel: `tx = Math.floor(x / 16)`.
* `cam = { x, y }` = world pixel at the canvas top-left. Draw at `worldX - cam.x`.
* Sprites face **right** (side views); draw with `flip=true` for left.

## Sprites (`Farm.Sprites`) — already implemented

```js
Farm.Sprites.define(name, palette, rows) // palette {char: '#rrggbb'}, '.' = transparent, rows = strings
Farm.Sprites.draw(ctx, name, x, y, flip) // top-left, integer-rounded; missing => magenta square
Farm.Sprites.get(name) / has(name) / list() / dataURL(name, scale)
```

All sprites are **16x16** (16 rows of exactly 16 chars).

### Required sprite names — agent A (`sprites_world.js`)
Ground tiles: `tile_grass`, `tile_grass2` (variant with tufts/flowers), `tile_path` (dirt path),
`tile_soil` (untilled field earth), `tile_tilled` (plowed rows), `tile_watered` (plowed, darker/wet),
`tile_water` (pond), `tile_straw` (coop floor), `tile_fence_h`, `tile_fence_v`, `tile_fence_post`
(fences are drawn on top of grass, so they have a grass background baked in),
`tile_roof` (barn red roof), `tile_wall` (barn wooden wall), `tile_barn_door`,
`tile_house_roof`, `tile_house_wall`, `tile_house_window`, `tile_house_door`, `tile_tree` (tree seen from above on grass).
Objects (transparent background, drawn over a ground tile): `obj_trough_empty`, `obj_trough_full`,
`obj_well`, `obj_bin` (wooden shipping crate), `obj_shop` (market stall with awning).
Crops (transparent bg, drawn over tilled soil): `crop_wheat_0..3`, `crop_corn_0..3`, `crop_carrot_0..3`
(0 = seed in ground, 1 = sprout, 2 = growing, 3 = ripe).
Items (transparent bg): `item_wheat`, `item_corn`, `item_carrot`, `item_seed_wheat`, `item_seed_corn`,
`item_seed_carrot`, `item_feed` (hay bale). Tools: `tool_hoe`, `tool_can`.

### Required sprite names — agent B (`sprites_animals.js`)
Farmer (straw hat, blue overalls): `farmer_down_0`, `farmer_down_1`, `farmer_up_0`, `farmer_up_1`,
`farmer_side_0`, `farmer_side_1` (facing right; `_1` = other leg forward).
Animals, side view facing right, 2 walk frames each:
`chicken_0/1` (small, ~8-10px tall, at the bottom of the 16x16), `cow_0/1`, `pig_0/1`, `sheep_0/1`, `goat_0/1`.
Animals' feet must touch the bottom row (row 15) or row 14.
Products: `item_egg`, `item_milk`, `item_truffle`, `item_wool`, `item_goat_milk`.
Icons: `icon_heart`, `icon_hungry` (speech bubble with a "!" or empty bowl).

## Game state — `Farm.Game.state` (owned by agent D, read by everyone)

```js
{
  day: 1,
  minutes: 360,                 // game minutes since midnight (DAY_START .. DAY_END)
  money: 200,
  energy: 100,
  water: 20,                    // watering can
  selectedSlot: 0,              // index in CONFIG.HOTBAR
  inventory: { seed_wheat: 5, ... },  // every key of CONFIG.ITEMS, integer >= 0
  plots: [ { tx, ty, tilled: false, crop: null, daysGrown: 0, watered: false }, ... ], // one per FIELD tile
  pens:  [ { id: 'coop', troughFull: false }, ... ],  // same order as CONFIG.PENS
  animals: [ {
    id: 'coop_0', type: 'chicken', pen: 'coop', name: 'Cocotte',
    x, y,                       // feet, world px (inside CONFIG.penInterior(pen))
    dir: 'right' | 'left', frame: 0, moving: false,
    targetX, targetY, waitTimer,   // wander AI (managed by Farm.Animals)
    hasProduct: false, petted: false, happiness: 50, heartTimer: 0,
  }, ... ],
  player: { x, y, dir: 'down'|'up'|'left'|'right', frame: 0, moving: false, animTimer: 0 },
  tasks: [ { id, kind, pen, target, label, reward, done } ],
  stats: { soldToday: 0, plantedToday: 0, harvestedToday: 0 },
}
```

## Module APIs

### `Farm.World` (agent C, `world.js`)
```js
Farm.World.init()                 // builds ground[][] / solid[][] / objects from CONFIG
Farm.World.ground                 // ground[ty][tx] = sprite name (base layer, NOT plots)
Farm.World.objects                // [{ type: 'trough'|'well'|'bin'|'shop'|'door', tx, ty, pen?: 'coop' }]
Farm.World.getObjectAt(tx, ty)    // object or null
Farm.World.isSolidTile(tx, ty)    // true out of bounds, for solid ground and objects
Farm.World.isBlockedRect(x, y, w, h) // world px rect overlaps any solid tile
Farm.World.drawGround(ctx, cam)   // visible tiles only; for plot tiles draws soil/tilled/watered + crop from Farm.Game.state.plots
Farm.World.drawObjects(ctx, cam)  // objects; trough sprite depends on Farm.Game.state.pens[i].troughFull
```
Map build rules: grass everywhere (deterministic mix of `tile_grass`/`tile_grass2`, ~1 in 8 is grass2,
use a hash of tx,ty — not Math.random), border ring of `tile_tree` (solid), path rows/cols from CONFIG
(`tile_path`) plus 1-tile-wide connectors from each pen gate to the nearest path row; HOUSE rect:
top 2 rows `tile_house_roof`, other rows `tile_house_wall` with `tile_house_window` at x+1 and x+w-2
on the bottom row and `tile_house_door` at HOUSE.door — all solid; the door tile also gets an object
`{type:'door'}`. PENS: follow the layout comment in config.js (roof row, wall row with `tile_barn_door`
in the middle, fences, gate gap, interior = `tile_straw` for the coop, grass for barns, trough object
at `CONFIG.penTrough(pen)` with `pen: pen.id`). FIELD tiles: ground `tile_soil`, not solid.
POND: `tile_water`, solid. SHOP/BIN/WELL: objects (solid) over grass. ~15 extra decorative trees
(solid) at deterministic positions on plain grass only, never inside or adjacent (1 tile margin)
to any zone, path, object, pen, house, field, pond, or the player spawn.

### `Farm.Animals` (agent C, `animals.js`)
```js
Farm.Animals.update(dt)           // wander AI inside CONFIG.penInterior(pen); speed CONFIG.ANIMAL_SPEED;
                                  // pick random target, walk, wait 1-4s; frame toggles every 0.25s while moving;
                                  // heartTimer -= dt
Farm.Animals.drawOne(ctx, cam, a) // one animal: small shadow + sprite `${type}_${frame}`, flip when dir==='left'
Farm.Animals.draw(ctx, cam)       // all animals sorted by y (uses drawOne)
Farm.Animals.drawIcons(ctx, cam)  // above head (x-8, y-30): icon_heart if heartTimer>0,
                                  // else product sprite (CONFIG.ITEMS[product].sprite) if hasProduct,
                                  // else icon_hungry if its pen's troughFull is false. Small bob animation.
Farm.Animals.findNear(x, y, r)    // nearest animal whose feet are within r px of (x, y - 6), or null
```

### `Farm.Player` (agent C, `player.js`)
```js
Farm.Player.update(dt)            // reads Farm.Input.dirX()/dirY() (-1,0,1); normalizes diagonals;
                                  // collision against Farm.World.isBlockedRect with the feet hitbox
                                  // (x-5, y-6, 10, 6), axis-separated (try X then Y); updates dir/frame
                                  // (frame toggles every 0.2s while moving); clamps inside map
Farm.Player.draw(ctx, cam)        // farmer_${down|up|side}_${frame}, flip for left, small shadow ellipse
Farm.Player.getFacingPoint()      // { x: p.x + dx*12, y: p.y - 3 + dy*12 }
Farm.Player.getFacingTile()       // { tx, ty } of the facing point
```

### `Farm.Game` (agent D, `state.js`)
```js
Farm.Game.state                   // see above
Farm.Game.init()                  // load() from localStorage 'farmsim_save_v1' or newGame(); then startDay() for a new game
Farm.Game.newGame()               // fresh state from CONFIG (plots from FIELD, pens, animals at random interior positions, names from ANIMAL_NAMES)
Farm.Game.startDay()              // reset stats, tasks = Farm.Tasks.generate(state), save(), Farm.UI.showMorning(state)
Farm.Game.sleep(passedOut)        // endDay processing (below) then startDay()
Farm.Game.advanceTime(dt)         // minutes += dt*MINUTES_PER_SECOND; at DAY_END -> toast + sleep(true)
Farm.Game.save() / load() / reset()  // reset = clear storage + newGame + startDay
Farm.Game.getPlot(tx, ty)         // plot or null
Farm.Game.useEnergy(n)            // false (and toast 'Trop fatigué…') if energy < n, else subtract and true
Farm.Game.addItem(key, n) / removeItem(key, n) -> bool
```
End of day: for each pen: animals with troughFull → happiness +5, `hasProduct = true`; not fed → happiness −10,
no product. All `petted = false`, troughs emptied. Plots: crop & watered & not ripe → `daysGrown++`;
all `watered = false`. `day++`, `minutes = DAY_START`, `energy = MAX_ENERGY` (half if passedOut,
and lose 10% money max 50). Player back to PLAYER_SPAWN facing down. Happiness clamped 0..100.
Autosave every 20 real seconds is done by main.js calling `Farm.Game.save()`.

### `Farm.Tasks` (agent D, `tasks.js`)
```js
Farm.Tasks.generate(state)  // array of tasks for the morning
Farm.Tasks.update(state)    // each frame: for tasks not done whose condition is true -> done=true,
                            // money += reward, Farm.UI.toast('Tâche accomplie : … (+N $)')
```
Generated each morning: `feed` per pen (label `Nourrir : <pen.label>`, reward 10, done when troughFull);
`collect` per pen having an animal with hasProduct (label `Ramasser : <product name> (<pen.label>)`,
reward 10, done when none left in that pen); `water` if any planted non-ripe plot (reward 15, done when
all planted non-ripe plots are watered); `harvest` if any ripe plot (reward 15, done when none ripe);
plus ONE random bonus: `plant` (target 3, stats.plantedToday), `sell` (target 100 + 20*day, stats.soldToday)
or `pet` (all animals petted). Reward 25.

### `Farm.Interact` (agent D, `interact.js`)
```js
Farm.Interact.interact()      // E / Space. Priority: animal near facing point (r=12) -> facing object -> facing plot
Farm.Interact.buy(key, qty)   // shop: money -= ITEMS[key].buy*qty, toast; false if not enough money
Farm.Interact.sellAll()       // every item with sell>0: money += sell*count, count=0, stats.soldToday += total
```
Animal: hasProduct → collect (energy `collect`), else if !petted → pet (happiness +5, heartTimer 1.5),
else toast `<name> est contente !`. Objects: `trough` (needs `pen.count` feed; fills; energy `feed`),
`well` (water = WATER_MAX), `bin` (sellAll), `shop` (Farm.UI.openShop()), `door`
(Farm.UI.confirm('Aller dormir ? La journée se terminera.', () => Farm.Game.sleep(false))).
Plot: ripe → harvest (any tool). Otherwise by selected hotbar id: `hoe` on untilled → tilled;
`seed_*` on tilled empty plot with stock → plant (daysGrown 0, plantedToday++); `can` on planted
unwatered plot with water > 0 → watered, water−1. Each action spends ENERGY_COST via useEnergy.
Always give a short French toast for success or failure (e.g. 'Le sol doit être labouré (houe).').

### `Farm.UI` (agent E, `ui.js`) — DOM overlay over the canvas
```js
Farm.UI.init()                // build DOM inside #ui
Farm.UI.update()              // refresh HUD (cheap: only write DOM when a value changed)
Farm.UI.toast(msg)            // stacked messages, fade after ~2.5s
Farm.UI.showMorning(state)    // modal: "Jour N", wake-up text, list of today's tasks, button "Au travail !"
Farm.UI.openShop()            // modal: buy items with buy>0 (+1 / +5 buttons, price), "Tout vendre" button, close
Farm.UI.confirm(msg, onYes)   // modal Oui / Non
Farm.UI.closeModal()
Farm.UI.isModalOpen()         // game pauses while true
```
HUD: top-left day + clock + money + energy bar + water bar; right panel "Tâches du jour" (✔ when done)
and "Sac" (non-zero products/crops with icons); bottom hotbar of 6 slots (icon via
`Farm.Sprites.dataURL`, key number, count for seeds/feed, selected highlight, clickable);
bottom help line: `ZQSD/WASD/Flèches : bouger · E/Espace : agir · 1-6 : outil · Échap : fermer`.

### `main.js` (agent E)
`Farm.Input`: `dirX()`, `dirY()` (arrows + WASD + ZQSD, use `e.code` *and* `e.key`), `consume(code)`
for one-shot presses. `Farm.Camera = {x, y}` centered on the player, clamped to the map.
Boot on load: `Farm.World.init(); Farm.UI.init(); Farm.Game.init();` then the RAF loop
(dt clamped to 0.05). If no modal: advanceTime, Player.update, Animals.update, Tasks.update,
E/Space → Interact.interact, 1-6 → selectedSlot. Escape → UI.closeModal. UI.update every frame.
Render: clear → World.drawGround → World.drawObjects → entities sorted by feet y: each animal via `Animals.drawOne`, the player via `Player.draw`
→ facing-tile highlight (1px white rect, alpha 0.5) → Animals.drawIcons → night overlay
(dark blue, alpha 0 at 18:00 → 0.55 at 22:00). Canvas scaled to fit the window with integer-ish
scaling, `image-rendering: pixelated`, `ctx.imageSmoothingEnabled = false`.
