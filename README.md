
# SoleHack RetroPE 0.14.3

A retro-style utility client for **Minecraft Pocket Edition 0.14.3**, written as a single ModPE script and loaded through **Toolbox for Minecraft PE** (or BlockLauncher).

It gives you a draggable category-column ClickGUI, 72 modules, a configurable HUD, in-chat dot commands and saveable config profiles, all from one `.js` file.

> **Not affiliated with Mojang, Microsoft or the Toolbox/BlockLauncher developers.** Minecraft is a trademark of Mojang AB.

---

## Features

- **ClickGUI**: five draggable, scrollable category columns (Combat, Movement, Player, Render, Misc). Tap a module to toggle it, long-press a module marked `+` to open its sliders.
- **72 modules** across all categories (full list below).
- **HUD**: watermark, rainbow arraylist, coordinates, FPS, TPS, ping, K/D, radar minimap, crosshair, hitmarker and target card.
- **Dot commands** typed in chat (`.t Fly`, `.vclip 5`, `.friend add Steve`, ...).
- **Config profiles**: save/load your module and slider setup, plus built-in `legit` and `blatant` presets.
- **Per-module error isolation**: if one module's API call fails on your build, the rest keep working. Use `.debug` to see which one failed.

---

## Requirements

| Requirement | Details |
|---|---|
| Device | Android phone or tablet |
| Game | Minecraft PE **0.14.3** (the version this script is built for) |
| Loader | **Toolbox for Minecraft PE** or **BlockLauncher** (any build that supports 0.14.x and ModPE scripts) |

---

## Installation and tutorial

### 1. Get the files
Download `SoleHack RetroPE 0.14.3.js` from this repository (open the file on GitHub, tap **Raw**, then save it, or use **Code → Download ZIP** and extract it). Keep it somewhere easy to find, like your Downloads folder.

### 2. Install the game and loader
1. Install **Minecraft PE 0.14.3** on your device.
2. Install **Toolbox for Minecraft PE** (or BlockLauncher) and open it once.

### 3. Import the script
1. Open Toolbox.
2. Go to **Manage ModPE Scripts** (the script manager).
3. Tap the add/import button and select `SoleHack RetroPE 0.14.3.js`.
4. Make sure the script is **enabled** (toggled on).

### 4. Launch the game
1. Start Minecraft **through Toolbox**, not from the normal app icon, otherwise the script won't load.
2. Create or join a world.
3. When the world loads you'll see `SoleHack RetroPE 0.14.3 loaded` in chat and a small **M** button in the top-left corner.

### 5. Use it
- Tap **M** to open the ClickGUI. Tap **X** (top-right) or **M** again to close it.
- **Drag** a category header to move that column around.
- **Tap** a module to toggle it (green = on, red = off). Blue buttons are one-shot actions.
- **Long-press** a module with a `+` to show its sliders.
- Enabled modules appear in the arraylist at the top-right.

### Updating
Re-import the new `.js` file in Toolbox's script manager (remove the old one first) and restart the game.

---

## Dot commands

Type these in the normal chat box. Messages starting with `.` are handled locally and are never sent to a server.

| Command | What it does |
|---|---|
| `.help` | Show command help |
| `.modules` | List all modules (green = on) |
| `.t <module>` | Toggle a module (or run an action module) |
| `.vclip <n>` | Teleport up (positive) or down (negative) by n blocks |
| `.hclip <n>` | Teleport n blocks forward |
| `.tp <x> <y> <z>` | Teleport to coordinates |
| `.friend add\|remove\|list <name>` | Manage the friends list used by Friends |
| `.config save <name>` | Save current modules and sliders as a profile |
| `.config load <name>` | Load a saved profile |
| `.config legit` / `.config blatant` | Apply a built-in preset |
| `.debug` | Toggle printing module errors to chat |

---

## Modules

### Combat (15)
Aura, MultiAura, Criticals, AimAssist, TriggerBot, AutoClicker, TargetStrafe, BowAura, Velocity, MoreKnockback, Hitbox, AntiBot, AutoArmor, AutoSoup, Regen

### Movement (18)
Fly, Speed, Glide, HighJump, LongJump, Step, Spider, Sneak, Jesus, NoFall, SafeWalk, EntitySpeed, IceSpeed, ReverseStep, NoWeb, Dolphin, VClip *(action)*, HClip *(action)*

### Player (10)
God, AutoTool, FastBreak, ChestStealer, InventoryManager, AutoEat, AutoSign, AntiAFK, AutoDrop, Derp

### Render (11)
FullBright, Radar, Crosshair, WeatherChanger, Hitmarker, TargetHUD, Zoom, Breadcrumbs, Watermark, ArrayList, Info

### Misc (18)
Nuker, Day, AutoScaffold, Tower, SpeedMine, FakePlayer, SoleSuffix, AutoEZ, Spammer, Announcer, SoundSpammer, FakeCreative, Friends, AutoCommand, ColorSign, AutoMLG, ConfigSave *(action)*, ConfigLoad *(action)*

---

## Customizing

Open the `.js` file in a text editor and change the presets near the top:

```javascript
var AUTO_COMMANDS = [];                       // e.g. ["/login mypassword"]
var SPAM_MSGS = [CLIENT_FULL];
var EZ_MSGS = ["EZ", "GG"];
var SIGN_LINES = ["SoleHack", "RetroPE", "0.14.3", ""];
var JUNK = [3, 13, 367, 375];                 // items InventoryManager removes
```

**Adding your own module** takes two steps:

1. Register it with `add("MyModule", "Misc", { Strength: S(1, 10, 5) });`
2. Define its logic: `T.MyModule = function (p) { /* runs every tick while enabled */ };`

Optional handlers: `E.MyModule` (runs when enabled), `D.MyModule` (runs when disabled), `A.MyModule` (for one-shot action modules registered with `{ act: true }`).

---

## Limitations

ModPE scripts can't send network packets or draw 3D graphics, so some things aren't possible and some modules only work locally.

- **Local-only modules**: Aura, MultiAura, TriggerBot, AutoClicker, Regen, AutoSoup, AutoEat, NoFall, AutoScaffold, Tower, AutoMLG, NoWeb and Nuker change your own client's state (damage and blocks). They work in **single-player and local worlds**, not on servers.
- **Not possible in ModPE**: packet-level modules (Reach, Blink, Timer, Disabler, ...) and 3D rendering modules (ESP, Tracers, X-Ray, ...).
- **BowAura** only aims. You still release the arrow yourself.
- **FakePlayer** spawns a nametagged villager as a test dummy.
- **Hitbox** only resizes players.
- **FPS** counts display frames, so it tracks screen refresh rate rather than the game's true render rate. **TPS** is your client's tick rate, not the server's.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| No **M** button / no load message | Launch the game through Toolbox. Check the script is enabled and that you're on 0.14.3. |
| A module does nothing | Type `.debug`, toggle the module, and read the error. The API call it names may not exist on your build. |
| Script fails to import | Make sure the file extension is `.js` and the file wasn't saved as `.txt` or with extra text from the browser. |
| GUI columns are off-screen | Drag the column headers, or reopen the GUI. |
| AutoTool/AutoArmor don't swap items | The script assumes hotbar slots 0-8 and a 45-slot inventory, which can differ by build. |
| Game crashes on load | Remove other ModPE scripts and try again to rule out conflicts. |

---
---

## License

Add the license of your choice (for example MIT) as a `LICENSE` file in the repository.
