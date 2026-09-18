/**
 * Site Blueprints (整站蓝图配置) - ULTRA PACK
 * 
 * 包含 80+ 套不同风格的网站结构。
 * 特别优化：中餐馆 (20套)。
 * 这里的 template ID 严格对应 AdvancedEditor.js 中的 templatePool。
 */

export const SITE_BLUEPRINTS = {
  // ============================================================
  // 🇨🇳 CHINESE CUISINE (中餐馆 - 20套精选)
  // ============================================================
  
  "chinese_dimsum_traditional": {
    id: "chinese_dimsum_traditional",
    label: "Traditional Dim Sum (传统早茶)",
    description: "Elegant, gold and red themes for classic tea houses.",
    tags: ["chinese", "dim_sum", "tea", "traditional", "cantonese", "breakfast", "yum_cha"],
    layout: [
      { type: "hero", template: "hero-13" },
      { type: "about", template: "about-3" },
      { type: "gallery", template: "gallery-2" },
      { type: "info", template: "info-3" }
    ],
    defaultColors: { primary: "#B71C1C", secondary: "#FFD700", text: "#3E2723" },
    fontStyle: "Lora"
  },
  "chinese_hotpot_spicy": {
    id: "chinese_hotpot_spicy",
    label: "Sichuan Hot Pot (川味火锅)",
    description: "Fiery red, energetic layout with social focus.",
    tags: ["chinese", "hot_pot", "sichuan", "spicy", "chili", "social", "boiling"],
    layout: [
      { type: "modal", template: "modal-1" },
      { type: "hero", template: "hero-8" },
      { type: "popular", template: "popular-1" },
      { type: "gallery", template: "gallery-6" },
      { type: "info", template: "info-10" }
    ],
    defaultColors: { primary: "#D50000", secondary: "#212121", text: "#FFFFFF" },
    fontStyle: "Roboto Slab"
  },
  "chinese_takeout_express": {
    id: "chinese_takeout_express",
    label: "Panda Express Style (中式快餐)",
    description: "Simple, menu-focused, high conversion.",
    tags: ["chinese", "takeout", "fast_food", "delivery", "express", "orange_chicken"],
    layout: [
      { type: "hero", template: "hero-1" },
      { type: "popular", template: "popular-1" },
      { type: "contact", template: "contact-3" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#D32F2F", secondary: "#FFFFFF", text: "#212121" },
    fontStyle: "Lato"
  },
  "chinese_fine_dining": {
    id: "chinese_fine_dining",
    label: "Imperial Banquet (宫廷御宴)",
    description: "Luxurious, high-end Chinese dining experience.",
    tags: ["chinese", "fine_dining", "luxury", "banquet", "expensive", "elegant"],
    layout: [
      { type: "hero", template: "hero-9" },
      { type: "mission", template: "mission-2" },
      { type: "reservation", template: "reservation-3" },
      { type: "gallery", template: "gallery-5" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#1C1C1C", secondary: "#D4AF37", text: "#FFFFFF" },
    fontStyle: "Cormorant Garamond"
  },
  "chinese_noodle_house": {
    id: "chinese_noodle_house",
    label: "Hand-Pulled Noodles (兰州拉面)",
    description: "Focus on craftsmanship and fresh ingredients.",
    tags: ["chinese", "noodles", "ramen", "soup", "hand_pulled", "beef_noodle"],
    layout: [
      { type: "hero", template: "hero-2" }, // Video background of pulling noodles
      { type: "intro", template: "intro-1" },
      { type: "gallery", template: "gallery-8" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#01579B", secondary: "#E1F5FE", text: "#212121" },
    fontStyle: "Open Sans"
  },
  "chinese_tea_house": {
    id: "chinese_tea_house",
    label: "Zen Tea House (禅意茶馆)",
    description: "Peaceful, green and wood tones.",
    tags: ["chinese", "tea", "zen", "relax", "green_tea", "ceremony"],
    layout: [
      { type: "hero", template: "hero-5" },
      { type: "about", template: "about-1" },
      { type: "gallery", template: "gallery-3" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#33691E", secondary: "#DCEDC8", text: "#1B5E20" },
    fontStyle: "Noto Sans JP"
  },
  "chinese_banquet_hall": {
    id: "chinese_banquet_hall",
    label: "Wedding & Banquet (喜宴酒楼)",
    description: "Large scale, catering focused, celebratory.",
    tags: ["chinese", "banquet", "wedding", "events", "large_group", "celebration"],
    layout: [
      { type: "hero", template: "hero-15" },
      { type: "catering", template: "catering-2" },
      { type: "gallery", template: "gallery-10" },
      { type: "info", template: "info-12" }
    ],
    defaultColors: { primary: "#C62828", secondary: "#FFEB3B", text: "#3E2723" },
    fontStyle: "Playfair Display"
  },
  "chinese_street_food": {
    id: "chinese_street_food",
    label: "Night Market Skewers (夜市烧烤)",
    description: "Dark mode, neon vibes, lively.",
    tags: ["chinese", "street_food", "skewers", "bbq", "night_market", "snack"],
    layout: [
      { type: "hero", template: "hero-10" },
      { type: "instagram", template: "instagram-1" },
      { type: "info", template: "info-7" }
    ],
    defaultColors: { primary: "#212121", secondary: "#FF4081", text: "#FFFFFF" },
    fontStyle: "Montserrat"
  },
  "chinese_dumpling_shop": {
    id: "chinese_dumpling_shop",
    label: "Cozy Dumpling (饺子馆)",
    description: "Homey, warm, comfort food.",
    tags: ["chinese", "dumplings", "comfort_food", "home", "warm"],
    layout: [
      { type: "hero", template: "hero-3" },
      { type: "popular", template: "popular-1" },
      { type: "about", template: "about-5" },
      { type: "info", template: "info-4" }
    ],
    defaultColors: { primary: "#E65100", secondary: "#FFF3E0", text: "#3E2723" },
    fontStyle: "Nunito"
  },
  "chinese_hk_cafe": {
    id: "chinese_hk_cafe",
    label: "Cha Chaan Teng (港式茶餐厅)",
    description: "Retro, busy, tile patterns.",
    tags: ["chinese", "hong_kong", "cafe", "retro", "milk_tea", "busy"],
    layout: [
      { type: "hero", template: "hero-14" },
      { type: "intro", template: "intro-2" },
      { type: "gallery", template: "gallery-5" },
      { type: "info", template: "info-8" }
    ],
    defaultColors: { primary: "#006064", secondary: "#FFFFFF", text: "#212121" },
    fontStyle: "Roboto Condensed"
  },
  "chinese_taiwanese": {
    id: "chinese_taiwanese",
    label: "Taiwanese Bento & Tea (台式便当)",
    description: "Casual, cute, bright colors.",
    tags: ["chinese", "taiwanese", "bento", "bubble_tea", "casual", "snacks"],
    layout: [
      { type: "hero", template: "hero-11" },
      { type: "popular", template: "popular-1" },
      { type: "feedback", template: "feedback-1" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#F06292", secondary: "#FCE4EC", text: "#880E4F" },
    fontStyle: "Quicksand"
  },
  "chinese_hunan_spicy": {
    id: "chinese_hunan_spicy",
    label: "Hunan Flavors (湘菜馆)",
    description: "Bold, rustic, spicy.",
    tags: ["chinese", "hunan", "spicy", "rustic", "peppers", "bold"],
    layout: [
      { type: "hero", template: "hero-12" },
      { type: "gallery", template: "gallery-7" },
      { type: "info", template: "info-9" }
    ],
    defaultColors: { primary: "#BF360C", secondary: "#212121", text: "#FFFFFF" },
    fontStyle: "Anton"
  },
  "chinese_shanghai_modern": {
    id: "chinese_shanghai_modern",
    label: "Modern Shanghai (海派菜)",
    description: "Sophisticated, fusion, city vibes.",
    tags: ["chinese", "shanghai", "modern", "city", "fusion", "xiao_long_bao"],
    layout: [
      { type: "hero", template: "hero-4" },
      { type: "about", template: "about-2" },
      { type: "reservation", template: "reservation-1" },
      { type: "info", template: "info-11" }
    ],
    defaultColors: { primary: "#4A148C", secondary: "#E1BEE7", text: "#FFFFFF" },
    fontStyle: "Playfair Display"
  },
  "chinese_buddhist_vegan": {
    id: "chinese_buddhist_vegan",
    label: "Buddhist Vegetarian (素斋)",
    description: "Clean, peaceful, lotus themes.",
    tags: ["chinese", "vegan", "vegetarian", "buddhist", "healthy", "peaceful"],
    layout: [
      { type: "hero", template: "hero-16" },
      { type: "mission", template: "mission-3" },
      { type: "about", template: "about-6" },
      { type: "info", template: "info-13" }
    ],
    defaultColors: { primary: "#558B2F", secondary: "#F1F8E9", text: "#33691E" },
    fontStyle: "Zen Old Mincho"
  },
  "chinese_bbq_roast": {
    id: "chinese_bbq_roast",
    label: "Cantonese BBQ (广式烧腊)",
    description: "Appetizing display of roast meats.",
    tags: ["chinese", "bbq", "roast_duck", "pork", "cantonese", "meat"],
    layout: [
      { type: "hero", template: "hero-17" },
      { type: "popular", template: "popular-1" },
      { type: "catering", template: "catering-1" },
      { type: "info", template: "info-14" }
    ],
    defaultColors: { primary: "#8D6E63", secondary: "#D7CCC8", text: "#3E2723" },
    fontStyle: "Roboto"
  },
  "chinese_buffet_family": {
    id: "chinese_buffet_family",
    label: "All You Can Eat (中式自助)",
    description: "Value focused, lots of food photos.",
    tags: ["chinese", "buffet", "all_you_can_eat", "family", "value"],
    layout: [
      { type: "modal", template: "modal-2" },
      { type: "hero", template: "hero-18" },
      { type: "gallery", template: "gallery-12" },
      { type: "info", template: "info-15" }
    ],
    defaultColors: { primary: "#FF6F00", secondary: "#FFF8E1", text: "#212121" },
    fontStyle: "Open Sans"
  },
  "chinese_malatang": {
    id: "chinese_malatang",
    label: "Malatang (麻辣烫)",
    description: "Young, trendy, fast casual.",
    tags: ["chinese", "malatang", "spicy", "soup", "individual", "trendy"],
    layout: [
      { type: "hero", template: "hero-19" },
      { type: "intro", template: "intro-4" },
      { type: "gallery", template: "gallery-15" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#FF3D00", secondary: "#212121", text: "#FFFFFF" },
    fontStyle: "Kanit"
  },
  "chinese_fusion_bistro": {
    id: "chinese_fusion_bistro",
    label: "Asian Fusion Bistro (创意中餐)",
    description: "Modern, eclectic, cocktail bar vibes.",
    tags: ["chinese", "fusion", "modern", "bistro", "cocktail", "creative"],
    layout: [
      { type: "hero", template: "hero-20" },
      { type: "instagram", template: "instagram-1" },
      { type: "reservation", template: "reservation-5" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#263238", secondary: "#80CBC4", text: "#FFFFFF" },
    fontStyle: "Montserrat"
  },
  "chinese_sichuan_modern": {
    id: "chinese_sichuan_modern",
    label: "Modern Sichuan (新派川菜)",
    description: "Clean lines but spicy accents.",
    tags: ["chinese", "sichuan", "modern", "spicy", "clean"],
    layout: [
      { type: "hero", template: "hero-6" },
      { type: "gallery", template: "gallery-18" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#B71C1C", secondary: "#FAFAFA", text: "#212121" },
    fontStyle: "Inter"
  },
  "chinese_family_restaurant": {
    id: "chinese_family_restaurant",
    label: "Neighborhood Chinese (家常菜)",
    description: "Friendly, welcoming, community focused.",
    tags: ["chinese", "family", "neighborhood", "casual", "friendly"],
    layout: [
      { type: "hero", template: "hero-7" },
      { type: "about", template: "about-4" },
      { type: "contact", template: "contact-2" },
      { type: "info", template: "info-3" }
    ],
    defaultColors: { primary: "#F44336", secondary: "#FFEB3B", text: "#212121" },
    fontStyle: "Lato"
  },

  // ============================================================
  // 🇯🇵 JAPANESE CUISINE (日料)
  // ============================================================
  "japanese_minimal": {
    id: "japanese_minimal",
    label: "Zen Dining (日式极简)",
    description: "Clean, whitespace-heavy design for high-end sushi.",
    tags: ["japanese", "sushi", "minimal", "zen", "omakase", "white", "seafood"],
    layout: [
      { type: "hero", template: "hero-5", settings: { fullScreen: true } },
      { type: "intro", template: "intro-1" },
      { type: "gallery", template: "gallery-3" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#2C3E50", secondary: "#ECF0F1", text: "#333333" },
    fontStyle: "Noto Sans JP"
  },
  "japanese_izakaya": {
    id: "japanese_izakaya",
    label: "Lively Izakaya (居酒屋)",
    description: "Dark, energetic layout for drinks and small plates.",
    tags: ["japanese", "izakaya", "bar", "drinks", "yakitori", "night", "dark"],
    layout: [
      { type: "hero", template: "hero-12" },
      { type: "popular", template: "popular-1" },
      { type: "instagram", template: "instagram-1" },
      { type: "info", template: "info-9" }
    ],
    defaultColors: { primary: "#1a1a1a", secondary: "#D32F2F", text: "#ffffff" },
    fontStyle: "Roboto"
  },
  "japanese_ramen": {
    id: "japanese_ramen",
    label: "Ramen Shop (拉面馆)",
    description: "Fast-paced, visual layout for noodle shops.",
    tags: ["japanese", "ramen", "noodles", "soup", "fast", "casual"],
    layout: [
      { type: "hero", template: "hero-2" },
      { type: "about", template: "about-1" },
      { type: "gallery", template: "gallery-8" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#C62828", secondary: "#FFEB3B", text: "#212121" },
    fontStyle: "Open Sans"
  },
  "japanese_teppanyaki": {
    id: "japanese_teppanyaki",
    label: "Teppanyaki Grill (铁板烧)",
    description: "Action-oriented, performance focused.",
    tags: ["japanese", "teppanyaki", "grill", "steak", "show", "chef"],
    layout: [
      { type: "hero", template: "hero-8" },
      { type: "gallery", template: "gallery-16" },
      { type: "reservation", template: "reservation-2" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#212121", secondary: "#FF5722", text: "#FFFFFF" },
    fontStyle: "Montserrat"
  },

  // ============================================================
  // 🇺🇸 AMERICAN CUISINE (美式)
  // ============================================================
  "american_diner": {
    id: "american_diner",
    label: "Retro Diner (美式餐厅)",
    description: "Bold colors and large typography.",
    tags: ["american", "burger", "diner", "retro", "fries", "milkshake"],
    layout: [
      { type: "hero", template: "hero-2" },
      { type: "popular", template: "popular-1" },
      { type: "about", template: "about-3" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#F44336", secondary: "#FFC107", text: "#212121" },
    fontStyle: "Poppins"
  },
  "american_steakhouse": {
    id: "american_steakhouse",
    label: "Premium Steakhouse (牛排馆)",
    description: "Dark, luxurious, meat-focused design.",
    tags: ["american", "steak", "meat", "grill", "wine", "luxury", "dark"],
    layout: [
      { type: "hero", template: "hero-4" },
      { type: "about", template: "about-2" },
      { type: "reservation", template: "reservation-1" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#212121", secondary: "#D4AF37", text: "#ffffff" },
    fontStyle: "Playfair Display"
  },
  "american_bbq": {
    id: "american_bbq",
    label: "Smokehouse BBQ (烧烤屋)",
    description: "Rustic, smoky vibes with catering focus.",
    tags: ["american", "bbq", "smoke", "ribs", "rustic", "catering"],
    layout: [
      { type: "hero", template: "hero-8" },
      { type: "catering", template: "catering-2" },
      { type: "gallery", template: "gallery-5" },
      { type: "info", template: "info-7" }
    ],
    defaultColors: { primary: "#3E2723", secondary: "#FF5722", text: "#FFFFFF" },
    fontStyle: "Roboto Slab"
  },
  "american_breakfast": {
    id: "american_breakfast",
    label: "Morning Cafe (早餐店)",
    description: "Bright, sunny, egg and pancake focused.",
    tags: ["american", "breakfast", "brunch", "eggs", "pancakes", "morning"],
    layout: [
      { type: "hero", template: "hero-3" },
      { type: "popular", template: "popular-1" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#FFB74D", secondary: "#FFF3E0", text: "#E65100" },
    fontStyle: "Lato"
  },

  // ============================================================
  // 🇮🇹 ITALIAN CUISINE (意式)
  // ============================================================
  "italian_rustic": {
    id: "italian_rustic",
    label: "Rustic Trattoria (意式家常)",
    description: "Warm, family-style layout.",
    tags: ["italian", "pasta", "pizza", "rustic", "family", "warm"],
    layout: [
      { type: "hero", template: "hero-6" },
      { type: "mission", template: "mission-1" },
      { type: "gallery", template: "gallery-2" },
      { type: "info", template: "info-3" }
    ],
    defaultColors: { primary: "#2E7D32", secondary: "#C62828", text: "#1B5E20" },
    fontStyle: "Lora"
  },
  "italian_fine_dining": {
    id: "italian_fine_dining",
    label: "Elegant Ristorante (高级意餐)",
    description: "Sophisticated layout for fine dining.",
    tags: ["italian", "fine_dining", "elegant", "wine", "romantic"],
    layout: [
      { type: "hero", template: "hero-9" },
      { type: "intro", template: "intro-3" },
      { type: "reservation", template: "reservation-3" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#1C1C1C", secondary: "#D4AF37", text: "#FFFFFF" },
    fontStyle: "Cormorant Garamond"
  },
  "italian_pizzeria": {
    id: "italian_pizzeria",
    label: "Wood-Fired Pizza (披萨店)",
    description: "Fun, casual layout with feedback forms.",
    tags: ["italian", "pizza", "casual", "fast", "cheese"],
    layout: [
      { type: "hero", template: "hero-10" },
      { type: "popular", template: "popular-1" },
      { type: "feedback", template: "feedback-1" },
      { type: "info", template: "info-4" }
    ],
    defaultColors: { primary: "#D84315", secondary: "#FFEB3B", text: "#212121" },
    fontStyle: "Lobster"
  },

  // ============================================================
  // 🇲🇽 MEXICAN CUISINE (墨式)
  // ============================================================
  "mexican_fiesta": {
    id: "mexican_fiesta",
    label: "Taco Fiesta (墨西哥风情)",
    description: "Vibrant, colorful layout.",
    tags: ["mexican", "tacos", "spicy", "colorful", "party"],
    layout: [
      { type: "hero", template: "hero-10" },
      { type: "gallery", template: "gallery-6" },
      { type: "info", template: "info-7" }
    ],
    defaultColors: { primary: "#E64A19", secondary: "#FFEB3B", text: "#212121" },
    fontStyle: "Lobster"
  },
  "mexican_cantina": {
    id: "mexican_cantina",
    label: "Cantina & Bar (墨式酒吧)",
    description: "Nightlife focused with drinks and social media.",
    tags: ["mexican", "bar", "tequila", "night", "drinks"],
    layout: [
      { type: "hero", template: "hero-12" },
      { type: "instagram", template: "instagram-1" },
      { type: "info", template: "info-9" }
    ],
    defaultColors: { primary: "#000000", secondary: "#E91E63", text: "#FFFFFF" },
    fontStyle: "Montserrat"
  },

  // ============================================================
  // 🇫🇷 FRENCH CUISINE (法式)
  // ============================================================
  "french_bistro": {
    id: "french_bistro",
    label: "Parisian Bistro (法式小馆)",
    description: "Chic, modern layout with sidewalk vibes.",
    tags: ["french", "bistro", "chic", "modern", "wine"],
    layout: [
      { type: "hero", template: "hero-4" },
      { type: "about", template: "about-2" },
      { type: "reservation", template: "reservation-1" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#263238", secondary: "#CFD8DC", text: "#FFFFFF" },
    fontStyle: "Playfair Display"
  },
  "french_patisserie": {
    id: "french_patisserie",
    label: "Sweet Patisserie (法式甜点)",
    description: "Light, airy layout for bakeries.",
    tags: ["french", "bakery", "pastry", "sweet", "dessert", "light"],
    layout: [
      { type: "hero", template: "hero-3" },
      { type: "gallery", template: "gallery-1" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#F8BBD0", secondary: "#FFFFFF", text: "#880E4F" },
    fontStyle: "Lato"
  },

  // ============================================================
  // ☕ CAFE & BAKERY (咖啡烘焙)
  // ============================================================
  "cafe_cozy": {
    id: "cafe_cozy",
    label: "Cozy Coffee Shop (温馨咖啡)",
    description: "Warm tones, inviting layout.",
    tags: ["coffee", "cafe", "warm", "cozy", "book"],
    layout: [
      { type: "hero", template: "hero-3" },
      { type: "about", template: "about-1" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#6D4C41", secondary: "#D7CCC8", text: "#3E2723" },
    fontStyle: "Lato"
  },
  "cafe_modern": {
    id: "cafe_modern",
    label: "Modern Espresso Bar (现代咖啡)",
    description: "Minimalist, clean lines for urban cafes.",
    tags: ["coffee", "modern", "minimal", "urban", "espresso"],
    layout: [
      { type: "hero", template: "hero-5" },
      { type: "intro", template: "intro-2" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#212121", secondary: "#EEEEEE", text: "#000000" },
    fontStyle: "Inter"
  },
  "cafe_bakery": {
    id: "cafe_bakery",
    label: "Artisan Bakery (手工烘焙)",
    description: "Focus on product galleries and freshness.",
    tags: ["bakery", "bread", "pastry", "fresh", "morning"],
    layout: [
      { type: "hero", template: "hero-7" },
      { type: "gallery", template: "gallery-4" },
      { type: "catering", template: "catering-1" },
      { type: "info", template: "info-4" }
    ],
    defaultColors: { primary: "#FF9800", secondary: "#FFF3E0", text: "#E65100" },
    fontStyle: "Work Sans"
  },

  // ============================================================
  // 🐟 SEAFOOD (海鲜)
  // ============================================================
  "seafood_fresh": {
    id: "seafood_fresh",
    label: "Ocean Catch (生鲜海鲜)",
    description: "Blue tones, airy layout.",
    tags: ["seafood", "fish", "ocean", "blue", "fresh"],
    layout: [
      { type: "hero", template: "hero-7" },
      { type: "intro", template: "intro-3" },
      { type: "gallery", template: "gallery-4" },
      { type: "info", template: "info-4" }
    ],
    defaultColors: { primary: "#0277BD", secondary: "#E1F5FE", text: "#01579B" },
    fontStyle: "Work Sans"
  },
  "seafood_oyster": {
    id: "seafood_oyster",
    label: "Premium Oyster Bar (生蚝吧)",
    description: "Elegant, high-end seafood dining.",
    tags: ["seafood", "oyster", "luxury", "champagne", "bar"],
    layout: [
      { type: "hero", template: "hero-5" },
      { type: "gallery", template: "gallery-3" },
      { type: "reservation", template: "reservation-3" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#37474F", secondary: "#CFD8DC", text: "#263238" },
    fontStyle: "Cormorant Garamond"
  },

  // ============================================================
  // 🥗 VEGAN & HEALTHY (素食健康)
  // ============================================================
  "vegan_green": {
    id: "vegan_green",
    label: "Organic Green (有机素食)",
    description: "Green vibes, mission focused.",
    tags: ["vegan", "vegetarian", "healthy", "green", "organic"],
    layout: [
      { type: "hero", template: "hero-11" },
      { type: "mission", template: "mission-3" },
      { type: "about", template: "about-5" },
      { type: "info", template: "info-8" }
    ],
    defaultColors: { primary: "#388E3C", secondary: "#C8E6C9", text: "#1B5E20" },
    fontStyle: "Nunito"
  },
  "vegan_modern": {
    id: "vegan_modern",
    label: "Chic Plant-Based (时尚素食)",
    description: "Modern, trendy layout for plant-based dining.",
    tags: ["vegan", "modern", "chic", "trendy", "healthy"],
    layout: [
      { type: "hero", template: "hero-4" },
      { type: "gallery", template: "gallery-3" },
      { type: "info", template: "info-2" }
    ],
    defaultColors: { primary: "#00695C", secondary: "#B2DFDB", text: "#FFFFFF" },
    fontStyle: "Manrope"
  },

  // ============================================================
  // 🍸 BAR & NIGHTLIFE (酒吧夜店)
  // ============================================================
  "bar_nightclub": {
    id: "bar_nightclub",
    label: "High Energy Club (夜店)",
    description: "Dark, loud, social media focused.",
    tags: ["bar", "club", "night", "party", "music", "dark"],
    layout: [
      { type: "hero", template: "hero-12" },
      { type: "instagram", template: "instagram-1" },
      { type: "gallery", template: "gallery-7" },
      { type: "info", template: "info-9" }
    ],
    defaultColors: { primary: "#000000", secondary: "#9C27B0", text: "#FFFFFF" },
    fontStyle: "Montserrat"
  },
  "bar_pub": {
    id: "bar_pub",
    label: "Classic Pub (英式酒馆)",
    description: "Traditional, hearty layout.",
    tags: ["bar", "pub", "beer", "sports", "casual"],
    layout: [
      { type: "hero", template: "hero-8" },
      { type: "popular", template: "popular-1" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#3E2723", secondary: "#FFC107", text: "#FFFFFF" },
    fontStyle: "Roboto Slab"
  },
  "bar_cocktail": {
    id: "bar_cocktail",
    label: "Speakeasy Lounge (鸡尾酒廊)",
    description: "Elegant, mysterious, reservation focused.",
    tags: ["bar", "cocktail", "lounge", "elegant", "date"],
    layout: [
      { type: "hero", template: "hero-9" },
      { type: "reservation", template: "reservation-4" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#121212", secondary: "#B0BEC5", text: "#FFFFFF" },
    fontStyle: "Playfair Display"
  },

  // ============================================================
  // 🌏 OTHER ASIAN (其他亚洲)
  // ============================================================
  "indian_curry": {
    id: "indian_curry",
    label: "Spice House (印度料理)",
    description: "Rich colors, catering focused.",
    tags: ["indian", "curry", "spicy", "rich", "buffet"],
    layout: [
      { type: "hero", template: "hero-6" },
      { type: "catering", template: "catering-2" },
      { type: "gallery", template: "gallery-5" },
      { type: "info", template: "info-3" }
    ],
    defaultColors: { primary: "#E65100", secondary: "#FFCC80", text: "#BF360C" },
    fontStyle: "Lora"
  },
  "thai_spicy": {
    id: "thai_spicy",
    label: "Thai Kitchen (泰式料理)",
    description: "Fresh, vibrant, energetic.",
    tags: ["thai", "spicy", "fresh", "noodles", "curry"],
    layout: [
      { type: "hero", template: "hero-10" },
      { type: "intro", template: "intro-2" },
      { type: "popular", template: "popular-1" },
      { type: "info", template: "info-7" }
    ],
    defaultColors: { primary: "#004D40", secondary: "#FFD740", text: "#FFFFFF" },
    fontStyle: "Kanit"
  },
  "vietnamese_pho": {
    id: "vietnamese_pho",
    label: "Pho House (越南河粉)",
    description: "Light, clean, soup focused.",
    tags: ["vietnamese", "pho", "soup", "noodles", "fresh"],
    layout: [
      { type: "hero", template: "hero-11" },
      { type: "about", template: "about-5" },
      { type: "info", template: "info-8" }
    ],
    defaultColors: { primary: "#33691E", secondary: "#DCEDC8", text: "#1B5E20" },
    fontStyle: "Nunito"
  },
  "korean_bbq": {
    id: "korean_bbq",
    label: "K-BBQ Grill (韩式烧烤)",
    description: "Social, grill focused, instagrammable.",
    tags: ["korean", "bbq", "grill", "meat", "social"],
    layout: [
      { type: "hero", template: "hero-8" },
      { type: "instagram", template: "instagram-1" },
      { type: "info", template: "info-10" }
    ],
    defaultColors: { primary: "#212121", secondary: "#FF5252", text: "#FFFFFF" },
    fontStyle: "Roboto"
  },

  // ============================================================
  // 🍦 SPECIALTY (特色)
  // ============================================================
  "dessert_ice_cream": {
    id: "dessert_ice_cream",
    label: "Ice Cream Parlor (冰淇淋店)",
    description: "Fun, colorful, kid-friendly.",
    tags: ["dessert", "ice_cream", "sweet", "fun", "kids"],
    layout: [
      { type: "hero", template: "hero-10" },
      { type: "gallery", template: "gallery-6" },
      { type: "info", template: "info-7" }
    ],
    defaultColors: { primary: "#4FC3F7", secondary: "#F8BBD0", text: "#01579B" },
    fontStyle: "Lobster"
  },
  "fast_food_chicken": {
    id: "fast_food_chicken",
    label: "Fried Chicken Joint (炸鸡店)",
    description: "Bold, fast, crispy.",
    tags: ["fast_food", "chicken", "fried", "crispy", "casual"],
    layout: [
      { type: "hero", template: "hero-2" },
      { type: "popular", template: "popular-1" },
      { type: "info", template: "info-5" }
    ],
    defaultColors: { primary: "#D50000", secondary: "#FFC107", text: "#FFFFFF" },
    fontStyle: "Anton"
  },
  "food_truck": {
    id: "food_truck",
    label: "Street Food Truck (餐车)",
    description: "Mobile, location focused, simple.",
    tags: ["food_truck", "street_food", "mobile", "casual"],
    layout: [
      { type: "modal", template: "modal-2" }, // Location alert
      { type: "hero", template: "hero-1" },
      { type: "instagram", template: "instagram-1" },
      { type: "info", template: "info-1" }
    ],
    defaultColors: { primary: "#455A64", secondary: "#CFD8DC", text: "#263238" },
    fontStyle: "Roboto Condensed"
  },
  "generic_modern": {
    id: "generic_modern",
    label: "Modern Standard (现代通用)",
    description: "Clean, professional, fits any cuisine.",
    tags: ["modern", "generic", "clean", "professional", "restaurant"],
    layout: [
      { type: "hero", template: "hero-14" },
      { type: "about", template: "about-4" },
      { type: "gallery", template: "gallery-9" },
      { type: "contact", template: "contact-1" },
      { type: "info", template: "info-11" }
    ],
    defaultColors: { primary: "#37474F", secondary: "#ECEFF1", text: "#263238" },
    fontStyle: "Inter"
  },
  "buffet_family": {
    id: "buffet_family",
    label: "Family Buffet (家庭自助)",
    description: "Info rich, value focused.",
    tags: ["buffet", "family", "value", "all_you_can_eat"],
    layout: [
      { type: "modal", template: "modal-1" },
      { type: "hero", template: "hero-13" },
      { type: "gallery", template: "gallery-8" },
      { type: "info", template: "info-10" }
    ],
    defaultColors: { primary: "#F57C00", secondary: "#FFF3E0", text: "#3E2723" },
    fontStyle: "Open Sans"
  },

  // ============================================================
  // 💎 PREMIUM & FUSION (NEW - Showcase Gallery 31-50)
  // ============================================================
  "premium_fusion_modern": {
    id: "premium_fusion_modern",
    label: "Modern Fusion Elite (精选创意菜)",
    description: "Ultra-premium layout showcasing the new Bento and 3D Gallery styles.",
    tags: ["fusion", "modern", "premium", "luxury", "creative", "high_end"],
    layout: [
      { type: "hero", template: "hero-51" },
      { type: "about", template: "about-23" },
      { type: "gallery", template: "gallery-31" },
      { type: "gallery", template: "gallery-46" },
      { type: "info", template: "info-6" }
    ],
    defaultColors: { primary: "#000000", secondary: "#C5A572", text: "#FFFFFF" },
    fontStyle: "Playfair Display"
  },
  "steakhouse_ultra_lux": {
    id: "steakhouse_ultra_lux",
    label: "Ultra-Lux Steakhouse (高端牛排馆)",
    description: "Cinematic experience with Parallax and Spotlight Gallery styles.",
    tags: ["steak", "luxury", "western", "wine", "cinematic", "dark_mode"],
    layout: [
      { type: "hero", template: "hero-9" },
      { type: "gallery", template: "gallery-33" },
      { type: "reservation", template: "reservation-3" },
      { type: "gallery", template: "gallery-40" },
      { type: "info", template: "info-11" }
    ],
    defaultColors: { primary: "#1A1A1A", secondary: "#D4AF37", text: "#FFFFFF" },
    fontStyle: "Cormorant Garamond"
  }
};


export const matchBlueprint = (aiTags) => {
  const candidates = Object.values(SITE_BLUEPRINTS).map(bp => {
    const score = bp.tags.filter(tag => 
      aiTags.some(aiTag => aiTag.toLowerCase().includes(tag) || tag.includes(aiTag.toLowerCase()))
    ).length;
    return { blueprint: bp, score };
  });

  candidates.sort((a, b) => b.score - a.score);
  const bestScore = candidates[0].score;

  if (bestScore === 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex].blueprint;
  }

  const topK = candidates.slice(0, 3).filter(c => c.score > 0); 
  const randomIndex = Math.floor(Math.random() * topK.length);
  return topK[randomIndex].blueprint;
};