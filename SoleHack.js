// SoleHack RetroPE 0.14.3
// ModPE script for Toolbox / BlockLauncher
//
// In-game dot commands (type in chat):
//   .help  .modules  .t <module>  .vclip <n>  .hclip <n>  .tp <x> <y> <z>
//   .friend add|remove|list <name>   .config save|load <name>   .config legit|blatant
//   .debug   (prints module errors so you can see which API call failed)

var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
var AW = android.widget;
var Color = android.graphics.Color;
var Gravity = android.view.Gravity;
var dm = ctx.getResources().getDisplayMetrics();
var dens = dm.density;
var scrH = dm.heightPixels;
function px(n) { return Math.round(n * dens); }
function round2(n) { return Math.round(n * 100) / 100; }
function rad(d) { return d * Math.PI / 180; }
function deg(r) { return r * 180 / Math.PI; }

var CLIENT_NAME = "SoleHack RetroPE";
var CLIENT_VER = "0.14.3";
var CLIENT_FULL = CLIENT_NAME + " " + CLIENT_VER;

// ---------- user-editable presets ----------
var AUTO_COMMANDS = [];                       // e.g. ["/login mypassword"]
var SPAM_MSGS = [CLIENT_FULL];
var EZ_MSGS = ["EZ", "GG"];
var SIGN_LINES = ["SoleHack", "RetroPE", "0.14.3", ""];
var JUNK = [3, 13, 367, 375];                 // dirt, gravel, rotten flesh, spider eye

// ================= Module registry =================
var CATS = ["Combat", "Movement", "Player", "Render", "Misc"];
var M = {};
function S(min, max, v) { return { min: min, max: max, v: v }; }
function add(name, cat, s, flags) {
    M[name] = { cat: cat, on: false, s: s || {}, act: !!(flags && flags.act), hud: !!(flags && flags.hud) };
}

// Combat
add("Aura", "Combat", { Range: S(2, 8, 4), Damage: S(1, 10, 4), Delay: S(1, 20, 6) });
add("MultiAura", "Combat", { Range: S(2, 8, 4), Damage: S(1, 10, 3), Delay: S(1, 20, 8) });
add("Criticals", "Combat");
add("AimAssist", "Combat", { Range: S(2, 8, 5), Smooth: S(1, 20, 6), FOV: S(20, 180, 90) });
add("TriggerBot", "Combat", { Damage: S(1, 10, 4) });
add("AutoClicker", "Combat", { CPS: S(1, 20, 8), Damage: S(1, 10, 4) });
add("TargetStrafe", "Combat", { Range: S(2, 10, 6), Distance: S(1, 6, 3) });
add("BowAura", "Combat", { Range: S(5, 40, 25) });
add("Velocity", "Combat", { Horizontal: S(0, 100, 100), Vertical: S(0, 100, 100) });
add("MoreKnockback", "Combat", { Strength: S(0.1, 2, 0.6) });
add("Hitbox", "Combat", { Size: S(0.6, 2, 1.2) });
add("AntiBot", "Combat");
add("AutoArmor", "Combat");
add("AutoSoup", "Combat", { Health: S(2, 19, 10) });
add("Regen", "Combat", { Delay: S(5, 60, 20) });

// Movement
add("Fly", "Movement");
add("Speed", "Movement", { Multiplier: S(1, 4, 1.5) });
add("Glide", "Movement", { Fall: S(0.02, 0.3, 0.08) });
add("HighJump", "Movement", { Multiplier: S(1.2, 3, 1.8) });
add("LongJump", "Movement", { Boost: S(0.3, 1.5, 0.7) });
add("Step", "Movement");
add("Spider", "Movement");
add("Sneak", "Movement");
add("Jesus", "Movement");
add("NoFall", "Movement");
add("SafeWalk", "Movement");
add("EntitySpeed", "Movement", { Multiplier: S(1, 3, 1.5) });
add("IceSpeed", "Movement", { Multiplier: S(1, 3, 1.5) });
add("ReverseStep", "Movement");
add("NoWeb", "Movement");
add("Dolphin", "Movement", { Multiplier: S(1, 3, 1.5) });
add("VClip", "Movement", { Distance: S(-10, 10, 3) }, { act: true });
add("HClip", "Movement", { Distance: S(1, 10, 3) }, { act: true });

// Player
add("God", "Player");
add("AutoTool", "Player");
add("FastBreak", "Player", { Delay: S(1, 20, 4) });
add("ChestStealer", "Player");
add("InventoryManager", "Player");
add("AutoEat", "Player", { Hunger: S(1, 19, 14) });
add("AutoSign", "Player");
add("AntiAFK", "Player");
add("AutoDrop", "Player", { Slot: S(0, 8, 8), Delay: S(1, 40, 10) });
add("Derp", "Player");

// Render
add("FullBright", "Render");
add("Radar", "Render", { Range: S(10, 60, 30) });
add("Crosshair", "Render");
add("WeatherChanger", "Render");
add("Hitmarker", "Render");
add("TargetHUD", "Render");
add("Zoom", "Render", { FOV: S(10, 60, 30) });
add("Breadcrumbs", "Render");
add("Watermark", "Render", {}, { hud: true });
add("ArrayList", "Render", {}, { hud: true });
add("Info", "Render", {}, { hud: true });
M.Watermark.on = true; M.ArrayList.on = true; M.Info.on = true;

// Misc
add("Nuker", "Misc", { Radius: S(1, 4, 2) });
add("Day", "Misc");
add("AutoScaffold", "Misc");
add("Tower", "Misc");
add("SpeedMine", "Misc");
add("FakePlayer", "Misc");
add("SoleSuffix", "Misc");
add("AutoEZ", "Misc");
add("Spammer", "Misc", { Seconds: S(3, 60, 10) });
add("Announcer", "Misc", { Seconds: S(5, 60, 15) });
add("SoundSpammer", "Misc", { Delay: S(1, 20, 3) });
add("FakeCreative", "Misc");
add("Friends", "Misc");
add("AutoCommand", "Misc");
add("ColorSign", "Misc");
add("AutoMLG", "Misc");
add("ConfigSave", "Misc", { Slot: S(1, 5, 1) }, { act: true });
add("ConfigLoad", "Misc", { Slot: S(1, 5, 1) }, { act: true });
M.Friends.on = true;

var T = {};   // tick handlers
var A = {};   // action handlers (act modules)
var E = {};   // enable handlers
var D = {};   // disable handlers

var DEBUG = false;
var shownErr = {};

// ================= GUI =================
var ON = Color.argb(220, 40, 160, 60);
var OFF = Color.argb(220, 160, 40, 40);
var ACT = Color.argb(220, 50, 90, 160);
var gui = null, btnWin = null;

function makeSlider(sname, st) {
    var row = new AW.LinearLayout(ctx);
    row.setOrientation(1);
    row.setBackgroundColor(Color.argb(220, 50, 50, 50));
    row.setPadding(px(8), px(4), px(8), px(4));

    var lbl = new AW.TextView(ctx);
    lbl.setTextColor(Color.WHITE);
    lbl.setTextSize(12);
    lbl.setText(sname + ": " + round2(st.v));
    row.addView(lbl);

    var bar = new AW.SeekBar(ctx);
    bar.setMax(100);
    bar.setProgress(Math.round((st.v - st.min) / (st.max - st.min) * 100));
    bar.setOnSeekBarChangeListener(new AW.SeekBar.OnSeekBarChangeListener({
        onProgressChanged: function (sb, prog, fromUser) {
            st.v = st.min + (st.max - st.min) * prog / 100;
            lbl.setText(sname + ": " + round2(st.v));
        },
        onStartTrackingTouch: function (sb) {},
        onStopTrackingTouch: function (sb) {}
    }));
    row.addView(bar);
    return row;
}

function makeModuleRow(name) {
    var mod = M[name];
    var box = new AW.LinearLayout(ctx);
    box.setOrientation(1);

    var hasSettings = false;
    for (var k in mod.s) hasSettings = true;

    var label = new AW.TextView(ctx);
    label.setText(name + (hasSettings ? "  +" : ""));
    label.setTextColor(Color.WHITE);
    label.setTextSize(14);
    label.setPadding(px(10), px(9), px(10), px(9));
    function paint() { label.setBackgroundColor(mod.act ? ACT : (mod.on ? ON : OFF)); }
    paint();
    box.addView(label);

    var panel = null;
    if (hasSettings) {
        panel = new AW.LinearLayout(ctx);
        panel.setOrientation(1);
        panel.setVisibility(8); // GONE
        for (var sn in mod.s) panel.addView(makeSlider(sn, mod.s[sn]));
        box.addView(panel);
    }

    label.setOnClickListener(new android.view.View.OnClickListener({
        onClick: function (v) {
            if (mod.act) {
                try { A[name](); } catch (e) { clientMessage("\u00a7c" + name + ": " + e); }
                return;
            }
            setModule(name, !mod.on);
            paint();
        }
    }));
    label.setOnLongClickListener(new android.view.View.OnLongClickListener({
        onLongClick: function (v) {
            if (panel != null) panel.setVisibility(panel.getVisibility() == 0 ? 8 : 0);
            return true;
        }
    }));
    return box;
}

function makeColumn(cat) {
    var col = new AW.LinearLayout(ctx);
    col.setOrientation(1);
    col.setLayoutParams(new AW.FrameLayout.LayoutParams(px(120), -2));

    var header = new AW.TextView(ctx);
    header.setText(cat);
    header.setTextColor(Color.WHITE);
    header.setTextSize(16);
    header.setGravity(Gravity.CENTER);
    header.setPadding(px(10), px(10), px(10), px(10));
    header.setBackgroundColor(Color.argb(240, 25, 25, 25));
    col.addView(header);

    // drag by header
    var dX = 0, dY = 0;
    header.setOnTouchListener(new android.view.View.OnTouchListener({
        onTouch: function (v, ev) {
            var a = ev.getAction();
            if (a == 0) { dX = col.getX() - ev.getRawX(); dY = col.getY() - ev.getRawY(); }
            else if (a == 2) { col.setX(ev.getRawX() + dX); col.setY(ev.getRawY() + dY); }
            return true;
        }
    }));

    // scrollable module list
    var sv = new AW.ScrollView(ctx);
    var list = new AW.LinearLayout(ctx);
    list.setOrientation(1);
    for (var name in M) if (M[name].cat == cat) list.addView(makeModuleRow(name));
    sv.addView(list);
    var colH = Math.min(px(320), scrH - px(130));
    col.addView(sv, new AW.LinearLayout.LayoutParams(-1, colH));
    return col;
}

function toggleGui() {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        try {
            if (gui != null && gui.isShowing()) { gui.dismiss(); return; }

            var root = new AW.FrameLayout(ctx);
            root.setBackgroundColor(Color.argb(90, 0, 0, 0));

            var title = new AW.TextView(ctx);
            title.setText(CLIENT_FULL);
            title.setTextColor(Color.WHITE);
            title.setTextSize(18);
            title.setGravity(Gravity.CENTER);
            title.setBackgroundColor(Color.argb(230, 25, 25, 25));
            root.addView(title, new AW.FrameLayout.LayoutParams(-1, px(44), Gravity.TOP));

            for (var i = 0; i < CATS.length; i++) {
                var col = makeColumn(CATS[i]);
                root.addView(col);
                col.setX(px(10 + i * 125));
                col.setY(px(50));
            }

            var close = new AW.TextView(ctx);
            close.setText("X");
            close.setTextColor(Color.WHITE);
            close.setTextSize(20);
            close.setGravity(Gravity.CENTER);
            close.setBackgroundColor(Color.argb(220, 160, 40, 40));
            close.setOnClickListener(new android.view.View.OnClickListener({
                onClick: function (v) { gui.dismiss(); }
            }));
            root.addView(close, new AW.FrameLayout.LayoutParams(px(44), px(44), Gravity.TOP | Gravity.RIGHT));

            gui = new AW.PopupWindow(root, -1, -1, false);
            gui.showAtLocation(ctx.getWindow().getDecorView(), Gravity.TOP | Gravity.LEFT, 0, 0);
        } catch (e) { clientMessage("GUI error: " + e); }
    }}));
}

function closeGui() {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        if (gui != null && gui.isShowing()) gui.dismiss();
    }}));
}

function showMenuButton() {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        try {
            if (btnWin != null && btnWin.isShowing()) return;
            var btn = new AW.Button(ctx);
            btn.setText("M");
            btn.setOnClickListener(new android.view.View.OnClickListener({
                onClick: function (v) { toggleGui(); }
            }));
            btnWin = new AW.PopupWindow(btn, px(48), px(48));
            btnWin.showAtLocation(ctx.getWindow().getDecorView(), Gravity.TOP | Gravity.LEFT, 0, 0);
        } catch (e) { clientMessage("Button error: " + e); }
    }}));
}

// ================= HUD =================
var MONO = android.graphics.Typeface.MONOSPACE;
var hud = null, hudWm = null, hudList = null, hudInfo = null;
var hudRadar = null, hudCross = null, hudHit = null, hudTarget = null;
var hudSig = "", hudGen = 0, hudCounter = 0;
var kills = 0, deaths = 0;
var fps = 0, tps = 20, ping = -1;
var tickCount = 0, lastTpsT = 0;

var RADAR_PX = px(110);
var radarBmp = null, radarCv = null, radarPt = null;

function initRadar() {
    radarBmp = android.graphics.Bitmap.createBitmap(RADAR_PX, RADAR_PX, android.graphics.Bitmap.Config.ARGB_8888);
    radarCv = new android.graphics.Canvas(radarBmp);
    radarPt = new android.graphics.Paint();
    radarPt.setAntiAlias(true);
}

function drawRadar(pts) {
    var c = radarCv, pt = radarPt, h = RADAR_PX / 2;
    var FILL = android.graphics.Paint.Style.FILL, STROKE = android.graphics.Paint.Style.STROKE;
    c.drawColor(0, android.graphics.PorterDuff.Mode.CLEAR);
    pt.setStyle(FILL);
    pt.setColor(Color.argb(130, 0, 0, 0));
    c.drawCircle(h, h, h - 1, pt);
    pt.setStyle(STROKE);
    pt.setColor(Color.argb(200, 200, 200, 200));
    c.drawCircle(h, h, h - 1, pt);
    pt.setColor(Color.argb(90, 255, 255, 255));
    c.drawLine(h, 2, h, RADAR_PX - 2, pt);
    c.drawLine(2, h, RADAR_PX - 2, h, pt);
    pt.setStyle(FILL);
    for (var i = 0; i < pts.length; i++) {
        pt.setColor(pts[i][2]);
        c.drawCircle(h + pts[i][0] * (h - 6), h - pts[i][1] * (h - 6), px(3), pt);
    }
    pt.setColor(Color.WHITE);
    c.drawCircle(h, h, px(3), pt);
}

function hudText(color, size) {
    var tv = new AW.TextView(ctx);
    tv.setTextColor(color);
    tv.setTextSize(size);
    tv.setTypeface(MONO);
    tv.setShadowLayer(2, 1, 1, Color.BLACK);
    return tv;
}

function showHud() {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        try {
            if (hud != null && hud.isShowing()) return;
            var root = new AW.FrameLayout(ctx);

            hudWm = hudText(Color.WHITE, 16);
            hudWm.setText(CLIENT_FULL);
            var lp1 = new AW.FrameLayout.LayoutParams(-2, -2, Gravity.TOP | Gravity.LEFT);
            lp1.setMargins(px(56), px(8), 0, 0);
            root.addView(hudWm, lp1);

            hudInfo = hudText(Color.WHITE, 12);
            var lp3 = new AW.FrameLayout.LayoutParams(-2, -2, Gravity.TOP | Gravity.LEFT);
            lp3.setMargins(px(8), px(58), 0, 0);
            root.addView(hudInfo, lp3);

            hudList = new AW.LinearLayout(ctx);
            hudList.setOrientation(1);
            var lp2 = new AW.FrameLayout.LayoutParams(-2, -2, Gravity.TOP | Gravity.RIGHT);
            lp2.setMargins(0, px(8), px(8), 0);
            root.addView(hudList, lp2);

            // radar: left side, middle
            if (radarBmp == null) initRadar();
            hudRadar = new AW.ImageView(ctx);
            hudRadar.setImageBitmap(radarBmp);
            hudRadar.setVisibility(8);
            var lp4 = new AW.FrameLayout.LayoutParams(RADAR_PX, RADAR_PX, Gravity.LEFT | Gravity.CENTER_VERTICAL);
            lp4.setMargins(px(8), px(50), 0, 0);
            root.addView(hudRadar, lp4);

            // crosshair + hitmarker: screen centre
            hudCross = hudText(Color.WHITE, 22);
            hudCross.setText("+");
            hudCross.setVisibility(8);
            root.addView(hudCross, new AW.FrameLayout.LayoutParams(-2, -2, Gravity.CENTER));

            hudHit = hudText(Color.RED, 26);
            hudHit.setText("X");
            hudHit.setVisibility(8);
            root.addView(hudHit, new AW.FrameLayout.LayoutParams(-2, -2, Gravity.CENTER));

            // target card: below centre
            hudTarget = hudText(Color.WHITE, 12);
            hudTarget.setBackgroundColor(Color.argb(130, 0, 0, 0));
            hudTarget.setPadding(px(6), px(3), px(6), px(3));
            hudTarget.setVisibility(8);
            var lp5 = new AW.FrameLayout.LayoutParams(-2, -2, Gravity.CENTER);
            lp5.setMargins(0, px(90), 0, 0);
            root.addView(hudTarget, lp5);

            hud = new AW.PopupWindow(root, -1, -1, false);
            hud.setTouchable(false);
            hud.showAtLocation(ctx.getWindow().getDecorView(), Gravity.TOP | Gravity.LEFT, 0, 0);
        } catch (e) { clientMessage("HUD error: " + e); }
    }}));
}

function hideHud() {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        if (hud != null && hud.isShowing()) hud.dismiss();
    }}));
}

function updateHud() {
    var p = getPlayerEnt();
    var kd = deaths == 0 ? kills : round2(kills / deaths);
    var pingTxt = ping < 0 ? "--" : ping + "ms";
    var infoText =
        "XYZ " + Math.floor(Player.getX()) + " " + Math.floor(Player.getY()) + " " + Math.floor(Player.getZ()) +
        "\nFPS " + fps + "  TPS " + tps +
        "\nPing " + pingTxt +
        "\nK/D " + kills + "/" + deaths + " (" + kd + ")";

    var names = [];
    for (var n in M) if (M[n].on && !M[n].hud && !M[n].act) names.push(n);
    names.sort(function (a, b) { return b.length - a.length; });
    var sig = names.join(",") + (M.ArrayList.on ? "1" : "0");
    var rebuild = (sig != hudSig);
    hudSig = sig;

    // radar points
    var pts = null;
    if (M.Radar.on) {
        pts = [];
        var range = M.Radar.s.Range.v;
        var x0 = Entity.getX(p), z0 = Entity.getZ(p), yw = rad(Entity.getYaw(p));
        var sn = Math.sin(yw), cs = Math.cos(yw);
        var ents = Entity.getAll();
        for (var i = 0; i < ents.length; i++) {
            var e = ents[i];
            if (e == p || EXCL[Entity.getEntityTypeId(e)]) continue;
            var dx = Entity.getX(e) - x0, dz = Entity.getZ(e) - z0;
            var rt = -dx * cs - dz * sn;
            var fw = -dx * sn + dz * cs;
            if (rt * rt + fw * fw > range * range) continue;
            var col = isFriend(e) ? Color.GREEN : (isPlayerEnt(e) ? Color.RED : Color.YELLOW);
            pts.push([rt / range, fw / range, col]);
        }
    }

    // target card
    var tText = "";
    if (M.TargetHUD.on) {
        var te = Player.getPointedEntity();
        if (te == -1 && lastTargetT > 0) te = lastTarget;
        if (te != -1 && Entity.getHealth(te) > 0) {
            var nm = ("" + Entity.getNameTag(te)).replace(/\u00a7./g, "");
            if (nm == "") nm = isPlayerEnt(te) ? "Player" : "Mob";
            var dxx = Entity.getX(te) - Entity.getX(p), dyy = Entity.getY(te) - Entity.getY(p), dzz = Entity.getZ(te) - Entity.getZ(p);
            tText = nm + "\nHP " + Math.round(Entity.getHealth(te)) + "/" + Math.round(Entity.getMaxHealth(te)) +
                    "\nDist " + round2(Math.sqrt(dxx * dxx + dyy * dyy + dzz * dzz));
        }
    }

    var crossRed = M.Crosshair.on && Player.getPointedEntity() != -1;
    var showHitmark = M.Hitmarker.on && hitFlash > 0;

    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        try {
            if (hud == null || !hud.isShowing()) return;
            hudWm.setVisibility(M.Watermark.on ? 0 : 8);
            hudInfo.setVisibility(M.Info.on ? 0 : 8);
            hudInfo.setText(infoText);

            if (rebuild) {
                hudList.removeAllViews();
                if (M.ArrayList.on) {
                    for (var i = 0; i < names.length; i++) {
                        var tv = hudText(Color.rgb(
                            Math.floor(127 + 127 * Math.sin(i * 0.5)),
                            Math.floor(127 + 127 * Math.sin(i * 0.5 + 2)),
                            Math.floor(127 + 127 * Math.sin(i * 0.5 + 4))), 14);
                        tv.setText(names[i]);
                        tv.setGravity(Gravity.RIGHT);
                        hudList.addView(tv);
                    }
                }
            }

            if (pts != null) {
                drawRadar(pts);
                hudRadar.invalidate();
                hudRadar.setVisibility(0);
            } else hudRadar.setVisibility(8);

            hudCross.setVisibility(M.Crosshair.on ? 0 : 8);
            hudCross.setTextColor(crossRed ? Color.RED : Color.WHITE);
            hudHit.setVisibility(showHitmark ? 0 : 8);

            if (tText != "") { hudTarget.setText(tText); hudTarget.setVisibility(0); }
            else hudTarget.setVisibility(8);
        } catch (e) {}
    }}));
}

// FPS: counts frames on the UI thread
function startFps(gen) {
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        try {
            var frames = 0, last = java.lang.System.currentTimeMillis();
            var cb = new android.view.Choreographer.FrameCallback({
                doFrame: function (nanos) {
                    if (gen != hudGen) return;
                    frames++;
                    var now = java.lang.System.currentTimeMillis();
                    if (now - last >= 1000) { fps = frames; frames = 0; last = now; }
                    android.view.Choreographer.getInstance().postFrameCallback(cb);
                }
            });
            android.view.Choreographer.getInstance().postFrameCallback(cb);
        } catch (e) { clientMessage("FPS error: " + e); }
    }}));
}

// Ping: background thread, only when connected to a server
function startPing(gen) {
    new java.lang.Thread(new java.lang.Runnable({ run: function () {
        while (gen == hudGen) {
            try {
                var addr = Server.getAddress();
                if (addr == null) {
                    ping = -1;
                } else {
                    var t0 = java.lang.System.currentTimeMillis();
                    var ok = java.net.InetAddress.getByName(addr).isReachable(1500);
                    ping = ok ? Math.round(java.lang.System.currentTimeMillis() - t0) : -1;
                }
            } catch (e) { ping = -1; }
            java.lang.Thread.sleep(3000);
        }
    }})).start();
}

// ================= Helpers =================
var NONSOLID = {0:1,6:1,8:1,9:1,10:1,11:1,30:1,31:1,32:1,37:1,38:1,39:1,40:1,50:1,51:1,55:1,59:1,63:1,65:1,66:1,68:1,69:1,70:1,72:1,75:1,76:1,77:1,78:1,83:1,106:1,111:1,141:1,142:1,175:1};
var EXCL = {64:1,65:1,66:1,69:1,80:1,81:1,82:1,83:1,84:1,90:1};

function solid(id) { return id != 0 && !NONSOLID[id]; }
function liquid(id) { return id >= 8 && id <= 11; }
function tileAt(x, y, z) { return Level.getTile(Math.floor(x), Math.floor(y), Math.floor(z)); }
function feetY(p) { return Entity.getY(p) - 1.62; }
function hvel(p) {
    var vx = Entity.getVelX(p), vz = Entity.getVelZ(p);
    return { x: vx, z: vz, s: Math.sqrt(vx * vx + vz * vz) };
}
function lookDir(p) {
    var y = rad(Entity.getYaw(p));
    return { x: -Math.sin(y), z: Math.cos(y) };
}
function onGround(p) {
    return Math.abs(Entity.getVelY(p)) < 0.1 && solid(tileAt(Entity.getX(p), feetY(p) - 0.1, Entity.getZ(p)));
}
function boost(p, factor, cap) {
    var h = hvel(p);
    if (h.s < 0.03) return;
    var ns = Math.min(h.s * factor, Math.max(cap, h.s));
    Entity.setVelX(p, h.x / h.s * ns);
    Entity.setVelZ(p, h.z / h.s * ns);
}
function isPlayerEnt(e) {
    try { if (Entity.getEntityTypeId(e) == 63) return true; } catch (x) {}
    try { return Player.isPlayer(e); } catch (x2) { return false; }
}
function say(msg) {
    try {
        if (Server.getAddress() != null) Server.sendChat(msg);
        else clientMessage("<You> " + msg);
    } catch (e) {}
}

// inventory
var INV_MAX = 45;
function findInv(ids, from, to) {
    for (var i = from; i < to; i++) {
        var id = Player.getInventorySlot(i);
        if (id > 0 && ids.indexOf(id) >= 0) return i;
    }
    return -1;
}
function consumeSlot(i) {
    var id = Player.getInventorySlot(i), c = Player.getInventorySlotCount(i), d = Player.getInventorySlotData(i);
    if (c <= 1) Player.clearInventorySlot(i);
    else Player.setInventorySlot(i, id, c - 1, d);
}
function useCarried(p) {
    if (Level.getGameMode() == 1) return;
    var id = Player.getCarriedItem(), c = Player.getCarriedItemCount(), d = Player.getCarriedItemData();
    if (c <= 1) Entity.setCarriedItem(p, 0, 0, 0);
    else Entity.setCarriedItem(p, id, c - 1, d);
}

// friends
var friends = [];
function loadFriends() {
    try {
        var s = "" + ModPE.readData("srp_friends");
        friends = s == "" ? [] : s.split(",");
    } catch (e) { friends = []; }
}
function saveFriends() { try { ModPE.saveData("srp_friends", friends.join(",")); } catch (e) {} }
function isFriend(e) {
    if (!M.Friends.on || friends.length == 0) return false;
    var nm = ("" + Entity.getNameTag(e)).replace(/\u00a7./g, "").toLowerCase();
    return friends.indexOf(nm) >= 0;
}

// targeting
var lastTarget = -1, lastTargetT = 0, hitFlash = 0;
var evKills = 0, evMined = 0, evDmg = 0;

function serverHas(e) {
    var a = Server.getAllPlayers();
    if (a == null) return false;
    for (var i = 0; i < a.length; i++) if (a[i] == e) return true;
    return false;
}
function validTarget(p, e) {
    if (e == p) return false;
    if (EXCL[Entity.getEntityTypeId(e)]) return false;
    if (Entity.getHealth(e) <= 0) return false;
    if (isFriend(e)) return false;
    if (M.AntiBot.on && isPlayerEnt(e) && !serverHas(e)) return false;
    return true;
}
function targetsIn(p, range) {
    var out = [], r2 = range * range, ents = Entity.getAll();
    var x = Entity.getX(p), y = Entity.getY(p), z = Entity.getZ(p);
    for (var i = 0; i < ents.length; i++) {
        var e = ents[i];
        if (!validTarget(p, e)) continue;
        var dx = Entity.getX(e) - x, dy = Entity.getY(e) - y, dz = Entity.getZ(e) - z;
        var d = dx * dx + dy * dy + dz * dz;
        if (d < r2) out.push({ e: e, d: d });
    }
    out.sort(function (a, b) { return a.d - b.d; });
    return out;
}
function nearest(p, range) {
    var t = targetsIn(p, range);
    return t.length ? t[0].e : -1;
}
function ez() { say(EZ_MSGS[Math.floor(Math.random() * EZ_MSGS.length)]); }
// Local damage: only affects worlds where the game trusts the client (single-player / local worlds).
function hit(e, dmg) {
    var hp = Entity.getHealth(e);
    Entity.setHealth(e, hp - dmg);
    lastTarget = e; lastTargetT = 100; hitFlash = 4;
    if (hp - dmg <= 0) { kills++; evKills++; if (M.AutoEZ.on) ez(); }
}
function aimAt(p, e, smooth, pitchAdd, fov) {
    var dx = Entity.getX(e) - Entity.getX(p), dy = Entity.getY(e) - Entity.getY(p), dz = Entity.getZ(e) - Entity.getZ(p);
    var hd = Math.sqrt(dx * dx + dz * dz);
    var ty = deg(Math.atan2(-dx, dz));
    var tp = -deg(Math.atan2(dy, hd)) + (pitchAdd || 0);
    var cy = Entity.getYaw(p), cp = Entity.getPitch(p);
    var dyaw = ty - cy;
    while (dyaw > 180) dyaw -= 360;
    while (dyaw < -180) dyaw += 360;
    if (fov && Math.abs(dyaw) > fov / 2) return false;
    Entity.setRot(p, cy + dyaw / smooth, cp + (tp - cp) / smooth);
    return true;
}

// per-tick shared state
var tickN = 0, vyNow = 0, lastVy = 0, jumped = false;
var hpNow = 20, lastHp = 20, kbTicks = 0, fallT = 0;

// ================= Combat modules =================
var auraT = 0, multiT = 0, tbT = 0, acT = 0, regenT = 0, soupCd = 0, armorT = 0, hbT = 0;
var hbList = [];

T.Aura = function (p) {
    if (++auraT < Math.round(M.Aura.s.Delay.v)) return;
    auraT = 0;
    var e = nearest(p, M.Aura.s.Range.v);
    if (e != -1) hit(e, Math.round(M.Aura.s.Damage.v));
};

T.MultiAura = function (p) {
    if (++multiT < Math.round(M.MultiAura.s.Delay.v)) return;
    multiT = 0;
    var t = targetsIn(p, M.MultiAura.s.Range.v);
    for (var i = 0; i < t.length; i++) hit(t[i].e, Math.round(M.MultiAura.s.Damage.v));
};

T.AimAssist = function (p) {
    var e = nearest(p, M.AimAssist.s.Range.v);
    if (e != -1) aimAt(p, e, Math.max(1, M.AimAssist.s.Smooth.v), 0, M.AimAssist.s.FOV.v);
};

T.TriggerBot = function (p) {
    if (tbT > 0) { tbT--; return; }
    var pe = Player.getPointedEntity();
    if (pe != -1 && validTarget(p, pe)) { hit(pe, Math.round(M.TriggerBot.s.Damage.v)); tbT = 10; }
};

T.AutoClicker = function (p) {
    var interval = Math.max(1, Math.round(20 / M.AutoClicker.s.CPS.v));
    if (++acT < interval) return;
    acT = 0;
    var pe = Player.getPointedEntity();
    if (pe != -1 && validTarget(p, pe)) hit(pe, Math.round(M.AutoClicker.s.Damage.v));
};

T.TargetStrafe = function (p) {
    var e = nearest(p, M.TargetStrafe.s.Range.v);
    if (e == -1) return;
    var dx = Entity.getX(p) - Entity.getX(e), dz = Entity.getZ(p) - Entity.getZ(e);
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 0.1) return;
    var want = M.TargetStrafe.s.Distance.v;
    var tx = -dz / d, tz = dx / d;                 // tangent
    var rr = (want - d) * 0.1;                     // radial correction
    Entity.setVelX(p, tx * 0.22 + dx / d * rr);
    Entity.setVelZ(p, tz * 0.22 + dz / d * rr);
};

T.BowAura = function (p) {
    if (Player.getCarriedItem() != 261) return;
    var e = nearest(p, M.BowAura.s.Range.v);
    if (e == -1) return;
    var dx = Entity.getX(e) - Entity.getX(p), dz = Entity.getZ(e) - Entity.getZ(p);
    aimAt(p, e, 3, -Math.sqrt(dx * dx + dz * dz) * 0.25, 0);
};

T.Velocity = function (p) {
    if (kbTicks <= 0) return;
    kbTicks--;
    var h = 1 - M.Velocity.s.Horizontal.v / 100, v = 1 - M.Velocity.s.Vertical.v / 100;
    Entity.setVelX(p, Entity.getVelX(p) * h);
    Entity.setVelZ(p, Entity.getVelZ(p) * h);
    if (Entity.getVelY(p) > 0) Entity.setVelY(p, Entity.getVelY(p) * v);
};

T.Hitbox = function (p) {
    if (++hbT < 10) return;
    hbT = 0;
    var ents = Entity.getAll(), size = M.Hitbox.s.Size.v;
    for (var i = 0; i < ents.length; i++) {
        var e = ents[i];
        if (e == p || !isPlayerEnt(e)) continue;
        Entity.setCollisionSize(e, size, 1.8);
        if (hbList.indexOf(e) < 0) hbList.push(e);
    }
};
D.Hitbox = function () {
    for (var i = 0; i < hbList.length; i++) { try { Entity.setCollisionSize(hbList[i], 0.6, 1.8); } catch (e) {} }
    hbList = [];
};

var ARMOR = [
    [298, 314, 302, 306, 310],   // helmet: leather, gold, chain, iron, diamond
    [299, 315, 303, 307, 311],   // chestplate
    [300, 316, 304, 308, 312],   // leggings
    [301, 317, 305, 309, 313]    // boots
];
T.AutoArmor = function (p) {
    if (++armorT < 20) return;
    armorT = 0;
    for (var s = 0; s < 4; s++) {
        var cur = Player.getArmorSlot(s);
        var curRank = ARMOR[s].indexOf(cur);
        var bestRank = curRank, bestSlot = -1;
        for (var i = 0; i < INV_MAX; i++) {
            var id = Player.getInventorySlot(i);
            if (id <= 0) continue;
            var r = ARMOR[s].indexOf(id);
            if (r > bestRank) { bestRank = r; bestSlot = i; }
        }
        if (bestSlot != -1) {
            var newId = Player.getInventorySlot(bestSlot), newData = Player.getInventorySlotData(bestSlot);
            var oldDmg = cur > 0 ? Player.getArmorSlotDamage(s) : 0;
            Player.clearInventorySlot(bestSlot);
            Player.setArmorSlot(s, newId, newData);
            if (cur > 0) Player.addItemInventory(cur, 1, oldDmg);
            return;
        }
    }
};

T.AutoSoup = function (p) {
    if (soupCd > 0) { soupCd--; return; }
    if (hpNow > M.AutoSoup.s.Health.v) return;
    var i = findInv([282], 0, INV_MAX);
    if (i == -1) return;
    consumeSlot(i);
    Player.setHealth(Math.min(20, hpNow + 7));
    soupCd = 10;
};

T.Regen = function (p) {
    if (++regenT < Math.round(M.Regen.s.Delay.v)) return;
    regenT = 0;
    if (hpNow < 20 && hpNow > 0) Player.setHealth(hpNow + 1);
};

// ================= Movement modules =================
var stepCd = 0;

T.Fly = function (p) { Player.setCanFly(true); };
D.Fly = function () { try { Player.setCanFly(false); Player.setFlying(false); } catch (e) {} };

T.Speed = function (p) {
    var h = hvel(p);
    if (h.s > 0.04) {
        var t = 0.2 * M.Speed.s.Multiplier.v;
        Entity.setVelX(p, h.x / h.s * t);
        Entity.setVelZ(p, h.z / h.s * t);
    }
};

T.Glide = function (p) {
    var lim = -M.Glide.s.Fall.v;
    if (vyNow < lim) Entity.setVelY(p, lim);
};

T.HighJump = function (p) {
    if (jumped) Entity.setVelY(p, vyNow * M.HighJump.s.Multiplier.v);
};

T.LongJump = function (p) {
    if (!jumped) return;
    var h = hvel(p);
    var d = h.s > 0.03 ? { x: h.x / h.s, z: h.z / h.s } : lookDir(p);
    var b = M.LongJump.s.Boost.v;
    Entity.setVelX(p, d.x * b);
    Entity.setVelZ(p, d.z * b);
};

T.Step = function (p) {
    if (stepCd > 0) { stepCd--; return; }
    var h = hvel(p);
    if (h.s < 0.03 || !onGround(p)) return;
    var x = Entity.getX(p), z = Entity.getZ(p), fy = Math.floor(feetY(p) + 0.05);
    var tx = x + h.x / h.s * 0.6, tz = z + h.z / h.s * 0.6;
    if (solid(tileAt(tx, fy, tz)) && !solid(tileAt(tx, fy + 1, tz)) && !solid(tileAt(tx, fy + 2, tz))) {
        Entity.setPosition(p, x, Entity.getY(p) + 1.0, z);
        stepCd = 3;
    }
};

T.Spider = function (p) {
    var l = lookDir(p), x = Entity.getX(p) + l.x * 0.5, z = Entity.getZ(p) + l.z * 0.5;
    var fy = Math.floor(feetY(p) + 0.5);
    if (solid(tileAt(x, fy, z)) || solid(tileAt(x, fy + 1, z))) Entity.setVelY(p, 0.2);
};

T.Sneak = function (p) { Entity.setSneaking(p, true); };
D.Sneak = function () { try { Entity.setSneaking(getPlayerEnt(), false); } catch (e) {} };

T.Jesus = function (p) {
    var x = Entity.getX(p), z = Entity.getZ(p), fy = feetY(p);
    var by = Math.floor(fy - 0.1);
    if (liquid(tileAt(x, by, z)) && !liquid(tileAt(x, by + 1, z))) {
        var surface = by + 0.95;
        if (fy < surface) Entity.setPosition(p, x, surface + 1.62, z);
        Entity.setVelY(p, 0);
    }
};

T.NoFall = function (p) {
    if (hpNow < lastHp && fallT > 0) Player.setHealth(lastHp);   // undo landing damage (local)
    if (vyNow < -0.5) {
        var x = Entity.getX(p), z = Entity.getZ(p), fy = feetY(p);
        for (var k = 0; k < 3; k++) {
            if (solid(tileAt(x, fy - k - 0.2, z))) { Entity.setVelY(p, Math.max(vyNow, -0.3)); break; }
        }
    }
};

T.SafeWalk = function (p) {
    var h = hvel(p);
    if (h.s < 0.02) return;
    var x = Entity.getX(p), z = Entity.getZ(p), fy = feetY(p) - 0.1;
    if (solid(tileAt(x, fy, z)) && !solid(tileAt(x + h.x * 4, fy, z + h.z * 4))) {
        Entity.setVelX(p, 0);
        Entity.setVelZ(p, 0);
    }
};

T.EntitySpeed = function (p) {
    var r = Entity.getRiding(p);
    if (r == -1) return;
    var vx = Entity.getVelX(r), vz = Entity.getVelZ(r), s = Math.sqrt(vx * vx + vz * vz);
    if (s < 0.05) return;
    var ns = Math.min(s * 1.08, 0.4 * M.EntitySpeed.s.Multiplier.v);
    if (ns > s) { Entity.setVelX(r, vx / s * ns); Entity.setVelZ(r, vz / s * ns); }
};

T.IceSpeed = function (p) {
    var t = tileAt(Entity.getX(p), feetY(p) - 0.2, Entity.getZ(p));
    if (t == 79 || t == 174) boost(p, 1.08, 0.2 * M.IceSpeed.s.Multiplier.v);
};

T.ReverseStep = function (p) {
    if (vyNow < -0.1 && vyNow > -0.6) {
        var x = Entity.getX(p), z = Entity.getZ(p), fy = feetY(p);
        for (var k = 1; k <= 2; k++) {
            if (solid(tileAt(x, fy - k, z))) { Entity.setVelY(p, -0.9); break; }
        }
    }
};

T.NoWeb = function (p) {
    var x = Math.floor(Entity.getX(p)), z = Math.floor(Entity.getZ(p)), fy = Math.floor(feetY(p));
    for (var k = 0; k < 2; k++) {
        if (Level.getTile(x, fy + k, z) == 30) Level.setTile(x, fy + k, z, 0, 0);
    }
};

T.Dolphin = function (p) {
    var t = tileAt(Entity.getX(p), feetY(p) + 0.3, Entity.getZ(p));
    if (t == 8 || t == 9) boost(p, 1.08, 0.2 * M.Dolphin.s.Multiplier.v);
};

A.VClip = function () {
    var p = getPlayerEnt();
    Entity.setPosition(p, Entity.getX(p), Entity.getY(p) + M.VClip.s.Distance.v, Entity.getZ(p));
};
A.HClip = function () {
    var p = getPlayerEnt(), l = lookDir(p), d = M.HClip.s.Distance.v;
    Entity.setPosition(p, Entity.getX(p) + l.x * d, Entity.getY(p), Entity.getZ(p) + l.z * d);
};

// ================= Player modules =================
var fbT = 0, fbX = 0, fbY = 0, fbZ = 0;
var chestT = 0, chestX = 0, chestY = 0, chestZ = 0;
var signT = 0, signX = 0, signY = 0, signZ = 0;
var invT = 0, eatCd = 0, afkT = 0, dropT = 0, derpYaw = 0;

T.God = function (p) { Player.setHealth(20); };

var PICK_B = [1,4,14,15,16,21,22,24,41,42,45,48,49,56,57,61,62,67,73,74,79,87,98,101,108,109,112,121,155,174];
var SHOVEL_B = [2,3,12,13,60,78,80,82,88,110,243];
var AXE_B = [5,17,47,53,54,58,64,85,96,107,126,134,135,136,162];
var PICKS = [278, 257, 274, 270, 285];
var SHOVELS = [277, 256, 273, 269, 284];
var AXES = [279, 258, 275, 271, 286];
function bestTool(list) {
    for (var i = 0; i < list.length; i++) {
        var s = findInv([list[i]], 0, 9);
        if (s != -1) return s;
    }
    return -1;
}
function autoTool(bid) {
    var slot = -1;
    if (PICK_B.indexOf(bid) >= 0) slot = bestTool(PICKS);
    else if (SHOVEL_B.indexOf(bid) >= 0) slot = bestTool(SHOVELS);
    else if (AXE_B.indexOf(bid) >= 0) slot = bestTool(AXES);
    if (slot != -1) Player.setSelectedSlotId(slot);
}

T.FastBreak = function (p) {
    if (fbT > 0 && --fbT == 0) {
        if (Player.getPointedBlockX() == fbX && Player.getPointedBlockY() == fbY && Player.getPointedBlockZ() == fbZ)
            Level.destroyBlock(fbX, fbY, fbZ, true);
    }
};

T.ChestStealer = function (p) {
    if (chestT > 0 && --chestT == 0) {
        for (var i = 0; i < 54; i++) {
            var id = Level.getChestSlot(chestX, chestY, chestZ, i);
            if (id > 0) {
                Player.addItemInventory(id, Level.getChestSlotCount(chestX, chestY, chestZ, i), Level.getChestSlotData(chestX, chestY, chestZ, i));
                Level.setChestSlot(chestX, chestY, chestZ, i, 0, 0, 0);
            }
        }
    }
};

T.InventoryManager = function (p) {
    if (++invT < 40) return;
    invT = 0;
    for (var i = 0; i < INV_MAX; i++) {
        var id = Player.getInventorySlot(i);
        if (id > 0 && JUNK.indexOf(id) >= 0) Player.clearInventorySlot(i);
    }
};

var FOOD = { 260: 4, 297: 5, 320: 8, 364: 8, 366: 6, 350: 5, 391: 3, 393: 5, 360: 2, 357: 2 };
T.AutoEat = function (p) {
    if (eatCd > 0) { eatCd--; return; }
    var hunger = Player.getHunger();
    if (hunger > M.AutoEat.s.Hunger.v) return;
    for (var i = 0; i < INV_MAX; i++) {
        var id = Player.getInventorySlot(i);
        if (id > 0 && FOOD[id]) {
            consumeSlot(i);
            Player.setHunger(Math.min(20, hunger + FOOD[id]));
            eatCd = 20;
            return;
        }
    }
};

T.AutoSign = function (p) {
    if (signT > 0 && --signT == 0) {
        var t = Level.getTile(signX, signY, signZ);
        if (t == 63 || t == 68) {
            for (var i = 0; i < 4; i++) Level.setSignText(signX, signY, signZ, i, SIGN_LINES[i]);
        }
    }
};

T.AntiAFK = function (p) {
    if (++afkT < 200) return;
    afkT = 0;
    Entity.setRot(p, Entity.getYaw(p) + 2, Entity.getPitch(p));
};

T.AutoDrop = function (p) {
    if (++dropT < Math.round(M.AutoDrop.s.Delay.v)) return;
    dropT = 0;
    var slot = Math.round(M.AutoDrop.s.Slot.v);
    var id = Player.getInventorySlot(slot);
    if (id <= 0) return;
    var l = lookDir(p);
    Level.dropItem(Entity.getX(p) + l.x, feetY(p) + 0.5, Entity.getZ(p) + l.z, 0, id, 1, Player.getInventorySlotData(slot));
    consumeSlot(slot);
};

T.Derp = function (p) {
    derpYaw = (derpYaw + 35) % 360;
    Entity.setRot(p, derpYaw, 90 * Math.sin(derpYaw * 0.1));
};

// ================= Render modules =================
var rndT = 0, crumbT = 0;

E.FullBright = function () { Entity.addEffect(getPlayerEnt(), 16, 6000, 0, false, false); };
T.FullBright = function (p) {
    if (++rndT % 200 == 1) Entity.addEffect(p, 16, 6000, 0, false, false);
};
D.FullBright = function () { try { Entity.removeEffect(getPlayerEnt(), 16); } catch (e) {} };

T.WeatherChanger = function (p) {
    try { Level.setRainLevel(0); } catch (e) {}
    try { Level.setLightningLevel(0); } catch (e2) {}
};

E.Zoom = function () { ModPE.setFov(M.Zoom.s.FOV.v); };
T.Zoom = function (p) { if (tickN % 10 == 0) ModPE.setFov(M.Zoom.s.FOV.v); };
D.Zoom = function () { try { ModPE.resetFov(); } catch (e) {} };

T.Breadcrumbs = function (p) {
    if (++crumbT < 2) return;
    crumbT = 0;
    Level.addParticle(ParticleType.flame, Entity.getX(p), feetY(p) + 0.1, Entity.getZ(p), 0, 0, 0, 1);
};

// ================= Misc modules =================
var spamT = 0, spamI = 0, annT = 0, sndT = 0, signScanT = 0, cmdT = 0, cmdIdx = 0;
var mlgT = 0, mlgX = 0, mlgY = 0, mlgZ = 0, mlgOn = false;
var fakeEnt = -1, prevMode = 0, sending = false;

T.Nuker = function (p) {
    var r = Math.round(M.Nuker.s.Radius.v);
    var bx0 = Math.floor(Player.getX()), by0 = Math.floor(Player.getY()), bz0 = Math.floor(Player.getZ());
    var n = 0;
    for (var x = -r; x <= r; x++) {
        for (var y = -1; y <= r; y++) {     // never breaks the floor under you
            for (var z = -r; z <= r; z++) {
                if (n >= 15) return;        // cap per tick to avoid lag
                var bx = bx0 + x, by = by0 + y, bz = bz0 + z;
                if (Level.getTile(bx, by, bz) != 0) { Level.destroyBlock(bx, by, bz, true); n++; }
            }
        }
    }
};

T.Day = function (p) { Level.setTime(6000); };

T.AutoScaffold = function (p) {
    var item = Player.getCarriedItem();
    if (item <= 0 || item >= 256) return;
    var x = Math.floor(Entity.getX(p)), z = Math.floor(Entity.getZ(p)), by = Math.floor(feetY(p) - 0.5);
    if (Level.getTile(x, by, z) == 0) {
        Level.setTile(x, by, z, item, Player.getCarriedItemData());
        useCarried(p);
    }
};

T.Tower = function (p) {
    if (!jumped) return;
    var item = Player.getCarriedItem();
    if (item <= 0 || item >= 256) return;
    var x = Math.floor(Entity.getX(p)), z = Math.floor(Entity.getZ(p)), g = Math.floor(feetY(p));
    if (Level.getTile(x, g, z) == 0) {
        Level.setTile(x, g, z, item, Player.getCarriedItemData());
        useCarried(p);
        Entity.setPosition(p, Entity.getX(p), g + 1 + 1.62 + 0.05, Entity.getZ(p));
        Entity.setVelY(p, 0);
    }
};

E.FakePlayer = function () {
    var p = getPlayerEnt(), l = lookDir(p);
    fakeEnt = Level.spawnMob(Entity.getX(p) + l.x * 3, feetY(p), Entity.getZ(p) + l.z * 3, 15);
    Entity.setNameTag(fakeEnt, "FakePlayer");
};
T.FakePlayer = function (p) {
    if (fakeEnt == -1) return;
    Entity.setHealth(fakeEnt, 20);
    Entity.setVelX(fakeEnt, 0);
    Entity.setVelZ(fakeEnt, 0);
};
D.FakePlayer = function () {
    try { if (fakeEnt != -1) Entity.remove(fakeEnt); } catch (e) {}
    fakeEnt = -1;
};

T.Spammer = function (p) {
    if (++spamT < M.Spammer.s.Seconds.v * 20) return;
    spamT = 0;
    say(SPAM_MSGS[spamI++ % SPAM_MSGS.length]);
};

T.Announcer = function (p) {
    if (++annT < M.Announcer.s.Seconds.v * 20) return;
    annT = 0;
    if (evMined + evKills + evDmg == 0) return;
    say("[" + CLIENT_NAME + "] mined " + evMined + ", killed " + evKills + ", damage taken " + Math.round(evDmg));
    evMined = 0; evKills = 0; evDmg = 0;
};

T.SoundSpammer = function (p) {
    if (++sndT < Math.round(M.SoundSpammer.s.Delay.v)) return;
    sndT = 0;
    Level.playSound(Entity.getX(p), Entity.getY(p), Entity.getZ(p), "random.pop", 1, 0.5 + Math.random());
};

E.FakeCreative = function () { prevMode = Level.getGameMode(); Level.setGameMode(1); };
D.FakeCreative = function () { try { Level.setGameMode(prevMode); } catch (e) {} };

E.AutoCommand = function () { cmdIdx = 0; cmdT = 0; };
T.AutoCommand = function (p) {
    if (cmdIdx >= AUTO_COMMANDS.length || Server.getAddress() == null) return;
    if (++cmdT >= 80) {
        Server.sendChat(AUTO_COMMANDS[cmdIdx++]);
        cmdT = 60;
    }
};

T.ColorSign = function (p) {
    if (++signScanT < 20) return;
    signScanT = 0;
    var bx = Math.floor(Entity.getX(p)), by = Math.floor(feetY(p)), bz = Math.floor(Entity.getZ(p));
    for (var x = -4; x <= 4; x++) for (var y = -2; y <= 3; y++) for (var z = -4; z <= 4; z++) {
        var t = Level.getTile(bx + x, by + y, bz + z);
        if (t != 63 && t != 68) continue;
        for (var l = 0; l < 4; l++) {
            var s = "" + Level.getSignText(bx + x, by + y, bz + z, l);
            if (/&[0-9a-fk-or]/i.test(s)) Level.setSignText(bx + x, by + y, bz + z, l, s.replace(/&([0-9a-fk-or])/gi, "\u00a7$1"));
        }
    }
};

T.AutoMLG = function (p) {
    if (mlgT > 0 && --mlgT == 0) {
        if (Level.getTile(mlgX, mlgY, mlgZ) == 9) Level.setTile(mlgX, mlgY, mlgZ, 0, 0);
        mlgOn = false;
    }
    if (mlgOn || vyNow > -0.7) return;
    var hasBucket = false;
    for (var i = 0; i < INV_MAX; i++) {
        if (Player.getInventorySlot(i) == 325 && Player.getInventorySlotData(i) == 8) { hasBucket = true; break; }
    }
    if (!hasBucket) return;
    var x = Math.floor(Entity.getX(p)), z = Math.floor(Entity.getZ(p)), fy = Math.floor(feetY(p));
    for (var k = 0; k <= 4; k++) {
        if (solid(Level.getTile(x, fy - k, z))) {
            mlgX = x; mlgY = fy - k + 1; mlgZ = z;
            if (Level.getTile(mlgX, mlgY, mlgZ) == 0) {
                Level.setTile(mlgX, mlgY, mlgZ, 9, 0);
                mlgT = 50; mlgOn = true;
            }
            return;
        }
    }
};

// ================= Config profiles =================
function cfgString() {
    var parts = [];
    for (var n in M) {
        if (M[n].act) continue;
        var s = n + ":" + (M[n].on ? 1 : 0);
        for (var k in M[n].s) s += ":" + k + "=" + M[n].s[k].v;
        parts.push(s);
    }
    return parts.join("|");
}
function cfgApply(str) {
    var parts = str.split("|");
    for (var i = 0; i < parts.length; i++) {
        var f = parts[i].split(":");
        var name = f[0];
        if (!M[name] || M[name].act) continue;
        setModule(name, f[1] == "1");
        for (var j = 2; j < f.length; j++) {
            var kv = f[j].split("=");
            if (M[name].s[kv[0]]) M[name].s[kv[0]].v = parseFloat(kv[1]);
        }
    }
    closeGui();
}
function saveCfg(name) {
    ModPE.saveData("srp_cfg_" + name, cfgString());
    clientMessage("\u00a7a[" + CLIENT_NAME + "] saved profile " + name);
}
function loadCfg(name) {
    var s = "" + ModPE.readData("srp_cfg_" + name);
    if (s == "" || s == "null" || s == "undefined") { clientMessage("\u00a7c[" + CLIENT_NAME + "] no profile named " + name); return; }
    cfgApply(s);
    clientMessage("\u00a7a[" + CLIENT_NAME + "] loaded profile " + name);
}
function preset(list) {
    for (var n in M) if (!M[n].act && !M[n].hud) setModule(n, false);
    for (var i = 0; i < list.length; i++) setModule(list[i], true);
    closeGui();
}
A.ConfigSave = function () { saveCfg("slot" + Math.round(M.ConfigSave.s.Slot.v)); };
A.ConfigLoad = function () { loadCfg("slot" + Math.round(M.ConfigLoad.s.Slot.v)); };

// ================= Toggle / commands =================
function setModule(name, on) {
    var m = M[name];
    if (!m || m.act || m.on == on) return;
    m.on = on;
    try {
        if (on && E[name]) E[name]();
        if (!on && D[name]) D[name]();
    } catch (e) { clientMessage("\u00a7c" + name + ": " + e); }
    if (!m.hud) clientMessage("\u00a77[" + CLIENT_NAME + "] \u00a7f" + name + (on ? " \u00a7aon" : " \u00a7coff"));
}

function findModule(q) {
    if (!q) return null;
    q = q.toLowerCase();
    for (var n in M) if (n.toLowerCase() == q) return n;
    return null;
}

function handleCmd(line) {
    var a = line.split(" "), c = a[0].toLowerCase(), p = getPlayerEnt();
    if (c == "help") {
        clientMessage("\u00a7b.t <module>  .modules  .vclip <n>  .hclip <n>  .tp x y z");
        clientMessage("\u00a7b.friend add|remove|list <name>  .config save|load <name>  .config legit|blatant  .debug");
    } else if (c == "modules") {
        var names = [];
        for (var n in M) names.push((M[n].on ? "\u00a7a" : "\u00a77") + n);
        clientMessage(names.join(" "));
    } else if (c == "t" || c == "toggle") {
        var nm = findModule(a[1]);
        if (nm == null) clientMessage("\u00a7cunknown module");
        else if (M[nm].act) A[nm]();
        else setModule(nm, !M[nm].on);
    } else if (c == "vclip") {
        Entity.setPosition(p, Entity.getX(p), Entity.getY(p) + parseFloat(a[1] || "0"), Entity.getZ(p));
    } else if (c == "hclip") {
        var l = lookDir(p), d = parseFloat(a[1] || "0");
        Entity.setPosition(p, Entity.getX(p) + l.x * d, Entity.getY(p), Entity.getZ(p) + l.z * d);
    } else if (c == "tp") {
        Entity.setPosition(p, parseFloat(a[1]), parseFloat(a[2]) + 1.62, parseFloat(a[3]));
    } else if (c == "friend") {
        var sub = (a[1] || "").toLowerCase(), who = (a[2] || "").toLowerCase();
        if (sub == "add" && who != "") { if (friends.indexOf(who) < 0) friends.push(who); saveFriends(); clientMessage("\u00a7aadded " + who); }
        else if (sub == "remove" && who != "") { var i = friends.indexOf(who); if (i >= 0) friends.splice(i, 1); saveFriends(); clientMessage("\u00a7cremoved " + who); }
        else clientMessage("\u00a7bfriends: " + (friends.length ? friends.join(", ") : "none"));
    } else if (c == "config") {
        var s2 = (a[1] || "").toLowerCase();
        if (s2 == "save" && a[2]) saveCfg(a[2]);
        else if (s2 == "load" && a[2]) loadCfg(a[2]);
        else if (s2 == "legit") preset(["AutoArmor", "AutoTool", "AutoEat", "FullBright", "Radar"]);
        else if (s2 == "blatant") preset(["Aura", "Fly", "Speed", "Velocity", "NoFall", "AutoArmor", "FullBright", "Radar", "TargetHUD"]);
        else clientMessage("\u00a7cusage: .config save|load <name>  or  .config legit|blatant");
    } else if (c == "debug") {
        DEBUG = !DEBUG;
        shownErr = {};
        clientMessage("debug " + (DEBUG ? "on" : "off"));
    } else {
        clientMessage("\u00a7cunknown command, try .help");
    }
}

// ================= Game hooks =================
function newLevel() {
    clientMessage("\u00a7b" + CLIENT_FULL + " \u00a7floaded  (.help for commands)");
    loadFriends();
    fakeEnt = -1; mlgOn = false; mlgT = 0; cmdIdx = 0; cmdT = 0;
    hudGen++;
    showHud();            // before the button so "M" stays on top
    showMenuButton();
    startFps(hudGen);
    startPing(hudGen);
}

function leaveGame() {
    hudGen++;             // stops the fps/ping loops
    fakeEnt = -1;
    hideHud();
    ctx.runOnUiThread(new java.lang.Runnable({ run: function () {
        if (gui != null && gui.isShowing()) gui.dismiss();
        if (btnWin != null && btnWin.isShowing()) btnWin.dismiss();
    }}));
}

function chatHook(text) {
    if (text.charAt(0) == ".") {
        preventDefault();
        try { handleCmd(text.substring(1)); } catch (e) { clientMessage("\u00a7ccmd error: " + e); }
        return;
    }
    if (M.SoleSuffix.on && !sending && text.charAt(0) != "/") {
        preventDefault();
        sending = true;
        say(text + " | " + CLIENT_NAME);
        sending = false;
    }
}

function attackHook(attacker, victim) {
    try {
        if (attacker != getPlayerEnt()) return;
        lastTarget = victim; lastTargetT = 100; hitFlash = 4;
        if (M.Criticals.on && onGround(attacker)) Entity.setVelY(attacker, 0.18);
        if (M.MoreKnockback.on) {
            var l = lookDir(attacker), k = M.MoreKnockback.s.Strength.v;
            Entity.setVelX(victim, Entity.getVelX(victim) + l.x * k);
            Entity.setVelZ(victim, Entity.getVelZ(victim) + l.z * k);
            Entity.setVelY(victim, Entity.getVelY(victim) + 0.1);
        }
    } catch (e) {}
}

function deathHook(attacker, victim) {
    var me = getPlayerEnt();
    if (victim == me) deaths++;
    else if (attacker == me) {
        kills++; evKills++;
        if (M.AutoEZ.on) ez();
    }
}

var SIDE_OFF = [[0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]];
function useItem(x, y, z, itemId, blockId, side, itemDamage, blockDamage) {
    try {
        if (M.ChestStealer.on && (blockId == 54 || blockId == 146)) { chestX = x; chestY = y; chestZ = z; chestT = 12; }
        if (M.AutoSign.on && itemId == 323) {
            var o = SIDE_OFF[side];
            signX = x + o[0]; signY = y + o[1]; signZ = z + o[2]; signT = 6;
        }
    } catch (e) {}
}

function startDestroyBlock(x, y, z, side) {
    try {
        var bid = Level.getTile(x, y, z);
        if (M.AutoTool.on) autoTool(bid);
        if (M.SpeedMine.on) Level.destroyBlock(x, y, z, true);
        else if (M.FastBreak.on) { fbT = Math.round(M.FastBreak.s.Delay.v); fbX = x; fbY = y; fbZ = z; }
    } catch (e) {}
}

function destroyBlock(x, y, z, side) { evMined++; }

function modTick() {
    tickN++;

    // TPS: ticks per real second
    tickCount++;
    var now = java.lang.System.currentTimeMillis();
    if (lastTpsT == 0) lastTpsT = now;
    if (now - lastTpsT >= 1000) {
        tps = Math.min(20, round2(tickCount * 1000 / (now - lastTpsT)));
        tickCount = 0;
        lastTpsT = now;
    }

    var p = getPlayerEnt();
    try {
        vyNow = Entity.getVelY(p);
        jumped = vyNow > 0.35 && lastVy <= 0.1 && lastVy >= -0.25;
        hpNow = Entity.getHealth(p);
        if (hpNow < lastHp) { kbTicks = 3; evDmg += lastHp - hpNow; }
        if (vyNow < -0.7) fallT = 10; else if (fallT > 0) fallT--;
        if (lastTargetT > 0) lastTargetT--;
        if (hitFlash > 0) hitFlash--;
    } catch (e) {}

    hudCounter++;
    if (hudCounter >= 2) { hudCounter = 0; try { updateHud(); } catch (e2) {} }

    for (var n in M) {
        if (M[n].on && T[n]) {
            try { T[n](p); }
            catch (e3) {
                if (DEBUG && !shownErr[n]) { shownErr[n] = true; clientMessage("\u00a7c" + n + ": " + e3); }
            }
        }
    }

    lastVy = vyNow;
    lastHp = hpNow;
}
