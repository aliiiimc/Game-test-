# Ferme Pixel — Farmer Simulator

Petit jeu de ferme en pixel art, 100 % navigateur : HTML + JavaScript + Canvas, sans dépendance ni build.
Tout le pixel art (fermier, animaux, décor, cultures) est dessiné **en code** dans `js/sprites_*.js`.

## Lancer le jeu

Ouvrez simplement `index.html` dans un navigateur (double-clic). La partie est sauvegardée
automatiquement dans le navigateur (localStorage).

## Le jeu

Chaque matin le coq chante : le fermier se réveille devant sa maison avec la **liste des tâches du jour**.

- **Poulailler + 4 étables** (vaches, cochons, moutons, chèvres) : remplissez les mangeoires avec du foin.
  Un animal nourri produit pendant la nuit : œufs, lait, truffes, laine, lait de chèvre. Ramassez-les,
  caressez vos animaux pour les rendre heureux.
- **Champ de 50 parcelles** : labourez (houe), plantez (blé, maïs, carotte), arrosez (l'arrosoir se
  remplit au puits). Une culture arrosée pousse d'un jour chaque nuit, puis se récolte.
- **Caisse d'expédition** : vend tous vos produits et récoltes. **Marché** : achetez graines et foin.
- **Maison** : allez dormir pour passer au jour suivant. À minuit, le fermier s'évanouit de fatigue.
- Chaque tâche accomplie rapporte un bonus.

## Commandes

| Touche | Action |
|---|---|
| ZQSD / WASD / Flèches | Se déplacer |
| E / Espace | Agir (devant soi) |
| 1 à 6 | Choisir l'outil (houe, arrosoir, graines, foin) |
| Échap | Fermer une fenêtre |

## Structure

Voir [`ARCHITECTURE.md`](ARCHITECTURE.md) pour le contrat entre les modules (`config`, `sprites`,
`world`, `animals`, `player`, `state`, `tasks`, `interact`, `ui`, `main`).
Vérifier les sprites : `node tools/check_sprites.js js/sprites_world.js js/sprites_animals.js`.
