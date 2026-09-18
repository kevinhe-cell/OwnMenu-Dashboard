import React from "react";
import {
  Star,
  Sparkles,
  Flame,
  Heart,
  Tag,
  BadgePercent,
  Drumstick,
  Beef,
  Ham,
  Fish,
  Soup,
  CookingPot,
  ChefHat,
  Pizza,
  Sandwich,
  Salad,
  Egg,
  Carrot,
  Leaf,
  Apple,
  Banana,
  Citrus,
  Grape,
  Cherry,
  Croissant,
  Wheat,
  Cake,
  IceCream,
  Cookie,
  Popcorn,
  Candy,
  Lollipop,
  CupSoda,
  GlassWater,
  Coffee,
  Beer,
  Wine,
  Martini,
  Milk,
  Baby,
  Boxes,
  Package,
  PartyPopper,
  ShieldAlert,
  Utensils,
  Receipt,
  Gift,
  Coins,
  CircleDollarSign,
} from "lucide-react";
import {
  FaCrown,
  FaTrophy,
  FaThumbsUp,
  FaPizzaSlice,
  FaBurger,
  FaBowlFood,
  FaFishFins,
  FaCakeCandles,
  FaLeaf,
  FaMugHot,
  FaBeerMugEmpty,
  FaWineBottle,
  FaTicket,
  FaSackDollar,
  FaMoneyBillWave,
  FaDiceThree,
  FaDiceFour,
  FaDiceFive,
  FaClover,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import {
  GiDumpling,
  GiNoodles,
  GiBowlOfRice,
  GiChopsticks,
  GiSushis,
  GiBoba,
  GiHotMeal,
  GiRoastChicken,
  GiDonerKebab,
  GiChickenLeg,
  GiChickenOven,
  GiSteak,
  GiMeat,
  GiBacon,
  GiSausage,
  GiFishCooked,
  GiShrimp,
  GiCrab,
  GiCrabClaw,
  GiSquid,
  GiOyster,
  GiHamburger,
  GiFrenchFries,
  GiHotDog,
  GiTacos,
  GiCheeseWedge,
  GiFriedEggs,
  GiAvocado,
  GiTomato,
  GiPotato,
  GiCorn,
  GiCabbage,
  GiMushroomGills,
  GiGarlic,
  GiBellPepper,
  GiPeanut,
  GiPeach,
  GiSlicedBread,
  GiPretzel,
  GiCupcake,
  GiCakeSlice,
  GiDonut,
  GiIceCreamCone,
  GiTeapot,
  GiMilkCarton,
  GiBeerBottle,
  GiBeerStein,
  GiWineGlass,
  GiDrinkMe,
  GiMeal,
  GiPaperBagFolded,
  GiChiliPepper,
} from "react-icons/gi";

// NOTE: 全美餐厅与菜品全品类分类精选图标库 (涵盖美餐、中餐、日韩泰、意墨等全美主流餐饮菜系)
export const CATEGORY_ICONS = [
  // ⭐ 热门与招牌 (Featured & Popular)
  { key: "popular", label: "Popular / 热门推荐", category: "Featured & Popular", icon: Star, keywords: ["popular", "star", "featured", "top", "热门", "推荐", "必点", "星标"] },
  { key: "chef-special", label: "Chef's Specials / 主厨招牌", category: "Featured & Popular", icon: FaCrown, keywords: ["chef", "special", "crown", "signature", "招牌", "主厨特选", "皇冠"] },
  { key: "best-seller", label: "Best Sellers / 销量冠军", category: "Featured & Popular", icon: FaTrophy, keywords: ["best seller", "trophy", "top 1", "热销", "销冠", "榜首", "金牌"] },
  { key: "recommended", label: "Recommended / 强烈推荐", category: "Featured & Popular", icon: FaThumbsUp, keywords: ["recommend", "like", "thumbs", "推荐", "好评", "点赞"] },
  { key: "new-items", label: "New Dishes / 特色新品", category: "Featured & Popular", icon: Sparkles, keywords: ["new", "special", "sparkles", "新品", "尝鲜", "特制"] },
  { key: "spicy", label: "Spicy / 麻辣辣味", category: "Featured & Popular", icon: Flame, keywords: ["spicy", "hot", "flame", "chili", "辣", "麻辣", "微辣", "香辣"] },
  { key: "extra-spicy", label: "Extra Spicy / 变态爆辣", category: "Featured & Popular", icon: GiChiliPepper, keywords: ["extra spicy", "very hot", "pepper", "特辣", "变态辣", "魔鬼辣"] },
  { key: "special-deals", label: "Special Deals / 每日特惠", category: "Featured & Popular", icon: Tag, keywords: ["deal", "discount", "offer", "sale", "特惠", "打折", "特价"] },
  { key: "promotions", label: "Promotions / 折扣立减", category: "Featured & Popular", icon: BadgePercent, keywords: ["promo", "percent", "coupon", "折扣", "优惠", "立减"] },

  // 🥗 前菜、沙拉与汤羹 (Appetizers, Soups & Salads)
  { key: "appetizers", label: "Appetizers / 前菜头盘", category: "Appetizers & Soups", icon: Utensils, keywords: ["appetizer", "starter", "utensils", "前菜", "头盘", "开胃菜"] },
  { key: "wings", label: "Buffalo Wings / 水牛城鸡翅", category: "Appetizers & Soups", icon: GiChickenOven, keywords: ["wings", "buffalo", "chicken wings", "鸡翅", "烤翅", "水牛城鸡翅"] },
  { key: "tapas", label: "Small Plates & Tapas / 精致小食", category: "Appetizers & Soups", icon: Utensils, keywords: ["tapas", "small plates", "bites", "小食", "下酒菜", "轻食小点"] },
  { key: "spring-rolls", label: "Egg Rolls & Spring Rolls / 春卷蛋卷", category: "Appetizers & Soups", icon: GiDumpling, keywords: ["spring roll", "egg roll", "crispy", "春卷", "蛋卷", "炸春卷"] },
  { key: "nachos", label: "Nachos & Dips / 玉米片蘸酱", category: "Appetizers & Soups", icon: GiTacos, keywords: ["nachos", "chips", "salsa", "guacamole", "玉米片", "墨西哥脆片", "芝士酱"] },
  { key: "calamari", label: "Calamari / 酥炸鱿鱼圈", category: "Appetizers & Soups", icon: GiSquid, keywords: ["calamari", "fried squid", "appetizer", "炸鱿鱼", "鱿鱼圈", "酥炸海鲜"] },
  { key: "soup", label: "Soups & Chowder / 浓汤例汤", category: "Appetizers & Soups", icon: Soup, keywords: ["soup", "chowder", "clam chowder", "broth", "浓汤", "海鲜浓汤", "鸡汤", "每日例汤"] },
  { key: "wonton-soup", label: "Wonton & Noodle Soup / 云吞汤面", category: "Appetizers & Soups", icon: FaBowlFood, keywords: ["wonton", "soup", "chinese soup", "云吞", "馄饨", "酸辣汤", "蛋花汤"] },
  { key: "pot-soup", label: "Hot Pot & Stew / 砂锅炖汤", category: "Appetizers & Soups", icon: CookingPot, keywords: ["stew", "hot pot", "casserole", "砂锅", "炖汤", "煲汤", "靓汤"] },
  { key: "salad", label: "Salads / 经典蔬菜沙拉", category: "Appetizers & Soups", icon: Salad, keywords: ["salad", "greens", "fresh", "沙拉", "蔬菜沙拉", "生菜"] },
  { key: "caesar-salad", label: "Caesar & Cobb / 凯撒科布沙拉", category: "Appetizers & Soups", icon: Salad, keywords: ["caesar", "cobb", "wedge", "凯撒沙拉", "科布沙拉", "主厨沙拉"] },

  // 🍔 汉堡、三明治与卷饼 (Burgers, Sandwiches & Subs)
  { key: "burger", label: "Burgers & Cheeseburgers / 美式汉堡", category: "Burgers & Sandwiches", icon: FaBurger, keywords: ["burger", "cheeseburger", "beef burger", "汉堡", "美式汉堡", "芝士汉堡", "牛肉堡"] },
  { key: "smash-burger", label: "Smash Burger / 双层压烤汉堡", category: "Burgers & Sandwiches", icon: GiHamburger, keywords: ["smash burger", "double burger", "压烤汉堡", "双层汉堡", "厚牛堡"] },
  { key: "sandwich", label: "Sandwiches & Melts / 三明治", category: "Burgers & Sandwiches", icon: Sandwich, keywords: ["sandwich", "club", "blt", "reuben", "三明治", "俱乐部三明治", "热压三明治"] },
  { key: "sub-hoagie", label: "Subs & Hoagies / 潜艇堡长棍", category: "Burgers & Sandwiches", icon: GiSlicedBread, keywords: ["sub", "hoagie", "grinder", "philly", "潜艇堡", "费城牛肉堡", "热狗长包"] },
  { key: "wraps", label: "Wraps & Roll-ups / 墨西哥鸡肉卷", category: "Burgers & Sandwiches", icon: Sandwich, keywords: ["wrap", "chicken wrap", "roll", "鸡肉卷", "墨西哥卷", "卷饼"] },
  { key: "hot-dog", label: "Hot Dogs & Sausages / 美式热狗", category: "Burgers & Sandwiches", icon: GiHotDog, keywords: ["hot dog", "sausage", "corn dog", "热狗", "香肠热狗", "玉米热狗棒"] },
  { key: "sliders", label: "Sliders / 迷你小汉堡", category: "Burgers & Sandwiches", icon: FaBurger, keywords: ["sliders", "mini burger", "bites", "小汉堡", "迷你堡", "滑块堡"] },

  // 🍕 披萨、意面与焗烤 (Pizza, Pasta & Italian)
  { key: "pizza", label: "Pizzas / 经典美式意式披萨", category: "Pizza & Pasta", icon: Pizza, keywords: ["pizza", "pepperoni", "cheese", "margherita", "披萨", "比萨", "意式披萨", "深盘披萨"] },
  { key: "pizza-slice", label: "Pizza Slice / 单片切角披萨", category: "Pizza & Pasta", icon: FaPizzaSlice, keywords: ["pizza slice", "single", "披萨切片", "切角披萨"] },
  { key: "calzone", label: "Calzones & Stromboli / 意式烤馅饼", category: "Pizza & Pasta", icon: Croissant, keywords: ["calzone", "stromboli", "baked", "烤馅饼", "意式披萨饺", "奶酪卷"] },
  { key: "pasta", label: "Pasta & Spaghetti / 意大利面", category: "Pizza & Pasta", icon: GiNoodles, keywords: ["pasta", "spaghetti", "fettuccine", "alfredo", "意面", "意大利面", "肉酱面", "白酱面"] },
  { key: "lasagna", label: "Lasagna & Baked Pasta / 焗烤千层面", category: "Pizza & Pasta", icon: FaBowlFood, keywords: ["lasagna", "baked ziti", "pasta bake", "千层面", "焗面", "芝士焗通心粉"] },
  { key: "garlic-bread", label: "Garlic Bread & Breadsticks / 蒜香面包", category: "Pizza & Pasta", icon: GiSlicedBread, keywords: ["garlic bread", "breadsticks", "蒜香面包", "面包棒", "意式法棍"] },

  // 🥩 牛排、肉禽与美式烧烤 (Steaks, Ribs & BBQ)
  { key: "steak", label: "Prime Steaks / 顶级牛排 (Ribeye/Strip/T-Bone)", category: "Steaks & BBQ", icon: GiSteak, keywords: ["steak", "ribeye", "sirloin", "t-bone", "filet", "牛排", "眼肉", "西冷", "菲力", "战斧牛排"] },
  { key: "beef-entrees", label: "Beef & Brisket / 牛肉与牛胸肉", category: "Steaks & BBQ", icon: Beef, keywords: ["beef", "brisket", "roast beef", "牛肉", "牛胸肉", "炖牛肉", "黑椒牛柳"] },
  { key: "bbq-ribs", label: "BBQ Ribs / 经典烟熏美式排骨", category: "Steaks & BBQ", icon: GiBacon, keywords: ["ribs", "bbq", "baby back", "st louis", "烤排骨", "美式肋排", "猪肋骨"] },
  { key: "pulled-pork", label: "Pulled Pork & BBQ Pork / 手撕猪肉", category: "Steaks & BBQ", icon: Ham, keywords: ["pulled pork", "smoked pork", "bbq", "手撕猪肉", "烟熏猪肉", "叉烧"] },
  { key: "chicken-entrees", label: "Chicken Entrees / 鸡肉主菜", category: "Steaks & BBQ", icon: Drumstick, keywords: ["chicken", "poultry", "roast chicken", "烤鸡", "鸡胸肉", "香煎鸡排", "黄焖鸡"] },
  { key: "fried-chicken", label: "Fried Chicken / 黄金酥脆炸鸡", category: "Steaks & BBQ", icon: GiChickenLeg, keywords: ["fried chicken", "tenders", "crispy", "炸鸡", "炸鸡柳", "香酥鸡块", "吮指原味鸡"] },
  { key: "roast-duck", label: "Roast Duck & Meats / 烤鸭烧腊", category: "Steaks & BBQ", icon: GiRoastChicken, keywords: ["roast duck", "bbq pork", "cantonese", "烤鸭", "北京烤鸭", "烧腊", "烧鸭"] },
  { key: "skewers", label: "Kebabs & Skewers / 烤肉串串烧", category: "Steaks & BBQ", icon: GiDonerKebab, keywords: ["kebab", "skewer", "satay", "烤串", "羊肉串", "牛肉串", "串烧"] },
  { key: "sausages", label: "Grilled Sausages / 德式香肠烤肠", category: "Steaks & BBQ", icon: GiSausage, keywords: ["sausage", "bratwurst", "chorizo", "香肠", "德式烤肠", "腊肠"] },
  { key: "meat-platter", label: "Meat Platters / 豪华全肉拼盘", category: "Steaks & BBQ", icon: GiMeat, keywords: ["meat platter", "mixed grill", "combo", "大肉拼盘", "烧烤大拼盘", "肉食盛宴"] },

  // 🦐 海鲜、鱼类与生鲜吧 (Seafood & Fish)
  { key: "fish-chips", label: "Fish & Chips / 经典炸鱼薯条", category: "Seafood & Fish", icon: Fish, keywords: ["fish and chips", "fried fish", "cod", "炸鱼薯条", "炸鳕鱼", "英式炸鱼"] },
  { key: "salmon", label: "Grilled Salmon / 香煎三文鱼", category: "Seafood & Fish", icon: FaFishFins, keywords: ["salmon", "grilled fish", "fillet", "三文鱼", "香煎三文鱼", "鱼排"] },
  { key: "shrimp-entrees", label: "Shrimp & Prawns / 大虾与椰子虾", category: "Seafood & Fish", icon: GiShrimp, keywords: ["shrimp", "prawn", "coconut shrimp", "fried shrimp", "大虾", "炸虾", "椰子虾", "油爆虾"] },
  { key: "crab-lobster", label: "Crab & Lobster / 龙虾螃蟹与海鲜桶", category: "Seafood & Fish", icon: GiCrab, keywords: ["crab", "lobster", "cajun boil", "seafood boil", "龙虾", "大闸蟹", "帝王蟹", "海鲜大咖", "海鲜桶"] },
  { key: "crab-cakes", label: "Crab Cakes / 马里兰蟹肉饼", category: "Seafood & Fish", icon: GiCrabClaw, keywords: ["crab cake", "maryland", "crab claw", "蟹饼", "蟹肉饼", "蟹钳"] },
  { key: "oysters-raw", label: "Oysters & Raw Bar / 生蚝生鲜吧", category: "Seafood & Fish", icon: GiOyster, keywords: ["oyster", "raw bar", "clam", "mussel", "生蚝", "牡蛎", "青口贝", "扇贝"] },
  { key: "cooked-fish", label: "Whole Fish / 烤鱼水煮鱼", category: "Seafood & Fish", icon: GiFishCooked, keywords: ["whole fish", "baked fish", "chinese fish", "烤鱼", "水煮鱼", "酸菜鱼", "清蒸鱼"] },

  // 🌮 墨西哥与德州风味 (Mexican & Tex-Mex)
  { key: "tacos", label: "Tacos / 墨西哥塔可 (Street / Birria)", category: "Mexican & Tacos", icon: GiTacos, keywords: ["taco", "birria", "street taco", "塔可", "墨西哥塔可", "玉米饼卷肉"] },
  { key: "burritos", label: "Burritos & Bowls / 墨西哥大卷饼碗", category: "Mexican & Tacos", icon: GiTacos, keywords: ["burrito", "burrito bowl", "mexican", "大卷饼", "墨西哥碗", "芝士卷"] },
  { key: "fajitas", label: "Fajitas & Skillets / 铁板法吉塔", category: "Mexican & Tacos", icon: GiHotMeal, keywords: ["fajitas", "skillet", "sizzling", "法吉塔", "铁板肉", "铁板牛肉"] },
  { key: "quesadillas", label: "Quesadillas / 墨西哥芝士薄饼", category: "Mexican & Tacos", icon: GiCheeseWedge, keywords: ["quesadilla", "cheese", "mexican", "薄饼", "芝士薄饼", "馅饼"] },

  // 🥟 中餐、美式中餐与亚洲美食 (Asian & Chinese-American)
  { key: "general-tso", label: "Chinese Specialties / 左宗鸡陈皮鸡", category: "Asian & Chinese", icon: ChefHat, keywords: ["general tso", "orange chicken", "sesame chicken", "左宗棠鸡", "陈皮鸡", "芝麻鸡", "甜酸鸡"] },
  { key: "dumplings", label: "Dumplings & Potstickers / 锅贴水饺", category: "Asian & Chinese", icon: GiDumpling, keywords: ["dumpling", "potsticker", "jiaozi", "饺子", "水饺", "煎饺", "锅贴"] },
  { key: "dimsum", label: "Dim Sum & Buns / 广式点心包子", category: "Asian & Chinese", icon: GiDumpling, keywords: ["dim sum", "bao", "siu mai", "点心", "包子", "小笼包", "烧麦"] },
  { key: "noodles-asian", label: "Lo Mein & Chow Mein / 炒面捞面拉面", category: "Asian & Chinese", icon: GiNoodles, keywords: ["lo mein", "chow mein", "ramen", "pad thai", "捞面", "炒面", "拉面", "炒河粉", "泰式炒粉"] },
  { key: "fried-rice", label: "Fried Rice / 经典中式炒饭", category: "Asian & Chinese", icon: GiBowlOfRice, keywords: ["fried rice", "rice bowl", "yangzhou", "炒饭", "扬州炒饭", "鸡肉炒饭", "盖浇饭"] },
  { key: "wok-dishes", label: "Wok Dishes / 传统中餐热炒", category: "Asian & Chinese", icon: GiChopsticks, keywords: ["wok", "chinese food", "stir fry", "热炒", "中餐小炒", "炒菜", "小炒肉"] },
  { key: "hot-pot", label: "Hot Pot & Dry Pot / 火锅与麻辣香锅", category: "Asian & Chinese", icon: GiHotMeal, keywords: ["hot pot", "dry pot", "mala", "火锅", "干锅", "麻辣香锅", "麻辣烫"] },
  { key: "sushi", label: "Sushi & Rolls / 寿司加州卷刺身", category: "Asian & Chinese", icon: GiSushis, keywords: ["sushi", "roll", "california roll", "sashimi", "寿司", "加州卷", "日料", "刺身"] },
  { key: "teriyaki-hibachi", label: "Teriyaki & Hibachi / 照烧与铁板烧", category: "Asian & Chinese", icon: GiHotMeal, keywords: ["teriyaki", "hibachi", "japanese grill", "照烧", "铁板烧", "日式便当"] },
  { key: "boba-tea", label: "Bubble Tea / 珍珠奶茶果茶", category: "Asian & Chinese", icon: GiBoba, keywords: ["boba", "bubble tea", "milk tea", "fruit tea", "奶茶", "珍珠奶茶", "水果茶", "波霸"] },

  // 🥞 美式早餐与早午餐 (Breakfast & Brunch)
  { key: "pancakes", label: "Pancakes & Flapjacks / 美式松饼热香饼", category: "Breakfast & Brunch", icon: Croissant, keywords: ["pancake", "flapjack", "syrup", "美式煎饼", "松饼", "热香饼", "枫糖松饼"] },
  { key: "waffles", label: "Belgian Waffles / 比利时华夫饼", category: "Breakfast & Brunch", icon: GiPretzel, keywords: ["waffle", "belgian waffle", "crispy", "华夫饼", "格子饼", "比利时华夫"] },
  { key: "french-toast", label: "French Toast & Bagels / 法式吐司与贝果", category: "Breakfast & Brunch", icon: GiSlicedBread, keywords: ["french toast", "bagel", "toast", "法式吐司", "贝果", "烤面包"] },
  { key: "eggs-breakfast", label: "Eggs & Omelets / 班尼迪克蛋与煎蛋卷", category: "Breakfast & Brunch", icon: GiFriedEggs, keywords: ["eggs", "benedict", "omelet", "scrambled", "煎蛋", "班尼迪克蛋", "美式蛋卷", "炒蛋"] },
  { key: "breakfast-combo", label: "All-Day Breakfast / 美式全日早餐大拼盘", category: "Breakfast & Brunch", icon: Egg, keywords: ["all day breakfast", "combo", "diner", "全日早餐", "早午餐", "美式早茶", "早餐拼盘"] },
  { key: "bacon-sausage", label: "Bacon & Hash Browns / 培根早茶肠薯饼", category: "Breakfast & Brunch", icon: GiBacon, keywords: ["bacon", "breakfast sausage", "hash browns", "培根", "早餐肠", "薯饼"] },
  { key: "croissants-pastry", label: "Croissants & Bakery / 酥皮可颂牛角包", category: "Breakfast & Brunch", icon: Croissant, keywords: ["croissant", "pastry", "bakery", "可颂", "牛角包", "法式面包", "烘焙"] },

  // 🍟 配菜、炸物与加料 (Sides & Extras)
  { key: "french-fries", label: "French Fries / 美式炸薯条", category: "Sides & Extras", icon: GiFrenchFries, keywords: ["fries", "french fries", "tater tots", "薯条", "炸薯条", "薯角", "薯球"] },
  { key: "mashed-potatoes", label: "Mashed Potatoes / 土豆泥肉汁", category: "Sides & Extras", icon: GiPotato, keywords: ["mashed potato", "gravy", "potato", "土豆泥", "肉汁土豆泥", "马铃薯"] },
  { key: "mac-cheese", label: "Mac & Cheese / 芝士通心粉", category: "Sides & Extras", icon: GiCheeseWedge, keywords: ["mac and cheese", "macaroni", "cheese", "芝士通心粉", "通心面"] },
  { key: "corn-cob", label: "Corn on the Cob / 甜玉米棒", category: "Sides & Extras", icon: GiCorn, keywords: ["corn", "sweet corn", "corn cob", "玉米棒", "甜玉米", "奶油玉米"] },
  { key: "coleslaw", label: "Coleslaw & Pickles / 卷心菜沙拉酸黄瓜", category: "Sides & Extras", icon: GiCabbage, keywords: ["coleslaw", "pickles", "side", "卷心菜沙拉", "酸黄瓜", "泡菜", "小菜"] },
  { key: "popcorn-snack", label: "Snacks & Finger Foods / 休闲小吃爆米花", category: "Sides & Extras", icon: Popcorn, keywords: ["popcorn", "chips", "finger food", "小吃", "零食", "爆米花", "炸物"] },

  // 🍃 素食、健康轻食与蔬果 (Vegetarian & Healthy)
  { key: "vegetarian", label: "Vegetarian / 蛋奶素食清真", category: "Vegetarian & Healthy", icon: Leaf, keywords: ["vegetarian", "veggie", "green", "素食", "健康", "绿色", "清真"] },
  { key: "vegan", label: "Vegan & Plant-Based / 纯素植物肉", category: "Vegetarian & Healthy", icon: FaLeaf, keywords: ["vegan", "plant based", "impossible", "beyond", "纯素", "全素", "植物肉", "素肉"] },
  { key: "avocado-bowls", label: "Avocado & Grain Bowls / 牛油果能量碗", category: "Vegetarian & Healthy", icon: GiAvocado, keywords: ["avocado", "grain bowl", "poke", "牛油果", "鳄梨", "谷物碗", "波奇碗"] },
  { key: "fresh-fruits", label: "Fresh Fruits / 新鲜水果拼盘", category: "Vegetarian & Healthy", icon: Apple, keywords: ["fruit", "apple", "fresh", "水果", "果盘", "鲜果"] },
  { key: "veggies", label: "Roasted Vegetables / 烤时蔬胡萝卜", category: "Vegetarian & Healthy", icon: Carrot, keywords: ["veggies", "carrot", "broccoli", "蔬菜", "炒时蔬", "胡萝卜", "西兰花"] },
  { key: "mushrooms", label: "Mushrooms & Truffle / 鲜菇菌菇松露", category: "Vegetarian & Healthy", icon: GiMushroomGills, keywords: ["mushroom", "truffle", "fungi", "蘑菇", "鲜菇", "松露", "香菇"] },
  { key: "nuts-grains", label: "Nuts & Grains / 坚果燕麦谷物", category: "Vegetarian & Healthy", icon: GiPeanut, keywords: ["nuts", "grains", "oatmeal", "坚果", "花生", "燕麦", "豆类"] },

  // 👶 儿童餐、家庭套装与团餐 (Kids, Family & Catering)
  { key: "kids-menu", label: "Kids Menu / 儿童专属套餐", category: "Kids & Family", icon: Baby, keywords: ["kids", "children", "baby", "tenders", "儿童餐", "宝宝餐", "儿童套餐"] },
  { key: "family-pack", label: "Family Meal / 超值家庭大套餐", category: "Kids & Family", icon: GiMeal, keywords: ["family meal", "family pack", "combo", "家庭餐", "多人套餐", "全家福"] },
  { key: "catering-trays", label: "Catering Trays / 派对团餐大托盘", category: "Kids & Family", icon: Boxes, keywords: ["catering", "party trays", "large order", "团餐", "宴请", "大托盘", "宴席大单"] },
  { key: "takeout-combo", label: "Takeout Combos / 双人外卖套餐", category: "Kids & Family", icon: Package, keywords: ["takeout", "to go", "box", "外卖套餐", "双人餐", "打包盒"] },
  { key: "party-platters", label: "Party Feasts / 派对聚餐盛宴", category: "Kids & Family", icon: PartyPopper, keywords: ["party", "celebration", "feast", "聚会", "派对餐", "年会", "庆典"] },

  // 🍰 蛋糕、甜点与冰淇淋 (Desserts & Ice Cream)
  { key: "cheesecake", label: "Cheesecake & Cakes / 纽约芝士蛋糕", category: "Desserts & Sweets", icon: Cake, keywords: ["cheesecake", "cake", "new york", "芝士蛋糕", "乳酪蛋糕", "提拉米苏"] },
  { key: "birthday-cake", label: "Whole Cakes / 生日整只蛋糕", category: "Desserts & Sweets", icon: FaCakeCandles, keywords: ["birthday cake", "celebration cake", "生日蛋糕", "整只蛋糕", "庆生"] },
  { key: "cupcakes", label: "Cupcakes & Pastries / 纸杯蛋糕西点", category: "Desserts & Sweets", icon: GiCupcake, keywords: ["cupcake", "pastry", "muffin", "纸杯蛋糕", "马芬", "西点"] },
  { key: "pies-tarts", label: "Pies & Tarts / 美式苹果派蛋挞", category: "Desserts & Sweets", icon: GiCakeSlice, keywords: ["pie", "apple pie", "pecan pie", "tart", "苹果派", "核桃派", "南瓜派", "蛋挞"] },
  { key: "ice-cream", label: "Ice Cream & Sundaes / 冰淇淋圣代", category: "Desserts & Sweets", icon: IceCream, keywords: ["ice cream", "sundae", "gelato", "冰淇淋", "圣代", "意大利雪糕", "冰品"] },
  { key: "ice-cream-cones", label: "Cones & Pops / 蛋筒甜筒雪糕", category: "Desserts & Sweets", icon: GiIceCreamCone, keywords: ["cone", "popsicle", "soft serve", "甜筒", "蛋筒", "冰棒", "雪糕"] },
  { key: "donuts", label: "Donuts & Churros / 美式甜甜圈吉事果", category: "Desserts & Sweets", icon: GiDonut, keywords: ["donut", "churro", "doughnut", "甜甜圈", "多拿滋", "吉事果"] },
  { key: "cookies-brownies", label: "Cookies & Brownies / 曲奇布朗尼", category: "Desserts & Sweets", icon: Cookie, keywords: ["cookie", "brownie", "chocolate chip", "曲奇", "布朗尼", "巧克力饼干"] },
  { key: "candies", label: "Candies & Chocolates / 糖果巧克力", category: "Desserts & Sweets", icon: Candy, keywords: ["candy", "chocolate", "sweet", "糖果", "巧克力", "棒棒糖"] },

  // 🥤 饮料、咖啡与茶饮 (Beverages, Coffee & Tea)
  { key: "soda", label: "Fountain Soda / 碳酸汽水冷饮", category: "Beverages & Coffee", icon: CupSoda, keywords: ["soda", "fountain drink", "coke", "sprite", "汽水", "可乐", "雪碧", "冷饮"] },
  { key: "water", label: "Spring Water / 纯净水矿泉水", category: "Beverages & Coffee", icon: GlassWater, keywords: ["water", "bottled water", "mineral", "矿泉水", "纯净水", "饮用水", "冰水"] },
  { key: "coffee", label: "Fresh Brew Coffee / 现磨咖啡拿铁", category: "Beverages & Coffee", icon: Coffee, keywords: ["coffee", "espresso", "latte", "cappuccino", "咖啡", "美式", "拿铁", "卡布奇诺"] },
  { key: "hot-tea", label: "Hot Tea & Herbal / 热茶果茶", category: "Beverages & Coffee", icon: FaMugHot, keywords: ["tea", "hot tea", "herbal", "green tea", "热茶", "红茶", "绿茶", "花草茶"] },
  { key: "chinese-tea", label: "Teapot / 功夫茶壶", category: "Beverages & Coffee", icon: GiTeapot, keywords: ["teapot", "kungfu tea", "oolong", "茶壶", "乌龙茶", "普洱", "功夫茶"] },
  { key: "milk-dairy", label: "Milk & Milkshakes / 鲜奶奶昔", category: "Beverages & Coffee", icon: Milk, keywords: ["milk", "milkshake", "dairy", "牛奶", "鲜奶", "奶昔", "豆奶"] },
  { key: "smoothies", label: "Smoothies & Juices / 鲜榨果汁冰沙", category: "Beverages & Coffee", icon: GiDrinkMe, keywords: ["smoothie", "fresh juice", "slush", "果昔", "鲜榨果汁", "冰沙"] },

  // 🍺 啤酒、红酒与鸡尾酒吧 (Beer, Wine & Cocktails)
  { key: "draft-beer", label: "Draft Beer / 大扎生啤扎啤", category: "Beer & Wine Bar", icon: FaBeerMugEmpty, keywords: ["draft beer", "tap beer", "mug", "生啤", "扎啤", "大杯啤酒"] },
  { key: "craft-beer", label: "Craft & Bottled Beer / 瓶装精酿啤酒", category: "Beer & Wine Bar", icon: GiBeerBottle, keywords: ["beer", "craft beer", "ipa", "lager", "精酿啤酒", "瓶装啤酒", "黑啤", "白啤"] },
  { key: "beer-stein", label: "German Beer Stein / 德国精酿大杯", category: "Beer & Wine Bar", icon: GiBeerStein, keywords: ["beer stein", "octoberfest", "精酿杯", "德国啤酒"] },
  { key: "wine-glass", label: "Fine Wine / 精选高脚杯红白葡萄酒", category: "Beer & Wine Bar", icon: Wine, keywords: ["wine", "red wine", "white wine", "cabernet", "红酒", "白葡萄酒", "干红", "高脚杯"] },
  { key: "wine-bottle", label: "Wine Bottles / 庄园整瓶名酒", category: "Beer & Wine Bar", icon: FaWineBottle, keywords: ["wine bottle", "cellar", "champagne", "整瓶红酒", "香槟", "名庄酒"] },
  { key: "cocktails", label: "Cocktails & Spirits / 鸡尾酒烈酒特调", category: "Beer & Wine Bar", icon: Martini, keywords: ["cocktail", "martini", "margarita", "liquor", "鸡尾酒", "马天尼", "玛格丽特", "烈酒", "特调"] },

  // 🛡️ 饮食标签、说明与服务 (Dietary & Service Info)
  { key: "allergen-info", label: "Allergen Info / 过敏原与健康提示", category: "Dietary & Service", icon: ShieldAlert, keywords: ["allergen", "nut free", "gluten free", "warning", "过敏原", "无坚果", "无麸质", "健康提示", "安全说明"] },
  { key: "halal-kosher", label: "Halal & Kosher / 清真与洁食认证", category: "Dietary & Service", icon: FaLeaf, keywords: ["halal", "kosher", "certified", "清真", "洁食", "清真认证"] },
  { key: "catering-service", label: "Catering Services / 宴席包桌服务", category: "Dietary & Service", icon: Boxes, keywords: ["catering service", "banquet", "包桌", "宴席服务", "大宗宴请"] },
];

export const CATEGORY_ICON_MAP = CATEGORY_ICONS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

/**
 * 统一分类图标渲染组件
 * 支持预设矢量图标 key、外链图片 URL (http/https/data:) 或自定义图标
 * @param {string} name 图标 key 或图片 URL
 * @param {number} size 图标尺寸 (默认 18)
 * @param {string} className 样式类名
 * @param {object} style 内联样式
 */
export function CategoryIcon({ name, size = 18, className = "", style = {} }) {
  if (!name || typeof name !== "string") return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  // 1. 如果是图片 URL / SVG 链接 / Base64 图片
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  ) {
    return (
      <img
        src={trimmed}
        alt="Category icon"
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          ...style,
        }}
      />
    );
  }

  // 2. 精确匹配预设图标 Key
  const config = CATEGORY_ICON_MAP[trimmed] || CATEGORY_ICON_MAP[trimmed.toLowerCase()];
  if (config && config.icon) {
    const IconComponent = config.icon;
    return <IconComponent size={size} className={className} style={style} />;
  }

  return null;
}

export default CategoryIcon;
