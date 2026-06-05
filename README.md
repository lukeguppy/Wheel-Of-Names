# Wheel of Names

A customisable, browser-based spinning wheel for randomly picking names, with timers, sounds, themes, per-entry photos, and weighted odds.

**Live app:** [https://lukeguppy.github.io/Wheel-Of-Names/](https://lukeguppy.github.io/Wheel-Of-Names/)

**Repository:** [https://github.com/lukeguppy/Wheel-Of-Names](https://github.com/lukeguppy/Wheel-Of-Names)

## Features

### Entries and presets
- Add names one at a time or paste multiple names (one per line)
- Edit, reorder, and delete entries inline
- Save and load named presets
- Import and export name lists as `.txt` files
- Settings persist in your browser via `localStorage`

### Per-entry photos and weight
- Each name has a circular photo button for entry settings
- Add or replace a photo that appears on the wheel slice and in winner modals
- Set a **weight ratio** per entry (default `1`). Higher weight means a larger slice and better odds
- Weight badges appear on the photo button when the ratio is not `1`

### Wheel and visuals
- Click **SPIN**, tap the wheel, or press **Space** to spin
- 30+ wheel skins (beach ball, pizza, vinyl record, disco ball, and more)
- Colour themes: Neon, Sunset, Ocean, Pastel, Rainbow, Classic, or a custom hex palette
- Optional segment boundaries and casino-style peg ticker with pointer physics
- Confetti celebration when a winner is picked

### Sounds
- Spin tick sounds as segments pass the pointer
- Winner sound effects (random or a specific choice from a large library)
- Adjustable volume

### Winner countdown timer
- Optional countdown timer after a winner is selected
- Configurable duration (minutes and seconds)
- Auto-start, warning ticks, and multiple warning sound types
- Skip timer or let it run into the winner celebration modal

### Winner flow
- Celebration modal showing the winning name (with photo background when set)
- Remove the winner from the list or keep them for the next spin

## Getting started

### Use online
Open the live app: [https://lukeguppy.github.io/Wheel-Of-Names/](https://lukeguppy.github.io/Wheel-Of-Names/)

### Run locally
No build step required. It is a static site.

```bash
git clone git@github.com:lukeguppy/Wheel-Of-Names.git
cd Wheel-Of-Names
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Project structure

| File | Purpose |
|------|---------|
| `index.html` | App layout and modals |
| `app.js` | Wheel logic, presets, timer, and UI |
| `styles.css` | Styling |
| `skins.js` | Wheel skin rendering |
| `sounds.js` | Sound effect definitions |
| `sounds/` | Audio assets |

## Licence

Personal project. Use and adapt as you like.
