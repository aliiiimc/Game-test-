// Farmer Simulator — player actions (Farm.Interact).
// Classic script: only defines Farm.Interact at load time.
window.Farm = window.Farm || {};

Farm.Interact = (function () {
  function toast(m) { if (Farm.UI && Farm.UI.toast) Farm.UI.toast(m); }
  function cfg() { return Farm.CONFIG; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function penState(s, id) {
    for (var i = 0; i < s.pens.length; i++) if (s.pens[i].id === id) return s.pens[i];
    return null;
  }

  function interactAnimal(s, a) {
    var C = cfg();
    if (a.hasProduct) {
      var prod = C.ANIMALS[a.type].product;
      if (!Farm.Game.useEnergy(C.ENERGY_COST.collect)) return;
      Farm.Game.addItem(prod, 1);
      a.hasProduct = false;
      toast('Vous ramassez : ' + C.ITEMS[prod].name);
    } else if (!a.petted) {
      if (!Farm.Game.useEnergy(C.ENERGY_COST.pet)) return;
      a.petted = true;
      a.happiness = clamp(a.happiness + 5, 0, 100);
      a.heartTimer = 1.5;
      toast(a.name + ' ❤');
    } else {
      toast(a.name + ' est contente !');
    }
  }

  function feedTrough(s, obj) {
    var C = cfg();
    var pen = C.getPen(obj.pen);
    var ps = penState(s, obj.pen);
    if (!pen || !ps) return;
    if (ps.troughFull) {
      toast('La mangeoire est déjà pleine.');
      return;
    }
    var need = pen.count;
    var have = s.inventory.feed || 0;
    if (have < need) {
      toast('Il faut ' + need + ' foin (vous en avez ' + have + '). Achetez-en au marché.');
      return;
    }
    if (!Farm.Game.useEnergy(C.ENERGY_COST.feed)) return;
    Farm.Game.removeItem('feed', need);
    ps.troughFull = true;
    toast('Mangeoire remplie : ' + pen.label);
  }

  function interactObject(s, obj) {
    var C = cfg();
    switch (obj.type) {
      case 'trough':
        feedTrough(s, obj);
        return;
      case 'well':
        s.water = C.WATER_MAX;
        toast('Arrosoir rempli.');
        return;
      case 'bin':
        sellAll();
        return;
      case 'shop':
        if (Farm.UI && Farm.UI.openShop) Farm.UI.openShop();
        return;
      case 'door':
        if (Farm.UI && Farm.UI.confirm) {
          Farm.UI.confirm('Aller dormir ? La journée se terminera.', function () {
            Farm.Game.sleep(false);
          });
        }
        return;
    }
  }

  function harvest(s, plot) {
    var C = cfg();
    var def = C.CROPS[plot.crop];
    if (!Farm.Game.useEnergy(C.ENERGY_COST.harvest)) return;
    Farm.Game.addItem(def.item, 1);
    plot.crop = null;
    plot.daysGrown = 0;
    plot.watered = false;
    s.stats.harvestedToday++;
    toast('Récolte : ' + def.name + ' !');
  }

  function till(s, plot) {
    if (plot.tilled) {
      toast('Le sol est déjà labouré.');
      return;
    }
    if (!Farm.Game.useEnergy(cfg().ENERGY_COST.till)) return;
    plot.tilled = true;
    toast('Sol labouré.');
  }

  function plant(s, plot, seedId) {
    var C = cfg();
    var cropKey = null;
    Object.keys(C.CROPS).forEach(function (k) {
      if (C.CROPS[k].seed === seedId) cropKey = k;
    });
    if (!cropKey) return;
    if (!plot.tilled) {
      toast('Le sol doit être labouré (houe).');
      return;
    }
    if (plot.crop) {
      toast('Cette case est déjà plantée.');
      return;
    }
    if ((s.inventory[seedId] || 0) < 1) {
      toast('Plus de ' + C.ITEMS[seedId].name.toLowerCase() + ' en stock.');
      return;
    }
    if (!Farm.Game.useEnergy(C.ENERGY_COST.plant)) return;
    Farm.Game.removeItem(seedId, 1);
    plot.crop = cropKey;
    plot.daysGrown = 0;
    s.stats.plantedToday++;
    toast('Graines plantées : ' + C.CROPS[cropKey].name);
  }

  function water(s, plot) {
    if (!plot.crop) {
      toast('Rien à arroser ici.');
      return;
    }
    if (plot.watered) {
      toast('Déjà arrosé.');
      return;
    }
    if (s.water <= 0) {
      toast('Arrosoir vide ! Remplissez-le au puits.');
      return;
    }
    if (!Farm.Game.useEnergy(cfg().ENERGY_COST.water)) return;
    plot.watered = true;
    s.water -= 1;
    toast('Arrosé.');
  }

  function interactPlot(s, plot) {
    var C = cfg();
    if (C.isRipe(plot)) {
      harvest(s, plot);
      return;
    }
    var slot = C.HOTBAR[s.selectedSlot];
    if (!slot) return;
    if (slot.id === 'hoe') {
      till(s, plot);
    } else if (slot.id.indexOf('seed_') === 0) {
      plant(s, plot, slot.id);
    } else if (slot.id === 'can') {
      water(s, plot);
    }
  }

  function interact() {
    var s = Farm.Game.state;
    if (!s) return;
    if (Farm.UI && Farm.UI.isModalOpen && Farm.UI.isModalOpen()) return;

    var pt = Farm.Player.getFacingPoint();
    var animal = Farm.Animals.findNear(pt.x, pt.y, 12);
    var tile = Farm.Player.getFacingTile();
    var obj = Farm.World.getObjectAt(tile.tx, tile.ty);
    // Collecting a product wins; otherwise a facing object (e.g. trough) wins over petting.
    if (animal && (animal.hasProduct || !obj)) {
      interactAnimal(s, animal);
      return;
    }

    if (obj) {
      interactObject(s, obj);
      return;
    }

    var plot = Farm.Game.getPlot(tile.tx, tile.ty);
    if (plot) interactPlot(s, plot);
  }

  function buy(key, qty) {
    var s = Farm.Game.state;
    var it = cfg().ITEMS[key];
    qty = (qty === undefined) ? 1 : qty;
    if (!s || !it || !(it.buy > 0) || !(qty > 0)) return false;
    var cost = it.buy * qty;
    if (s.money < cost) {
      toast("Pas assez d'argent.");
      return false;
    }
    s.money -= cost;
    Farm.Game.addItem(key, qty);
    toast('Acheté : ' + qty + ' × ' + it.name);
    return true;
  }

  function sellAll() {
    var s = Farm.Game.state;
    if (!s) return 0;
    var ITEMS = cfg().ITEMS;
    var total = 0;
    Object.keys(ITEMS).forEach(function (k) {
      var it = ITEMS[k];
      var n = s.inventory[k] || 0;
      if (it.sell > 0 && n > 0) {
        total += n * it.sell;
        s.inventory[k] = 0;
      }
    });
    if (total > 0) {
      s.money += total;
      s.stats.soldToday += total;
      toast('Vendu pour ' + total + ' $ !');
    } else {
      toast('Rien à vendre.');
    }
    return total;
  }

  return { interact: interact, buy: buy, sellAll: sellAll };
})();
