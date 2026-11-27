export type SlideKind =
  | "dua"
  | "title"
  | "problem"
  | "solution"
  | "steps"
  | "market"
  | "pricing"
  | "business"
  | "audience"
  | "advantage"
  | "validation"
  | "roadmap"
  | "team"
  | "close";

export type SlideCard = { title: string; body: string; image?: string };

export type Slide = {
  id: string;
  kind: SlideKind;
  eyebrow: string;
  title: string;
  subtitle?: string;
  note?: string;
  script: string;
  /** Edge TTS voice override (e.g. Arabic neural for the opening dua). */
  voice?: string;
  /** Arabic verse lines for the opening dua slide */
  arabicLines?: string[];
  /** English translation shown under Arabic on the dua slide */
  translation?: string;
  /** Citation / attribution under the translation */
  citation?: string;
  cards?: SlideCard[];
  stats?: { value: string; label: string }[];
  steps?: { index: string; title: string; body: string; image?: string }[];
  tiers?: { name: string; price: string; featured?: boolean; items: string[] }[];
  crops?: { name: string; image: string }[];
  contacts?: { label: string; value: string }[];
  image?: string;
  imageAlt?: string;
  /** Optional looping muted video (title, problem, solution, close) */
  video?: string;
  /** Shape-based process — only on sparse slides */
  flow?: string[];
  shares?: { label: string; pct: number; body: string }[];
};

/** Live generator (Node / Vercel). Static export falls back to public file. */
export const PPT_PATH =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "1"
    ? "/FlorIQ_Pitch_Deck.pptx"
    : "/api/pptx";
export const PPT_FILENAME = "FlorIQ_Pitch_Deck.pptx";

export const slides: Slide[] = [
  {
    id: "dua",
    kind: "dua",
    eyebrow: "00 · Opening",
    title: "Surah Al-Fātiḥah",
    arabicLines: [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "الرَّحْمَٰنِ الرَّحِيمِ",
      "مَالِكِ يَوْمِ الدِّينِ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "اهدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    ],
    translation:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful. [All] praise is [due] to Allah, Lord of the worlds — the Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path — the path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.",
    citation: "— Surah Al-Fātiḥah 1:1–7",
    /** Arabic neural voice for Auto · AI Voice recitation */
    voice: "ar-SA-HamedNeural",
    script:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. الرَّحْمَٰنِ الرَّحِيمِ. مَالِكِ يَوْمِ الدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. اهدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ.",
  },
  {
    id: "title",
    kind: "title",
    eyebrow: "CIS Tech · Pitch Deck",
    title: "FlorIQ",
    subtitle: "Grow Calm. Grow Green. Indoors.",
    note: "FlorIQ makes reliable indoor growing simple through connected hardware, guided growing, and recurring plant-care products.",
    video: "/assets/videos/hero.mp4",
    imageAlt: "FlorIQ indoor growing unit",
    contacts: [
      { label: "Founder", value: "Md. Ibrahim Shopon" },
      { label: "Email", value: "hello@cistechltd.com" },
      { label: "Phone", value: "+880 1761-807610" },
    ],
    script:
      "Welcome. This is FlorIQ from CIS Tech. We make reliable indoor growing simple through connected hardware, guided growing, and recurring plant-care products. Grow calm. Grow green. Indoors.",
  },
  {
    id: "problem",
    kind: "problem",
    eyebrow: "02 · The Problem",
    title: "Fresh herbs are inconvenient, inconsistent, and wasteful.",
    subtitle:
      "Most indoor-growing products still require knowledge, time, and maintenance — so plants fail before they feed anyone.",
    video: "/assets/videos/render.webm",
    imageAlt: "FlorIQ growing system render",
    flow: ["Buy herbs", "Missed care", "Plant stress", "Waste & replace"],
    cards: [
      {
        title: "Water imbalance",
        body: "Over- and underwatering cause about 72% of indoor plant mortality through root rot or rapid dehydration.",
      },
      {
        title: "Microclimate ignorance",
        body: "Indoor temperature swings and low humidity stress delicate plants unnoticed.",
      },
      {
        title: "Lighting deficits",
        body: "Insufficient daily light leads to poor photosynthesis and stunted indoor growth.",
      },
      {
        title: "Manual care stress",
        body: "Busy lifestyles create erratic care schedules and high replacement costs.",
      },
    ],
    script:
      "The problem is simple. Fresh herbs and greens are inconvenient, inconsistent, and wasteful. Most indoor growing products still demand knowledge, time, and maintenance. Water imbalance alone drives most indoor plant deaths. Microclimates go unnoticed, light is often too weak, and busy owners miss care routines — so plants become replacement costs, not rituals.",
  },
  {
    id: "solution",
    kind: "solution",
    eyebrow: "03 · Introducing FlorIQ",
    title: "Smart indoor plant care through automation and real-time monitoring.",
    subtitle:
      "A compact growing unit with guided care — so beginners and kitchens get predictable harvests.",
    video: "/assets/videos/plant-system.webm",
    imageAlt: "FlorIQ plant system",
    cards: [
      {
        title: "Real-time plant health monitoring",
        body: "Continuous sensing so early stress is caught before plants fail.",
      },
      {
        title: "Smart soil moisture & water level",
        body: "Guidance that prevents overwatering and dry-outs.",
      },
      {
        title: "Automatic grow-light control",
        body: "Reliable daily light without guesswork.",
      },
      {
        title: "Temperature, humidity & CO₂",
        body: "Environmental awareness built into everyday care.",
      },
      {
        title: "Modular multi-tray architecture",
        body: "Start small at home; expand for more pods or spaces.",
      },
      {
        title: "Remote dashboard path",
        body: "Mobile monitoring and alerts — firmware in progress, app planned.",
      },
    ],
    script:
      "Introducing FlorIQ. Smart indoor plant care through automation and real-time monitoring. The system watches plant health, soil moisture and water level, controls the grow light automatically, and tracks temperature, humidity, and CO₂. It uses a modular multi-tray design, with a path to remote dashboard monitoring.",
  },
  {
    id: "steps",
    kind: "steps",
    eyebrow: "04 · How It Works",
    title: "From pod to harvest.",
    steps: [
      {
        index: "01",
        title: "Plant selected",
        body: "Insert the pod and choose the crop profile.",
        image: "/assets/how/01-plant-selected.png",
      },
      {
        index: "02",
        title: "Real-time monitoring",
        body: "Sensors track moisture, climate, and tank level.",
        image: "/assets/how/02-monitoring.jpg",
      },
      {
        index: "03",
        title: "Smart control",
        body: "Light and care guidance adjust automatically.",
        image: "/assets/how/03-smart-control.jpg",
      },
      {
        index: "04",
        title: "User notifications",
        body: "Clear alerts when the plant needs attention.",
        image: "/assets/how/04-notifications.png",
      },
      {
        index: "05",
        title: "Flourishing harvest",
        body: "Healthier growth — ready for the kitchen.",
        image: "/assets/how/05-harvest.png",
      },
    ],
    script:
      "Here is how FlorIQ works. Stage one: select the plant and insert the pod. Stage two: real-time monitoring begins. Stage three: smart control balances light and care. Stage four: the owner gets clear notifications. The goal achieved is a flourishing harvest.",
  },
  {
    id: "market",
    kind: "market",
    eyebrow: "05 · Market Opportunity",
    title: "How big is the opportunity?",
    subtitle:
      "Urbanization and limited growing space are accelerating demand for smart indoor farming. Our modular pods scale from homes to commercial facilities.",
    note: "Sources: Grand View Research; GII / QYResearch; National Gardening Association. Published market context — not FlorIQ results.",
    stats: [
      {
        value: "$2.4B",
        label: "TAM — global smart indoor gardening & automated plant-care market by 2028",
      },
      {
        value: "18.5%",
        label: "CAGR — growth driven by urban apartments and office greening",
      },
      {
        value: "74%",
        label: "Urban households owning 5 or more indoor plants that need care",
      },
    ],
    cards: [
      { title: "Smaller homes", body: "Less outdoor space for traditional gardens." },
      { title: "Wellness", body: "People want food and greenery they can see grow." },
      { title: "Less waste", body: "Grow what you use instead of spoiling fridge bunches." },
      { title: "Useful objects", body: "Buyers pay for products that work and look right on a counter." },
    ],
    script:
      "The opportunity is large. The global smart indoor gardening and automated plant-care market is projected at two point four billion dollars by twenty twenty-eight, growing at about eighteen point five percent CAGR. Seventy-four percent of urban households already own five or more indoor plants. Urban living, wellness, less waste, and demand for well-made home products are pushing this category forward — and our modular pods scale from homes to commercial facilities.",
  },
  {
    id: "pricing",
    kind: "pricing",
    eyebrow: "06 · Estimated Pricing",
    title: "Hardware tiers built for home first.",
    tiers: [
      {
        name: "Starter",
        price: "$115",
        items: ["Four plantation pods", "Automated light control", "Soil moisture & water monitor"],
      },
      {
        name: "Standard",
        price: "$129",
        featured: true,
        items: ["Everything in Starter", "Environmental sensing", "Mobile app access"],
      },
      {
        name: "Premium",
        price: "$199",
        items: ["Scalable multi-pod system", "Centralized fleet monitoring", "Custom automation & integration"],
      },
    ],
    script:
      "Estimated pricing. Starter at one hundred fifteen dollars with four pods, automated light, and moisture monitoring. Standard at one hundred twenty-nine dollars adds environmental sensing and mobile app access. Premium at one hundred ninety-nine dollars is built for multi-pod systems, fleet monitoring, and custom automation.",
  },
  {
    id: "business",
    kind: "business",
    eyebrow: "07 · Business Model",
    title: "Hardware first — then recurring care.",
    subtitle:
      "A diversified revenue stream combining hardware sales with recurring plant-care products and subscriptions.",
    flow: ["Hardware", "Pods & nutrients", "Care plan", "B2B scale"],
    cards: [
      {
        title: "Hardware sale",
        body: "Starter, Standard, and Premium units — high-margin entry into the home.",
      },
      {
        title: "Seed & plant pods",
        body: "Repurchased each time a new crop is started.",
      },
      {
        title: "Nutrients & accessories",
        body: "Sold with pods and as ongoing refills.",
      },
      {
        title: "AI Care Plan · $4.99/mo",
        body: "Recurring guided automation, alerts, and care support.",
      },
      {
        title: "B2B maintenance",
        body: "Subscription care for offices, hotels, and commercial sites.",
      },
      {
        title: "Bulk & installation",
        body: "Packages for developers, retailers, and larger deployments.",
      },
    ],
    note: "Core model: hardware around $129/unit paired with a $4.99 monthly care plan — then pods and nutrients keep the relationship alive.",
    script:
      "Our business model is hardware first, then what the plant needs next. We sell Starter, Standard, and Premium units, then earn again through seed pods, nutrients, and accessories. A four dollar ninety-nine monthly care plan adds recurring software value. For commercial sites we offer maintenance subscriptions and bulk installation packages. In short: a unit on the counter, then a recurring relationship around growing.",
  },
  {
    id: "audience",
    kind: "audience",
    eyebrow: "08 · Who We Serve",
    title: "Start where a sale can happen first.",
    shares: [
      {
        label: "Urban houseplant hobbyists",
        pct: 45,
        body: "Homes and apartments — recommended first channel via direct online sales.",
      },
      {
        label: "Commercial offices & co-working",
        pct: 30,
        body: "Shared kitchens, desks, and workplace greenery.",
      },
      {
        label: "Frequent travelers",
        pct: 15,
        body: "Owners who need guided care when they are away.",
      },
      {
        label: "Boutique nurseries & plant shops",
        pct: 10,
        body: "Retail partners and specialty plant experiences.",
      },
    ],
    note: "Homes first — the product is already designed for the countertop and needs no site visit to sell.",
    script:
      "Who we serve. Urban houseplant hobbyists are about forty-five percent of the focus — homes and apartments sold direct online. Commercial offices and co-working are about thirty percent. Frequent travelers fifteen percent. Boutique nurseries and plant shops ten percent. We start with homes because that is the product already designed, and the channel that does not need a partner.",
  },
  {
    id: "advantage",
    kind: "advantage",
    eyebrow: "09 · Competitive Advantage",
    title: "Designed to feel finished — and stay connected.",
    subtitle:
      "These are the choices built into FlorIQ — not a lab comparison against other products.",
    cards: [
      {
        title: "Premium design",
        body: "A finished object for a kitchen or workplace — not a bare utility tray.",
      },
      {
        title: "Easier setup",
        body: "Insert a pod and use a crop profile instead of learning a grow setup from scratch.",
      },
      {
        title: "Local crop selection",
        body: "Early pilots on coriander, hot green chili, and grape cherry tomato.",
      },
      {
        title: "Connected care guidance",
        body: "Sensors and alerts meant to tell the owner what the plant needs.",
      },
      {
        title: "Recurring consumables",
        body: "Pods, seed, and nutrients continue after the unit is sold.",
      },
      {
        title: "B2B-ready premium tier",
        body: "Multi-pod systems with fleet monitoring for commercial sites.",
      },
    ],
    script:
      "Our advantage is design and connected care. FlorIQ is meant to look finished on a counter, set up with a simple pod and crop profile, support local pilot crops, guide care with sensors and alerts, keep recurring consumables in the model, and scale into multi-pod commercial monitoring on the premium tier.",
  },
  {
    id: "validation",
    kind: "validation",
    eyebrow: "10 · Validation",
    title: "Piloted on real plants.",
    subtitle: "Three species. Three distinct automation profiles. Prototype pods photographed.",
    crops: [
      { name: "Coriander", image: "/assets/coriander.png" },
      { name: "Hot green chili", image: "/assets/chili.png" },
      { name: "Grape cherry tomato", image: "/assets/tomato.png" },
    ],
    note: "Scale-up is planned. Pilot users, pre-orders, and manufacturing are not yet in hand.",
    script:
      "Validation so far. We have piloted on real plants — coriander, hot green chili, and grape cherry tomato — each with its own automation profile. Prototype pods have been photographed. Scale-up is planned. Pilot users and pre-orders are not claimed yet.",
  },
  {
    id: "roadmap",
    kind: "roadmap",
    eyebrow: "11 · Prototype to Market",
    title: "The path ahead.",
    steps: [
      {
        index: "Now",
        title: "Firmware & backend",
        body: "Modular ESP32 infrastructure and custom plant profiles — in progress.",
      },
      {
        index: "Q3 2026",
        title: "Pilot deployment",
        body: "Live crop validation across real microclimates.",
      },
      {
        index: "Next",
        title: "App & cloud alerts",
        body: "Push notifications and integrated telemetry dashboards.",
      },
      {
        index: "Then",
        title: "Scale & manufacturing",
        body: "Initial production line and early consumer launch.",
      },
    ],
    script:
      "From prototype to market. Firmware and backend are in progress on modular ESP32 with custom plant profiles. Pilot deployment is targeted for the third quarter of twenty twenty-six. Next come app and cloud alerts. Then scale, manufacturing, and early consumer launch.",
  },
  {
    id: "team",
    kind: "team",
    eyebrow: "12 · The Team",
    title: "Rooted in passion and expertise.",
    cards: [
      {
        title: "Md. Ibrahim Shopon",
        body: "Founder",
        image: "/assets/team/md-ibrahim-shopon.png",
      },
      {
        title: "William Francis Gomes",
        body: "Co-Founder",
        image: "/assets/team/william-francis-gomes.png",
      },
      {
        title: "Imran H. Shakil",
        body: "Co-Founder",
        image: "/assets/team/imran-h-shakil.png",
      },
      {
        title: "Sarwar An Noor",
        body: "IoT Developer",
        image: "/assets/team/sarwar-an-noor.png",
      },
      {
        title: "Sanjoy Kumar Saha",
        body: "Software Developer",
        image: "/assets/team/sanjoy-kumar-saha.png?v=15",
      },
      {
        title: "Anand Sarbabidya",
        body: "Software Developer",
        image: "/assets/team/anand-sarbabidya.png?v=15",
      },
      {
        title: "Syed Mohtasib Mashruk",
        body: "Mobile Application Developer",
        image: "/assets/team/syed-mohtasib-mashruk.png?v=15",
      },
      {
        title: "Sadhan Kirtania",
        body: "Animator & 3D Designer",
        image: "/assets/team/sadhan-kirtania.png?v=15",
      },
    ],
    script:
      "The team. Md Ibrahim Shopon, Founder. William Francis Gomes and Imran H Shakil, Co-Founders. Sarwar An Noor, IoT Developer. Sanjoy Kumar Saha and Anand Sarbabidya, Software Developers. Syed Mohtasib Mashruk, Mobile Application Developer. Sadhan Kirtania, Animator and 3D Designer. Rooted in passion and expertise at CIS Tech.",
  },
  {
    id: "close",
    kind: "close",
    eyebrow: "Questions & Discussion",
    title: "Let’s grow together.",
    subtitle:
      "Thank you for exploring the future of autonomous plant care with FlorIQ. Let’s make green living a daily reality.",
    video: "/assets/videos/hero.mp4",
    imageAlt: "FlorIQ indoor growing unit",
    contacts: [
      { label: "Web", value: "cistechltd.com" },
      { label: "Email", value: "hello@cistechltd.com" },
      { label: "Phone", value: "+880 1761-807610" },
    ],
    script:
      "Let’s grow together and make green living a daily reality. Thank you for exploring FlorIQ. Visit cistechltd.com, email hello at cistechltd.com, or call plus eight eight zero one seven six one eight zero seven six one zero. We welcome your questions.",
  },
];
