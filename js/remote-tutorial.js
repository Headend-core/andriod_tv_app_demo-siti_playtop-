/**
 * VIBE PlayTop Magic - Remote Guide (first-time coach marks)
 *
 * Shown once after a new user registers with their mobile number and creates their
 * first profile. Four slides:
 *   Welcome        - a quick tour of the remote's keys
 *   Live TV        - filter the TV guide by language / genre and move into the channel list
 *   While watching - ◀ ▶ change channel, ▼ what's on now, ▲ show details / upcoming shows
 *   Channel number - type a number (⌫ deletes a digit, OK opens it)
 *
 * Left: the real remote (assets/remote_v4_cutout.png) with a glowing highlight and
 * an animated finger tapping the key. Right: a mini TV that plays what the key does,
 * drawn like the real Live TV guide and using the app's own channel data.
 * Skip (top right) · Back / Next (bottom). Remote Back key = previous step.
 *
 * Can be replayed any time: window.remoteTutorial.open()  (Help → "How to use your remote")
 */

class RemoteTutorial {
  constructor() {
    this.isOpen = false;
    this.stepIndex = 0;
    this.timers = [];

    // Hotspots on remote_v4.png, as % of the image: [centre x, centre y, width, height]
    this.KEYS = {
      dpad: [49.9, 22.7, 43.3, 21.6],
      up: [49.9, 14.9, 11, 5.5],
      down: [49.9, 30.4, 11, 5.5],
      left: [34.4, 22.7, 11, 5.5],
      right: [65.4, 22.7, 11, 5.5],
      ok: [49.9, 22.7, 18.7, 9.4],
      back: [33.6, 43.4, 13.3, 6.65],
      vol: [33.65, 55.9, 13.2, 14.66],
      volup: [33.65, 52.3, 11, 5.5],
      voldown: [33.65, 59.75, 11, 5.5],
      mute: [50.2, 56.2, 11.8, 5.9],
      ch: [66.7, 55.9, 13.2, 14.66],
      chup: [66.7, 52.0, 11, 5.5],
      chdown: [66.7, 60.0, 11, 5.5],
      numpad: [50.2, 77.45, 46, 23.5]
    };
    const cols = [33.8, 50.2, 66.3];
    const rows = [68.0, 74.4, 80.7, 86.9];
    "123456789".split("").forEach((d, i) => { this.KEYS[`n${d}`] = [cols[i % 3], rows[Math.floor(i / 3)], 13.5, 4.6]; });
    this.KEYS.n0 = [cols[1], rows[3], 13.5, 4.6];
    this.KEYS.del = [cols[2], rows[3], 13.5, 4.6]; // ⌫ key, bottom right of the number pad
  }

  /* ----------------------------------------------------------
   * Data: the Live TV guide channels (same names / numbers as the app)
   * ---------------------------------------------------------- */
  guide() {
    if (!this._guide) {
      const list = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.liveTvGuide && VIBE_DATA.liveTvGuide.channels) || [];
      this._guide = [...list].sort((a, b) => Number(a.lcn) - Number(b.lcn));
    }
    return this._guide;
  }

  gch(lcn, fallbackIndex = 0) {
    const g = this.guide();
    return g.find((c) => String(c.lcn) === String(lcn)) || g[fallbackIndex] || {
      lcn, name: `Channel ${lcn}`, language: "Bengali", genre: "Entertainment", logoText: lcn, logoColor: "#E51B24", programs: [{ title: "Live", span: 4 }]
    };
  }

  nowTitle(ch) {
    return (ch.programs && ch.programs[0] && ch.programs[0].title) || "Live";
  }

  /* ----------------------------------------------------------
   * Shared scene pieces
   * ---------------------------------------------------------- */
  esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  badge(text, color) {
    const dark = ["#000000", "#0F172A", "#1E293B"].includes(String(color || "").toUpperCase());
    return `<em class="rt-badge" style="color:${dark || !color ? "#FFFFFF" : color}">${this.esc(text || "★")}</em>`;
  }

  // Preview-window background: the channel's live photo over its brand colour
  liveBg(ch) {
    const img = ch.liveVideoBg ? `url('${ch.liveVideoBg}') center / cover no-repeat, ` : "";
    return `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.3)), ${img}linear-gradient(135deg, ${ch.logoColor || "#334155"}, #0B0C14)`;
  }

  // Move the white TV focus ring inside the mini TV
  focus(scene, target) {
    scene.querySelectorAll(".rt-f").forEach((el) => el.classList.remove("rt-f"));
    const el = typeof target === "string" ? scene.querySelector(target) : target;
    if (el) el.classList.add("rt-f");
    return el;
  }

  epgHtml() {
    const langs = ["All", "Hindi", "Bengali", "Assamese", "Bhojpuri"];
    const genres = ["All", "Entertainment", "Movies", "Music", "News"];
    const col = (title, k, items) => `
      <div class="rt-epg-col"><p>${title}</p>
        ${items.map((v) => `<span class="rt-epg-item rt-epg-${k}" data-v="${v}">${v}</span>`).join("")}
      </div>`;
    return `
      <div class="rt-epg">
        <div class="rt-epg-top">
          <div class="rt-epg-info">
            <b class="rt-epg-title"></b>
            <span class="rt-epg-time"></span>
            <span class="rt-epg-lcn"></span>
          </div>
          <div class="rt-epg-pip"><span class="rt-epg-pip-name"></span><span class="rt-epg-pip-live">LIVE</span></div>
        </div>
        <div class="rt-epg-bottom">
          <div class="rt-epg-tray">${col("Languages", "lang", langs)}${col("Genres", "genre", genres)}</div>
          <div class="rt-epg-grid">
            <div class="rt-epg-head"><span>Channels</span><span>Now</span><span>Next</span><span>Later</span></div>
            <div class="rt-epg-rows"></div>
            <i class="rt-epg-now" aria-hidden="true"></i>
          </div>
        </div>
      </div>`;
  }

  epgSetup(scene, { lang = "All", genre = "All", collapsed = false } = {}) {
    this.epg = { lang, genre };
    scene.querySelector(".rt-epg").classList.toggle("rt-epg-collapsed", collapsed);
    this.epgSelect(scene, "lang", lang);
    this.epgSelect(scene, "genre", genre);
  }

  epgSelect(scene, k, v) {
    this.epg[k] = v;
    scene.querySelectorAll(`.rt-epg-${k}`).forEach((el) => el.classList.toggle("on", el.dataset.v === v));
    const list = this.guide().filter((c) =>
      (this.epg.lang === "All" || c.language === this.epg.lang) && (this.epg.genre === "All" || c.genre === this.epg.genre)
    ).slice(0, 5);
    this.epgRowsList = list;
    scene.querySelector(".rt-epg-rows").innerHTML = list.map((c, r) => `
      <div class="rt-epg-row" data-r="${r}">
        <div class="rt-epg-ch"><i>${this.esc(c.lcn)}</i><b>${this.esc(c.name)}</b>${this.badge(c.logoText, c.logoColor)}</div>
        <div class="rt-epg-progs">${(c.programs || []).slice(0, 3).map((p, n) =>
          `<span class="rt-epg-prog" data-p="${n}" style="flex:${p.span || 1}">${this.esc(p.title)}${n === 0 ? "<i></i>" : ""}</span>`).join("")}</div>
      </div>`).join("");
    if (list[0]) this.epgPreview(scene, 0);
  }

  epgPreview(scene, r, p = 0) {
    const ch = this.epgRowsList[r];
    if (!ch) return;
    const prog = (ch.programs || [])[p] || { title: this.nowTitle(ch) };
    scene.querySelector(".rt-epg-title").textContent = prog.title;
    scene.querySelector(".rt-epg-time").textContent = `${p === 0 ? "On now" : "Up next"} | ${ch.language}`;
    scene.querySelector(".rt-epg-lcn").textContent = `LCN : ${ch.lcn} | ${ch.genre}`;
    scene.querySelector(".rt-epg-pip").style.background = this.liveBg(ch);
    scene.querySelector(".rt-epg-pip-name").textContent = ch.name;
  }

  epgFocusRow(scene, r, p = null) {
    const row = scene.querySelector(`.rt-epg-row[data-r="${r}"]`);
    if (!row) return;
    this.focus(scene, p == null ? row.querySelector(".rt-epg-ch") : row.querySelector(`.rt-epg-prog[data-p="${p}"]`));
    this.epgPreview(scene, r, p || 0);
  }

  /* ----------------------------------------------------------
   * Full-screen playback scene (references: assets/remote_left_right_button.jpg,
   * remote_down_button.jpg, remote_up_button.jpg)
   *   ◀ ▶  previous / next channel number, with the "Swipe to change channel" bar
   *   ▼    row of live channels; the current one opens into a card with its details
   *   ▲    "Upcoming Shows": big picture + details of the show on now, next shows below
   *   0-9  channel-number box (same look as the app's LCN box)
   * ---------------------------------------------------------- */
  pbHtml() {
    return `
      <div class="rt-pb">
        <div class="rt-pb-zap"></div>
        <div class="rt-pb-info"><small></small><b></b><span></span></div>
        <div class="rt-pb-swipe">
          <span class="rt-pb-swipe-logo rt-pb-prev"></span>
          <i>‹</i><em>Swipe to change channel</em><i>›</i>
          <span class="rt-pb-swipe-logo rt-pb-next"></span>
        </div>
        <div class="rt-pb-rail"></div>
        <div class="rt-pb-up"></div>
        <div class="rt-pb-osd">
          <div class="rt-pb-osd-top"><span class="rt-pb-osd-lcn">LCN</span><b class="rt-pb-osd-digits"></b><span class="rt-pb-osd-status"></span></div>
          <strong class="rt-pb-osd-name"></strong><small class="rt-pb-osd-meta"></small>
          <i class="rt-pb-osd-bar"></i>
        </div>
        <img src="assets/vibe_logo.png" alt="" class="rt-pb-mark" />
      </div>`;
  }

  // Programme start / end times, worked out from the current half hour (as the app does)
  progTimes(ch) {
    const t0 = new Date();
    t0.setMinutes(t0.getMinutes() < 30 ? 0 : 30, 0, 0);
    let t = t0.getTime();
    const fmt = (ms) => new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return (ch.programs || []).map((p) => {
      const s = t;
      t += (p.span || 1) * 30 * 60000;
      return `${fmt(s)} - ${fmt(t)}`;
    });
  }

  progDesc(ch, p) {
    const DESC = {
      News: "Live coverage and sharp analysis of the day's top stories.",
      Entertainment: "Family drama, reality and the shows everyone is talking about.",
      Movies: "Back-to-back blockbusters, uncut and in HD.",
      Music: "Non-stop chart-toppers, classics and fresh releases.",
      Kids: "Cartoons, adventures and learning fun for young viewers.",
      Sports: "Live action, highlights and expert match analysis."
    };
    return (p && p.desc) || DESC[ch.genre] || "Live on SITI PlayTop.";
  }

  subGenres(genre) {
    return ({
      News: "News | Current Affairs | Series", Entertainment: "Entertainment | Drama | Series",
      Movies: "Movies | Feature Film", Music: "Music | Songs", Kids: "Kids | Animation | Series",
      Sports: "Sports | Live Event"
    })[genre] || genre;
  }

  // Programme picture: the channel's live photo with the show name on it (tint varies per show)
  poster(ch, title, n = 0) {
    const tints = ["rgba(30,64,175,0.55)", "rgba(190,24,93,0.5)", "rgba(202,138,4,0.5)", "rgba(15,118,110,0.55)"];
    const img = ch.liveVideoBg ? `, url('${ch.liveVideoBg}') center / cover no-repeat` : "";
    return `<div class="rt-pb-poster" style="background:linear-gradient(135deg, ${tints[n % tints.length]}, rgba(0,0,0,0.35))${img}, ${ch.logoColor || "#334155"}">
      <span>${this.esc(title)}</span></div>`;
  }

  pbFrame(ch) {
    // top / bottom shade keeps the channel info and bars readable on bright pictures
    const shade = "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 32%, transparent 68%, rgba(0,0,0,0.5))";
    return `<div class="rt-pb-frame" style="background:${shade}, ${this.liveBg(ch)}"></div>`;
  }

  // Tune the playback scene to guide channel index i (dir 1 = next, -1 = previous, 0 = no animation)
  pbTune(scene, i, dir = 0, { info = false, swipe = false } = {}) {
    const g = this.guide();
    i = (i + g.length) % g.length;
    this.pbIndex = i;
    const ch = g[i];
    const host = scene.querySelector(".rt-pb-zap");
    const old = host.querySelector(".rt-pb-frame");
    host.insertAdjacentHTML("beforeend", this.pbFrame(ch));
    const fresh = host.lastElementChild;
    if (dir && old) {
      fresh.classList.add(dir > 0 ? "rt-in-next" : "rt-in-prev");
      old.classList.add(dir > 0 ? "rt-out-next" : "rt-out-prev");
      this.later(() => old.remove(), 500);
    } else if (old) old.remove();

    const infoEl = scene.querySelector(".rt-pb-info");
    infoEl.querySelector("small").textContent = `LCN ${ch.lcn}`;
    infoEl.querySelector("b").textContent = ch.name;
    infoEl.querySelector("span").textContent = `${ch.language}  |  ${ch.genre}`;
    const prev = g[(i - 1 + g.length) % g.length];
    const next = g[(i + 1) % g.length];
    scene.querySelector(".rt-pb-prev").innerHTML = this.badge(prev.logoText, prev.logoColor);
    scene.querySelector(".rt-pb-next").innerHTML = this.badge(next.logoText, next.logoColor);
    this.pbShow(scene, { info, swipe });
  }

  // Which overlays are visible: info (top left), swipe bar, down rail, up page, number box
  pbShow(scene, { info = false, swipe = false, rail = false, up = false, osd = false } = {}) {
    const pb = scene.querySelector(".rt-pb");
    pb.classList.toggle("rt-pb-show-info", info);
    pb.classList.toggle("rt-pb-show-swipe", swipe);
    pb.classList.toggle("rt-pb-show-rail", rail);
    pb.classList.toggle("rt-pb-show-up", up);
    pb.classList.toggle("rt-pb-show-osd", osd);
  }

  // ▼ : live channels in a row; the current one opens into a card with the show's details
  pbRail(scene) {
    const g = this.guide();
    const i = this.pbIndex;
    const ch = g[i];
    const tile = (c) => `<div class="rt-pb-tile">${this.poster(c, this.nowTitle(c), g.indexOf(c))}<em>● Live</em></div>`;
    const near = (d) => g[(i + d + g.length) % g.length];
    const time = this.progTimes(ch)[0] || "";
    scene.querySelector(".rt-pb-rail").innerHTML = `
      ${[-2, -1].map((d) => tile(near(d))).join("")}
      <div class="rt-pb-card">
        <div class="rt-pb-tile">${this.poster(ch, this.nowTitle(ch), i)}<em>● Live</em></div>
        <div class="rt-pb-card-txt">
          <b>${this.esc(this.nowTitle(ch))}</b>
          <span>${this.esc(ch.genre)}  |  ${this.esc(ch.language)}  |  ${this.esc(time)}</span>
          <p>${this.esc(this.progDesc(ch, (ch.programs || [])[0]))}</p>
        </div>
      </div>
      ${[1, 2].map((d) => tile(near(d))).join("")}`;
    this.pbShow(scene, { rail: true });
  }

  // ▲ : "Upcoming Shows" — the show on now in detail, the next shows below
  pbUp(scene) {
    const ch = this.guide()[this.pbIndex];
    const progs = ch.programs || [];
    const times = this.progTimes(ch);
    const next = progs.slice(1, 4);
    while (next.length < 3) next.push({ title: ch.genre === "News" ? "Headlines" : "Up Next" });
    scene.querySelector(".rt-pb-up").innerHTML = `
      <div class="rt-pb-up-head"><span>←</span> Upcoming Shows</div>
      <div class="rt-pb-up-main">
        ${this.poster(ch, this.nowTitle(ch), 0)}
        <div class="rt-pb-up-txt">
          <b>${this.esc(this.nowTitle(ch))}</b>
          <span>${this.esc(times[0] || "")}  •  ${this.esc(ch.language)}</span>
          <span>${this.esc(this.subGenres(ch.genre))}</span>
          <p>${this.esc(this.progDesc(ch, progs[0]))}</p>
        </div>
      </div>
      <div class="rt-pb-up-row">${next.map((p, n) => this.poster(ch, p.title, n + 1)).join("")}</div>`;
    this.pbShow(scene, { up: true });
  }

  // Channel-number box: digits so far; shows the channel once the number matches one
  pbOsd(scene, digits) {
    const ch = this.guide().find((c) => String(c.lcn) === digits);
    scene.querySelector(".rt-pb-osd-digits").textContent = digits || "---";
    const st = scene.querySelector(".rt-pb-osd-status");
    st.textContent = ch ? "PRESS OK OR WAIT" : "ENTERING LCN...";
    st.classList.toggle("rt-pb-osd-ok", !!ch);
    scene.querySelector(".rt-pb-osd-name").textContent = ch ? ch.name : "Live Channel";
    scene.querySelector(".rt-pb-osd-meta").textContent = ch ? `${ch.genre} • ${this.nowTitle(ch)}` : "Enter 3-digit Channel Number";
    this.pbShow(scene, { osd: true });
  }

  buildSteps() {
    const g = this.guide();
    const idx = (lcn, fb) => { const n = g.findIndex((c) => String(c.lcn) === String(lcn)); return n >= 0 ? n : fb; };
    const base = idx("335", Math.min(6, g.length - 1));        // ABP Ananda, as in the reference photos
    const numCh = g[base] || { lcn: "335", name: "ABP Ananda" };
    const wrong = idx("338", -1) >= 0 ? "338" : String(numCh.lcn).slice(0, 2) + "8"; // typo to delete
    const d = String(numCh.lcn).split("");
    const startNum = idx("135", 1);                            // channel playing before typing

    return [
      /* ---------------- WELCOME ---------------- */
      {
        tag: "WELCOME",
        title: "Meet your PlayTop remote",
        desc: "Let's take a quick look at your remote: finding channels in the Live TV guide, and the keys you use while watching. You can skip it at any time.",
        chips: [],
        render: () => `
          <div class="rt-welcome">
            <img src="assets/vibe_logo.png" alt="" class="rt-welcome-logo" />
            <p>Live TV · OTT · Movies</p>
            <span class="rt-welcome-sub">all with one remote</span>
          </div>`,
        beats: [
          { key: "dpad", label: "Move", tap: false },
          { key: "ok", label: "OK", tap: false },
          { key: "back", label: "Back", tap: false },
          { key: "ch", label: "Channels", tap: false },
          { key: "vol", label: "Volume", tap: false },
          { key: "numpad", label: "Channel numbers", tap: false }
        ],
        beatMs: 1300
      },

      /* ---------------- LIVE TV ---------------- */
      {
        tag: "LIVE TV · FIND A CHANNEL",
        title: "Filter the TV guide by language and genre",
        desc: "Open Live TV from the menu on the left. Use ▲ ▼ and OK on the Languages and Genres lists to show only the channels you want. Press ▶ to move into the channel list.",
        chips: ["▲ ▼", "OK", "▶"],
        render: () => this.epgHtml(),
        setup: (s) => { this.epgSetup(s); this.focus(s, '.rt-epg-lang[data-v="All"]'); },
        beats: [
          { key: "down", label: "▼", apply: (s) => this.focus(s, '.rt-epg-lang[data-v="Hindi"]'), ms: 1000 },
          { key: "down", label: "▼", apply: (s) => this.focus(s, '.rt-epg-lang[data-v="Bengali"]'), ms: 1100 },
          { key: "ok", label: "OK", apply: (s) => this.epgSelect(s, "lang", "Bengali"), ms: 1500 },
          { key: "right", label: "▶", apply: (s) => this.focus(s, '.rt-epg-genre[data-v="All"]'), ms: 1000 },
          { key: "down", label: "▼", apply: (s) => this.focus(s, '.rt-epg-genre[data-v="Entertainment"]'), ms: 1100 },
          { key: "ok", label: "OK", apply: (s) => this.epgSelect(s, "genre", "Entertainment"), ms: 1500 },
          { key: "right", label: "▶", apply: (s) => { s.querySelector(".rt-epg").classList.add("rt-epg-collapsed"); this.epgFocusRow(s, 0); }, ms: 2200 }
        ]
      },

      /* ---------------- WHILE WATCHING: ARROW KEYS ---------------- */
      {
        tag: "LIVE TV · WHILE WATCHING",
        title: "Use the arrows while a channel is playing",
        desc: "◀ ▶ switch to the previous or next channel number. ▼ shows what's on now, with the other live channels beside it. ▲ opens the full details of the show that's on, with what's coming up next. Press Back to close them.",
        chips: ["◀ ▶  Channel", "▼  On now", "▲  Show details", "←  Close"],
        render: () => this.pbHtml(),
        setup: (s) => this.pbTune(s, base, 0),
        beats: [
          { key: "right", label: "▶  Next", apply: (s) => this.pbTune(s, this.pbIndex + 1, 1, { info: true, swipe: true }), ms: 1600 },
          { key: "right", label: "▶  Next", apply: (s) => this.pbTune(s, this.pbIndex + 1, 1, { info: true, swipe: true }), ms: 1600 },
          { key: "left", label: "◀  Previous", apply: (s) => this.pbTune(s, this.pbIndex - 1, -1, { info: true, swipe: true }), ms: 1600 },
          { key: "left", label: "◀  Previous", apply: (s) => this.pbTune(s, this.pbIndex - 1, -1, { info: true, swipe: true }), ms: 1900 },
          { key: null, apply: (s) => this.pbShow(s, {}), ms: 600 },
          { key: "down", label: "▼  On now", apply: (s) => this.pbRail(s), ms: 3200 },
          { key: "back", label: "Back", apply: (s) => this.pbShow(s, {}), ms: 1100 },
          { key: "up", label: "▲  Details", apply: (s) => this.pbUp(s), ms: 3400 },
          { key: "back", label: "Back", apply: (s) => this.pbShow(s, {}), ms: 1500 }
        ]
      },

      /* ---------------- CHANNEL NUMBER ---------------- */
      {
        tag: "LIVE TV · CHANNEL NUMBER",
        title: "Type a channel number to jump to it",
        desc: `Type the channel number on the number keys, for example ${d.join(" ")} for ${numCh.name}. The box at the top shows which channel will open. Made a mistake? Press ⌫ to delete a digit. Press OK to open the channel right away, or just wait a moment.`,
        chips: ["0 – 9", "⌫  Delete", "OK  Open"],
        render: () => this.pbHtml(),
        setup: (s) => this.pbTune(s, startNum, 0),
        beats: [
          { key: `n${wrong[0]}`, label: wrong[0], apply: (s) => this.pbOsd(s, wrong.slice(0, 1)), ms: 1000 },
          { key: `n${wrong[1]}`, label: wrong[1], apply: (s) => this.pbOsd(s, wrong.slice(0, 2)), ms: 1000 },
          { key: `n${wrong[2]}`, label: wrong[2], apply: (s) => this.pbOsd(s, wrong), ms: 1500 },
          { key: "del", label: "⌫  Delete", apply: (s) => this.pbOsd(s, wrong.slice(0, 2)), ms: 1200 },
          { key: `n${d[2]}`, label: d[2], apply: (s) => this.pbOsd(s, d.join("")), ms: 1500 },
          { key: "ok", label: "OK", apply: (s) => this.pbTune(s, base, 1, { info: true }), ms: 2600 }
        ]
      }
    ];
  }

  /* ----------------------------------------------------------
   * DOM
   * ---------------------------------------------------------- */
  build() {
    if (this.root) return;
    const root = document.getElementById("screen-remote-tutorial");
    if (!root) return;
    this.root = root;
    this.STEPS = this.buildSteps();

    root.innerHTML = `
      <div class="rt-shell">
        <header class="rt-top">
          <div class="rt-brand">
            <img src="assets/vibe_logo.png" alt="VIBE" />
            <span>Remote guide</span>
          </div>
        </header>

        <div class="rt-body">
          <div class="rt-remote-col">
            <div class="rt-halo" aria-hidden="true"></div>
            <div class="rt-stage-wrap">
              <div class="rt-stage">
                <img src="assets/remote_v4_cutout.png" alt="PlayTop remote" class="rt-remote-img" draggable="false" />
                <div class="rt-spot" aria-hidden="true"></div>
              </div>
              <div class="rt-key-label" aria-hidden="true"></div>
              <div class="rt-finger" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>
              </div>
            </div>
          </div>

          <div class="rt-info-col">
            <div class="rt-text" aria-live="polite">
              <span class="rt-step-tag" id="rt-step-tag"></span>
              <h2 class="rt-title" id="rt-title"></h2>
              <p class="rt-desc" id="rt-desc"></p>
              <div class="rt-chips" id="rt-chips"></div>
            </div>
            <div class="rt-tv">
              <div class="rt-tv-screen"><div class="rt-scene" id="rt-scene"></div></div>
              <div class="rt-tv-stand" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <footer class="rt-bottom">
          <button id="rt-prev" class="rt-btn rt-btn-ghost focusable">‹ Back</button>
          <div class="rt-dots" id="rt-dots">${this.STEPS.map(() => "<i></i>").join("")}</div>
          <button id="rt-next" class="rt-btn rt-btn-primary focusable default-focus">Next ›</button>
          <button id="rt-skip" class="rt-btn rt-btn-primary rt-btn-skip focusable">Skip »</button>
        </footer>
      </div>`;

    root.querySelector("#rt-skip").addEventListener("click", () => this.close());
    root.querySelector("#rt-prev").addEventListener("click", () => this.go(this.stepIndex - 1));
    root.querySelector("#rt-next").addEventListener("click", () => {
      if (this.stepIndex >= this.STEPS.length - 1) this.close();
      else this.go(this.stepIndex + 1);
    });
  }

  /* ----------------------------------------------------------
   * Open / close
   * ---------------------------------------------------------- */
  open() {
    this.build();
    if (!this.root || this.isOpen) return;
    const app = window.app;
    const engine = window.tvEngine;

    this.isOpen = true;
    if (app) {
      app.remoteTutorialOpen = true;
      if (app.stopHeroCarousel) app.stopHeroCarousel();
      if (app.handleLcnClear) app.handleLcnClear();
    }
    this.prevScope = engine ? engine.activeScope : "body";
    this.prevFocus = engine ? engine.currentFocus : null;

    this.root.classList.remove("screen-hidden", "rt-closing");
    this.root.classList.add("screen-active", "rt-entering");
    clearTimeout(this.enterTimer); // own timer: go() clears the step timers
    this.enterTimer = setTimeout(() => this.root.classList.remove("rt-entering"), 900);
    if (engine) engine.setScope("#screen-remote-tutorial");

    this.go(0, true);
  }

  // silent: the app is already navigating elsewhere (e.g. Home key) — don't restore focus
  close({ silent = false } = {}) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.clearTimers();
    const app = window.app;
    const engine = window.tvEngine;
    if (app) app.remoteTutorialOpen = false;

    this.root.classList.add("screen-hidden");
    this.root.classList.remove("screen-active", "rt-entering");
    if (silent || !engine) return;

    engine.playBeep && engine.playBeep("click");
    engine.setScope(this.prevScope || (app ? `#screen-${app.currentScreen}` : "body"));
    let target = this.prevFocus;
    if (!target || !document.body.contains(target) || target.closest(".screen-hidden, [hidden]")) {
      const scr = app ? `#screen-${app.currentScreen}` : "body";
      target = (app && app.currentScreen === "home" && document.querySelector(".home-main-scroll:not([hidden]) .btn-watch-now")) ||
        document.querySelector(`${scr} .default-focus`) || document.querySelector(`${scr} .focusable:not(.screen-back-btn)`);
    }
    if (target) engine.focus(target);
    if (app && app.currentScreen === "home" && app.startHeroCarousel) app.startHeroCarousel();
  }

  // Remote Back key: previous step; on the first step it closes the guide
  back() {
    if (this.stepIndex > 0) this.go(this.stepIndex - 1);
    else this.close();
  }

  /* ----------------------------------------------------------
   * Steps & the beat loop
   * ---------------------------------------------------------- */
  go(index, first = false) {
    const i = Math.max(0, Math.min(this.STEPS.length - 1, index));
    const step = this.STEPS[i];
    this.stepIndex = i;
    this.clearTimers();

    const $ = (sel) => this.root.querySelector(sel);
    $("#rt-step-tag").textContent = `${step.tag}  ·  ${i + 1} / ${this.STEPS.length}`;
    $("#rt-title").textContent = step.title;
    $("#rt-desc").textContent = step.desc;
    $("#rt-chips").innerHTML = step.chips.map((c) => `<span class="rt-chip">${c}</span>`).join("");

    const text = $(".rt-text");
    text.classList.remove("rt-swap");
    void text.offsetWidth; // restart the entry animation
    text.classList.add("rt-swap");

    const scene = $("#rt-scene");
    scene.className = "rt-scene";
    scene.innerHTML = step.render();

    this.root.querySelectorAll("#rt-dots i").forEach((d, n) => {
      d.classList.toggle("on", n === i);
      d.classList.toggle("done", n < i);
    });

    const prev = $("#rt-prev");
    const next = $("#rt-next");
    prev.style.visibility = i === 0 ? "hidden" : "visible";
    const last = i === this.STEPS.length - 1;
    next.textContent = last ? "Start Watching" : (i === 0 ? "Let's go ›" : "Next ›");
    next.classList.toggle("rt-btn-finish", last);
    // Last slide: "Start Watching" already closes the guide
    $("#rt-skip").style.visibility = last ? "hidden" : "visible";

    // Keep the remote focus on Next unless the user is on Back
    const engine = window.tvEngine;
    if (engine) {
      const cur = engine.currentFocus;
      const keepPrev = cur === prev && i > 0;
      if (!keepPrev) engine.focus(next, true);
    }

    this.placeSpot(null);
    this.runLoop(step, scene, first ? 900 : 450);
  }

  runLoop(step, scene, startDelay) {
    let t = startDelay;
    if (step.setup) step.setup(scene);
    step.beats.forEach((beat) => {
      const ms = beat.ms || step.beatMs || 1250;
      this.later(() => this.playBeat(beat, scene), t);
      t += ms;
    });
    // loop the demo
    this.later(() => {
      if (!this.isOpen || this.STEPS[this.stepIndex] !== step) return;
      this.runLoop(step, scene, 350);
    }, t + 300);
  }

  playBeat(beat, scene) {
    if (!this.isOpen) return;
    if (!beat.key) {
      this.placeSpot(null);
      if (beat.apply) beat.apply(scene);
      return;
    }
    this.placeSpot(beat.key, beat.label, beat.tap !== false);
    if (beat.tap === false) {
      if (beat.apply) beat.apply(scene);
      return;
    }
    // finger glides in (~400ms), then taps; the TV reacts on the tap
    this.later(() => {
      if (!this.isOpen) return;
      const wrap = this.root.querySelector(".rt-stage-wrap");
      wrap.classList.remove("rt-tap");
      void wrap.offsetWidth;
      wrap.classList.add("rt-tap");
      if (beat.apply) beat.apply(scene);
    }, 420);
  }

  placeSpot(key, label = "", withFinger = true) {
    const wrap = this.root.querySelector(".rt-stage-wrap");
    const box = this.KEYS[key];
    wrap.classList.toggle("rt-has-spot", !!box);
    wrap.classList.toggle("rt-has-finger", !!box && withFinger);
    if (!box) return;
    const [x, y, w, h] = box;
    wrap.style.setProperty("--x", `${x}%`);
    wrap.style.setProperty("--y", `${y}%`);
    wrap.style.setProperty("--w", `${w}%`);
    wrap.style.setProperty("--h", `${h}%`);
    const lab = this.root.querySelector(".rt-key-label");
    lab.textContent = label;
    lab.classList.toggle("rt-key-label-show", !!label);
  }

  later(fn, ms) {
    this.timers.push(setTimeout(fn, ms));
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}

window.remoteTutorial = new RemoteTutorial();
