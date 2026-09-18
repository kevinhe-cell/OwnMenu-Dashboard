const CTA_OPTIONS = [
  { label: "Menu", value: "/menu" },
  { label: "Order Online", value: "/online-order" }
];

export const SECTION_TEMPLATES = {
  // ================= HERO SECTIONS (1-18) =================
  ...Array.from({ length: 18 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`hero-${i}`]: {
      name: `Hero Style ${i}`,
      type: "hero",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "cta_text", label: "Button Text", type: "text" },
        { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
        { key: "image_url", label: "Background Image", type: "image" }
      ]
    }
  }), {}),

  // ================= NEW HERO 19 (Video Support) =================
  "hero-19": {
    name: "Hero Style 19",
    type: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "video_url", label: "Background Video", type: "media", placeholder: "Upload background video or image" },
      { key: "image_url", label: "Poster Image", type: "image" }
    ]
  },

  // ================= NEW HERO 20 =================
  "hero-20": {
    name: "Hero Style 20",
    type: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" }
    ]
  },

  // ================= NEW HERO 21 (Multi-Image) =================
  "hero-21": {
    name: "Hero Style 21",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Primary Button Text", type: "text" },
      { key: "cta_link", label: "Primary Button Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Secondary Button Text", type: "text" },
      { key: "cta_link_2", label: "Secondary Button Link", type: "select", options: CTA_OPTIONS },
      // 8 Images for Slider
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" },
      { key: "image_url4", label: "Image 4", type: "image" },
      { key: "image_url5", label: "Image 5", type: "image" },
      { key: "image_url6", label: "Image 6", type: "image" },
      { key: "image_url7", label: "Image 7", type: "image" },
      { key: "image_url8", label: "Image 8", type: "image" }
    ]
  },

  // ================= NEW HERO 22 (Multi-Image) =================
  "hero-22": {
    name: "Hero Style 22",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Primary Button Text", type: "text" },
      { key: "cta_link", label: "Primary Button Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Secondary Button Text", type: "text" },
      { key: "cta_link_2", label: "Secondary Button Link", type: "select", options: CTA_OPTIONS },
      // 8 Images for Slider
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" },
      { key: "image_url4", label: "Image 4", type: "image" },
      { key: "image_url5", label: "Image 5", type: "image" },
      { key: "image_url6", label: "Image 6", type: "image" },
      { key: "image_url7", label: "Image 7", type: "image" },
      { key: "image_url8", label: "Image 8", type: "image" }
    ]
  },

  // ================= NEW HERO 23 (4-Image Grid) =================
  "hero-23": {
    name: "Hero Style 23",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button 1 Text", type: "text" },
      { key: "cta_link", label: "Button 1 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Button 2 Text", type: "text" },
      { key: "cta_link_2", label: "Button 2 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_3", label: "Button 3 Text", type: "text" },
      { key: "cta_link_3", label: "Button 3 Link", type: "select", options: CTA_OPTIONS },
      // 4 Images for Grid
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" },
      { key: "image_url4", label: "Image 4", type: "image" }
    ]
  },

  // ================= NEW HERO 24 (3 Images & Video) =================
  "hero-24": {
    name: "Hero Style 24",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button 1 Text", type: "text" },
      { key: "cta_link", label: "Button 1 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Button 2 Text", type: "text" },
      { key: "cta_link_2", label: "Button 2 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_3", label: "Button 3 Text", type: "text" },
      { key: "cta_link_3", label: "Button 3 Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" }
    ]
  },

  // ================= NEW HERO 25 (3 Images & Video) =================
  "hero-25": {
    name: "Hero Style 25",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button 1 Text", type: "text" },
      { key: "cta_link", label: "Button 1 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Button 2 Text", type: "text" },
      { key: "cta_link_2", label: "Button 2 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_3", label: "Button 3 Text", type: "text" },
      { key: "cta_link_3", label: "Button 3 Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" }
    ]
  },

  // ================= NEW HERO 26 (3 Images & Video) =================
  "hero-26": {
    name: "Hero Style 26",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button 1 Text", type: "text" },
      { key: "cta_link", label: "Button 1 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_2", label: "Button 2 Text", type: "text" },
      { key: "cta_link_2", label: "Button 2 Link", type: "select", options: CTA_OPTIONS },
      { key: "cta_text_3", label: "Button 3 Text", type: "text" },
      { key: "cta_link_3", label: "Button 3 Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" }
    ]
  },

  // ================= NEW HERO 27 (3 Videos) =================
  "hero-27": {
    name: "Hero Style 27",
    type: "hero",
    fields: [
      { key: "video_url1", label: "Media URL1 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url2", label: "Media URL2 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url3", label: "Media URL3 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 28 (3 Videos) =================
  "hero-28": {
    name: "Hero Style 28",
    type: "hero",
    fields: [
      { key: "video_url1", label: "Media URL1 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url2", label: "Media URL2 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url3", label: "Media URL3 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 29 (1 Video) =================
  "hero-29": {
    name: "Hero Style 29",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 30 (1 Video & 2 Descriptions) =================
  "hero-30": {
    name: "Hero Style 30",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "description1", label: "Description 1", type: "textarea" },
      { key: "description2", label: "Description 2", type: "textarea" }
    ]
  },

  // ================= NEW HERO 31 (1 Video & 2 Descriptions) =================
  "hero-31": {
    name: "Hero Style 31",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "description1", label: "Description 1", type: "textarea" },
      { key: "description2", label: "Description 2", type: "textarea" }
    ]
  },

  // ================= NEW HERO 32 (1 Video) =================
  "hero-32": {
    name: "Hero Style 32",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-33": {
    name: "Hero Style 33",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-34": {
    name: "Hero Style 34",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-35": {
    name: "Hero Style 35",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "score", label: "Score", type: "text" }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-36": {
    name: "Hero Style 36",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-37": {
    name: "Hero Style 37",
    type: "hero",
    fields: [
      { key: "video_url1", label: "Media URL1 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url2", label: "Media URL2 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url3", label: "Media URL3 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url4", label: "Media URL4 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url5", label: "Media URL5 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-38": {
    name: "Hero Style 38",
    type: "hero",
    fields: [
      { key: "video_url1", label: "Media URL1 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url2", label: "Media URL2 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url3", label: "Media URL3 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url4", label: "Media URL4 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "video_url5", label: "Media URL5 (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-39": {
    name: "Hero Style 39",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-40": {
    name: "Hero Style 40",
    type: "hero",
    fields: [
      { key: "video_url", label: "Media URL (Video or Image)", type: "media", placeholder: "Upload video or image" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= NEW HERO 33 (1 Video) =================
  "hero-41": {
    name: "Hero Style 41",
    type: "hero",
    fields: [
      { key: "title1", label: "Title1", type: "text" },
      { key: "title2", label: "Title2", type: "text" },
      { key: "title3", label: "Title3", type: "text" },
      { key: "subtitle1", label: "Subtitle1", type: "textarea" },
      { key: "subtitle2", label: "Subtitle2", type: "textarea" },
      { key: "subtitle3", label: "Subtitle3", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url1", label: "Image1", type: "image" },
      { key: "image_url2", label: "Image2", type: "image" },
      { key: "image_url3", label: "Image3", type: "image" }
    ]
  },

  // ================= NEW HERO 42 (4-Image Staggered Grid) =================
  "hero-42": {
    name: "Hero Style 42 (Staggered Grid)",
    type: "hero",
    fields: [
      { key: "subtitle", label: "Small Badge Text", type: "text" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "description", label: "Paragraph Description", type: "textarea" },
      { key: "image_url1", label: "Image 1 (Top Left)", type: "image" },
      { key: "image_url2", label: "Image 2 (Top Right)", type: "image" },
      { key: "image_url3", label: "Image 3 (Bottom Left)", type: "image" },
      { key: "image_url4", label: "Image 4 (Bottom Right)", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 43 (Luxury Minimalist) =================
  "hero-43": {
    name: "Hero Style 43 (Luxury Minimalist)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 44 (Traditional Brushstroke) =================
  "hero-44": {
    name: "Hero Style 44 (Traditional Brush)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 45 (Interactive Panels) =================
  "hero-45": {
    name: "Hero Style 45 (Interactive Panels)",
    type: "hero",
    fields: [
      { key: "cta_text", label: "Buttons Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "title1", label: "Panel 1 Title", type: "text" },
      { key: "desc1", label: "Panel 1 Desc", type: "textarea" },
      { key: "image_url1", label: "Panel 1 Image", type: "image" },
      { key: "title2", label: "Panel 2 Title", type: "text" },
      { key: "desc2", label: "Panel 2 Desc", type: "textarea" },
      { key: "image_url2", label: "Panel 2 Image", type: "image" },
      { key: "title3", label: "Panel 3 Title", type: "text" },
      { key: "desc3", label: "Panel 3 Desc", type: "textarea" },
      { key: "image_url3", label: "Panel 3 Image", type: "image" },
      { key: "title4", label: "Panel 4 Title", type: "text" },
      { key: "desc4", label: "Panel 4 Desc", type: "textarea" },
      { key: "image_url4", label: "Panel 4 Image", type: "image" }
    ]
  },

  // ================= NEW HERO 46 (Cinematic Glow) =================
  "hero-46": {
    name: "Hero Style 46 (Cinematic Glow)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "video_url", label: "Background Video", type: "media", placeholder: "Upload video or image" },
      { key: "image_url", label: "Poster Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "feature1", label: "Feature 1 Label", type: "text" },
      { key: "feature2", label: "Feature 2 Label", type: "text" },
      { key: "feature3", label: "Feature 3 Label", type: "text" },
      { key: "feature4", label: "Feature 4 Label", type: "text" }
    ]
  },

  // ================= NEW HERO 47 (Miso Ramen House) =================
  "hero-47": {
    name: "Hero Style 47 (Miso Ramen)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "textarea" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "image_url1", label: "Background Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "stat1_value", label: "Stat 1 Value", type: "text" },
      { key: "stat1_label", label: "Stat 1 Label", type: "text" },
      { key: "stat2_value", label: "Stat 2 Value", type: "text" },
      { key: "stat2_label", label: "Stat 2 Label", type: "text" },
      { key: "stat3_value", label: "Stat 3 Value", type: "text" },
      { key: "stat3_label", label: "Stat 3 Label", type: "text" }
    ]
  },
  "hero-48": {
    name: "Hero Style 48 (Authentic Japanese)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "textarea" },
      { key: "subtitle", label: "Right Side Title", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url1", label: "Image 1 (Top Left)", type: "image" },
      { key: "image_url2", label: "Image 2 (Bottom Left)", type: "image" },
      { key: "feature1", label: "Feature 1", type: "text" },
      { key: "feature2", label: "Feature 2", type: "text" },
      { key: "feature3", label: "Feature 3", type: "text" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-49": {
    name: "Hero Style 49 (The Craft Video)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "video_url", label: "Background Video URL", type: "text" },
      { key: "image_url", label: "Poster/Backup Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-50": {
    name: "Hero Style 50 (Split Luxury)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Description", type: "textarea" },
      { key: "image_url", label: "Side Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "bg_color", label: "Content Background Color", type: "text" }
    ]
  },
  "hero-51": {
    name: "Hero Style 51 (3D Floating)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "image_url1", label: "Main Floating Image (PNG)", type: "image" },
      { key: "image_url2", label: "Background Texture", type: "image" },
      { key: "image_url3", label: "Floating Deco 1 (Small PNG)", type: "image" },
      { key: "image_url4", label: "Floating Deco 2 (Small PNG)", type: "image" },
      { key: "feature1", label: "Decorative Label 1", type: "text" },
      { key: "feature2", label: "Decorative Label 2", type: "text" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-52": {
    name: "Hero Style 52 (Bold Typography)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Headline (Super Bold)", type: "text" },
      { key: "image_url", label: "Muted Background Image", type: "image" },
      { key: "text_color", label: "Text Color", type: "text", placeholder: "#ffffff" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-53": {
    name: "Hero Style 53 (Storytelling Slider)",
    type: "hero",
    fields: [
      { key: "interval", label: "Autoplay Interval (ms)", type: "number" },
      { 
        key: "slides", 
        label: "Slides", 
        type: "array",
        fields: [
          { key: "subtitle", label: "Subheading", type: "text" },
          { key: "title", label: "Main Headline", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image_url", label: "Background Image", type: "image" },
          { key: "cta_text", label: "Button Text", type: "text" },
          { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
        ]
      }
    ]
  },
  "hero-54": {
    name: "Hero Style 54 (Minimalist Luxury Slider)",
    type: "hero",
    fields: [
      { key: "interval", label: "Autoplay Interval (ms)", type: "number" },
      { 
        key: "slides", 
        label: "Slides", 
        type: "array",
        fields: [
          { key: "title", label: "Main Headline", type: "text" },
          { key: "image_url", label: "Background Image", type: "image" },
          { key: "cta_text", label: "Button Text", type: "text" },
          { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
        ]
      }
    ]
  },

  "hero-55": {
    name: "Hero Style 55 (Dark Mode Neon)",
    type: "hero",
    fields: [
      { key: "subtitle", label: "Small Subtitle", type: "text" },
      { key: "title", label: "Main Neon Headline", type: "text" },
      { key: "image_url", label: "Dark Background Image", type: "image" },
      { key: "glow_color", label: "Neon Glow Color", type: "text", placeholder: "#9b59b6" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-56": {
    name: "Hero Style 56 (Natural Texture Overlay)",
    type: "hero",
    fields: [
      { key: "subtitle", label: "Small Subtitle", type: "text" },
      { key: "title", label: "Classical Headline", type: "text" },
      { key: "description", label: "Story/Description", type: "textarea" },
      { key: "image_url", label: "Main Food Image", type: "image" },
      { key: "texture_opacity", label: "Texture Opacity (0.1-1)", type: "number" },
      { key: "cta_text", label: "Link Text", type: "text" },
      { key: "cta_link", label: "Link URL", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-57": {
    name: "Hero Style 57 (Geometric Grid)",
    type: "hero",
    fields: [
      { key: "subtitle", label: "Small Subtitle", type: "text" },
      { key: "title", label: "Massive Headline (Split by space)", type: "text" },
      { key: "description", label: "Side Description", type: "textarea" },
      { key: "image_url", label: "Grid Main Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  "hero-58": {
    name: "Hero Style 58 (3D Parallax Layers)",
    type: "hero",
    fields: [
      { key: "subtitle", label: "Small Subtitle", type: "text" },
      { key: "title", label: "Massive Layered Titile", type: "text" },
      { key: "bg_image_url", label: "Background Base Layer", type: "image" },
      { key: "fg_image_url", label: "Foreground Accent Layer", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },
  // ================= HERO SECTIONS (59-78) =================
  ...Array.from({ length: 20 }, (_, i) => i + 59).reduce((acc, i) => ({
    ...acc,
    [`hero-${i}`]: {
      name: `Hero Style ${i} (Premium)`,
      type: "hero",
      fields: [
        { key: "title", label: "Main Title", type: "text" },
        { key: "subtitle", label: "Subtitle / Slogan", type: "textarea" },
        { key: "video_url", label: "Background Video URL", type: "text" },
        { key: "image_url", label: "Background Image", type: "image" },
        { key: "buttonText", label: "Button Text", type: "text" },
        { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
        { key: "primaryColor", label: "Primary Accent Color", type: "text" },
        { key: "textColor", label: "Text Color", type: "text" }
      ]
    }
  }), {}),

  // ================= HERO 63 OVERWRITE =================
  "hero-63": {
    name: "Hero Style 63 (Typographic Essence)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "video_url", label: "Media (Video or Image URL)", type: "text" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= HERO 67 OVERWRITE =================
  "hero-67": {
    name: "Hero Style 67 (Culinary Journal)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Edition / Subtitle", type: "text" },
      { key: "author", label: "Author Name", type: "text" },
      { key: "date", label: "Publishing Date", type: "text" },
      { key: "image_url1", label: "Main Image (Right)", type: "image" },
      { key: "image_url2", label: "Overlapping Side Image (Left)", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= HERO 68 OVERWRITE =================
  "hero-68": {
    name: "Hero Style 68 (Masterpiece Portrait)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "image_url1", label: "Center Main Image", type: "image" },
      { key: "image_url2", label: "Left Accessory Image", type: "image" },
      { key: "image_url3", label: "Right Accessory Image", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= HERO 70 OVERWRITE =================
  "hero-70": {
    name: "Hero Style 70 (Floating Ingredients)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "image_url", label: "Main Food Image", type: "image" },
      { key: "image_ing1", label: "Ingredient Image 1 (Top Left)", type: "image" },
      { key: "image_ing2", label: "Ingredient Image 2 (Right)", type: "image" },
      { key: "image_ing3", label: "Ingredient Image 3 (Bottom Left)", type: "image" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= HERO 77 OVERWRITE =================
  "hero-77": {
    name: "Hero Style 77 (Grid Premium)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url1", label: "Main Image (Bottom Right)", type: "image" },
      { key: "image_url2", label: "Side Image (Left)", type: "image" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= NEW HERO 78 (Cinematic Mask) =================
  "hero-78": {
    name: "Hero Style 78 (Cinematic Mask)",
    type: "hero",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "video_url", label: "Video URL", type: "text" }
    ]
  },

  // ================= NEW HERO 79 (Two Culinary Worlds) =================
  "hero-79": {
    name: "Hero Style 79 (Two Culinary Worlds)",
    type: "hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "accentTitle", label: "Accent Title", type: "text" },
      { key: "title", label: "Main Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "video_url", label: "Video URL", type: "text" }
    ]
  },

  // ================= NEW HERO 80 (Wild Fire) =================
  "hero-80": {
    name: "Hero 80 New",
    type: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Description", type: "textarea" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" }
    ]
  },

  // ================= NEW HERO 81 (Two Culinary Worlds) =================
  "hero-81": {
    name: "Hero 81 New",
    type: "hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" }
    ]
  },
  "hero-82": {
    name: "Hero 82 New",
    type: "hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "title", label: "Accent Title", type: "text" },
      { key: "subtitle", label: "Secondary Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" }
    ]
  },
  "hero-83": {
    name: "Hero 83 New",
    type: "hero",
    fields: [
      { key: "title", label: "Primary Title", type: "text" },
      { key: "subtitle", label: "Secondary Title", type: "text" },
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Product Image", type: "image" },
      { key: "image_alt", label: "Product Image Alt Text", type: "text" }
    ]
  },
  "hero-84": {
    name: "Hero 84 New",
    type: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "showPrimaryButton", label: "Primary Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "primaryButtonText", label: "Primary Button Text", type: "text" },
      { key: "primaryButtonLink", label: "Primary Button Link", type: "select", options: CTA_OPTIONS },
      { key: "showSecondaryButton", label: "Secondary Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "secondaryButtonText", label: "Secondary Button Text", type: "text" },
      { key: "secondaryButtonLink", label: "Secondary Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "image_alt", label: "Background Image Alt Text", type: "text" }
    ]
  },
  // ================= ABOUT SECTIONS (1-10) =================
  ...Array.from({ length: 10 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`about-${i}`]: {
      name: `About Style ${i}`,
      type: "about",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image_url", label: "Media (Image / Video)", type: "media" }
      ]
    }
  }), {}),

  // ================= ABOUT SECTIONS (11-13) =================
  ...Array.from({ length: 3 }, (_, i) => i + 11).reduce((acc, i) => ({
    ...acc,
    [`about-${i}`]: {
      name: `About Style ${i}`,
      type: "about",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image_url", label: "Media (Image / Video)", type: "media" }
      ]
    }
  }), {}),

  // ================= NEW ABOUT 14 (Sequential Video Flow) =================
  "about-14": {
    name: "About Style 14 (Step Process Flow)",
    type: "about",
    fields: [
      { key: "title14_1", label: "Step 01 Title", type: "text" },
      { key: "description14_1", label: "Step 01 Description", type: "textarea" },
      { key: "video_url14_1", label: "Step 01 Media (Video/Image)", type: "media" },
      { key: "title14_2", label: "Step 02 Title", type: "text" },
      { key: "description14_2", label: "Step 02 Description", type: "textarea" },
      { key: "video_url14_2", label: "Step 02 Media (Video/Image)", type: "media" }
    ]
  },

  // ================= ABOUT SECTIONS (15-20) =================
  ...Array.from({ length: 6 }, (_, i) => i + 15).reduce((acc, i) => ({
    ...acc,
    [`about-${i}`]: {
      name: `About Style ${i}`,
      type: "about",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image_url", label: "Media (Image / Video)", type: "media" }
      ]
    }
  }), {}),


  // ================= NEW ABOUT 21 (Traditional Masked) =================
  "about-21": {
    name: "About Style 21 (Traditional Circle)",
    type: "about",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Circular Image", type: "image" },
      { key: "badge_text", label: "Vertical Badge", type: "text" }
    ]
  },

  // ================= NEW ABOUT 22 (Modern Card Split) =================
  "about-22": {
    name: "About Style 22 (Split Cards)",
    type: "about",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "description", label: "Header Description", type: "textarea" },
      { key: "image_url1", label: "Card 1 Image", type: "image" },
      { key: "card1_title", label: "Card 1 Title", type: "text" },
      { key: "card1_desc", label: "Card 1 Label", type: "text" },
      { key: "image_url2", label: "Card 2 Image", type: "image" },
      { key: "card2_title", label: "Card 2 Title", type: "text" },
      { key: "card2_desc", label: "Card 2 Label", type: "text" }
    ]
  },

  // ================= NEW ABOUT 23 (Founder & Philosophy) =================
  "about-23": {
    name: "About Style 23 (Founder Message)",
    type: "about",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "description", label: "Bio/Description", type: "textarea" },
      { key: "image_url", label: "Founder Image", type: "image" },
      { key: "founder_name", label: "Founder Name", type: "text" },
      { key: "founder_role", label: "Founder Role", type: "text" },
      { key: "quote_text", label: "Personal Quote", type: "textarea" }
    ]
  },

  "about-24": {
    name: "About Style 24 (Farm Timeline)",
    type: "about",
    fields: [
      { key: "subtitle", label: "Small Subtitle", type: "textarea" },
      { key: "title", label: "Main Headline", type: "text" },
      { key: "items", label: "Timeline Nodes", type: "array", fields: [
        { key: "year", label: "Year", type: "text" },
        { key: "label", label: "Event Title", type: "text" },
        { key: "desc", label: "Event Description", type: "textarea" }
      ]}
    ]
  },
  "about-25": {
    name: "About Style 25 (Team Mosaic)",
    type: "about",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "description", label: "Brief Intro", type: "textarea" },
      { key: "members", label: "Team Members", type: "array", fields: [
        { key: "name", label: "Name", type: "text" },
        { key: "role", label: "Role", type: "text" },
        { key: "image", label: "Photo URL", type: "image" }
      ]}
    ]
  },
  "about-26": {
    name: "About Style 26 (Chef's Signature)",
    type: "about",
    fields: [
      { key: "title", label: "Badge Title", type: "text" },
      { key: "name", label: "Chef's Name", type: "text" },
      { key: "quote", label: "Chef's Quote", type: "textarea" },
      { key: "image_url", label: "Chef's Photo", type: "image" }
    ]
  },
  "about-27": {
    name: "About Style 27 (Eco-Stats)",
    type: "about",
    fields: [
      { key: "title", label: "Main Headline", type: "text" },
      { key: "subtitle", label: "Description Text", type: "textarea" },
      { key: "stats", label: "Metric Items", type: "array", fields: [
        { key: "label", label: "Metric Name", type: "text" },
        { key: "value", label: "Value (e.g. 95%)", type: "text" }
      ]}
    ]
  },
  "about-28": {
    name: "About Style 28 (Video Mural)",
    type: "about",
    fields: [
      { key: "title", label: "Large Overlay Title", type: "text" },
      { key: "description", label: "Overlay Description", type: "textarea" },
      { key: "video_url", label: "Background Video URL (.mp4)", type: "text" },
      { key: "overlay_color", label: "Overlay Color/Opacity", type: "text", placeholder: "rgba(0,0,0,0.6)" }
    ]
  },
  "about-29": {
    name: "About Style 29 (Split Philosophy)",
    type: "about",
    fields: [
      { key: "left_title", label: "Left Section Title", type: "text" },
      { key: "left_desc", label: "Left Mini Description", type: "textarea" },
      { key: "left_image", label: "Left Background Image", type: "image" },
      { key: "right_title", label: "Right Section Title", type: "text" },
      { key: "right_desc", label: "Right Mini Description", type: "textarea" },
      { key: "right_image", label: "Right Background Image", type: "image" }
    ]
  },
  "about-30": {
    name: "About Style 30 (Legacy Archive)",
    type: "about",
    fields: [
      { key: "title", label: "Legacy Title", type: "text" },
      { key: "founding_year", label: "Founding Year", type: "text" },
      { key: "description", label: "Archive Intro", type: "textarea" },
      { key: "image_url", label: "Historical Image", type: "image" },
      { key: "fact_title", label: "Fact Card Title", type: "text" },
      { key: "fact_desc", label: "Fact Card Text", type: "textarea" }
    ]
  },
  "about-31": {
    name: "About Style 31 (Ingredient Showcase)",
    type: "about",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "subtitle", label: "Gallery Subtitle", type: "textarea" },
      { key: "ingredients", label: "Ingredient Items", type: "array", fields: [
        { key: "name", label: "Ingredient Name", type: "text" },
        { key: "origin", label: "Location Origin", type: "text" },
        { key: "desc", label: "Short Description", type: "textarea" },
        { key: "image", label: "Ingredient Photo", type: "image" }
      ]}
    ]
  },
  "about-32": {
    name: "About Style 32 (Neighborhood Map)",
    type: "about",
    fields: [
      { key: "title", label: "Area Highlight Title", type: "text" },
      { key: "description", label: "Story Text", type: "textarea" },
      { key: "image_url", label: "Neighborhood Image", type: "image" },
      { key: "address", label: "Specific Address Display", type: "text" },
      { key: "tagline", label: "Context Tagline", type: "text" }
    ]
  },
  "about-33": {
    name: "About Style 33 (Founder's Letter)",
    type: "about",
    fields: [
      { key: "title", label: "Letter Title", type: "text" },
      { key: "letter_content", label: "The Letter Message", type: "textarea" },
      { key: "founder_name", label: "Founder's Signature Name", type: "text" },
      { key: "role", label: "Official Role", type: "text" }
    ]
  },

  // ================= NEW ABOUT 34 (Jiangxi Heritage) =================
  "about-34": {
    name: "About 34 New",
    type: "about",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "highlight1", label: "Highlight 1", type: "text" },
      { key: "highlight2", label: "Highlight 2", type: "text" },
      { key: "highlight3", label: "Highlight 3", type: "text" },
      { key: "highlight4", label: "Highlight 4", type: "text" }
    ]
  },

  "about-35": {
    name: "About 35 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "image_alt", label: "Background Image Alt Text", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" }
    ]
  },

  "about-36": {
    name: "About 36 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Dish Image", type: "image" },
      { key: "image_alt", label: "Dish Image Alt Text", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" }
    ]
  },
  "about-37": {
    name: "About 37 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "image_alt", label: "Background Image Alt Text", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" }
    ]
  },
  "about-38": {
    name: "About 38 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Scene Image", type: "image" },
      { key: "image_alt", label: "Scene Image Alt Text", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" }
    ]
  },
  "about-39": {
    name: "About 39 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Storefront Image", type: "image" },
      { key: "image_alt", label: "Storefront Image Alt Text", type: "text" }
    ]
  },
  "about-40": {
    name: "About 40 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "addressLabel", label: "Address Label", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "hoursHeading", label: "Hours Heading", type: "text" },
      { key: "monday", label: "Monday Hours", type: "text" },
      { key: "tuesday", label: "Tuesday Hours", type: "text" },
      { key: "wednesday", label: "Wednesday Hours", type: "text" },
      { key: "thursday", label: "Thursday Hours", type: "text" },
      { key: "friday", label: "Friday Hours", type: "text" },
      { key: "saturday", label: "Saturday Hours", type: "text" },
      { key: "sunday", label: "Sunday Hours", type: "text" },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "image_alt", label: "Background Image Alt Text", type: "text" }
    ]
  },
  "about-41": {
    name: "About 41 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "item1_title", label: "Wok Hei Title", type: "text" },
      { key: "item1_description", label: "Wok Hei Description", type: "textarea" },
      { key: "item1_image", label: "Wok Hei Image", type: "image" },
      { key: "item1_image_alt", label: "Wok Hei Image Alt Text", type: "text" },
      { key: "item2_title", label: "Chinese Greens Title", type: "text" },
      { key: "item2_description", label: "Chinese Greens Description", type: "textarea" },
      { key: "item2_image", label: "Chinese Greens Image", type: "image" },
      { key: "item2_image_alt", label: "Chinese Greens Image Alt Text", type: "text" },
      { key: "item3_title", label: "Nanchang Noodles Title", type: "text" },
      { key: "item3_description", label: "Nanchang Noodles Description", type: "textarea" },
      { key: "item3_image", label: "Nanchang Noodles Image", type: "image" },
      { key: "item3_image_alt", label: "Nanchang Noodles Image Alt Text", type: "text" }
    ]
  },
  "about-42": {
    name: "About 42 New",
    type: "about",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "scene1_image", label: "Left Image", type: "image" },
      { key: "scene1_alt", label: "Left Image Alt Text", type: "text" },
      { key: "scene2_image", label: "Top Image", type: "image" },
      { key: "scene2_alt", label: "Top Image Alt Text", type: "text" },
      { key: "scene3_image", label: "Bottom Image", type: "image" },
      { key: "scene3_alt", label: "Bottom Image Alt Text", type: "text" }
    ]
  },
  "about-43": {
    name: "About 43 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Illustration", type: "image" },
      { key: "image_alt", label: "Illustration Alt Text", type: "text" }
    ]
  },
  "about-44": {
    name: "About 44 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "showButton", label: "Button Visibility", type: "select", options: [
        { label: "Show", value: "true" },
        { label: "Hide", value: "false" }
      ] },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "image_url", label: "Background Image", type: "image" },
      { key: "image_alt", label: "Background Image Alt Text", type: "text" }
    ]
  },
  "about-45": {
    name: "About 45 New",
    type: "about",
    fields: [
      { key: "title", label: "Title", type: "text" },
      ...Array.from({ length: 4 }, (_, i) => i + 1).flatMap((i) => [
        { key: `benefit_title${i}`, label: `Benefit ${i} Title`, type: "text" },
        { key: `benefit_description${i}`, label: `Benefit ${i} Description`, type: "textarea" }
      ]),
      { key: "image_url", label: "Center Image", type: "image" },
      { key: "image_alt", label: "Center Image Alt Text", type: "text" }
    ]
  },
  // ================= INTRO SECTIONS (1-5) =================
  ...Array.from({ length: 5 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`intro-${i}`]: {
      name: `Intro Style ${i}`,
      type: "intro",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image_url", label: "Image", type: "image" }
      ]
    }
  }), {}),
  "intro-6": {
    name: "Intro Style 6 (Pure Image Responsive)",
    type: "intro",
    fields: [
      { key: "image_url", label: "Desktop Image (电脑端图片)", type: "image" },
      { key: "mobile_image_url", label: "Mobile Image (手机端图片)", type: "image" }
    ]
  },
  // ================= GALLERY SECTIONS (1-20) =================
  ...Array.from({ length: 20 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`gallery-${i}`]: {
      name: `Gallery Style ${i}`,
      type: "gallery",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "image_url1", label: "Image 1", type: "image" },
        { key: "image_url2", label: "Image 2", type: "image" },
        { key: "image_url3", label: "Image 3", type: "image" },
        { key: "image_url4", label: "Image 4", type: "image" },
        { key: "image_url5", label: "Image 5", type: "image" },
        { key: "image_url6", label: "Image 6", type: "image" }
      ]
    }
  }), {}),

  // ================= GALLERY 21 (4 Items with Price) =================
  "gallery-21": {
    name: "Gallery Style 21",
    type: "gallery",
    fields: [
      // Item 1
      { key: "gallery_title1", label: "Item 1 Title", type: "text" },
      { key: "gallery_subtitle1", label: "Item 1 Subtitle", type: "textarea" },
      { key: "gallery_price1", label: "Item 1 Price", type: "text" },
      { key: "gallery_image1", label: "Item 1 Image", type: "image" },
      // Item 2
      { key: "gallery_title2", label: "Item 2 Title", type: "text" },
      { key: "gallery_subtitle2", label: "Item 2 Subtitle", type: "textarea" },
      { key: "gallery_price2", label: "Item 2 Price", type: "text" },
      { key: "gallery_image2", label: "Item 2 Image", type: "image" },
      // Item 3
      { key: "gallery_title3", label: "Item 3 Title", type: "text" },
      { key: "gallery_subtitle3", label: "Item 3 Subtitle", type: "textarea" },
      { key: "gallery_price3", label: "Item 3 Price", type: "text" },
      { key: "gallery_image3", label: "Item 3 Image", type: "image" },
      // Item 4
      { key: "gallery_title4", label: "Item 4 Title", type: "text" },
      { key: "gallery_subtitle4", label: "Item 4 Subtitle", type: "textarea" },
      { key: "gallery_price4", label: "Item 4 Price", type: "text" },
      { key: "gallery_image4", label: "Item 4 Image", type: "image" }
    ]
  },

  // ================= GALLERY 22 (4 Items with Price) =================
  "gallery-22": {
    name: "Gallery Style 22",
    type: "gallery",
    fields: [
      // Item 1
      { key: "gallery_title1", label: "Item 1 Title", type: "text" },
      { key: "gallery_subtitle1", label: "Item 1 Subtitle", type: "textarea" },
      { key: "gallery_price1", label: "Item 1 Price", type: "text" },
      { key: "gallery_image1", label: "Item 1 Image", type: "image" },
      // Item 2
      { key: "gallery_title2", label: "Item 2 Title", type: "text" },
      { key: "gallery_subtitle2", label: "Item 2 Subtitle", type: "textarea" },
      { key: "gallery_price2", label: "Item 2 Price", type: "text" },
      { key: "gallery_image2", label: "Item 2 Image", type: "image" },
      // Item 3
      { key: "gallery_title3", label: "Item 3 Title", type: "text" },
      { key: "gallery_subtitle3", label: "Item 3 Subtitle", type: "textarea" },
      { key: "gallery_price3", label: "Item 3 Price", type: "text" },
      { key: "gallery_image3", label: "Item 3 Image", type: "image" },
      // Item 4
      { key: "gallery_title4", label: "Item 4 Title", type: "text" },
      { key: "gallery_subtitle4", label: "Item 4 Subtitle", type: "textarea" },
      { key: "gallery_price4", label: "Item 4 Price", type: "text" },
      { key: "gallery_image4", label: "Item 4 Image", type: "image" }
    ]
  },

  // ================= GALLERY 23 (6 Images) =================
  "gallery-23": {
    name: "Gallery Style 23",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
      { key: "gallery_23_image_url5", label: "Image 5", type: "image" },
      { key: "gallery_23_image_url6", label: "Image 6", type: "image" }
    ]
  },

  // ================= GALLERY 24 (6 Images) =================
  "gallery-24": {
    name: "Gallery Style 24",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
    ]
  },

  // ================= GALLERY 25 (4 Images) =================
  "gallery-25": {
    name: "Gallery Style 25",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
    ]
  },

  // ================= GALLERY 26 (3 Images) =================
  "gallery-26": {
    name: "Gallery Style 26",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
    ]
  },

  // ================= GALLERY 27 (6 Images) =================
  "gallery-27": {
    name: "Gallery Style 27",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
      { key: "gallery_23_image_url5", label: "Image 5", type: "image" },
    ]
  },

  // ================= GALLERY 28 (6 Images) =================
  "gallery-28": {
    name: "Gallery Style 28",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
      { key: "gallery_23_image_url5", label: "Image 5", type: "image" },
      { key: "gallery_23_image_url6", label: "Image 6", type: "image" }
    ]
  },

  // ================= GALLERY 29 (6 Images) =================
  "gallery-29": {
    name: "Gallery Style 29",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
      { key: "gallery_23_image_url5", label: "Image 5", type: "image" },
    ]
  },

  // ================= GALLERY 30 (6 Images) =================
  "gallery-30": {
    name: "Gallery Style 30",
    type: "gallery",
    fields: [
      { key: "gallery_23_title", label: "Title", type: "text" },
      { key: "gallery_23_subtitle", label: "Subtitle", type: "textarea" },
      { key: "gallery_23_image_url1", label: "Image 1", type: "image" },
      { key: "gallery_23_image_url2", label: "Image 2", type: "image" },
      { key: "gallery_23_image_url3", label: "Image 3", type: "image" },
      { key: "gallery_23_image_url4", label: "Image 4", type: "image" },
      { key: "gallery_23_image_url5", label: "Image 5", type: "image" },
    ]
  },

  // ================= GALLERY 31-50 (NEW PREMIUM STYLES) =================
  ...Array.from({ length: 20 }, (_, i) => i + 31).reduce((acc, i) => ({
    ...acc,
    [`gallery-${i}`]: {
      name: `Gallery Style ${i} (Premium)`,
      type: "gallery",
      fields: [
        { key: "title", label: "Main Title", type: "text" },
        { key: "subtitle", label: "Category/Subtitle", type: "textarea" },
        { key: "image_url1", label: "Image 1", type: "image" },
        { key: "image_url2", label: "Image 2", type: "image" },
        { key: "image_url3", label: "Image 3", type: "image" },
        { key: "image_url4", label: "Image 4", type: "image" },
        { key: "image_url5", label: "Image 5", type: "image" },
        { key: "image_url6", label: "Image 6", type: "image" }
      ]
    }
  }), {}),

  // ================= GALLERY 51 (Visual Feast) =================
  "gallery-51": {
    name: "Gallery 51 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Category/Subtitle", type: "textarea" },
      
      { key: "gallery_eyebrow1", label: "Item 1 Eyebrow", type: "text" },
      { key: "gallery_title1", label: "Item 1 Title", type: "text" },
      { key: "image_url1", label: "Item 1 Image", type: "image" },
      
      { key: "gallery_eyebrow2", label: "Item 2 Eyebrow", type: "text" },
      { key: "gallery_title2", label: "Item 2 Title", type: "text" },
      { key: "image_url2", label: "Item 2 Image", type: "image" },
      
      { key: "gallery_eyebrow3", label: "Item 3 Eyebrow", type: "text" },
      { key: "gallery_title3", label: "Item 3 Title", type: "text" },
      { key: "image_url3", label: "Item 3 Image", type: "image" },
      
      { key: "gallery_eyebrow4", label: "Item 4 Eyebrow", type: "text" },
      { key: "gallery_title4", label: "Item 4 Title", type: "text" },
      { key: "image_url4", label: "Item 4 Image", type: "image" }
    ]
  },

  // ================= GALLERY 52 (Restaurant Gallery) =================
  "gallery-52": {
    name: "Gallery 52 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" },
      { key: "image_url4", label: "Image 4", type: "image" },
      { key: "image_url5", label: "Image 5", type: "image" },
      { key: "image_url6", label: "Image 6", type: "image" }
    ]
  },

  // ================= GALLERY 53 (Food Gallery) =================
  "gallery-53": {
    name: "Gallery 53 New",
    type: "gallery",
    fields: [
      { key: "image_url1", label: "Image 1", type: "image" },
      { key: "image_url2", label: "Image 2", type: "image" },
      { key: "image_url3", label: "Image 3", type: "image" },
      { key: "image_url4", label: "Image 4", type: "image" },
      { key: "image_url5", label: "Image 5", type: "image" },
      { key: "image_url6", label: "Image 6", type: "image" }
    ]
  },

  // ================= GALLERY 54 (Food Categories) =================
  "gallery-54": {
    name: "Gallery 54 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "category_label1", label: "Category 1 Label", type: "text" },
      { key: "image_url1", label: "Category 1 Icon", type: "image" },
      { key: "category_label2", label: "Category 2 Label", type: "text" },
      { key: "image_url2", label: "Category 2 Icon", type: "image" },
      { key: "category_label3", label: "Category 3 Label", type: "text" },
      { key: "image_url3", label: "Category 3 Icon", type: "image" },
      { key: "category_label4", label: "Category 4 Label", type: "text" },
      { key: "image_url4", label: "Category 4 Icon", type: "image" },
      { key: "category_label5", label: "Category 5 Label", type: "text" },
      { key: "image_url5", label: "Category 5 Icon", type: "image" },
      { key: "category_label6", label: "Category 6 Label", type: "text" },
      { key: "image_url6", label: "Category 6 Icon", type: "image" }
    ]
  },

  // ================= GALLERY 55 (Illustrated Food Categories) =================
  "gallery-55": {
    name: "Gallery 55 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "background_image", label: "Background Pattern", type: "image" },
      { key: "category_label1", label: "Category 1 Label", type: "text" },
      { key: "image_url1", label: "Category 1 Image", type: "image" },
      { key: "button_text1", label: "Category 1 Button Text", type: "text" },
      { key: "button_link1", label: "Category 1 Button Link", type: "text" },
      { key: "category_label2", label: "Category 2 Label", type: "text" },
      { key: "image_url2", label: "Category 2 Image", type: "image" },
      { key: "button_text2", label: "Category 2 Button Text", type: "text" },
      { key: "button_link2", label: "Category 2 Button Link", type: "text" },
      { key: "category_label3", label: "Category 3 Label", type: "text" },
      { key: "image_url3", label: "Category 3 Image", type: "image" },
      { key: "button_text3", label: "Category 3 Button Text", type: "text" },
      { key: "button_link3", label: "Category 3 Button Link", type: "text" },
      { key: "category_label4", label: "Category 4 Label", type: "text" },
      { key: "image_url4", label: "Category 4 Image", type: "image" },
      { key: "button_text4", label: "Category 4 Button Text", type: "text" },
      { key: "button_link4", label: "Category 4 Button Link", type: "text" }
    ]
  },

  "gallery-56": {
    name: "Gallery 56 New",
    type: "gallery",
    fields: [
      { key: "aria_label", label: "Section Accessible Label", type: "text" },
      { key: "category_label1", label: "Category 1 Title", type: "text" },
      { key: "category_description1", label: "Category 1 Description", type: "textarea" },
      { key: "image_url1", label: "Category 1 Image", type: "image" },
      { key: "image_alt1", label: "Category 1 Image Alt Text", type: "text" },
      { key: "category_label2", label: "Category 2 Title", type: "text" },
      { key: "category_description2", label: "Category 2 Description", type: "textarea" },
      { key: "image_url2", label: "Category 2 Image", type: "image" },
      { key: "image_alt2", label: "Category 2 Image Alt Text", type: "text" },
      { key: "category_label3", label: "Category 3 Title", type: "text" },
      { key: "category_description3", label: "Category 3 Description", type: "textarea" },
      { key: "image_url3", label: "Category 3 Image", type: "image" },
      { key: "image_alt3", label: "Category 3 Image Alt Text", type: "text" }
    ]
  },

  "gallery-57": {
    name: "Gallery 57 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "gallery_title1", label: "Item 1 Title", type: "text" },
      { key: "gallery_description1", label: "Item 1 Description", type: "textarea" },
      { key: "image_url1", label: "Item 1 Image", type: "image" },
      { key: "image_alt1", label: "Item 1 Image Alt Text", type: "text" },
      { key: "gallery_title2", label: "Item 2 Title", type: "text" },
      { key: "gallery_description2", label: "Item 2 Description", type: "textarea" },
      { key: "image_url2", label: "Item 2 Image", type: "image" },
      { key: "image_alt2", label: "Item 2 Image Alt Text", type: "text" },
      { key: "gallery_title3", label: "Item 3 Title", type: "text" },
      { key: "gallery_description3", label: "Item 3 Description", type: "textarea" },
      { key: "image_url3", label: "Item 3 Image", type: "image" },
      { key: "image_alt3", label: "Item 3 Image Alt Text", type: "text" },
      { key: "gallery_title4", label: "Item 4 Title", type: "text" },
      { key: "gallery_description4", label: "Item 4 Description", type: "textarea" },
      { key: "image_url4", label: "Item 4 Image", type: "image" },
      { key: "image_alt4", label: "Item 4 Image Alt Text", type: "text" }
    ]
  },

  "gallery-58": {
    name: "Gallery 58 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Main Title", type: "text" },
      { key: "tab_label1", label: "Tab 1 Label", type: "text" },
      { key: "tab_label2", label: "Tab 2 Label", type: "text" },
      { key: "tab_label3", label: "Tab 3 Label", type: "text" },
      { key: "tab_label4", label: "Tab 4 Label", type: "text" },
      { key: "tab_label5", label: "Tab 5 Label", type: "text" },
      { key: "tab_label6", label: "Tab 6 Label", type: "text" },
      { key: "tab_label7", label: "Tab 7 Label", type: "text" },
      ...Array.from({ length: 8 }, (_, i) => i + 1).flatMap((i) => [
        { key: `gallery_title${i}`, label: `Item ${i} Title`, type: "text" },
        { key: `gallery_price${i}`, label: `Item ${i} Price`, type: "text" },
        { key: `gallery_category${i}`, label: `Item ${i} Category`, type: "text" },
        { key: `image_url${i}`, label: `Item ${i} Image`, type: "image" },
        { key: `image_alt${i}`, label: `Item ${i} Image Alt Text`, type: "text" }
      ])
    ]
  },

  "gallery-59": {
    name: "Gallery 59 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      ...Array.from({ length: 5 }, (_, i) => i + 1).flatMap((i) => [
        { key: `image_url${i}`, label: `Image ${i}`, type: "image" },
        { key: `image_alt${i}`, label: `Image ${i} Alt Text`, type: "text" }
      ])
    ]
  },

  "gallery-60": {
    name: "Gallery 60 New",
    type: "gallery",
    fields: [
      { key: "title", label: "Title", type: "text" },
      ...Array.from({ length: 10 }, (_, i) => i + 1).flatMap((i) => [
        { key: `image_url${i}`, label: `Image ${i}`, type: "image" },
        { key: `image_alt${i}`, label: `Image ${i} Alt Text`, type: "text" }
      ])
    ]
  },


  // ================= INFO SECTIONS (1-15) =================
  ...Array.from({ length: 15 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`info-${i}`]: {
      name: `Info Style ${i}`,
      type: "info",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "address", label: "Address", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "Monday", label: "Monday", type: "text" },
        { key: "Tuesday", label: "Tuesday", type: "text" },
        { key: "Wednesday", label: "Wednesday", type: "text" },
        { key: "Thursday", label: "Thursday", type: "text" },
        { key: "Friday", label: "Friday", type: "text" },
        { key: "Saturday", label: "Saturday", type: "text" },
        { key: "Sunday", label: "Sunday", type: "text" }
      ]
    }
  }), {}),

  // ================= INFO 16 (Contact & Location) =================
  "info-16": {
    name: "Info 16 New",
    type: "info",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "restaurantName", label: "Restaurant Name", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "hours", label: "Business Hours", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS }
    ]
  },

  // ================= INFO 17 (Map & Weekly Hours) =================
  "info-17": {
    name: "Info 17 New",
    type: "info",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "Monday", label: "Monday", type: "text" },
      { key: "Tuesday", label: "Tuesday", type: "text" },
      { key: "Wednesday", label: "Wednesday", type: "text" },
      { key: "Thursday", label: "Thursday", type: "text" },
      { key: "Friday", label: "Friday", type: "text" },
      { key: "Saturday", label: "Saturday", type: "text" },
      { key: "Sunday", label: "Sunday", type: "text" }
    ]
  },
  "info-18": {
    name: "Info 18 New",
    type: "info",
    fields: [
      { key: "location", label: "Location", type: "text" },
      { key: "locationLabel", label: "Location Label", type: "text" },
      { key: "hours", label: "Working Time", type: "text" },
      { key: "hoursLabel", label: "Working Time Label", type: "text" },
      { key: "phone", label: "Phone Number", type: "text" },
      { key: "phoneLabel", label: "Phone Label", type: "text" }
    ]
  },
  "info-19": {
    name: "Info 19 New",
    type: "info",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "Monday", label: "Monday", type: "text" },
      { key: "Tuesday", label: "Tuesday", type: "text" },
      { key: "Wednesday", label: "Wednesday", type: "text" },
      { key: "Thursday", label: "Thursday", type: "text" },
      { key: "Friday", label: "Friday", type: "text" },
      { key: "Saturday", label: "Saturday", type: "text" },
      { key: "Sunday", label: "Sunday", type: "text" },
      { key: "map_image", label: "Map Image", type: "image" }
    ]
  },

  // ================= CONTACT SECTIONS (1-5) =================
  ...Array.from({ length: 8 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`contact-${i}`]: {
      name: `Contact Style ${i}`,
      type: "contact",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" }
      ]
    }
  }), {}),

  // Legacy contact-9 support for existing saved pages. Hidden from templatePool.
  "contact-9": {
    name: "Contact 9 New",
    type: "contact",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "restaurantName", label: "Restaurant Name", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "hours", label: "Business Hours", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "map_image", label: "Map Image", type: "image" }
    ]
  },

  // Legacy contact-10 support for existing saved pages. Hidden from templatePool.
  "contact-10": {
    name: "Contact 10 New",
    type: "contact",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "map_image", label: "Map Image", type: "image" },
      { key: "Monday", label: "Monday", type: "text" },
      { key: "Tuesday", label: "Tuesday", type: "text" },
      { key: "Wednesday", label: "Wednesday", type: "text" },
      { key: "Thursday", label: "Thursday", type: "text" },
      { key: "Friday", label: "Friday", type: "text" },
      { key: "Saturday", label: "Saturday", type: "text" },
      { key: "Sunday", label: "Sunday", type: "text" }
    ]
  },

  // ================= FEEDBACK SECTIONS (1-5) =================
  ...Array.from({ length: 8 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`feedback-${i}`]: {
      name: `Feedback Style ${i}`,
      type: "feedback",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" }
      ]
    }
  }), {}),

  // ================= MISSION SECTIONS (1-5) =================
  ...Array.from({ length: 5 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`mission-${i}`]: {
      name: `Mission Style ${i}`,
      type: "mission",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" }
      ]
    }
  }), {}),

  // ================= MODAL SECTIONS (1-10) =================
  ...Array.from({ length: 10 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`modal-${i}`]: {
      name: `Modal Style ${i}`,
      type: "modal",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "modal_img_url", label: "Modal Image", type: "image" }
      ]
    }
  }), {}),

  // ================= MODAL SECTIONS (11-20) =================
  ...Array.from({ length: 10 }, (_, i) => i + 11).reduce((acc, i) => ({
    ...acc,
    [`modal-${i}`]: {
      name: `Modal Style ${i} (Premium)`,
      type: "modal",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle / Description", type: "textarea" },
        { key: "modal_img_url", label: "Modal Image", type: "image" },
        { key: "buttonText", label: "Action Button Text", type: "text" },
        { key: "buttonLink", label: "Action Button Link", type: "select", options: CTA_OPTIONS }
      ]
    }
  }), {}),

  // ================= RESERVATION SECTIONS (1-10) =================
  ...Array.from({ length: 13 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`reservation-${i}`]: {
      name: `Reservation Style ${i}`,
      type: "reservation",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" }
      ]
    }
  }), {}),

  "reservation-14": {
    name: "Reservation Style 14 (With Hours)",
    type: "reservation",
    fields: [
      { key: "title", label: "Main Title", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "cta_text", label: "Button Text", type: "text" },
      { key: "cta_link", label: "Button Link", type: "select", options: CTA_OPTIONS },
      { key: "hours_title", label: "Hours Table Title", type: "text" },
      { key: "hours_subtitle", label: "Hours Table Subtitle", type: "text" },
      { key: "mon_hours", label: "Monday Hours", type: "text" },
      { key: "tue_hours", label: "Tuesday Hours", type: "text" },
      { key: "wed_hours", label: "Wednesday Hours", type: "text" },
      { key: "thu_hours", label: "Thursday Hours", type: "text" },
      { key: "fri_hours", label: "Friday Hours", type: "text" },
      { key: "sat_hours", label: "Saturday Hours", type: "text" },
      { key: "sun_hours", label: "Sunday Hours", type: "text" }
    ]
  },

  "reservation-15": {
    name: "Reservation 15 New",
    type: "reservation",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "phoneLabel", label: "Phone Label", type: "text" },
      { key: "phone", label: "Phone Number", type: "text" },
      { key: "addressLabel", label: "Address Label", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "emailLabel", label: "Email Label", type: "text" },
      { key: "contactEmail", label: "Displayed Email", type: "text" },
      { key: "email", label: "Reservation Recipient Email", type: "text" },
      { key: "buttonText", label: "Submit Button Text", type: "text" },
      { key: "successMessage", label: "Success Message", type: "textarea" },
      { key: "errorMessage", label: "Error Message", type: "textarea" }
    ]
  },

  // ================= CATERING SECTIONS (1-5) =================
  ...Array.from({ length: 8 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`catering-${i}`]: {
      name: `Catering Style ${i}`,
      type: "catering",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" }
      ]
    }
  }), {}),

  // ================= TESTIMONIALS SECTIONS (1-5) =================
  ...Array.from({ length: 3 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`testimonials-${i}`]: {
      name: `Testimonials Style ${i}`,
      type: "testimonials",
      fields: [
        { key: "customer_name1", label: "Customer_Name1", type: "text" },
        { key: "customer_review1", label: "Customer_Review1", type: "textarea" },
        { key: "customer_avatar1", label: "Customer_Avatar1", type: "image" },
        { key: "customer_name2", label: "Customer_Name2", type: "text" },
        { key: "customer_review2", label: "Customer_Review2", type: "textarea" },
        { key: "customer_avatar2", label: "Customer_Avatar2", type: "image" },
        { key: "customer_name3", label: "Customer_Name3", type: "text" },
        { key: "customer_review3", label: "Customer_Review3", type: "textarea" },
        { key: "customer_avatar3", label: "Customer_Avatar3", type: "image" },
        { key: "customer_name4", label: "Customer_Name4", type: "text" },
        { key: "customer_review4", label: "Customer_Review4", type: "textarea" },
        { key: "customer_avatar4", label: "Customer_Avatar4", type: "image" },
      ]
    }
  }), {}),

  "testimonials-4": {
    name: "Testimonials 4 New",
    type: "testimonials",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "customer_name1", label: "Customer Name 1", type: "text" },
      { key: "customer_review1", label: "Customer Review 1", type: "textarea" },
      { key: "customer_avatar1", label: "Customer Avatar 1", type: "image" },
      { key: "customer_name2", label: "Customer Name 2", type: "text" },
      { key: "customer_review2", label: "Customer Review 2", type: "textarea" },
      { key: "customer_avatar2", label: "Customer Avatar 2", type: "image" },
      { key: "customer_name3", label: "Customer Name 3", type: "text" },
      { key: "customer_review3", label: "Customer Review 3", type: "textarea" },
      { key: "customer_avatar3", label: "Customer Avatar 3", type: "image" },
      { key: "customer_name4", label: "Customer Name 4", type: "text" },
      { key: "customer_review4", label: "Customer Review 4", type: "textarea" },
      { key: "customer_avatar4", label: "Customer Avatar 4", type: "image" }
    ]
  },

  "testimonials-5": {
    name: "Testimonials 5 New",
    type: "testimonials",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "customer_name1", label: "Customer Name 1", type: "text" },
      { key: "customer_review1", label: "Customer Review 1", type: "textarea" },
      { key: "customer_avatar1", label: "Customer Avatar 1", type: "image" },
      { key: "customer_rating1", label: "Customer Rating 1 (1-5)", type: "number" },
      { key: "customer_name2", label: "Customer Name 2", type: "text" },
      { key: "customer_review2", label: "Customer Review 2", type: "textarea" },
      { key: "customer_avatar2", label: "Customer Avatar 2", type: "image" },
      { key: "customer_rating2", label: "Customer Rating 2 (1-5)", type: "number" },
      { key: "customer_name3", label: "Customer Name 3", type: "text" },
      { key: "customer_review3", label: "Customer Review 3", type: "textarea" },
      { key: "customer_avatar3", label: "Customer Avatar 3", type: "image" },
      { key: "customer_rating3", label: "Customer Rating 3 (1-5)", type: "number" },
      { key: "customer_name4", label: "Customer Name 4", type: "text" },
      { key: "customer_review4", label: "Customer Review 4", type: "textarea" },
      { key: "customer_avatar4", label: "Customer Avatar 4", type: "image" },
      { key: "customer_rating4", label: "Customer Rating 4 (1-5)", type: "number" }
    ]
  },

  "testimonials-6": {
    name: "Testimonials 6 New",
    type: "testimonials",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "customer_name1", label: "Customer Name 1", type: "text" },
      { key: "customer_review1", label: "Customer Review 1", type: "textarea" },
      { key: "customer_avatar1", label: "Customer Avatar 1", type: "image" },
      { key: "customer_rating1", label: "Customer Rating 1 (1-5)", type: "number" },
      { key: "customer_name2", label: "Customer Name 2", type: "text" },
      { key: "customer_review2", label: "Customer Review 2", type: "textarea" },
      { key: "customer_avatar2", label: "Customer Avatar 2", type: "image" },
      { key: "customer_rating2", label: "Customer Rating 2 (1-5)", type: "number" },
      { key: "customer_name3", label: "Customer Name 3", type: "text" },
      { key: "customer_review3", label: "Customer Review 3", type: "textarea" },
      { key: "customer_avatar3", label: "Customer Avatar 3", type: "image" },
      { key: "customer_rating3", label: "Customer Rating 3 (1-5)", type: "number" }
    ]
  },
  "testimonials-7": {
    name: "Testimonials 7 New",
    type: "testimonials",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      ...Array.from({ length: 4 }, (_, i) => i + 1).flatMap((i) => [
        { key: `customer_name${i}`, label: `Customer Name ${i}`, type: "text" },
        { key: `customer_review${i}`, label: `Customer Review ${i}`, type: "textarea" },
        { key: `customer_avatar${i}`, label: `Customer Avatar ${i}`, type: "image" },
        { key: `customer_rating${i}`, label: `Customer Rating ${i} (1-5)`, type: "number" }
      ])
    ]
  },

  // ================= INSTAGRAM (Special Case) =================
  "instagram-1": { name: "Instagram Feed", type: "instagram", fields: [{ key: "title", label: "Title", type: "text" }] },

  // ================= POPULAR (Special Case) =================
  "popular-1": { name: "Popular Items", type: "popular", fields: [{ key: "title", label: "Title", type: "text" }] },

  // ================= CAREER SECTIONS (1-3) =================
  ...Array.from({ length: 3 }, (_, i) => i + 1).reduce((acc, i) => ({
    ...acc,
    [`career-${i}`]: {
      name: `Career Style ${i}`,
      type: "career",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "email", label: "Application Notification Email", type: "text" }
      ]
    }
  }), {}),

  // ================= PROMOTION SECTIONS (1-5) =================
  "promotion-1": {
    name: "Promotion Style 1 (Coupons Grid)",
    type: "promotion",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { 
        key: "coupons", 
        label: "Coupons", 
        type: "array", 
        fields: [
          { key: "title", label: "Coupon Title", type: "text" },
          { key: "condition", label: "Condition (e.g. over $35)", type: "text" },
          { key: "description", label: "Description", type: "textarea" }
        ]
      }
    ]
  }
};

export const getTemplatesByType = (type) => {
  return Object.entries(SECTION_TEMPLATES)
    .filter(([key, config]) => config.type === type)
    .map(([key, config]) => ({ key, ...config }));
};
