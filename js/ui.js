// Farmer Simulator — DOM UI overlay (HUD, task list, bag, hotbar, toasts, modals).
// Classic script: attaches Farm.UI to window.Farm. Player-facing text is French.
window.Farm = window.Farm || {};

Farm.UI = (function () {
  var MAX_TOASTS = 4;
  var TOAST_LIFE_MS = 2500;
  var INTRO_DAY1 = 'Le coq chante ! Bienvenue dans votre ferme. Prenez soin des poules et des 4 étables, cultivez vos champs et vendez vos récoltes.';
  var TIP_DAY1 = "Astuce : la houe laboure, les graines se plantent, l'arrosoir se remplit au puits. Remplissez les mangeoires avec du foin.";
  var MORNING_TEXT = 'Le coq chante, une nouvelle journée commence !';
  var HELP_TEXT = 'ZQSD/WASD/Flèches : bouger · E/Espace : agir · 1-6 : outil · Échap : fermer';
  var NEW_GAME_CONFIRM = 'Recommencer une nouvelle partie ? La progression sera perdue.';

  var els = {};            // named DOM nodes
  var slots = [];          // hotbar: [{ btn, count }]
  var iconCache = {};      // 'sprite@scale' -> data URL
  var sig = null;          // signature of the last rebuilt lists
  var modalKind = null;    // null | 'morning' | 'shop' | 'confirm'

  // ---------- small DOM helpers ----------

  function state() {
    return (Farm.Game && Farm.Game.state) || null;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }

  // Writes only when the value changed (keeps per-frame updates cheap).
  function setText(node, v) {
    if (!node) return;
    v = String(v);
    if (node._t !== v) { node._t = v; node.textContent = v; }
  }

  function setWidth(node, v) {
    if (!node) return;
    if (node._w !== v) { node._w = v; node.style.width = v; }
  }

  function pct(v, max) {
    return Math.max(0, Math.min(100, (v / max) * 100)) + '%';
  }

  function btn(label, onClick, cls) {
    var b = el('button', cls || 'btn', label);
    b.type = 'button';
    // Keep focus off mouse-clicked buttons so Space/E still act on the game.
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', onClick);
    return b;
  }

  function iconURL(sprite, scale) {
    var key = sprite + '@' + scale;
    if (iconCache[key]) return iconCache[key];
    var url = Farm.Sprites.dataURL(sprite, scale);
    if (!url) return ''; // not cached: retry on a later call
    iconCache[key] = url;
    return url;
  }

  // <img> of a sprite, or a text fallback when the sprite is unavailable.
  function makeIcon(sprite, scale, cls, fallback) {
    var url = iconURL(sprite, scale);
    if (url) {
      var img = el('img', 'icon ' + cls);
      img.src = url;
      img.alt = '';
      return img;
    }
    return el('span', cls + ' icon-fallback', fallback || '?');
  }

  // ---------- init & layout ----------

  function makeBar(label, key) {
    var wrap = el('div', 'bar bar-' + key);
    var top = el('div', 'bar-label');
    top.appendChild(el('span', '', label));
    els[key + 'Val'] = el('span', 'bar-val', '');
    top.appendChild(els[key + 'Val']);
    var track = el('div', 'bar-track');
    els[key + 'Fill'] = el('div', 'bar-fill');
    track.appendChild(els[key + 'Fill']);
    wrap.appendChild(top);
    wrap.appendChild(track);
    return wrap;
  }

  function buildHud(root) {
    var hud = el('div', 'panel');
    hud.id = 'hud';
    els.time = el('div', 'hud-time', '');
    els.money = el('div', 'hud-money', '');
    hud.appendChild(els.time);
    hud.appendChild(els.money);
    hud.appendChild(makeBar('Énergie', 'energy'));
    hud.appendChild(makeBar('Arrosoir', 'water'));
    root.appendChild(hud);
  }

  function buildSide(root) {
    var side = el('div', 'panel side');
    side.appendChild(el('h3', 'panel-title', 'Tâches du jour'));
    els.tasks = el('ul', 'tasks');
    side.appendChild(els.tasks);
    side.appendChild(el('h3', 'panel-title', 'Sac'));
    els.bag = el('div', 'bag');
    side.appendChild(els.bag);
    root.appendChild(side);
  }

  function buildHotbar(root) {
    var wrap = el('div', 'hotbar-wrap');
    els.toolName = el('div', 'tool-name', '');
    wrap.appendChild(els.toolName);
    els.hotbar = el('div', 'hotbar');
    Farm.CONFIG.HOTBAR.forEach(function (tool, i) {
      var b = el('button', 'slot');
      b.type = 'button';
      b.title = tool.name;
      b.setAttribute('aria-label', tool.name);
      b.appendChild(makeIcon(tool.sprite, 3, 'slot-icon', tool.name.charAt(0)));
      b.appendChild(el('span', 'slot-key', String(i + 1)));
      var count = el('span', 'slot-count', '');
      b.appendChild(count);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        var s = state();
        if (s) s.selectedSlot = i;
      });
      els.hotbar.appendChild(b);
      slots.push({ btn: b, count: count });
    });
    wrap.appendChild(els.hotbar);
    root.appendChild(wrap);
  }

  function init() {
    var root = document.getElementById('ui');
    if (!root) { console.error('[ui] #ui element not found'); return; }
    root.innerHTML = '';
    slots = [];

    buildHud(root);
    buildSide(root);

    els.newGame = btn('Nouvelle partie', function () {
      confirm(NEW_GAME_CONFIRM, function () { Farm.Game.reset(); });
    }, 'btn btn-small newgame');
    root.appendChild(els.newGame);

    buildHotbar(root);

    els.toasts = el('div', 'toasts');
    root.appendChild(els.toasts);

    root.appendChild(el('div', 'help', HELP_TEXT));

    els.modal = el('div', 'modal-layer hidden');
    els.modalPanel = el('div', 'panel modal');
    els.modal.appendChild(els.modalPanel);
    root.appendChild(els.modal);

    sig = null;
    modalKind = null;
  }

  // ---------- per-frame refresh ----------

  function rebuildTasks(tasks) {
    var ul = els.tasks;
    ul.innerHTML = '';
    if (!tasks || !tasks.length) {
      ul.appendChild(el('li', 'task empty', 'Aucune tâche.'));
      return;
    }
    tasks.forEach(function (t) { ul.appendChild(taskItem(t)); });
  }

  function taskItem(t) {
    var li = el('li', 'task' + (t.done ? ' done' : ''));
    li.appendChild(el('span', 'check', t.done ? '✔' : '☐'));
    li.appendChild(el('span', 'task-label', t.label));
    li.appendChild(el('span', 'reward', '+' + t.reward + ' $'));
    return li;
  }

  function rebuildBag(inv) {
    var box = els.bag;
    var C = Farm.CONFIG;
    box.innerHTML = '';
    var n = 0;
    Object.keys(C.ITEMS).forEach(function (key) {
      var item = C.ITEMS[key];
      var count = inv[key] || 0;
      if (!(item.sell > 0) || count <= 0) return;
      var cell = el('div', 'bag-item');
      cell.title = item.name;
      cell.appendChild(makeIcon(item.sprite, 2, '', item.name.charAt(0)));
      cell.appendChild(el('span', 'bag-count', '× ' + count));
      box.appendChild(cell);
      n++;
    });
    if (!n) box.appendChild(el('div', 'bag-empty', 'Vide'));
  }

  function updateHotbar(s) {
    var C = Farm.CONFIG;
    var sel = s.selectedSlot || 0;
    slots.forEach(function (sl, i) {
      var tool = C.HOTBAR[i];
      var cnt = '';
      if (tool.id === 'can') {
        cnt = String(s.water);
      } else if (tool.id === 'feed' || tool.id.indexOf('seed_') === 0) {
        cnt = String((s.inventory && s.inventory[tool.id]) || 0);
      }
      setText(sl.count, cnt);
      sl.btn.classList.toggle('selected', i === sel);
      sl.btn.classList.toggle('depleted', cnt === '0');
    });
    setText(els.toolName, C.HOTBAR[sel] ? C.HOTBAR[sel].name : '');
  }

  function update() {
    if (!els.time) return; // init() not run yet
    var s = state();
    if (!s) return;
    var C = Farm.CONFIG;

    setText(els.time, 'Jour ' + s.day + ' · ' + C.formatTime(s.minutes));
    setText(els.money, '💰 ' + s.money + ' $');
    setText(els.energyVal, Math.round(s.energy) + '/' + C.MAX_ENERGY);
    setWidth(els.energyFill, pct(s.energy, C.MAX_ENERGY));
    setText(els.waterVal, Math.round(s.water) + '/' + C.WATER_MAX);
    setWidth(els.waterFill, pct(s.water, C.WATER_MAX));

    var tasks = s.tasks || [];
    var inv = s.inventory || {};
    var nextSig = JSON.stringify([
      tasks.map(function (t) { return [t.id, t.label, t.done, t.reward]; }),
      inv
    ]);
    if (nextSig !== sig) {
      sig = nextSig;
      rebuildTasks(tasks);
      rebuildBag(inv);
    }

    updateHotbar(s);
  }

  // ---------- toasts ----------

  function toast(msg) {
    if (!els.toasts) { console.log('[toast] ' + msg); return; }
    var t = el('div', 'toast', msg);
    els.toasts.appendChild(t);
    while (els.toasts.children.length > MAX_TOASTS) {
      els.toasts.removeChild(els.toasts.firstChild);
    }
    setTimeout(function () {
      t.classList.add('fade');
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 600);
    }, TOAST_LIFE_MS);
  }

  // ---------- modals (only one at a time) ----------

  function openModal(kind, build) {
    if (!els.modal) return;
    modalKind = kind;
    els.modalPanel.innerHTML = '';
    build(els.modalPanel);
    els.modal.classList.remove('hidden');
  }

  function closeModal() {
    if (!els.modal || modalKind === null) return;
    modalKind = null;
    els.modal.classList.add('hidden');
    els.modalPanel.innerHTML = '';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function isModalOpen() {
    return modalKind !== null;
  }

  function buildMorning(st, panel) {
    panel.appendChild(el('h2', 'modal-title', 'Jour ' + st.day));
    panel.appendChild(el('p', 'modal-text', st.day === 1 ? INTRO_DAY1 : MORNING_TEXT));
    if (st.day === 1) panel.appendChild(el('p', 'modal-tip', TIP_DAY1));

    panel.appendChild(el('h3', 'modal-sub', 'Tâches du jour :'));
    var ul = el('ul', 'tasks');
    var tasks = st.tasks || [];
    if (!tasks.length) ul.appendChild(el('li', 'task empty', 'Rien de prévu aujourd\'hui.'));
    tasks.forEach(function (t) { ul.appendChild(taskItem(t)); });
    panel.appendChild(ul);

    var actions = el('div', 'modal-actions');
    actions.appendChild(btn('Au travail !', function () { closeModal(); }, 'btn btn-primary'));
    panel.appendChild(actions);
  }

  function showMorning(st) {
    st = st || state();
    if (!st) return;
    openModal('morning', function (panel) { buildMorning(st, panel); });
    sig = null; // refresh the side lists on the next update
  }

  function renderShop() {
    if (modalKind !== 'shop' || !els.shopRows) return;
    var C = Farm.CONFIG;
    var s = state();
    var money = s ? s.money : 0;
    var inv = (s && s.inventory) || {};
    setText(els.shopMoney, 'Argent : ' + money + ' $');

    var box = els.shopRows;
    box.innerHTML = '';
    Object.keys(C.ITEMS).forEach(function (key) {
      var item = C.ITEMS[key];
      if (!(item.buy > 0)) return;
      var row = el('div', 'shop-row');
      row.appendChild(makeIcon(item.sprite, 2, 'row-icon', item.name.charAt(0)));

      var info = el('div', 'row-info');
      info.appendChild(el('div', 'row-name', item.name));
      info.appendChild(el('div', 'row-meta', item.buy + ' $ · possédé : ' + (inv[key] || 0)));
      row.appendChild(info);

      var buys = el('div', 'row-buy');
      [1, 5].forEach(function (n) {
        buys.appendChild(btn('+' + n, function () {
          Farm.Interact.buy(key, n);
          renderShop();
        }, 'btn btn-small'));
      });
      row.appendChild(buys);
      box.appendChild(row);
    });
  }

  function openShop() {
    openModal('shop', function (panel) {
      panel.appendChild(el('h2', 'modal-title', 'Marché'));
      els.shopMoney = el('p', 'modal-text money', '');
      panel.appendChild(els.shopMoney);
      els.shopRows = el('div', 'shop-rows');
      panel.appendChild(els.shopRows);

      var actions = el('div', 'modal-actions');
      actions.appendChild(btn('Tout vendre (caisse)', function () {
        Farm.Interact.sellAll();
        renderShop();
      }, 'btn'));
      actions.appendChild(btn('Fermer', function () { closeModal(); }, 'btn btn-primary'));
      panel.appendChild(actions);
    });
    renderShop();
  }

  function confirm(msg, onYes) {
    openModal('confirm', function (panel) {
      panel.appendChild(el('p', 'modal-text', msg));
      var actions = el('div', 'modal-actions');
      actions.appendChild(btn('Non', function () { closeModal(); }, 'btn'));
      actions.appendChild(btn('Oui', function () {
        // Close first: onYes may open another modal (e.g. the morning one).
        closeModal();
        if (typeof onYes === 'function') onYes();
      }, 'btn btn-primary'));
      panel.appendChild(actions);
    });
  }

  return {
    init: init,
    update: update,
    toast: toast,
    showMorning: showMorning,
    openShop: openShop,
    confirm: confirm,
    closeModal: closeModal,
    isModalOpen: isModalOpen
  };
})();
