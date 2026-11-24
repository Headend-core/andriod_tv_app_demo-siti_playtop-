/**
 * VIBE PlayTop Magic - Main Application Controller
 * Exact 1:1 Implementation of VIBE PlayTop STB Interface, Live TV PiP Guide & Dedicated Profile Account Page
 */

class VibePlayTopApp {
  constructor() {
    this.currentScreen = "profile"; // Starts on Profile Selection
    this.activeProfile = VIBE_DATA.profiles[0];
    this.currentHeroIndex = 0;
    this.heroInterval = null;
    this.searchQuery = "";
    this.isLiveTvTrayMinimized = false;
    this.selectedLanguage = "All";
    this.selectedGenre = "All";
    this.selectedLiveChannel = VIBE_DATA.liveTvGuide.channels[2]; // ABP Ananda
    this.selectedProgram = VIBE_DATA.liveTvGuide.channels[2].programs[0];
    this.prefModalType = "languages";

    // Live TV LCN Direct Channel Tuning State
    this.lcnBuffer = "";
    this.lcnTimer = null;
    this.playerBannerTimer = null;

    // Helper to get ISO date string N days from today
    const daysFromNow = (n) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    // Subscription & Package Store State
    const initCatvExp = (VIBE_DATA.accountServices && VIBE_DATA.accountServices.catv && VIBE_DATA.accountServices.catv.expiry) || daysFromNow(4);
    this.currentSubscription = {
      hasSubscription: true,
      packageId: "pkg-2",
      planName: "Package 2: SITI Bengali Mega",
      price: 199,
      channelsCount: 319,
      ottCount: 8,
      expiry: initCatvExp,
      vscNumber: "037588111111",
      validUntil: "Dec 06, 2026"
    };
    this.selectedPackageId = "pkg-2";
    this.benefitsCurrentPackageId = "pkg-2";
    this.benefitsCurrentCategory = "Entertainment";
    this.benefitsCurrentLanguage = "All";
    this.benefitsSourceScreen = "subscription";
    this.quickRechargeModalOpen = false;
    this.catvRechargeSuccessMsg = null;
    this.userRecentlyWatched = null;

    // Login / new-installer state
    // Demo account (existing customer): full previous workflow — 3 profiles, Active Plan
    this.DEMO_MOBILE = "7439467546";
    this.DEMO_OTP = "1234";
    this.MAX_PROFILES = 5; // shown on the Profile page for a new registration
    this.demoSubscription = { ...this.currentSubscription };
    // Fresh account created by any other number: single profile, no plan
    this.newAccountProfile = {
      id: "profile-new",
      name: "Profile 1",
      avatarBg: "#1E293B",
      avatarImage: "profile%20icon/01_young_man_hoodie.png",
      color: "#E51B24",
      accent: "#FF4D55",
      preferredLanguages: [],
      preferredGenres: []
    };
    this.isLoggedIn = this.readLoginState();
    this.newAccountProfiles = [];
    this.accountType = "demo";
    this.accountMobile = this.DEMO_MOBILE;
    if (this.isLoggedIn) {
      try {
        // QR login = demo customer; mobile registration may create a "new" account
        this.accountType = localStorage.getItem("vibe_account") === "new" ? "new" : "demo";
        this.accountMobile = localStorage.getItem("vibe_mobile") || this.DEMO_MOBILE;
        this.newAccountProfiles = JSON.parse(localStorage.getItem("vibe_new_profiles") || "[]");
      } catch (e) { /* defaults */ }
    }
    this.applyAccount();
    this.loginModalOpen = false;
    this.loginView = "qr";

    this.init();
  }

  init() {
    this.renderProfiles();
    this.renderAccountProfilePage();
    this.renderSubscriptionStore();
    this.renderHomeHub();
    this.renderEPG();
    this.renderSearch();
    this.renderHelpFAQ();
    this.renderVirtualRemote();
    this.setupEventListeners();
    this.startClock();

    const landingSkip = document.getElementById("btn-landing-skip");
    if (landingSkip) landingSkip.addEventListener("click", () => this.finishLandingChannel());

    this.setupLoginModal();
    this.setupAccountInfoModal();
    this.setupCreateProfile();
    this.setupPaymentPage();

    // Every app start: startup animation first, then the normal flow
    this.playStartupAnimation();
  }

  // Normal flow after the startup animation
  startNormalFlow() {
    if (this.isLoggedIn) {
      // Returning user: demo account → profile selection → landing → home
      this.enterAfterLogin();
    } else {
      // Not logged in: Landing Channel (10s) → Home as a guest.
      // The login popup appears only when they try to play content / open Profile / Subscription.
      this.applyGuestState();
      this.startLandingChannel();
    }
  }

  /* ----------------------------------------------------------
   * STARTUP ANIMATION (assets/startup_animation.mp4, ~10s)
   * Plays with sound when the browser allows it, otherwise muted.
   * No skip button; the Back key still skips. If the video can't play, the app continues straight away.
   * ---------------------------------------------------------- */
  playStartupAnimation() {
    const video = document.getElementById("splash-video");
    this.splashDone = false;

    // No on-screen controls: the intro plays to the end (Back still skips it)
    this.showScreen("splash");
    if (!video) return this.finishStartupAnimation();

    const splashScreen = document.getElementById("screen-splash");
    if (splashScreen) {
      splashScreen.addEventListener("click", () => this.finishStartupAnimation(), { once: true });
    }

    video.addEventListener("ended", () => this.finishStartupAnimation());
    video.addEventListener("error", () => this.finishStartupAnimation());
    // Safety net: never get stuck on the intro
    this.splashTimer = setTimeout(() => this.finishStartupAnimation(), 15000);

    video.currentTime = 0;
    video.muted = false;
    video.play().catch((err1) => {
      // Autoplay with sound blocked (browser policy before any key press): play muted
      console.info("[splash] play with sound blocked:", err1 && err1.name);
      video.muted = true;
      video.play().catch((err2) => {
        console.warn("[splash] muted play failed:", err2 && err2.name, err2 && err2.message);
        this.finishStartupAnimation();
      });
    });
  }

  finishStartupAnimation() {
    if (this.splashDone) return;
    this.splashDone = true;
    clearTimeout(this.splashTimer);
    const video = document.getElementById("splash-video");
    if (video) video.pause();
    this.startNormalFlow();
  }

  /* ----------------------------------------------------------
   * LOGIN STATE (persisted so a "new installer" only sees login once)
   * Add ?fresh to the URL to force the new-installer flow.
   * ---------------------------------------------------------- */
  readLoginState() {
    try {
      if (new URLSearchParams(location.search).has("fresh")) {
        ["vibe_logged_in", "vibe_account", "vibe_mobile", "vibe_new_profiles", "vibe_subscription"]
          .forEach((k) => localStorage.removeItem(k));
        return false;
      }
      return localStorage.getItem("vibe_logged_in") === "1";
    } catch (e) {
      return false;
    }
  }

  writeLoginState(value) {
    this.isLoggedIn = value;
    try {
      if (value) {
        localStorage.setItem("vibe_logged_in", "1");
        localStorage.setItem("vibe_account", this.accountType);
        localStorage.setItem("vibe_mobile", this.accountMobile);
      } else {
        localStorage.removeItem("vibe_logged_in");
        localStorage.removeItem("vibe_account");
        localStorage.removeItem("vibe_mobile");
        localStorage.removeItem("vibe_new_profiles");
        localStorage.removeItem("vibe_subscription");
        localStorage.removeItem("vibe_recent_new");
      }
    } catch (e) { /* storage unavailable: state lives for this session only */ }
  }

  // Profiles that belong to the logged-in account
  getAccountProfiles() {
    return this.accountType === "new" ? this.newAccountProfiles : VIBE_DATA.profiles;
  }

  // Load account-specific data: profiles, active profile, subscription, account page details
  applyAccount() {
    if (this.accountType === "new") {
      // Placeholder until the first profile is created
      this.activeProfile = this.newAccountProfiles[0] || this.newAccountProfile;
      this.currentSubscription = { hasSubscription: false };
    } else {
      this.activeProfile = VIBE_DATA.profiles[0];
      this.currentSubscription = { ...this.demoSubscription };
    }
    // A plan bought on the Payment page overrides the account default until Log Out
    if (this.isLoggedIn) {
      try {
        const saved = JSON.parse(localStorage.getItem("vibe_subscription") || "null");
        if (saved && saved.hasSubscription) this.currentSubscription = saved;
      } catch (e) { /* ignore */ }
    }
    this.selectedPackageId = this.currentSubscription.packageId || "pkg-2";

    const mobileEl = document.getElementById("account-mobile-val");
    if (mobileEl) mobileEl.textContent = this.accountMobile;
    const lastLoginEl = document.getElementById("account-last-login-val");
    if (lastLoginEl && this.accountType === "new") {
      lastLoginEl.textContent = new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    this.userRecentlyWatched = null;
    this.renderRecentlyWatched();
    if (this.homeView === "ott") this.renderOttPage();
  }

  getRecentlyWatchedList() {
    if (this.userRecentlyWatched) return this.userRecentlyWatched;
    const isNew = this.accountType === "new";
    const key = isNew ? "vibe_recent_new" : "vibe_recent_demo";
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved) {
        this.userRecentlyWatched = saved;
      } else if (isNew) {
        this.userRecentlyWatched = [];
      } else {
        this.userRecentlyWatched = [...VIBE_DATA.recentlyWatched];
      }
    } catch (e) {
      this.userRecentlyWatched = isNew ? [] : [...VIBE_DATA.recentlyWatched];
    }
    return this.userRecentlyWatched;
  }

  // Where a logged-in user lands
  enterAfterLogin() {
    const label = document.getElementById("nav-profile-label");
    if (label) label.textContent = this.activeProfile.name;
    this.renderAccountProfilePage();
    const profiles = this.getAccountProfiles();
    if (this.accountType === "new" && profiles.length === 0) {
      // First registration: no profiles yet → Create Profile
      this.openCreateProfile("first");
    } else if (this.accountType === "new" && profiles.length === 1) {
      this.startLandingChannel();
    } else {
      this.renderProfiles();
      this.showScreen("profile");
    }
  }

  applyGuestState() {
    const label = document.getElementById("nav-profile-label");
    if (label) label.textContent = this.isLoggedIn ? this.activeProfile.name : "Login";
  }

  /* ----------------------------------------------------------
   * LOGIN POPUP (QR code / TV remote login)
   * ---------------------------------------------------------- */
  setupLoginModal() {
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    on("btn-login-goback", () => this.closeLoginModal());
    on("btn-login-refresh", () => this.refreshLoginCode());
    // Demo hook: pressing OK on the QR simulates the user confirming the code on their phone
    on("btn-login-qr", () => this.simulatePhoneConfirm());
    on("btn-account-logout", () => this.logout());
    this.setupRegistration();
  }

  /* ----------------------------------------------------------
   * REGISTRATION WITH MOBILE NUMBER (new users) → OTP → account
   * Demo OTP: 1234. The demo number logs in to the existing customer;
   * any other valid number creates a fresh account (Create Profile next).
   * ---------------------------------------------------------- */
  setupRegistration() {
    this.regStep = "mobile";
    this.regMobile = "";
    this.regOtp = "";

    document.querySelectorAll("#reg-keypad .reg-key").forEach((key) => {
      key.addEventListener("click", () => this.regKeyPress(key.getAttribute("data-key")));
    });
    const on = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };
    on("btn-reg-submit", () => this.regSubmit());
    on("btn-reg-use-qr", () => {
      this.showLoginView("qr");
      this.refreshLoginCode(false);
      const btn = document.getElementById("btn-login-refresh");
      if (btn) window.tvEngine.focus(btn);
    });
    on("btn-login-use-mobile", () => {
      this.stopLoginRefreshTimer();
      this.resetRegistration();
      this.showLoginView("mobile");
      this.focusRegKeypad();
    });

    // Number keys / Backspace on a real remote or keyboard while typing the number or OTP
    window.addEventListener("keydown", (e) => {
      if (!this.loginModalOpen || this.loginView !== "mobile") return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.regKeyPress(e.key);
      } else if (e.key === "Backspace" && this.regCurrentValue().length > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.regKeyPress("del");
      }
    }, true);
  }

  resetRegistration() {
    this.regStep = "mobile";
    this.regMobile = "";
    this.regOtp = "";
    this.renderRegistration();
  }

  focusRegKeypad() {
    setTimeout(() => {
      const first = document.querySelector('#reg-keypad .reg-key[data-key="1"]');
      if (first) window.tvEngine.focus(first);
    }, 60);
  }

  regCurrentValue() {
    return this.regStep === "otp" ? this.regOtp : this.regMobile;
  }

  regKeyPress(key) {
    const max = this.regStep === "otp" ? 4 : 10;
    let val = this.regCurrentValue();
    if (key === "del") val = val.slice(0, -1);
    else if (key === "clear") val = "";
    else if (/^[0-9]$/.test(key) && val.length < max) val += key;
    if (this.regStep === "otp") this.regOtp = val; else this.regMobile = val;
    this.setRegError("");
    this.renderRegistration();
    window.tvEngine.playBeep("click");
    // Full value typed → move focus to the submit button
    if (val.length === max) {
      const submit = document.getElementById("btn-reg-submit");
      if (submit) window.tvEngine.focus(submit);
    }
  }

  setRegError(msg) {
    const el = document.getElementById("reg-error");
    if (el) el.textContent = msg;
  }

  renderRegistration() {
    const isOtp = this.regStep === "otp";
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const val = this.regCurrentValue();
    set("reg-step-tag", isOtp ? "STEP 2 OF 2" : "STEP 1 OF 2");
    set("reg-label", isOtp ? "Enter the 4-digit OTP" : "Enter your mobile number");
    set("reg-prefix", isOtp ? "OTP" : "+91");
    set("reg-placeholder", isOtp ? "• • • •" : "10-digit mobile number");
    set("reg-value", isOtp ? val.split("").join(" ") : val.replace(/^(\d{5})(\d+)/, "$1 $2"));
    set("reg-hint", isOtp
      ? `OTP sent to +91 ${this.regMobile.slice(0, 2)}XXXXXX${this.regMobile.slice(-2)} (demo OTP: ${this.DEMO_OTP}) · Back to change number`
      : "We will send a one-time password (OTP) to this number");
    set("btn-reg-submit", isOtp ? "Verify & Continue" : "Get OTP");
    const ph = document.getElementById("reg-placeholder");
    if (ph) ph.style.display = val ? "none" : "";
  }

  regSubmit() {
    if (this.regStep === "mobile") {
      if (!/^[6-9]\d{9}$/.test(this.regMobile)) {
        this.setRegError("Please enter a valid 10-digit mobile number");
        window.tvEngine.playBeep("back");
        return;
      }
      this.regStep = "otp";
      this.regOtp = "";
      this.setRegError("");
      this.renderRegistration();
      window.tvEngine.playBeep("click");
      this.focusRegKeypad();
      return;
    }
    if (this.regOtp !== this.DEMO_OTP) {
      this.setRegError("Incorrect OTP. Please try again");
      this.regOtp = "";
      this.renderRegistration();
      window.tvEngine.playBeep("back");
      this.focusRegKeypad();
      return;
    }
    const type = this.regMobile === this.DEMO_MOBILE ? "demo" : "new";
    this.completeLogin(type, this.regMobile);
  }

  openLoginModal() {
    const modal = document.getElementById("screen-login-modal");
    if (!modal) return;

    this.loginReturnFocus = window.tvEngine.currentFocus || null;
    this.loginModalOpen = true;
    this.stopHeroCarousel();

    // QR login opens first; mobile-number login stays one press away
    this.resetRegistration();
    this.showLoginView("qr");
    this.refreshLoginCode(false);

    modal.classList.remove("screen-hidden");
    modal.classList.add("screen-active");
    window.tvEngine.setScope("#screen-login-modal");
    const refreshBtn = document.getElementById("btn-login-refresh");
    if (refreshBtn) window.tvEngine.focus(refreshBtn);
  }

  hideLoginModal() {
    const modal = document.getElementById("screen-login-modal");
    if (modal) {
      modal.classList.add("screen-hidden");
      modal.classList.remove("screen-active");
    }
    this.loginModalOpen = false;
    this.stopLoginRefreshTimer();
    clearTimeout(this.loginConfirmTimeout);
  }

  // "Go Back": dismiss and keep exploring as a guest
  closeLoginModal() {
    this.hideLoginModal();
    window.tvEngine.setScope(`#screen-${this.currentScreen}`);
    if (this.currentScreen === "home") this.startHeroCarousel();

    let target = this.loginReturnFocus;
    if (!target || !document.body.contains(target) || target.closest(".screen-hidden, #screen-login-modal")) {
      target = (this.currentScreen === "home" && document.querySelector(".home-main-scroll:not([hidden]) .btn-watch-now")) ||
        (document.querySelector(`#screen-${this.currentScreen} .default-focus`) || document.querySelector(`#screen-${this.currentScreen} .focusable:not(.screen-back-btn)`));
    }
    if (target) window.tvEngine.focus(target);
  }

  handleLoginBack() {
    if (this.loginView === "success") return;
    if (this.loginView === "mobile" && this.regStep === "otp") {
      // Back from OTP → change the mobile number
      this.regStep = "mobile";
      this.regOtp = "";
      this.setRegError("");
      this.renderRegistration();
      this.focusRegKeypad();
      return;
    }
    this.closeLoginModal();
  }

  showLoginView(view) {
    this.loginView = view;
    ["mobile", "qr", "success"].forEach((v) => {
      const el = document.getElementById(`login-view-${v}`);
      if (el) el.classList.toggle("login-view-hidden", v !== view);
    });

    const title = document.getElementById("login-title");
    const goBack = document.getElementById("btn-login-goback");
    if (title) title.textContent = view === "success" ? "Welcome to SITI PlayTop Magic"
      : view === "mobile" ? "Register with your mobile number" : "Log in with your mobile";
    if (goBack) goBack.style.visibility = view === "success" ? "hidden" : "visible";

    const qrBox = document.getElementById("btn-login-qr");
    if (qrBox) qrBox.classList.remove("login-qr-done");

  }

  generateLoginCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const digits = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return digits + chars[Math.floor(Math.random() * chars.length)];
  }

  refreshLoginCode(playSound = true) {
    this.loginCode = this.generateLoginCode();
    const codeEl = document.getElementById("login-code");
    if (codeEl) codeEl.textContent = this.loginCode.split("").join(" ");
    this.renderLoginQR(this.loginCode);
    this.startLoginRefreshTimer(300);
    if (playSound) window.tvEngine.playBeep("click");
  }

  startLoginRefreshTimer(seconds) {
    this.stopLoginRefreshTimer();
    const endAt = Date.now() + seconds * 1000;
    const timeEl = document.getElementById("login-refresh-time");
    const tick = () => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      if (timeEl) timeEl.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
      if (left <= 0) this.refreshLoginCode(false); // code expired → issue a new one
    };
    tick();
    this.loginRefreshInterval = setInterval(tick, 1000);
  }

  stopLoginRefreshTimer() {
    if (this.loginRefreshInterval) {
      clearInterval(this.loginRefreshInterval);
      this.loginRefreshInterval = null;
    }
  }

  // Visual QR-style matrix (decorative; seeded from the code so it changes on refresh)
  renderLoginQR(seedText) {
    this.drawDemoQR(document.getElementById("login-qr-svg"), seedText);
  }

  // Draws a QR-looking pattern (demo only, not scannable) into a 29×29 SVG
  drawDemoQR(svg, seedText) {
    if (!svg) return;
    const N = 29;
    let seed = 0;
    for (const c of seedText) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const inFinder = (x, y) =>
      (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

    let rects = "";
    const finder = (ox, oy) => {
      rects += `<rect x="${ox}" y="${oy}" width="7" height="7" fill="#000"/>`;
      rects += `<rect x="${ox + 1}" y="${oy + 1}" width="5" height="5" fill="#fff"/>`;
      rects += `<rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" fill="#000"/>`;
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinder(x, y)) continue;
        const timing = (y === 6 || x === 6) ? (x + y) % 2 === 0 : rand() < 0.48;
        if (timing) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000"/>`;
      }
    }
    // alignment pattern
    rects += `<rect x="20" y="20" width="5" height="5" fill="#000"/><rect x="21" y="21" width="3" height="3" fill="#fff"/><rect x="22" y="22" width="1" height="1" fill="#000"/>`;

    svg.innerHTML = `<rect width="${N}" height="${N}" fill="#fff"/>${rects}`;
  }

  simulatePhoneConfirm() {
    const qrBox = document.getElementById("btn-login-qr");
    if (qrBox) qrBox.classList.add("login-qr-done");
    this.stopLoginRefreshTimer();
    clearTimeout(this.loginConfirmTimeout);
    // QR confirmation signs in to the demo (existing customer) account
    this.loginConfirmTimeout = setTimeout(() => this.completeLogin("demo", this.DEMO_MOBILE), 1200);
  }

  completeLogin(accountType = "demo", mobile = this.DEMO_MOBILE) {
    this.accountType = accountType;
    if (accountType === "new") this.newAccountProfiles = []; // fresh registration starts with no profiles
    this.accountMobile = mobile;
    this.applyAccount();
    this.writeLoginState(true);
    this.showLoginView("success");

    const sub = document.querySelector("#login-view-success .login-success-sub");
    if (sub) sub.textContent = accountType === "new" ? "Your account is ready — let's create your profile" : "Setting up your profiles…";

    window.tvEngine.playBeep("click");
    clearTimeout(this.loginConfirmTimeout);
    this.loginConfirmTimeout = setTimeout(() => {
      this.hideLoginModal();
      this.enterAfterLogin();
    }, 1600);
  }

  /* ----------------------------------------------------------
   * ACCOUNT INFO POPUPS (Profile page): CATV / Broadband / OTT & ALTD / Manage Device
   * ---------------------------------------------------------- */
  setupAccountInfoModal() {
    document.querySelectorAll(".account-subs-tab").forEach((tab) => {
      tab.addEventListener("click", () => this.openAccountInfo(tab.getAttribute("data-subs")));
    });
    const devBtn = document.getElementById("btn-manage-devices");
    if (devBtn) devBtn.addEventListener("click", () => this.openAccountInfo("devices"));
    const contactBtn = document.getElementById("btn-account-contact");
    if (contactBtn) contactBtn.addEventListener("click", () => this.openAccountInfo("contact"));
    const closeBtn = document.getElementById("btn-acc-info-close");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeAccountInfo());
    this.updateDeviceStatus();
  }

  getCatvExpiry() {
    if (this.currentSubscription && this.currentSubscription.expiry) {
      return this.currentSubscription.expiry;
    }
    if (VIBE_DATA.accountServices && VIBE_DATA.accountServices.catv && VIBE_DATA.accountServices.catv.expiry) {
      return VIBE_DATA.accountServices.catv.expiry;
    }
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  formatExpiry(iso) {
    const [y, m, d] = iso.split("-");
    const daysLeft = Math.ceil((new Date(`${iso}T23:59:59`) - new Date()) / 86400000);
    return { text: `${d}/${m}/${y}`, daysLeft };
  }

  expiryRowHtml(iso) {
    const { text, daysLeft } = this.formatExpiry(iso);
    const cls = daysLeft <= 7 ? "acc-days-warn" : "acc-days-ok";
    const left = daysLeft >= 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : "Expired";
    return `
      <div class="acc-info-row">
        <span class="acc-info-label">Package Expiry Date</span>
        <span class="acc-info-value">${text} <span class="acc-days-pill ${cls}">${left}</span></span>
      </div>`;
  }

  // One-line summaries under each subscription card on the Profile page
  updateSubsTabs() {
    const svc = VIBE_DATA.accountServices;
    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const pkg = VIBE_DATA.packages.find((p) => p.id === (this.currentSubscription.packageId || "pkg-2"));
    const exp = (iso) => this.formatExpiry(iso).text;
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    // CATV and Broadband are always active for every account; only OTT depends on a purchase
    set("subs-detail-catv", `VSC ${(hasSub && this.currentSubscription.vscNumber) || svc.catv.vscNumber}`);
    set("subs-detail-broadband", `User ID ${svc.broadband.userId}`);
    set("subs-detail-ott", hasSub ? `${pkg ? pkg.ottApps.length : 0} apps • ${pkg ? pkg.channelsCount : 0} channels` : "Not subscribed");
  }

  // "N device plan" for an OTT app. Uses the app's own `devices` if set in data.js;
  // otherwise varies by app within the package's tier:
  //   low packages (1–2) → 1 or 2 devices, mid (3–5) → 2 or 3, high (6–8) → 3 or 4.
  // The pick is fixed per package + app (not re-randomised on every render).
  ottDevicePlanLabel(pkg, ott) {
    if (ott && ott.devices) return `${ott.devices} device plan`;
    const pkgNum = parseInt(((pkg && pkg.number) || "").replace(/\D/g, ""), 10) || 1;
    const low = pkgNum <= 2 ? 1 : pkgNum <= 5 ? 2 : 3;
    let h = 0;
    for (const c of `${pkg ? pkg.id : ""}|${ott ? ott.name : ""}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    // mix the bits so similar names don't all land on the same value
    h ^= h >>> 16; h = Math.imul(h, 0x45d9f3b); h = (h ^ (h >>> 16)) >>> 0;
    const n = low + (h % 2);
    return `${n} device plan`;
  }

  noSubscriptionHtml(service) {
    return `
      <div class="acc-empty">
        <div class="acc-empty-icon">ⓘ</div>
        <p class="acc-empty-title">No active ${service} subscription</p>
        <p class="acc-empty-sub">Subscribe to a VIBE package to get started.</p>
        <button class="btn-settings-gold-border focusable" id="btn-acc-info-explore">Explore Packages</button>
      </div>`;
  }

  accountIcon(name) {
    const a = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const icons = {
      catv: `<svg ${a}><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/></svg>`,
      broadband: `<svg ${a}><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M2 9a15 15 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1"/></svg>`,
      ott: `<svg ${a}><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>`,
      devices: `<svg ${a}><rect x="2" y="4" width="14" height="11" rx="2"/><path d="M6 19h6"/><rect x="17" y="8" width="5" height="12" rx="1.5"/></svg>`,
      tv: `<svg ${a}><rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 21h8"/></svg>`,
      phone: `<svg ${a}><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>`,
      stick: `<svg ${a}><rect x="8" y="2" width="8" height="15" rx="2"/><path d="M12 17v5"/><path d="M10 6h4"/></svg>`,
      info: `<svg ${a}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
      support: `<svg ${a}><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/></svg>`
    };
    return icons[name] || icons.info;
  }

  buildAccountInfo(type) {
    const svc = VIBE_DATA.accountServices;
    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const pkg = VIBE_DATA.packages.find((p) => p.id === (this.currentSubscription.packageId || "pkg-2"));
    const activePill = `<span class="acc-status-pill">● Active</span>`;

    if (type === "catv") {
      const catvExpiry = this.getCatvExpiry();
      const { daysLeft } = this.formatExpiry(catvExpiry);
      const isExpiringSoon = daysLeft <= 5;
      const catvPkg = (hasSub && pkg) || VIBE_DATA.packages[1];
      const catvPkgName = (this.currentSubscription && this.currentSubscription.planName) || (catvPkg ? `${catvPkg.number}: ${catvPkg.name}` : "VIBE Bengali Mega");
      const catvPkgPrice = (this.currentSubscription && this.currentSubscription.price) || (catvPkg ? catvPkg.price : 199);

      const toastHtml = this.catvRechargeSuccessMsg ? `
        <div class="catv-toast-success">
          <span>✓</span>
          <span>${this.catvRechargeSuccessMsg}</span>
        </div>` : "";
      this.catvRechargeSuccessMsg = null;

      const actionsHtml = isExpiringSoon ? `
        <div class="catv-actions-row">
          <button id="btn-catv-quick-recharge" class="catv-action-btn catv-btn-recharge focusable" title="Quick recharge existing plan (+30 days)">
            <span style="font-size: 1.2rem;">⚡</span>
            <span>Quick Recharge</span>
          </button>
          <button id="btn-catv-upgrade" class="catv-action-btn catv-btn-upgrade focusable" title="Upgrade your package from My Vibes">
            <span style="font-size: 1.2rem;">🚀</span>
            <span>Upgrade Package</span>
          </button>
        </div>` : "";

      const simToggleHtml = `
        <div class="catv-demo-toggle-row">
          <button id="btn-catv-sim-toggle" class="btn-catv-sim-toggle focusable" title="Toggle expiry between <= 5 days and > 5 days to test the buttons">
            Demo Test: ${isExpiringSoon ? "Simulate > 5 days left" : "Simulate 4 days left"}
          </button>
        </div>`;

      return {
        icon: "catv", title: "CATV Subscription",
        body: `
          ${toastHtml}
          <div class="acc-info-card">
            <div class="acc-info-row">
              <span class="acc-info-label">VSC Number</span>
              <span class="acc-info-value acc-mono">${(hasSub && this.currentSubscription.vscNumber) || svc.catv.vscNumber}</span>
            </div>
            <div class="acc-info-row">
              <span class="acc-info-label">Package Name</span>
              <span class="acc-info-value">${catvPkgName}</span>
            </div>
            <div class="acc-info-row">
              <span class="acc-info-label">Package Price</span>
              <span class="acc-info-value">₹${catvPkgPrice}<span class="acc-price-cycle">/month</span></span>
            </div>
            ${this.expiryRowHtml(catvExpiry)}
            <div class="acc-info-row">
              <span class="acc-info-label">Status</span>
              <span class="acc-info-value">${activePill}</span>
            </div>
            ${actionsHtml}
          </div>
          ${simToggleHtml}`
      };
    }

    if (type === "broadband") {
      return {
        icon: "broadband", title: "Broadband Subscription",
        body: `
          <div class="acc-info-card">
            <div class="acc-info-row">
              <span class="acc-info-label">User ID</span>
              <span class="acc-info-value acc-mono">${svc.broadband.userId}</span>
            </div>
            ${this.expiryRowHtml(svc.broadband.expiry)}
            <div class="acc-info-row">
              <span class="acc-info-label">Status</span>
              <span class="acc-info-value">${activePill}</span>
            </div>
          </div>`
      };
    }

    if (type === "ott") {
      if (!hasSub || !pkg) return { icon: "ott", title: "OTT & ALTD Subscription", body: this.noSubscriptionHtml("OTT & ALTD") };

      const initials = (name) => name.replace(/[^A-Za-z0-9+ ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
      const ottHtml = pkg.ottApps.map((o) => `
        <div class="acc-ott-tile focusable" tabindex="0">
          <div class="acc-ott-logo" style="background:${o.color};">${initials(o.name)}</div>
          <div class="acc-ott-name">${o.name}</div>
          <div class="acc-ott-badge">${o.badge}</div>
          <div class="ott-device-plan">${this.ottDevicePlanLabel(pkg, o)}</div>
        </div>`).join("");

      let channelTotal = 0;
      const catHtml = Object.entries(pkg.categories).map(([cat, list]) => {
        channelTotal += list.length;
        return `
          <div class="acc-ch-category">${cat} <span>(${list.length})</span></div>
          <div class="acc-ch-grid">
            ${list.map((ch) => `
              <div class="acc-ch-tile focusable" tabindex="0">
                <span class="acc-ch-logo" style="color:${ch.color === "#000000" || ch.color === "#0F172A" || ch.color === "#1E293B" ? "#FFFFFF" : ch.color};">${ch.icon}</span>
                <span class="acc-ch-name">${ch.name}</span>
                <span class="acc-ch-lcn">Ch. ${ch.ch}</span>
              </div>`).join("")}
          </div>`;
      }).join("");

      return {
        icon: "ott", title: "OTT & ALTD Subscription",
        body: `
          <div class="acc-info-card acc-info-card-compact">
            <div class="acc-info-row">
              <span class="acc-info-label">Package</span>
              <span class="acc-info-value">${pkg.number}: ${pkg.name} &nbsp;${activePill}</span>
            </div>
            ${this.expiryRowHtml(this.currentSubscription.expiry || svc.ott.expiry)}
          </div>
          <h3 class="acc-section-title">OTT Apps <span>${pkg.ottApps.length} apps</span></h3>
          <div class="acc-ott-grid">${ottHtml}</div>
          <h3 class="acc-section-title">Channels <span>${pkg.channelsCount} channels • showing ${channelTotal} highlights</span></h3>
          ${catHtml}`
      };
    }

    if (type === "devices") {
      const devices = VIBE_DATA.devices;
      const rows = devices.map((d) => `
        <div class="acc-device-row">
          <div class="acc-device-icon">${this.accountIcon(d.icon)}</div>
          <div class="acc-device-info">
            <div class="acc-device-name">${d.name} ${d.current ? '<span class="acc-this-device">This device</span>' : ""}</div>
            <div class="acc-device-meta">${d.type} • ${d.lastActive}</div>
          </div>
          ${d.current ? "" : `<button class="acc-device-remove focusable" data-device-id="${d.id}">Remove</button>`}
        </div>`).join("");
      return {
        icon: "devices", title: "Manage Device",
        body: `
          <p class="acc-device-summary">${devices.length} of ${VIBE_DATA.deviceLimit} devices registered on this account</p>
          <div class="acc-device-list">${rows}</div>`
      };
    }
    if (type === "contact") {
      const c = VIBE_DATA.contactInfo || {};
      const row = (label, value, mono) => `
        <div class="acc-info-row">
          <span class="acc-info-label">${label}</span>
          <span class="acc-info-value ${mono ? "acc-mono" : ""}">${value}</span>
        </div>`;
      return {
        icon: "support", title: "Contact Us",
        body: `
          <h3 class="acc-section-title acc-contact-heading">Your Local Cable Operator</h3>
          <div class="acc-info-card">
            ${row("LCO Code", c.lcoCode, true)}
            ${row("LCO Name", c.lcoName)}
            ${row("LCO Contact No.", c.lcoPhone, true)}
          </div>
          <h3 class="acc-section-title acc-contact-heading">SITI Customer Care</h3>
          <div class="acc-info-card">
            ${row("SITI's Contact No.", c.vibePhone, true)}
            ${row("SITI's Mail ID", c.vibeEmail)}
          </div>`
      };
    }
    return { icon: "info", title: "Details", body: "" };
  }

  openAccountInfo(type) {
    const modal = document.getElementById("screen-account-info-modal");
    if (!modal) return;

    if (!this.accountInfoOpen) this.accountInfoReturnFocus = window.tvEngine.currentFocus || null;
    this.accountInfoOpen = true;
    this.accountInfoType = type;

    const { icon, title, body } = this.buildAccountInfo(type);
    document.getElementById("acc-info-icon").innerHTML = this.accountIcon(icon);
    const box = document.querySelector("#screen-account-info-modal .acc-info-box");
    if (box) box.classList.toggle("acc-info-compact", type !== "ott");
    document.getElementById("acc-info-title").textContent = title;
    const bodyEl = document.getElementById("acc-info-body");
    bodyEl.innerHTML = body;
    bodyEl.scrollTop = 0;

    bodyEl.querySelectorAll(".acc-device-remove").forEach((btn) => {
      btn.addEventListener("click", () => this.removeDevice(btn.getAttribute("data-device-id")));
    });
    const explore = document.getElementById("btn-acc-info-explore");
    if (explore) explore.addEventListener("click", () => this.openSubscriptionStore());

    // CATV Quick Recharge & Upgrade Action Buttons
    const rechargeBtn = document.getElementById("btn-catv-quick-recharge");
    if (rechargeBtn) {
      rechargeBtn.addEventListener("click", () => {
        window.tvEngine.playBeep("click");
        this.openQuickRechargeModal();
      });
    }

    const upgradeBtn = document.getElementById("btn-catv-upgrade");
    if (upgradeBtn) {
      upgradeBtn.addEventListener("click", () => {
        window.tvEngine.playBeep("click");
        this.closeAccountInfo();
        this.openSubscriptionStore({ focusUpgrade: true });
      });
    }

    const simBtn = document.getElementById("btn-catv-sim-toggle");
    if (simBtn) {
      simBtn.addEventListener("click", () => {
        window.tvEngine.playBeep("click");
        this.toggleCatvDemoExpiry();
        this.openAccountInfo("catv");
      });
    }

    modal.classList.remove("screen-hidden");
    modal.classList.add("screen-active");
    window.tvEngine.setScope("#screen-account-info-modal");
    window.tvEngine.playBeep("click");
    setTimeout(() => {
      const first = bodyEl.querySelector(".catv-action-btn") || bodyEl.querySelector(".focusable") || document.getElementById("btn-acc-info-close");
      if (first) window.tvEngine.focus(first);
    }, 60);
  }

  hideAccountInfo() {
    const modal = document.getElementById("screen-account-info-modal");
    if (modal) {
      modal.classList.add("screen-hidden");
      modal.classList.remove("screen-active");
    }
    this.accountInfoOpen = false;
  }

  closeAccountInfo() {
    if (this.quickRechargeModalOpen) {
      this.closeQuickRechargeModal();
    }
    this.hideAccountInfo();
    window.tvEngine.setScope(`#screen-${this.currentScreen}`);
    const target = (this.accountInfoReturnFocus && document.body.contains(this.accountInfoReturnFocus))
      ? this.accountInfoReturnFocus
      : document.querySelector(`#screen-${this.currentScreen} .default-focus`);
    if (target) window.tvEngine.focus(target);
  }

  toggleCatvDemoExpiry() {
    const currentIso = this.getCatvExpiry();
    const { daysLeft } = this.formatExpiry(currentIso);
    const d = new Date();
    if (daysLeft <= 5) {
      d.setDate(d.getDate() + 18);
    } else {
      d.setDate(d.getDate() + 4);
    }
    const newIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (this.currentSubscription) this.currentSubscription.expiry = newIso;
    if (VIBE_DATA.accountServices && VIBE_DATA.accountServices.catv) VIBE_DATA.accountServices.catv.expiry = newIso;
    try { localStorage.setItem("vibe_subscription", JSON.stringify(this.currentSubscription)); } catch (e) {}
  }

  openQuickRechargeModal() {
    this.quickRechargeModalOpen = true;
    const modal = document.getElementById("screen-quick-recharge-modal");
    if (!modal) return;

    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const pkg = (hasSub && VIBE_DATA.packages.find(p => p.id === (this.currentSubscription.packageId || "pkg-2"))) || VIBE_DATA.packages[1];
    const total = pkg.price + Math.round(pkg.price * 0.18);

    const amtEl = document.getElementById("quick-recharge-amount");
    if (amtEl) amtEl.textContent = `₹${total}`;

    const pkgEl = document.getElementById("quick-recharge-pkg-name");
    if (pkgEl) pkgEl.textContent = `${pkg.number}: ${pkg.name}`;

    const qrBtn = document.getElementById("btn-quick-recharge-qr");
    if (qrBtn) qrBtn.classList.remove("pay-qr-paid");

    const svg = document.getElementById("quick-recharge-qr-svg");
    if (svg) this.drawDemoQR(svg, `QUICK-RECHARGE-${pkg.id}-${total}-${Date.now()}`);

    const cancelBtn = document.getElementById("btn-quick-recharge-cancel");
    if (cancelBtn) {
      cancelBtn.onclick = () => this.closeQuickRechargeModal();
    }
    if (qrBtn) {
      qrBtn.onclick = () => this.completeQuickRecharge(pkg);
    }

    modal.classList.remove("screen-hidden");
    modal.classList.add("screen-active");
    window.tvEngine.setScope("#screen-quick-recharge-modal");
    if (qrBtn) setTimeout(() => window.tvEngine.focus(qrBtn), 60);
  }

  closeQuickRechargeModal() {
    const modal = document.getElementById("screen-quick-recharge-modal");
    if (modal) {
      modal.classList.add("screen-hidden");
      modal.classList.remove("screen-active");
    }
    this.quickRechargeModalOpen = false;
    window.tvEngine.playBeep("back");
    window.tvEngine.setScope("#screen-account-info-modal");
    const rechargeBtn = document.getElementById("btn-catv-quick-recharge") || document.getElementById("btn-acc-info-close");
    if (rechargeBtn) setTimeout(() => window.tvEngine.focus(rechargeBtn), 60);
  }

  completeQuickRecharge(pkg) {
    const qrBtn = document.getElementById("btn-quick-recharge-qr");
    if (qrBtn) qrBtn.classList.add("pay-qr-paid");
    window.tvEngine.playBeep("click");

    const currentIso = this.getCatvExpiry();
    const [y, m, d] = currentIso.split("-").map(Number);
    const currDate = new Date(y, m - 1, d, 23, 59, 59);
    const baseDate = currDate > new Date() ? currDate : new Date();
    const newDate = new Date(baseDate.getTime() + 30 * 86400000);
    const newIso = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;

    if (this.currentSubscription) {
      this.currentSubscription.expiry = newIso;
    }
    if (VIBE_DATA.accountServices && VIBE_DATA.accountServices.catv) {
      VIBE_DATA.accountServices.catv.expiry = newIso;
    }
    try { localStorage.setItem("vibe_subscription", JSON.stringify(this.currentSubscription)); } catch (e) {}

    setTimeout(() => {
      const modal = document.getElementById("screen-quick-recharge-modal");
      if (modal) {
        modal.classList.add("screen-hidden");
        modal.classList.remove("screen-active");
      }
      this.quickRechargeModalOpen = false;
      const formatted = this.formatExpiry(newIso);
      this.catvRechargeSuccessMsg = `Quick Recharge Successful! Renewed ${pkg.name} for 30 days (Valid until ${formatted.text}).`;
      this.openAccountInfo("catv");
      this.renderAccountProfilePage();
    }, 1100);
  }

  removeDevice(deviceId) {
    const idx = VIBE_DATA.devices.findIndex((d) => d.id === deviceId && !d.current);
    if (idx === -1) return;
    VIBE_DATA.devices.splice(idx, 1);
    this.updateDeviceStatus();
    this.openAccountInfo("devices"); // re-render list, focus moves to next item
  }

  updateDeviceStatus() {
    const el = document.getElementById("account-device-status");
    if (el) el.textContent = `${VIBE_DATA.devices.length} of ${VIBE_DATA.deviceLimit} devices registered`;
  }

  logout() {
    this.newAccountProfiles = [];
    this.accountType = "demo";
    this.accountMobile = this.DEMO_MOBILE;
    this.applyAccount();
    this.writeLoginState(false);
    this.applyGuestState();
    this.showScreen("home", ".btn-watch-now");
  }

  /* ----------------------------------------------------------
   * SCREEN MANAGEMENT & BACK NAVIGATION
   * ---------------------------------------------------------- */
  showScreen(screenId, focusSelector = null) {
    // Navigating anywhere (e.g. HOME / LIVE TV remote keys) dismisses the login popup
    if (this.loginModalOpen) this.hideLoginModal();
    if (this.accountInfoOpen) this.hideAccountInfo();
    if (this.remoteTutorialOpen && window.remoteTutorial) window.remoteTutorial.close({ silent: true });

    const screens = [
      "splash",
      "profile",
      "create-profile",
      "landing",
      "home",
      "epg",
      "search",
      "player-modal",
      "exit-modal",
      "subscription",
      "payment",
      "plan-benefits",
      "help-modal",
      "profile-account",
      "set-preferences-modal"
    ];

    screens.forEach((id) => {
      const el = document.getElementById(`screen-${id}`);
      if (el) {
        if (id === screenId) {
          el.classList.remove("screen-hidden");
          el.classList.add("screen-active");
        } else {
          el.classList.add("screen-hidden");
          el.classList.remove("screen-active");
        }
      }
    });

    this.currentScreen = screenId;
    // Live on Vibe: refresh the guide times / LIVE programmes each time it opens
    if (screenId === "epg") this.renderEPG();

    // Search always opens with the keyboard closed (no slide animation on entry)
    if (screenId === "search") {
      const scr = document.getElementById("screen-search");
      if (scr) {
        scr.classList.add("kb-instant");
        this.setSearchKeyboard(false);
        requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.remove("kb-instant")));
      }
    }

    // Home shows its normal content unless Vibe OTT was asked for (openVibeOtt / closePlayer)
    if (screenId === "home") {
      this.setHomeView(this.nextHomeView || "home");
      this.nextHomeView = null;
    }
    window.tvEngine.setScope(`#screen-${screenId}`);

    // Leaving the landing channel early (OK / Back / Home key) cancels its countdown
    if (screenId !== "landing") this.stopLandingTimer();

    // Manage focus placement
    setTimeout(() => {
      if (this.loginModalOpen || this.remoteTutorialOpen || this.diwaliAdOpen) return; // popup opened on top — it owns focus
      let target = null;
      if (focusSelector) {
        // A selector, or a specific element (used when returning to where the user was)
        target = typeof focusSelector === "string" ? document.querySelector(focusSelector) : focusSelector;
        if (target && (!document.body.contains(target) || target.closest(".screen-hidden, [hidden]"))) target = null;
      }
      if (!target) {
        // Top-left Back buttons never take the initial focus
        target = (document.querySelector(`#screen-${screenId} .default-focus`) || document.querySelector(`#screen-${screenId} .focusable:not(.screen-back-btn)`));
      }
      if (target) {
        window.tvEngine.focus(target);
      }
    }, 120);

    // Hero carousel & dynamic preview management
    if (screenId === "home" && !this.loginModalOpen) {
      const isOtt = this.homeView === "ott";
      const heroBanner = isOtt ? document.getElementById("vott-hero") : document.querySelector("#home-main .hero-banner-section");
      const dynPreview = document.getElementById(isOtt ? "vott-dynamic-preview" : "home-dynamic-preview");
      const previewBar = document.getElementById(isOtt ? "vott-sticky-preview-bar" : "home-sticky-preview-bar");
      if (heroBanner && (!focusSelector || typeof focusSelector !== "string" || !focusSelector.includes("media-card"))) {
        heroBanner.classList.remove("hero-banner-collapsed");
        if (dynPreview) dynPreview.hidden = true;
        if (previewBar) previewBar.hidden = true;
      }
      this.startHeroCarousel();
    } else {
      this.stopHeroCarousel();
    }
  }

  handleBackKey() {
    if (this.currentScreen === "splash") {
      this.finishStartupAnimation();
      return;
    }

    if (this.remoteTutorialOpen && window.remoteTutorial) {
      window.remoteTutorial.back();
      return;
    }

    if (this.diwaliAdOpen) {
      this.closeDiwaliAd();
      return;
    }

    if (this.channelLockModalOpen || this.currentScreen === "channel-lock-modal") {
      this.closeChannelLockModal();
      return;
    }

    if (this.quickRechargeModalOpen) {
      this.closeQuickRechargeModal();
      return;
    }

    if (this.accountInfoOpen) {
      this.closeAccountInfo();
      return;
    }

    if (this.loginModalOpen) {
      this.handleLoginBack();
      return;
    }

    if (this.currentScreen === "landing") {
      this.finishLandingChannel();
      return;
    }

    if (this.currentScreen === "create-profile") {
      this.cpBack();
      return;
    }

    if (this.currentScreen === "payment") {
      this.handlePaymentBack();
      return;
    }

    if (this.currentScreen === "player-modal") {
      if (this.playerOverlay) this.closePlayerOverlay();
      else if (this.playerLiveCh && this.playerControlsVisible) this.hidePlayerControls();
      else this.closePlayer();
      return;
    }

    if (this.currentScreen === "exit-modal") {
      this.closeExitModal();
      return;
    }

    if (this.currentScreen === "set-preferences-modal") {
      this.closePreferencePickerModal();
      return;
    }

    if (this.currentScreen === "plan-benefits") {
      if (this.benefitsSourceScreen === "profile-account") {
        this.showScreen("profile-account", ".account-subs-tab.subs-catv");
      } else {
        this.showScreen("subscription", "#btn-view-all-benefits");
      }
      return;
    }

    if (this.currentScreen === "subscription") {
      const rp = this.storeReturnPoint;
      this.storeReturnPoint = null;
      if (rp && rp.screen && rp.screen !== "subscription") {
        if (rp.screen === "profile-account") {
          this.showScreen("profile-account", ".account-subs-tab.subs-catv");
          return;
        }
        if (rp.screen === "epg") {
          this.showScreen("epg", rp.focus || ".epg-channel-row");
          return;
        }
        if (rp.screen === "search") {
          this.showScreen("search", rp.focus || "#search-input-box");
          return;
        }
        if (rp.screen === "home" && rp.homeView === "ott") {
          if (rp.ottPageId !== this.ottPageId) {
            this.ottPageId = rp.ottPageId;
            this.renderOttPage();
          }
          this.nextHomeView = "ott";
          this.showScreen("home", rp.focus || "#vott-watch-now");
          return;
        }
      }
      // Opened from Vibe OTT (locked app / content) → back to Vibe OTT
      if (this.storeFromOtt) {
        this.storeFromOtt = false;
        this.pendingContent = null;
        this.pendingOttApp = null;
        this.nextHomeView = "ott";
        this.showScreen("home", "#vott-watch-now");
        return;
      }
      this.showScreen("home", ".nav-item[data-target='subscription']");
      return;
    }

    if (this.currentScreen === "help-modal") {
      this.closeDialogModal();
      return;
    }

    if (this.currentScreen === "profile-account") {
      this.goBackToReturnPoint();
      return;
    }

    if (this.currentScreen === "epg") {
      if (this.isLiveTvTrayMinimized) {
        this.expandLiveTvTray();
        const genreFocus = document.querySelector(".epg-col-genres .epg-tray-item");
        if (genreFocus) window.tvEngine.focus(genreFocus);
        return;
      }
      this.goBackToReturnPoint();
      return;
    }

    if (this.currentScreen === "search") {
      this.goBackToReturnPoint();
      return;
    }

    // Back on an OTT app page → main Vibe OTT page; Back on Vibe OTT → Home
    if (this.currentScreen === "home" && this.homeView === "ott") {
      if (this.ottPageId) {
        this.closeOttApp();
        return;
      }
      // Home, on the banner (left bar stays closed)
      this.showScreen("home", "#home-main .btn-watch-now");
      return;
    }

    if (this.currentScreen === "home") {
      const current = window.tvEngine.currentFocus;
      if (current && !current.closest(".side-navigation")) {
        const homeNav = document.querySelector(".nav-item[data-target='home']");
        if (homeNav) {
          window.tvEngine.focus(homeNav);
          return;
        }
      }
      this.openExitModal();
      return;
    }

    if (this.currentScreen === "profile") {
      this.openExitModal();
    }
  }

  /* ----------------------------------------------------------
   * RETURN POINT for Search, Profile and Live on Vibe
   * Opening one of them remembers where the user was (Home or Vibe OTT, incl. an app's
   * page, and the card they were on before opening the left bar). Back returns there,
   * with the left bar closed.
   * ---------------------------------------------------------- */
  openWithReturn(screenId, focusSelector = null) {
    if (this.currentScreen === "home") {
      this.returnPoint = {
        screen: "home",
        homeView: this.homeView,
        ottPageId: this.ottPageId || null,
        focus: this.lastHomeContentFocus || null
      };
    } else if (this.currentScreen === "epg" && screenId !== "epg") {
      const f = window.tvEngine.currentFocus;
      this.returnPoint = { screen: "epg", focus: f && f.closest("#screen-epg") ? f : null };
    } else if (!["search", "profile-account", "epg"].includes(this.currentScreen)) {
      this.returnPoint = null; // e.g. Profile opened from the payment screen → Back goes Home
    }
    this.showScreen(screenId, focusSelector);
  }

  goBackToReturnPoint() {
    const rp = this.returnPoint;
    this.returnPoint = null;
    const usable = (el) => el && document.body.contains(el) && !el.closest(".side-navigation");

    if (rp && rp.screen === "epg") {
      this.showScreen("epg", usable(rp.focus) ? rp.focus : null);
      return;
    }
    if (rp && rp.screen === "home") {
      // Back to the same view; restore an OTT app page if that's where they were
      if (rp.homeView === "ott" && rp.ottPageId !== this.ottPageId) {
        this.ottPageId = rp.ottPageId;
        this.renderOttPage();
      }
      this.nextHomeView = rp.homeView;
      const fallback = rp.homeView === "ott" ? "#vott-watch-now" : "#home-main .btn-watch-now";
      this.showScreen("home", usable(rp.focus) ? rp.focus : fallback);
      return;
    }
    // Nowhere to return to: Home, on the banner (left bar stays closed)
    this.showScreen("home", "#home-main .btn-watch-now");
  }

  openExitModal() {
    const modal = document.getElementById("screen-exit-modal");
    if (modal) {
      modal.classList.remove("screen-hidden");
      modal.classList.add("screen-active");
      window.tvEngine.setScope("#screen-exit-modal");
      const noBtn = document.getElementById("btn-exit-no");
      if (noBtn) window.tvEngine.focus(noBtn);
    }
  }

  closeExitModal() {
    const modal = document.getElementById("screen-exit-modal");
    if (modal) {
      modal.classList.add("screen-hidden");
      modal.classList.remove("screen-active");
      window.tvEngine.setScope(`#screen-${this.currentScreen}`);
      const fallback = (document.querySelector(`#screen-${this.currentScreen} .default-focus`) || document.querySelector(`#screen-${this.currentScreen} .focusable:not(.screen-back-btn)`));
      if (fallback) window.tvEngine.focus(fallback);
    }
  }

  /* ----------------------------------------------------------
   * CHANNEL LOCK MODAL (Prompt when channel is not in active pack)
   * ---------------------------------------------------------- */
  openChannelLockModal(ch) {
    const modal = document.getElementById("screen-channel-lock-modal");
    if (!modal) return;

    this.lockedChannelTarget = ch;
    this.channelLockModalOpen = true;
    this.channelLockReturnFocus = (window.tvEngine && window.tvEngine.currentFocus) || null;
    this.channelLockReturnScreen = this.currentScreen;

    const lcnEl = document.getElementById("ch-lock-lcn");
    const nameEl = document.getElementById("ch-lock-name");
    const lcnVal = ch ? (ch.lcn || ch.channelNumber || ch.ch || "") : "";
    const nameVal = ch ? (ch.name || ch.title || "Live Channel") : "Live Channel";

    if (lcnEl) lcnEl.textContent = lcnVal ? `CH ${lcnVal}` : "CH ---";
    if (nameEl) nameEl.textContent = nameVal;

    modal.classList.remove("screen-hidden");
    modal.classList.add("screen-active");

    if (window.tvEngine) {
      window.tvEngine.setScope("#screen-channel-lock-modal");
      const buyBtn = document.getElementById("btn-ch-lock-buy");
      if (buyBtn) window.tvEngine.focus(buyBtn);
    }
  }

  closeChannelLockModal() {
    const modal = document.getElementById("screen-channel-lock-modal");
    if (modal) {
      modal.classList.add("screen-hidden");
      modal.classList.remove("screen-active");
    }
    this.channelLockModalOpen = false;

    if (window.tvEngine) {
      window.tvEngine.setScope(`#screen-${this.currentScreen}`);
      const returnTarget = this.channelLockReturnFocus;
      const usable = (el) => el && document.body.contains(el);
      if (usable(returnTarget)) {
        window.tvEngine.focus(returnTarget);
      } else {
        const fallback = document.querySelector(`#screen-${this.currentScreen} .default-focus`) ||
                         document.querySelector(`#screen-${this.currentScreen} .focusable:not(.screen-back-btn)`);
        if (fallback) window.tvEngine.focus(fallback);
      }
    }
  }

  proceedFromChannelLock() {
    const ch = this.lockedChannelTarget;
    this.closeChannelLockModal();
    this.pendingContent = ch ? {
      title: ch.name || ch.title,
      subtitle: (ch.programs && ch.programs[0] && ch.programs[0].title) || "Live Broadcast",
      image: ch.liveVideoBg || ch.image,
      isLiveTV: true,
      channelNumber: ch.lcn || ch.channelNumber || ch.ch,
      isFree: false
    } : null;
    this.openSubscriptionStore({ channel: ch });
  }

  closeDialogModal() {
    const subModal = document.getElementById("screen-subscription-modal");
    const helpModal = document.getElementById("screen-help-modal");
    if (subModal) {
      subModal.classList.add("screen-hidden");
      subModal.classList.remove("screen-active");
    }
    if (helpModal) {
      helpModal.classList.add("screen-hidden");
      helpModal.classList.remove("screen-active");
    }
    // FAQ: back to where it was opened from (left bar stays closed)
    this.goBackToReturnPoint();
  }

  /* ----------------------------------------------------------
   * SCREEN 1: PROFILE SELECTION (Pure clean starting page)
   * ---------------------------------------------------------- */
  renderProfiles() {
    const container = document.getElementById("profiles-row");
    if (!container) return;

    let html = "";
    const profiles = this.getAccountProfiles();
    profiles.forEach((p, idx) => {
      const avatarSrc = p.avatarImage || (p.id === "profile-1" ? "profile%20icon/01_young_man_hoodie.png" : p.id === "profile-2" ? "profile%20icon/02_bengali_woman_saree.png" : p.id === "profile-3" ? "profile%20icon/03_smiling_child.png" : "profile%20icon/profile.png");
      html += `
        <button class="profile-circle-btn focusable ${idx === 0 ? "default-focus" : ""}" 
                data-profile-id="${p.id}"
                tabindex="0"
                aria-label="${p.name}">
          <div class="profile-outer-ring">
            <div class="profile-inner-avatar" style="${avatarSrc ? '' : `background: ${p.avatarBg};`}">
              ${avatarSrc ? `<img src="${avatarSrc}" alt="${p.name}" class="profile-avatar-img" />` : `
              <svg class="profile-avatar-svg" viewBox="0 0 100 100">
                <circle cx="35" cy="38" r="6.5" fill="#FFFFFF" />
                <circle cx="65" cy="38" r="6.5" fill="#FFFFFF" />
                <path d="M 30 58 Q 50 78 70 58" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round" />
              </svg>`}
            </div>
          </div>
          <span class="profile-label">${p.name}</span>
        </button>
      `;
    });

    if (profiles.length < this.MAX_PROFILES) html += `
      <button class="profile-circle-btn profile-add-btn focusable" 
              id="btn-add-profile"
              tabindex="0"
              aria-label="Add Profile">
        <div class="profile-outer-ring">
          <div class="profile-inner-avatar">
            <span class="profile-add-icon">+</span>
          </div>
        </div>
        <span class="profile-label">Add Profile</span>
      </button>
    `;

    container.innerHTML = html;

    container.querySelectorAll(".profile-circle-btn[data-profile-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const pId = el.getAttribute("data-profile-id");
        this.selectProfile(pId);
      });
    });

    const addBtn = document.getElementById("btn-add-profile");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openCreateProfile("picker"));
    }
  }

  selectProfile(profileId) {
    const profiles = this.getAccountProfiles();
    const selected = profiles.find((p) => p.id === profileId) || profiles[0];
    this.activeProfile = selected;

    const profileNavText = document.getElementById("nav-profile-label");
    if (profileNavText) profileNavText.textContent = selected.name;

    this.renderAccountProfilePage();

    window.tvEngine.playBeep("click");
    this.startLandingChannel();
  }

  /* ----------------------------------------------------------
   * LANDING CHANNEL: full-screen boot channel with 10s countdown → Home
   * ---------------------------------------------------------- */
  startLandingChannel(durationSec = 10) {
    this.stopLandingTimer();

    const ch = (VIBE_DATA.liveChannels && VIBE_DATA.liveChannels[0]) || null;
    if (ch) {
      const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
      set("landing-lcn", ch.channelNumber);
      set("landing-channel-name", ch.name);
      set("landing-now-playing", `${ch.nowPlaying} • ${ch.time}`);
    }

    const countEl = document.getElementById("landing-timer-count");
    const ring = document.getElementById("landing-timer-progress");
    const circumference = 2 * Math.PI * 52;
    if (ring) {
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.transition = "none";
      ring.style.strokeDashoffset = "0";
    }
    if (countEl) countEl.textContent = durationSec;

    this.showScreen("landing", "#btn-landing-skip");
    this.playLandingVideo();

    const endAt = Date.now() + durationSec * 1000;
    // Start the ring sweep on next frame so the reset above applies first
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (ring) {
        ring.style.transition = `stroke-dashoffset ${durationSec}s linear`;
        ring.style.strokeDashoffset = `${circumference}`;
      }
    }));

    this.landingInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (countEl) countEl.textContent = remaining;
      if (remaining <= 0) this.finishLandingChannel();
    }, 200);
  }

  stopLandingTimer() {
    if (this.landingInterval) {
      clearInterval(this.landingInterval);
      this.landingInterval = null;
    }
    this.stopLandingVideo();
  }

  // Landing channel video: plays with sound when the browser allows it, otherwise muted.
  // If it can't play, the landing channel keeps its normal animated background.
  playLandingVideo() {
    const video = document.getElementById("landing-video");
    const screen = document.getElementById("screen-landing");
    if (!video || !screen) return;
    const showVideo = () => { if (this.currentScreen === "landing") screen.classList.add("landing-video-on"); };
    video.onplaying = showVideo;
    video.onerror = () => screen.classList.remove("landing-video-on");
    video.muted = false;
    video.play().catch((err1) => {
      console.info("[landing] play with sound blocked:", err1 && err1.name);
      video.muted = true;
      video.play().catch((err2) => {
        console.warn("[landing] video could not play:", err2 && err2.name, err2 && err2.message);
        screen.classList.remove("landing-video-on");
      });
    });
  }

  stopLandingVideo() {
    const video = document.getElementById("landing-video");
    const screen = document.getElementById("screen-landing");
    if (video && !video.paused) video.pause();
    if (screen) screen.classList.remove("landing-video-on");
  }

  finishLandingChannel() {
    this.stopLandingTimer();
    if (this.currentScreen === "landing") {
      this.showScreen("home", ".btn-watch-now");
    }
  }

  /* ----------------------------------------------------------
   * CREATE PROFILE (first registration & Add Profile)
   * Steps: 0 Name → 1 Avatar → 2 Languages → 3 Genres
   * mode: "first" (new registration, cannot be skipped), "picker" (Who's watching? → Add),
   *       "account" (Profile page → Add Profile)
   * ---------------------------------------------------------- */
  setupCreateProfile() {
    this.CP_AVATARS = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.avatarOptions) ? VIBE_DATA.avatarOptions : [
      { id: "av-01", name: "Young Man (Hoodie)", image: "profile%20icon/01_young_man_hoodie.png", bg: "#1E293B" },
      { id: "av-02", name: "Bengali Woman (Saree)", image: "profile%20icon/02_bengali_woman_saree.png", bg: "#1E293B" },
      { id: "av-03", name: "Smiling Child", image: "profile%20icon/03_smiling_child.png", bg: "#1E293B" },
      { id: "av-04", name: "GenZ Girl (Headphones)", image: "profile%20icon/04_genz_girl_headphones.png", bg: "#1E293B" },
      { id: "av-05", name: "Elder Bengali Woman", image: "profile%20icon/05_elder_bengali_woman.png", bg: "#1E293B" },
      { id: "av-06", name: "Young Man (Glasses)", image: "profile%20icon/06_young_man_glasses.png", bg: "#1E293B" },
      { id: "av-07", name: "Schoolgirl", image: "profile%20icon/07_schoolgirl.png", bg: "#1E293B" },
      { id: "av-08", name: "Professional Man", image: "profile%20icon/08_professional_man.png", bg: "#1E293B" },
      { id: "av-09", name: "Young Woman (Ethnic)", image: "profile%20icon/09_young_woman_ethnic.png", bg: "#1E293B" },
      { id: "av-10", name: "Young Man (Cream Hoodie)", image: "profile%20icon/10_young_man_cream_hoodie.png", bg: "#1E293B" }
    ];
    this.CP_COLORS = [
      { bg: "#E51B24", accent: "#FF4D55", name: "Red" },
      { bg: "#0084FF", accent: "#38A1FF", name: "Blue" },
      { bg: "#8B5CF6", accent: "#A78BFA", name: "Purple" },
      { bg: "#10B981", accent: "#34D399", name: "Green" },
      { bg: "#F97316", accent: "#FB923C", name: "Orange" },
      { bg: "#EC4899", accent: "#F472B6", name: "Pink" },
      { bg: "#06B6D4", accent: "#22D3EE", name: "Teal" },
      { bg: "#EAB308", accent: "#FACC15", name: "Gold" }
    ];
    this.CP_LANGUAGES = ["Bengali", "Hindi", "English", "Assamese", "Odia", "Bhojpuri", "Tamil", "Telugu", "Punjabi"];
    this.CP_GENRES = ["News", "Entertainment", "Movies", "Music", "Sports", "Kids", "Web Series", "Devotional", "Infotainment"];
    this.CP_NAME_MAX = 14;

    const next = document.getElementById("cp-btn-next");
    const back = document.getElementById("cp-btn-back");
    if (next) next.addEventListener("click", () => this.cpNext());
    if (back) back.addEventListener("click", () => this.cpBack());

    // Typing on a physical keyboard while on the name step. Runs before the TV engine's
    // window listener, so letters (incl. W/A/S/D/H/R), space and Backspace type instead of navigating.
    document.addEventListener("keydown", (e) => {
      if (this.currentScreen !== "create-profile" || !this.cp || this.cp.step !== 0) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z0-9]$/.test(e.key) || e.key === " " || e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        this.cpType(e.key === " " ? "SPACE" : e.key === "Backspace" ? "DEL" : e.key);
      }
    });
  }

  openCreateProfile(mode = "first") {
    const usedAvatars = this.getAccountProfiles().map((p) => p.avatarImage);
    const avatar = this.CP_AVATARS.find((a) => !usedAvatars.includes(a.image)) || this.CP_AVATARS[0];
    const color = this.CP_COLORS[0];
    // Languages and genres start with everything selected ("All" on)
    this.cp = { mode, step: 0, name: "", avatar, color, langs: [...this.CP_LANGUAGES], genres: [...this.CP_GENRES] };

    const title = document.getElementById("cp-title");
    const sub = document.getElementById("cp-subtitle");
    if (mode === "first") {
      if (title) title.textContent = "Create your profile";
      if (sub) sub.textContent = "Welcome to SITI PlayTop Magic! Set up your profile to get started.";
    } else {
      if (title) title.textContent = "Add a new profile";
      if (sub) sub.textContent = "Each profile keeps its own languages, preferences and recommendations.";
    }

    this.showScreen("create-profile", "#cp-step-content .default-focus");
    this.renderCpStep();
  }

  renderCpStep() {
    const cp = this.cp;
    if (!cp) return;
    const steps = ["Name", "Avatar", "Languages", "Content"];
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    // Stepper
    const stepper = document.getElementById("cp-stepper");
    if (stepper) {
      stepper.innerHTML = steps.map((label, i) => `
        ${i > 0 ? '<span class="cp-step-line"></span>' : ""}
        <span class="cp-step-dot ${i === cp.step ? "is-current" : ""} ${i < cp.step ? "is-done" : ""}">
          <span class="cp-step-num">${i < cp.step ? "✓" : i + 1}</span>${label}
        </span>`).join("");
    }

    const content = document.getElementById("cp-step-content");
    const hint = document.getElementById("cp-step-hint");
    if (hint) hint.classList.remove("cp-hint-error");

    if (cp.step === 0) {
      set("cp-step-title", "What should we call this profile?");
      set("cp-step-hint", "Use the keyboard below (or type) to enter a name.");
      const rows = ["ABCDEFGHIJ", "KLMNOPQRST", "UVWXYZ0123", "456789"];
      let keys = "";
      rows.forEach((row, r) => {
        row.split("").forEach((ch, c) => {
          keys += `<button class="cp-key focusable ${r === 0 && c === 0 ? "default-focus" : ""}" data-key="${ch}">${ch}</button>`;
        });
      });
      keys += `<button class="cp-key cp-key-mid focusable" data-key="SPACE">Space</button>`;
      keys += `<button class="cp-key cp-key-mid focusable" data-key="DEL">&#9003; Del</button>`;
      content.innerHTML = `
        <div class="cp-name-field">
          <span id="cp-name-text"></span><span class="cp-name-caret"></span>
          <span id="cp-name-count" class="cp-name-count"></span>
        </div>
        <div class="cp-keyboard">${keys}</div>`;
      content.querySelectorAll(".cp-key").forEach((k) => {
        k.addEventListener("click", () => this.cpType(k.getAttribute("data-key")));
      });
    } else if (cp.step === 1) {
      set("cp-step-title", "Choose an avatar");
      set("cp-step-hint", "Select an avatar icon for your profile.");
      content.innerHTML = `<div class="cp-avatar-grid">${this.CP_AVATARS.map((a, i) => {
        const isSel = (cp.avatar && cp.avatar.id === a.id) || (!cp.avatar && i === 0);
        return `
          <button class="cp-avatar-option focusable ${isSel ? "is-selected default-focus" : ""}" data-avatar-id="${a.id}" aria-label="${a.name}">
            <span class="cp-avatar-fill">
              <img src="${a.image}" alt="${a.name}" class="cp-avatar-img" />
            </span>
          </button>`;
      }).join("")}</div>`;
      content.querySelectorAll(".cp-avatar-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          const avId = btn.getAttribute("data-avatar-id");
          cp.avatar = this.CP_AVATARS.find((a) => a.id === avId) || this.CP_AVATARS[0];
          content.querySelectorAll(".cp-avatar-option").forEach((b) => b.classList.toggle("is-selected", b === btn));
          window.tvEngine.playBeep("click");
          this.updateCpPreview();
        });
      });
    } else {
      const isLang = cp.step === 2;
      const list = isLang ? this.CP_LANGUAGES : this.CP_GENRES;
      const chosen = isLang ? cp.langs : cp.genres;
      set("cp-step-title", isLang ? "Which languages do you watch?" : "What do you like to watch?");
      set("cp-step-hint", "Select one or more. You can change these later on the Profile page.");
      // "Select All" chip first; it reads "Deselect All" once every option is selected
      // and clicking it then clears everything.
      content.innerHTML = `<div class="cp-chip-grid">
        <button class="cp-chip cp-chip-all focusable default-focus" data-val="__all__">Select All</button>
        ${list.map((v) => `<button class="cp-chip focusable" data-val="${v}">${v}</button>`).join("")}
      </div>`;
      const refreshChips = () => {
        const allOn = list.every((v) => chosen.includes(v));
        content.querySelectorAll(".cp-chip").forEach((chip) => {
          const v = chip.getAttribute("data-val");
          // Action chip: "Select All" until everything is chosen, then "Deselect All"
          if (v === "__all__") {
            chip.classList.remove("chip-active");
            chip.removeAttribute("aria-pressed");
            chip.textContent = allOn ? "Deselect All" : "Select All";
            return;
          }
          const on = chosen.includes(v);
          chip.classList.toggle("chip-active", on);
          chip.setAttribute("aria-pressed", String(on));
          chip.textContent = on ? `✓ ${v}` : v;
        });
      };
      content.querySelectorAll(".cp-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const v = chip.getAttribute("data-val");
          if (v === "__all__") {
            const allOn = list.every((x) => chosen.includes(x));
            chosen.splice(0, chosen.length, ...(allOn ? [] : list));
          } else {
            const idx = chosen.indexOf(v);
            if (idx >= 0) chosen.splice(idx, 1); else chosen.push(v);
            // keep the original order
            chosen.sort((a, b) => list.indexOf(a) - list.indexOf(b));
          }
          refreshChips();
          window.tvEngine.playBeep("click");
          this.updateCpPreview();
        });
      });
      refreshChips();
    }

    // Footer buttons
    const back = document.getElementById("cp-btn-back");
    const next = document.getElementById("cp-btn-next");
    if (back) {
      const hideBack = cp.step === 0 && cp.mode === "first";
      back.classList.toggle("cp-btn-hidden", hideBack);
      back.classList.toggle("focusable", !hideBack);
      back.innerHTML = cp.step === 0 ? "Cancel" : "&#8249; Back";
    }
    if (next) next.innerHTML = cp.step === 3 ? "Create Profile &#10003;" : "Next &#8250;";

    this.updateCpName();
    this.updateCpPreview();

    const target = content.querySelector(".default-focus") || content.querySelector(".focusable");
    if (target) setTimeout(() => window.tvEngine.focus(target), 130);
  }

  cpType(key) {
    const cp = this.cp;
    if (!cp || cp.step !== 0) return;
    if (key === "DEL") {
      cp.name = cp.name.slice(0, -1);
    } else if (cp.name.length < this.CP_NAME_MAX) {
      if (key === "SPACE") {
        if (cp.name && !cp.name.endsWith(" ")) cp.name += " ";
      } else {
        // Capitalise the first letter of each word
        const startOfWord = cp.name === "" || cp.name.endsWith(" ");
        cp.name += startOfWord ? key.toUpperCase() : key.toLowerCase();
      }
    }
    const hint = document.getElementById("cp-step-hint");
    if (hint && hint.classList.contains("cp-hint-error")) {
      hint.classList.remove("cp-hint-error");
      hint.textContent = "Use the keyboard below (or type) to enter a name.";
    }
    this.updateCpName();
    this.updateCpPreview();
  }

  updateCpName() {
    const cp = this.cp;
    const text = document.getElementById("cp-name-text");
    const count = document.getElementById("cp-name-count");
    if (text) text.innerHTML = cp.name ? cp.name.replace(/ /g, "&nbsp;") : '<span class="cp-name-placeholder">Enter profile name</span>';
    if (count) count.textContent = `${cp.name.length}/${this.CP_NAME_MAX}`;
  }

  updateCpPreview() {
    const cp = this.cp;
    if (!cp) return;
    const avatar = document.getElementById("cp-preview-avatar");
    const name = document.getElementById("cp-preview-name");
    if (avatar) {
      if (cp.avatar && cp.avatar.image) {
        avatar.innerHTML = `<img src="${cp.avatar.image}" alt="${cp.name || 'Profile'}" class="cp-preview-avatar-img" />`;
      } else if (cp.color) {
        avatar.style.background = cp.color.bg;
      }
    }
    if (name) {
      name.textContent = cp.name.trim() || "Profile name";
      name.classList.toggle("is-empty", !cp.name.trim());
    }
    const tags = (id, arr, all, allLabel) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (all.length && all.every((v) => arr.includes(v))) {
        el.innerHTML = `<span class="cp-preview-tag">${allLabel}</span>`;
      } else {
        el.innerHTML = arr.length ? arr.map((v) => `<span class="cp-preview-tag">${v}</span>`).join("") : '<span class="cp-preview-empty">Not selected yet</span>';
      }
    };
    tags("cp-preview-langs", cp.langs, this.CP_LANGUAGES, "All languages");
    tags("cp-preview-genres", cp.genres, this.CP_GENRES, "All content");
  }

  cpHintError(msg) {
    const hint = document.getElementById("cp-step-hint");
    if (!hint) return;
    hint.textContent = msg;
    hint.classList.add("cp-hint-error");
    window.tvEngine.playBeep("back");
  }

  cpNext() {
    const cp = this.cp;
    if (!cp) return;
    if (cp.step === 0) {
      const name = cp.name.trim();
      if (!name) return this.cpHintError("Please enter a name for this profile.");
      const taken = this.getAccountProfiles().some((p) => p.name.toLowerCase() === name.toLowerCase());
      if (taken) return this.cpHintError(`"${name}" already exists. Try a different name.`);
      cp.name = name;
    }
    window.tvEngine.playBeep("click");
    if (cp.step < 3) {
      cp.step += 1;
      this.renderCpStep();
    } else {
      this.finishCreateProfile();
    }
  }

  cpBack() {
    const cp = this.cp;
    if (!cp) return;
    if (cp.step > 0) {
      cp.step -= 1;
      this.renderCpStep();
      return;
    }
    if (cp.mode === "first") {
      this.cpHintError("Create a profile to start watching.");
      return;
    }
    this.cp = null;
    if (cp.mode === "picker") this.showScreen("profile", "#btn-add-profile");
    else this.showScreen("profile-account", "#account-btn-add-profile");
  }

  finishCreateProfile() {
    const cp = this.cp;
    const avatarImg = (cp.avatar && cp.avatar.image) || "profile%20icon/01_young_man_hoodie.png";
    const profile = {
      id: `profile-${Date.now()}`,
      name: cp.name,
      avatarBg: (cp.avatar && cp.avatar.bg) || (cp.color && cp.color.bg) || "#1E293B",
      avatarImage: avatarImg,
      color: (cp.color && cp.color.bg) || "#E51B24",
      accent: (cp.color && cp.color.accent) || "#FF4D55",
      preferredLanguages: [...cp.langs],
      preferredGenres: [...cp.genres]
    };
    this.getAccountProfiles().push(profile);
    if (this.accountType === "new") {
      try { localStorage.setItem("vibe_new_profiles", JSON.stringify(this.newAccountProfiles)); } catch (e) { /* session only */ }
    }
    this.cp = null;

    this.renderProfiles();
    if (cp.mode === "first") {
      this.activeProfile = profile;
      const label = document.getElementById("nav-profile-label");
      if (label) label.textContent = profile.name;
      this.renderAccountProfilePage();
      // New registration: first profile created → straight to Home,
      // then the one-time remote guide (how to use the remote / Live TV keys)
      this.showScreen("home", ".btn-watch-now");
      if (window.remoteTutorial) setTimeout(() => {
        if (this.currentScreen === "home" && !this.loginModalOpen) window.remoteTutorial.open();
      }, 700);
    } else if (cp.mode === "picker") {
      this.renderAccountProfilePage();
      this.showScreen("profile", `.profile-circle-btn[data-profile-id='${profile.id}']`);
    } else {
      this.renderAccountProfilePage();
      this.showScreen("profile-account", `.account-avatar-circle-wrap[data-profile-id='${profile.id}']`);
    }
    this.showToast(`Profile "${profile.name}" created`);
  }

  showToast(msg) {
    let toast = document.getElementById("cp-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cp-toast";
      toast.className = "cp-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ----------------------------------------------------------
   * PAYMENT PAGE: Proceed to Pay → Click to Pay → Successfully Purchased
   * The purchased plan becomes the account's active plan (shown on the Profile page)
   * and is saved in localStorage ("vibe_subscription") until Log Out.
   * ---------------------------------------------------------- */
  setupPaymentPage() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
    on("btn-pay-back", () => this.handlePaymentBack());
    on("btn-click-to-pay", () => this.clickToPay());
    on("btn-pay-qr", () => this.payByQr());
    on("btn-pay-qr-cancel", () => this.closePayQr());
    on("btn-pay-goto-profile", () => this.openProfileAfterPurchase());
    on("btn-pay-goto-home", () => this.goHomeAfterPurchase());
  }

  formatRupees(n) {
    return `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  }

  packageInitials(pkg) {
    return `P${pkg.number.replace(/\D/g, "")}`;
  }

  openPaymentPage(pkgId) {
    const pkg = VIBE_DATA.packages.find((p) => p.id === pkgId) || VIBE_DATA.packages[1];
    const gst = Math.round(pkg.price * 0.18 * 100) / 100;
    const total = Math.round((pkg.price + gst) * 100) / 100;
    this.paymentState = { pkgId: pkg.id, gst, total, status: "idle" };

    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const icon = document.getElementById("pay-pkg-icon");
    if (icon) {
      icon.textContent = this.packageInitials(pkg);
      icon.style.background = pkg.themeColor || "var(--vibe-blue)";
    }
    set("pay-pkg-number", pkg.number);
    set("pay-pkg-name", pkg.name);
    const tag = document.getElementById("pay-pkg-tag");
    if (tag) { tag.textContent = pkg.tag || ""; tag.hidden = !pkg.tag; }
    set("pay-channels", `${pkg.channelsCount} channels`);
    set("pay-otts", `${pkg.ottApps.length} apps`);
    set("pay-devices", pkg.devices);
    set("pay-price", `${this.formatRupees(pkg.price)}${pkg.period}`);
    set("pay-gst", this.formatRupees(gst));
    set("pay-total", this.formatRupees(total));
    set("pay-amount-big", this.formatRupees(total));
    set("pay-billed-to", `${this.accountMobile} • ${this.activeProfile ? this.activeProfile.name : ""}`);
    const chips = document.getElementById("pay-ott-chips");
    if (chips) chips.innerHTML = pkg.ottApps.map((o) => `<span class="pay-ott-chip" style="border-left:3px solid ${o.color};">${o.name}</span>`).join("");

    clearTimeout(this.paymentTimer);
    const qrModal = document.getElementById("pay-qr-modal");
    if (qrModal) qrModal.hidden = true;
    this.setPaymentView("checkout");
    this.showScreen("payment", "#btn-click-to-pay");
  }

  setPaymentView(view) {
    const checkout = document.getElementById("pay-view-checkout");
    const success = document.getElementById("pay-view-success");
    const idle = document.getElementById("pay-action-idle");
    const processing = document.getElementById("pay-action-processing");
    const back = document.getElementById("btn-pay-back");
    if (checkout) checkout.hidden = view === "success";
    if (success) success.hidden = view !== "success";
    if (idle) idle.hidden = view === "processing";
    if (processing) processing.hidden = view !== "processing";
    // No navigating away mid-payment
    if (back) back.classList.toggle("focusable", view !== "processing");
    document.getElementById("btn-click-to-pay")?.classList.toggle("focusable", view === "checkout");
  }

  // Click to Pay → Scan & Pay QR popup
  clickToPay() {
    const st = this.paymentState;
    if (!st || st.status !== "idle") return;
    const pkg = VIBE_DATA.packages.find((p) => p.id === st.pkgId);
    st.status = "qr";
    window.tvEngine.playBeep("click");

    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set("pay-qr-amount", this.formatRupees(st.total));
    set("pay-qr-pkg", pkg ? `${pkg.number}: ${pkg.name}` : "");
    this.drawDemoQR(document.getElementById("pay-qr-svg"), `${st.pkgId}-${st.total}-${Date.now()}`);

    const modal = document.getElementById("pay-qr-modal");
    const qr = document.getElementById("btn-pay-qr");
    if (qr) qr.classList.remove("pay-qr-paid");
    if (modal) modal.hidden = false;
    // Remote focus stays inside the popup while it is open
    window.tvEngine.setScope("#pay-qr-modal");
    if (qr) setTimeout(() => window.tvEngine.focus(qr), 60);
  }

  // Selecting the QR completes the (demo) payment → "Payment received" → success screen
  payByQr() {
    const st = this.paymentState;
    if (!st || st.status !== "qr") return;
    st.status = "processing";
    window.tvEngine.playBeep("click");
    const qr = document.getElementById("btn-pay-qr");
    if (qr) qr.classList.add("pay-qr-paid");
    clearTimeout(this.paymentTimer);
    this.paymentTimer = setTimeout(() => {
      this.hidePayQr();
      this.completePurchase();
    }, 1100);
  }

  hidePayQr() {
    const modal = document.getElementById("pay-qr-modal");
    if (modal) modal.hidden = true;
    window.tvEngine.setScope("#screen-payment");
  }

  // Back / ← Back on the popup: return to checkout
  closePayQr() {
    const st = this.paymentState;
    if (!st || st.status !== "qr") return;
    st.status = "idle";
    this.hidePayQr();
    window.tvEngine.playBeep("back");
    const btn = document.getElementById("btn-click-to-pay");
    if (btn) window.tvEngine.focus(btn);
  }

  completePurchase() {
    const st = this.paymentState;
    const pkg = VIBE_DATA.packages.find((p) => p.id === st.pkgId);
    const now = new Date();
    // 30-day validity including today (shows "30 days left")
    const expiry = new Date(now.getTime() + 29 * 86400000);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const txnId = `VIBE${now.getTime().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
    const prev = this.currentSubscription || {};

    this.currentSubscription = {
      hasSubscription: true,
      purchased: true,
      packageId: pkg.id,
      planName: `${pkg.number}: ${pkg.name}`,
      channelsCount: pkg.channelsCount,
      ottCount: pkg.ottApps.length,
      price: pkg.price,
      amountPaid: st.total,
      txnId,
      purchasedOn: now.toISOString(),
      expiry: iso(expiry),
      // A brand-new account gets its own VSC number on first purchase
      vscNumber: prev.vscNumber || (this.accountType === "new" ? `0375${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}` : "037588111111")
    };
    if (VIBE_DATA.accountServices && VIBE_DATA.accountServices.catv) {
      VIBE_DATA.accountServices.catv.expiry = iso(expiry);
      VIBE_DATA.accountServices.catv.packageName = `${pkg.number}: ${pkg.name}`;
      VIBE_DATA.accountServices.catv.packagePrice = pkg.price;
      if (this.currentSubscription.vscNumber) VIBE_DATA.accountServices.catv.vscNumber = this.currentSubscription.vscNumber;
    }
    this.selectedPackageId = pkg.id;
    try { localStorage.setItem("vibe_subscription", JSON.stringify(this.currentSubscription)); } catch (e) { /* session only */ }

    st.status = "done";
    const { text: validText } = this.formatExpiry(this.currentSubscription.expiry);
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set("pay-success-sub", `${pkg.number}: ${pkg.name} is now active on your account.`);
    set("pay-r-plan", `${pkg.number}: ${pkg.name}`);
    set("pay-r-amount", this.formatRupees(st.total));
    set("pay-r-txn", txnId);
    set("pay-r-valid", validText);

    this.renderAccountProfilePage();
    this.renderSubscriptionStore();
    this.setPaymentView("success");
    window.tvEngine.playBeep("click");
    window.tvEngine.setScope("#screen-payment");
    setTimeout(() => window.tvEngine.focus(document.getElementById("btn-pay-goto-home")), 80);

    // Auto-redirect to Home after a short countdown; the content they picked plays
    this.startPurchaseRedirect(5);
  }

  startPurchaseRedirect(seconds) {
    this.stopPurchaseRedirect();
    const note = document.getElementById("pay-redirect-note");
    const pending = this.pendingContent;
    let left = seconds;
    const label = () => {
      if (note) note.textContent = pending
        ? `Playing "${pending.title}" in ${left}s…`
        : `Taking you to Home in ${left}s…`;
    };
    label();
    this.purchaseRedirectInterval = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        this.goHomeAfterPurchase();
        return;
      }
      label();
    }, 1000);
  }

  stopPurchaseRedirect() {
    if (this.purchaseRedirectInterval) {
      clearInterval(this.purchaseRedirectInterval);
      this.purchaseRedirectInterval = null;
    }
  }

  // After a purchase: Home, then play the content that sent them to Subscription (if any)
  goHomeAfterPurchase() {
    this.stopPurchaseRedirect();
    if (this.currentScreen !== "payment") return;
    const pending = this.pendingContent;
    const pendingApp = this.pendingOttApp;
    this.pendingContent = null;
    this.pendingOttApp = null;
    this.storeFilterOtt = null;
    this.storeFromOtt = false;
    // Bought from a locked OTT partner tile → open Vibe OTT on that partner's page
    if (pendingApp) {
      this.openVibeOtt();
      const app = VIBE_DATA.vibeOtt.apps.find((a) => a.id === pendingApp);
      if (app && this.isOttInPackage(app.name)) setTimeout(() => this.openOttApp(pendingApp), 150);
      return;
    }
    this.showScreen("home", ".btn-watch-now");
    if (pending) setTimeout(() => this.openPlayer(pending), 450);
  }

  openProfileAfterPurchase() {
    this.stopPurchaseRedirect();
    this.pendingContent = null;
    this.renderAccountProfilePage();
    this.showScreen("profile-account", ".account-subs-tab.subs-catv");
  }

  handlePaymentBack() {
    const st = this.paymentState;
    if (st && st.status === "qr") {
      this.closePayQr();
      return;
    }
    if (st && st.status === "processing") return;
    if (st && st.status === "done") {
      this.goHomeAfterPurchase();
      return;
    }
    // Came from the plan benefits page → go back there
    if (this.paymentFromBenefits) {
      this.paymentFromBenefits = false;
      this.showScreen("plan-benefits", "#btn-benefits-proceed-pay");
      return;
    }
    this.showScreen("subscription", "#btn-sub-proceed-pay");
  }

  /* ----------------------------------------------------------
   * DEDICATED PROFILE ACCOUNT PAGE (1:1 Replica from media_1794044408930_35954b42.jpg)
   * Synchronized with the 3 Profiles from the Landing Screen
   * ---------------------------------------------------------- */
  renderAccountProfilePage() {
    const userNameEl = document.getElementById("account-user-name");
    const langStatusEl = document.getElementById("account-lang-status");
    const genreStatusEl = document.getElementById("account-genre-status");
    const profilesContainer = document.getElementById("account-profiles-row");
    const activePlanBtn = document.getElementById("btn-active-plan-status");
    const activePlanText = document.getElementById("active-plan-btn-text");

    this.updateSubsTabs();

    if (userNameEl) {
      const owner = this.accountType === "new" ? "SITI User" : "Avijit";
      userNameEl.textContent = `${owner} (${this.activeProfile ? this.activeProfile.name : "Profile 1"})`;
    }

    // Dynamic Active Plan vs No Active Plan Button in Profile Header
    if (activePlanBtn && activePlanText) {
      if (this.currentSubscription && this.currentSubscription.hasSubscription) {
        activePlanText.textContent = "Active Plan";
        activePlanBtn.classList.remove("no-plan");
        activePlanBtn.title = "View Active Plan Details & Channels";
      } else {
        activePlanText.textContent = "No Active Plan";
        activePlanBtn.classList.add("no-plan");
        activePlanBtn.title = "No active subscription. Click to subscribe.";
      }

      activePlanBtn.onclick = () => {
        window.tvEngine.playBeep("click");
        if (this.currentSubscription && this.currentSubscription.hasSubscription) {
          this.benefitsSourceScreen = "profile-account";
          this.openPlanBenefits(this.currentSubscription.packageId || "pkg-2");
        } else {
          this.openSubscriptionStore();
        }
      };
    }

    // Section titles name the active profile: "<name>'s Preferred Languages / Content"
    const profileName = this.activeProfile ? this.activeProfile.name : "";
    const langTitleEl = document.getElementById("account-lang-title");
    const genreTitleEl = document.getElementById("account-genre-title");
    if (langTitleEl) langTitleEl.textContent = profileName ? `${profileName}'s Preferred Languages` : "Preferred Languages";
    if (genreTitleEl) genreTitleEl.textContent = profileName ? `${profileName}'s Preferred Genre` : "Preferred Genre";

    if (langStatusEl) {
      const langs = this.activeProfile ? this.activeProfile.preferredLanguages : [];
      const allLangs = this.CP_LANGUAGES && langs && this.CP_LANGUAGES.every((l) => langs.includes(l));
      langStatusEl.textContent = allLangs ? "All languages" : (langs && langs.length > 0) ? langs.join(", ") : "You Haven't Selected a Language Yet";
    }

    if (genreStatusEl) {
      const genres = this.activeProfile ? this.activeProfile.preferredGenres : [];
      const allGenres = this.CP_GENRES && genres && this.CP_GENRES.every((g) => genres.includes(g));
      genreStatusEl.textContent = allGenres ? "All genres" : (genres && genres.length > 0) ? genres.join(", ") : "You Haven't Selected a Genre Yet";
    }

    if (profilesContainer) {
      let profilesHtml = "";
      this.getAccountProfiles().forEach((p) => {
        const isActive = this.activeProfile && this.activeProfile.id === p.id;
        const avatarSrc = p.avatarImage || (p.id === "profile-1" ? "profile%20icon/01_young_man_hoodie.png" : p.id === "profile-2" ? "profile%20icon/02_bengali_woman_saree.png" : p.id === "profile-3" ? "profile%20icon/03_smiling_child.png" : "profile%20icon/profile.png");
        profilesHtml += `
          <div class="account-avatar-circle-wrap focusable ${isActive ? 'account-avatar-active' : ''}" 
               data-profile-id="${p.id}" 
               tabindex="0"
               title="Select ${p.name}">
            <div class="account-avatar-circle" style="${avatarSrc ? '' : `background-color: ${p.color || p.avatarBg};`}">
              ${avatarSrc ? `<img src="${avatarSrc}" alt="${p.name}" class="account-avatar-img" />` : `
              <svg viewBox="0 0 100 100" style="width:58px; height:58px;">
                <circle cx="35" cy="42" r="6" fill="#FFFFFF"/>
                <circle cx="65" cy="42" r="6" fill="#FFFFFF"/>
                <path d="M 32 60 Q 50 82 68 60" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
              </svg>`}
            </div>
            <span class="account-avatar-label">${p.name}</span>
            ${isActive ? '<span class="account-active-badge">Active</span>' : ''}
          </div>
        `;
      });

      // Add Profile button matching landing page
      if (this.getAccountProfiles().length < this.MAX_PROFILES) profilesHtml += `
        <div class="account-avatar-circle-wrap focusable" id="account-btn-add-profile" tabindex="0" title="Add New Profile">
          <div class="account-avatar-circle account-avatar-add">
            <span style="font-size: 2.2rem; color: #FFFFFF; font-weight: 300; line-height: 1;">+</span>
          </div>
          <span class="account-avatar-label">Add Profile</span>
        </div>
      `;

      profilesContainer.innerHTML = profilesHtml;

      // Event listeners for switching profile on Account page
      profilesContainer.querySelectorAll(".account-avatar-circle-wrap[data-profile-id]").forEach((el) => {
        el.addEventListener("click", () => {
          const pId = el.getAttribute("data-profile-id");
          const selected = this.getAccountProfiles().find((p) => p.id === pId);
          if (selected) {
            this.activeProfile = selected;
            const profileNavText = document.getElementById("nav-profile-label");
            if (profileNavText) profileNavText.textContent = selected.name;
            window.tvEngine.playBeep("click");
            this.renderAccountProfilePage();
            // Tapping a profile switches to it and opens Home
            this.showScreen("home", ".btn-watch-now");
          }
        });
      });

      const addBtn = document.getElementById("account-btn-add-profile");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          window.tvEngine.playBeep("click");
          this.openCreateProfile("account");
        });
      }
    }
  }

  /* ----------------------------------------------------------
   * SUBSCRIPTION STORE & PACKAGE SELECTION (Reference: media_1794046816559_85d5339f.jpg)
   * ---------------------------------------------------------- */
  // opts.ott: show only the packages that include this OTT partner (requirement D4).
  // Opened without it (e.g. left bar → My Vibe) the store lists every package.
  openSubscriptionStore(opts = {}) {
    // Guests must register/login before they can see the Subscription store
    if (!this.isLoggedIn) {
      this.openLoginModal();
      return;
    }
    if (!opts.ott) this.pendingOttApp = null;
    this.storeFilterOtt = opts.ott ? this.ottDisplayName(opts.ott) : null;
    // Remember return origin before switching to subscription screen
    if (this.currentScreen !== "subscription") {
      this.storeReturnPoint = {
        screen: this.currentScreen,
        homeView: this.homeView,
        ottPageId: this.ottPageId || null,
        focus: window.tvEngine ? window.tvEngine.currentFocus : null
      };
    }
    // Back from the store returns to Vibe OTT if that's where it was opened from
    this.storeFromOtt = this.currentScreen === "home" && this.homeView === "ott";

    const list = this.storePackages();
    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const activePkgId = (this.currentSubscription && this.currentSubscription.packageId) || "pkg-2";

    if (opts.channel) {
      const targetLcn = String(opts.channel.lcn || opts.channel.channelNumber || opts.channel.ch || "").trim();
      const targetName = String(opts.channel.name || opts.channel.title || "").toLowerCase().trim();
      const matchingPkg = list.find(p => {
        if (!p.categories) return false;
        let cList = [];
        Object.values(p.categories).forEach(arr => { if (Array.isArray(arr)) cList.push(...arr); });
        return cList.some(c => (targetName ? this.sameChannelName(c.name, targetName) : String(c.ch) === targetLcn));
      });
      if (matchingPkg) {
        this.selectedPackageId = matchingPkg.id;
      } else {
        const upgradeList = list.filter(p => p.id !== activePkgId);
        this.selectedPackageId = upgradeList.length ? upgradeList[0].id : list[0].id;
      }
    } else if (opts.focusUpgrade) {
      const upgradeList = list.filter(p => p.id !== activePkgId);
      this.selectedPackageId = upgradeList.length ? upgradeList[0].id : list[0].id;
    } else if (!list.some((p) => p.id === this.selectedPackageId)) {
      this.selectedPackageId = list[0].id;
    }

    this.renderSubscriptionStore();
    this.updatePackageSummary(this.selectedPackageId);

    const targetFocus = (opts.channel || opts.focusUpgrade)
      ? `.package-card[data-package-id='${this.selectedPackageId}']`
      : (hasSub && this.selectedPackageId === activePkgId
          ? ".my-vibe-active-card"
          : `.package-card[data-package-id='${this.selectedPackageId}']`);

    this.showScreen("subscription", targetFocus);
  }

  // Packages shown in the store: all, or only those including the requested OTT partner
  storePackages() {
    if (!this.storeFilterOtt) return VIBE_DATA.packages;
    const list = VIBE_DATA.packages.filter((p) => p.ottApps.some((o) => this.ottMatches(o.name, this.storeFilterOtt)));
    return list.length ? list : VIBE_DATA.packages;
  }

  clearStoreFilter() {
    this.storeFilterOtt = null;
    this.pendingOttApp = null;
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.renderSubscriptionStore();
    const card = document.querySelector(`.package-card[data-package-id='${this.selectedPackageId}']`) || document.querySelector(".my-vibe-active-card");
    if (card) window.tvEngine.focus(card);
  }

  renderSubscriptionStore() {
    const container = document.getElementById("sub-packages-content") || document.getElementById("sub-packages-column");
    if (!container) return;

    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const activePkgId = (this.currentSubscription && this.currentSubscription.packageId) || "pkg-2";
    const activePkg = VIBE_DATA.packages.find(p => p.id === activePkgId) || VIBE_DATA.packages[1];
    const packages = this.storePackages();

    // "Packages that include …" note above the grid when the store is filtered
    let filterNoteHtml = "";
    if (this.storeFilterOtt) {
      const filtered = !!this.storeFilterOtt;
      const matched = filtered && packages.length < VIBE_DATA.packages.length;
      const filterMsg = matched
        ? `Showing the ${packages.length} package${packages.length === 1 ? "" : "s"} that include <b>${this.storeFilterOtt}</b>`
        : VIBE_DATA.packages.some((p) => p.ottApps.some((o) => this.ottMatches(o.name, this.storeFilterOtt)))
          ? `Every package includes <b>${this.storeFilterOtt}</b>`
          : `No package includes <b>${this.storeFilterOtt}</b> yet. Showing all packages.`;

      filterNoteHtml = `
        <div id="sub-filter-note" class="sub-filter-note">
          <span id="sub-filter-note-text">${filterMsg}</span>
          <button id="btn-sub-show-all" class="sub-filter-show-all focusable">Show all packages</button>
        </div>`;
    }

    if (!hasSub) {
      // CUSTOMER HAS NO PACKAGE: REMAIN THE SAME (Reference Image 3)
      let cardsHtml = "";
      packages.forEach((pkg, idx) => {
        const isSelected = pkg.id === this.selectedPackageId;
        const isDefault = idx === 0;

        cardsHtml += `
          <div class="package-card focusable ${isSelected ? 'package-selected' : ''} ${isDefault ? 'default-focus' : ''}" 
               data-package-id="${pkg.id}" 
               tabindex="0"
               role="button"
               aria-label="${pkg.number}: ${pkg.name}">
            <div class="package-card-header">
              <span class="package-number-label">${pkg.number}</span>
              <span class="package-badge-tag">${pkg.tag}</span>
            </div>
            <div class="package-title-text">${pkg.name}</div>
            <div class="package-meta-row">
              <span class="package-price-text">₹${pkg.price}<span class="package-price-cycle">${pkg.period}</span></span>
              <span class="package-channels-badge">${pkg.channelsCount} Channels</span>
            </div>
            <div class="package-ott-strip">
              ${pkg.ottApps.slice(0, 3).map(o => `<span class="package-ott-pill">${o.name}</span>`).join("")}
              ${pkg.ottApps.length > 3 ? `<span class="package-ott-pill">+${pkg.ottApps.length - 3} OTT</span>` : ''}
            </div>
          </div>`;
      });

      container.innerHTML = `
        <div class="sub-packages-heading">
          <h2 class="sub-heading-text">Select your package for channels & OTTs</h2>
          <p class="sub-heading-sub">Choose from 8 curated packs with high-definition channels and bundled OTT apps</p>
          ${filterNoteHtml}
        </div>
        <div id="sub-packages-grid" class="sub-packages-grid">
          ${cardsHtml}
        </div>`;
    } else {
      // CUSTOMER HAS A PURCHASED PACKAGE: SHOW ACTIVE PACKAGE DETAILS AT TOP, THEN UPGRADE YOUR PACKAGE WITH THE REST OF THE PACKAGES
      const activeExpiryIso = this.getCatvExpiry();
      const { text: activeExpText, daysLeft: activeDaysLeft } = this.formatExpiry(activeExpiryIso);
      const activeVsc = (this.currentSubscription && this.currentSubscription.vscNumber) || VIBE_DATA.accountServices.catv.vscNumber;
      const isSelectedActive = this.selectedPackageId === activePkg.id;

      const activeCardHtml = `
        <div class="my-vibe-active-section">
          <div class="sub-packages-heading">
            <div class="sub-active-tag-badge">
              <span class="active-pulse-dot"></span> CURRENT SUBSCRIPTION
            </div>
            <h2 class="sub-heading-text">Your Subscribed Package</h2>
            <p class="sub-heading-sub">Active plan running on your SITI PlayTop STB &amp; registered devices</p>
          </div>
          
          <div class="my-vibe-active-card focusable ${isSelectedActive ? 'active-card-selected' : ''}" 
               data-package-id="${activePkg.id}" 
               tabindex="0"
               role="button"
               aria-label="Active plan ${activePkg.number}: ${activePkg.name}">
            <div class="active-card-header">
              <div class="active-card-title-group">
                <span class="active-card-pkg-number">${activePkg.number}</span>
                <h3 class="active-card-pkg-title">${activePkg.name}</h3>
              </div>
              <div class="active-card-status-pill">
                <span class="active-pulse-dot"></span> Active Plan
              </div>
            </div>

            <div class="active-card-meta-grid">
              <div class="active-meta-item">
                <span class="active-meta-label">Monthly Price</span>
                <span class="active-meta-val">₹${activePkg.price}<span class="active-cycle">/month</span></span>
              </div>
              <div class="active-meta-item">
                <span class="active-meta-label">TV Channels</span>
                <span class="active-meta-val">${activePkg.channelsCount} HD &amp; SD Channels</span>
              </div>
              <div class="active-meta-item">
                <span class="active-meta-label">Validity</span>
                <span class="active-meta-val">${activeExpText} <span class="active-days-chip ${activeDaysLeft <= 5 ? 'warn' : 'ok'}">${activeDaysLeft >= 0 ? activeDaysLeft + ' days left' : 'Expired'}</span></span>
              </div>
              <div class="active-meta-item">
                <span class="active-meta-label">VSC Number</span>
                <span class="active-meta-val acc-mono">${activeVsc}</span>
              </div>
            </div>

            <div class="active-card-ott-section">
              <span class="active-ott-title">Bundled OTT Apps (${activePkg.ottApps.length})</span>
              <div class="active-ott-badges">
                ${activePkg.ottApps.map(o => `
                  <div class="active-ott-badge" style="border-left: 3px solid ${o.color};">
                    <span>${o.name}</span>
                    <span class="active-ott-check">✓ Active</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>`;

      // The rest of the packages for upgrade
      const otherPackages = packages.filter(p => p.id !== activePkg.id);
      let upgradeCardsHtml = "";
      otherPackages.forEach((pkg, idx) => {
        const isSelected = pkg.id === this.selectedPackageId;
        const isDefault = idx === 0 && !isSelectedActive;

        upgradeCardsHtml += `
          <div class="package-card focusable ${isSelected ? 'package-selected' : ''} ${isDefault ? 'default-focus' : ''}" 
               data-package-id="${pkg.id}" 
               tabindex="0"
               role="button"
               aria-label="${pkg.number}: ${pkg.name}">
            <div class="package-card-header">
              <span class="package-number-label">${pkg.number}</span>
              <span class="package-upgrade-tag">Upgrade Option</span>
            </div>
            <div class="package-title-text">${pkg.name}</div>
            <div class="package-meta-row">
              <span class="package-price-text">₹${pkg.price}<span class="package-price-cycle">${pkg.period}</span></span>
              <span class="package-channels-badge">${pkg.channelsCount} Channels</span>
            </div>
            <div class="package-ott-strip">
              ${pkg.ottApps.slice(0, 3).map(o => `<span class="package-ott-pill">${o.name}</span>`).join("")}
              ${pkg.ottApps.length > 3 ? `<span class="package-ott-pill">+${pkg.ottApps.length - 3} OTT</span>` : ''}
            </div>
          </div>`;
      });

      const upgradeSectionHtml = `
        <div class="my-vibe-upgrade-section">
          <div class="sub-packages-heading" style="margin-top: 24px;">
            <div class="sub-upgrade-tag-badge">
              <span>🚀</span> AVAILABLE UPGRADES
            </div>
            <h2 class="sub-heading-text">Upgrade Your Package</h2>
            <p class="sub-heading-sub">Explore packages with more channels, sports feeds, and premium OTT apps</p>
            ${filterNoteHtml}
          </div>
          <div id="sub-packages-grid" class="sub-packages-grid">
            ${upgradeCardsHtml}
          </div>
        </div>`;

      container.innerHTML = activeCardHtml + upgradeSectionHtml;
    }

    // Attach listeners to active card if present
    const activeCard = container.querySelector(".my-vibe-active-card");
    if (activeCard) {
      const pkgId = activeCard.getAttribute("data-package-id");
      activeCard.addEventListener("click", () => this.selectPackageCard(pkgId));
      activeCard.addEventListener("focus", () => this.selectPackageCard(pkgId, false));
    }

    // Attach listeners to package cards
    container.querySelectorAll(".package-card").forEach((card) => {
      const pkgId = card.getAttribute("data-package-id");
      card.addEventListener("click", () => this.selectPackageCard(pkgId));
      card.addEventListener("focus", () => this.selectPackageCard(pkgId, false));
    });

    const showAllBtn = document.getElementById("btn-sub-show-all");
    if (showAllBtn) {
      showAllBtn.onclick = () => this.clearStoreFilter();
    }

    // Wire up Store Back Button
    const backBtn = document.getElementById("btn-sub-store-back");
    if (backBtn) {
      backBtn.onclick = () => this.handleBackKey();
    }

    // Wire up "View All Benefits" Button
    const viewBenefitsBtn = document.getElementById("btn-view-all-benefits");
    if (viewBenefitsBtn) {
      viewBenefitsBtn.onclick = () => {
        window.tvEngine.playBeep("click");
        this.benefitsSourceScreen = "subscription";
        this.openPlanBenefits(this.selectedPackageId, { showPay: this.selectedPackageId !== activePkgId });
      };
    }

    // Wire up "Proceed to Pay" / "Proceed to Upgrade" Button
    const proceedPayBtn = document.getElementById("btn-sub-proceed-pay");
    if (proceedPayBtn) {
      proceedPayBtn.onclick = () => {
        if (!this.isLoggedIn) {
          this.openLoginModal();
          return;
        }
        if (hasSub && this.selectedPackageId === activePkgId) {
          window.tvEngine.playBeep("click");
          this.openPlanBenefits(this.selectedPackageId);
          return;
        }
        window.tvEngine.playBeep("click");
        this.paymentFromBenefits = false;
        this.openPaymentPage(this.selectedPackageId);
      };
    }

    this.updatePackageSummary(this.selectedPackageId);
  }

  selectPackageCard(pkgId, playSound = true) {
    this.selectedPackageId = pkgId;
    if (playSound) window.tvEngine.playBeep("click");

    document.querySelectorAll(".package-card").forEach((c) => {
      c.classList.toggle("package-selected", c.getAttribute("data-package-id") === pkgId);
    });

    const activeCard = document.querySelector(".my-vibe-active-card");
    if (activeCard) {
      activeCard.classList.toggle("active-card-selected", activeCard.getAttribute("data-package-id") === pkgId);
    }

    this.updatePackageSummary(pkgId);
  }

  updatePackageSummary(pkgId) {
    const pkg = VIBE_DATA.packages.find(p => p.id === pkgId) || VIBE_DATA.packages[1];
    const hasSub = !!(this.currentSubscription && this.currentSubscription.hasSubscription);
    const activePkgId = (this.currentSubscription && this.currentSubscription.packageId) || "pkg-2";
    const isActivePlan = hasSub && pkg.id === activePkgId;

    const channelsEl = document.getElementById("sub-card-channels-count");
    const deviceEl = document.getElementById("sub-card-devices");
    const priceEl = document.getElementById("sub-card-price");
    const catsEl = document.getElementById("sub-summary-cats");
    const ottChipsEl = document.getElementById("sub-summary-ott-chips");
    const tagEl = document.querySelector(".sub-summary-tag");
    const proceedBtn = document.getElementById("btn-sub-proceed-pay");

    if (channelsEl) channelsEl.textContent = `${pkg.channelsCount} TV Channels`;
    if (deviceEl) deviceEl.textContent = pkg.devices;
    if (priceEl) priceEl.innerHTML = `₹${pkg.price}<span class="price-cycle">${pkg.period}</span>`;

    if (tagEl) {
      if (isActivePlan) {
        tagEl.innerHTML = `<span style="color:#10B981; font-weight:800;">● Your Active Subscription</span>`;
      } else if (hasSub) {
        tagEl.innerHTML = `<span style="color:#FFD200; font-weight:800;">🚀 Selected for Upgrade</span>`;
      } else {
        tagEl.textContent = "Based on your selection";
      }
    }

    if (catsEl) {
      const categoriesList = Object.keys(pkg.categories);
      catsEl.textContent = categoriesList.join(" • ");
    }

    if (ottChipsEl) {
      ottChipsEl.innerHTML = pkg.ottApps.map(o => `
        <div class="sub-summary-ott-chip" style="border-left: 3px solid ${o.color};">
          <span>${o.name}</span>
          <span style="font-size: 0.68rem; color: #10B981;">✓</span>
        </div>
      `).join("");
    }

    if (proceedBtn) {
      if (isActivePlan) {
        proceedBtn.innerHTML = `<span>✓ Currently Active Plan</span>`;
        proceedBtn.className = "btn-sub-proceed-pay btn-active-plan-indicator focusable";
      } else if (hasSub) {
        proceedBtn.innerHTML = `<span>Proceed to Upgrade</span> <span class="btn-arrow-icon">→</span>`;
        proceedBtn.className = "btn-sub-proceed-pay focusable";
      } else {
        proceedBtn.innerHTML = `<span>Proceed to Pay</span> <span class="btn-arrow-icon">→</span>`;
        proceedBtn.className = "btn-sub-proceed-pay focusable";
      }
    }
  }

  activateSubscription(pkgId) {
    const pkg = VIBE_DATA.packages.find(p => p.id === pkgId) || VIBE_DATA.packages[1];
    this.currentSubscription = {
      hasSubscription: true,
      packageId: pkg.id,
      planName: `${pkg.number}: ${pkg.name}`,
      channelsCount: pkg.channelsCount,
      ottCount: pkg.ottCount,
      price: pkg.price,
      validUntil: "Dec 06, 2026"
    };

    window.tvEngine.playBeep("click");
    alert(`🎉 Subscription Activated!\n\nYou have subscribed to ${pkg.number}: ${pkg.name}.\n${pkg.channelsCount} TV Channels and ${pkg.ottCount} OTT apps are now active on your VIBE PlayTop account.`);

    this.renderAccountProfilePage();
    this.benefitsSourceScreen = "subscription";
    this.openPlanBenefits(pkg.id);
  }

  /* ----------------------------------------------------------
   * SEPARATE PLAN BENEFITS & CHANNELS/OTT DETAILS SCREEN
   * 1:1 Replica of media_1794046783136_d5118588.jpg & media_1794046804012_b9bccfbd.jpg
   * ---------------------------------------------------------- */
  openPlanBenefits(pkgId, opts = {}) {
    this.benefitsCurrentPackageId = pkgId || this.selectedPackageId || "pkg-2";
    // Proceed to Pay only when browsing a package from the store (not an active plan)
    this.benefitsShowPay = !!opts.showPay;
    this.benefitsCurrentLanguage = "All";

    const pkg = VIBE_DATA.packages.find(p => p.id === this.benefitsCurrentPackageId) || VIBE_DATA.packages[1];
    const catKeys = Object.keys(pkg.categories);
    this.benefitsCurrentCategory = catKeys[0] || "Entertainment";

    this.renderPlanBenefits();
    this.showScreen("plan-benefits", ".benefits-cat-btn.benefits-cat-active");
  }

  renderPlanBenefits() {
    const pkg = VIBE_DATA.packages.find(p => p.id === this.benefitsCurrentPackageId) || VIBE_DATA.packages[1];

    const titleEl = document.getElementById("benefits-header-title");
    if (titleEl) {
      titleEl.textContent = `${pkg.channelsCount} TV Channels`;
    }

    // Bottom pay bar (store flow only)
    const payBar = document.getElementById("benefits-pay-bar");
    const payBtn = document.getElementById("btn-benefits-proceed-pay");
    if (payBar && payBtn) {
      payBar.classList.toggle("benefits-pay-hidden", !this.benefitsShowPay);
      payBtn.classList.toggle("focusable", !!this.benefitsShowPay);
      const summary = document.getElementById("benefits-pay-summary");
      if (summary) {
        summary.innerHTML = `<b>${pkg.number}: ${pkg.name}</b> · ${pkg.channelsCount} TV Channels · ${pkg.ottApps.length} OTT Apps · <b>₹${pkg.price}</b>${pkg.period}`;
      }
      payBtn.onclick = () => {
        if (!this.isLoggedIn) {
          this.openLoginModal();
          return;
        }
        window.tvEngine.playBeep("click");
        this.paymentFromBenefits = true;
        this.openPaymentPage(pkg.id);
      };
    }

    // Left Categories Sidebar: Entertainment (9), Movies (8), Sports (5), etc.
    const catListEl = document.getElementById("benefits-categories-list");
    if (catListEl) {
      let catsHtml = "";

      Object.entries(pkg.categories).forEach(([catName, chList]) => {
        const isActive = this.benefitsCurrentCategory === catName;
        catsHtml += `
          <button class="benefits-cat-btn focusable ${isActive ? 'benefits-cat-active' : ''}" 
                  data-cat="${catName}" 
                  tabindex="0">
            ${catName} (${chList.length})
          </button>
        `;
      });

      // Also append OTT Apps Category
      const isOttActive = this.benefitsCurrentCategory === "OTT Apps";
      catsHtml += `
        <button class="benefits-cat-btn focusable ${isOttActive ? 'benefits-cat-active' : ''}" 
                data-cat="OTT Apps" 
                tabindex="0">
          OTT Apps (${pkg.ottCount})
        </button>
      `;

      catListEl.innerHTML = catsHtml;

      catListEl.querySelectorAll(".benefits-cat-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.benefitsCurrentCategory = btn.getAttribute("data-cat");
          window.tvEngine.playBeep("click");
          this.renderPlanBenefits();
          window.tvEngine.focus(btn);
        });
      });
    }

    // Language Filter Chips
    const langChipsContainer = document.getElementById("benefits-lang-chips");
    if (langChipsContainer) {
      langChipsContainer.querySelectorAll(".benefits-lang-pill").forEach((pill) => {
        const pillLang = pill.getAttribute("data-lang");
        pill.classList.toggle("active", pillLang.toLowerCase() === this.benefitsCurrentLanguage.toLowerCase());
        pill.onclick = () => {
          this.benefitsCurrentLanguage = pillLang;
          window.tvEngine.playBeep("click");
          this.renderPlanBenefits();
          window.tvEngine.focus(pill);
        };
      });
    }

    // Update active category title
    const activeCatTitle = document.getElementById("benefits-active-category-title");
    let currentCount = 0;
    if (this.benefitsCurrentCategory === "OTT Apps") {
      currentCount = pkg.ottApps.length;
    } else {
      const list = pkg.categories[this.benefitsCurrentCategory] || [];
      currentCount = list.length;
    }
    if (activeCatTitle) {
      activeCatTitle.textContent = `${this.benefitsCurrentCategory} (${currentCount})`;
    }

    // Render Grid of Channel / OTT Cards
    const gridEl = document.getElementById("benefits-items-grid");
    if (!gridEl) return;

    if (this.benefitsCurrentCategory === "OTT Apps") {
      gridEl.innerHTML = pkg.ottApps.map((ott) => `
        <div class="benefits-ott-card focusable" tabindex="0">
          <div class="benefits-ott-icon" style="background-color: ${ott.color};">
            ${ott.name.substring(0, 2).toUpperCase()}
          </div>
          <div class="benefits-ott-name">${ott.name}</div>
          <div class="benefits-ott-badge">${ott.badge}</div>
          <div class="ott-device-plan">${this.ottDevicePlanLabel(pkg, ott)}</div>
        </div>
      `).join("");
    } else {
      let channels = pkg.categories[this.benefitsCurrentCategory] || [];
      if (this.benefitsCurrentLanguage && this.benefitsCurrentLanguage !== "All") {
        channels = channels.filter(c => c.lang.toLowerCase() === this.benefitsCurrentLanguage.toLowerCase());
      }

      if (channels.length === 0) {
        gridEl.innerHTML = `<div style="grid-column: 1 / -1; color: #94A3B8; font-size: 1.1rem; padding: 30px 0;">No channels in this language for ${this.benefitsCurrentCategory}. Switch language filter to 'All'.</div>`;
      } else {
        gridEl.innerHTML = channels.map((ch) => `
          <div class="benefits-channel-card focusable" tabindex="0" data-ch="${ch.ch}">
            <div class="benefits-ch-logo-box">
              <span class="benefits-ch-badge" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: ${ch.color === '#000000' ? '#FFFFFF' : ch.color};">
                ${ch.icon}
              </span>
            </div>
            <div class="benefits-ch-name" title="${ch.name}">${ch.name}</div>
            <div class="benefits-ch-lcn">Ch. ${ch.ch}</div>
          </div>
        `).join("");
      }
    }

    // Wire up Benefits Back Button
    const benefitsBackBtn = document.getElementById("btn-benefits-back");
    if (benefitsBackBtn) {
      benefitsBackBtn.onclick = () => this.handleBackKey();
    }
  }

  openPreferencePicker(type) {
    this.prefModalType = type;
    const modal = document.getElementById("screen-set-preferences-modal");
    const titleEl = document.getElementById("pref-picker-title");
    const chipsGrid = document.getElementById("pref-picker-chips-grid");
    if (!modal || !titleEl || !chipsGrid) return;

    const isLang = type === "languages";
    titleEl.textContent = isLang ? "Select Preferred Languages" : "Select Preferred Genres";
    const list = isLang
      ? (this.CP_LANGUAGES || ["Bengali", "Hindi", "English", "Assamese", "Odia", "Bhojpuri", "Tamil", "Telugu", "Punjabi"])
      : (this.CP_GENRES || ["News", "Entertainment", "Movies", "Music", "Sports", "Kids", "Web Series", "Devotional", "Infotainment"]);
    const saved = (isLang ? this.activeProfile.preferredLanguages : this.activeProfile.preferredGenres) || [];
    // Working copy; saved to the profile on "Save Preferences"
    this.prefPickerChosen = list.filter((v) => saved.includes(v));
    const chosen = this.prefPickerChosen;

    // "Select All" chip first; it reads "Deselect All" once every option is selected
    // and clicking it then clears everything.
    chipsGrid.innerHTML = `
      <button class="pref-picker-chip pref-picker-all focusable default-focus" data-val="__all__">Select All</button>
      ${list.map((v) => `<button class="pref-picker-chip focusable" data-val="${v}">${v}</button>`).join("")}`;

    const refreshChips = () => {
      const allOn = list.every((v) => chosen.includes(v));
      chipsGrid.querySelectorAll(".pref-picker-chip").forEach((chip) => {
        const v = chip.getAttribute("data-val");
        // Action chip: "Select All" until everything is chosen, then "Deselect All"
        if (v === "__all__") {
          chip.classList.remove("chip-active");
          chip.removeAttribute("aria-pressed");
          chip.textContent = allOn ? "Deselect All" : "Select All";
          return;
        }
        const on = chosen.includes(v);
        chip.classList.toggle("chip-active", on);
        chip.setAttribute("aria-pressed", String(on));
        chip.textContent = on ? `✓ ${v}` : v;
      });
    };

    chipsGrid.querySelectorAll(".pref-picker-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const v = chip.getAttribute("data-val");
        if (v === "__all__") {
          const allOn = list.every((x) => chosen.includes(x));
          chosen.splice(0, chosen.length, ...(allOn ? [] : list));
        } else {
          const idx = chosen.indexOf(v);
          if (idx >= 0) chosen.splice(idx, 1); else chosen.push(v);
          chosen.sort((a, b) => list.indexOf(a) - list.indexOf(b));
        }
        refreshChips();
        window.tvEngine.playBeep("click");
      });
    });
    refreshChips();

    this.showScreen("set-preferences-modal", ".pref-picker-chip");
  }

  closePreferencePickerModal() {
    if (this.prefPickerChosen) {
      // Real options only (the "All" chip is not saved)
      const selected = [...this.prefPickerChosen];
      if (this.prefModalType === "languages") {
        this.activeProfile.preferredLanguages = selected;
      } else {
        this.activeProfile.preferredGenres = selected;
      }
    }
    this.renderAccountProfilePage();
    this.showScreen("profile-account", "#btn-set-languages");
  }

  /* ----------------------------------------------------------
   * HOME HUB & HERO CAROUSEL
   * ---------------------------------------------------------- */
  renderHomeHub() {
    this.updateHeroSlide(0);
    this.renderFreeChannels();
    this.renderPopularChannels();
    this.renderTrendingOtt();
    this.renderRecentlyWatched();
    this.renderLiveChannelsRail();
    this.renderTrendingNow();
    this.renderBlockbusterMovies();
    this.renderPopularSeries();
    this.renderNewsChannels();
    this.renderVibeOtt();
    this.mountDiwaliBanners();
  }

  /* ----------------------------------------------------------
   * HAPPY DIWALI PROMO: full-width banner on Home + SITI OTT;
   * OK opens a centred ad player (simulated video) with a close button.
   * All visuals are inline SVG / CSS; animations run only while visible.
   * ---------------------------------------------------------- */
  diwaliSceneHtml(kind) {
    const big = kind === "ad";
    // String lights: a sagging wire with twinkling bulbs
    const n = big ? 22 : 18;
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const x = i * 10;
      const y = 10 + 30 * Math.abs(Math.sin((x / 1000) * Math.PI * 2.5));
      pts.push(`${x},${y.toFixed(1)}`);
    }
    const colors = ["#FFD54A", "#FF4FA3", "#5EEBFF", "#FF8A3D", "#B78CFF"];
    const bulbs = Array.from({ length: n }, (_, i) => {
      const x = (i + 0.5) * (1000 / n);
      const y = 10 + 30 * Math.abs(Math.sin((x / 1000) * Math.PI * 2.5)) + 9;
      const c = colors[i % colors.length];
      return `<g class="dw-bulb" style="--d:${((i * 0.37) % 2).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${c}" opacity=".28"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${c}"/></g>`;
    }).join("");
    const lights = `
      <svg class="dw-lights" viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${pts.join(" ")}" fill="none" stroke="rgba(255,220,150,.35)" stroke-width="1.5"/>
        ${bulbs}
      </svg>`;

    // Rangoli mandala
    const petals = (count, r, rx, ry, fill) => Array.from({ length: count }, (_, i) =>
      `<ellipse cx="0" cy="${-r}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${(360 / count) * i})"/>`).join("");
    const dots = (count, r, fill) => Array.from({ length: count }, (_, i) => {
      const a = (Math.PI * 2 * i) / count;
      return `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="3.2" fill="${fill}"/>`;
    }).join("");
    const rangoli = `
      <svg class="dw-rangoli" viewBox="-100 -100 200 200" aria-hidden="true">
        <circle r="96" fill="none" stroke="rgba(255,200,90,.35)" stroke-width="2" stroke-dasharray="4 6"/>
        ${petals(16, 70, 10, 22, "rgba(255,79,163,.55)")}
        ${dots(32, 88, "rgba(255,213,74,.8)")}
        ${petals(12, 46, 11, 20, "rgba(255,138,61,.7)")}
        ${petals(8, 24, 8, 14, "rgba(94,235,255,.65)")}
        <circle r="12" fill="#FFD54A"/><circle r="6" fill="#FF4FA3"/>
      </svg>`;

    // Firework bursts
    const burst = (cls, color, rays) => {
      const lines = Array.from({ length: rays }, (_, i) => {
        const a = (Math.PI * 2 * i) / rays;
        const x1 = Math.cos(a) * 14, y1 = Math.sin(a) * 14, x2 = Math.cos(a) * 48, y2 = Math.sin(a) * 48;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><circle cx="${(Math.cos(a) * 54).toFixed(1)}" cy="${(Math.sin(a) * 54).toFixed(1)}" r="2.6"/>`;
      }).join("");
      return `<svg class="dw-burst ${cls}" viewBox="-60 -60 120 120" aria-hidden="true"><g stroke="${color}" fill="${color}" stroke-width="2.4" stroke-linecap="round">${lines}</g></svg>`;
    };

    // Diya (clay lamp) with a flickering flame. Gradient ids are unique per lamp:
    // Chrome won't paint url(#id) fills whose definition sits in a hidden page.
    this.dwUid = (this.dwUid || 0);
    const diya = (cls) => {
      const u = ++this.dwUid;
      return `
      <svg class="dw-diya ${cls}" viewBox="0 0 120 110" aria-hidden="true">
        <defs>
          <radialGradient id="dwGlow${u}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD27A" stop-opacity=".9"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>
          <linearGradient id="dwFlame${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF6A00"/><stop offset=".55" stop-color="#FFC233"/><stop offset="1" stop-color="#FFF6C9"/></linearGradient>
          <linearGradient id="dwClay${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0782F"/><stop offset="1" stop-color="#8A3410"/></linearGradient>
        </defs>
        <circle class="dw-diya-glow" cx="60" cy="42" r="40" fill="url(#dwGlow${u})"/>
        <path class="dw-flame" d="M60 12 C70 28 72 40 60 52 C48 40 50 28 60 12 Z" fill="url(#dwFlame${u})"/>
        <path d="M14 60 Q60 58 106 60 Q98 96 60 98 Q22 96 14 60 Z" fill="url(#dwClay${u})"/>
        <path d="M14 60 Q60 70 106 60" fill="none" stroke="#FFC46B" stroke-width="3"/>
        <circle cx="40" cy="80" r="3" fill="#FFD54A"/><circle cx="60" cy="84" r="3" fill="#FFD54A"/><circle cx="80" cy="80" r="3" fill="#FFD54A"/>
      </svg>`;
    };

    return `
      <div class="dw-scene dw-scene-${kind}" aria-hidden="true">
        <div class="dw-bg"></div>
        <div class="dw-bokeh"></div>
        ${rangoli}
        ${burst("dw-burst-1", "#FFD54A", 18)}
        ${burst("dw-burst-2", "#FF4FA3", 16)}
        ${burst("dw-burst-3", "#5EEBFF", 14)}
        ${big ? burst("dw-burst-4", "#FF8A3D", 18) : ""}
        ${lights}
        <div class="dw-diyas">${diya("d1")}${diya("d2")}${diya("d3")}${big ? diya("d4") + diya("d5") : ""}</div>
      </div>`;
  }

  diwaliBannerHtml() {
    return `
      <div class="dw-banner focusable nav-wide" tabindex="0" role="button" aria-label="Happy Diwali. Press OK to watch">
        ${this.diwaliSceneHtml("banner")}
        <div class="dw-copy">
          <span class="dw-eyebrow">SITI PlayTop Magic wishes you</span>
          <h2 class="dw-title"><span class="dw-happy">Happy</span> <span class="dw-diwali">DIWALI</span></h2>
          <p class="dw-sub"><span class="dw-hindi">शुभ दीपावली</span> · May your home glow with light, love &amp; laughter</p>
          <span class="dw-cta"><b>▶</b> Watch the Diwali special</span>
        </div>
      </div>`;
  }

  mountDiwaliBanners(root = document) {
    const homeSlot = document.getElementById("home-diwali-slot");
    if (homeSlot && !homeSlot.firstElementChild) homeSlot.innerHTML = this.diwaliBannerHtml();
    // Run the banner animations only while a banner is on screen
    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll(".dw-banner").forEach((b) => b.classList.add("dw-live"));
      return;
    }
    if (!this.dwObserver) {
      this.dwObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle("dw-live", e.isIntersecting));
      }, { threshold: 0.05 });
    }
    root.querySelectorAll(".dw-banner").forEach((b) => this.dwObserver.observe(b));
  }

  openDiwaliAd() {
    const ad = document.getElementById("diwali-ad");
    if (!ad || this.diwaliAdOpen) return;
    const DURATION = 15;
    ad.innerHTML = `
      <div class="dw-ad-box">
        <div class="dw-ad-video">
          ${this.diwaliSceneHtml("ad")}
          <div class="dw-ad-copy">
            <span class="dw-ad-line dw-ad-l1">SITI PlayTop Magic wishes you</span>
            <h2 class="dw-title dw-ad-l2"><span class="dw-happy">Happy</span> <span class="dw-diwali">DIWALI</span></h2>
            <p class="dw-ad-line dw-ad-l3"><span class="dw-hindi">शुभ दीपावली</span></p>
            <p class="dw-ad-line dw-ad-l4">Light up the festival with 200+ channels &amp; 18 OTT apps</p>
          </div>
          <div class="dw-ad-bar">
            <span class="dw-ad-badge">Ad</span>
            <span class="dw-ad-sponsor">Sponsored · SITI PlayTop Magic</span>
            <span class="dw-ad-time" id="dw-ad-time">0:${String(DURATION).padStart(2, "0")}</span>
            <div class="dw-ad-progress"><i style="animation-duration:${DURATION}s"></i></div>
          </div>
        </div>
        <button id="dw-ad-close" class="dw-ad-close focusable" aria-label="Close ad">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
        </button>
      </div>`;
    ad.hidden = false;
    this.restartAnimation(ad, "dw-ad-open");
    this.diwaliAdOpen = true;
    this.stopHeroCarousel();

    // countdown
    let left = DURATION;
    const timeEl = ad.querySelector("#dw-ad-time");
    clearInterval(this.dwAdTimer);
    this.dwAdTimer = setInterval(() => {
      left = Math.max(0, left - 1);
      if (timeEl) timeEl.textContent = `0:${String(left).padStart(2, "0")}`;
      if (left === 0) {
        clearInterval(this.dwAdTimer);
        ad.classList.add("dw-ad-ended");
      }
    }, 1000);

    if (window.tvEngine) {
      this.dwAdPrev = { scope: window.tvEngine.activeScope, focus: window.tvEngine.currentFocus };
      window.tvEngine.setScope("#diwali-ad");
    }
    const close = ad.querySelector("#dw-ad-close");
    close.addEventListener("click", (e) => { e.stopPropagation(); this.closeDiwaliAd(); });
    ad.addEventListener("click", (e) => { if (e.target === ad) this.closeDiwaliAd(); }, { once: true });
    if (window.tvEngine) window.tvEngine.focus(close);
  }

  closeDiwaliAd() {
    const ad = document.getElementById("diwali-ad");
    if (!ad || !this.diwaliAdOpen) return;
    this.diwaliAdOpen = false;
    clearInterval(this.dwAdTimer);
    ad.classList.remove("dw-ad-open");
    ad.classList.add("dw-ad-closing");
    setTimeout(() => {
      ad.hidden = true;
      ad.classList.remove("dw-ad-closing", "dw-ad-ended");
      ad.innerHTML = "";
    }, 260);
    const prev = this.dwAdPrev;
    this.dwAdPrev = null;
    if (prev && window.tvEngine) {
      window.tvEngine.setScope(prev.scope);
      if (prev.focus && document.body.contains(prev.focus)) window.tvEngine.focus(prev.focus);
    }
    const hero = document.querySelector(this.homeView === "ott" ? "#vott-hero" : "#home-main .hero-banner-section");
    if (this.currentScreen === "home" && hero && !hero.classList.contains("hero-banner-collapsed")) this.startHeroCarousel();
  }

  /* ----------------------------------------------------------
   * VIBE OTT (left bar → Vibe OTT)
   * Lives inside #screen-home so it keeps the side nav: #vott-main is
   * swapped in place of #home-main. this.homeView is "home" or "ott".
   * ---------------------------------------------------------- */
  renderVibeOtt() {
    this.ottPageId = null;
    this.renderOttPage();
  }

  ottImg(photoId, size) {
    const dims = { hero: "w=1200", land: "w=600", port: "w=400&h=600" }[size] || "w=600";
    return `https://images.unsplash.com/${photoId}?q=80&${dims}&auto=format&fit=crop`;
  }

  /* ---------- OTT partners vs. the user's package (requirement D4) ---------- */

  // One key per OTT partner, so "Disney+ Hotstar", "JioHotstar" and "Hotstar" all match
  ottKey(name) {
    const s = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return s.includes("hotstar") ? "hotstar" : s;
  }

  // Logged in with an active package (guests are treated as "no package")
  hasOttPackage() {
    return !!(this.isLoggedIn && this.currentSubscription && this.currentSubscription.hasSubscription);
  }

  // OTT partners included in the user's package (empty when there is no package)
  packageOttKeys() {
    if (!this.hasOttPackage()) return new Set();
    const pkg = VIBE_DATA.packages.find((p) => p.id === (this.currentSubscription.packageId || "pkg-2"));
    return new Set((pkg ? pkg.ottApps : []).map((o) => this.ottKey(o.name)));
  }

  // Same OTT partner? Tolerates labels like "Hoichoi Special" or "ZEE5 Premium".
  ottMatches(a, b) {
    const ka = this.ottKey(a), kb = this.ottKey(b);
    if (!ka || !kb) return false;
    if (ka === kb) return true;
    const [short, long] = ka.length <= kb.length ? [ka, kb] : [kb, ka];
    return short.length >= 3 && long.startsWith(short);
  }

  isOttInPackage(name) {
    return [...this.packageOttKeys()].some((k) => this.ottMatches(k, name));
  }

  // The partner's proper name for an OTT label (e.g. "Hoichoi Special" → "Hoichoi")
  ottDisplayName(name) {
    const app = VIBE_DATA.vibeOtt.apps.find((a) => this.ottMatches(a.name, name));
    if (app) return app.name;
    for (const p of VIBE_DATA.packages) {
      const o = p.ottApps.find((x) => this.ottMatches(x.name, name));
      if (o) return o.name;
    }
    return name;
  }

  // All titles of one OTT partner (from data.js → ottAppContent)
  ottAppTitles(app) {
    const vott = VIBE_DATA.vibeOtt;
    const pool = VIBE_DATA.ottImagePool;
    const appIdx = vott.apps.indexOf(app);
    return (VIBE_DATA.ottAppContent[app.id] || []).map(([title, genre, kind, desc], i) => {
      const photo = pool[(appIdx * 5 + i) % pool.length];
      return {
        title, meta: genre, kind, desc, ott: app.name, appId: app.id,
        image: this.ottImg(photo, "land"),
        poster: this.ottImg(photo, "port"),
        hero: this.ottImg(photo, "hero"),
        rating: (7.4 + ((appIdx * 3 + i * 7) % 16) / 10).toFixed(1)
      };
    });
  }

  // Page model for what Vibe OTT is showing: the main page (ottPageId = null) or one app's page.
  // Rail layouts: "landscape" (16:9 cards), "portrait" (2:3 posters), "apps" (square OTT app tiles).
  getOttPage() {
    const vott = VIBE_DATA.vibeOtt;
    const app = this.ottPageId ? vott.apps.find((a) => a.id === this.ottPageId) : null;

    if (!app) {
      // Main page suggestions come from the OTT partners' own titles:
      // with a package → only the partners in it; without one → every partner.
      const hasPkg = this.hasOttPackage();
      const apps = vott.apps.filter((a) => !hasPkg || this.isOttInPackage(a.name));
      const perApp = apps.map((a) => this.ottAppTitles(a));
      // Mix partners in each row: 1st title of every app, then 2nd, …
      const mix = (lists) => {
        const out = [];
        const longest = Math.max(0, ...lists.map((l) => l.length));
        for (let i = 0; i < longest; i++) lists.forEach((l) => { if (l[i]) out.push(l[i]); });
        return out;
      };
      const all = mix(perApp);
      const slides = perApp
        .map((titles) => titles.find((t) => t.desc))
        .filter(Boolean)
        .slice(0, 6)
        .map((t) => ({ title: t.title, description: t.desc, ottPartner: `${t.ott} • ${t.meta}`, bgImage: t.hero, ott: t.ott }));

      const recentList = this.getRecentlyWatchedList();
      const ottRecents = recentList.filter((item) => !item.isLiveTV || (item.ott && item.ott !== "LIVE TV"));
      const rails = [];
      if (ottRecents.length > 0) {
        rails.push({ title: "Recently Watched", layout: "landscape", items: ottRecents });
      }
      rails.push(
        { title: hasPkg ? "Trending in Your Package" : "Trending on SITI OTT", layout: "landscape", items: mix(perApp.map((l) => l.slice(0, 2))) },
        { title: "OTT Apps", layout: "apps" },
        { title: "Top Picks for You", layout: "portrait", items: mix(perApp.map((l) => l.slice(2, 4))) },
        { title: "Popular Web Series", layout: "landscape", items: all.filter((t) => t.kind === "s").slice(0, 14) },
        { title: "Blockbuster Movies", layout: "portrait", items: all.filter((t) => t.kind === "m").slice(0, 14) }
      );

      return {
        app: null,
        slides: slides.length ? slides : vott.heroSlides,
        rails
      };
    }

    const titles = this.ottAppTitles(app);
    const movies = titles.filter((t) => t.kind === "m");
    const series = titles.filter((t) => t.kind === "s");

    const recentList = this.getRecentlyWatchedList();
    const appRecents = recentList.filter((item) => item.ott && this.ottMatches(item.ott, app.name));
    const rails = [];
    if (appRecents.length > 0) {
      rails.push({ title: `Recently Watched on ${app.name}`, layout: "landscape", items: appRecents });
    }
    rails.push(
      { title: `Trending on ${app.name}`, layout: "landscape", items: titles },
      { title: "Popular Movies", layout: "portrait", items: movies },
      { title: "Web Series", layout: "landscape", items: series },
      { title: `Most Watched on ${app.name}`, layout: "portrait", items: [...titles].reverse() },
      { title: "New Releases", layout: "landscape", items: [...titles.slice(4), ...titles.slice(0, 4)] }
    );

    return {
      app,
      slides: titles.filter((t) => t.desc).map((t) => ({
        title: t.title, description: t.desc, ottPartner: `${app.name} • ${t.meta}`, bgImage: t.hero
      })),
      rails
    };
  }

  renderOttPage() {
    const page = this.getOttPage();
    this.ottPage = page;

    // App page header (Back + badge + name); hidden on the main Vibe OTT page
    const head = document.getElementById("vott-page-head");
    if (head) head.hidden = !page.app;
    if (page.app) {
      const badge = document.getElementById("vott-page-badge");
      const title = document.getElementById("vott-page-title");
      if (badge) { badge.style.background = page.app.bg; badge.textContent = page.app.name.slice(0, 2).toUpperCase(); }
      if (title) title.textContent = page.app.name;
    }
    const squircle = document.querySelector("#vott-hero .partner-red-squircle");
    if (squircle) squircle.style.background = page.app ? page.app.bg : "";

    this.vottIndex = 0;
    this.updateVottSlide(0);

    const rails = document.getElementById("vott-rails");
    if (rails) {
      const html = page.rails.map((r) => {
        const cls = r.layout === "portrait" ? "rail-portrait" : r.layout === "apps" ? "rail-square" : "";
        const inner = r.layout === "apps" ? this.ottAppTilesHtml()
          : r.layout === "portrait" ? this.portraitCardsHtml(r.items)
          : this.landscapeCardsHtml(r.items);
        return `
          <section class="content-rail">
            <h2 class="rail-heading">${r.title}</h2>
            <div class="rail-scroll-row horizontal-rail ${cls}">${inner}</div>
          </section>`;
      });
      // Happy Diwali promo in the middle of the page (after the 2nd rail)
      const promo = `<section class="promo-rail">${this.diwaliBannerHtml()}</section>`;
      html.splice(Math.min(2, html.length), 0, promo);
      rails.innerHTML = html.join("");
      this.mountDiwaliBanners(rails);
    }

    const main = document.getElementById("vott-main");
    if (main) main.scrollTop = 0;
    const vottHero = document.getElementById("vott-hero");
    if (vottHero) vottHero.classList.remove("hero-banner-collapsed");
    const vottPreview = document.getElementById("vott-dynamic-preview");
    const vottBar = document.getElementById("vott-sticky-preview-bar");
    if (vottPreview) vottPreview.hidden = true;
    if (vottBar) vottBar.hidden = true;
  }

  // The OTT partner rail always lists every partner. Partners the user can't open yet
  // (no package, or not in their package) carry a lock badge.
  ottAppTilesHtml() {
    return VIBE_DATA.vibeOtt.apps.map((app) => {
      const locked = !this.isOttInPackage(app.name);
      return `
      <div class="media-card channel-square-card vott-app-card focusable ${locked ? "vott-app-locked" : ""}"
           tabindex="0"
           data-app-id="${app.id}"
           data-title="${app.name}"
           title="${locked ? `${app.name}: not in your package` : app.name}">
        <div class="channel-square-logo" style="background:${app.bg}; color:${app.fg};">
          <span class="channel-square-wordmark">${app.logo}</span>
          ${locked ? '<span class="vott-app-lock" aria-label="Not in your package">🔒</span>' : ""}
        </div>
      </div>`;
    }).join("");
  }

  // OTT partner tile: opens the partner's page if it is in the user's package,
  // otherwise the package store showing only the packages that include it
  handleOttAppTile(appId) {
    const app = VIBE_DATA.vibeOtt.apps.find((a) => a.id === appId);
    if (!app) return;
    if (this.isOttInPackage(app.name)) {
      this.openOttApp(appId);
      return;
    }
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.pendingContent = null;
    this.pendingOttApp = appId; // after buying, open this partner's page
    this.openSubscriptionStore({ ott: app.name });
  }

  // Landscape content cards with OTT badge + rating (same look as Home's landscape rails)
  landscapeCardsHtml(items) {
    return (items || []).map((item) => `
      <div class="media-card focusable"
           tabindex="0"
           data-title="${item.title}"
           data-subtitle="${item.meta || item.subtitle || ''}"
           data-image="${item.image}"
           data-ott="${item.ott || ''}"
           data-live="${item.isLiveTV ? 'true' : 'false'}"
           data-channel="${item.channelNumber || item.lcn || ''}">
        <div class="card-thumb-wrap">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          ${item.isLiveTV ? `
            <div class="card-badge-live">● LIVE TV</div>
            <div class="card-badge-channel">CH ${item.channelNumber || item.lcn || '101'}</div>
          ` : `
            <div class="card-ott-badge">${item.ott || "VIBE OTT"}</div>
          `}
          ${item.progress ? `
            <div class="card-progress-bar">
              <div class="card-progress-fill" style="width: ${item.progress}%"></div>
            </div>
          ` : ""}
        </div>
        <div class="card-info-pane">
          <div class="card-title-text">${item.title}</div>
          <div class="card-meta-text">
            <span>${item.meta || item.subtitle || (item.isLiveTV ? "Live Broadcast" : item.ott || "")}</span>
            ${item.rating ? `<span>★ ${item.rating}</span>` : (item.timeLeft ? `<span>${item.timeLeft}</span>` : "")}
          </div>
        </div>
      </div>
    `).join("");
  }

  // Portrait (2:3) poster cards, same look as Home's poster rails
  portraitCardsHtml(items) {
    return (items || []).map((item) => `
      <div class="media-card focusable"
           tabindex="0"
           data-title="${item.title}"
           data-subtitle="${item.meta}"
           data-image="${item.image}"
           data-ott="${item.ott}">
        <div class="card-thumb-wrap">
          <img src="${item.poster || item.image}" alt="${item.title}" loading="lazy" />
          <div class="card-ott-badge">${item.ott}</div>
        </div>
        <div class="card-info-pane">
          <div class="card-title-text">${item.title}</div>
          <div class="card-meta-text">
            <span>${item.meta}</span>
            ${item.rating ? `<span>★ ${item.rating}</span>` : ""}
          </div>
        </div>
      </div>
    `).join("");
  }

  updateVottSlide(index) {
    const slides = (this.ottPage && this.ottPage.slides) || VIBE_DATA.vibeOtt.heroSlides;
    const slide = slides[index];
    if (!slide) return;
    this.vottIndex = index;

    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    this.swapHeroSlide(document.getElementById("vott-hero-info"), document.getElementById("vott-hero-img"), slide.bgImage, () => {
      set("vott-hero-title", slide.title);
      set("vott-hero-desc", slide.description);
      set("vott-hero-partner", slide.ottPartner);
    });

    this.renderHeroDots(document.getElementById("vott-hero-dots"), slides.length, index);
  }

  // Slide dots: kept in place (so width/colour can animate between slides);
  // the active one fills up over the auto-advance time like a countdown.
  renderHeroDots(dotsEl, count, index) {
    if (!dotsEl) return;
    dotsEl.style.setProperty("--hero-interval", `${this.HERO_INTERVAL_MS / 1000}s`);
    if (dotsEl.children.length !== count) {
      dotsEl.innerHTML = Array.from({ length: count }, (_, i) =>
        `<span class="hero-dot" data-slide="${i}"></span>`).join("");
    }
    [...dotsEl.children].forEach((dot, i) => {
      dot.classList.toggle("dot-active", i === index);
      dot.classList.toggle("dot-done", i < index);
      if (i !== index) dot.classList.remove("dot-filling");
    });
    this.restartAnimation(dotsEl.children[index], "dot-filling");
  }

  // Carousel (re)started: restart the countdown fill on the visible banner's dot
  restartHeroDotFill() {
    const dots = document.querySelectorAll(".hero-carousel-dots .hero-dot.dot-active");
    dots.forEach((d) => this.restartAnimation(d, "dot-filling"));
  }

  goToVottSlide(index) {
    const total = this.ottPage.slides.length;
    this.updateVottSlide(((index % total) + total) % total);
    if (this.currentScreen === "home") this.startHeroCarousel();
  }

  // Show Home ("home") or Vibe OTT ("ott") inside #screen-home
  setHomeView(view) {
    const isOtt = view === "ott";
    const homeMain = document.getElementById("home-main");
    const vottMain = document.getElementById("vott-main");
    if (homeMain) homeMain.hidden = isOtt;
    if (vottMain) {
      if (isOtt && this.homeView !== "ott") {
        vottMain.scrollTop = 0;
        const vottHero = document.getElementById("vott-hero");
        if (vottHero) vottHero.classList.remove("hero-banner-collapsed");
        const vottPreview = document.getElementById("vott-dynamic-preview");
        const vottBar = document.getElementById("vott-sticky-preview-bar");
        if (vottPreview) vottPreview.hidden = true;
        if (vottBar) vottBar.hidden = true;
      }
      vottMain.hidden = !isOtt;
    }
    document.querySelectorAll(".nav-item").forEach((item) => {
      const target = item.getAttribute("data-target");
      if (target === "home") item.classList.toggle("active-nav", !isOtt);
      if (target === "vibe-ott") item.classList.toggle("active-nav", isOtt);
    });
    this.homeView = isOtt ? "ott" : "home";
  }

  // Left bar → Vibe OTT: always opens the main Vibe OTT page
  openVibeOtt() {
    this.ottPageId = null;
    this.renderOttPage();
    this.nextHomeView = "ott";
    this.showScreen("home", "#vott-watch-now");
  }

  // OTT app tile → that app's page (same layout, the app's own content)
  openOttApp(appId) {
    if (!VIBE_DATA.vibeOtt.apps.some((a) => a.id === appId)) return;
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.ottPageId = appId;
    this.renderOttPage();
    if (this.currentScreen === "home") this.startHeroCarousel();
    const watch = document.getElementById("vott-watch-now");
    if (watch) window.tvEngine.focus(watch);
  }

  // App page → back to the main Vibe OTT page, focused on the app's tile
  closeOttApp() {
    const appId = this.ottPageId;
    this.ottPageId = null;
    this.renderOttPage();
    if (this.currentScreen === "home") this.startHeroCarousel();
    const tile = document.querySelector(`.vott-app-card[data-app-id='${appId}']`) || document.getElementById("vott-watch-now");
    if (tile) window.tvEngine.focus(tile);
  }

  get HERO_INTERVAL_MS() { return 4000; }

  startHeroCarousel() {
    this.stopHeroCarousel();
    this.restartHeroDotFill();
    this.heroInterval = setInterval(() => {
      // Only the visible banner (Home or Vibe OTT) auto-advances
      if (this.homeView === "ott") {
        this.updateVottSlide((this.vottIndex + 1) % this.ottPage.slides.length);
        return;
      }
      this.currentHeroIndex = (this.currentHeroIndex + 1) % VIBE_DATA.heroSlides.length;
      this.updateHeroSlide(this.currentHeroIndex);
    }, this.HERO_INTERVAL_MS);
  }

  stopHeroCarousel() {
    document.querySelectorAll(".hero-carousel-dots .dot-filling").forEach((d) => d.classList.remove("dot-filling"));
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }

  updateHeroSlide(index) {
    const slide = VIBE_DATA.heroSlides[index];
    if (!slide) return;
    this.currentHeroIndex = index;

    const titleEl = document.getElementById("hero-title");
    const descEl = document.getElementById("hero-desc");
    const partnerEl = document.getElementById("hero-partner-name");
    const graphicEl = document.getElementById("hero-right-img");
    const dotsEl = document.getElementById("hero-carousel-dots");

    this.swapHeroSlide(document.querySelector("#home-main .hero-left-info"), graphicEl, slide.bgImage, () => {
      if (titleEl) titleEl.textContent = slide.title;
      if (descEl) descEl.textContent = slide.description;
      if (partnerEl) partnerEl.textContent = slide.ottPartner;
    });

    this.renderHeroDots(dotsEl, VIBE_DATA.heroSlides.length, index);
  }

  restartAnimation(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so the animation replays
    el.classList.add(cls);
  }

  // Hero banner re-expanding (focus came back up from the rails): fade the
  // backdrop and slide the details back in instead of popping them in
  replayHeroEntrance(heroBanner) {
    if (!heroBanner) return;
    this.restartAnimation(heroBanner.querySelector(".hero-bg img:not(.hero-ghost)"), "hero-img-in");
    this.restartAnimation(heroBanner.querySelector(".hero-left-info"), "hero-text-in");
  }

  // Hero slide change, same feel as the tile details header: the old text
  // fades out, the new text slides in left → right line by line, and the old
  // picture crossfades into the new one (shown only once it has loaded).
  swapHeroSlide(info, img, src, writeText) {
    const hero = (info && info.closest(".hero-banner-section")) || (img && img.closest(".hero-banner-section"));
    if (!hero) { writeText(); return; }
    const token = (hero._heroToken || 0) + 1;
    hero._heroToken = token;
    clearTimeout(hero._heroTimer);

    // Text
    if (info) {
      info.classList.remove("hero-text-in", "hero-fade-in");
      info.classList.add("hero-text-out");
      hero._heroTimer = setTimeout(() => {
        if (hero._heroToken !== token) return;
        writeText();
        info.classList.remove("hero-text-out");
        this.restartAnimation(info, "hero-text-in");
      }, 170);
    } else {
      writeText();
    }

    // Picture
    if (!img || !src) return;
    const oldSrc = img.getAttribute("src");
    if (oldSrc === src) return;
    let ghost = img.parentElement.querySelector(".hero-ghost");
    if (!ghost) {
      ghost = document.createElement("img");
      ghost.className = "hero-ghost";
      ghost.alt = "";
      ghost.setAttribute("aria-hidden", "true");
      img.insertAdjacentElement("afterend", ghost);
    }
    let revealed = false;
    const reveal = () => {
      if (revealed || hero._heroToken !== token) return;
      revealed = true;
      ghost.classList.remove("hero-ghost-hold");
      if (oldSrc) this.restartAnimation(ghost, "hero-ghost-out");
      img.classList.remove("hero-img-wait", "hero-fade-in");
      this.restartAnimation(img, "hero-img-in");
    };
    // keep the old picture on screen (as the ghost) until the new one is ready
    ghost.classList.remove("hero-ghost-out");
    if (oldSrc) {
      ghost.src = img.currentSrc || oldSrc;
      ghost.classList.add("hero-ghost-hold");
    }
    img.classList.add("hero-img-wait");
    img.onload = reveal;
    img.onerror = reveal;
    img.src = src;
    if (img.complete && img.naturalWidth) reveal();
  }

  // Manual slide change (remote Left/Right, arrows, dots). Restarts the auto-advance timer.
  goToHeroSlide(index) {
    const total = VIBE_DATA.heroSlides.length;
    this.updateHeroSlide(((index % total) + total) % total);
    if (this.currentScreen === "home") this.startHeroCarousel();
  }

  // Called by the TV engine before spatial navigation; return true to consume the key.
  // On the hero's Watch Now: Right = next slide; Left = previous slide,
  // except on the first slide where Left falls through to open the side nav.
  handleDirectionalKey(direction) {
    const focused = window.tvEngine && window.tvEngine.currentFocus;

    // Live player: ◀ ▶ change channel, ▼ On now rail, ▲ Upcoming Shows
    if (this.handlePlayerDirection(direction)) return true;

    // Search: Up from the language chips goes to the search bar (which opens the keyboard)
    if (this.currentScreen === "search" && direction === "UP" && focused &&
        focused.closest("#search-languages-container")) {
      const chips = [...document.querySelectorAll("#search-languages-container .lang-pill-btn")];
      const top = Math.min(...chips.map((c) => c.getBoundingClientRect().top));
      // only from the first row of chips (lower rows move up to the row above)
      if (Math.abs(focused.getBoundingClientRect().top - top) < 4) {
        const bar = document.getElementById("search-input-box");
        if (bar) {
          window.tvEngine.focus(bar);
          return true;
        }
      }
    }

    if (this.currentScreen !== "home" || !focused || !focused.classList.contains("btn-watch-now")) return false;
    // Vibe OTT banner: same Left/Right behaviour on its own slides
    if (focused.classList.contains("vott-watch-now")) {
      if (direction === "RIGHT" || (direction === "LEFT" && this.vottIndex > 0)) {
        this.goToVottSlide(this.vottIndex + (direction === "RIGHT" ? 1 : -1));
        window.tvEngine.playBeep && window.tvEngine.playBeep("focus");
        return true;
      }
      return false;
    }
    if (direction === "RIGHT") {
      this.goToHeroSlide(this.currentHeroIndex + 1);
      window.tvEngine.playBeep && window.tvEngine.playBeep("focus");
      return true;
    }
    if (direction === "LEFT" && this.currentHeroIndex > 0) {
      this.goToHeroSlide(this.currentHeroIndex - 1);
      window.tvEngine.playBeep && window.tvEngine.playBeep("focus");
      return true;
    }
    return false;
  }

  // Free on Vibe: free-to-air channel tiles. data-free lets guests and
  // non-subscribers play them without login or a package.
  renderFreeChannels() {
    const container = document.getElementById("rail-free-channels");
    if (!container || !VIBE_DATA.freeChannels) return;

    container.innerHTML = VIBE_DATA.freeChannels.map((ch) => `
      <div class="media-card channel-square-card focusable"
           tabindex="0"
           data-title="${ch.name}"
           data-subtitle="${ch.nowPlaying}"
           data-image=""
           data-live="true"
           data-free="true"
           data-channel="${ch.lcn}">
        <div class="channel-square-logo" style="background:${ch.bg}; color:${ch.fg};">
          <span class="channel-free-badge">FREE</span>
          <span class="channel-square-wordmark">${ch.logo}</span>
          <span class="channel-square-lcn">${ch.lcn}</span>
        </div>
      </div>
    `).join("");
  }

  // Square channel logo tiles (Popular Channels)
  renderPopularChannels() {
    const container = document.getElementById("rail-popular-channels");
    if (!container || !VIBE_DATA.popularChannels) return;

    container.innerHTML = VIBE_DATA.popularChannels.map((ch) => `
      <div class="media-card channel-square-card focusable"
           tabindex="0"
           data-title="${ch.name}"
           data-subtitle="${ch.nowPlaying}"
           data-image=""
           data-live="true"
           data-channel="${ch.lcn}">
        <div class="channel-square-logo" style="background:${ch.bg}; color:${ch.fg};">
          <span class="channel-square-wordmark">${ch.logo}</span>
          <span class="channel-square-lcn">${ch.lcn}</span>
        </div>
      </div>
    `).join("");
  }

  // Portrait poster rail (Trending on OTT)
  renderTrendingOtt() {
    const container = document.getElementById("rail-trending-ott");
    if (!container || !VIBE_DATA.trendingOtt) return;

    container.innerHTML = VIBE_DATA.trendingOtt.map((item) => `
      <div class="media-card focusable"
           tabindex="0"
           data-title="${item.title}"
           data-subtitle="${item.genre}"
           data-image="${item.image}"
           data-ott="${item.ott}">
        <div class="card-thumb-wrap">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <div class="card-ott-badge">${item.ott}</div>
        </div>
        <div class="card-info-pane">
          <div class="card-title-text">${item.title}</div>
          <div class="card-meta-text"><span>${item.genre}</span></div>
        </div>
      </div>
    `).join("");
  }

  renderRecentlyWatched() {
    const container = document.getElementById("rail-recently-watched");
    if (!container) return;
    const section = container.closest(".content-rail") || document.getElementById("section-recently-watched");
    const rawList = this.getRecentlyWatchedList();
    // User requirement: Homepage recents ONLY shows Live TV channels (no OTT items)
    const list = (rawList || []).filter(item => item && (item.isLiveTV === true || item.isLiveTV === "true" || !!item.channelNumber || !!item.lcn));

    if (!list || list.length === 0) {
      if (section) section.style.display = "none";
      container.innerHTML = "";
      return;
    }

    if (section) section.style.display = "";

    let html = "";
    list.forEach((item) => {
      html += `
        <div class="media-card focusable"
             tabindex="0"
             data-title="${item.title}"
             data-subtitle="${item.subtitle || ''}"
             data-image="${item.image}"
             data-live="true"
             data-channel="${item.channelNumber || item.lcn || ''}"
             data-ott="${item.ott || 'LIVE TV'}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="card-badge-live">● LIVE TV</div>
            <div class="card-badge-channel">CH ${item.channelNumber || item.lcn || '101'}</div>
            <div class="card-progress-bar">
              <div class="card-progress-fill" style="width: ${item.progress || 60}%"></div>
            </div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.title}</div>
            <div class="card-meta-text">
              <span>${item.subtitle || "Live Broadcast"}</span>
              <span>${item.timeLeft || "Just Watched"}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  /* ----------------------------------------------------------
   * DYNAMIC TILE PREVIEW (Amazon Prime Style)
   * Collapses hero carousel banner, shows live program or OTT details
   * ---------------------------------------------------------- */
  updateDynamicTilePreview(card, entering = false) {
    if (!card) return;
    const isOtt = !!card.closest("#vott-main");
    const prefix = isOtt ? "vott-dyn-preview-" : "dyn-preview-";
    const dynPreview = document.getElementById(isOtt ? "vott-dynamic-preview" : "home-dynamic-preview");
    if (!dynPreview) return;

    const imgEl = document.getElementById(prefix + "img");
    const badgesEl = document.getElementById(prefix + "badges");
    const titleEl = document.getElementById(prefix + "title");
    const subEl = document.getElementById(prefix + "subtitle");
    const descEl = document.getElementById(prefix + "desc");

    const rawTitle = card.getAttribute("data-title") || "";
    const rawSub = card.getAttribute("data-subtitle") || "";
    const rawImg = card.getAttribute("data-image") || "";
    const isLive = card.getAttribute("data-live") === "true";
    const chNum = card.getAttribute("data-channel") || "";
    const ott = card.getAttribute("data-ott") || "";
    const isFree = card.getAttribute("data-free") === "true";

    let bg = rawImg;
    let displayTitle = rawTitle;
    let subtitle = rawSub;
    let desc = "";
    let badgesHtml = "";

    // 0. Happy Diwali promo banner: its own festive info (not the last tile's)
    if (card.classList.contains("dw-banner")) {
      displayTitle = "Happy Diwali";
      subtitle = "शुभ दीपावली · A festive greeting from SITI PlayTop Magic";
      desc = "May your home glow with light, love & laughter. Press OK to watch the Diwali special.";
      bg = "assets/diwali_preview.svg";
      badgesHtml = `
        <span class="dyn-badge-pill dyn-badge-live">✦ FESTIVE SPECIAL</span>
        <span class="dyn-badge-pill dyn-badge-genre">Diwali 2026</span>
        <span class="dyn-badge-pill dyn-badge-hd">Ad · 0:15</span>
      `;
    } else
    // 1. OTT Partner App Card (e.g. Disney+ Hotstar, ZEE5, SonyLIV, Hoichoi)
    if (card.classList.contains("vott-app-card") || card.getAttribute("data-app-id")) {
      const appId = card.getAttribute("data-app-id");
      const app = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.vibeOtt && VIBE_DATA.vibeOtt.apps) ? VIBE_DATA.vibeOtt.apps.find(a => a.id === appId) : null;
      displayTitle = (app && app.name) || rawTitle;
      subtitle = app ? `${app.lang || "All Languages"} · Premium Streaming Partner` : "OTT Streaming Partner";
      desc = `Stream unlimited premium blockbuster movies, regional series, exclusive originals, and live sports on ${displayTitle} bundled with your SITI package.`;
      bg = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop";
      if (typeof VIBE_DATA !== "undefined" && VIBE_DATA.ottAppPages && VIBE_DATA.ottAppPages[appId] && VIBE_DATA.ottAppPages[appId][0]) {
        const firstEntry = VIBE_DATA.ottAppPages[appId][0];
        if (firstEntry && firstEntry[3]) desc = firstEntry[3];
      }
      badgesHtml = `
        <span class="dyn-badge-pill dyn-badge-ott">${displayTitle}</span>
        <span class="dyn-badge-pill dyn-badge-genre">${app ? app.lang : "Multi-Lang"}</span>
        <span class="dyn-badge-pill dyn-badge-star">★ 4.9</span>
        <span class="dyn-badge-pill dyn-badge-hd">Partner App</span>
      `;
    } else {
      // 2. Match with Live TV channels
      const guideChannels = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.liveTvGuide && VIBE_DATA.liveTvGuide.channels) ? VIBE_DATA.liveTvGuide.channels : [];
      const freeChs = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.freeChannels) ? VIBE_DATA.freeChannels : [];
      const popChs = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.popularChannels) ? VIBE_DATA.popularChannels : [];

      // Name first; a channel number only counts when the names agree, so a
      // mistyped LCN can never show a different channel (e.g. Zee Bangla → TV9)
      const pick = (list) => list.find(c => rawTitle && this.sameChannelName(c.name, rawTitle))
        || list.find(c => chNum && String(c.lcn) === String(chNum) && (!rawTitle || this.sameChannelName(c.name, rawTitle)));
      const matchedChannel = pick(guideChannels) || pick(freeChs) || pick(popChs);

      if (isLive || chNum || matchedChannel) {
        displayTitle = matchedChannel ? matchedChannel.name : rawTitle;
        const chLcn = (matchedChannel && matchedChannel.lcn) || chNum;
        const chGenre = (matchedChannel && matchedChannel.genre) || "Live TV";
        const curProg = (matchedChannel && matchedChannel.programs && matchedChannel.programs[0]) ? matchedChannel.programs[0] : null;

        subtitle = curProg ? curProg.title : (rawSub || "Live Broadcast");
        desc = (curProg && curProg.desc) ? curProg.desc : `Watch ${displayTitle} live streaming in high-definition broadcast on SITI PlayTop Magic.`;
        bg = (matchedChannel && matchedChannel.liveVideoBg) || (matchedChannel && matchedChannel.image) || rawImg || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop";

        badgesHtml = `
          <span class="dyn-badge-pill dyn-badge-live">● LIVE TV</span>
          ${chLcn ? `<span class="dyn-badge-pill dyn-badge-ch">CH ${chLcn}</span>` : ""}
          ${chGenre ? `<span class="dyn-badge-pill dyn-badge-genre">${chGenre}</span>` : ""}
          ${isFree ? `<span class="dyn-badge-pill dyn-badge-star">FREE</span>` : ""}
          <span class="dyn-badge-pill dyn-badge-hd">HD 1080p</span>
        `;
      } else {
        // 3. OTT Show / Movie / Series
        const allOtt = [
          ...((typeof VIBE_DATA !== "undefined" && VIBE_DATA.heroSlides) || []),
          ...((typeof VIBE_DATA !== "undefined" && VIBE_DATA.vibeOtt && VIBE_DATA.vibeOtt.heroSlides) || []),
          ...((typeof VIBE_DATA !== "undefined" && VIBE_DATA.popularSeries) || []),
          ...((typeof VIBE_DATA !== "undefined" && VIBE_DATA.blockbusterMovies) || []),
          ...((typeof VIBE_DATA !== "undefined" && VIBE_DATA.trendingOtt) || [])
        ];
        const matchedOtt = allOtt.find(o => o.title && o.title.toLowerCase() === rawTitle.toLowerCase());

        displayTitle = rawTitle;
        subtitle = (matchedOtt && (matchedOtt.genre || matchedOtt.subtitle)) || rawSub || (ott ? `${ott} Special` : "Featured Content");
        desc = (matchedOtt && (matchedOtt.description || matchedOtt.desc)) ? (matchedOtt.description || matchedOtt.desc) : `Experience ${displayTitle} with immersive Dolby Audio, bundled with your SITI package.`;
        bg = (matchedOtt && (matchedOtt.bgImage || matchedOtt.image)) || rawImg || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop";

        const partner = ott || (matchedOtt && (matchedOtt.ottPartner || matchedOtt.ott)) || "SITI OTT";
        badgesHtml = `
          <span class="dyn-badge-pill dyn-badge-ott">${partner}</span>
          <span class="dyn-badge-pill dyn-badge-genre">${subtitle}</span>
          <span class="dyn-badge-pill dyn-badge-star">★ 4.8</span>
          <span class="dyn-badge-pill dyn-badge-hd">4K UHD</span>
        `;
      }
    }

    const content = dynPreview.querySelector(".dyn-preview-content");
    const key = `${displayTitle}|${subtitle}|${bg}`;
    if (!entering && dynPreview._dynKey === key) return; // same tile content: nothing to animate
    dynPreview._dynKey = key;
    const token = (dynPreview._dynToken || 0) + 1;
    dynPreview._dynToken = token;
    clearTimeout(dynPreview._dynTimer);

    const writeText = () => {
      if (badgesEl) badgesEl.innerHTML = badgesHtml;
      if (titleEl) titleEl.textContent = displayTitle;
      if (subEl) subEl.textContent = subtitle;
      if (descEl) descEl.textContent = desc;
    };

    // Text: quick fade-out of the old details, then a staggered rise-in of the new ones
    const playTextIn = () => {
      if (!content) return;
      content.classList.remove("dyn-text-out");
      this.restartAnimation(content, "dyn-text-in");
    };
    if (entering || !content || !(titleEl && titleEl.textContent)) {
      writeText();
      playTextIn();
    } else {
      content.classList.remove("dyn-text-in");
      content.classList.add("dyn-text-out");
      dynPreview._dynTimer = setTimeout(() => {
        if (dynPreview._dynToken !== token) return;
        writeText();
        playTextIn();
      }, 130);
    }

    // Image: crossfade the old backdrop out while the new one fades in with a slow push-in
    if (imgEl && bg) {
      const bgWrap = imgEl.parentElement;
      let ghost = bgWrap.querySelector(".dyn-preview-ghost");
      if (!ghost) {
        ghost = document.createElement("img");
        ghost.className = "dyn-preview-ghost";
        ghost.alt = "";
        ghost.setAttribute("aria-hidden", "true");
        bgWrap.insertBefore(ghost, imgEl);
      }
      const oldSrc = imgEl.getAttribute("src");
      if (!entering && oldSrc && oldSrc !== bg) {
        ghost.src = imgEl.currentSrc || oldSrc;
        ghost.classList.remove("dyn-ghost-out");
        void ghost.offsetWidth;
        ghost.classList.add("dyn-ghost-out");
      } else {
        ghost.classList.remove("dyn-ghost-out");
        ghost.removeAttribute("src");
      }
      imgEl.classList.remove("dyn-img-in");
      imgEl.classList.add("dyn-img-wait");
      let revealed = false;
      const reveal = () => {
        if (revealed || dynPreview._dynToken !== token) return;
        revealed = true;
        imgEl.classList.remove("dyn-img-wait");
        this.restartAnimation(imgEl, "dyn-img-in");
      };
      imgEl.onload = reveal;
      imgEl.onerror = reveal;
      imgEl.alt = displayTitle;
      if (oldSrc === bg) reveal();
      else imgEl.src = bg;
      if (imgEl.complete && imgEl.naturalWidth) reveal();
    }
  }

  addToRecentlyWatched(item) {
    if (!item || !item.title) return;
    const list = this.getRecentlyWatchedList();
    const existingIdx = list.findIndex(r => r.title === item.title);
    if (existingIdx !== -1) {
      list.splice(existingIdx, 1);
    }

    list.unshift({
      id: "recent-" + Date.now(),
      title: item.title,
      subtitle: item.subtitle || item.description || (item.isLiveTV ? "Live Broadcast" : item.genre || ""),
      isLiveTV: !!item.isLiveTV,
      channelNumber: item.channelNumber || item.ch || item.lcn || "",
      lcn: item.channelNumber || item.ch || item.lcn || "",
      progress: Math.floor(Math.random() * 40) + 50,
      timeLeft: item.isLiveTV ? "Live Broadcast" : (item.duration || "Just Watched"),
      image: item.image || item.bgImage || item.hero || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop",
      ott: item.isLiveTV ? "LIVE TV" : (item.ott || item.ottPartner || "VIBE OTT")
    });

    if (list.length > 20) list.pop();

    const key = this.accountType === "new" ? "vibe_recent_new" : "vibe_recent_demo";
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}

    this.renderRecentlyWatched();
    if (this.homeView === "ott") {
      this.renderOttPage();
    }
  }

  renderLiveChannelsRail() {
    const container = document.getElementById("rail-live-channels");
    if (!container) return;

    let html = "";
    VIBE_DATA.liveChannels.forEach((item) => {
      html += `
        <div class="media-card focusable" 
             tabindex="0" 
             data-title="${item.name}"
             data-subtitle="${item.nowPlaying}"
             data-image="${item.image}"
             data-live="true"
             data-channel="${item.channelNumber}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
            <div class="card-badge-live">● LIVE TV</div>
            <div class="card-badge-channel">CH ${item.channelNumber}</div>
            <div class="card-progress-bar">
              <div class="card-progress-fill" style="width: ${item.progress}%"></div>
            </div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.name}</div>
            <div class="card-meta-text">
              <span>${item.nowPlaying}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  renderTrendingNow() {
    const container = document.getElementById("rail-trending-now");
    if (!container) return;

    let html = "";
    VIBE_DATA.trendingNow.forEach((item) => {
      html += `
        <div class="media-card focusable" 
             tabindex="0" 
             data-title="${item.title}"
             data-subtitle="${item.genre}"
             data-image="${item.image}"
             data-ott="${item.ott}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="card-ott-badge">${item.ott}</div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.title}</div>
            <div class="card-meta-text">
              <span>${item.genre}</span>
              <span>★ ${item.rating}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  renderBlockbusterMovies() {
    const container = document.getElementById("rail-blockbuster-movies");
    if (!container) return;

    let html = "";
    VIBE_DATA.blockbusterMovies.forEach((item) => {
      html += `
        <div class="media-card focusable" 
             tabindex="0" 
             data-title="${item.title}"
             data-subtitle="${item.subtitle}"
             data-image="${item.image}"
             data-ott="${item.ott}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="card-ott-badge">${item.ott}</div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.title}</div>
            <div class="card-meta-text">
              <span>${item.subtitle}</span>
              <span>★ ${item.rating}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  renderPopularSeries() {
    const container = document.getElementById("rail-popular-series");
    if (!container) return;

    let html = "";
    VIBE_DATA.popularSeries.forEach((item) => {
      html += `
        <div class="media-card focusable" 
             tabindex="0" 
             data-title="${item.title}"
             data-subtitle="${item.subtitle}"
             data-image="${item.image}"
             data-ott="${item.ott}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="card-ott-badge">${item.ott}</div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.title}</div>
            <div class="card-meta-text">
              <span>${item.subtitle}</span>
              <span>★ ${item.rating}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  renderNewsChannels() {
    const container = document.getElementById("rail-news-channels");
    if (!container) return;

    let html = "";
    VIBE_DATA.newsChannels.forEach((item) => {
      html += `
        <div class="media-card focusable" 
             tabindex="0" 
             data-title="${item.title}"
             data-subtitle="${item.subtitle}"
             data-image="${item.image}"
             data-live="true"
             data-channel="${item.lcn}">
          <div class="card-thumb-wrap">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
            <div class="card-badge-live">● LIVE TV</div>
            <div class="card-badge-channel">LCN ${item.lcn}</div>
          </div>
          <div class="card-info-pane">
            <div class="card-title-text">${item.title}</div>
            <div class="card-meta-text">
              <span>${item.subtitle}</span>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  /* ----------------------------------------------------------
   * 1:1 LIVE TV EPG GUIDE WITH MINIMIZABLE TRAY & PiP PLAYER
   * ---------------------------------------------------------- */
  /* ----------------------------------------------------------
   * LIVE ON VIBE (EPG)
   * - Guide covers 2 hours from the current half-hour; programme times and the LIVE
   *   programme are worked out from the real clock.
   * - Languages / Genres filter the channel list (both apply together).
   * - Changing a filter previews the lowest-LCN channel in the result.
   * - Moving onto a channel (remote) or clicking it once (mouse) previews it;
   *   OK / a second click opens it full screen.
   * ---------------------------------------------------------- */
  renderEPG() {
    this.epgLang = this.epgLang || "All";
    this.epgGenre = this.epgGenre || "All";
    this.computeEpgTimes();
    if (!this.selectedLiveChannel) this.selectedLiveChannel = this.epgFilteredChannels()[0];
    this.selectedProgram = this.liveProgramOf(this.selectedLiveChannel);
    this.renderLiveTvTopMeta();
    this.renderLiveTvFilterTray();
    this.renderLiveTvScheduleGrid();
    if (!this.epgMarkerTimer) {
      // Keep the red "now" line moving
      this.epgMarkerTimer = setInterval(() => { if (this.currentScreen === "epg") this.positionEpgMarker(); }, 30000);
      window.addEventListener("resize", () => { if (this.currentScreen === "epg") this.positionEpgMarker(); });
    }
  }

  formatClock(d) {
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  // Guide window = 2 hours from the current half-hour. Each programme's start/end,
  // time label and LIVE flag are derived from its position (span = 30-minute slots).
  computeEpgTimes() {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(now.getMinutes() < 30 ? 0 : 30, 0, 0);
    this.epgWindowStart = start;
    this.epgWindowMinutes = 120;
    VIBE_DATA.liveTvGuide.channels.forEach((ch) => {
      let offset = 0;
      ch.programs.forEach((p) => {
        const s = new Date(start.getTime() + offset * 30 * 60000);
        offset += p.span;
        const e = new Date(start.getTime() + offset * 30 * 60000);
        p.timeRange = `${this.formatClock(s)} - ${this.formatClock(e)}`;
        p.isLive = now >= s && now < e;
      });
    });
  }

  liveProgramOf(ch) {
    if (!ch) return { title: "Live Broadcast", desc: "Live Broadcast on SITI PlayTop Magic." };
    if (ch.programs && Array.isArray(ch.programs) && ch.programs.length) {
      return ch.programs.find((p) => p.isLive) || ch.programs[0];
    }
    return { title: ch.nowPlaying || "Live Broadcast", desc: "Live Broadcast on SITI PlayTop Magic." };
  }

  epgFilteredChannels() {
    return VIBE_DATA.liveTvGuide.channels
      .filter((c) => (this.epgLang === "All" || c.language === this.epgLang) &&
                     (this.epgGenre === "All" || c.genre === this.epgGenre))
      .sort((a, b) => Number(a.lcn) - Number(b.lcn));
  }

  // Language / genre click: filter the guide and preview the lowest-LCN channel
  applyEpgFilter(type, value) {
    if (type === "language") this.epgLang = value;
    else this.epgGenre = value;
    const list = this.epgFilteredChannels();
    if (list.length) {
      this.selectedLiveChannel = list[0];
      this.selectedProgram = this.liveProgramOf(list[0]);
    }
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.renderLiveTvFilterTray();
    this.renderLiveTvScheduleGrid();
    this.renderLiveTvTopMeta();
    // The tray was redrawn: keep focus on the item that was clicked
    const same = document.querySelector(`.epg-tray-item[data-type='${type}'][data-val='${value}']`);
    if (same && this.currentScreen === "epg") window.tvEngine.focus(same, true);
  }

  // Show a channel in the preview (top info + PiP) and mark it in the list
  previewEpgChannel(ch, program) {
    if (!ch) return;
    this.selectedLiveChannel = ch;
    this.selectedProgram = program || this.liveProgramOf(ch);
    this.renderLiveTvTopMeta();
    document.querySelectorAll(".epg-ch-cell").forEach((cell) => {
      cell.classList.toggle("epg-ch-previewing", cell.getAttribute("data-ch-id") === ch.id);
    });
  }

  openEpgChannelFullScreen(ch) {
    if (!ch) return;
    this.openPlayer({
      title: ch.name,
      subtitle: this.liveProgramOf(ch).title,
      image: ch.liveVideoBg,
      isLiveTV: true,
      channelNumber: ch.lcn
    });
  }

  // Red "now" line: placed over the programme strip at the current time
  positionEpgMarker() {
    const marker = document.getElementById("epg-red-timeline-marker");
    const matrix = document.querySelector("#screen-epg .livetv-bottom-matrix");
    const strip = document.querySelector("#epg-rows-scroll .epg-prog-tiles-strip");
    if (!marker || !matrix) return;
    if (!strip || !this.epgWindowStart) { marker.style.display = "none"; return; }
    const frac = Math.min(1, Math.max(0, (Date.now() - this.epgWindowStart.getTime()) / (this.epgWindowMinutes * 60000)));
    const m = matrix.getBoundingClientRect();
    const s = strip.getBoundingClientRect();
    marker.style.display = "";
    marker.style.left = `${Math.round(s.left - m.left + frac * s.width)}px`;

    // Line the half-hour labels up exactly over the programme strip
    const slots = document.getElementById("epg-time-slots-row");
    const headerBtn = document.getElementById("epg-channels-header-label");
    if (slots && headerBtn) {
      const b = headerBtn.getBoundingClientRect();
      slots.style.flex = "0 0 auto";
      slots.style.marginLeft = `${Math.round(s.left - b.right)}px`;
      slots.style.width = `${Math.round(s.width)}px`;
    }
  }

  renderLiveTvTopMeta() {
    const clockEl = document.getElementById("livetv-clock-text");
    const titleEl = document.getElementById("livetv-show-title");
    const timeLangEl = document.getElementById("livetv-time-lang");
    const lcnGenreEl = document.getElementById("livetv-lcn-genre");
    const descEl = document.getElementById("livetv-desc-text");
    const pipVideo = document.getElementById("pip-video-feed");
    const pipWatermark = document.getElementById("pip-channel-watermark");

    if (!this.selectedLiveChannel) return;
    if (clockEl) clockEl.textContent = `Current Time : ${this.formatClock(new Date())}`;
    if (titleEl) titleEl.textContent = this.selectedProgram ? this.selectedProgram.title : "Fatafat";
    if (timeLangEl) timeLangEl.textContent = `${this.selectedProgram ? this.selectedProgram.timeRange : "2:00 PM - 2:10 PM"} | ${this.selectedLiveChannel.language}`;
    if (lcnGenreEl) lcnGenreEl.textContent = `LCN : ${this.selectedLiveChannel.lcn} | ${this.selectedLiveChannel.genre} | Series`;
    if (descEl) descEl.textContent = `Description : ${this.selectedProgram ? this.selectedProgram.desc : "Stay informed with a quick global update! This report covers top regional stories, important events, and noteworthy incidents happening around the world. Get your concise news fix now."}`;

    if (pipVideo && this.selectedLiveChannel) {
      pipVideo.style.backgroundImage = `url('${this.selectedLiveChannel.liveVideoBg}')`;
    }
    if (pipWatermark && this.selectedLiveChannel) {
      pipWatermark.textContent = this.selectedLiveChannel.name;
    }
  }

  renderLiveTvFilterTray() {
    const langCol = document.getElementById("epg-col-languages-items");
    const genCol = document.getElementById("epg-col-genres-items");
    if (!langCol || !genCol) return;

    // Real counts. A language's count respects the chosen genre and vice versa,
    // so each number is what you'd get by clicking it.
    const channels = VIBE_DATA.liveTvGuide.channels;
    const countFor = (type, val) => channels.filter((c) =>
      (type === "language" ? (val === "All" || c.language === val) : (this.epgLang === "All" || c.language === this.epgLang)) &&
      (type === "genre" ? (val === "All" || c.genre === val) : (this.epgGenre === "All" || c.genre === this.epgGenre))
    ).length;
    // Keep the data's order, only list values that have channels, plus any new ones
    const ordered = (listed, key) => {
      const present = [...new Set(channels.map((c) => c[key]))];
      const names = listed.map((x) => x.name).filter((n) => n === "All" || present.includes(n));
      present.forEach((n) => { if (!names.includes(n)) names.push(n); });
      if (!names.includes("All")) names.unshift("All");
      return names;
    };
    const item = (type, name, active) => {
      const n = countFor(type, name);
      return `
        <div class="epg-tray-item focusable ${active ? "active-filter" : ""} ${n === 0 ? "epg-tray-empty" : ""}"
             tabindex="0" role="button" aria-pressed="${active}"
             data-type="${type}"
             data-val="${name}">
          <span>${name}</span>
          <span class="tray-sub-count">${n} Channel${n === 1 ? "" : "s"}</span>
        </div>`;
    };

    langCol.innerHTML = ordered(VIBE_DATA.liveTvGuide.languages, "language")
      .map((name) => item("language", name, name === this.epgLang)).join("");
    genCol.innerHTML = ordered(VIBE_DATA.liveTvGuide.genres, "genre")
      .map((name) => item("genre", name, name === this.epgGenre)).join("");
  }

  renderLiveTvScheduleGrid() {
    const channelsHeaderBtn = document.getElementById("epg-channels-header-label");
    const timeSlotsRow = document.getElementById("epg-time-slots-row");
    const gridRows = document.getElementById("epg-rows-scroll");
    if (!gridRows) return;

    if (channelsHeaderBtn) {
      channelsHeaderBtn.innerHTML = this.isLiveTvTrayMinimized ? `‹ Channels` : `Channels`;
    }

    // Half-hour labels at the same positions as the programme strip below
    if (timeSlotsRow && this.epgWindowStart) {
      const slots = this.epgWindowMinutes / 30;
      let html = "";
      for (let i = 0; i < slots; i++) {
        const t = new Date(this.epgWindowStart.getTime() + i * 30 * 60000);
        html += `<span class="epg-slot-time-text" style="left:${(i / slots) * 100}%">${this.formatClock(t)}</span>`;
      }
      timeSlotsRow.innerHTML = html;
    }

    const list = this.epgFilteredChannels();
    if (!list.length) {
      const what = [this.epgLang !== "All" ? this.epgLang : "", this.epgGenre !== "All" ? this.epgGenre : ""].filter(Boolean).join(" · ");
      gridRows.innerHTML = `<div class="epg-empty-state">No ${what} channels. Pick another language or genre.</div>`;
      this.positionEpgMarker();
      return;
    }

    let rowsHtml = "";
    list.forEach((ch) => {
      const previewing = this.selectedLiveChannel && this.selectedLiveChannel.id === ch.id;
      rowsHtml += `
        <div class="epg-channel-timeline-row">
          <div class="epg-ch-cell focusable ${previewing ? "epg-ch-previewing" : ""}"
               tabindex="0"
               data-ch-id="${ch.id}"
               data-lcn="${ch.lcn}"
               title="LCN ${ch.lcn}">
            <span class="ch-cell-title"><span class="ch-cell-lcn">${ch.lcn}</span>${ch.name}</span>
            <span class="ch-cell-badge" style="background:${ch.logoColor}">${ch.logoText}</span>
          </div>

          <div class="epg-prog-tiles-strip">
            ${ch.programs.map((prog) => `
              <div class="epg-program-block focusable" 
                   tabindex="0" 
                   style="flex: ${prog.span} 1 0; min-width: 0;"
                   data-ch-id="${ch.id}"
                   data-title="${prog.title}"
                   data-time="${prog.timeRange}"
                   data-desc="${prog.desc}">
                <span class="prog-block-title">${prog.title}</span>
                ${prog.isLive ? '<span class="live-broadcast-dot"></span>' : ''}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    });

    gridRows.innerHTML = rowsHtml;
    requestAnimationFrame(() => this.positionEpgMarker());
  }

  // Tray open/close only resizes the guide (rows are NOT redrawn, so remote focus stays put);
  // the "now" line is re-placed once the width animation has finished.
  setLiveTvTray(minimized) {
    this.isLiveTvTrayMinimized = minimized;
    const tray = document.getElementById("epg-filter-columns-tray");
    const header = document.getElementById("epg-channels-header-label");
    if (tray) tray.classList.toggle("tray-minimized", minimized);
    if (header) header.innerHTML = minimized ? "‹ Channels" : "Channels";
    this.positionEpgMarker();
    clearTimeout(this.epgMarkerResizeTimer);
    this.epgMarkerResizeTimer = setTimeout(() => this.positionEpgMarker(), 320);
  }

  minimizeLiveTvTray() {
    this.setLiveTvTray(true);
  }

  expandLiveTvTray() {
    this.setLiveTvTray(false);
  }

  /* ----------------------------------------------------------
   * SEARCH SCREEN (Reference Photo 6)
   * ---------------------------------------------------------- */
  renderSearch() {
    const keyboardContainer = document.getElementById("tv-search-keyboard");
    if (!keyboardContainer) return;

    // QWERTY layout: number row, then the three letter rows (staggered like a real
    // keyboard), with Del at the end of the bottom letter row and Space + Clear below.
    const key = (char, label = char, extra = "") =>
      `<button class="key-tv-btn focusable ${extra}" tabindex="0" data-char="${char}">${label}</button>`;
    const row = (cls, html) => `<div class="keyboard-grid-row ${cls}">${html}</div>`;
    const letters = (s, firstExtra = "") => s.split("").map((c, i) => key(c, c, i === 0 ? firstExtra : "")).join("");

    const kbHtml =
      row("kb-row-numbers", letters("1234567890")) +
      row("kb-row-top", letters("qwertyuiop")) +
      row("kb-row-home", letters("asdfghjkl")) +
      row("kb-row-bottom", letters("zxcvbnm") + key("BACKSPACE", "⌫ Del", "key-del")) +
      row("kb-row-space", key("SPACE", "Space", "key-space") + key("CLEAR", "Clear", "key-clear"));

    keyboardContainer.innerHTML = kbHtml;

    // Search state: tab "tv" (Vibe TV, default) or "ott" (Vibe OTT); one language + one genre filter
    this.searchTab = "tv";
    this.searchLang = null;
    this.searchGenre = null;
    this.SEARCH_MIN_CHARS = 3;
    this.buildSearchCatalogs();
    this.renderSearchFilters();
    this.updateSearchResults();
  }

  /* ----------------------------------------------------------
   * SEARCH: Vibe TV (channels) and Vibe OTT (shows & movies) are searched separately.
   * Text search starts at SEARCH_MIN_CHARS characters; language / genre chips filter
   * on their own too, and combine with the text.
   * ---------------------------------------------------------- */
  buildSearchCatalogs() {
    // --- Vibe TV: every channel from the TV guide + all packages (deduplicated by name)
    const tv = new Map();
    const addTv = (c) => {
      const key = c.name.toLowerCase();
      if (c.name && !tv.has(key)) tv.set(key, c);
    };
    VIBE_DATA.liveTvGuide.channels.forEach((ch) => addTv({
      name: ch.name, lcn: ch.lcn, lang: ch.language, genre: ch.genre,
      icon: ch.logoText, color: ch.logoColor, image: ch.liveVideoBg
    }));
    const fromPackages = (onlyWelcome) => VIBE_DATA.packages.forEach((p) =>
      Object.entries(p.categories || {}).forEach(([cat, list]) => {
        if ((cat === "Free on Vibe") !== onlyWelcome) return;
        list.forEach((c) => addTv({
          name: c.name, lcn: c.ch, lang: c.lang, genre: onlyWelcome ? "Entertainment" : cat,
          icon: c.icon, color: c.color, image: ""
        }));
      }));
    fromPackages(false);
    fromPackages(true); // welcome-pack channels not already listed under a real genre
    this.searchTvCatalog = [...tv.values()];

    // --- Vibe OTT: every OTT app page's titles + the main Vibe OTT page's lists
    const apps = VIBE_DATA.vibeOtt.apps;
    const langFor = (title, service) =>
      (VIBE_DATA.ottTitleLang || {})[title] ||
      ((apps.find((a) => a.name === service) || {}).lang) ||
      (VIBE_DATA.ottLangByService || {})[service] || "Hindi";
    const ott = new Map();
    const addOtt = (o) => {
      const key = o.title.toLowerCase();
      if (!ott.has(key)) ott.set(key, { ...o, lang: langFor(o.title, o.ott) });
    };
    const savedPage = this.ottPageId;
    apps.forEach((app) => {
      this.ottPageId = app.id;
      this.getOttPage().rails[0].items.forEach((t) => addOtt({
        title: t.title, meta: t.meta, kind: t.kind, ott: t.ott, image: t.image, poster: t.poster
      }));
    });
    this.ottPageId = savedPage;
    const addList = (list, kindFn) => (list || []).forEach((i) => addOtt({
      title: i.title, meta: i.genre || i.subtitle || "", kind: kindFn(i), ott: i.ott, image: i.image, poster: i.image
    }));
    addList(VIBE_DATA.trendingNow, (i) => (/season/i.test(i.title) ? "s" : "m"));
    addList(VIBE_DATA.popularSeries, () => "s");
    addList(VIBE_DATA.blockbusterMovies, () => "m");
    addList(VIBE_DATA.trendingOtt, () => null);
    this.searchOttCatalog = [...ott.values()];

    // OTT genre chips match on the title's kind or on keywords in its genre text
    this.OTT_GENRE_RULES = {
      "Movies": (o) => o.kind === "m",
      "Web Series": (o) => o.kind === "s",
      "Drama": (o) => /drama/i.test(o.meta),
      "Comedy": (o) => /comedy|stand-up/i.test(o.meta),
      "Thriller": (o) => /thriller|crime|mystery|detective|heist|investigation|spy|noir/i.test(o.meta),
      "Action": (o) => /action|masala/i.test(o.meta),
      "Romance": (o) => /romance/i.test(o.meta),
      "Horror": (o) => /horror/i.test(o.meta),
      "Sports": (o) => /sport|football|cricket|tennis|basketball|athletics|kabaddi|combat/i.test(o.meta),
      "Documentary": (o) => /documentary|wildlife|nature|science|history|engineering|travel|food/i.test(o.meta),
      "Family & Kids": (o) => /family|kids|animation/i.test(o.meta)
    };
    this.TV_GENRES = ["Entertainment", "Movies", "Sports", "News", "Kids", "Music", "Knowledge & Lifestyle"];
  }

  searchLangLabel(lang) {
    const native = {
      Hindi: "हिन्दी", Bengali: "বাংলা", Telugu: "తెలుగు", Kannada: "ಕನ್ನಡ", Marathi: "मराठी", Tamil: "தமிழ்",
      Gujarati: "ગુજરાતી", Odia: "ଓଡ଼ିଆ", Punjabi: "ਪੰਜਾਬੀ", Malayalam: "മലയാളം"
    }[lang];
    return native ? `${lang} (${native})` : lang;
  }

  searchGenreMatches(item, genre) {
    if (this.searchTab === "tv") return item.genre === genre;
    const rule = this.OTT_GENRE_RULES[genre];
    return rule ? rule(item) : false;
  }

  // Language + genre chips for the current tab (only values that have results)
  renderSearchFilters() {
    const catalog = this.searchTab === "tv" ? this.searchTvCatalog : this.searchOttCatalog;
    const counts = {};
    catalog.forEach((i) => { counts[i.lang] = (counts[i.lang] || 0) + 1; });
    const langs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const genres = (this.searchTab === "tv" ? this.TV_GENRES : Object.keys(this.OTT_GENRE_RULES))
      .filter((g) => catalog.some((i) => this.searchGenreMatches(i, g)));

    const chip = (type, val, label, active) =>
      `<button class="lang-pill-btn focusable ${active ? "pill-active" : ""}" tabindex="0" data-filter="${type}" data-val="${val}" aria-pressed="${active}">${label}</button>`;
    const langEl = document.getElementById("search-languages-container");
    const genreEl = document.getElementById("search-genres-container");
    if (langEl) langEl.innerHTML = langs.map((l) => chip("lang", l, this.searchLangLabel(l), l === this.searchLang)).join("");
    // Search opens on the first language chip (keyboard closed)
    const firstLang = langEl && langEl.querySelector(".lang-pill-btn");
    if (firstLang) firstLang.classList.add("default-focus");
    if (genreEl) genreEl.innerHTML = genres.map((g) => chip("genre", g, g, g === this.searchGenre)).join("");
  }

  // Toggle a language / genre chip (one of each at a time) and re-run the search
  toggleSearchFilter(btn) {
    const type = btn.getAttribute("data-filter");
    const val = btn.getAttribute("data-val");
    const key = type === "lang" ? "searchLang" : "searchGenre";
    this[key] = this[key] === val ? null : val;
    btn.parentElement.querySelectorAll(".lang-pill-btn").forEach((b) => {
      const on = b.getAttribute("data-val") === this[key];
      b.classList.toggle("pill-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.updateSearchResults();
  }

  setSearchTab(tab) {
    if (tab === this.searchTab) return;
    this.searchTab = tab;
    this.searchLang = null;
    this.searchGenre = null;
    document.querySelectorAll(".search-tab").forEach((t) => {
      const on = t.getAttribute("data-search-tab") === tab;
      t.classList.toggle("tab-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.renderSearchFilters();
    this.updateSearchInput();
    this.updateSearchResults();
  }

  updateSearchInput() {
    const inputEl = document.getElementById("search-input-text");
    if (!inputEl) return;
    const placeholder = this.searchTab === "tv"
      ? "Search channels, numbers, genres…"
      : "Search shows, movies, OTT apps…";
    inputEl.textContent = this.searchQuery || placeholder;
    inputEl.classList.toggle("placeholder-active", !this.searchQuery);
  }

  updateSearchResults() {
    const isTv = this.searchTab === "tv";
    const catalog = isTv ? this.searchTvCatalog : this.searchOttCatalog;
    const q = (this.searchQuery || "").trim().toLowerCase();
    const textActive = q.length >= this.SEARCH_MIN_CHARS;
    const hasFilter = !!(this.searchLang || this.searchGenre);

    const titleEl = document.getElementById("search-results-title");
    const hintEl = document.getElementById("search-results-hint");
    const grid = document.getElementById("search-results");
    if (!grid) return;

    let items;
    let title;
    let hint = "";
    if (!textActive && !hasFilter) {
      // Nothing to search yet: show suggestions
      items = catalog.slice(0, 12);
      title = isTv ? "Popular Channels" : "Trending on SITI OTT";
      const left = this.SEARCH_MIN_CHARS - q.length;
      hint = q.length > 0
        ? `Type ${left} more character${left === 1 ? "" : "s"} to search`
        : `Type at least ${this.SEARCH_MIN_CHARS} characters, or pick a language or genre`;
    } else {
      items = catalog.filter((i) => {
        if (this.searchLang && i.lang !== this.searchLang) return false;
        if (this.searchGenre && !this.searchGenreMatches(i, this.searchGenre)) return false;
        if (!textActive) return true;
        const hay = isTv
          ? [i.name, i.genre, i.lang].join(" ").toLowerCase()
          : [i.title, i.meta, i.ott, i.lang].join(" ").toLowerCase();
        return hay.includes(q) || (isTv && String(i.lcn).startsWith(q));
      });
      title = `${isTv ? "Channels" : "Shows & Movies"} (${items.length})`;
      const parts = [];
      if (textActive) parts.push(`“${this.searchQuery.trim()}”`);
      if (this.searchLang) parts.push(this.searchLang);
      if (this.searchGenre) parts.push(this.searchGenre);
      hint = parts.join(" · ");
      if (!textActive && q.length > 0) hint += ` · type ${this.SEARCH_MIN_CHARS - q.length} more to search by text`;
    }

    if (titleEl) titleEl.textContent = title;
    if (hintEl) hintEl.textContent = hint;

    if (items.length === 0) {
      grid.innerHTML = `<div class="search-empty">No ${isTv ? "channels" : "shows or movies"} found. Try another word, language or genre${isTv ? ", or switch to Vibe OTT" : ", or switch to Vibe TV"}.</div>`;
    } else if (isTv) {
      grid.innerHTML = items.map((c) => {
        const dark = ["#000000", "#0F172A", "#1E293B"].includes((c.color || "").toUpperCase());
        return `
          <div class="channel-search-tile focusable" tabindex="0"
               data-title="${c.name}" data-subtitle="${c.genre} • ${c.lang}" data-image="${c.image || ""}"
               data-live="true" data-channel="${c.lcn}">
            <div class="ch-logo-badge" style="color:${dark || !c.color ? "#FFFFFF" : c.color};">${c.icon || "★"}</div>
            <div class="ch-title">${c.name}</div>
            <div class="ch-number-tag">Ch. ${c.lcn}</div>
            <div class="ch-meta-tag">${c.genre} • ${c.lang}</div>
          </div>`;
      }).join("");
    } else {
      const apps = VIBE_DATA.vibeOtt.apps;
      grid.innerHTML = items.map((o) => {
        const app = apps.find((a) => a.name === o.ott);
        return `
          <div class="channel-search-tile search-ott-tile focusable" tabindex="0"
               data-title="${o.title}" data-subtitle="${o.meta}" data-image="${o.image}" data-ott="${o.ott}">
            <img src="${o.poster || o.image}" alt="${o.title}" loading="lazy" />
            <div class="search-ott-info">
              <div class="ch-title">${o.title}</div>
              <div class="ch-meta-tag">${o.meta} • ${o.lang}</div>
              <span class="search-ott-app" style="background:${app ? app.bg : "rgba(255,255,255,0.14)"};">${o.ott}</span>
            </div>
          </div>`;
      }).join("");
    }

    // If the focused tile was replaced, move focus back to the search bar
    const cur = window.tvEngine && window.tvEngine.currentFocus;
    if (cur && !document.body.contains(cur) && this.currentScreen === "search") {
      const bar = document.getElementById("search-input-box");
      if (bar) window.tvEngine.focus(bar);
    }
  }

  // On-screen keyboard: shown while the search bar or a key is selected, hidden otherwise.
  // It slides in from the left and takes its space; hidden, the results use the full width.
  setSearchKeyboard(open) {
    const screen = document.getElementById("screen-search");
    if (screen) screen.classList.toggle("kb-open", !!open);
  }

  handleVirtualKey(char) {
    if (char === "SPACE") {
      if (this.searchQuery && !this.searchQuery.endsWith(" ")) this.searchQuery += " ";
    } else if (char === "BACKSPACE") {
      this.searchQuery = this.searchQuery.slice(0, -1);
    } else if (char === "CLEAR") {
      this.searchQuery = "";
    } else if (this.searchQuery.length < 40) {
      this.searchQuery += char;
    }

    this.updateSearchInput();
    this.updateSearchResults();
  }

  /* ----------------------------------------------------------
   * HELP TAB: EXPANDABLE ACCORDION FAQ
   * ---------------------------------------------------------- */
  renderHelpFAQ() {
    const container = document.getElementById("help-faq-scroll");
    if (!container) return;

    container.innerHTML = VIBE_DATA.faqs.map((faq, idx) => `
      <div class="faq-accordion-item ${idx === 0 ? 'faq-open' : ''}" data-faq-index="${idx}">
        <button class="faq-question-btn focusable ${idx === 0 ? 'default-focus' : ''}" 
                tabindex="0"
                aria-expanded="${idx === 0 ? 'true' : 'false'}">
          <span>${faq.q}</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer-pane">
          ${faq.a}
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".faq-question-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-accordion-item");
        if (item) {
          const isOpen = item.classList.contains("faq-open");

          // Close other open items to maintain full visibility and prevent clipping
          container.querySelectorAll(".faq-accordion-item").forEach((other) => {
            other.classList.remove("faq-open");
            const otherBtn = other.querySelector(".faq-question-btn");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          });

          // Toggle current
          if (!isOpen) {
            item.classList.add("faq-open");
            btn.setAttribute("aria-expanded", "true");
          }

          window.tvEngine.playBeep("click");

          // Keep question and newly revealed answer smoothly in view
          setTimeout(() => {
            item.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 60);
        }
      });
    });
  }

  /* ----------------------------------------------------------
   * LIVE CHANNEL ENTITLEMENT & FREE CHANNEL CHECKS
   * ---------------------------------------------------------- */
  isFreeLiveChannel(ch) {
    if (!ch) return false;
    if (ch.isFree === true || ch.free === true) return true;
    const lcn = String(ch.lcn || ch.channelNumber || ch.ch || "").trim();
    const name = String(ch.name || ch.title || "").toLowerCase().trim();

    // 1. Direct free list (DD channels + Free on SITI 101-110)
    const freeLdns = ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"];
    if (freeLdns.includes(lcn)) return true;

    // 2. Free channels in VIBE_DATA
    const freeList = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.freeChannels) || [];
    if (freeList.some(f => String(f.lcn).trim() === lcn || f.name.toLowerCase().trim() === name)) return true;

    // 3. Name check for common free channel names
    const freeNames = [
      "dd national", "dd news", "dd bangla", "dd sports", "dd india",
      "dd kisan", "dd bharati", "sansad tv", "aastha", "zee anmol cinema"
    ];
    if (freeNames.some(fn => name === fn || name.includes(fn))) return true;

    return false;
  }

  isChannelInPackage(ch) {
    if (!ch) return false;

    // Free on SITI channels are ALWAYS included for everyone
    if (this.isFreeLiveChannel(ch)) return true;

    // Guests / unregistered users have no package
    if (!this.isLoggedIn) return false;

    // Logged in user must have an active subscription
    if (!this.currentSubscription || !this.currentSubscription.hasSubscription) return false;

    const pkgId = this.currentSubscription.packageId || "pkg-2";
    const packages = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.packages) || [];
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return false;

    // If this is an OTT item
    if (ch.ott && ch.isLiveTV === false) {
      const ottList = pkg.ottApps || [];
      const ottName = String(ch.ott).toLowerCase().trim();
      return ottList.some(o => o.name.toLowerCase().trim() === ottName || ottName.includes(o.name.toLowerCase().trim()));
    }

    const lcn = String(ch.lcn || ch.channelNumber || ch.ch || "").trim();
    const rawName = String(ch.name || ch.title || "").toLowerCase().trim();

    // Premium channels exclusively in higher tiers (Sports Combo, Cinema Plus, Gold, Diamond).
    // Matched by name: channel numbers are shared by the guide and packages, so a
    // number list here would silently hit an unrelated channel.
    const premiumHigherTierNames = ["star sports select", "sony sports ten 2", "sony sports ten 5", "eurosport", "star movies", "&flix", "star gold select"];

    if (pkgId === "pkg-1") {
      // Starter Magic excludes sports HD and premium movies
      if (/star sports|sony sports|\bten [1-5]\b|sports select/.test(rawName)) {
        return false;
      }
    } else if (pkgId === "pkg-2") {
      // Bengali Mega has all Bengali & Hindi entertainment/news/movies, but excludes higher-tier sports/cinema
      if (premiumHigherTierNames.some(pn => rawName.includes(pn))) {
        return false;
      }
    }

    // Collect all channel objects in the current package
    let channelList = [];
    if (pkg.categories) {
      Object.values(pkg.categories).forEach(arr => {
        if (Array.isArray(arr)) channelList.push(...arr);
      });
    }

    // In the package: same channel name, or (for number-only lookups) the same number.
    // Numbers are unified across guide, rails and packages (data.js unifyChannelNumbers).
    if (rawName) {
      if (channelList.some(c => this.sameChannelName(c.name, rawName))) return true;
    } else if (lcn && channelList.some(c => String(c.ch).trim() === lcn)) {
      return true;
    }

    // If channel is in liveTvGuide and pkg is pkg-2 (Bengali Mega), all Bengali guide channels belong to Bengali Mega
    if (pkgId === "pkg-2" && (ch.language === "Bengali" || ["135", "136", "320", "324", "335", "338", "340", "342", "410", "412", "415", "425"].includes(lcn))) {
      return true;
    }

    return false;
  }

  /* ----------------------------------------------------------
   * PLAYER SIMULATOR
   * ---------------------------------------------------------- */
  openPlayer(item) {
    // Free on SITI channels play unconditionally for everyone (including guests)
    const isFree = this.isFreeLiveChannel(item);

    // Guests can browse everything, but playing any paid content asks them to log in
    if (!isFree && !this.isLoggedIn) {
      this.pendingContent = item;
      this.openLoginModal();
      return;
    }

    // Logged in user: check if channel/content is entitled in active package
    if (!isFree && !this.isChannelInPackage(item)) {
      this.openChannelLockModal(item);
      return;
    }

    // Save return point before switching screen so Back key returns to the origin view
    this.playerReturnPoint = {
      screen: this.currentScreen,
      homeView: this.homeView,
      ottPageId: this.ottPageId || null,
      focus: window.tvEngine ? window.tvEngine.currentFocus : null,
      selectedLiveChannel: this.selectedLiveChannel || null,
      isLiveTvTrayMinimized: this.isLiveTvTrayMinimized || false
    };

    const modal = document.getElementById("screen-player-modal");
    if (!modal) return;

    const titleEl = document.getElementById("player-item-title");
    const subEl = document.getElementById("player-item-sub");
    const videoBg = document.getElementById("player-video-sim");

    // Live channels get the remote keys (◀ ▶ zap, ▼ On now, ▲ Upcoming Shows)
    this.closePlayerOverlay(true);
    this.playerLiveCh = item.isLiveTV ? this.findGuideChannel(item.channelNumber || item.lcn, item.title) : null;
    if (this.playerLiveCh) {
      // channels not in the guide keep the picture they were opened with
      if (this.playerLiveCh._extra && item.image) this.playerLiveCh.liveVideoBg = item.image;
      this.selectedLiveChannel = this.playerLiveCh;
    }
    this.playerSubIndex = 0;
    this.resetPlayerState(this.playerLiveCh);

    if (titleEl) titleEl.textContent = item.title || "SITI PlayTop Live Stream";
    if (subEl) subEl.textContent = item.subtitle || "Ultra HD 4K • Dolby Atmos";
    if (videoBg && item.image) {
      videoBg.style.backgroundImage = `radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%), url('${item.image}')`;
      this.restartAnimation(videoBg, "player-zap-in");
    }

    this.addToRecentlyWatched(item);
    this.showScreen("player-modal", "#btn-player-playpause");

    // Live TV opens in "watching" mode (controls hidden, arrows change channel)
    // with a short key hint; OTT shows its controls straight away
    const c = this.playerContainer();
    if (this.playerLiveCh) {
      this.playerControlsVisible = false;
      if (c) c.classList.add("player-chrome-hidden");
      this.showPlayerChannelBanner(this.playerLiveCh, this.liveProgramOf(this.playerLiveCh));
      this.showPlayerKeyHint();
    } else {
      this.playerControlsVisible = true;
      if (c) c.classList.remove("player-chrome-hidden");
      this.hidePlayerKeyHint();
    }
  }

  closePlayer() {
    this.closePlayerOverlay(true);
    clearTimeout(this.playerControlsTimer);
    this.hidePlayerKeyHint();
    this.setPlayerPaused(false, true);
    this.playerLiveCh = null;
    const rp = this.playerReturnPoint;
    this.playerReturnPoint = null;
    const usable = (el) => el && document.body.contains(el);

    if (rp) {
      if (rp.screen === "epg") {
        if (rp.isLiveTvTrayMinimized) {
          this.minimizeLiveTvTray();
        }
        const focusTarget = rp.selectedLiveChannel
          ? `.epg-ch-cell[data-ch-id="${rp.selectedLiveChannel.id}"]`
          : ".epg-ch-cell.epg-ch-previewing, .epg-ch-cell";
        this.showScreen("epg", focusTarget);
        return;
      }

      if (rp.screen === "search") {
        this.showScreen("search", usable(rp.focus) ? rp.focus : "#search-input-box");
        return;
      }

      if (rp.screen === "profile-account") {
        this.showScreen("profile-account", usable(rp.focus) ? rp.focus : ".account-subs-tab.subs-catv");
        return;
      }

      if (rp.screen === "subscription") {
        this.showScreen("subscription", usable(rp.focus) ? rp.focus : "#btn-sub-store-back");
        return;
      }

      if (rp.screen === "home") {
        if (rp.homeView === "ott" && rp.ottPageId !== this.ottPageId) {
          this.ottPageId = rp.ottPageId;
          this.renderOttPage();
        }
        this.nextHomeView = rp.homeView;
        const fallback = rp.homeView === "ott"
          ? (this.ottPageId ? ".ott-hero-btn" : "#vott-watch-now")
          : "#home-main .btn-watch-now";
        this.showScreen("home", usable(rp.focus) ? rp.focus : fallback);
        return;
      }
    }

    // Default fallback to Home view
    this.nextHomeView = this.homeView;
    this.showScreen("home", this.homeView === "ott" ? "#vott-watch-now" : null);
  }

  /* ----------------------------------------------------------
   * VIRTUAL TV REMOTE (Testing Overlay)
   * ---------------------------------------------------------- */
  renderVirtualRemote() {
    const remote = document.getElementById("virtual-remote-widget");
    if (!remote) return;

    remote.innerHTML = `
      <div class="remote-top-bar" id="remote-drag-handle" title="Drag to move · double-click to reset">
        <span class="remote-brand-label"><span class="remote-grip" aria-hidden="true">⠿</span> SITI REMOTE</span>
        <button class="remote-toggle-btn" id="remote-min-btn" title="Toggle Remote (Press R)">_</button>
      </div>

      <div class="remote-dpad-disc">
        <button class="dpad-clicker btn-up" id="r-up">▲</button>
        <button class="dpad-clicker btn-left" id="r-left">◀</button>
        <button class="dpad-ok-center" id="r-ok">OK</button>
        <button class="dpad-clicker btn-right" id="r-right">▶</button>
        <button class="dpad-clicker btn-down" id="r-down">▼</button>
      </div>

      <div class="remote-nav-actions">
        <button class="remote-action-btn" id="r-back">BACK</button>
        <button class="remote-action-btn" id="r-home">HOME</button>
        <button class="remote-action-btn" id="r-epg">LIVE TV</button>
      </div>

      <!-- TV Remote Numpad for Direct LCN Channel Selection -->
      <div class="remote-numpad-section">
        <div class="remote-numpad-grid">
          <button class="remote-num-btn" data-num="1">1</button>
          <button class="remote-num-btn" data-num="2">2</button>
          <button class="remote-num-btn" data-num="3">3</button>
          <button class="remote-num-btn" data-num="4">4</button>
          <button class="remote-num-btn" data-num="5">5</button>
          <button class="remote-num-btn" data-num="6">6</button>
          <button class="remote-num-btn" data-num="7">7</button>
          <button class="remote-num-btn" data-num="8">8</button>
          <button class="remote-num-btn" data-num="9">9</button>
          <button class="remote-num-btn remote-num-clear" data-action="clear" title="Clear / Backspace">CLR</button>
          <button class="remote-num-btn" data-num="0">0</button>
          <button class="remote-num-btn remote-num-enter" data-action="enter" title="Tune / OK">ENT</button>
        </div>
      </div>
    `;

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    bind("remote-min-btn", () => window.tvEngine.toggleVirtualRemote());
    bind("r-up", () => window.tvEngine.move("UP"));
    bind("r-down", () => window.tvEngine.move("DOWN"));
    bind("r-left", () => window.tvEngine.move("LEFT"));
    bind("r-right", () => window.tvEngine.move("RIGHT"));
    bind("r-ok", () => {
      if (this.lcnBuffer.length > 0) {
        this.confirmLcnTune();
      } else {
        window.tvEngine.handleEnter();
      }
    });
    bind("r-back", () => window.tvEngine.handleBack());
    // HOME: Home page on the banner (left bar stays closed)
    bind("r-home", () => this.showScreen("home", "#home-main .btn-watch-now"));
    bind("r-epg", () => { if (this.currentScreen !== "epg") this.openWithReturn("epg"); });

    // Remote numpad digit clicks (0-9)
    remote.querySelectorAll(".remote-num-btn[data-num]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const num = btn.getAttribute("data-num");
        this.handleLcnDigit(num);
      });
    });

    // Remote numpad CLR button
    const clearBtn = remote.querySelector('.remote-num-btn[data-action="clear"]');
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.handleLcnBackspace();
      });
    }

    // Remote numpad ENT button
    const enterBtn = remote.querySelector('.remote-num-btn[data-action="enter"]');
    if (enterBtn) {
      enterBtn.addEventListener("click", () => {
        if (this.lcnBuffer.length > 0) {
          this.confirmLcnTune();
        } else if (this.currentScreen === "epg" && this.selectedLiveChannel) {
          this.openEpgChannelFullScreen(this.selectedLiveChannel);
        } else {
          window.tvEngine && window.tvEngine.handleEnter();
        }
      });
    }

    this.setupRemoteDrag(remote);
  }

  // Drag the on-screen remote by its top bar (mouse or touch). The position is kept in
  // this browser (localStorage) and clamped to the window; double-click the bar to reset.
  setupRemoteDrag(remote) {
    const handle = document.getElementById("remote-drag-handle");
    if (!handle) return;
    const KEY = "vibe_remote_pos";
    const MARGIN = 8;

    const clampTo = (left, top) => {
      const maxLeft = window.innerWidth - remote.offsetWidth - MARGIN;
      const maxTop = window.innerHeight - remote.querySelector(".remote-top-bar").offsetHeight - 2 * MARGIN;
      return {
        left: Math.min(Math.max(MARGIN, left), Math.max(MARGIN, maxLeft)),
        top: Math.min(Math.max(MARGIN, top), Math.max(MARGIN, maxTop))
      };
    };
    const place = (left, top) => {
      const p = clampTo(left, top);
      remote.style.left = `${p.left}px`;
      remote.style.top = `${p.top}px`;
      remote.style.right = "auto";
      remote.style.bottom = "auto";
      remote.classList.add("remote-dragged");
      return p;
    };
    const reset = () => {
      remote.style.left = remote.style.top = remote.style.right = remote.style.bottom = "";
      remote.classList.remove("remote-dragged");
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    };

    // Restore the saved position
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && typeof saved.left === "number") requestAnimationFrame(() => place(saved.left, saved.top));
    } catch (e) { /* ignore */ }

    let drag = null;
    handle.addEventListener("pointerdown", (e) => {
      // No dragging while minimised (it's docked in the corner)
      if (e.button !== 0 || e.target.closest("#remote-min-btn") || remote.classList.contains("remote-minimized")) return;
      const rect = remote.getBoundingClientRect();
      drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, id: e.pointerId };
      handle.setPointerCapture(e.pointerId);
      remote.classList.add("remote-dragging");
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      place(e.clientX - drag.dx, e.clientY - drag.dy);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      remote.classList.remove("remote-dragging");
      if (remote.classList.contains("remote-dragged")) {
        try {
          localStorage.setItem(KEY, JSON.stringify({ left: parseFloat(remote.style.left), top: parseFloat(remote.style.top) }));
        } catch (err) { /* position just won't be remembered */ }
      }
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    handle.addEventListener("dblclick", (e) => {
      if (!e.target.closest("#remote-min-btn") && !remote.classList.contains("remote-minimized")) reset();
    });

    // Keep it on screen when the window is resized
    window.addEventListener("resize", () => {
      if (remote.classList.contains("remote-dragged")) {
        place(parseFloat(remote.style.left) || 0, parseFloat(remote.style.top) || 0);
      }
    });
  }

  /* ----------------------------------------------------------
   * LIVE TV DIRECT LCN CHANNEL TUNING & ON-SCREEN DISPLAY (OSD)
   * Allows tuning by channel number from Live TV guide, during playback, or Home
   * ---------------------------------------------------------- */
  findLiveChannelByLcn(lcnQuery) {
    const q = String(lcnQuery || "").trim();
    if (!q) return null;

    // 1. Check liveTvGuide.channels
    const guide = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.liveTvGuide && VIBE_DATA.liveTvGuide.channels) ? VIBE_DATA.liveTvGuide.channels : [];
    let match = guide.find(c => String(c.lcn) === q || String(c.channelNumber) === q);
    if (match) return match;

    // 2. Check freeChannels (Free on SITI 101-110)
    const free = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.freeChannels) ? VIBE_DATA.freeChannels : [];
    match = free.find(c => String(c.lcn) === q);
    if (match) {
      const inGuide = guide.find(g => g.name.toLowerCase() === match.name.toLowerCase());
      if (inGuide) return { ...inGuide, isFree: true };
      return {
        id: match.id,
        name: match.name,
        lcn: match.lcn,
        genre: "Entertainment",
        isFree: true,
        liveVideoBg: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
        programs: [{ title: match.nowPlaying || "Live Broadcast", desc: "Live Broadcast on SITI PlayTop Magic." }]
      };
    }

    // 3. Check popularChannels
    const pop = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.popularChannels) ? VIBE_DATA.popularChannels : [];
    match = pop.find(c => String(c.lcn) === q);
    if (match) {
      const inGuide = guide.find(g => g.name.toLowerCase() === match.name.toLowerCase());
      return inGuide || {
        id: match.id,
        name: match.name,
        lcn: match.lcn,
        genre: "Entertainment",
        liveVideoBg: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
        programs: [{ title: match.nowPlaying || "Live Broadcast", desc: "Live Broadcast on SITI PlayTop Magic." }]
      };
    }

    // 4. Check liveChannels
    const live = (typeof VIBE_DATA !== "undefined" && VIBE_DATA.liveChannels) ? VIBE_DATA.liveChannels : [];
    match = live.find(c => String(c.channelNumber) === q);
    if (match) {
      const inGuide = guide.find(g => g.name.toLowerCase() === match.name.toLowerCase());
      return inGuide || {
        id: match.id,
        name: match.name,
        lcn: match.channelNumber,
        genre: "Live TV",
        liveVideoBg: match.image,
        programs: [{ title: match.nowPlaying || "Live Broadcast", desc: "Live Broadcast on SITI PlayTop Magic." }]
      };
    }

    // 5. Check all package categories across VIBE_DATA.packages
    if (typeof VIBE_DATA !== "undefined" && Array.isArray(VIBE_DATA.packages)) {
      for (const p of VIBE_DATA.packages) {
        if (!p.categories) continue;
        for (const [catName, list] of Object.entries(p.categories)) {
          if (!Array.isArray(list)) continue;
          const found = list.find(c => String(c.ch) === q);
          if (found) {
            const inGuide = guide.find(g => g.name.toLowerCase() === found.name.toLowerCase());
            return inGuide || {
              id: `ch-pkg-${found.ch}`,
              name: found.name,
              lcn: String(found.ch),
              genre: catName,
              language: found.lang || "Hindi",
              liveVideoBg: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
              programs: [{ title: `${found.name} Broadcast`, desc: "Live Broadcast on SITI PlayTop Magic." }]
            };
          }
        }
      }
    }

    return null;
  }

  handleLcnDigit(digit) {
    if (this.remoteTutorialOpen) return; // remote guide is showing — don't tune behind it
    if (this.lcnBuffer.length >= 3) {
      this.lcnBuffer = String(digit);
    } else {
      this.lcnBuffer += String(digit);
    }

    clearTimeout(this.lcnTimer);
    window.tvEngine && window.tvEngine.playBeep && window.tvEngine.playBeep("click");
    this.renderLcnOsd();

    this.lcnTimer = setTimeout(() => {
      this.confirmLcnTune();
    }, 1400);
  }

  handleLcnBackspace() {
    if (this.lcnBuffer.length > 0) {
      this.lcnBuffer = this.lcnBuffer.slice(0, -1);
      if (this.lcnBuffer.length === 0) {
        this.hideLcnOsd();
      } else {
        this.renderLcnOsd();
        clearTimeout(this.lcnTimer);
        this.lcnTimer = setTimeout(() => this.confirmLcnTune(), 1400);
      }
    } else {
      this.hideLcnOsd();
    }
  }

  handleLcnClear() {
    this.lcnBuffer = "";
    clearTimeout(this.lcnTimer);
    this.lcnTimer = null;
    this.hideLcnOsd();
  }

  confirmLcnTune() {
    clearTimeout(this.lcnTimer);
    this.lcnTimer = null;
    const lcn = this.lcnBuffer;
    if (!lcn) return;
    this.lcnBuffer = "";

    const ch = this.findLiveChannelByLcn(lcn);
    if (!ch) {
      this.showLcnNotFound(lcn);
      return;
    }

    this.tuneToChannel(ch);
  }

  tuneToChannel(ch) {
    if (!ch) return;

    this.hideLcnOsd();

    const isFree = this.isFreeLiveChannel(ch);

    // 1. Guests cannot play paid channels - open registration popup
    if (!isFree && !this.isLoggedIn) {
      this.pendingContent = {
        title: ch.name,
        subtitle: this.liveProgramOf(ch).title,
        image: ch.liveVideoBg || ch.image,
        isLiveTV: true,
        channelNumber: ch.lcn,
        isFree: false
      };
      this.openLoginModal();
      return;
    }

    // 2. Channel not in package - open channel lock popup
    if (!isFree && !this.isChannelInPackage(ch)) {
      this.openChannelLockModal(ch);
      return;
    }

    // 3. If currently in playback (player-modal): switch channel smoothly on-the-fly
    if (this.currentScreen === "player-modal") {
      this.switchPlayerLiveChannel(ch);
      return;
    }

    // 4. If currently in Live TV / EPG Guide: preview channel and launch full screen
    if (this.currentScreen === "epg") {
      this.previewEpgChannel(ch);
      const chCell = document.querySelector(`.epg-ch-cell[data-ch-id="${ch.id}"], .epg-ch-cell[data-lcn="${ch.lcn}"]`);
      if (chCell) {
        chCell.scrollIntoView({ behavior: "smooth", block: "center" });
        if (window.tvEngine) window.tvEngine.focus(chCell, true);
      }
      setTimeout(() => {
        this.openEpgChannelFullScreen(ch);
      }, 350);
      return;
    }

    // 5. From any other screen (Home, Subscription, Search, etc.): open player directly
    this.openPlayer({
      title: ch.name,
      subtitle: this.liveProgramOf(ch).title,
      image: ch.liveVideoBg || ch.image,
      isLiveTV: true,
      channelNumber: ch.lcn,
      isFree
    });
  }

  switchPlayerLiveChannel(ch, dir = 0) {
    if (!ch) return;

    const isFree = this.isFreeLiveChannel(ch);

    // 1. Guests cannot switch to paid channels - open registration popup
    if (!isFree && !this.isLoggedIn) {
      this.pendingContent = {
        title: ch.name,
        subtitle: this.liveProgramOf(ch).title,
        image: ch.liveVideoBg || ch.image,
        isLiveTV: true,
        channelNumber: ch.lcn,
        isFree: false
      };
      this.openLoginModal();
      return;
    }

    // 2. Channel not in package - open channel lock popup
    if (!isFree && !this.isChannelInPackage(ch)) {
      this.openChannelLockModal(ch);
      return;
    }

    this.selectedLiveChannel = ch;
    this.playerLiveCh = ch;
    this.resetPlayerState(ch);
    this.hidePlayerKeyHint();
    const prog = this.liveProgramOf(ch);
    this.selectedProgram = prog;

    const titleEl = document.getElementById("player-item-title");
    const subEl = document.getElementById("player-item-sub");

    if (titleEl) titleEl.textContent = ch.name;
    if (subEl) subEl.textContent = `CH ${ch.lcn} • ${prog.title || "Live Broadcast"}`;
    this.restartAnimation(titleEl && titleEl.parentElement, "player-meta-swap");
    this.zapPlayerPicture(ch.liveVideoBg || ch.image, dir);

    this.addToRecentlyWatched({
      title: ch.name,
      subtitle: prog.title,
      image: ch.liveVideoBg || ch.image,
      isLiveTV: true,
      channelNumber: ch.lcn
    });

    this.showPlayerChannelBanner(ch, prog);
  }

  // Channel change in the full-screen player: the old picture dims and blurs
  // away while the new one "tunes in" from a soft blur. The swap waits for the
  // new image to load so there is never a blank frame; rapid zaps cancel the
  // earlier ones.
  zapPlayerPicture(src, dir = 0) {
    const videoBg = document.getElementById("player-video-sim");
    if (!videoBg || !src) return;
    // ◀ / ▶ zaps slide the picture in the direction of travel
    const shift = dir > 0 ? "70px" : dir < 0 ? "-70px" : "0px";
    videoBg.parentElement.style.setProperty("--zap-x", shift);
    const container = videoBg.parentElement;
    let ghost = container.querySelector(".player-video-ghost");
    if (!ghost) {
      ghost = document.createElement("div");
      ghost.className = "player-video-ghost";
      ghost.setAttribute("aria-hidden", "true");
      videoBg.insertAdjacentElement("afterend", ghost);
    }
    const token = (this.playerZapToken || 0) + 1;
    this.playerZapToken = token;

    let done = false;
    const swap = () => {
      if (done || this.playerZapToken !== token) return;
      done = true;
      ghost.style.backgroundImage = videoBg.style.backgroundImage;
      this.restartAnimation(ghost, "player-zap-out");
      videoBg.style.backgroundImage = `radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%), url('${src}')`;
      this.restartAnimation(videoBg, "player-zap-in");
    };
    const img = new Image();
    img.onload = swap;
    img.onerror = swap;
    img.src = src;
    if (img.complete) swap();
  }

  /* ----------------------------------------------------------
   * LIVE PLAYER REMOTE KEYS
   *  ◀ ▶  previous / next channel by LCN (channels you can watch)
   *  ▼    "On now" rail of live channels; OK tunes, ▲ / Back closes
   *  ▲    "Upcoming Shows" for this channel; ▼ / Back closes
   * ---------------------------------------------------------- */
  // Every live channel the app knows: the Live TV guide plus the Free on SITI
  // and Popular Channels lists (some of those are not in the guide), by LCN.
  // Channels missing from the guide get a genre, language and stock picture.
  allLiveChannels() {
    if (this._allLiveCh) return this._allLiveCh;
    const guide = (VIBE_DATA.liveTvGuide && VIBE_DATA.liveTvGuide.channels) || [];
    const byLcn = new Map(guide.map((c) => [String(c.lcn), c]));
    const pics = guide.filter((c) => c.liveVideoBg);
    // Tiles from the Free, Popular, Live On Now and News rails (news uses title / lcn,
    // Live On Now uses name / channelNumber)
    const extra = [
      ...(VIBE_DATA.freeChannels || []),
      ...(VIBE_DATA.popularChannels || []),
      ...(VIBE_DATA.liveChannels || []),
      ...(VIBE_DATA.newsChannels || [])
    ].map((c) => ({
      id: c.id, name: c.name || c.title, lcn: c.lcn || c.channelNumber,
      nowPlaying: c.nowPlaying || c.subtitle, image: c.image
    })).filter((c) => c.lcn && c.name);
    extra.forEach((c, i) => {
      const lcn = String(c.lcn);
      if (byLcn.has(lcn)) return;
      const n = (c.name || "").toLowerCase();
      const genre = /news|sansad|aaj tak|ananda|ghanta|republic|kolkata tv|ndtv|otv/.test(n) ? "News"
        : /sport/.test(n) ? "Sports"
        : /cinema|movie|gold/.test(n) ? "Movies"
        : /aastha|bharati|sanskar/.test(n) ? "Devotional"
        : /kisan/.test(n) ? "Infotainment"
        : /music|sangeet/.test(n) ? "Music"
        : "Entertainment";
      const language = /bangla|ananda|jalsha|ghanta|kolkata/.test(n) ? "Bengali" : "Hindi";
      const pool = pics.filter((p) => p.genre === genre);
      const from = pool.length ? pool : pics;
      byLcn.set(lcn, {
        id: c.id, name: c.name, lcn, genre, language,
        nowPlaying: c.nowPlaying,
        isFree: this.isFreeLiveChannel(c),
        liveVideoBg: c.image || (from.length ? from[i % from.length].liveVideoBg : ""),
        logoColor: "#1E293B",
        _extra: true
      });
    });
    this._allLiveCh = [...byLcn.values()].sort((a, b) => Number(a.lcn) - Number(b.lcn));
    return this._allLiveCh;
  }

  playerChannelList() {
    return this.allLiveChannels()
      .filter((c) => this.isFreeLiveChannel(c) || (this.isLoggedIn && this.isChannelInPackage(c)));
  }

  // "Zee Bangla HD" == "zee bangla" (ignores case, "HD", a trailing "TV", spaces and
  // punctuation; "Sony Sports Ten 1" == "Sony Ten 1"). Same rule as data.js unifyChannelNumbers.
  sameChannelName(a, b) {
    const n = (x) => String(x || "").toLowerCase().replace(/\bsports ten\b/g, "ten")
      .replace(/\b(hd|tv)\b/g, "").replace(/[^a-z0-9ऀ-෿]/g, "");
    return !!a && !!b && n(a) === n(b);
  }

  // Name wins; the LCN is only trusted when it belongs to a channel of the same name
  findGuideChannel(lcn, name) {
    const all = this.allLiveChannels();
    return (name && all.find((c) => this.sameChannelName(c.name, name))) ||
      all.find((c) => lcn && String(c.lcn) === String(lcn) && (!name || this.sameChannelName(c.name, name))) || null;
  }

  handlePlayerDirection(direction) {
    if (this.currentScreen !== "player-modal" || !this.playerLiveCh) return false;

    if (this.playerOverlay === "rail") {
      if (direction === "UP") { this.closePlayerOverlay(); return true; }
      return direction === "DOWN"; // ◀ ▶ move along the rail (spatial navigation)
    }
    if (this.playerOverlay === "up") {
      if (direction === "DOWN") this.closePlayerOverlay();
      return true;
    }

    // Controls on screen: arrows move between the buttons as usual
    if (this.playerControlsVisible) {
      this.bumpPlayerControls();
      return false;
    }

    if (direction === "LEFT" || direction === "RIGHT") {
      this.zapPlayerChannel(direction === "RIGHT" ? 1 : -1);
    } else if (direction === "DOWN") {
      this.openPlayerRail();
    } else if (direction === "UP") {
      this.openPlayerUpcoming();
    }
    return true;
  }

  /* ----------------------------------------------------------
   * PLAYER CONTROLS (Pause / Audio / Subtitles)
   * Live TV: the controls stay hidden while watching so ◀ ▶ ▼ ▲ work on
   * channels; OK shows them (arrows then move between buttons) and they
   * hide again after a few seconds or on Back. OTT: always shown.
   * ---------------------------------------------------------- */
  handleEnterKey() {
    if (this.currentScreen !== "player-modal" || !this.playerLiveCh || this.playerOverlay) return false;
    if (this.playerControlsVisible) {
      this.bumpPlayerControls();
      return false; // OK presses the focused button
    }
    this.showPlayerControls();
    return true;
  }

  playerContainer() {
    return document.querySelector("#screen-player-modal .player-container");
  }

  showPlayerControls() {
    const c = this.playerContainer();
    if (!c) return;
    this.playerControlsVisible = true;
    c.classList.remove("player-chrome-hidden");
    this.hidePlayerKeyHint();
    const btn = document.getElementById("btn-player-playpause");
    if (btn && window.tvEngine) window.tvEngine.focus(btn);
    this.bumpPlayerControls();
  }

  hidePlayerControls() {
    clearTimeout(this.playerControlsTimer);
    if (!this.playerLiveCh) return; // OTT keeps its controls
    this.playerControlsVisible = false;
    const c = this.playerContainer();
    if (c) c.classList.add("player-chrome-hidden");
    const btn = document.getElementById("btn-player-playpause");
    if (btn && window.tvEngine) window.tvEngine.focus(btn);
  }

  // Keep the controls up while the viewer is using them; hide after 6s idle
  bumpPlayerControls() {
    clearTimeout(this.playerControlsTimer);
    if (!this.playerLiveCh) return;
    this.playerControlsTimer = setTimeout(() => {
      if (this.currentScreen === "player-modal" && !this.playerOverlay) this.hidePlayerControls();
    }, 6000);
  }

  showPlayerKeyHint() {
    const hint = document.getElementById("player-key-hint");
    if (!hint) return;
    hint.hidden = false;
    this.restartAnimation(hint, "pl-hint-in");
    clearTimeout(this.playerHintTimer);
    this.playerHintTimer = setTimeout(() => this.hidePlayerKeyHint(), 5000);
  }

  hidePlayerKeyHint() {
    clearTimeout(this.playerHintTimer);
    const hint = document.getElementById("player-key-hint");
    if (hint) hint.hidden = true;
  }

  playerToast(text) {
    const t = document.getElementById("player-toast");
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    this.restartAnimation(t, "pl-toast-in");
    clearTimeout(this.playerToastTimer);
    this.playerToastTimer = setTimeout(() => { t.hidden = true; }, 1800);
  }

  // Reset Pause / Audio / Subtitles for a newly opened or tuned stream
  resetPlayerState(ch) {
    this.setPlayerPaused(false, true);
    const lang = (ch && ch.language) || "Bengali";
    this.playerAudioOptions = [...new Set([lang, "Hindi", "English"])];
    this.playerAudioIndex = 0;
    const audioBtn = document.getElementById("btn-player-audio");
    if (audioBtn) audioBtn.textContent = `Audio: ${this.playerAudioOptions[0]}`;
    this.playerSubOptions = ["Off", ...new Set(["English", lang])];
    if (this.playerSubIndex == null || this.playerSubIndex >= this.playerSubOptions.length) this.playerSubIndex = 0;
    this.applyPlayerSubtitles();
  }

  setPlayerPaused(paused, silent = false) {
    this.playerPaused = paused;
    const c = this.playerContainer();
    if (c) c.classList.toggle("player-is-paused", paused);
    const btn = document.getElementById("btn-player-playpause");
    if (btn) btn.textContent = paused ? "▶ Play" : "⏸ Pause";
    if (!silent) this.playerToast(paused ? "Paused" : (this.playerLiveCh ? "Back to live" : "Playing"));
  }

  cyclePlayerAudio() {
    const opts = this.playerAudioOptions || ["Bengali", "Hindi", "English"];
    this.playerAudioIndex = ((this.playerAudioIndex || 0) + 1) % opts.length;
    const lang = opts[this.playerAudioIndex];
    const btn = document.getElementById("btn-player-audio");
    if (btn) btn.textContent = `Audio: ${lang}`;
    this.playerToast(`Audio: ${lang}`);
  }

  cyclePlayerSubtitles() {
    const opts = this.playerSubOptions || ["Off", "English"];
    this.playerSubIndex = ((this.playerSubIndex || 0) + 1) % opts.length;
    this.applyPlayerSubtitles();
    this.playerToast(`Subtitles: ${opts[this.playerSubIndex]}`);
  }

  applyPlayerSubtitles() {
    const opts = this.playerSubOptions || ["Off"];
    const choice = opts[this.playerSubIndex || 0] || "Off";
    const btn = document.getElementById("btn-player-subs");
    if (btn) btn.textContent = `Subtitles: ${choice}`;
    const line = document.getElementById("player-subtitle");
    if (!line) return;
    if (choice === "Off") { line.hidden = true; return; }
    const ch = this.playerLiveCh;
    const prog = ch ? this.liveProgramOf(ch) : null;
    line.textContent = ch ? this.programDesc(ch, prog) : "[ Music ]";
    line.hidden = false;
  }

  zapPlayerChannel(step) {
    const list = this.playerChannelList();
    if (!list.length) return;
    const cur = Number(this.playerLiveCh.lcn);
    let target;
    if (step > 0) target = list.find((c) => Number(c.lcn) > cur) || list[0];
    else target = [...list].reverse().find((c) => Number(c.lcn) < cur) || list[list.length - 1];
    if (!target || target === this.playerLiveCh) return;
    window.tvEngine && window.tvEngine.playBeep && window.tvEngine.playBeep("focus");
    this.switchPlayerLiveChannel(target, step);
  }

  programDesc(ch, p) {
    const DESC = {
      News: "Live coverage and sharp analysis of the day's top stories.",
      Entertainment: "Family drama, reality and the shows everyone is talking about.",
      Movies: "Back-to-back blockbusters, uncut and in HD.",
      Music: "Non-stop chart-toppers, classics and fresh releases.",
      Kids: "Cartoons, adventures and learning fun for young viewers.",
      Sports: "Live action, highlights and expert match analysis.",
      Devotional: "Prayers, bhajans and spiritual discourses through the day."
    };
    return (p && p.desc) || DESC[ch.genre] || `Live now on ${ch.name}.`;
  }

  // Programme picture: the channel's live photo with the show name over it
  playerPoster(ch, title, n = 0, cls = "") {
    const tints = ["rgba(30,64,175,0.45)", "rgba(190,24,93,0.42)", "rgba(202,138,4,0.42)", "rgba(15,118,110,0.45)"];
    const img = ch.liveVideoBg || ch.image;
    const bg = `linear-gradient(160deg, ${tints[n % tints.length]}, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.75))` +
               (img ? `, url('${img}') center / cover no-repeat` : "") + `, ${ch.logoColor || "#334155"}`;
    return `<div class="pl-poster ${cls}" style="background:${bg}"><span>${this.escapeHtml(title)}</span></div>`;
  }

  escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  openPlayerRail() {
    const rail = document.getElementById("player-rail");
    const row = document.getElementById("player-rail-row");
    if (!rail || !row) return;
    this.computeEpgTimes();
    const list = this.playerChannelList();
    const esc = (s) => this.escapeHtml(s);
    row.innerHTML = list.map((c, i) => {
      const p = this.liveProgramOf(c);
      return `
        <button class="pl-rail-item focusable" data-lcn="${esc(c.lcn)}">
          <div class="pl-rail-thumb">
            ${this.playerPoster(c, p.title || c.name, i)}
            <em class="pl-live">● LIVE</em>
            <small class="pl-lcn">${esc(c.lcn)}</small>
          </div>
          <div class="pl-rail-txt">
            <b>${esc(p.title || "Live Broadcast")}</b>
            <span>${esc(c.name)} &nbsp;|&nbsp; ${esc(c.genre || "")} &nbsp;|&nbsp; ${esc(p.timeRange || "")}</span>
            <p>${esc(this.programDesc(c, p))}</p>
          </div>
        </button>`;
    }).join("");
    row.querySelectorAll(".pl-rail-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ch = this.findGuideChannel(btn.getAttribute("data-lcn"));
        this.closePlayerOverlay();
        if (ch && ch !== this.playerLiveCh) this.switchPlayerLiveChannel(ch);
      });
    });
    this.showPlayerOverlay("rail", rail);
    const cur = row.querySelector(`.pl-rail-item[data-lcn="${this.playerLiveCh.lcn}"]`) || row.firstElementChild;
    if (cur && window.tvEngine) {
      // land on the current channel, centred, without a long scroll animation
      row.scrollLeft = Math.max(0, cur.offsetLeft - row.clientWidth / 2 + 280);
      window.tvEngine.focus(cur);
    }
  }

  openPlayerUpcoming() {
    const panel = document.getElementById("player-upnext");
    if (!panel) return;
    this.computeEpgTimes();
    const ch = this.playerLiveCh;
    const progs = ch.programs || [];
    const nowIdx = Math.max(0, progs.findIndex((p) => p.isLive));
    const now = progs[nowIdx] || this.liveProgramOf(ch);
    const next = progs.slice(nowIdx + 1, nowIdx + 5);
    const esc = (s) => this.escapeHtml(s);
    panel.innerHTML = `
      <div class="pl-up-bg" style="background-image:url('${esc(ch.liveVideoBg || ch.image || "")}')"></div>
      <div class="pl-up-inner">
        <button class="pl-up-head focusable" id="pl-up-close"><span>←</span> Upcoming Shows</button>
        <div class="pl-up-main">
          ${this.playerPoster(ch, now.title || ch.name, 0, "pl-poster-lg")}
          <div class="pl-up-txt">
            <div class="pl-up-badges"><em class="pl-live">● LIVE NOW</em><small>CH ${esc(ch.lcn)} · ${esc(ch.name)}</small></div>
            <b>${esc(now.title || "Live Broadcast")}</b>
            <span>${esc(now.timeRange || "")} &nbsp;•&nbsp; ${esc(ch.language || "")}</span>
            <span>${esc(ch.genre || "")}</span>
            <p>${esc(this.programDesc(ch, now))}</p>
          </div>
        </div>
        <div class="pl-up-label">Up next on ${esc(ch.name)}</div>
        <div class="pl-up-row">
          ${next.length ? next.map((p, n) => `
            <div class="pl-up-card">
              ${this.playerPoster(ch, "", n + 1)}
              <b>${esc(p.title)}</b>
              <span>${esc(p.timeRange || "")}</span>
            </div>`).join("") : `<div class="pl-up-empty">No more shows listed for today.</div>`}
        </div>
      </div>`;
    panel.querySelector("#pl-up-close").addEventListener("click", () => this.closePlayerOverlay());
    this.showPlayerOverlay("up", panel);
    window.tvEngine && window.tvEngine.focus(panel.querySelector("#pl-up-close"));
  }

  showPlayerOverlay(kind, el) {
    const container = document.querySelector("#screen-player-modal .player-container");
    if (this.playerOverlay !== kind) this.closePlayerOverlay(true);
    this.playerOverlay = kind;
    if (window.tvEngine) {
      if (!this.playerOverlayPrev) this.playerOverlayPrev = { scope: window.tvEngine.activeScope, focus: window.tvEngine.currentFocus };
      window.tvEngine.setScope("#" + el.id);
    }
    el.hidden = false;
    this.restartAnimation(el, "pl-overlay-in");
    if (container) container.classList.add("player-overlay-open", `player-overlay-${kind}`);
    const banner = document.getElementById("player-channel-banner");
    if (banner) banner.hidden = true;
  }

  closePlayerOverlay(silent = false) {
    const kind = this.playerOverlay;
    if (!kind) return;
    this.playerOverlay = null;
    ["player-rail", "player-upnext"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    const container = document.querySelector("#screen-player-modal .player-container");
    if (container) container.classList.remove("player-overlay-open", "player-overlay-rail", "player-overlay-up");
    const prev = this.playerOverlayPrev;
    this.playerOverlayPrev = null;
    if (!silent && prev && window.tvEngine) {
      window.tvEngine.setScope(prev.scope);
      const f = prev.focus && document.body.contains(prev.focus) ? prev.focus : document.getElementById("btn-player-playpause");
      if (f) window.tvEngine.focus(f);
    } else if (prev && window.tvEngine) {
      window.tvEngine.setScope(prev.scope);
    }
  }

  showPlayerChannelBanner(ch, prog) {
    const banner = document.getElementById("player-channel-banner");
    if (!banner) return;

    const lcnEl = document.getElementById("pcb-lcn");
    const nameEl = document.getElementById("pcb-name");
    const progEl = document.getElementById("pcb-prog");

    if (lcnEl) lcnEl.textContent = ch.lcn;
    if (nameEl) nameEl.textContent = ch.name;
    if (progEl) progEl.textContent = `${prog.title || "Live Broadcast"} • LIVE`;

    banner.hidden = false;
    this.restartAnimation(banner, "pcb-swap");
    clearTimeout(this.playerBannerTimer);
    this.playerBannerTimer = setTimeout(() => {
      banner.hidden = true;
    }, 3200);
  }

  renderLcnOsd() {
    const osd = document.getElementById("lcn-tune-osd");
    if (!osd) return;

    const digitsEl = document.getElementById("lcn-osd-digits");
    const statusEl = document.getElementById("lcn-osd-status");
    const nameEl = document.getElementById("lcn-osd-ch-name");
    const genreEl = document.getElementById("lcn-osd-ch-genre");
    const barEl = document.getElementById("lcn-osd-progress-bar");

    if (digitsEl) digitsEl.textContent = this.lcnBuffer;

    const ch = this.findLiveChannelByLcn(this.lcnBuffer);
    if (ch) {
      if (statusEl) {
        statusEl.textContent = "PRESS ENT OR WAIT";
        statusEl.className = "lcn-osd-status-pill status-matched";
      }
      if (nameEl) nameEl.textContent = ch.name;
      if (genreEl) {
        const prog = this.liveProgramOf(ch);
        genreEl.textContent = `${ch.genre || "Live TV"} • ${prog.title || "Live Broadcast"}`;
      }
      if (this.currentScreen === "epg") {
        this.previewEpgChannel(ch);
        const cell = document.querySelector(`.epg-ch-cell[data-ch-id="${ch.id}"], .epg-ch-cell[data-lcn="${ch.lcn}"]`);
        if (cell) cell.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      if (statusEl) {
        statusEl.textContent = "ENTERING LCN...";
        statusEl.className = "lcn-osd-status-pill";
      }
      if (nameEl) nameEl.textContent = "Live Channel";
      if (genreEl) genreEl.textContent = "Enter 3-digit Channel Number";
    }

    osd.hidden = false;

    if (barEl) {
      barEl.style.transition = "none";
      barEl.style.width = "100%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          barEl.style.transition = "width 1.35s linear";
          barEl.style.width = "0%";
        });
      });
    }
  }

  hideLcnOsd() {
    clearTimeout(this.lcnTimer);
    this.lcnTimer = null;
    this.lcnBuffer = "";
    const osd = document.getElementById("lcn-tune-osd");
    if (osd) osd.hidden = true;
  }

  showLcnNotFound(lcn) {
    const osd = document.getElementById("lcn-tune-osd");
    if (!osd) return;

    const digitsEl = document.getElementById("lcn-osd-digits");
    const statusEl = document.getElementById("lcn-osd-status");
    const nameEl = document.getElementById("lcn-osd-ch-name");
    const genreEl = document.getElementById("lcn-osd-ch-genre");
    const barEl = document.getElementById("lcn-osd-progress-bar");

    if (digitsEl) digitsEl.textContent = lcn;
    if (statusEl) {
      statusEl.textContent = "NOT FOUND";
      statusEl.className = "lcn-osd-status-pill status-error";
    }
    if (nameEl) nameEl.textContent = "Channel Not Found";
    if (genreEl) genreEl.textContent = "Please check the LCN number";
    if (barEl) barEl.style.width = "0%";

    osd.hidden = false;
    clearTimeout(this.lcnTimer);
    this.lcnTimer = setTimeout(() => {
      this.hideLcnOsd();
    }, 1800);
  }

  /* ----------------------------------------------------------
   * EVENT LISTENERS & CLOCK
   * ---------------------------------------------------------- */
  setupEventListeners() {
    // Navigation bar click (My Vibe, Home, Live on Vibe, Vibe OTT, Search, Profile, FAQ)
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-target");
        if (target === "subscription") {
          this.openSubscriptionStore();
        } else if (target === "home") {
          this.showScreen("home");
        } else if (target === "live-tv") {
          this.openWithReturn("epg");
        } else if (target === "vibe-ott") {
          this.openVibeOtt();
        } else if (target === "search") {
          this.openWithReturn("search");
        } else if (target === "profile") {
          if (!this.isLoggedIn) {
            this.openLoginModal();
            return;
          }
          // Open dedicated Account Profile screen (media_1794044408930_35954b42.jpg)
          this.renderAccountProfilePage();
          this.openWithReturn("profile-account", ".account-subs-tab.subs-catv");
        } else if (target === "help") {
          this.openWithReturn("help-modal");
        }
      });
    });

    // Content cards click
    document.addEventListener("click", (e) => {
      // Vibe OTT app tiles open the app, not the player
      const appCard = e.target.closest(".vott-app-card");
      if (appCard) {
        this.handleOttAppTile(appCard.getAttribute("data-app-id"));
        return;
      }

      const card = e.target.closest(".media-card, .channel-search-tile");
      if (card && !card.classList.contains("profile-circle-btn")) {
        const title = card.getAttribute("data-title") || "Live Broadcast";
        const subtitle = card.getAttribute("data-subtitle") || "VIBE PlayTop Magic Stream";
        const image = card.getAttribute("data-image") || "";
        const isLiveTV = card.getAttribute("data-live") === "true";
        const channelNumber = card.getAttribute("data-channel") || "335";
        const ott = card.getAttribute("data-ott") || "";
        const isFree = card.getAttribute("data-free") === "true";
        this.openPlayer({ title, subtitle, image, isLiveTV, channelNumber, ott, isFree });
      }

      // Live on Vibe: language / genre filter
      const trayItem = e.target.closest("#screen-epg .epg-tray-item[data-type]");
      if (trayItem) {
        this.applyEpgFilter(trayItem.getAttribute("data-type"), trayItem.getAttribute("data-val"));
        return;
      }

      // Live on Vibe: channel cell. First click previews it; clicking (or OK on)
      // the channel already in the preview opens it full screen.
      const chCell = e.target.closest("#screen-epg .epg-ch-cell[data-ch-id]");
      if (chCell) {
        const ch = VIBE_DATA.liveTvGuide.channels.find((c) => c.id === chCell.getAttribute("data-ch-id"));
        if (!ch) return;
        if (this.selectedLiveChannel && this.selectedLiveChannel.id === ch.id) {
          this.openEpgChannelFullScreen(ch);
        } else {
          this.previewEpgChannel(ch);
          window.tvEngine.focus(chCell, true);
        }
        return;
      }

      // EPG Program Block click
      const progBlock = e.target.closest(".epg-program-block");
      if (progBlock) {
        const chId = progBlock.getAttribute("data-ch-id");
        const title = progBlock.getAttribute("data-title");
        const ch = VIBE_DATA.liveTvGuide.channels.find(c => c.id === chId);
        this.openPlayer({
          title: ch ? ch.name : "Live Broadcast",
          subtitle: title,
          image: ch ? ch.liveVideoBg : "",
          isLiveTV: true,
          channelNumber: ch ? ch.lcn : "335"
        });
      }

      // Keyboard key clicked
      const keyBtn = e.target.closest(".key-tv-btn");
      if (keyBtn) {
        const char = keyBtn.getAttribute("data-char");
        this.handleVirtualKey(char);
      }

      // Search: language / genre filter chips and Vibe TV / Vibe OTT tabs
      const filterChip = e.target.closest("#screen-search .lang-pill-btn[data-filter]");
      if (filterChip) this.toggleSearchFilter(filterChip);
      const searchTab = e.target.closest(".search-tab");
      if (searchTab) this.setSearchTab(searchTab.getAttribute("data-search-tab"));
    });

    // Dynamic Tile Preview (Amazon Prime Style) & Collapsible Hero Banner on Home Screen & SITI OTT Screen
    document.addEventListener("tv-focus-change", (e) => {
      if (this.currentScreen !== "home") return;
      const el = e.detail && e.detail.element;
      if (!el) return;

      const isOtt = this.homeView === "ott";
      const card = el.closest(".media-card, .dw-banner");
      const heroBanner = isOtt ? document.getElementById("vott-hero") : document.querySelector("#home-main .hero-banner-section");
      const dynPreview = document.getElementById(isOtt ? "vott-dynamic-preview" : "home-dynamic-preview");
      const previewBar = document.getElementById(isOtt ? "vott-sticky-preview-bar" : "home-sticky-preview-bar");
      const mainScroll = document.getElementById(isOtt ? "vott-main" : "home-main");

      if (card && card.closest(".content-rail, .promo-rail, #vott-rails")) {
        // Focus is on ANY tile in ANY rail → collapse hero banner smoothly and show dynamic preview
        if (heroBanner && !heroBanner.classList.contains("hero-banner-collapsed")) {
          heroBanner.classList.add("hero-banner-collapsed");
          this.stopHeroCarousel();
          if (mainScroll) mainScroll.scrollTop = 0;
        }
        const entering = !!(previewBar && previewBar.hidden);
        if (previewBar) previewBar.hidden = false;
        if (dynPreview) dynPreview.hidden = false;
        this.updateDynamicTilePreview(card, entering);
      } else if (el.closest(".hero-banner-section") || el.closest("#vott-page-head") || (el.closest(".side-navigation") && !this.lastHomeContentFocus)) {
        // Focus moved back UP to hero banner or app back button → expand hero banner, hide preview
        if (heroBanner && heroBanner.classList.contains("hero-banner-collapsed")) {
          heroBanner.classList.remove("hero-banner-collapsed");
          this.replayHeroEntrance(heroBanner);
          this.startHeroCarousel();
        }
        if (previewBar) previewBar.hidden = true;
        if (dynPreview) dynPreview.hidden = true;
      }
    });

    // When on the top rail and user presses ArrowUp, smoothly re-expand the hero banner
    document.addEventListener("keydown", (e) => {
      if (this.currentScreen !== "home") return;
      if (e.key === "ArrowUp") {
        const cur = window.tvEngine ? window.tvEngine.currentFocus : null;
        const isOtt = this.homeView === "ott";
        const heroBanner = isOtt ? document.getElementById("vott-hero") : document.querySelector("#home-main .hero-banner-section");
        const topRailSelector = isOtt ? "#vott-rails .content-rail:first-of-type" : "#section-recently-watched, .content-rail:first-of-type";
        if (cur && cur.closest(topRailSelector) && heroBanner && heroBanner.classList.contains("hero-banner-collapsed")) {
          e.preventDefault();
          heroBanner.classList.remove("hero-banner-collapsed");
          this.replayHeroEntrance(heroBanner);
          const dynPreview = document.getElementById(isOtt ? "vott-dynamic-preview" : "home-dynamic-preview");
          const previewBar = document.getElementById(isOtt ? "vott-sticky-preview-bar" : "home-sticky-preview-bar");
          if (previewBar) previewBar.hidden = true;
          if (dynPreview) dynPreview.hidden = true;
          this.startHeroCarousel();
          const watchBtn = isOtt ? document.getElementById("vott-watch-now") : document.querySelector("#home-main .btn-watch-now");
          if (watchBtn) setTimeout(() => window.tvEngine.focus(watchBtn), 80);
        }
      }
    });

    // Remember the last card/button selected on Home or Vibe OTT (outside the left bar),
    // so Back from Search / Profile / Live on Vibe can return to it
    document.addEventListener("tv-focus-change", (e) => {
      const el = e.detail && e.detail.element;
      if (this.currentScreen === "home" && el && !el.closest(".side-navigation") && el.closest("#screen-home")) {
        this.lastHomeContentFocus = el;
      }
    });

    // Search: show the on-screen keyboard while the search bar or a key is selected
    document.addEventListener("tv-focus-change", (e) => {
      if (this.currentScreen !== "search") return;
      const el = e.detail && e.detail.element;
      this.setSearchKeyboard(!!(el && el.closest("#search-input-box, #tv-search-keyboard")));
    });
    // Mouse: clicking the search bar selects it (opens the keyboard);
    // clicking anywhere else on the Search page closes the keyboard
    document.addEventListener("click", (e) => {
      if (this.currentScreen !== "search") return;
      const bar = e.target.closest("#search-input-box");
      if (bar) {
        if (window.tvEngine.currentFocus !== bar) window.tvEngine.focus(bar);
        this.setSearchKeyboard(true);
      } else if (!e.target.closest("#tv-search-keyboard, #virtual-remote-widget")) {
        this.setSearchKeyboard(false);
      }
    });

    // Search: typing on a physical keyboard goes into the search box. Runs before the TV
    // engine's listener so letters (incl. W/A/S/D) type instead of navigating. Backspace
    // deletes while there is text; on an empty box it still works as Back.
    document.addEventListener("keydown", (e) => {
      if (this.currentScreen !== "search" || this.loginModalOpen) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const isChar = /^[a-zA-Z0-9]$/.test(e.key) || e.key === " ";
      const isDel = e.key === "Backspace" && this.searchQuery.length > 0;
      if (!isChar && !isDel) return;
      e.preventDefault();
      e.stopPropagation();
      this.handleVirtualKey(e.key === " " ? "SPACE" : isDel ? "BACKSPACE" : e.key.toLowerCase());
    }, true);

    // Global Live TV Channel Tuning by entering LCN numbers (0-9) via physical keyboard
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore when user is typing in search, login mobile/otp, or profile creation name
      if (this.currentScreen === "search") return;
      if (this.loginModalOpen && this.loginView === "mobile") return;
      if (this.currentScreen === "create-profile" && this.cp && this.cp.step === 0) return;
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;

      // Number key 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        this.handleLcnDigit(e.key);
        return;
      }

      // Enter key when LCN tuning is in progress
      if (e.key === "Enter" && this.lcnBuffer && this.lcnBuffer.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        this.confirmLcnTune();
        return;
      }

      // Backspace key when LCN tuning is in progress
      if (e.key === "Backspace" && this.lcnBuffer && this.lcnBuffer.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        this.handleLcnBackspace();
        return;
      }

      // Escape key cancels LCN tuning
      if (e.key === "Escape" && this.lcnBuffer && this.lcnBuffer.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        this.handleLcnClear();
        return;
      }
    }, true);

    // Dedicated Account Page buttons
    const btnGetSub = document.getElementById("btn-get-subscription");
    if (btnGetSub) {
      btnGetSub.addEventListener("click", () => {
        this.showScreen("subscription-modal", "#btn-sub-close");
      });
    }

    const btnSetLang = document.getElementById("btn-set-languages");
    if (btnSetLang) {
      btnSetLang.addEventListener("click", () => {
        this.openPreferencePicker("languages");
      });
    }

    const btnSetGenres = document.getElementById("btn-set-genres");
    if (btnSetGenres) {
      btnSetGenres.addEventListener("click", () => {
        this.openPreferencePicker("genres");
      });
    }

    const btnSavePrefModal = document.getElementById("btn-save-pref-modal");
    if (btnSavePrefModal) {
      btnSavePrefModal.addEventListener("click", () => {
        this.closePreferencePickerModal();
      });
    }

    // Live TV EPG Focus Tracking: update Top Meta & PiP Video, and auto-minimize/expand tray!
    document.addEventListener("tv-focus-change", (e) => {
      const el = e.detail.element;
      if (!el) return;

      if (el.closest(".epg-ch-cell, .epg-program-block")) {
        if (!this.isLiveTvTrayMinimized) {
          this.minimizeLiveTvTray();
        }

        // Moving onto a channel (or one of its programmes) previews it
        const chId = el.getAttribute("data-ch-id");
        if (chId) {
          const ch = VIBE_DATA.liveTvGuide.channels.find(c => c.id === chId);
          if (ch) {
            let program = null;
            if (el.classList.contains("epg-program-block")) {
              const title = el.getAttribute("data-title");
              program = ch.programs.find(prog => prog.title === title) || null;
            }
            this.previewEpgChannel(ch, program);
          }
        }
      }

      if (el.id === "epg-channels-header-label" || el.closest(".epg-filter-columns-tray")) {
        if (this.isLiveTvTrayMinimized) {
          this.expandLiveTvTray();
        }
      }
    });

    const chHeaderBtn = document.getElementById("epg-channels-header-label");
    if (chHeaderBtn) {
      chHeaderBtn.addEventListener("click", () => {
        if (this.isLiveTvTrayMinimized) {
          this.expandLiveTvTray();
        } else {
          this.minimizeLiveTvTray();
        }
      });
    }

    // Hero slide arrows & dots (mouse / touch)
    const heroPrev = document.querySelector(".hero-arrow-prev");
    const heroNext = document.querySelector(".hero-arrow-next");
    if (heroPrev) heroPrev.addEventListener("click", () => this.goToHeroSlide(this.currentHeroIndex - 1));
    if (heroNext) heroNext.addEventListener("click", () => this.goToHeroSlide(this.currentHeroIndex + 1));
    const heroDots = document.getElementById("hero-carousel-dots");
    if (heroDots) {
      heroDots.addEventListener("click", (e) => {
        const dot = e.target.closest(".hero-dot");
        if (dot) this.goToHeroSlide(Number(dot.dataset.slide));
      });
    }

    // Highlight the hero arrows while Watch Now has focus (hint that Left/Right changes slide)
    document.addEventListener("tv-focus-change", (e) => {
      const el = e.detail && e.detail.element;
      document.querySelectorAll(".hero-banner-section").forEach((hero) => {
        hero.classList.toggle("hero-active", !!(el && el.classList && el.classList.contains("btn-watch-now") && hero.contains(el)));
      });
    });

    // Vibe OTT banner: Watch Now, arrows and dots
    const vottWatch = document.getElementById("vott-watch-now");
    if (vottWatch) {
      vottWatch.addEventListener("click", () => {
        const s = this.ottPage.slides[this.vottIndex];
        this.openPlayer({ title: s.title, subtitle: s.ottPartner, image: s.bgImage, isLiveTV: false, ott: s.ottPartner });
      });
    }
    const vottAppBack = document.getElementById("btn-vott-app-back");
    if (vottAppBack) vottAppBack.addEventListener("click", () => this.closeOttApp());
    const vottPrev = document.getElementById("vott-arrow-prev");
    const vottNext = document.getElementById("vott-arrow-next");
    if (vottPrev) vottPrev.addEventListener("click", () => this.goToVottSlide(this.vottIndex - 1));
    if (vottNext) vottNext.addEventListener("click", () => this.goToVottSlide(this.vottIndex + 1));
    const vottDots = document.getElementById("vott-hero-dots");
    if (vottDots) {
      vottDots.addEventListener("click", (e) => {
        const dot = e.target.closest(".hero-dot");
        if (dot) this.goToVottSlide(Number(dot.dataset.slide));
      });
    }

    // Hero Watch Now
    const watchNowBtn = document.querySelector(".btn-watch-now");
    if (watchNowBtn) {
      watchNowBtn.addEventListener("click", () => {
        const currentSlide = VIBE_DATA.heroSlides[this.currentHeroIndex];
        this.openPlayer({
          title: currentSlide.title,
          subtitle: currentSlide.subtitle,
          image: currentSlide.bgImage,
          isLiveTV: currentSlide.badge.includes("LIVE"),
          ott: currentSlide.ottPartner
        });
      });
    }

    // Exit dialog
    const exitYes = document.getElementById("btn-exit-yes");
    const exitNo = document.getElementById("btn-exit-no");
    if (exitYes) {
      exitYes.addEventListener("click", () => {
        document.body.innerHTML = `
          <div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#0A0E1A;color:#FFFFFF;flex-direction:column;font-family:sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
              <span style="font-weight:900;font-size:2.5rem;color:#E51B24;">SITI</span>
            </div>
            <p style="color:#94A3B8;font-size:1.2rem;">Application closed. Press below to restart.</p>
            <button onclick="location.reload()" style="margin-top:20px;padding:12px 28px;background:#E51B24;color:#FFFFFF;border:none;border-radius:8px;font-weight:bold;font-size:1.1rem;cursor:pointer;">Relaunch SITI PlayTop Magic</button>
          </div>
        `;
      });
    }
    if (exitNo) {
      exitNo.addEventListener("click", () => {
        this.closeExitModal();
      });
    }

    // Channel Lock Modal buttons
    const lockBuyBtn = document.getElementById("btn-ch-lock-buy");
    const lockCancelBtn = document.getElementById("btn-ch-lock-cancel");
    if (lockBuyBtn) {
      lockBuyBtn.addEventListener("click", () => this.proceedFromChannelLock());
    }
    if (lockCancelBtn) {
      lockCancelBtn.addEventListener("click", () => this.closeChannelLockModal());
    }

    // Player close
    const playerCloseBtn = document.getElementById("btn-player-close");
    if (playerCloseBtn) {
      playerCloseBtn.addEventListener("click", () => {
        this.closePlayer();
      });
    }

    // Happy Diwali promo banner (Home + SITI OTT): OK / click plays the ad
    document.addEventListener("click", (e) => {
      if (e.target.closest(".dw-banner")) this.openDiwaliAd();
    });

    // Player buttons
    const playPauseBtn = document.getElementById("btn-player-playpause");
    if (playPauseBtn) playPauseBtn.addEventListener("click", () => { this.setPlayerPaused(!this.playerPaused); this.bumpPlayerControls(); });
    const audioBtn = document.getElementById("btn-player-audio");
    if (audioBtn) audioBtn.addEventListener("click", () => { this.cyclePlayerAudio(); this.bumpPlayerControls(); });
    const subsBtn = document.getElementById("btn-player-subs");
    if (subsBtn) subsBtn.addEventListener("click", () => { this.cyclePlayerSubtitles(); this.bumpPlayerControls(); });

    // Mouse: moving over / clicking the live picture brings the controls up
    const playerBox = document.querySelector("#screen-player-modal .player-container");
    if (playerBox) {
      const wake = () => {
        if (this.currentScreen !== "player-modal" || !this.playerLiveCh || this.playerOverlay) return;
        if (this.playerControlsVisible) this.bumpPlayerControls();
        else this.showPlayerControls();
      };
      playerBox.addEventListener("mousemove", wake);
      playerBox.addEventListener("click", wake);
    }

    // Modal close buttons
    const subClose = document.getElementById("btn-sub-close");
    if (subClose) subClose.addEventListener("click", () => this.closeDialogModal());
    const helpClose = document.getElementById("btn-help-close");
    if (helpClose) helpClose.addEventListener("click", () => this.closeDialogModal());
    // Remote guide replay: Help popup and Profile page
    ["btn-help-remote-guide", "btn-account-remote-help"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", () => window.remoteTutorial && window.remoteTutorial.open());
    });

    // Package store: "Show all packages" removes the OTT partner filter
    const showAllPkgs = document.getElementById("btn-sub-show-all");
    if (showAllPkgs) showAllPkgs.addEventListener("click", () => this.clearStoreFilter());

    // Top-left Back buttons on Profile, Search and Live on Vibe → Home
    ["btn-account-back", "btn-search-back", "btn-epg-back"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", () => this.goBackToReturnPoint());
    });
  }

  startClock() {
    const updateTime = () => {
      const clockEl = document.getElementById("header-live-clock");
      const epgClock = document.getElementById("livetv-clock-text");
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      if (clockEl) clockEl.textContent = timeStr;
      if (epgClock) epgClock.textContent = `Current Time : ${timeStr}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
}

// Initialize on DOM load
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    window.app = new VibePlayTopApp();
  });
} else {
  window.app = new VibePlayTopApp();
}
