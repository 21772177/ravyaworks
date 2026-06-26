/* ============================================================
   SPICE GARDEN RESTAURANT — config.js
   ─────────────────────────────────────────────────────────────
   THE ONLY FILE YOU EDIT to build a new restaurant client site.
   Change the content + theme below, drop images in assets/,
   and you have a brand new website. The framework (app.js)
   reads this and renders every section automatically.

   ┌──────────────────────────────────────────────────────────┐
   │  TO BUILD ANY NEW CLIENT WEBSITE:                        │
   │  1. Copy this whole "restaurant/" folder                 │
   │  2. Rename it (e.g. "client-abc/")                        │
   │  3. Edit ONLY this config.js + replace assets/ images    │
   │  4. Done. No other files need touching.                  │
   └──────────────────────────────────────────────────────────┘
   ============================================================ */

window.SITE_CONFIG = {

  /* ---------- Business identity ---------- */
  business: {
    name: "Spice Garden Restaurant",
    tagline: "Authentic Indian Flavours, Served with Love",
    industry: "Restaurant",
    established: "2009"
  },

  /* ---------- Theme (overrides _framework defaults) ----------
     Edit these hex codes to instantly re-skin the whole site.   */
  theme: {
    primary: "#c0392b",         // main brand color
    primaryDark: "#962d22",     // hover / darker shade
    primaryLight: "#e74c3c",    // lighter accent
    secondary: "#2c3e50",       // dark text / footer
    accent: "#f39c12",          // highlight (stars, icons)
    surfaceAlt: "#fff5f2",      // tinted background
    headingFont: "'Poppins', sans-serif",
    bodyFont: "'Inter', sans-serif"
  },

  /* ---------- SEO ---------- */
  seo: {
    description: "Spice Garden Restaurant serves authentic North Indian, South Indian & Chinese cuisine in Indiranagar, Bangalore. Dine-in, takeaway & direct online ordering.",
    keywords: "restaurant in Indiranagar, best restaurant Bangalore, Indian restaurant, North Indian food, table booking, Spice Garden",
    ogImage: "assets/hero.jpg"
  },

  /* ---------- Nav / button labels ---------- */
  navLabels: { services: "Menu" },
  cta: {
    header: "Book a Table",
    primary: "Book a Table",
    secondary: "Order on WhatsApp"
  },

  /* ---------- Hero ---------- */
  hero: {
    heading: "Authentic Indian Cuisine in the Heart of <span class='accent'>Bangalore</span>",
    subheading: "From sizzling tandoori starters to rich biryanis and decadent desserts — every dish at Spice Garden is crafted with hand-picked spices and decades of family recipes.",
    images: ["assets/hero.jpg"],
    quick: [
      "Pure Veg & Non-Veg",
      "Family Friendly Dining",
      "Direct Online Ordering",
      "Catering Available"
    ]
  },

  /* ---------- About + stats ---------- */
  about: {
    title: "A Legacy of Flavour Since 2009",
    image: "assets/about.jpg",
    since: "15",
    paragraphs: [
      "Spice Garden began as a small family kitchen with one belief — that great food brings people together. Fifteen years later, we've grown into one of Indiranagar's most loved dining destinations, serving over 500 guests every single day.",
      "Our chefs hail from across India, bringing authentic regional flavours — from the smoky tandoors of Punjab to the coconut-rich curries of Kerala. Every spice is roasted and ground in-house, every gravy simmered slow, every bread baked fresh to order.",
      "When you dine with us, you're not just a customer. You're family."
    ],
    mission: "To serve authentic, soul-satisfying Indian food made from fresh, locally-sourced ingredients — at prices that make every meal a celebration.",
    vision: "To be Bangalore's most loved family restaurant, where every visit feels like coming home.",
    footerBlurb: "Authentic North Indian, South Indian & Chinese cuisine served fresh in Indiranagar, Bangalore. Dine-in, takeaway & direct online ordering.",
    stats: [
      { value: "15+", label: "Years of Service" },
      { value: "120+", label: "Dishes on Menu" },
      { value: "50K+", label: "Happy Customers" },
      { value: "4.6★", label: "Average Rating" }
    ]
  },

  /* ---------- Menu (services section, "menu" style) ---------- */
  services: {
    style: "menu",
    eyebrow: "Our Menu",
    title: "Signature Dishes You'll Love",
    subtitle: "A handpicked selection from our most-loved starters, mains and desserts. Full menu available in-store.",
    items: [
      { title: "Paneer Butter Masala", price: "₹280", tag: "Veg", description: "Cottage cheese cubes simmered in a rich tomato-butter gravy with a hint of cream and kasuri methi.", image: "assets/dish-paneer.jpg" },
      { title: "Chicken Tikka Masala", price: "₹340", tag: "Bestseller", description: "Char-grilled chicken tikka folded into a smoky, aromatic onion-tomato masala. Our #1 seller.", image: "assets/dish-chicken.jpg" },
      { title: "Hyderabadi Veg Biryani", price: "₹260", tag: "Veg", description: "Long-grain basmati layered with spiced vegetables, saffron and fried onions, dum-cooked to perfection.", image: "assets/dish-biryani.jpg" },
      { title: "Mutton Rogan Josh", price: "₹420", tag: "Chef's Special", description: "Slow-cooked tender mutton in a traditional Kashmiri red gravy with whole spices.", image: "assets/dish-mutton.jpg" },
      { title: "Garlic Butter Naan", price: "₹70", tag: "Veg", description: "Soft tandoor-baked bread brushed with garlic, butter and fresh coriander.", image: "assets/dish-naan.jpg" },
      { title: "Gulab Jamun with Ice Cream", price: "₹140", tag: "Dessert", description: "Warm golden dumplings in cardamom syrup, served with a scoop of vanilla bean ice cream.", image: "assets/dish-dessert.jpg" }
    ]
  },

  /* ---------- Gallery ---------- */
  gallery: [
    "assets/gallery-1.jpg",
    "assets/gallery-2.jpg",
    "assets/gallery-3.jpg",
    "assets/gallery-4.jpg",
    "assets/gallery-5.jpg",
    "assets/gallery-6.jpg"
  ],

  /* ---------- Testimonials ---------- */
  testimonials: [
    { name: "Anjali Rao", role: "Regular Diner", rating: 5, text: "The best butter chicken in Indiranagar, hands down. We've been coming here every weekend for three years and the taste is consistently outstanding.", avatar: "" },
    { name: "Rajesh Menon", role: "Food Blogger", rating: 5, text: "Reviewed over 200 restaurants in Bangalore — Spice Garden's biryani is genuinely top-tier. The flavours are authentic and portions are generous.", avatar: "" },
    { name: "Priya & Family", role: "Family of Five", rating: 5, text: "Perfect place for a family dinner. The staff are warm, the ambience is lovely, and the kids' meals are thoughtfully prepared. Highly recommended!", avatar: "" },
    { name: "Karthik Subramaniam", role: "Corporate Client", rating: 4, text: "Booked their catering for an office event of 80 people. On-time delivery, professional setup and every guest complimented the food. Will use again.", avatar: "" },
    { name: "Meera Nair", role: "Local Guide on Google", rating: 5, text: "Ordered directly from their website — saved the Swiggy commission AND the food arrived 15 minutes faster. The veg thali was incredible value.", avatar: "" },
    { name: "Suresh Iyer", role: "Anniversary Celebration", rating: 5, text: "Celebrated our anniversary here. They arranged a special table and a complimentary dessert. Made our evening truly memorable. Thank you, Spice Garden!", avatar: "" }
  ],

  /* ---------- CTA band ---------- */
  ctaBand: {
    title: "Hungry Yet? Book Your Table Now",
    subtitle: "Walk-ins welcome, but weekends get busy. Reserve your table in 30 seconds — or order online for direct home delivery."
  },

  /* ---------- FAQ ---------- */
  faq: [
    { q: "Do you take table reservations?", a: "Yes! You can book a table by calling us, sending a WhatsApp message or using the contact form on this page. Walk-ins are always welcome, but weekends get busy so a reservation is recommended." },
    { q: "Do you offer home delivery?", a: "Absolutely. You can order directly from our website or WhatsApp — no middleman commission, so you save more and the food arrives faster. We deliver within 5 km radius." },
    { q: "Is parking available?", a: "Yes, we have dedicated parking for 30+ cars adjacent to the restaurant. Valet parking is also available on Friday and Saturday evenings." },
    { q: "Do you cater for private events?", a: "Yes, we offer off-site catering for weddings, corporate events and private parties. Contact us for a customised menu and quote." },
    { q: "Are there options for vegetarians?", a: "Of course! Over 60% of our menu is vegetarian, clearly marked with the 'Veg' tag. We also offer Jain-friendly options on request." }
  ],

  /* ---------- Blog / Updates ---------- */
  blog: [
    { title: "5 South Indian Dishes You Must Try This Summer", date: "May 15, 2026", category: "Food Tips", excerpt: "Beat the heat with our curated list of refreshing South Indian dishes — from cool buttermilk rasam to tangy lemon rice.", image: "assets/gallery-4.jpg", link: "#" },
    { title: "Spice Garden Celebrates 15 Years!", date: "March 22, 2026", category: "News", excerpt: "Fifteen years of serving authentic flavours to Indiranagar. Thank you for making us part of your family.", image: "assets/gallery-2.jpg", link: "#" },
    { title: "New Weekend Brunch Menu Launched", date: "January 10, 2026", category: "Menu Update", excerpt: "Introducing our Saturday-Sunday brunch — unlimited dosas, fresh juices and a live chai counter. Starting ₹499.", image: "assets/gallery-3.jpg", link: "#" }
  ],

  /* ---------- Contact ---------- */
  contact: {
    phone: "+91 84729 71234",
    whatsapp: "+91 84729 71234",
    email: "hello@spicegarden.example.com",
    address: {
      full: "No. 42, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
      area: "Indiranagar",
      city: "Bengaluru",
      pincode: "560038"
    },
    // Google Maps embed iframe src (Indiranagar, Bangalore placeholder)
    mapEmbed: "https://www.google.com/maps?q=Indiranagar,Bengaluru&output=embed"
  },

  /* ---------- Opening hours ---------- */
  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 10:30 PM" },
    { day: "Friday – Saturday", time: "11:00 AM – 11:30 PM" },
    { day: "Sunday", time: "10:00 AM – 10:30 PM" }
  ],

  /* ---------- Social ---------- */
  social: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
    youtube: "#"
  },

  /* ---------- Cookie Consent (GDPR, optional) ---------- */
  cookieConsent: "We use cookies to improve your experience and analyse site traffic. By clicking 'Accept', you agree to our use of cookies.",

  /* ---------- i18n: multi-language translations (optional) ---------- */
  i18n: {
    hi: {
      nav_home: "होम",
      nav_about: "हमारे बारे में",
      nav_services: "मेनू",
      nav_gallery: "गैलरी",
      nav_reviews: "समीक्षाएँ",
      nav_contact: "संपर्क करें",
      cta_header: "टेबल बुक करें"
    }
  }
};
