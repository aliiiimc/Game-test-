// Farmer Simulator — daily tasks (Farm.Tasks).
// Classic script: only defines Farm.Tasks at load time.
window.Farm = window.Farm || {};

Farm.Tasks = (function () {
  function toast(m) { if (Farm.UI && Farm.UI.toast) Farm.UI.toast(m); }
  function cfg() { return Farm.CONFIG; }

  function plantedNotRipe(state) {
    return state.plots.filter(function (p) { return p.crop && !cfg().isRipe(p); });
  }

  function ripePlots(state) {
    return state.plots.filter(function (p) { return cfg().isRipe(p); });
  }

  function penHasProduct(state, penId) {
    return state.animals.some(function (a) { return a.pen === penId && a.hasProduct; });
  }

  function penTroughFull(state, penId) {
    for (var i = 0; i < state.pens.length; i++) {
      if (state.pens[i].id === penId) return !!state.pens[i].troughFull;
    }
    return false;
  }

  var BONUS = ['plant', 'sell', 'pet'];

  function generate(state) {
    var C = cfg();
    var tasks = [];

    C.PENS.forEach(function (pen) {
      tasks.push({
        id: 'feed_' + pen.id, kind: 'feed', pen: pen.id, target: null,
        label: 'Nourrir : ' + pen.label, reward: 10, done: false,
      });
    });

    C.PENS.forEach(function (pen) {
      if (penHasProduct(state, pen.id)) {
        var prod = C.ANIMALS[pen.type].product;
        tasks.push({
          id: 'collect_' + pen.id, kind: 'collect', pen: pen.id, target: prod,
          label: 'Ramasser : ' + C.ITEMS[prod].name + ' (' + pen.label + ')',
          reward: 10, done: false,
        });
      }
    });

    if (plantedNotRipe(state).length) {
      tasks.push({
        id: 'water', kind: 'water', pen: null, target: null,
        label: 'Arroser toutes les cultures', reward: 15, done: false,
      });
    }

    if (ripePlots(state).length) {
      tasks.push({
        id: 'harvest', kind: 'harvest', pen: null, target: null,
        label: 'Récolter les cultures mûres', reward: 15, done: false,
      });
    }

    var pick = BONUS[Math.floor(Math.random() * BONUS.length)];
    if (pick === 'plant') {
      tasks.push({
        id: 'plant', kind: 'plant', pen: null, target: 3,
        label: 'Planter 3 graines', reward: 25, done: false,
      });
    } else if (pick === 'sell') {
      var goal = 100 + 20 * state.day;
      tasks.push({
        id: 'sell', kind: 'sell', pen: null, target: goal,
        label: 'Vendre pour ' + goal + ' $', reward: 25, done: false,
      });
    } else {
      tasks.push({
        id: 'pet', kind: 'pet', pen: null, target: null,
        label: 'Caresser tous les animaux', reward: 25, done: false,
      });
    }

    return tasks;
  }

  function isDone(state, t) {
    switch (t.kind) {
      case 'feed': return penTroughFull(state, t.pen);
      case 'collect': return !penHasProduct(state, t.pen);
      case 'water': return plantedNotRipe(state).every(function (p) { return p.watered; });
      case 'harvest': return ripePlots(state).length === 0;
      case 'plant': return state.stats.plantedToday >= t.target;
      case 'sell': return state.stats.soldToday >= t.target;
      case 'pet': return state.animals.length > 0 && state.animals.every(function (a) { return a.petted; });
      default: return false;
    }
  }

  function update(state) {
    if (!state || !state.tasks || !state.tasks.length) return;

    state.tasks.forEach(function (t) {
      if (t.done || !isDone(state, t)) return;
      t.done = true;
      state.money += t.reward;
      toast('Tâche accomplie : ' + t.label + ' (+' + t.reward + ' $)');
    });

    if (!state.allTasksDone && state.tasks.every(function (t) { return t.done; })) {
      state.allTasksDone = true;
      toast('Toutes les tâches du jour sont faites ! Bravo !');
    }
  }

  return { generate: generate, update: update };
})();
