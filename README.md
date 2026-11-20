# Reel Instagram : IPO record d'Anthropic (Remotion)

Vidéo verticale 1080x1920, 30 fps, 32 s, en français.
Collaboration CGI ENSA Marrakech x [Club finance].

## Commandes

```bash
npm install
npm run dev          # Remotion Studio (aperçu)
npm run typecheck    # npx tsc --noEmit
npm run render       # → out/anthropic-ipo.mp4 (H.264)
```

Si Google Fonts est inaccessible (hors ligne, proxy), utilisez les polices
incluses dans `public/fonts/` : `npm run render:local-fonts`.

## Où modifier quoi

Tout est dans **`src/config.ts`** :

| Constante | Rôle |
|---|---|
| `SCENE_DURATIONS` | durée de chaque scène (secondes) |
| `VOICEOVER` | texte + début/fin de chaque phrase dans `voiceover.mp3` (sous-titres et baisse de la musique) |
| `TEXTS`, `CLUB_NAME` | tous les textes à l'écran |
| `COLORS` | palette |
| `AUDIO` | volumes, ducking, fondus, décalage des whoosh |
| `TIMINGS` | timings internes des animations |
| `SAFE_MARGIN` | marge de sécurité haut/bas (250 px) |

## Audio (`public/`)

| Fichier | Usage |
|---|---|
| `voiceover.mp3` | voix off complète (un seul fichier, 100 %) |
| `music.mp3` | musique de fond (30 %, 10 % sous la voix, fondus entrée/sortie) |
| `whoosh.mp3` | à chaque transition de scène |
| `tick.mp3` | en boucle pendant le compteur de la scène 3 |
| `impact.mp3` | sur « 93,5 milliards » et « Bulle ou révolution ? » |

Les fichiers fournis sont vides. Un fichier absent, vide ou illisible est
ignoré automatiquement (détection dans `src/lib/audio-probe.ts`) : la vidéo se
génère quand même.
