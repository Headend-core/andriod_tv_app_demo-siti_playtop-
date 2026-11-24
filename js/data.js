/**
 * VIBE PlayTop Magic - Data Layer
 * Authentic Hybrid Cable DTH + Multi-OTT Smart TV Data
 */

const VIBE_DATA = {
  avatarOptions: [
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
  ],

  profiles: [
    {
      id: "profile-1",
      name: "Profile 1",
      avatarBg: "#E51B24",
      avatarImage: "profile%20icon/01_young_man_hoodie.png",
      accent: "#FF4D55",
      preferredLanguages: ["Bengali", "Hindi", "English"],
      preferredGenres: ["News", "Entertainment", "Movies", "Sports"]
    },
    {
      id: "profile-2",
      name: "Profile 2",
      avatarBg: "#0084FF",
      avatarImage: "profile%20icon/02_bengali_woman_saree.png",
      accent: "#38A1FF",
      preferredLanguages: ["Hindi", "English"],
      preferredGenres: ["Movies", "Music", "Web Series"]
    },
    {
      id: "profile-3",
      name: "Profile 3",
      avatarBg: "#8B5CF6",
      avatarImage: "profile%20icon/03_smiling_child.png",
      accent: "#A78BFA",
      preferredLanguages: ["Bengali", "English"],
      preferredGenres: ["Kids", "Animation", "Entertainment"]
    }
  ],

  heroSlides: [
    {
      id: "hero-1",
      title: "Cyberpunk Kolkata 2099",
      description: "Neon lights, rain-drenched tramways, and rogue neural augments. A gritty detective uncovers a syndicate controlling digital reincarnation.",
      badge: "EXCLUSIVE",
      ottPartner: "Hoichoi Special",
      bgImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "hero-2",
      title: "ICC Champions Trophy: IND vs NZ",
      description: "Watch the live stream of the Bhojpuri & Haryanvi Watchalong from the 2nd ODI between New Zealand and India with 4K UHD Feed.",
      badge: "LIVE CRICKET",
      ottPartner: "Prime Video",
      bgImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "hero-3",
      title: "Mirzapur: Reign of Blood",
      description: "The battle for Purvanchal reaches its boiling climax. Betrayals deepen, new alliances forge in blood, and the throne demands sacrifice.",
      badge: "TRENDING #1",
      ottPartner: "Prime Video",
      bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "hero-4",
      title: "Pathaan",
      description: "A rogue agent takes on a ruthless mercenary group in a globe-trotting spy thriller packed with high-octane action.",
      badge: "NEW ON VIBE",
      ottPartner: "Prime Video",
      bgImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "hero-5",
      title: "Panchayat: Season 3",
      description: "Abhishek returns to Phulera as village politics heat up and the upcoming panchayat election tests every friendship.",
      badge: "NEW SEASON",
      ottPartner: "Prime Video",
      bgImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "hero-6",
      title: "Feluda Pherot",
      description: "Bengal's sharpest sleuth is back. A string of cryptic letters pulls Feluda and Topshe into their most dangerous case yet.",
      badge: "EXCLUSIVE",
      ottPartner: "Hoichoi Special",
      bgImage: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "hero-7",
      title: "Rocket Boys",
      description: "The extraordinary true story of Homi J. Bhabha and Vikram Sarabhai, the visionaries who gave India its space and nuclear dreams.",
      badge: "CRITICS' PICK",
      ottPartner: "SonyLIV",
      bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "hero-8",
      title: "Scam 2003: The Telgi Story",
      description: "A fruit seller from Karnataka builds a fake stamp-paper empire worth thousands of crores, and shakes the entire nation.",
      badge: "TRENDING #2",
      ottPartner: "SonyLIV",
      bgImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1600&auto=format&fit=crop"
    },
    {
      id: "hero-9",
      title: "Amar Superstar Live",
      description: "Non-stop Bengali chartbusters, live performances and all-time hits, streaming 24x7 on SITI PlayTop Magic.",
      badge: "LIVE MUSIC",
      ottPartner: "SITI Live TV",
      bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop"
    }
  ],

  // RECENTLY WATCHED: only the Live TV entries (isLiveTV: true) are shown on Home
  recentlyWatched: [
    {
      id: "recent-1",
      title: "Star Plus HD",
      subtitle: "Anupamaa • Live Broadcast",
      isLiveTV: true,
      channelNumber: "115",
      lcn: "115",
      progress: 65,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "Entertainment"
    },
    {
      id: "recent-2",
      title: "R Bangla",
      subtitle: "R Bangla Live 100percent News",
      isLiveTV: true,
      channelNumber: "338",
      lcn: "338",
      progress: 60,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "News"
    },
    {
      id: "recent-3",
      title: "ABP Ananda",
      subtitle: "Dutor Duniya • Live Updates",
      isLiveTV: true,
      channelNumber: "335",
      lcn: "335",
      progress: 85,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "News"
    },
    {
      id: "recent-4",
      title: "Star Sports 1 HD",
      subtitle: "IND vs NZ • 2nd ODI Live",
      isLiveTV: true,
      channelNumber: "501",
      lcn: "501",
      progress: 40,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "Sports"
    },
    {
      id: "recent-5",
      title: "Zee Bangla",
      subtitle: "Mithai • Live Broadcast",
      isLiveTV: true,
      channelNumber: "135",
      lcn: "135",
      progress: 50,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "Entertainment"
    },
    {
      id: "recent-6",
      title: "Colors Bangla",
      subtitle: "Ramprasad • Live Broadcast",
      isLiveTV: true,
      channelNumber: "324",
      lcn: "324",
      progress: 70,
      timeLeft: "Live Broadcast",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
      ott: "LIVE TV",
      category: "Entertainment"
    }
  ],

  // LIVE ON NOW
  liveChannels: [
    {
      id: "live-1",
      channelNumber: "335",
      name: "ABP Ananda",
      nowPlaying: "Dutor Duniya • Top Headlines",
      time: "2:00 PM - 3:00 PM",
      progress: 55,
      genre: "News",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "live-2",
      channelNumber: "338",
      name: "R Bangla",
      nowPlaying: "R Bangla Live 100percent News",
      time: "2:00 PM - 2:30 PM",
      progress: 90,
      genre: "News",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "live-3",
      channelNumber: "320",
      name: "TV9 Bangla",
      nowPlaying: "FULL & FINAL • Debate Hour",
      time: "2:00 PM - 3:00 PM",
      progress: 50,
      genre: "News",
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "live-4",
      channelNumber: "410",
      name: "Sangeet Bangla",
      nowPlaying: "Amar Superstar • Non-stop Hits",
      time: "2:15 PM - 3:15 PM",
      progress: 30,
      genre: "Music",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "live-5",
      channelNumber: "415",
      name: "Dhoom Music",
      nowPlaying: "Teleshop & Bengali Hits",
      time: "2:00 PM - 3:00 PM",
      progress: 50,
      genre: "Music",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "live-6",
      channelNumber: "501",
      name: "Star Sports 1 HD",
      nowPlaying: "India vs New Zealand: 2nd ODI",
      time: "1:30 PM - 5:30 PM",
      progress: 35,
      genre: "Sports",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // ACCOUNT SERVICES (Profile page tabs) — demo customer
  // CONTACT US popup (Profile page → Contact us)
  contactInfo: {
    lcoCode: "1234",
    lcoName: "SN Cable",
    lcoPhone: "8888888888",
    vibePhone: "18001234001",
    vibeEmail: "customercare.kol@icncl.com"
  },

  accountServices: {
    catv: {
      vscNumber: "037588111111",
      packageName: "Package 2: SITI Bengali Mega",
      packagePrice: 199,
      expiry: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })()
    },
    broadband: { userId: "demo_sp", expiry: "2026-11-30" },
    ott: { expiry: "2026-11-30" }
  },

  // REGISTERED DEVICES (Manage Device popup)
  deviceLimit: 5,
  devices: [
    { id: "dev-1", name: "Living Room Smart TV", type: "Android TV", icon: "tv", lastActive: "Active now", current: true },
    { id: "dev-2", name: "Avijit's Phone", type: "Android Mobile", icon: "phone", lastActive: "Today, 11:42 AM" },
    { id: "dev-3", name: "Bedroom Fire TV Stick", type: "Fire TV", icon: "stick", lastActive: "Nov 04, 2026" }
  ],

  // FREE ON VIBE (square tiles on Home): free-to-air channels anyone can watch,
  // including guests who have not registered. 7 DD channels + 3 others.
  freeChannels: [
    { id: "fc-1", name: "DD National", lcn: "101", logo: "<b>DD</b><br>NATIONAL", fg: "#FFFFFF", bg: "linear-gradient(135deg,#E11D48,#7F1D1D)", nowPlaying: "Rangoli • Classic Hits" },
    { id: "fc-2", name: "DD News", lcn: "102", logo: "<b>DD</b><br>NEWS", fg: "#FFFFFF", bg: "linear-gradient(135deg,#B91C1C,#450A0A)", nowPlaying: "National Bulletin" },
    { id: "fc-3", name: "DD Bangla", lcn: "103", logo: "<b>DD</b><br>বাংলা", fg: "#FFFFFF", bg: "linear-gradient(135deg,#EA580C,#7C2D12)", nowPlaying: "Bangla Sangbad" },
    { id: "fc-4", name: "DD Sports", lcn: "104", logo: "<b>DD</b><br>SPORTS", fg: "#FFFFFF", bg: "linear-gradient(135deg,#16A34A,#14532D)", nowPlaying: "Live Kabaddi" },
    { id: "fc-5", name: "DD India", lcn: "105", logo: "<b>DD</b><br>INDIA", fg: "#FFFFFF", bg: "linear-gradient(135deg,#2563EB,#1E3A8A)", nowPlaying: "India Global" },
    { id: "fc-6", name: "DD Kisan", lcn: "106", logo: "<b>DD</b><br>KISAN", fg: "#FFFFFF", bg: "linear-gradient(135deg,#65A30D,#365314)", nowPlaying: "Krishi Darshan" },
    { id: "fc-7", name: "DD Bharati", lcn: "107", logo: "<b>DD</b><br>BHARATI", fg: "#FDE68A", bg: "linear-gradient(135deg,#9333EA,#3B0764)", nowPlaying: "Classical Music & Arts" },
    { id: "fc-8", name: "Sansad TV", lcn: "108", logo: "<b>SANSAD</b><br>TV", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0F766E,#042F2E)", nowPlaying: "Parliament Live" },
    { id: "fc-9", name: "Aastha", lcn: "109", logo: "<b>आस्था</b><br>AASTHA", fg: "#FFFFFF", bg: "linear-gradient(135deg,#D97706,#78350F)", nowPlaying: "Morning Aarti" },
    { id: "fc-10", name: "Zee Anmol Cinema", lcn: "110", logo: "<b>Z</b><br>ANMOL CINEMA", fg: "#FFFFFF", bg: "linear-gradient(135deg,#DB2777,#500724)", nowPlaying: "Superhit Movie" }
  ],

  // POPULAR CHANNELS (square logo tiles on Home)
  popularChannels: [
    { id: "pc-1", name: "ABP Ananda", lcn: "335", logo: "abp<br><b>আনন্দ</b>", fg: "#FFFFFF", bg: "linear-gradient(135deg,#C8102E,#7A0019)", nowPlaying: "Top Headlines" },
    { id: "pc-2", name: "Zee Bangla HD", lcn: "135", logo: "<b>Z</b> বাংলা", fg: "#FFFFFF", bg: "linear-gradient(135deg,#6D28D9,#2E1065)", nowPlaying: "Prime Time Serial" },
    { id: "pc-3", name: "Star Jalsha HD", lcn: "136", logo: "★<br><b>Star</b> জলসা", fg: "#FFFFFF", bg: "linear-gradient(135deg,#F97316,#9A3412)", nowPlaying: "Evening Drama" },
    { id: "pc-4", name: "Aaj Tak HD", lcn: "301", logo: "<b>आज तक</b><br>HD", fg: "#FFFFFF", bg: "linear-gradient(135deg,#DC2626,#1F2937)", nowPlaying: "Live News" },
    { id: "pc-5", name: "Star Gold HD", lcn: "405", logo: "★<br><b>STAR GOLD</b>", fg: "#FDE68A", bg: "linear-gradient(135deg,#B45309,#3B2106)", nowPlaying: "Superhit Movie" },
    { id: "pc-6", name: "TV9 Bangla", lcn: "320", logo: "<b>tv9</b><br>বাংলা", fg: "#FFFFFF", bg: "linear-gradient(135deg,#1D4ED8,#0B1F5C)", nowPlaying: "Breaking News" },
    { id: "pc-7", name: "Zee Cinema HD", lcn: "412", logo: "<b>Z</b> CINEMA", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0E7490,#082F49)", nowPlaying: "Action Blockbuster" },
    { id: "pc-8", name: "&pictures HD", lcn: "418", logo: "<b>&amp;</b>pictures", fg: "#FFFFFF", bg: "linear-gradient(135deg,#BE185D,#4A0D2B)", nowPlaying: "Weekend Premiere" },
    { id: "pc-9", name: "Colors Bangla", lcn: "324", logo: "<b>colors</b><br>বাংলা", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0891B2,#7C3AED)", nowPlaying: "Reality Show" },
    { id: "pc-10", name: "Star Sports 1 HD", lcn: "501", logo: "★<br><b>SPORTS 1</b>", fg: "#FFFFFF", bg: "linear-gradient(135deg,#15803D,#052E16)", nowPlaying: "Live Cricket" }
  ],

  // TRENDING ON OTT (portrait poster rail on Home)
  trendingOtt: [
    { id: "to-1", title: "Shadows of Shyambazar", genre: "Crime Thriller", ott: "Hoichoi", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-2", title: "The Last Tram", genre: "Drama", ott: "ZEE5", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-3", title: "Whispering Woods", genre: "Horror", ott: "Prime Video", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-4", title: "Coffee & Chaos", genre: "Comedy", ott: "JioHotstar", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-5", title: "Obsession", genre: "Romance / Thriller", ott: "Netflix", image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-6", title: "Neon Kolkata", genre: "Sci-Fi", ott: "Hoichoi", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-7", title: "Stage Fright", genre: "Musical Drama", ott: "SonyLIV", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-8", title: "Final Over", genre: "Sports Drama", ott: "JioHotstar", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=400&h=600&auto=format&fit=crop" },
    { id: "to-9", title: "The Gallery Heist", genre: "Heist", ott: "Prime Video", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&h=600&auto=format&fit=crop" }
  ],

  // VIBE OTT screen (left bar → Vibe OTT): banner slides + OTT app tiles.
  // Its landscape rows reuse trendingNow, popularSeries and blockbusterMovies below.
  vibeOtt: {
    heroSlides: [
      {
        id: "vott-hero-1",
        title: "Shadows of Shyambazar",
        description: "A retired cop is pulled back into the alleys of North Kolkata when a string of disappearances points to an old, unsolved case.",
        ottPartner: "Hoichoi Original",
        bgImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"
      },
      {
        id: "vott-hero-2",
        title: "Final Over",
        description: "One small-town team, one last season. A sports drama about second chances, played out over a single nail-biting final.",
        ottPartner: "JioHotstar Special",
        bgImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop"
      },
      {
        id: "vott-hero-3",
        title: "The Last Tram",
        description: "On the final night of an old tram route, strangers on board discover how their lives have quietly crossed for years.",
        ottPartner: "ZEE5 Premium",
        bgImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop"
      },
      {
        id: "vott-hero-4",
        title: "Stage Fright",
        description: "A gifted singer who freezes in front of crowds gets one shot at the biggest stage in the country.",
        ottPartner: "SonyLIV Exclusive",
        bgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop"
      }
    ],
    apps: [
      { id: "app-hotstar", lang: "Hindi", name: "Hotstar", logo: "<b>Hotstar</b>", bg: "linear-gradient(135deg,#0F4FD6,#0A1E5C)", fg: "#FFFFFF" },
      { id: "app-zee5", lang: "Hindi", name: "ZEE5", logo: "<b>ZEE5</b>", bg: "linear-gradient(135deg,#8B5CF6,#3B0764)", fg: "#FFFFFF" },
      { id: "app-sonyliv", lang: "Hindi", name: "SonyLIV", logo: "<b>Sony</b>LIV", bg: "linear-gradient(135deg,#F59E0B,#7C2D12)", fg: "#FFFFFF" },
      { id: "app-hoichoi", lang: "Bengali", name: "Hoichoi", logo: "<b>hoichoi</b>", bg: "linear-gradient(135deg,#E51B24,#5F0A0E)", fg: "#FFFFFF" },
      { id: "app-jiocinema", lang: "Hindi", name: "JioCinema", logo: "<b>Jio</b>Cinema", bg: "linear-gradient(135deg,#EC4899,#5B0B36)", fg: "#FFFFFF" },
      { id: "app-discovery", lang: "English", name: "Discovery+", logo: "<b>discovery</b>+", bg: "linear-gradient(135deg,#0084FF,#06264D)", fg: "#FFFFFF" },
      { id: "app-fancode", lang: "English", name: "Fancode", logo: "<b>FanCode</b>", bg: "linear-gradient(135deg,#F97316,#431407)", fg: "#FFFFFF" },
      { id: "app-chaupal", lang: "Punjabi", name: "Chaupal", logo: "<b>Chaupal</b>", bg: "linear-gradient(135deg,#10B981,#064E3B)", fg: "#FFFFFF" },
      { id: "app-sunnxt", lang: "Tamil", name: "Sun NXT", logo: "<b>SUN</b> NXT", bg: "linear-gradient(135deg,#EF4444,#450A0A)", fg: "#FFFFFF" },
      { id: "app-shemaroo", lang: "Hindi", name: "ShemarooMe", logo: "<b>Shemaroo</b>Me", bg: "linear-gradient(135deg,#14B8A6,#134E4A)", fg: "#FFFFFF" }
    ]
  },

  // OTT APP PAGES (Vibe OTT → app tile). Per app: [title, genre, "m" movie | "s" series, banner text].
  // The first 3 titles are the app page's banner slides; rows are built from all 8 in app.js.
  // Images come from imagePool (rotated per app).
  ottImagePool: [
    "photo-1509198397868-475647b2a1e5", "photo-1536440136628-849c177e76a1", "photo-1518709268805-4e9042af9f23",
    "photo-1485846234645-a62644f84728", "photo-1478760329108-5c3ed9d495a0", "photo-1451187580459-43490279c0fa",
    "photo-1511671782779-c97d3d27a1d4", "photo-1540747913346-19e32dc3e97e", "photo-1526304640581-d334cdbbf45e",
    "photo-1504711434969-e33886168f5c", "photo-1585829365295-ab7cd400c167", "photo-1517604931442-7e0c8ed2963c",
    "photo-1509281373149-e957c6296406"
  ],
  ottAppContent: {
    "app-hotstar": [
      ["Sky Strikers", "Sports Drama", "s", "A rookie fast bowler from a mill town fights his way into the national squad, one over at a time."],
      ["The Night Shift", "Medical Drama", "s", "Six doctors, one overcrowded city hospital, and the longest nights of their lives."],
      ["Desert Kings", "Action", "m", "Two rival smugglers are forced to cross the Thar together when a sandstorm buries the only road out."],
      ["Little Big Champions", "Family", "m"],
      ["Code Red Mumbai", "Thriller", "s"],
      ["Monsoon Wedding Diaries", "Romance", "s"],
      ["Galaxy Guardians Academy", "Animation", "m"],
      ["The Bowler", "Biopic", "m"]
    ],
    "app-zee5": [
      ["Village Vows", "Drama", "s", "A city-bred bride discovers that her new village has rules nobody wrote down — and secrets nobody talks about."],
      ["Mahal", "Horror", "m", "A family moves into an abandoned palace for a fresh start. The palace has other plans."],
      ["The Lawyer's Daughter", "Legal Drama", "s", "A young advocate takes on the one case her famous father refused to fight."],
      ["Bollywood Nights", "Musical", "m"],
      ["Chhota Cop", "Comedy", "m"],
      ["Grey Lines", "Crime", "s"],
      ["Rang De Bengal", "Romance", "m"],
      ["The Inspector Files", "Investigation", "s"]
    ],
    "app-sonyliv": [
      ["Market Wizards", "Finance Thriller", "s", "A small-time broker builds an empire on Dalal Street — until the numbers stop adding up."],
      ["Undercover Agent", "Spy", "s", "An intelligence officer living a double life has 72 hours to stop an attack she helped plan."],
      ["Classroom 12B", "Coming-of-age", "s", "Board exams, first love and one unforgettable final year at a Kanpur school."],
      ["Last Lap", "Sports", "m"],
      ["The Royal Chef", "Comedy", "m"],
      ["Signal Lost", "Sci-Fi", "m"],
      ["Ghost Town Radio", "Mystery", "s"],
      ["Kings of Kabaddi", "Sports Documentary", "m"]
    ],
    "app-hoichoi": [
      ["Kolkata Noir", "Detective", "s", "A private investigator works the rain-soaked lanes of North Kolkata, one strange case at a time."],
      ["Durga Puja Diaries", "Family", "m", "Five days, one sprawling family, and a pandal that refuses to come together."],
      ["Haunted Haveli", "Horror", "s", "Three friends spend a night in a zamindar's house that locals refuse to name."],
      ["Tram Line 5", "Drama", "m"],
      ["The Fish Market Murders", "Crime", "s"],
      ["Bonedi Bari", "Period Drama", "s"],
      ["Rosogolla Republic", "Comedy", "m"],
      ["Shabdo", "Thriller", "m"]
    ],
    "app-jiocinema": [
      ["Stadium Lights", "Sports", "s", "Behind the scenes with a franchise team chasing its first title in a decade."],
      ["Rock Band Reunion", "Musical", "m", "Twenty years after their breakup, a college band gets one more shot at the stage."],
      ["The Startup", "Drama", "s", "Four friends, one Bengaluru flat and an idea that might just be worth a billion."],
      ["Fast Lane", "Action", "m"],
      ["Island Escape", "Reality", "s"],
      ["Maa Ki Rasoi", "Family", "m"],
      ["Dark Waters", "Thriller", "s"],
      ["Laugh Out Loud", "Stand-up", "m"]
    ],
    "app-discovery": [
      ["Wild Sundarbans", "Wildlife", "s", "A year in the mangroves with the tigers, crocodiles and people who share the delta."],
      ["Mega Machines", "Engineering", "s", "The giant machines building India's bridges, tunnels and highways."],
      ["Himalayan Trails", "Travel", "m", "From Ladakh to Sikkim on foot: the high passes and the villages in between."],
      ["Ocean Giants", "Nature", "m"],
      ["Into the Volcano", "Science", "m"],
      ["Street Food India", "Food", "s"],
      ["Survival Island", "Adventure", "s"],
      ["Secrets of the Pyramids", "History", "m"]
    ],
    "app-fancode": [
      ["Cup Final Rewind", "Football", "m", "Every goal, save and twist from the greatest cup final of the decade."],
      ["Road to Glory", "Cricket Documentary", "s", "An unfancied state side's improbable run to the domestic title."],
      ["Fight Night", "Combat Sports", "m", "The biggest night in Indian MMA, from weigh-ins to the final bell."],
      ["Hoops City", "Basketball", "s"],
      ["Champion's Mindset", "Sports Documentary", "s"],
      ["Tennis Legends", "Tennis", "m"],
      ["Track Stars", "Athletics", "s"],
      ["Derby Day", "Football", "m"]
    ],
    "app-chaupal": [
      ["Pind Di Kudi", "Punjabi Drama", "m", "A girl from a small Punjab village sets out to run the family farm her own way."],
      ["Haryana Heroes", "Action", "m", "Three wrestlers stand up to the land mafia threatening their village akhada."],
      ["Tractor Wala", "Comedy", "s", "One tractor, two feuding brothers and a whole village caught in between."],
      ["Lohri Nights", "Musical", "m"],
      ["Sarpanch Sahab", "Political Drama", "s"],
      ["Bhangra Battle", "Dance", "s"],
      ["Kheti Kahaniyan", "Family", "s"],
      ["Desi Cowboys", "Western", "m"]
    ],
    "app-sunnxt": [
      ["Temple Town", "Mystery", "s", "Priceless idols vanish from a temple town, and the only witness is a ten-year-old."],
      ["Hyderabad Heist", "Heist", "m", "A crew of strangers plans to rob the city's most guarded jewellery vault on Diwali night."],
      ["Kerala Backwaters", "Romance", "m", "A houseboat captain and a city photographer, adrift for one monsoon week."],
      ["Chennai Route 7", "Action", "m"],
      ["The Big Return", "Mass Action", "m"],
      ["Coastal Cops", "Crime", "s"],
      ["Mallu Comedy Club", "Comedy", "s"],
      ["The Silk Weaver", "Drama", "s"]
    ],
    "app-shemaroo": [
      ["Golden Era Classics", "Classic Cinema", "m", "Restored favourites from the golden age of Hindi cinema, in full HD."],
      ["Ramayan Retold", "Mythology", "s", "The timeless epic, retold for a new generation."],
      ["Garba Nights", "Musical", "m", "Nine nights of Navratri, two rival dance troupes and one big final."],
      ["Comedy Ka Tadka", "Comedy", "s"],
      ["Old Delhi Tales", "Drama", "s"],
      ["Bhakti Sagar", "Devotional", "s"],
      ["Filmy Flashback", "Retro", "m"],
      ["Kids Story Time", "Kids", "s"]
    ]
  },

  // SEARCH: OTT title language. Titles use their app's `lang` (vibeOtt.apps) unless listed here;
  // `ottLangByService` covers services that have no Vibe OTT app page (Netflix, Prime Video, …).
  ottTitleLang: {
    "Rang De Bengal": "Bengali",
    "Kerala Backwaters": "Malayalam",
    "Hyderabad Heist": "Telugu",
    "Mallu Comedy Club": "Malayalam",
    "Garba Nights": "Gujarati",
    "Pind Di Kudi": "Punjabi",
    "Haryana Heroes": "Hindi",
    "Rock Band Reunion": "English",
    "Galaxy Guardians Academy": "English",
    "Shadows of Shyambazar": "Bengali",
    "Neon Kolkata": "Bengali",
    "The Last Tram": "Bengali"
  },
  ottLangByService: {
    "Hoichoi": "Bengali", "VIBE Magic": "Bengali", "Netflix": "Hindi", "Prime Video": "Hindi",
    "JioHotstar": "Hindi", "Hotstar": "Hindi", "SonyLIV": "Hindi", "ZEE5": "Hindi", "JioCinema": "Hindi"
  },

  // TRENDING NOW
  trendingNow: [
    {
      id: "trend-1",
      title: "Jawan: Extended Cut",
      genre: "Action / Masala",
      rating: "8.6",
      ott: "Netflix",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "trend-2",
      title: "Dawshom Awbotaar",
      genre: "Cop Universe / Thriller",
      rating: "8.8",
      ott: "Hoichoi",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "trend-3",
      title: "Panchayat: Season 3",
      genre: "Comedy / Drama",
      rating: "9.0",
      ott: "Prime Video",
      image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "trend-4",
      title: "Asur: Welcome to Darkness",
      genre: "Mythology / Crime",
      rating: "8.9",
      ott: "JioCinema",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "trend-5",
      title: "Byomkesh O Durgo Rahasya",
      genre: "Detective / Mystery",
      rating: "8.4",
      ott: "Hoichoi",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // BLOCKBUSTER MOVIES
  blockbusterMovies: [
    {
      id: "mov-1",
      title: "Chander Pahar",
      subtitle: "Adventure / Bengali Classic",
      rating: "8.7",
      ott: "Hoichoi",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "mov-2",
      title: "Pathaan",
      subtitle: "Spy Action / Hindi",
      rating: "8.2",
      ott: "Prime Video",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "mov-3",
      title: "Brahmāstra: Part One - Shiva",
      subtitle: "Fantasy / VFX Spectacle",
      rating: "8.1",
      ott: "Hotstar",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "mov-4",
      title: "Bong Connection",
      subtitle: "Drama / Musical",
      rating: "8.5",
      ott: "VIBE Magic",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // POPULAR WEB SERIES
  popularSeries: [
    {
      id: "ser-1",
      title: "Eken Babu: Season 6",
      subtitle: "Comedy Detective",
      rating: "8.9",
      ott: "Hoichoi",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "ser-2",
      title: "Rocket Boys",
      subtitle: "History / Biography",
      rating: "9.3",
      ott: "SonyLIV",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "ser-3",
      title: "Feluda Pherot",
      subtitle: "Srijit Mukherji Thriller",
      rating: "8.7",
      ott: "Hoichoi",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "ser-4",
      title: "Scam 2003",
      subtitle: "The Telgi Story",
      rating: "8.8",
      ott: "SonyLIV",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // 24x7 NEWS CHANNELS
  newsChannels: [
    {
      id: "news-1",
      title: "ABP Ananda",
      subtitle: "Kolkata & Bengal Top News",
      lcn: "335",
      ott: "LIVE TV",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "news-2",
      title: "R Bangla",
      subtitle: "R Bangla Live 100% News",
      lcn: "338",
      ott: "LIVE TV",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "news-3",
      title: "TV9 Bangla",
      subtitle: "Live Debates & Analysis",
      lcn: "320",
      ott: "LIVE TV",
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "news-4",
      title: "Calcutta News",
      subtitle: "City Headlines & Traffic",
      lcn: "342",
      ott: "LIVE TV",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=600&auto=format&fit=crop"
    }
  ],

  // VIBE PLAYTOP LIVE TV GUIDE MATRIX
  // Exactly matching photos: media_1794042433780_fb2b5940.jpg & media_1794043000956_f4dc0068.jpg
  liveTvGuide: {
    currentTime: "2:46 PM",
    languages: [
      { id: "lang-all", name: "All", count: "211 Channels" },
      { id: "lang-hindi", name: "Hindi", count: "82 Channels" },
      { id: "lang-bengali", name: "Bengali", count: "64 Channels" },
      { id: "lang-assamese", name: "Assamese", count: "18 Channels" },
      { id: "lang-bhojpuri", name: "Bhojpuri", count: "24 Channels" },
      { id: "lang-odia", name: "Odia", count: "16 Channels" },
      { id: "lang-english", name: "English", count: "35 Channels" }
    ],
    genres: [
      { id: "gen-all", name: "All", count: "211 Channels" },
      { id: "gen-ent", name: "Entertainment", count: "58 Channels" },
      { id: "gen-mov", name: "Movies", count: "42 Channels" },
      { id: "gen-mus", name: "Music", count: "26 Channels" },
      { id: "gen-news", name: "News", count: "50 Channels" },
      { id: "gen-kids", name: "Kids", count: "18 Channels" },
      { id: "gen-sports", name: "Sports", count: "22 Channels" }
    ],
    channels: [
      {
        id: "ch-sangeet",
        lcn: "410",
        name: "Sangeet Bangla",
        genre: "Music",
        language: "Bengali",
        logoColor: "#E51B24",
        logoText: "SB",
        liveVideoBg: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Amar Superstar",
            timeRange: "2:00 PM - 3:00 PM",
            span: 2,
            isLive: true,
            desc: "Non-stop top musical tracks from Bengali cinema classics to fresh contemporary hits."
          },
          {
            title: "SB All Time Hits",
            timeRange: "3:00 PM - 4:00 PM",
            span: 2,
            isLive: false,
            desc: "The greatest chartbusters of modern Bengal."
          }
        ]
      },
      {
        id: "ch-dhoom",
        lcn: "415",
        name: "Dhoom Music",
        genre: "Music",
        language: "Bengali",
        logoColor: "#D81B60",
        logoText: "DHOOM",
        liveVideoBg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Teleshop",
            timeRange: "2:00 PM - 2:45 PM",
            span: 1.5,
            isLive: true,
            desc: "Product demonstrations and consumer offers."
          },
          {
            title: "Teleshop",
            timeRange: "2:45 PM - 3:15 PM",
            span: 1,
            isLive: false,
            desc: "Daily essentials and consumer deals."
          },
          {
            title: "Mahaprabhu",
            timeRange: "3:15 PM - 4:00 PM",
            span: 1.5,
            isLive: false,
            desc: "Spiritual and devotional musical journey."
          }
        ]
      },
      {
        id: "ch-abp",
        lcn: "335",
        name: "ABP Ananda",
        genre: "News",
        language: "Bengali",
        logoColor: "#FFC107",
        logoText: "ABP",
        liveVideoBg: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Dutor Duniya",
            timeRange: "2:00 PM - 2:30 PM",
            span: 1,
            isLive: true,
            desc: "Stay informed with a quick global update! This report covers top regional stories, important events, and noteworthy incidents happening around Bengal and the world."
          },
          {
            title: "Abp On The Spot",
            timeRange: "2:30 PM - 3:00 PM",
            span: 1,
            isLive: false,
            desc: "Ground investigative journalism covering grassroots public issues across districts."
          },
          {
            title: "Abp On The Spot",
            timeRange: "3:00 PM - 3:30 PM",
            span: 1,
            isLive: false,
            desc: "Continuing direct ground reports."
          },
          {
            title: "Ananda Khabor",
            timeRange: "3:30 PM - 4:00 PM",
            span: 1,
            isLive: false,
            desc: "Midday news round-up and live breaking feeds."
          }
        ]
      },
      {
        id: "ch-tv9",
        lcn: "320",
        name: "TV9 Bangla",
        genre: "News",
        language: "Bengali",
        logoColor: "#0288D1",
        logoText: "TV9",
        liveVideoBg: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "FULL & FINAL",
            timeRange: "2:00 PM - 2:30 PM",
            span: 1,
            isLive: true,
            desc: "Heated afternoon political debate with panels representing all sides."
          },
          {
            title: "Dupurer Super Prime Time",
            timeRange: "2:30 PM - 3:30 PM",
            span: 2,
            isLive: false,
            desc: "Super Prime Time breaking stories from across Kolkata and Delhi."
          },
          {
            title: "Charte Challish",
            timeRange: "3:30 PM - 4:00 PM",
            span: 1,
            isLive: false,
            desc: "40 top news flashes in 20 minutes."
          }
        ]
      },
      {
        id: "ch-rbangla",
        lcn: "338",
        name: "R Bangla",
        genre: "News",
        language: "Bengali",
        logoColor: "#E51B24",
        logoText: "R.",
        liveVideoBg: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Fataak News",
            timeRange: "2:00 PM - 2:30 PM",
            span: 1,
            isLive: true,
            desc: "Fast, unfiltered, high-energy headline bulletin."
          },
          {
            title: "R Bangla Live 100percent News",
            timeRange: "2:30 PM - 3:30 PM",
            span: 2,
            isLive: false,
            desc: "The host sheds light on the top stories, recent updates, and latest happenings from the national and international front."
          },
          {
            title: "Fataak News",
            timeRange: "3:30 PM - 4:00 PM",
            span: 1,
            isLive: false,
            desc: "Non-stop fast pace news flashes."
          }
        ]
      },
      {
        id: "ch-rplus",
        lcn: "340",
        name: "R Plus",
        genre: "News",
        language: "Bengali",
        logoColor: "#C2185B",
        logoText: "R+",
        liveVideoBg: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Khobor Plus",
            timeRange: "2:00 PM - 2:45 PM",
            span: 1.5,
            isLive: true,
            desc: "Regional news coverage and cultural updates."
          },
          {
            title: "Top News + Khobor Plus",
            timeRange: "2:45 PM - 3:45 PM",
            span: 2,
            isLive: false,
            desc: "Key bulletins and weather reports."
          }
        ]
      },
      {
        id: "ch-calcutta",
        lcn: "342",
        name: "Calcutta News",
        genre: "News",
        language: "Bengali",
        logoColor: "#00ACC1",
        logoText: "CN",
        liveVideoBg: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800&auto=format&fit=crop",
        programs: [
          {
            title: "Calcutta Express",
            timeRange: "2:00 PM - 2:45 PM",
            span: 1.5,
            isLive: true,
            desc: "Direct express updates from Kolkata districts and suburban lines."
          },
          {
            title: "Jelar Convoy",
            timeRange: "2:45 PM - 3:45 PM",
            span: 2,
            isLive: false,
            desc: "District-by-district investigative focus."
          }
        ]
      }
    ]
  },

  // FREQUENTLY ASKED QUESTIONS (HELP ACCORDION)
  faqs: [
    {
      q: "How do I pair my Bluetooth Voice Remote?",
      a: "Press and hold the [Home] and [OK] buttons simultaneously for 5 seconds until the LED at the top of your remote flashes blue. Your TV will show 'Connected' on the screen."
    },
    {
      q: "How do I recharge my SITI PlayTop STB & OTT combo pack?",
      a: "You can recharge your account online via www.playtop.tv, through the SITI PlayTop mobile app, or directly via your Local Cable Operator (LCO). Bundled OTT subscriptions activate automatically upon successful recharge."
    },
    {
      q: "How do I switch audio language on Live TV channels?",
      a: "While watching any Live TV channel, press the Green button or Audio button on your TV remote to choose between Bengali, Hindi, English, and regional audio tracks."
    },
    {
      q: "How to set up Parental Control / Kids PIN?",
      a: "Select Profile in the left navigation menu > Edit Preferences > Set 4-digit Kids Lock PIN. This locks 18+ content and age-restricted broadcast channels."
    },
    {
      q: "Why is a channel showing 'No Signal' or 'Check RF Cable'?",
      a: "Ensure the coaxial cable from your dish/cable tap is firmly screwed into the RF IN socket at the rear of your SITI PlayTop STB. If signal does not return, reboot STB or contact SITI Support at 1800-123-4567."
    },
    {
      q: "What broadband speed is needed for 4K streaming?",
      a: "For seamless 4K Ultra HD video and Dolby Atmos audio without buffering, an internet speed of at least 25 Mbps is recommended."
    }
  ],

  // 8 SUBSCRIPTION PACKAGES (Reference: media_1794046816559_85d5339f.jpg)
  packages: [
    {
      id: "pkg-1",
      number: "Package 1",
      name: "SITI Starter Magic",
      price: 149,
      period: "/month",
      devices: "1 Device at a time",
      channelsCount: 185,
      ottCount: 4,
      tag: "Best Value",
      themeColor: "#3B82F6",
      desc: "Essential Bengali & Hindi entertainment with news, movies, and top regional OTTs.",
      ottApps: [
        { name: "Hoichoi", badge: "VIP Access", color: "#E51B24" },
        { name: "ZEE5", badge: "Premium", color: "#8B5CF6" },
        { name: "JioCinema", badge: "Included", color: "#EC4899" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" }
      ],
      categories: {
        "Entertainment": [
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z", color: "#000000" },
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "★", color: "#E51B24" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "●", color: "#FF6600" },
          { name: "Zee Bangla HD", ch: "135", lang: "Bengali", icon: "Z", color: "#000000" },
          { name: "Star Jalsha HD", ch: "131", lang: "Bengali", icon: "★", color: "#E51B24" }
        ],
        "Movies": [
          { name: "Zee Cinema HD", ch: "201", lang: "Hindi", icon: "🎬", color: "#FFD200" },
          { name: "Star Gold HD", ch: "205", lang: "Hindi", icon: "★", color: "#E51B24" },
          { name: "Jalsha Movies", ch: "215", lang: "Bengali", icon: "★", color: "#E51B24" },
          { name: "Colors Cineplex", ch: "209", lang: "Hindi", icon: "●", color: "#FF6600" }
        ],
        "Sports": [
          { name: "Star Sports 1", ch: "401", lang: "Hindi", icon: "🏏", color: "#0084FF" },
          { name: "Sports18 1", ch: "405", lang: "English", icon: "⚡", color: "#E51B24" }
        ],
        "Kids": [
          { name: "Cartoon Network", ch: "501", lang: "English", icon: "CN", color: "#000000" },
          { name: "Pogo", ch: "505", lang: "Hindi", icon: "P", color: "#10B981" }
        ],
        "News": [
          { name: "ABP Ananda", ch: "1360", lang: "Bengali", icon: "ABP", color: "#E51B24" },
          { name: "TV9 Bangla", ch: "1366", lang: "Bengali", icon: "TV9", color: "#0084FF" },
          { name: "Times Now", ch: "604", lang: "English", icon: "TN", color: "#E51B24" }
        ],
        "Knowledge & Lifestyle": [
          { name: "Discovery Channel", ch: "701", lang: "English", icon: "D", color: "#0084FF" }
        ],
        "Music": [
          { name: "Sangeet Bangla", ch: "815", lang: "Bengali", icon: "SB", color: "#E51B24" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "G", color: "#FFD200" },
          { name: "Sandesh News", ch: "1722", lang: "Hindi", icon: "SN", color: "#FF6600" },
          { name: "CNBC TV18", ch: "626", lang: "English", icon: "CNBC", color: "#0084FF" }
        ]
      }
    },
    {
      id: "pkg-2",
      number: "Package 2",
      name: "SITI Bengali Mega",
      price: 199,
      period: "/month",
      devices: "1 Device at a time",
      channelsCount: 319,
      ottCount: 8,
      tag: "Popular in Bengal",
      themeColor: "#E51B24",
      desc: "Full 319 TV channels plus 8 premium OTT platforms with Bengali and Hindi focus.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "Super Plan", color: "#0084FF" },
        { name: "SonyLIV", badge: "Premium", color: "#FF9900" },
        { name: "ZEE5", badge: "All Access", color: "#8B5CF6" },
        { name: "Hoichoi", badge: "1 Year VIP", color: "#E51B24" },
        { name: "JioCinema", badge: "Premium", color: "#EC4899" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Fancode", badge: "Live Sports", color: "#F59E0B" },
        { name: "Chaupal", badge: "Included", color: "#10B981" }
      ],
      categories: {
        "Entertainment": [
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" },
          { name: "&tv HD", ch: "137", lang: "Hindi", icon: "&tv HD", color: "#8B5CF6" },
          { name: "Investigation Discovery HD", ch: "155", lang: "English", icon: "ID HD", color: "#0F172A" },
          { name: "STAR BHARAT HD", ch: "121", lang: "Hindi", icon: "Star Bharat HD", color: "#0084FF" },
          { name: "EPIC Parivar", ch: "182", lang: "Hindi", icon: "EPIC", color: "#6366F1" },
          { name: "Salaam TV", ch: "1192", lang: "Hindi", icon: "Salaam", color: "#059669" },
          { name: "Raj Pariwar", ch: "857", lang: "Hindi", icon: "Raj", color: "#D97706" }
        ],
        "Movies": [
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Zee Cinema HD", ch: "203", lang: "Hindi", icon: "Zee Cinema", color: "#FFD200" },
          { name: "Colors Cineplex HD", ch: "205", lang: "Hindi", icon: "Cineplex", color: "#FF6600" },
          { name: "Jalsha Movies HD", ch: "207", lang: "Bengali", icon: "Jalsha Movies", color: "#E51B24" },
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" },
          { name: "Zee Bangla Cinema", ch: "213", lang: "Bengali", icon: "Z Cinema", color: "#D97706" },
          { name: "&pictures HD", ch: "217", lang: "Hindi", icon: "&pictures", color: "#4F46E5" },
          { name: "Star Gold 2", ch: "221", lang: "Hindi", icon: "Gold 2", color: "#B45309" }
        ],
        "Sports": [
          { name: "Star Sports 1 HD", ch: "401", lang: "English", icon: "SS1 HD", color: "#0284C7" },
          { name: "Star Sports 1 Hindi HD", ch: "403", lang: "Hindi", icon: "SS1 Hindi", color: "#0369A1" },
          { name: "Sports18 1 HD", ch: "405", lang: "English", icon: "Sports18", color: "#BE123C" },
          { name: "Sony Sports Ten 1 HD", ch: "407", lang: "English", icon: "Ten 1 HD", color: "#1D4ED8" },
          { name: "Sony Sports Ten 3 HD", ch: "409", lang: "Hindi", icon: "Ten 3 Hindi", color: "#1E40AF" }
        ],
        "Kids": [
          { name: "Cartoon Network HD", ch: "501", lang: "English", icon: "CN HD", color: "#0F172A" },
          { name: "Pogo", ch: "503", lang: "Hindi", icon: "POGO", color: "#10B981" },
          { name: "Nickelodeon HD", ch: "505", lang: "Hindi", icon: "Nick HD", color: "#EA580C" },
          { name: "Sonic", ch: "507", lang: "Hindi", icon: "Sonic", color: "#0284C7" },
          { name: "Disney Channel HD", ch: "509", lang: "English", icon: "Disney HD", color: "#2563EB" },
          { name: "Hungama", ch: "511", lang: "Hindi", icon: "Hungama", color: "#E11D48" },
          { name: "Sony YAY!", ch: "513", lang: "Hindi", icon: "Sony YAY", color: "#F59E0B" }
        ],
        "News": [
          { name: "ABP Ananda", ch: "1360", lang: "Bengali", icon: "ABP Ananda", color: "#DC2626" },
          { name: "TV9 Bangla", ch: "1366", lang: "Bengali", icon: "TV9 Bangla", color: "#2563EB" },
          { name: "R. Bangla", ch: "1368", lang: "Bengali", icon: "R. Bangla", color: "#991B1B" },
          { name: "News18 Bangla", ch: "1364", lang: "Bengali", icon: "News18", color: "#B91C1C" },
          { name: "Times Now HD", ch: "601", lang: "English", icon: "Times Now", color: "#E11D48" },
          { name: "Aaj Tak HD", ch: "603", lang: "Hindi", icon: "Aaj Tak", color: "#EF4444" },
          { name: "Zee 24 Ghanta", ch: "1362", lang: "Bengali", icon: "24 Ghanta", color: "#D97706" }
        ],
        "Knowledge & Lifestyle": [
          { name: "Discovery HD World", ch: "701", lang: "English", icon: "Discovery HD", color: "#0284C7" },
          { name: "National Geographic HD", ch: "703", lang: "English", icon: "Nat Geo HD", color: "#FBBF24" },
          { name: "Animal Planet HD", ch: "705", lang: "English", icon: "Animal Planet", color: "#059669" },
          { name: "TLC HD", ch: "707", lang: "English", icon: "TLC HD", color: "#EC4899" },
          { name: "History TV18 HD", ch: "709", lang: "English", icon: "History HD", color: "#B91C1C" },
          { name: "Nat Geo Wild HD", ch: "711", lang: "English", icon: "NatGeo Wild", color: "#F59E0B" },
          { name: "Fox Life", ch: "713", lang: "English", icon: "Fox Life", color: "#6366F1" },
          { name: "Travel XP HD", ch: "715", lang: "English", icon: "Travel XP", color: "#10B981" },
          { name: "Discovery Science", ch: "717", lang: "English", icon: "Science", color: "#06B6D4" }
        ],
        "Music": [
          { name: "Sangeet Bangla", ch: "801", lang: "Bengali", icon: "Sangeet Bangla", color: "#DC2626" },
          { name: "Dhoom Music", ch: "803", lang: "Bengali", icon: "Dhoom Music", color: "#9333EA" },
          { name: "MTV HD", ch: "805", lang: "Hindi", icon: "MTV HD", color: "#4F46E5" }
        ],
        "Free on SITI": [
          { name: "ABP Ananda", ch: "1360", lang: "Bengali", icon: "ABP Ananda", color: "#DC2626" },
          { name: "TV9 Gujarati", ch: "1720", lang: "Gujarati", icon: "TV9 Guj", color: "#2563EB" },
          { name: "TIMES NOW", ch: "604", lang: "English", icon: "TIMES NOW", color: "#E11D48" },
          { name: "Kalinga TV", ch: "1777", lang: "Odia", icon: "Kalinga TV", color: "#D97706" },
          { name: "Sandesh News", ch: "1722", lang: "Gujarati", icon: "Sandesh", color: "#DC2626" },
          { name: "Kanak News", ch: "1774", lang: "Odia", icon: "Kanak News", color: "#B91C1C" },
          { name: "tv13 Gujarati", ch: "1738", lang: "Gujarati", icon: "tv13", color: "#0284C7" },
          { name: "TV9 Bangla", ch: "1366", lang: "Bengali", icon: "TV9 Bangla", color: "#2563EB" },
          { name: "Argus News", ch: "1780", lang: "Odia", icon: "Argus News", color: "#EA580C" },
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" },
          { name: "ABP Majha", ch: "1255", lang: "Marathi", icon: "ABP Majha", color: "#DC2626" },
          { name: "VTV News", ch: "1729", lang: "Gujarati", icon: "VTV News", color: "#B91C1C" },
          { name: "CNBC TV18", ch: "626", lang: "English", icon: "CNBC TV18", color: "#0284C7" },
          { name: "TV9 Marathi", ch: "1257", lang: "Marathi", icon: "TV9 Marathi", color: "#2563EB" },
          { name: "ABP Asmita", ch: "1724", lang: "Gujarati", icon: "ABP Asmita", color: "#DC2626" },
          { name: "R. Bangla", ch: "1368", lang: "Bengali", icon: "R. Bangla", color: "#991B1B" },
          { name: "Saam TV", ch: "1258", lang: "Marathi", icon: "Saam TV", color: "#7C3AED" },
          { name: "GSTV", ch: "1732", lang: "Gujarati", icon: "GSTV", color: "#059669" }
        ]
      }
    },
    {
      id: "pkg-3",
      number: "Package 3",
      name: "SITI Hindi Dhamaka",
      price: 249,
      period: "/month",
      devices: "2 Devices at a time",
      channelsCount: 360,
      ottCount: 10,
      tag: "Trending Pack",
      themeColor: "#FF6600",
      desc: "Massive Hindi entertainment bouquet with live sports, top Hindi movies and 10 OTT apps.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "Super", color: "#0084FF" },
        { name: "SonyLIV", badge: "Premium", color: "#FF9900" },
        { name: "ZEE5", badge: "All Access", color: "#8B5CF6" },
        { name: "JioCinema", badge: "Premium", color: "#EC4899" },
        { name: "ShemarooMe", badge: "Classic", color: "#10B981" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Fancode", badge: "Sports", color: "#F59E0B" },
        { name: "Lionsgate Play", badge: "Movies", color: "#000000" },
        { name: "Chaupal", badge: "Included", color: "#10B981" },
        { name: "Sun NXT", badge: "South Block", color: "#EF4444" }
      ],
      categories: {
        "Entertainment": [
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" },
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "Sony Entertainment TV", ch: "125", lang: "Hindi", icon: "SET HD", color: "#0084FF" },
          { name: "STAR BHARAT HD", ch: "121", lang: "Hindi", icon: "Star Bharat HD", color: "#0084FF" }
        ],
        "Movies": [
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" },
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Zee Cinema HD", ch: "203", lang: "Hindi", icon: "Zee Cinema", color: "#FFD200" }
        ],
        "Sports": [
          { name: "Star Sports 1 Hindi HD", ch: "403", lang: "Hindi", icon: "SS1 Hindi", color: "#0369A1" },
          { name: "Sony Sports Ten 3 HD", ch: "409", lang: "Hindi", icon: "Ten 3 Hindi", color: "#1E40AF" },
          { name: "Sports18 1 HD", ch: "405", lang: "English", icon: "Sports18", color: "#BE123C" }
        ],
        "Kids": [
          { name: "Cartoon Network HD", ch: "501", lang: "English", icon: "CN HD", color: "#0F172A" },
          { name: "Pogo", ch: "503", lang: "Hindi", icon: "POGO", color: "#10B981" },
          { name: "Nickelodeon HD", ch: "505", lang: "Hindi", icon: "Nick HD", color: "#EA580C" }
        ],
        "News": [
          { name: "Aaj Tak HD", ch: "603", lang: "Hindi", icon: "Aaj Tak", color: "#EF4444" },
          { name: "Zee News HD", ch: "607", lang: "Hindi", icon: "Zee News", color: "#D97706" },
          { name: "ABP News HD", ch: "609", lang: "Hindi", icon: "ABP News", color: "#DC2626" }
        ],
        "Knowledge & Lifestyle": [
          { name: "Discovery HD World", ch: "701", lang: "English", icon: "Discovery HD", color: "#0284C7" },
          { name: "National Geographic HD", ch: "703", lang: "English", icon: "Nat Geo HD", color: "#FBBF24" }
        ],
        "Music": [
          { name: "MTV HD", ch: "805", lang: "Hindi", icon: "MTV HD", color: "#4F46E5" },
          { name: "9XM", ch: "809", lang: "Hindi", icon: "9XM", color: "#EA580C" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" },
          { name: "CNBC Awaaz", ch: "628", lang: "Hindi", icon: "Awaaz", color: "#0284C7" }
        ]
      }
    },
    {
      id: "pkg-4",
      number: "Package 4",
      name: "SITI Sports Combo",
      price: 299,
      period: "/month",
      devices: "2 Devices at a time",
      channelsCount: 385,
      ottCount: 10,
      tag: "Live Cricket & Football",
      themeColor: "#10B981",
      desc: "Dedicated to sports fans: all Star Sports, Sony Sports, Sports18 channels with 10 bundled OTTs.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "Live Cricket", color: "#0084FF" },
        { name: "SonyLIV", badge: "Champions League", color: "#FF9900" },
        { name: "Fancode", badge: "Exclusive Passes", color: "#F59E0B" },
        { name: "JioCinema", badge: "IPL & ISL", color: "#EC4899" },
        { name: "ZEE5", badge: "Included", color: "#8B5CF6" },
        { name: "Hoichoi", badge: "Bengali", color: "#E51B24" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Lionsgate Play", badge: "Included", color: "#000000" },
        { name: "Chaupal", badge: "Included", color: "#10B981" },
        { name: "ShemarooMe", badge: "Included", color: "#10B981" }
      ],
      categories: {
        "Sports": [
          { name: "Star Sports 1 HD", ch: "401", lang: "English", icon: "SS1 HD", color: "#0284C7" },
          { name: "Star Sports 1 Hindi HD", ch: "403", lang: "Hindi", icon: "SS1 Hindi", color: "#0369A1" },
          { name: "Star Sports Select 1 HD", ch: "411", lang: "English", icon: "Select 1", color: "#075985" },
          { name: "Sony Sports Ten 1 HD", ch: "407", lang: "English", icon: "Ten 1 HD", color: "#1D4ED8" },
          { name: "Sony Sports Ten 2 HD", ch: "408", lang: "English", icon: "Ten 2 HD", color: "#1E40AF" },
          { name: "Sony Sports Ten 5 HD", ch: "410", lang: "English", icon: "Ten 5 HD", color: "#1E3A8A" },
          { name: "Sports18 1 HD", ch: "405", lang: "English", icon: "Sports18", color: "#BE123C" },
          { name: "Eurosport HD", ch: "415", lang: "English", icon: "Eurosport", color: "#15803D" }
        ],
        "Entertainment": [
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" }
        ],
        "Movies": [
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" }
        ],
        "News": [
          { name: "Times Now HD", ch: "601", lang: "English", icon: "Times Now", color: "#E11D48" },
          { name: "Aaj Tak HD", ch: "603", lang: "Hindi", icon: "Aaj Tak", color: "#EF4444" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" }
        ]
      }
    },
    {
      id: "pkg-5",
      number: "Package 5",
      name: "SITI Cinema Plus",
      price: 349,
      period: "/month",
      devices: "2 Devices at a time",
      channelsCount: 410,
      ottCount: 12,
      tag: "Movie Lovers",
      themeColor: "#8B5CF6",
      desc: "For movie buffs: unlimited Bollywood, Hollywood, and Tollywood hits with 12 top OTT streaming apps.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "4K Movies", color: "#0084FF" },
        { name: "SonyLIV", badge: "Blockbusters", color: "#FF9900" },
        { name: "ZEE5", badge: "Originals", color: "#8B5CF6" },
        { name: "Lionsgate Play", badge: "Hollywood Hits", color: "#000000" },
        { name: "Hoichoi", badge: "Bengali World", color: "#E51B24" },
        { name: "JioCinema", badge: "Premium", color: "#EC4899" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Sun NXT", badge: "South Block", color: "#EF4444" },
        { name: "ShemarooMe", badge: "Included", color: "#10B981" },
        { name: "Chaupal", badge: "Included", color: "#10B981" },
        { name: "Fancode", badge: "Included", color: "#F59E0B" },
        { name: "Eros Now", badge: "Bollywood", color: "#DC2626" }
      ],
      categories: {
        "Movies": [
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Star Gold Select HD", ch: "202", lang: "Hindi", icon: "Gold Select", color: "#B45309" },
          { name: "Zee Cinema HD", ch: "203", lang: "Hindi", icon: "Zee Cinema", color: "#FFD200" },
          { name: "&pictures HD", ch: "217", lang: "Hindi", icon: "&pictures", color: "#4F46E5" },
          { name: "Colors Cineplex HD", ch: "205", lang: "Hindi", icon: "Cineplex", color: "#FF6600" },
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" },
          { name: "&flix HD", ch: "225", lang: "English", icon: "&flix", color: "#7C3AED" },
          { name: "Star Movies HD", ch: "229", lang: "English", icon: "Star Movies", color: "#DC2626" }
        ],
        "Entertainment": [
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" }
        ],
        "Sports": [
          { name: "Star Sports 1 HD", ch: "401", lang: "English", icon: "SS1 HD", color: "#0284C7" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" }
        ]
      }
    },
    {
      id: "pkg-6",
      number: "Package 6",
      name: "SITI Gold Entertainment",
      price: 399,
      period: "/month",
      devices: "3 Devices at a time",
      channelsCount: 450,
      ottCount: 14,
      tag: "All Channels Unlocked",
      themeColor: "#FFD200",
      desc: "Complete family entertainment bouquet with HD feeds for all major networks and 14 premium OTT apps.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "Super 4K", color: "#0084FF" },
        { name: "SonyLIV", badge: "Premium", color: "#FF9900" },
        { name: "ZEE5", badge: "All Access", color: "#8B5CF6" },
        { name: "Hoichoi", badge: "1 Year VIP", color: "#E51B24" },
        { name: "JioCinema", badge: "Premium", color: "#EC4899" },
        { name: "Lionsgate Play", badge: "Hollywood", color: "#000000" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Sun NXT", badge: "Included", color: "#EF4444" },
        { name: "Fancode", badge: "Live Sports", color: "#F59E0B" },
        { name: "Chaupal", badge: "Regional", color: "#10B981" },
        { name: "ShemarooMe", badge: "Included", color: "#10B981" },
        { name: "Eros Now", badge: "Included", color: "#DC2626" },
        { name: "EPIC ON", badge: "Docu", color: "#6366F1" },
        { name: "Docubay", badge: "Global", color: "#0284C7" }
      ],
      categories: {
        "Entertainment": [
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" },
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "Sony Entertainment TV", ch: "125", lang: "Hindi", icon: "SET HD", color: "#0084FF" }
        ],
        "Movies": [
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Zee Cinema HD", ch: "203", lang: "Hindi", icon: "Zee Cinema", color: "#FFD200" },
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" }
        ],
        "Sports": [
          { name: "Star Sports 1 HD", ch: "401", lang: "English", icon: "SS1 HD", color: "#0284C7" },
          { name: "Sony Sports Ten 1 HD", ch: "407", lang: "English", icon: "Ten 1 HD", color: "#1D4ED8" }
        ],
        "Kids": [
          { name: "Cartoon Network HD", ch: "501", lang: "English", icon: "CN HD", color: "#0F172A" },
          { name: "Disney Channel HD", ch: "509", lang: "English", icon: "Disney HD", color: "#2563EB" }
        ],
        "Knowledge & Lifestyle": [
          { name: "Discovery HD World", ch: "701", lang: "English", icon: "Discovery HD", color: "#0284C7" },
          { name: "National Geographic HD", ch: "703", lang: "English", icon: "Nat Geo HD", color: "#FBBF24" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" }
        ]
      }
    },
    {
      id: "pkg-7",
      number: "Package 7",
      name: "SITI Family Magic",
      price: 449,
      period: "/month",
      devices: "4 Devices at a time",
      channelsCount: 490,
      ottCount: 16,
      tag: "Family Pack",
      themeColor: "#EC4899",
      desc: "Perfect household pack: 4 screens at once, all kids, education, devotional and movie channels + 16 OTTs.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "Family 4K", color: "#0084FF" },
        { name: "SonyLIV", badge: "Premium", color: "#FF9900" },
        { name: "ZEE5", badge: "All Access", color: "#8B5CF6" },
        { name: "Hoichoi", badge: "VIP Access", color: "#E51B24" },
        { name: "JioCinema", badge: "Premium", color: "#EC4899" },
        { name: "Lionsgate Play", badge: "Hollywood", color: "#000000" },
        { name: "Discovery+", badge: "Included", color: "#0084FF" },
        { name: "Sun NXT", badge: "Included", color: "#EF4444" },
        { name: "Fancode", badge: "Included", color: "#F59E0B" },
        { name: "Chaupal", badge: "Regional", color: "#10B981" },
        { name: "ShemarooMe", badge: "Included", color: "#10B981" },
        { name: "Eros Now", badge: "Included", color: "#DC2626" },
        { name: "EPIC ON", badge: "Docu", color: "#6366F1" },
        { name: "Docubay", badge: "Global", color: "#0284C7" },
        { name: "Planet Marathi", badge: "Regional", color: "#D97706" },
        { name: "Aha Video", badge: "South VIP", color: "#EA580C" }
      ],
      categories: {
        "Entertainment": [
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" }
        ],
        "Kids": [
          { name: "Cartoon Network HD", ch: "501", lang: "English", icon: "CN HD", color: "#0F172A" },
          { name: "Pogo", ch: "503", lang: "Hindi", icon: "POGO", color: "#10B981" },
          { name: "Disney Channel HD", ch: "509", lang: "English", icon: "Disney HD", color: "#2563EB" },
          { name: "Nickelodeon HD", ch: "505", lang: "Hindi", icon: "Nick HD", color: "#EA580C" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" }
        ]
      }
    },
    {
      id: "pkg-8",
      number: "Package 8",
      name: "SITI Ultra VIP 4K",
      price: 599,
      period: "/month",
      devices: "4 Devices at a time (4K HDR)",
      channelsCount: 550,
      ottCount: 20,
      tag: "Complete Freedom",
      themeColor: "#FFD200",
      desc: "The ultimate flagship experience: every single broadcast channel in 4K/FHD with 20+ OTT premium subscriptions.",
      ottApps: [
        { name: "Disney+ Hotstar", badge: "4K VIP", color: "#0084FF" },
        { name: "SonyLIV", badge: "Premium 4K", color: "#FF9900" },
        { name: "ZEE5", badge: "4K UHD", color: "#8B5CF6" },
        { name: "Hoichoi", badge: "All Bengali", color: "#E51B24" },
        { name: "JioCinema", badge: "Ultra HD", color: "#EC4899" },
        { name: "Lionsgate Play", badge: "Hollywood 4K", color: "#000000" },
        { name: "Discovery+", badge: "4K Nature", color: "#0084FF" },
        { name: "Sun NXT", badge: "4K South", color: "#EF4444" },
        { name: "Fancode", badge: "All Sports Tour", color: "#F59E0B" },
        { name: "Chaupal", badge: "Full Access", color: "#10B981" },
        { name: "ShemarooMe", badge: "Classic Gold", color: "#10B981" },
        { name: "Eros Now", badge: "Bollywood Platinum", color: "#DC2626" },
        { name: "EPIC ON", badge: "India Specials", color: "#6366F1" },
        { name: "Docubay", badge: "Global Docs", color: "#0284C7" },
        { name: "Planet Marathi", badge: "Marathi Hits", color: "#D97706" },
        { name: "Aha Video", badge: "Telugu & Tamil", color: "#EA580C" },
        { name: "ManoramaMAX", badge: "Malayalam", color: "#DC2626" },
        { name: "Tarang Plus", badge: "Odia Hits", color: "#2563EB" },
        { name: "Klikk", badge: "Bengali Series", color: "#059669" },
        { name: "Stage", badge: "Haryanvi & Rajasthani", color: "#B45309" }
      ],
      categories: {
        "Entertainment": [
          { name: "STAR Plus HD", ch: "115", lang: "Hindi", icon: "StarPlus HD", color: "#E51B24" },
          { name: "Zee TV HD", ch: "141", lang: "Hindi", icon: "Z TV HD", color: "#1E293B" },
          { name: "Colors HD", ch: "147", lang: "Hindi", icon: "colors HD", color: "#FF6600" },
          { name: "Sony Entertainment TV", ch: "125", lang: "Hindi", icon: "SET HD", color: "#0084FF" },
          { name: "Zee Bangla HD", ch: "135", lang: "Bengali", icon: "Z Bangla HD", color: "#D97706" }
        ],
        "Movies": [
          { name: "Star Gold HD", ch: "201", lang: "Hindi", icon: "Star Gold", color: "#E51B24" },
          { name: "Sony MAX HD", ch: "211", lang: "Hindi", icon: "MAX HD", color: "#E11D48" },
          { name: "Zee Cinema HD", ch: "203", lang: "Hindi", icon: "Zee Cinema", color: "#FFD200" },
          { name: "&flix HD", ch: "225", lang: "English", icon: "&flix", color: "#7C3AED" },
          { name: "Star Movies HD", ch: "229", lang: "English", icon: "Star Movies", color: "#DC2626" }
        ],
        "Sports": [
          { name: "Star Sports 1 HD", ch: "401", lang: "English", icon: "SS1 HD", color: "#0284C7" },
          { name: "Sony Sports Ten 1 HD", ch: "407", lang: "English", icon: "Ten 1 HD", color: "#1D4ED8" },
          { name: "Sports18 1 HD", ch: "405", lang: "English", icon: "Sports18", color: "#BE123C" }
        ],
        "Free on SITI": [
          { name: "Goldmines", ch: "375", lang: "Hindi", icon: "Goldmines", color: "#F59E0B" }
        ]
      }
    }
  ]
};

/* ------------------------------------------------------------------
 * LIVE ON VIBE: more channels so every language / genre filter has content.
 * Compact rows: [id, lcn, name, language, genre, badge, badgeColor, photo, [[programme, span], …]]
 * span = number of 30-minute slots; each channel fills the 2-hour guide (4 slots).
 * Programme times are worked out from the current time in app.js.
 * ------------------------------------------------------------------ */
(function addLiveTvChannels() {
  const guide = VIBE_DATA.liveTvGuide;
  const img = (id) => `https://images.unsplash.com/${id}?q=80&w=800&auto=format&fit=crop`;
  const DESC = {
    News: "Live coverage and sharp analysis of the day's top stories.",
    Entertainment: "Family drama, reality and the shows everyone is talking about.",
    Movies: "Back-to-back blockbusters, uncut and in HD.",
    Music: "Non-stop chart-toppers, classics and fresh releases.",
    Kids: "Cartoons, adventures and learning fun for young viewers.",
    Sports: "Live action, highlights and expert match analysis."
  };
  const rows = [
    ["ch-starplus", "115", "Star Plus HD", "Hindi", "Entertainment", "S+", "#E51B24", "photo-1517604931442-7e0c8ed2963c", [["Anupamaa", 1], ["Yeh Rishta Kya Kehlata Hai", 1], ["Ghum Hai Kisikey Pyaar Meiin", 2]]],
    ["ch-colors", "147", "Colors HD", "Hindi", "Entertainment", "CLR", "#FF6600", "photo-1478760329108-5c3ed9d495a0", [["Bigg Boss Unseen", 2], ["Laughter Chefs", 1], ["Naagin", 1]]],
    ["ch-zeebangla", "135", "Zee Bangla HD", "Bengali", "Entertainment", "ZB", "#6D28D9", "photo-1517604931442-7e0c8ed2963c", [["Didi No. 1", 2], ["Jagaddhatri", 1], ["Phulki", 1]]],
    ["ch-jalsha", "136", "Star Jalsha HD", "Bengali", "Entertainment", "SJ", "#F97316", "photo-1478760329108-5c3ed9d495a0", [["Anurager Chhowa", 1], ["Gaatchhora", 1], ["Kotha", 2]]],
    ["ch-jalshamovies", "425", "Jalsha Movies HD", "Bengali", "Movies", "JM", "#B45309", "photo-1536440136628-849c177e76a1", [["Bengali Blockbuster: Chander Pahar", 3], ["Coming Up Next", 1]]],
    ["ch-zeecinema", "412", "Zee Cinema HD", "Hindi", "Movies", "ZC", "#0E7490", "photo-1485846234645-a62644f84728", [["Gadar 2", 3], ["Cinema Trailers", 1]]],
    ["ch-sonymax", "420", "Sony Max HD", "Hindi", "Movies", "MAX", "#1D4ED8", "photo-1536440136628-849c177e76a1", [["Sooryavanshi", 2.5], ["Max Movie Club", 1.5]]],
    ["ch-moviesnow", "430", "Movies Now HD", "English", "Movies", "MN", "#7C3AED", "photo-1485846234645-a62644f84728", [["Hollywood Action Hour", 2], ["Weekend Premiere", 2]]],
    ["ch-bhojcinema", "470", "Bhojpuri Cinema", "Bhojpuri", "Movies", "BC", "#CA8A04", "photo-1536440136628-849c177e76a1", [["Nirahua Hindustani", 2.5], ["Bhojpuri Hit Gaane", 1.5]]],
    ["ch-anjan", "472", "Anjan TV", "Bhojpuri", "Entertainment", "ANJ", "#16A34A", "photo-1517604931442-7e0c8ed2963c", [["Gaon Ki Kahani", 1], ["Bhojpuri Comedy Express", 1], ["Lok Geet Sandhya", 2]]],
    ["ch-aajtak", "301", "Aaj Tak HD", "Hindi", "News", "AT", "#DC2626", "photo-1504711434969-e33886168f5c", [["Dopahar Aaj Tak", 1], ["Khabardar", 1], ["Halla Bol", 2]]],
    ["ch-ndtv", "360", "NDTV 24x7", "English", "News", "NDTV", "#B91C1C", "photo-1585829365295-ab7cd400c167", [["Left, Right & Centre", 1], ["The Big Fight", 2], ["Breaking Views", 1]]],
    ["ch-news18assam", "380", "News18 Assam", "Assamese", "News", "N18", "#DC2626", "photo-1504711434969-e33886168f5c", [["Batori Khobor", 1], ["Assam Live", 2], ["Ratir Khobor", 1]]],
    ["ch-rengoni", "382", "Rengoni", "Assamese", "Entertainment", "RNG", "#DB2777", "photo-1478760329108-5c3ed9d495a0", [["Bihu Utsav Special", 2], ["Pratidaan", 1], ["Rengoni Gaan", 1]]],
    ["ch-zeesarthak", "390", "Zee Sarthak", "Odia", "Entertainment", "ZS", "#9333EA", "photo-1517604931442-7e0c8ed2963c", [["Sindura Bindu", 1], ["Tame Mo Akhira Tara", 1], ["Sarthak Superstar", 2]]],
    ["ch-otv", "392", "OTV", "Odia", "News", "OTV", "#2563EB", "photo-1585829365295-ab7cd400c167", [["Odisha Live", 2], ["Khabar Odisha", 1], ["Prime Debate", 1]]],
    ["ch-9xm", "450", "9XM", "Hindi", "Music", "9XM", "#F59E0B", "photo-1470225620780-dba8ba36b745", [["Bollywood Non-Stop", 2], ["Bheje Fry Hits", 1], ["Top 10 Countdown", 1]]],
    ["ch-starsports1", "501", "Star Sports 1 HD", "English", "Sports", "SS1", "#15803D", "photo-1540747913346-19e32dc3e97e", [["Cricket Live: IND vs NZ", 3], ["Match Point Analysis", 1]]],
    ["ch-sony-ten", "505", "Sony Ten 1 HD", "English", "Sports", "TEN", "#0EA5E9", "photo-1540747913346-19e32dc3e97e", [["Football Highlights", 1], ["WWE Raw", 2], ["Tennis Grand Slam Review", 1]]],
    ["ch-sports18", "520", "Sports18 Khel", "Hindi", "Sports", "S18", "#0891B2", "photo-1540747913346-19e32dc3e97e", [["Pro Kabaddi Live", 2], ["Khel Charcha", 1], ["Hockey Live", 1]]],
    ["ch-cartoon", "701", "Cartoon Network", "English", "Kids", "CN", "#0F766E", "photo-1451187580459-43490279c0fa", [["Ben 10", 1], ["Tom & Jerry", 1], ["We Baby Bears", 2]]],
    ["ch-pogo", "705", "Pogo", "Hindi", "Kids", "POGO", "#F97316", "photo-1451187580459-43490279c0fa", [["Chhota Bheem", 2], ["Titoo", 1], ["Mighty Little Bheem", 1]]],
    ["ch-hungama", "710", "Hungama TV", "Hindi", "Kids", "HUN", "#EA580C", "photo-1451187580459-43490279c0fa", [["Doraemon", 2], ["Shin-chan", 1], ["Hagemaru", 1]]],
    ["ch-sonyaath", "712", "Sony Aath", "Bengali", "Kids", "AATH", "#2563EB", "photo-1451187580459-43490279c0fa", [["Gopal Bhar", 2], ["Bantul The Great", 2]]]
  ];
  const have = new Set(guide.channels.map((c) => c.id));
  rows.forEach(([id, lcn, name, language, genre, logoText, logoColor, photo, progs]) => {
    if (have.has(id)) return;
    guide.channels.push({
      id, lcn, name, language, genre, logoColor, logoText,
      liveVideoBg: img(photo),
      programs: progs.map(([title, span]) => ({ title, span, desc: DESC[genre] || "" }))
    });
  });

  // Every channel fills the full 2-hour guide: top up any short schedule
  guide.channels.forEach((ch) => {
    const total = ch.programs.reduce((sum, p) => sum + p.span, 0);
    if (total < 4) {
      ch.programs.push({ title: ch.genre === "News" ? "Headlines" : "Up Next", span: 4 - total, desc: DESC[ch.genre] || "" });
    }
  });
})();

/* ------------------------------------------------------------------
 * MORE HOME + SITI OTT CONTENT: longer rails so every row scrolls.
 * Items are appended to the lists above (originals untouched).
 * Channel tiles reuse Live TV guide LCNs where a guide channel exists,
 * so the tile, the player and the guide all agree.
 * ------------------------------------------------------------------ */
(function addMoreRailContent() {
  const D = VIBE_DATA;
  const img = (id, w = 600) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;
  const P = {
    crowd: "photo-1517604931442-7e0c8ed2963c", drama: "photo-1478760329108-5c3ed9d495a0",
    cinema: "photo-1536440136628-849c177e76a1", film: "photo-1485846234645-a62644f84728",
    dark: "photo-1509198397868-475647b2a1e5", forest: "photo-1518709268805-4e9042af9f23",
    space: "photo-1451187580459-43490279c0fa", music: "photo-1511671782779-c97d3d27a1d4",
    dj: "photo-1470225620780-dba8ba36b745", sport: "photo-1540747913346-19e32dc3e97e",
    heist: "photo-1526304640581-d334cdbbf45e", news: "photo-1504711434969-e33886168f5c",
    paper: "photo-1585829365295-ab7cd400c167", desk: "photo-1495020689067-958852a7765e",
    retro: "photo-1509281373149-e957c6296406"
  };
  const addUnique = (list, items, key) => {
    const have = new Set(list.map((x) => String(x[key])));
    items.forEach((x) => { if (!have.has(String(x[key]))) { list.push(x); have.add(String(x[key])); } });
  };

  // FREE ON SITI (free-to-air, LCN 111-123; 115 is Star Plus HD in the guide)
  addUnique(D.freeChannels, [
    { id: "fc-11", name: "DD Urdu", lcn: "111", logo: "<b>DD</b><br>URDU", fg: "#FFFFFF", bg: "linear-gradient(135deg,#059669,#064E3B)", nowPlaying: "Mushaira Night" },
    { id: "fc-12", name: "DD Punjabi", lcn: "112", logo: "<b>DD</b><br>PUNJABI", fg: "#FFFFFF", bg: "linear-gradient(135deg,#F59E0B,#78350F)", nowPlaying: "Punjabi Virsa" },
    { id: "fc-13", name: "DD Odia", lcn: "113", logo: "<b>DD</b><br>ODIA", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0EA5E9,#0C4A6E)", nowPlaying: "Odia Samachar" },
    { id: "fc-14", name: "DD Assam", lcn: "114", logo: "<b>DD</b><br>ASSAM", fg: "#FFFFFF", bg: "linear-gradient(135deg,#84CC16,#365314)", nowPlaying: "Bihu Special" },
    { id: "fc-15", name: "DD Sahyadri", lcn: "116", logo: "<b>DD</b><br>SAHYADRI", fg: "#FFFFFF", bg: "linear-gradient(135deg,#F43F5E,#881337)", nowPlaying: "Marathi Bulletin" },
    { id: "fc-16", name: "DD Girnar", lcn: "117", logo: "<b>DD</b><br>GIRNAR", fg: "#FFFFFF", bg: "linear-gradient(135deg,#A855F7,#4C1D95)", nowPlaying: "Gujarati Lok Dayro" },
    { id: "fc-17", name: "Dangal TV", lcn: "118", logo: "<b>DANGAL</b>", fg: "#FFFFFF", bg: "linear-gradient(135deg,#EF4444,#7F1D1D)", nowPlaying: "Family Serial Marathon" },
    { id: "fc-18", name: "Shemaroo TV", lcn: "119", logo: "<b>shemaroo</b><br>TV", fg: "#FFFFFF", bg: "linear-gradient(135deg,#14B8A6,#134E4A)", nowPlaying: "Classic Comedy" },
    { id: "fc-19", name: "Big Magic", lcn: "120", logo: "<b>BIG</b><br>MAGIC", fg: "#FDE68A", bg: "linear-gradient(135deg,#7C3AED,#2E1065)", nowPlaying: "Akbar Birbal" },
    { id: "fc-20", name: "B4U Movies", lcn: "121", logo: "<b>B4U</b><br>MOVIES", fg: "#FFFFFF", bg: "linear-gradient(135deg,#E11D48,#4C0519)", nowPlaying: "Superhit Action Movie" },
    { id: "fc-21", name: "Sony Pal", lcn: "122", logo: "<b>SONY</b><br>PAL", fg: "#FFFFFF", bg: "linear-gradient(135deg,#EC4899,#831843)", nowPlaying: "Mythology Hour" },
    { id: "fc-22", name: "Colors Rishtey", lcn: "123", logo: "<b>colors</b><br>RISHTEY", fg: "#FFFFFF", bg: "linear-gradient(135deg,#F97316,#7C2D12)", nowPlaying: "Rishton Ki Kahani" }
  ], "lcn");

  // POPULAR CHANNELS (all are Live TV guide channels)
  addUnique(D.popularChannels, [
    { id: "pc-11", name: "Star Plus HD", lcn: "115", logo: "★<br><b>STAR</b> PLUS", fg: "#FFFFFF", bg: "linear-gradient(135deg,#E51B24,#5F0A0E)", nowPlaying: "Anupamaa" },
    { id: "pc-12", name: "Colors HD", lcn: "147", logo: "<b>colors</b><br>HD", fg: "#FFFFFF", bg: "linear-gradient(135deg,#FF6600,#7C2D12)", nowPlaying: "Bigg Boss Unseen" },
    { id: "pc-13", name: "Sony Aath", lcn: "712", logo: "<b>SONY</b><br>আট", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0EA5E9,#0C4A6E)", nowPlaying: "Bengali Serials" },
    { id: "pc-14", name: "Sony Max HD", lcn: "420", logo: "<b>SONY</b><br>MAX", fg: "#FFFFFF", bg: "linear-gradient(135deg,#1D4ED8,#172554)", nowPlaying: "Sooryavanshi" },
    { id: "pc-15", name: "Jalsha Movies HD", lcn: "425", logo: "<b>Jalsha</b><br>MOVIES", fg: "#FDE68A", bg: "linear-gradient(135deg,#B45309,#451A03)", nowPlaying: "Chander Pahar" },
    { id: "pc-16", name: "Movies Now HD", lcn: "430", logo: "<b>MOVIES</b><br>NOW", fg: "#FFFFFF", bg: "linear-gradient(135deg,#7C3AED,#3B0764)", nowPlaying: "Hollywood Action Hour" },
    { id: "pc-17", name: "NDTV 24x7", lcn: "360", logo: "<b>NDTV</b><br>24x7", fg: "#FFFFFF", bg: "linear-gradient(135deg,#B91C1C,#1F2937)", nowPlaying: "The Big Fight" },
    { id: "pc-18", name: "9XM", lcn: "450", logo: "<b>9XM</b>", fg: "#111827", bg: "linear-gradient(135deg,#FACC15,#F59E0B)", nowPlaying: "Bollywood Non-Stop" },
    { id: "pc-19", name: "Sony Ten 1 HD", lcn: "505", logo: "<b>TEN</b> 1<br>HD", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0EA5E9,#082F49)", nowPlaying: "WWE Raw" },
    { id: "pc-20", name: "Sports18 Khel", lcn: "520", logo: "<b>SPORTS18</b><br>KHEL", fg: "#FFFFFF", bg: "linear-gradient(135deg,#0891B2,#164E63)", nowPlaying: "Pro Kabaddi Live" },
    { id: "pc-21", name: "Cartoon Network", lcn: "701", logo: "<b>C</b>|<b>N</b>", fg: "#FFFFFF", bg: "linear-gradient(135deg,#111827,#0F766E)", nowPlaying: "Ben 10" },
    { id: "pc-22", name: "Pogo", lcn: "705", logo: "<b>POGO</b>", fg: "#FFFFFF", bg: "linear-gradient(135deg,#F97316,#BE185D)", nowPlaying: "Chhota Bheem" }
  ], "lcn");

  // LIVE ON NOW (guide channels, programme matches the guide)
  addUnique(D.liveChannels, [
    { id: "live-7", channelNumber: "115", name: "Star Plus HD", nowPlaying: "Anupamaa • New Episode", time: "2:00 PM - 2:30 PM", progress: 62, genre: "Entertainment", image: img(P.crowd) },
    { id: "live-8", channelNumber: "135", name: "Zee Bangla HD", nowPlaying: "Didi No. 1 • Grand Finale", time: "2:00 PM - 3:00 PM", progress: 40, genre: "Entertainment", image: img(P.drama) },
    { id: "live-9", channelNumber: "147", name: "Colors HD", nowPlaying: "Bigg Boss Unseen", time: "2:00 PM - 3:00 PM", progress: 48, genre: "Entertainment", image: img(P.film) },
    { id: "live-10", channelNumber: "420", name: "Sony Max HD", nowPlaying: "Sooryavanshi", time: "1:30 PM - 4:00 PM", progress: 33, genre: "Movies", image: img(P.cinema) },
    { id: "live-11", channelNumber: "505", name: "Sony Ten 1 HD", nowPlaying: "WWE Raw • Live", time: "2:30 PM - 3:30 PM", progress: 20, genre: "Sports", image: img(P.sport) },
    { id: "live-12", channelNumber: "360", name: "NDTV 24x7", nowPlaying: "The Big Fight", time: "2:30 PM - 3:30 PM", progress: 25, genre: "News", image: img(P.desk) },
    { id: "live-13", channelNumber: "450", name: "9XM", nowPlaying: "Bollywood Non-Stop", time: "2:00 PM - 3:00 PM", progress: 70, genre: "Music", image: img(P.dj) },
    { id: "live-14", channelNumber: "701", name: "Cartoon Network", nowPlaying: "Ben 10 • Back to Back", time: "2:00 PM - 2:30 PM", progress: 80, genre: "Kids", image: img(P.space) }
  ], "channelNumber");

  // TRENDING ACROSS INDIA
  addUnique(D.trendingNow, [
    { id: "trend-6", title: "Kota Factory: Season 3", genre: "Drama / Youth", rating: "8.7", ott: "Netflix", image: img(P.desk) },
    { id: "trend-7", title: "Mirzapur: Season 3", genre: "Crime / Thriller", rating: "8.5", ott: "Prime Video", image: img(P.dark) },
    { id: "trend-8", title: "Mandaar", genre: "Crime / Drama", rating: "8.6", ott: "Hoichoi", image: img(P.forest) },
    { id: "trend-9", title: "Gullak: Season 4", genre: "Family / Comedy", rating: "9.1", ott: "SonyLIV", image: img(P.retro) },
    { id: "trend-10", title: "Taaza Khabar", genre: "Fantasy / Comedy", rating: "8.3", ott: "Hotstar", image: img(P.paper) },
    { id: "trend-11", title: "Sunflower: Season 2", genre: "Mystery / Comedy", rating: "8.0", ott: "ZEE5", image: img(P.drama) },
    { id: "trend-12", title: "Kaala Paani", genre: "Survival / Drama", rating: "8.4", ott: "Netflix", image: img(P.space) },
    { id: "trend-13", title: "Farzi", genre: "Crime / Thriller", rating: "8.5", ott: "Prime Video", image: img(P.heist) }
  ], "title");

  // BLOCKBUSTER MOVIES
  addUnique(D.blockbusterMovies, [
    { id: "mov-5", title: "RRR", subtitle: "Epic Action / Telugu", rating: "8.9", ott: "ZEE5", image: img(P.sport) },
    { id: "mov-6", title: "12th Fail", subtitle: "Biopic / Hindi", rating: "9.2", ott: "Hotstar", image: img(P.desk) },
    { id: "mov-7", title: "Kantara", subtitle: "Folk Thriller / Kannada", rating: "8.8", ott: "Prime Video", image: img(P.forest) },
    { id: "mov-8", title: "Bela Shuru", subtitle: "Family Drama / Bengali", rating: "8.4", ott: "ZEE5", image: img(P.drama) },
    { id: "mov-9", title: "Tumbbad", subtitle: "Horror / Hindi", rating: "8.7", ott: "Prime Video", image: img(P.dark) },
    { id: "mov-10", title: "Drishyam 2", subtitle: "Suspense / Hindi", rating: "8.3", ott: "JioCinema", image: img(P.heist) },
    { id: "mov-11", title: "Prajapati", subtitle: "Comedy / Bengali", rating: "7.9", ott: "Hoichoi", image: img(P.crowd) },
    { id: "mov-12", title: "Gadar 2", subtitle: "Action / Hindi", rating: "7.8", ott: "ZEE5", image: img(P.cinema) }
  ], "title");

  // POPULAR WEB SERIES
  addUnique(D.popularSeries, [
    { id: "ser-5", title: "Paatal Lok", subtitle: "Crime Thriller", rating: "8.9", ott: "Prime Video", image: img(P.dark) },
    { id: "ser-6", title: "Mohanagar", subtitle: "Kolkata Crime Drama", rating: "8.6", ott: "Hoichoi", image: img(P.paper) },
    { id: "ser-7", title: "Special OPS", subtitle: "Spy Thriller", rating: "8.6", ott: "Hotstar", image: img(P.heist) },
    { id: "ser-8", title: "Aspirants", subtitle: "Drama / Youth", rating: "9.2", ott: "Prime Video", image: img(P.desk) },
    { id: "ser-9", title: "Kohrra", subtitle: "Punjab Noir", rating: "8.4", ott: "Netflix", image: img(P.forest) },
    { id: "ser-10", title: "Tanaav", subtitle: "Action Thriller", rating: "7.9", ott: "SonyLIV", image: img(P.sport) },
    { id: "ser-11", title: "Dupur Thakurpo", subtitle: "Bengali Drama", rating: "7.6", ott: "Hoichoi", image: img(P.drama) },
    { id: "ser-12", title: "The Railway Men", subtitle: "True Story / Drama", rating: "8.6", ott: "Netflix", image: img(P.retro) }
  ], "title");

  // 24x7 REGIONAL NEWS
  addUnique(D.newsChannels, [
    { id: "news-5", title: "Zee 24 Ghanta", subtitle: "Bengal's 24-hour Bulletin", lcn: "344", ott: "LIVE TV", image: img(P.news) },
    { id: "news-6", title: "News18 Bangla", subtitle: "Breaking Bengal Stories", lcn: "346", ott: "LIVE TV", image: img(P.desk) },
    { id: "news-7", title: "Republic Bangla", subtitle: "Prime Time Debate", lcn: "348", ott: "LIVE TV", image: img(P.paper) },
    { id: "news-8", title: "Kolkata TV", subtitle: "City News Live", lcn: "350", ott: "LIVE TV", image: img(P.news) },
    { id: "news-9", title: "Aaj Tak HD", subtitle: "Hindi News 24x7", lcn: "301", ott: "LIVE TV", image: img(P.desk) },
    { id: "news-10", title: "NDTV 24x7", subtitle: "National & World News", lcn: "360", ott: "LIVE TV", image: img(P.paper) },
    { id: "news-11", title: "News18 Assam", subtitle: "Assam & North-East Live", lcn: "380", ott: "LIVE TV", image: img(P.news) },
    { id: "news-12", title: "OTV", subtitle: "Odisha Live", lcn: "392", ott: "LIVE TV", image: img(P.desk) }
  ], "lcn");

  // SITI OTT: more partner apps (each with its own page content + package membership)
  const newApps = [
    { id: "app-lionsgate", lang: "English", name: "Lionsgate Play", logo: "<b>LIONSGATE</b><br>PLAY", bg: "linear-gradient(135deg,#1F2937,#000000)", fg: "#FFFFFF" },
    { id: "app-erosnow", lang: "Hindi", name: "Eros Now", logo: "<b>eros</b> now", bg: "linear-gradient(135deg,#DC2626,#450A0A)", fg: "#FFFFFF" },
    { id: "app-klikk", lang: "Bengali", name: "Klikk", logo: "<b>klikk</b>", bg: "linear-gradient(135deg,#F43F5E,#9D174D)", fg: "#FFFFFF" },
    { id: "app-addatimes", lang: "Bengali", name: "Addatimes", logo: "<b>adda</b>times", bg: "linear-gradient(135deg,#FBBF24,#B45309)", fg: "#1F2937" },
    { id: "app-aha", lang: "Telugu", name: "Aha", logo: "<b>aha</b>", bg: "linear-gradient(135deg,#F97316,#9A3412)", fg: "#FFFFFF" },
    { id: "app-manorama", lang: "Malayalam", name: "ManoramaMAX", logo: "<b>Manorama</b>MAX", bg: "linear-gradient(135deg,#2563EB,#1E1B4B)", fg: "#FFFFFF" },
    { id: "app-hungama", lang: "Hindi", name: "Hungama Play", logo: "<b>hungama</b><br>PLAY", bg: "linear-gradient(135deg,#A21CAF,#3B0764)", fg: "#FFFFFF" },
    { id: "app-docubay", lang: "English", name: "DocuBay", logo: "<b>Docu</b>Bay", bg: "linear-gradient(135deg,#0D9488,#022C22)", fg: "#FFFFFF" }
  ];
  addUnique(D.vibeOtt.apps, newApps, "id");

  const content = {
    "app-lionsgate": [
      ["Midnight Protocol", "Spy Thriller", "m", "A burned agent has one night in Prague to clear her name before the agency that trained her finds her."],
      ["The Long Road Home", "Drama", "m", "A war veteran drives across America with the son he never knew, and the past rides along."],
      ["Iron Harbor", "Action", "s", "A dockside crew uncovers a smuggling ring hiding inside the city's biggest port."],
      ["Vault 9", "Heist", "m"], ["Silent Witness", "Crime", "s"], ["Northern Lights", "Romance", "m"],
      ["Run Hot", "Action", "m"], ["The Inheritance", "Mystery", "s"]
    ],
    "app-erosnow": [
      ["Rang Mahal", "Period Drama", "s", "Three generations of a royal family fight to keep their crumbling palace and their secrets."],
      ["Dil Se Dilli", "Romance", "m", "Two strangers stuck in Delhi's longest traffic jam find out they've met before."],
      ["Bollywood Gold: 90s", "Music", "s", "The songs, the stars and the stories behind the decade that defined Hindi film music."],
      ["Shaadi Express", "Comedy", "m"], ["Mumbai Nights", "Thriller", "s"], ["Desi Rockstar", "Musical", "m"],
      ["Haveli No. 7", "Horror", "m"], ["Pyaar Ka Panchnama Diaries", "Comedy", "s"]
    ],
    "app-klikk": [
      ["Kolkata Confidential", "Crime Thriller", "s", "A night-shift journalist chases a story that the city's most powerful men want buried."],
      ["Pujor Chhuti", "Family Comedy", "m", "One joint family, one Durga Puja holiday, and every cousin with a secret plan."],
      ["Ganga Paarer Golpo", "Drama", "s", "Stories of the ferry-men and families who live along the Hooghly's busiest crossing."],
      ["Adda Unlimited", "Comedy", "s"], ["Lal Kuthi", "Mystery", "m"], ["Mon Kemoner Station", "Romance", "m"],
      ["Bhoot Bungalow", "Horror Comedy", "m"], ["Shohor Tolir Golpo", "Anthology", "s"]
    ],
    "app-addatimes": [
      ["Ekla Cholo", "Drama", "m", "A small-town teacher takes on the coaching mafia with nothing but a bicycle and a blackboard."],
      ["Para Cricket", "Sports Comedy", "s", "The neighbourhood's worst cricket team enters the city's biggest street tournament."],
      ["Rooftop Romance", "Romance", "s", "Two flatmates on rival rooftops start a war of kites, and then of hearts."],
      ["Chaayer Cup", "Comedy", "m"], ["Dark Lane", "Thriller", "s"], ["College Street", "Drama", "m"],
      ["Golpo Holeo Shotti", "Anthology", "s"], ["Night Bus to Digha", "Mystery", "m"]
    ],
    "app-aha": [
      ["Hyderabad Blues", "Drama", "s", "Four friends try to keep their Old City biryani joint alive as the neighbourhood changes around them."],
      ["Godavari Express", "Action", "m", "A train hijack on the Godavari bridge turns a quiet ticket checker into an unlikely hero."],
      ["Unstoppable Kitchen", "Reality", "s", "Home cooks from across Andhra and Telangana compete for the region's top food title."],
      ["Kalki Rising", "Fantasy", "m"], ["Tollywood Tales", "Anthology", "s"], ["Village Detective", "Mystery", "m"],
      ["Love in Vizag", "Romance", "m"], ["Cyber Hyderabad", "Thriller", "s"]
    ],
    "app-manorama": [
      ["Backwater Secrets", "Drama", "s", "A houseboat family's quiet life is upended when a stranger arrives with a decades-old letter."],
      ["Monsoon Mystery", "Thriller", "m", "During the heaviest rains in a century, a hill-station cop investigates a vanishing."],
      ["Kochi Comedy Nights", "Comedy", "s", "Kerala's sharpest stand-up comics take on politics, food and family."],
      ["Theyyam", "Folk Drama", "m"], ["Kochi Nights", "Crime", "s"], ["Spice Route", "Adventure", "m"],
      ["Onam Reunion", "Family", "m"], ["Coconut Republic", "Satire", "s"]
    ],
    "app-hungama": [
      ["Bhaukaal Gang", "Crime", "s", "A small-town fixer becomes the most feared name in western UP, one favour at a time."],
      ["Comedy Chaupal", "Comedy", "s", "Villagers, politicians and one very confused cow in India's favourite comedy hour."],
      ["Dil Ki Dhadkan", "Romance", "m", "A radio jockey falls for a caller she has never met, and sets out to find her."],
      ["Kids Masti Club", "Kids", "s"], ["Retro Classics", "Music", "s"], ["Jungle Safari", "Kids", "m"],
      ["Bollywood Unplugged", "Music", "m"], ["Nukkad 2.0", "Comedy", "s"]
    ],
    "app-docubay": [
      ["Planet India", "Nature", "s", "From Himalayan snow leopards to Sundarbans tigers: India's wild side in stunning 4K."],
      ["Inside ISRO", "Science", "m", "The engineers and the near-misses behind India's journey to the Moon."],
      ["Street Food Stories", "Food", "s", "One city per episode, one plate at a time, told by the people who cook it."],
      ["Ocean Giants", "Nature", "m"], ["The Silk Road Today", "Travel", "s"], ["Mega Machines", "Engineering", "s"],
      ["Mind Games", "Science", "m"], ["Lost Kingdoms", "History", "s"]
    ]
  };
  Object.keys(content).forEach((id) => { if (!D.ottAppContent[id]) D.ottAppContent[id] = content[id]; });

  Object.assign(D.ottLangByService, {
    "Lionsgate Play": "English", "Eros Now": "Hindi", "Klikk": "Bengali", "Addatimes": "Bengali",
    "Aha": "Telugu", "ManoramaMAX": "Malayalam", "Hungama Play": "Hindi", "DocuBay": "English"
  });

  // Which packages include the new partners (Lionsgate Play / Eros Now are already in some)
  const join = {
    "pkg-2": [["Klikk", "Bengali"], ["Addatimes", "Bengali"]],
    "pkg-3": [["Aha", "South Block"], ["ManoramaMAX", "South Block"], ["Eros Now", "Bollywood"]],
    "pkg-4": [["DocuBay", "Documentaries"]],
    "pkg-5": [["Aha", "Included"], ["ManoramaMAX", "Included"], ["Hungama Play", "Included"], ["Klikk", "Bengali"]],
    "pkg-6": [["Klikk", "Bengali"], ["Addatimes", "Bengali"], ["Aha", "Included"], ["ManoramaMAX", "Included"], ["Hungama Play", "Included"], ["DocuBay", "Included"]],
    "pkg-7": [["Klikk", "Bengali"], ["Addatimes", "Bengali"], ["Aha", "Included"], ["ManoramaMAX", "Included"], ["Hungama Play", "Kids & Music"], ["DocuBay", "Included"], ["Eros Now", "Included"]],
    "pkg-8": [["Klikk", "Bengali"], ["Addatimes", "Bengali"], ["Aha", "Included"], ["ManoramaMAX", "Included"], ["Hungama Play", "Included"], ["DocuBay", "Included"], ["Eros Now", "Included"], ["Lionsgate Play", "Hollywood"]]
  };
  const colorOf = Object.fromEntries(newApps.map((a) => [a.name, (a.bg.match(/#[0-9A-Fa-f]{6}/) || ["#334155"])[0]]));
  D.packages.forEach((p) => {
    const adds = join[p.id];
    if (!adds || !Array.isArray(p.ottApps)) return;
    const before = p.ottApps.length;
    adds.forEach(([name, badge]) => {
      if (!p.ottApps.some((o) => o.name === name)) p.ottApps.push({ name, badge, color: colorOf[name] || "#334155" });
    });
    if (p.ottCount === before) p.ottCount = p.ottApps.length;
  });

  // New Bengali news tiles: carried by every package that already has Zee 24 Ghanta
  D.packages.forEach((p) => {
    const news = p.categories && p.categories.News;
    if (!Array.isArray(news) || !news.some((c) => c.name === "Zee 24 Ghanta")) return;
    [
      { name: "Republic Bangla", ch: "1368", lang: "Bengali", icon: "RB", color: "#B91C1C" },
      { name: "Kolkata TV", ch: "1370", lang: "Bengali", icon: "KTV", color: "#1D4ED8" }
    ].forEach((c) => { if (!news.some((x) => x.name === c.name)) news.push(c); });
  });
})();

/* ------------------------------------------------------------------
 * ONE NUMBER PER CHANNEL, EVERYWHERE
 * The guide and the home rails share one channel numbering (LCN), but
 * the package channel lists used an older numbering of their own, so
 * the same number could mean two channels (e.g. 501 = Star Sports 1 HD
 * in the guide but Cartoon Network in a package). This pass runs last:
 *  1. channels that are in the guide / rails take that LCN in every package
 *  2. package-only channels keep one number across all packages, moved to
 *     the next free number if it is already taken by another channel
 * ------------------------------------------------------------------ */
(function unifyChannelNumbers() {
  const D = VIBE_DATA;
  // same rule as app.sameChannelName
  const norm = (s) => String(s || "").toLowerCase().replace(/\bsports ten\b/g, "ten")
    .replace(/\b(hd|tv)\b/g, "").replace(/[^a-z0-9]/g, "");
  const numOf = (c) => c.lcn || c.channelNumber;

  const nameToNum = new Map(); // canonical channel name → number
  const numToName = new Map(); // number → canonical channel name
  const claim = (name, num) => {
    const n = norm(name), k = String(num);
    if (!n || !k || nameToNum.has(n) || numToName.has(k)) return false;
    nameToNum.set(n, k);
    numToName.set(k, n);
    return true;
  };

  // 1. guide first, then the rails (the numbers the viewer sees on tiles)
  ((D.liveTvGuide && D.liveTvGuide.channels) || []).forEach((c) => claim(c.name, c.lcn));
  ["freeChannels", "popularChannels", "liveChannels", "newsChannels", "recentlyWatched"].forEach((k) =>
    (D[k] || []).forEach((c) => { if (numOf(c)) claim(c.name || c.title, numOf(c)); }));

  // 2. package lists
  const entries = [];
  (D.packages || []).forEach((p) => Object.values(p.categories || {}).forEach((arr) => {
    if (Array.isArray(arr)) arr.forEach((c) => { if (c && c.name && c.ch) entries.push(c); });
  }));
  entries.forEach((c) => {
    const n = norm(c.name);
    if (nameToNum.has(n)) { c.ch = nameToNum.get(n); return; }
    let k = Number(c.ch);
    while (numToName.has(String(k))) k++; // next free number in the same block
    claim(c.name, k);
    c.ch = String(k);
  });
})();
