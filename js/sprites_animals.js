// Farmer, animals, animal products and icons (16x16 pixel art, defined in code).
// Classic script. Depends on js/sprites.js (Farm.Sprites).
(function () {
  var S = Farm.Sprites;

  // ------------------------------------------------------------------
  // FARMER (straw hat, red shirt, blue overalls, brown boots)
  // ------------------------------------------------------------------
  var F = {
    o: '#3b2a20', // outline
    y: '#f2c14e', // straw hat
    h: '#ffe27a', // straw highlight
    z: '#c9962e', // straw shadow
    b: '#8a4b2a', // hat band
    s: '#f5c9a0', // skin
    n: '#e0a57a', // skin shadow
    k: '#e8868a', // cheek blush
    m: '#9c4a3a', // mouth
    e: '#2b1a10', // eye
    r: '#6b3f22', // hair
    R: '#8c5a33', // hair highlight
    d: '#c93a32', // shirt red
    D: '#e0584d', // shirt highlight
    c: '#9e2a24', // shirt shadow
    p: '#f5efe0', // plaid cream
    u: '#3f6fb5', // denim blue
    U: '#5a8fd1', // denim highlight
    v: '#2c4f86', // denim shadow
    t: '#6b4226', // boot
    T: '#8a5a36', // boot highlight
    x: '#4a2c18'  // boot sole
  };

  // Side view, facing right. _1 = other leg forward.
  S.define('farmer_side_0', F, [
    '................',
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhhyyyyyyo..',
    '...ozzzzzzzzo...',
    '...orssssssso...',
    '...orrsssseso...',
    '...ornnnnnnso...',
    '...oDddddddco...',
    '...odpdpdpdco...',
    '...oUuuuuuuvo...',
    '...ouuuuuuvvo...',
    '....ouv..uvo....',
    '....otto.oTtto..',
    '....oxxo.oxxxo..'
  ]);
  S.define('farmer_side_1', F, [
    '................',
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhhyyyyyyo..',
    '...ozzzzzzzzo...',
    '...orssssssso...',
    '...orrsssseso...',
    '...ornnnnnnso...',
    '...oDddddddco...',
    '...odpdpdpdco...',
    '...oUuuuuuuvo...',
    '...ouuuuuuvvo...',
    '....ouvo..uvo...',
    '....otto..oTtto.',
    '....oxxo..oxxxo.'
  ]);

  // Facing the camera (eyes visible).
  S.define('farmer_down_0', F, [
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhyyyyyyyo..',
    '..ozzzzzzzzzzo..',
    '...orssssssro...',
    '...orsessesro...',
    '...orksmmskro...',
    '..ocdpdpdpdcco..',
    '..ocduUuuuvdco..',
    '..osuuuuuuvuso..',
    '...ouuuuuuvvo...',
    '....ouuo.ouuo...',
    '....otto.otto...',
    '....oxxo.oxxo...',
    '................'
  ]);
  S.define('farmer_down_1', F, [
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhyyyyyyyo..',
    '..ozzzzzzzzzzo..',
    '...orssssssro...',
    '...orsessesro...',
    '...orksmmskro...',
    '..ocdpdpdpdcco..',
    '..ocduUuuuvdco..',
    '..osuuuuuuvuso..',
    '...ouuuuuuvvo...',
    '....ouuo.ouuo...',
    '....otto.otto...',
    '.........oxxo...',
    '................'
  ]);

  // Seen from behind (hat and hair, no face).
  S.define('farmer_up_0', F, [
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhyyyyyyyo..',
    '..ozzzzzzzzzzo..',
    '...orRRRRrrro...',
    '...orrrrrrrro...',
    '...ornnnnnnro...',
    '..ocdpdpdpdcco..',
    '..ocduUuuuvdco..',
    '..osuuuuuuvuso..',
    '...ouuuuuuvvo...',
    '....ouuo.ouuo...',
    '....otto.otto...',
    '....oxxo.oxxo...',
    '................'
  ]);
  S.define('farmer_up_1', F, [
    '.....oooooo.....',
    '....oyyyyyyo....',
    '....obbbbbbo....',
    '..ohhhyyyyyyyo..',
    '..ozzzzzzzzzzo..',
    '...orRRRRrrro...',
    '...orrrrrrrro...',
    '...ornnnnnnro...',
    '..ocdpdpdpdcco..',
    '..ocduUuuuvdco..',
    '..osuuuuuuvuso..',
    '...ouuuuuuvvo...',
    '....ouuo.ouuo...',
    '....otto.otto...',
    '.........oxxo...',
    '................'
  ]);

  // ------------------------------------------------------------------
  // CHICKEN (small white hen, side view facing right)
  // ------------------------------------------------------------------
  var CH = {
    o: '#3b2a20', // outline
    W: '#ffffff', // feathers
    g: '#d9d3c4', // feather shade
    R: '#d7322b', // comb and wattle
    O: '#f29b2b', // beak
    L: '#f08a1c', // legs
    e: '#2b1a10'  // eye
  };

  S.define('chicken_0', CH, [
    '................',
    '................',
    '................',
    '................',
    '........oRRo....',
    '........oWWo....',
    '.......oWWeWo...',
    '.......oWWWWOO..',
    '...oooooWWWRo...',
    '..oWWWWWWWWo....',
    '.oWWWWWWWWWWo...',
    '.oWWWWWWWgWWo...',
    '..oooooooooo....',
    '.....L...L......',
    '.....LL..LL.....',
    '................'
  ]);
  S.define('chicken_1', CH, [
    '................',
    '................',
    '................',
    '........oRRo....',
    '........oWWo....',
    '.......oWWeWo...',
    '.......oWWWWOO..',
    '...oooooWWWRo...',
    '..oWWWWWWWWo....',
    '.oWWWWWWWWWWo...',
    '.oWWWWWWWgWWo...',
    '..oooooooooo....',
    '.....L...L......',
    '......L..L......',
    '......LL.LL.....',
    '................'
  ]);

  // ------------------------------------------------------------------
  // COW (white with black patches, pink snout, small horns)
  // ------------------------------------------------------------------
  var CO = {
    o: '#3b2a20', // outline
    W: '#fbf8f2', // white
    g: '#d8d4cc', // white shade
    K: '#2e2a27', // black patch (not pure black)
    P: '#f2a7b0', // pink snout
    p: '#d9808d', // snout shade
    N: '#7a4450', // nostril
    H: '#e8dcc0', // horn
    e: '#2b1a10', // eye
    k: '#4a3f36'  // hoof
  };

  S.define('cow_0', CO, [
    '................',
    '................',
    '................',
    '................',
    '...........oHo..',
    '..........oWWWo.',
    '...oooooooWeWWWo',
    '.oWWKWWWWWWKKPNo',
    'oWWKKWWWWWWWWpPo',
    '.oWWWWWgWWWWWWo.',
    '..ooooooooooo...',
    '...oWo...oWo....',
    '...oWo...oWo....',
    '...oWo...oWo....',
    '...kkk...kkk....',
    '................'
  ]);
  S.define('cow_1', CO, [
    '................',
    '................',
    '................',
    '................',
    '...........oHo..',
    '..........oWWWo.',
    '...oooooooWeWWWo',
    '.oWWKWWWWWWKKPNo',
    'oWWKKWWWWWWWWpPo',
    '.oWWWWWgWWWWWWo.',
    '..ooooooooooo...',
    '..oWo....oWo....',
    '..oWo....oWo....',
    '..oWo....oWo....',
    '..kkk...........',
    '................'
  ]);

  // ------------------------------------------------------------------
  // PIG (pink round body, darker snout with 2 nostrils)
  // ------------------------------------------------------------------
  var PI = {
    o: '#3b2a20', // outline
    k: '#f2a3b3', // pink
    K: '#ffc9d4', // pink highlight
    p: '#d9818f', // pink shade
    S: '#e07a8c', // snout
    N: '#7a3446', // nostril
    e: '#2b1a10'  // eye
  };

  S.define('pig_0', PI, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '.o.......opo....',
    'o.oooooooooooo..',
    '.oKKkkkkkkkkkko.',
    '.okkkkkkkkkekSo.',
    '.okkkkkkkkkkSNNo',
    '.oppppppppppSSo.',
    '..oooooooooooo..',
    '...opo...opo....',
    '...opo...opo....',
    '...ooo...ooo....',
    '................'
  ]);
  S.define('pig_1', PI, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '.o.......opo....',
    'o.oooooooooooo..',
    '.oKKkkkkkkkkkko.',
    '.okkkkkkkkkekSo.',
    '.okkkkkkkkkkSNNo',
    '.oppppppppppSSo.',
    '..oooooooooooo..',
    '..opo....opo....',
    '..opo....opo....',
    '..ooo...........',
    '................'
  ]);

  // ------------------------------------------------------------------
  // SHEEP (fluffy cream wool, dark grey face and legs)
  // ------------------------------------------------------------------
  var SH = {
    o: '#3b2a20', // outline
    C: '#f8f4ea', // wool
    c: '#ece4cf', // wool shade
    j: '#d6cdb6', // wool deep shade
    G: '#55555c', // face and legs
    D: '#34343a', // hooves
    e: '#2b1a10'  // eye
  };

  S.define('sheep_0', SH, [
    '................',
    '................',
    '................',
    '................',
    '..oo..oo..oo....',
    '.oCCoCCcoCcco...',
    'oCCCCCCCCCCCooo.',
    'oCCCCCCCCCCcGGGo',
    'oCCCCCCCCCcjGeGo',
    'oCCCCCCCCCcjGGDo',
    '.oCCCCCCCCjjGGo.',
    '..oo.oo.oo.oo...',
    '...GG.....GG....',
    '...GG.....GG....',
    '...DD.....DD....',
    '................'
  ]);
  S.define('sheep_1', SH, [
    '................',
    '................',
    '................',
    '................',
    '..oo..oo..oo....',
    '.oCCoCCcoCcco...',
    'oCCCCCCCCCCCooo.',
    'oCCCCCCCCCCcGGGo',
    'oCCCCCCCCCcjGeGo',
    'oCCCCCCCCCcjGGDo',
    '.oCCCCCCCCjjGGo.',
    '..oo.oo.oo.oo...',
    '..GG.....GG.....',
    '..GG.....GG.....',
    '..DD............',
    '................'
  ]);

  // ------------------------------------------------------------------
  // GOAT (beige body, white beard, small curved horns, short tail)
  // ------------------------------------------------------------------
  var GO = {
    o: '#3b2a20', // outline
    B: '#d9b68a', // beige
    d: '#b08a5c', // beige shade
    W: '#f7f4ec', // white beard
    H: '#d8c9a8', // horn
    e: '#2b1a10', // eye
    k: '#4a3f36'  // hoof
  };

  S.define('goat_0', GO, [
    '................',
    '................',
    '................',
    '...........oHo..',
    '..........oBBBo.',
    '.oB......oBBeBo.',
    '..ooooooooBBBo..',
    '.oBBBBBBBBBBBo..',
    '.oBBBdBBBBBBWo..',
    '.oBBBdBBBBBWWo..',
    '.oBBBBBBBBBWo...',
    '..oooooooooo....',
    '...odo...odo....',
    '...odo...odo....',
    '...kkk...kkk....',
    '................'
  ]);
  S.define('goat_1', GO, [
    '................',
    '................',
    '................',
    '...........oHo..',
    '..........oBBBo.',
    '.oB......oBBeBo.',
    '..ooooooooBBBo..',
    '.oBBBBBBBBBBBo..',
    '.oBBBdBBBBBBWo..',
    '.oBBBdBBBBBWWo..',
    '.oBBBBBBBBBWo...',
    '..oooooooooo....',
    '..odo....odo....',
    '..odo....odo....',
    '..kkk...........',
    '................'
  ]);

  // ------------------------------------------------------------------
  // PRODUCTS (~10px, outlined, transparent background)
  // ------------------------------------------------------------------
  var EG = {
    o: '#3b2a20', // outline
    c: '#f7ecd2', // cream
    h: '#ffffff', // highlight
    s: '#d9c49a'  // shadow
  };
  S.define('item_egg', EG, [
    '................',
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '....ohhccsso....',
    '...ohcccccsso...',
    '..ohcccccccsso..',
    '..ohcccccccsso..',
    '...occccccsso...',
    '....occccsso....',
    '.....oooooo.....',
    '................',
    '................',
    '................',
    '................'
  ]);

  var MI = {
    o: '#3b2a20', // outline
    B: '#3d7bd0', // blue cap
    b: '#2a5aa0', // cap shade
    W: '#f7f9fb', // milk
    H: '#ffffff', // milk highlight
    g: '#cfd6de', // milk shade
    L: '#5b8fdc', // blue label
    w: '#ffffff'  // label glint
  };
  S.define('item_milk', MI, [
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '.....oBBBBo.....',
    '.....obbbbo.....',
    '......oWWo......',
    '....oWWWWWWo....',
    '....oHHWWWgo....',
    '....oHLLLLgo....',
    '....oHLwLLgo....',
    '....oHLLLLgo....',
    '....oHWWWWgo....',
    '....oHWWWWgo....',
    '.....oooooo.....',
    '................'
  ]);

  var TR = {
    o: '#3b2a20', // outline
    T: '#4a3024', // truffle
    h: '#6e4c38', // highlight
    s: '#2e1d15', // shadow
    p: '#a9876b'  // light speck
  };
  S.define('item_truffle', TR, [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '.....oooo.......',
    '....ohhTTo......',
    '...ohTpTTso.....',
    '..oTpTThTsso....',
    '..oTTpsTTpTo....',
    '...osTpTTso.....',
    '....oooooo......',
    '................',
    '................',
    '................'
  ]);

  var WO = {
    o: '#3b2a20', // outline
    W: '#ffffff', // wool highlight
    c: '#f1ece0', // wool
    j: '#d6cdb6'  // wool shade
  };
  S.define('item_wool', WO, [
    '................',
    '................',
    '................',
    '....oo..oo......',
    '...oWWoWWo......',
    '..oWWWWWWWWo....',
    '.oWWcWWWWWWjo...',
    'oWWWWWWWWWWcjo..',
    'oWWWcWWWWWWjjo..',
    'oWWWWWWWWWWjjo..',
    '.oWWWWWWWWWjo...',
    '..ojjjjjjjjo....',
    '...oo.oo.oo.....',
    '................',
    '................',
    '................'
  ]);

  var GM = {
    o: '#3b2a20', // outline
    T: '#a8794a', // tan cap
    u: '#8a6038', // cap shade
    W: '#f7f1e3', // goat milk
    H: '#ffffff', // highlight
    g: '#dcd0b4', // milk shade
    L: '#e3c27a', // beige label
    w: '#ffffff'  // label glint
  };
  S.define('item_goat_milk', GM, [
    '................',
    '................',
    '................',
    '.....oooooo.....',
    '.....oTTTTo.....',
    '.....ouuuuo.....',
    '......oWWo......',
    '....oWWWWWWo....',
    '...oHHWWWWWgo...',
    '...oHLLLLLLgo...',
    '...oHLLwLLLgo...',
    '...oHLLLLLLgo...',
    '...oHWWWWWWgo...',
    '....oooooooo....',
    '................',
    '................'
  ]);

  // ------------------------------------------------------------------
  // ICONS
  // ------------------------------------------------------------------
  var HE = {
    o: '#3b2a20', // outline
    R: '#e0343c', // red
    P: '#ff8fa0', // pink highlight
    r: '#a81e2a'  // dark red shade
  };
  S.define('icon_heart', HE, [
    '................',
    '................',
    '................',
    '................',
    '....ooo.ooo.....',
    '...oPRRoRRro....',
    '...oPRRRRRro....',
    '....oRRRRRro....',
    '.....oRRRro.....',
    '......oRro......',
    '.......oo.......',
    '................',
    '................',
    '................',
    '................',
    '................'
  ]);

  var HU = {
    o: '#3b2a20', // outline
    W: '#ffffff', // bubble
    R: '#d7322b'  // red "!"
  };
  S.define('icon_hungry', HU, [
    '................',
    '................',
    '...oooooooooo...',
    '..oWWWWWWWWWWo..',
    '.oWWWWWRRWWWWWo.',
    '.oWWWWWRRWWWWWo.',
    '.oWWWWWWWWWWWWo.',
    '.oWWWWWRRWWWWWo.',
    '..oWWWWWWWWWWo..',
    '...oooooooooo...',
    '....oWo.........',
    '....oo..........',
    '................',
    '................',
    '................',
    '................'
  ]);
})();
