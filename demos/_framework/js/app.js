/* ============================================================
   RAVYAWORKS WEBSITE FRAMEWORK — app.js
   The engine. Reads SITE_CONFIG (from the page's config.js) and
   renders the entire site: header, hero, sections, footer, plus
   the RavyaWorks lead-gen widgets (WhatsApp float + ribbon).

   To build a new client site you NEVER touch this file — you only
   edit that site's config.js. That is the whole point.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Constants: RavyaWorks lead-gen targets ----------
     Hardcoded so EVERY demo routes prospects back to RavyaWorks.
     Change here once if RavyaWorks phone/domain changes.        */
  var RW = {
    phone: "919503196964",          // wa.me format (country code + number)
    domain: "https://ravyaworks.com",
    contactPage: "https://ravyaworks.com/contact",
    shortName: "RavyaWorks"
  };

  /* Safely build a wa.me link with a prefilled message. */
  function waLink(message) {
    return "https://wa.me/" + RW.phone + "?text=" + encodeURIComponent(message || "");
  }

  /* Generic "I need a website similar to this demo" prefilled message. */
  function similarWebsiteMsg(businessName) {
    return "Hi RavyaWorks! I saw the " + (businessName || "") +
      " demo website and I need a website similar to this for my business. Please share details.";
  }

  /* ---------- i18n: lightweight language toggle ---------- */
  var currentLang = localStorage.getItem("rw_lang") || "en";
  function t(str, cfg) {
    if (currentLang === "en" || !cfg || !cfg.i18n || !cfg.i18n[currentLang]) return str;
    return cfg.i18n[currentLang][str] || str;
  }
  function applyLang(cfg) {
    if (!cfg.i18n || !cfg.i18n[currentLang]) return;
    var map = cfg.i18n[currentLang];
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (map[key]) node.textContent = map[key];
    });
    document.documentElement.lang = currentLang === "kn" ? "kn" : currentLang === "hi" ? "hi" : "en";
  }

  /* ---------- Helpers ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function stars(n) {
    n = Math.max(0, Math.min(5, n || 5));
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= n ? "★" : "☆";
    return out;
  }

  /* Deterministic color from a name string (GitHub-style) */
  var AVATAR_COLORS = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db","#9b59b6","#34495e","#16a085","#c0392b","#27ae60","#2980b9","#8e44ad","#d35400","#c0392b","#1a5276"];
  function avatarColor(name) {
    var h = 0;
    for (var i = 0; i < (name || "").length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  }
  function initials(name) {
    var parts = (name || "?").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    return parts[0].charAt(0).toUpperCase();
  }

  /* ---------- CDN image URL helper ----------
     If cfg.cdn.base is set, all image paths get prefixed.
     cfg.cdn.params (object) is appended as query params.
     Example: cfg.cdn = { base: "https://images.example.com/proxy", params: { w: "800", format: "auto" } }  */
  function imgUrl(path, cfg) {
    if (!path) return "";
    if (path.indexOf("//") !== -1 && path.indexOf("://") !== -1) return path; // absolute URL, pass through
    var cdn = cfg && cfg.cdn;
    if (cdn && cdn.base) {
      var url = cdn.base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
      if (cdn.params) {
        var qs = Object.keys(cdn.params).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(cdn.params[k]); }).join("&");
        if (qs) url += (url.indexOf("?") === -1 ? "?" : "&") + qs;
      }
      return url;
    }
    return path;
  }

  /* ---------- Apply theme from config to :root ---------- */
  function applyTheme(theme) {
    var root = document.documentElement;
    var map = {
      primary: "--color-primary",
      primaryDark: "--color-primary-dark",
      primaryLight: "--color-primary-light",
      secondary: "--color-secondary",
      accent: "--color-accent",
      surfaceAlt: "--color-surface-alt"
    };
    for (var k in map) {
      if (theme && theme[k]) root.style.setProperty(map[k], theme[k]);
    }
    if (theme && theme.headingFont) root.style.setProperty("--font-heading", theme.headingFont);
    if (theme && theme.bodyFont) root.style.setProperty("--font-body", theme.bodyFont);
  }

  /* ---------- Document head: title, meta, favicon, analytics ---------- */
  function buildHead(cfg) {
    if (cfg.business && cfg.business.name) document.title = cfg.business.name + " | " + (cfg.business.tagline || cfg.business.industry || "");
    if (cfg.seo) {
      if (cfg.seo.description) setMeta("description", cfg.seo.description);
      if (cfg.seo.keywords) setMeta("keywords", cfg.seo.keywords);
      if (cfg.seo.ogImage) {
        setProp("og:image", cfg.seo.ogImage);
        setProp("og:title", cfg.business.name);
        if (cfg.seo.description) setProp("og:description", cfg.seo.description);
      }
      setProp("og:type", "website");
    }
    // Favicon = business initial
    var initial = (cfg.business && cfg.business.name ? cfg.business.name.charAt(0) : "R");
    var icon = el("link", { rel: "icon", href: "data:image/svg+xml," +
      encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23" +
        ((cfg.theme && cfg.theme.primary) || "c0392b").replace("#","") + "'/><text x='50' y='68' font-size='58' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>" + initial + "</text></svg>") });
    document.head.appendChild(icon);

    // Theme color (browser chrome)
    if (cfg.theme && cfg.theme.primary) {
      setMeta("theme-color", cfg.theme.primary);
    }

    // Manifest (PWA)
    buildManifest(cfg);

    // Apple touch icon
    var initial = (cfg.business && cfg.business.name ? cfg.business.name.charAt(0) : "R");
    var appleIcon = el("link", { rel: "apple-touch-icon", href: "data:image/svg+xml," +
      encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23" +
        ((cfg.theme && cfg.theme.primary) || "c0392b").replace("#","") + "'/><text x='50' y='68' font-size='58' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>" + initial + "</text></svg>") });
    document.head.appendChild(appleIcon);

    // Analytics
    if (cfg.analytics) {
      if (cfg.analytics.ga4) {
        // Google Analytics 4
        var s1 = el("script", { async: "", src: "https://www.googletagmanager.com/gtag/js?id=" + cfg.analytics.ga4 });
        document.head.appendChild(s1);
        var s2 = el("script", {});
        s2.textContent = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','" + cfg.analytics.ga4 + "');";
        document.head.appendChild(s2);
      }
      if (cfg.analytics.plausible) {
        // Plausible Analytics
        var ps = el("script", { defer: "", "data-domain": cfg.analytics.plausible, src: "https://plausible.io/js/script.js" });
        document.head.appendChild(ps);
      }
      if (cfg.analytics.custom) {
        // Custom analytics script
        var cs = el("script", { async: "", src: cfg.analytics.custom });
        document.head.appendChild(cs);
      }
    }
  }
  function setMeta(name, content) {
    var m = document.querySelector("meta[name='" + name + "']") || el("meta", { name: name });
    m.setAttribute("content", content); document.head.appendChild(m);
  }
  function setProp(prop, content) {
    var m = document.querySelector("meta[property='" + prop + "']") || el("meta", { property: prop });
    m.setAttribute("content", content); document.head.appendChild(m);
  }

  /* ---------- PWA Manifest (dynamic from config) ---------- */
  function buildManifest(cfg) {
    var name = cfg.business.name || "RavyaWorks Demo";
    var shortName = (name || "").substring(0, 12);
    var primary = (cfg.theme && cfg.theme.primary) || "#c0392b";
    var manifest = {
      name: name,
      short_name: shortName,
      start_url: location.href.split("?")[0],
      display: "standalone",
      background_color: "#ffffff",
      theme_color: primary,
      icons: [
        { src: "data:image/svg+xml," + encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'>" +
          "<rect width='192' height='192' rx='36' fill='" + primary + "'/>" +
          "<text x='96' y='128' font-size='100' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>" +
          name.charAt(0) + "</text></svg>"
        ), sizes: "192x192", type: "image/svg+xml" },
        { src: "data:image/svg+xml," + encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>" +
          "<rect width='512' height='512' rx='96' fill='" + primary + "'/>" +
          "<text x='256' y='340' font-size='260' font-family='Arial' font-weight='bold' fill='white' text-anchor='middle'>" +
          name.charAt(0) + "</text></svg>"
        ), sizes: "512x512", type: "image/svg+xml" }
      ]
    };
    var blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    var existing = document.querySelector("link[rel='manifest']");
    if (existing) existing.remove();
    var link = el("link", { rel: "manifest", href: URL.createObjectURL(blob) });
    document.head.appendChild(link);
  }

  /* ============================================================
     SECTION BUILDERS
     Each returns a DOM node. app.js mounts them in order.
     ============================================================ */

  /* ---------- Header ---------- */
  function buildHeader(cfg) {
    var navLinks = [
      { href: "#home", label: "Home", i18n: "nav_home" },
      { href: "#about", label: "About", i18n: "nav_about" },
      { href: "#services", label: cfg.navLabels && cfg.navLabels.services || "Services", i18n: "nav_services" },
      { href: "#gallery", label: "Gallery", i18n: "nav_gallery" },
      { href: "#testimonials", label: "Reviews", i18n: "nav_reviews" },
      { href: "#contact", label: "Contact", i18n: "nav_contact" }
    ];
    var nav = el("nav", { class: "main-nav", id: "mainNav", "aria-label": "Main navigation" }, [
      el("ul", null, navLinks.map(function (l) {
        return el("li", null, [ el("a", { href: l.href, "data-i18n": l.i18n }, t(l.label, cfg)) ]);
      }).concat([
        el("li", { class: "header__cta" }, [
          el("a", { href: "#contact", class: "btn btn--primary", "data-i18n": "cta_header" }, t((cfg.cta && cfg.cta.header) || "Get in Touch", cfg))
        ])
      ]))
    ]);

    var toggle = el("button", {
      class: "nav-toggle", "aria-label": "Toggle menu", "aria-expanded": "false",
      onClick: function (e) {
        var open = nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open);
      }
    }, [ el("span"), el("span"), el("span") ]);

    var brand = el("a", { href: "#home", class: "brand" }, [
      el("span", { class: "brand__mark" }, (cfg.business.name || "R").charAt(0)),
      cfg.business.name
    ]);

    // Language toggle (if i18n config exists)
    var langBtn = null;
    if (cfg.i18n) {
      var langs = Object.keys(cfg.i18n).concat(["en"]);
      var langIdx = langs.indexOf(currentLang);
      if (langIdx < 0) langIdx = 0;
      var nextLang = langs[(langIdx + 1) % langs.length];
      var langLabel = { en: "EN", hi: "हिं", kn: "ಕನ್ನಡ" };
      langBtn = el("button", {
        class: "lang-toggle",
        "aria-label": "Switch language",
        onClick: function () {
          currentLang = nextLang;
          localStorage.setItem("rw_lang", currentLang);
          location.reload();
        }
      }, langLabel[currentLang] || "EN");
    }

    var rightSide = el("div", { class: "header__right" }, [nav]);
    if (langBtn) rightSide.appendChild(langBtn);

    return el("header", { class: "site-header", id: "siteHeader" }, [
      el("div", { class: "site-header__inner container" }, [ brand, rightSide, toggle ])
    ]);
  }

  /* ---------- Hero ---------- */
  function buildHero(cfg) {
    var h = cfg.hero || {};
    var bg = (h.images && h.images[0]) || "";
    var heroClass = "hero";
    if (h.style === "centered") heroClass += " hero--centered";
    if (h.style === "full") heroClass += " hero--full";
    var hero = el("section", { class: heroClass, id: "home" });
    hero.appendChild(el("div", { class: "hero__bg" }, [ el("img", { src: imgUrl(bg, cfg), alt: cfg.business.name + " hero", loading: "eager", fetchpriority: "high", decoding: "async" }) ]));
    hero.appendChild(el("div", { class: "hero__overlay" }));

    var inner = el("div", { class: "container" }, [ el("div", { class: "hero__inner" }) ]);
    var actions = el("div", { class: "hero__actions" });
    var primaryCta = (cfg.cta && cfg.cta.primary) || "Contact Us";
    actions.appendChild(el("a", { href: "#contact", class: "btn btn--primary btn--lg" }, primaryCta));

    // If config wants a WhatsApp/Order CTA in hero, link it to RavyaWorks (lead-gen)
    if (cfg.cta && cfg.cta.secondary) {
      actions.appendChild(el("a", {
        href: waLink(similarWebsiteMsg(cfg.business.name)), target: "_blank", rel: "noopener",
        class: "btn btn--ghost-light btn--lg"
      }, cfg.cta.secondary));
    }
    inner.querySelector(".hero__inner").appendChild(el("h1", { html: h.heading }));
    inner.querySelector(".hero__inner").appendChild(el("p", { class: "hero__lead" }, h.subheading));
    inner.querySelector(".hero__inner").appendChild(actions);

    if (h.quick && h.quick.length) {
      inner.querySelector(".hero__inner").appendChild(el("div", { class: "hero__quick" },
        h.quick.map(function (q) {
          return el("div", { class: "hero__quick-item" }, [
            el("span", { html: "&#10003;" }), el("span", null, q)
          ]);
        })
      ));
    }
    hero.appendChild(inner);
    hero.appendChild(el("div", { class: "scroll-cue", "aria-hidden": "true" }, [ "Scroll", el("div", null, "↓") ]));
    return hero;
  }

  /* ---------- Stats strip ---------- */
  function buildStats(cfg) {
    if (!cfg.about || !cfg.about.stats || !cfg.about.stats.length) return null;
    return el("div", { class: "container" }, [
      el("div", { class: "stats" }, cfg.about.stats.map(function (s) {
        return el("div", { class: "stat" }, [
          el("div", { class: "stat__num" }, s.value),
          el("div", { class: "stat__label" }, s.label)
        ]);
      }))
    ]);
  }

  /* ---------- About ---------- */
  function buildAbout(cfg) {
    var a = cfg.about || {};
    var media = el("div", { class: "about-media reveal" }, [
      a.image ? el("img", { src: imgUrl(a.image, cfg), alt: "About " + cfg.business.name, loading: "lazy" }) : null
    ]);
    if (a.since) {
      media.appendChild(el("div", { class: "about-media__badge" }, [
        el("strong", null, a.since), el("span", null, "Years of Trust")
      ]));
    }

    var content = el("div", { class: "about-content reveal" });
    content.appendChild(el("span", { class: "section__eyebrow" }, "About Us"));
    content.appendChild(el("h2", null, a.title || ("Welcome to " + cfg.business.name)));
    (a.paragraphs || []).forEach(function (p) { content.appendChild(el("p", null, p)); });

    if (a.mission || a.vision) {
      var mv = el("div", { class: "mv-grid" });
      if (a.mission) mv.appendChild(el("div", { class: "mv-card" }, [
        el("h4", { html: "&#127919; Our Mission" }), el("p", null, a.mission)
      ]));
      if (a.vision) mv.appendChild(el("div", { class: "mv-card" }, [
        el("h4", { html: "&#128302; Our Vision" }), el("p", null, a.vision)
      ]));
      content.appendChild(mv);
    }

    return el("section", { class: "section", id: "about" }, [
      el("div", { class: "container" }, [ el("div", { class: "about-grid" + (a.imagePosition === "right" ? " about-grid--reversed" : "") }, [ media, content ]) ])
    ]);
  }

  /* ---------- Services (card / menu / pricing style) ---------- */
  function buildServices(cfg) {
    var s = cfg.services || {};
    var style = s.style || "cards"; // "cards" | "menu" | "pricing"

    var grid;
    if (style === "menu") {
      grid = el("div", { class: "menu-list" });
    } else if (style === "pricing") {
      grid = el("div", { class: "pricing-grid" });
    } else {
      grid = el("div", { class: "services-grid" });
    }

    (s.items || []).forEach(function (item) {
      if (style === "menu") {
        grid.appendChild(el("div", { class: "menu-item reveal" }, [
          item.image ? el("img", { class: "menu-item__thumb", src: imgUrl(item.image, cfg), alt: item.title, loading: "lazy" }) : null,
          el("div", { style: "flex:1" }, [
            el("div", { class: "menu-item__head" }, [
              el("span", { class: "menu-item__name" }, item.title + (item.tag ? " <span class='menu-item__tag'>" + item.tag + "</span>" : "")),
              el("span", { class: "menu-item__price" }, item.price || "")
            ]),
            item.description ? el("p", { class: "menu-item__desc" }, item.description) : null
          ])
        ]));
      } else if (style === "pricing") {
        var card = el("div", { class: "pricing-card reveal" + (item.featured ? " pricing-card--featured" : "") });
        card.appendChild(el("h3", null, item.title));
        card.appendChild(el("div", { class: "pricing-card__price" }, [
          item.price ? item.price.split("/")[0] : ""
        ]));
        card.appendChild(el("div", { class: "pricing-card__period" }, item.price ? item.price.split("/").slice(1).join("/") : ""));
        var feats = el("ul", { class: "pricing-card__features" });
        (item.features || []).forEach(function (f) { feats.appendChild(el("li", null, f)); });
        card.appendChild(feats);
        card.appendChild(el("a", { href: "#contact", class: "btn btn--primary" }, item.cta || "Get Started"));
        grid.appendChild(card);
      } else {
        var card = el("article", { class: "service-card reveal" });
        if (item.image) card.appendChild(el("div", { class: "service-card__img" }, [ el("img", { src: imgUrl(item.image, cfg), alt: item.title, loading: "lazy" }) ]));
        card.appendChild(el("div", { class: "service-card__body" }, [
          el("h3", { class: "service-card__title" }, item.title),
          item.description ? el("p", { class: "service-card__desc" }, item.description) : null,
          item.price ? el("div", { class: "service-card__price" }, [
            el("span", { class: "starts" }, "Starting at"),
            el("strong", null, item.price)
          ]) : null
        ]));
        grid.appendChild(card);
      }
    });

    return el("section", { class: "section section--alt", id: "services" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, s.eyebrow || "What We Offer"),
          el("h2", { class: "section__title", html: (s.title || "Our Services").replace(/(\w+)$/, "<span class='accent'>$1</span>") }),
          s.subtitle ? el("p", { class: "section__subtitle" }, s.subtitle) : null
        ]),
        grid
      ])
    ]);
  }

  /* ---------- Gallery + lightbox ---------- */
  function buildGallery(cfg) {
    var gObj = cfg.gallery || [];
    var g = Array.isArray(gObj) ? gObj : (gObj.images || []);
    var gStyle = (!Array.isArray(cfg.gallery) && cfg.gallery.style) || cfg.galleryStyle || "grid";
    if (!g.length) return null;
    var gClass = gStyle === "masonry" ? "gallery-grid--masonry" :
                 gStyle === "scroll" ? "gallery-grid--scroll" : "gallery-grid";
    var grid = el("div", { class: gClass });
    g.forEach(function (src, i) {
      var item = el("div", { class: "gallery-item reveal", "data-index": i, tabindex: "0", role: "button", "aria-label": "Open photo " + (i + 1), "aria-haspopup": "dialog" }, [
        el("img", { src: imgUrl(src, cfg), alt: cfg.business.name + " photo " + (i + 1), loading: "lazy" })
      ]);
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showLb(i); }
      });
      grid.appendChild(item);
    });

    // Lightbox
    var lbClose = el("button", { class: "lightbox__close", "aria-label": "Close" }, "×");
    var lbPrev = el("button", { class: "lightbox__nav lightbox__prev", "aria-label": "Previous" }, "‹");
    var lbImg = el("img", { alt: "" });
    var lbNext = el("button", { class: "lightbox__nav lightbox__next", "aria-label": "Next" }, "›");
    var lb = el("div", { class: "lightbox", id: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Image viewer" }, [
      lbClose, lbPrev, lbImg, lbNext
    ]);
    var lastFocus = null;
    function showLb(i) {
      lbImg.src = imgUrl(g[i], cfg);
      lbImg.alt = cfg.business.name + " photo " + (i + 1);
      lb._idx = i;
      lastFocus = document.activeElement;
      lb.classList.add("is-open");
      lbClose.focus();
    }
    function hideLb() {
      lb.classList.remove("is-open");
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    }
    function focusTrap(e) {
      if (!lb.classList.contains("is-open")) return;
      var focusable = lb.querySelectorAll("button:not([disabled])");
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    grid.addEventListener("click", function (e) {
      var item = e.target.closest(".gallery-item");
      if (item) showLb(parseInt(item.getAttribute("data-index"), 10));
    });
    lbClose.addEventListener("click", hideLb);
    lbNext.addEventListener("click", function () { showLb((lb._idx + 1) % g.length); });
    lbPrev.addEventListener("click", function () { showLb((lb._idx - 1 + g.length) % g.length); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hideLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      focusTrap(e);
      if (e.key === "Escape") hideLb();
      if (e.key === "ArrowRight") showLb((lb._idx + 1) % g.length);
      if (e.key === "ArrowLeft") showLb((lb._idx - 1 + g.length) % g.length);
    });

    return el("section", { class: "section", id: "gallery" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "Gallery"),
          el("h2", { class: "section__title", html: "Our <span class='accent'>Moments</span>" }),
          el("p", { class: "section__subtitle" }, "A glimpse of what awaits you at " + cfg.business.name + ".")
        ]),
        grid
      ]),
      lb
    ]);
  }

  /* ---------- Blog / Updates ---------- */
  function buildBlog(cfg) {
    var posts = cfg.blog || [];
    if (!posts.length) return null;
    var grid = el("div", { class: "blog-grid" });
    posts.forEach(function (post) {
      var card = el("article", { class: "blog-card reveal" });
      if (post.image) {
        card.appendChild(el("div", { class: "blog-card__img" }, [
          el("img", { src: imgUrl(post.image, cfg), alt: post.title, loading: "lazy" })
        ]));
      }
      var body = el("div", { class: "blog-card__body" });
      var meta = el("div", { class: "blog-card__meta" });
      if (post.date) meta.appendChild(el("span", { class: "blog-card__date" }, post.date));
      if (post.category) meta.appendChild(el("span", { class: "blog-card__cat" }, post.category));
      body.appendChild(meta);
      body.appendChild(el("h3", { class: "blog-card__title" }, post.title));
      body.appendChild(el("p", { class: "blog-card__excerpt" }, post.excerpt || ""));
      if (post.link) {
        body.appendChild(el("a", { href: post.link, class: "blog-card__link" }, "Read More →"));
      }
      card.appendChild(body);
      grid.appendChild(card);
    });
    return el("section", { class: "section section--alt", id: "blog" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "Blog"),
          el("h2", { class: "section__title", html: "Latest <span class='accent'>Updates</span>" }),
          el("p", { class: "section__subtitle" }, "News, tips and stories from " + cfg.business.name + ".")
        ]),
        grid
      ])
    ]);
  }

  /* ---------- Team / Doctor grid ---------- */
  function buildTeam(cfg) {
    var t = cfg.team || [];
    if (!t.length) return null;
    var grid = el("div", { class: "team-grid" });
    t.forEach(function (member) {
      var card = el("div", { class: "team-card reveal" });
      var photo;
      if (member.photo) {
        photo = el("div", { class: "team-card__photo" }, [ el("img", { src: imgUrl(member.photo, cfg), alt: member.name, loading: "lazy" }) ]);
      } else {
        var initials = (member.name || "?").split(" ").map(function(w){ return w.charAt(0); }).join("").substring(0, 2);
        photo = el("div", { class: "team-card__photo team-card__photo--initials", style: "background:var(--color-primary);color:#fff;font-size:1.6rem;font-weight:700;display:grid;place-items:center" }, initials);
      }
      card.appendChild(photo);
      var body = el("div", { class: "team-card__body" });
      body.appendChild(el("h3", { class: "team-card__name" }, member.name));
      body.appendChild(el("div", { class: "team-card__role" }, member.role || ""));
      if (member.specialty) body.appendChild(el("div", { class: "team-card__specialty" }, member.specialty));
      if (member.description) body.appendChild(el("p", { class: "team-card__desc" }, member.description));
      if (member.social) {
        var links = el("div", { class: "team-card__social" });
        if (member.social.phone) links.appendChild(el("a", { href: "tel:" + member.social.phone, "aria-label": "Call" }, [ el("span", { html: "&#128222;" }) ]));
        if (member.social.email) links.appendChild(el("a", { href: "mailto:" + member.social.email, "aria-label": "Email" }, [ el("span", { html: "&#9993;" }) ]));
        if (member.social.linkedin) links.appendChild(el("a", { href: member.social.linkedin, target: "_blank", rel: "noopener", "aria-label": "LinkedIn" }, [ el("span", { html: "in" }) ]));
        body.appendChild(links);
      }
      card.appendChild(body);
      grid.appendChild(card);
    });
    return el("section", { class: "section section--alt", id: "team" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "Our Team"),
          el("h2", { class: "section__title", html: "Meet the <span class='accent'>Experts</span>" }),
          el("p", { class: "section__subtitle" }, "The passionate professionals behind " + cfg.business.name + ".")
        ]),
        grid
      ])
    ]);
  }

  /* ---------- FAQ accordion ---------- */
  function buildFaq(cfg) {
    var faq = cfg.faq || [];
    if (!faq.length) return null;
    var list = el("div", { class: "faq-list" });
    faq.forEach(function (item, i) {
      var id = "faq-" + i;
      var details = el("details", { class: "faq-item reveal" });
      var summary = el("summary", { class: "faq-q" }, [
        el("span", { class: "faq-q__text" }, item.q),
        el("span", { class: "faq-q__icon" }, "+")
      ]);
      details.appendChild(summary);
      details.appendChild(el("div", { class: "faq-a" }, [ el("p", null, item.a) ]));
      details.addEventListener("toggle", function () {
        details.querySelector(".faq-q__icon").textContent = details.open ? "−" : "+";
      });
      list.appendChild(details);
    });
    return el("section", { class: "section", id: "faq" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "FAQ"),
          el("h2", { class: "section__title", html: "Frequently Asked <span class='accent'>Questions</span>" }),
          el("p", { class: "section__subtitle" }, "Got questions? We've got answers.")
        ]),
        list
      ])
    ]);
  }

  /* ---------- Testimonials ---------- */
  function buildTestimonials(cfg) {
    var t = cfg.testimonials || [];
    if (!t.length) return null;
    var grid = el("div", { class: "testi-grid" });
    t.forEach(function (rev) {
      grid.appendChild(el("div", { class: "testi-card reveal" }, [
        el("div", { class: "testi-rating", "aria-label": rev.rating + " stars" }, stars(rev.rating)),
        el("p", { class: "testi-text" }, "\u201C" + rev.text + "\u201D"),
        el("div", { class: "testi-author" }, [
          rev.avatar ? el("img", { class: "testi-avatar", src: imgUrl(rev.avatar, cfg), alt: rev.name }) :
            el("div", { class: "testi-avatar", style: "display:grid;place-items:center;background:" + avatarColor(rev.name) + ";color:#fff;font-weight:700;font-family:var(--font-heading);font-size:0.95rem" }, initials(rev.name)),
          el("div", null, [
            el("div", { class: "testi-name" }, rev.name),
            el("div", { class: "testi-role" }, rev.role || "")
          ])
        ])
      ]));
    });
    return el("section", { class: "section section--alt", id: "testimonials" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "Testimonials"),
          el("h2", { class: "section__title", html: "What Our <span class='accent'>Customers Say</span>" })
        ]),
        grid
      ])
    ]);
  }

  /* ---------- Contact (info + map + validated form) ---------- */
  function buildContact(cfg) {
    var c = cfg.contact || {};
    var info = el("div", { class: "contact-info" });

    if (c.phone) info.appendChild(infoCard("&#128222;", "Call Us", c.phone, "tel:" + c.phone.replace(/\s+/g, "")));
    if (c.whatsapp) info.appendChild(infoCard("&#128172;", "WhatsApp", c.whatsapp, waLink("Hi " + cfg.business.name + ", I have an enquiry.")));
    if (c.email) info.appendChild(infoCard("&#9993;", "Email", c.email, "mailto:" + c.email));
    if (c.address) info.appendChild(infoCard("&#128205;", "Visit Us", c.address.full || c.address));

    var leftCol = el("div", null, [ info ]);
    if (c.mapEmbed) {
      leftCol.appendChild(el("div", { class: "contact-map" }, [
        el("iframe", { src: c.mapEmbed, loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: "" })
      ]));
    }

    // Form (front-end only; shows success toast)
    var form = el("form", { class: "contact-form", id: "contactForm", novalidate: "" }, [
      el("h3", null, "Send Us a Message"),
      el("div", { class: "form-row" }, [
        field("name", "Your Name", "text", "Enter your name"),
        field("phone", "Phone Number", "tel", "Enter your phone")
      ]),
      field("email", "Email Address", "email", "Enter your email", "full"),
      field("message", "Your Message", "textarea", "Tell us how we can help...", "full"),
      el("button", { type: "submit", class: "btn btn--primary btn--lg", style: "width:100%" }, "Send Message")
    ]);

    var success = el("div", { class: "form-success", id: "formSuccess", role: "status", "aria-live": "polite" }, [
      el("div", { class: "form-success__icon", html: "&#10004;" }),
      el("h3", null, "Message Sent!"),
      el("p", null, "Thank you for reaching out. Our team will get back to you shortly.")
    ]);

    var formWrap = el("div", null, [ form, success ]);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "phone", "email", "message"].forEach(function (name) {
        var input = form.querySelector("[name='" + name + "']");
        var group = input.closest(".form-group");
        var val = (input.value || "").trim();
        var valid = val.length > 0;
        if (name === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (name === "phone") valid = /^[0-9+\-\s()]{7,}$/.test(val);
        group.classList.toggle("has-error", !valid);
        input.setAttribute("aria-invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;

      var endpoint = cfg.contact && cfg.contact.formEndpoint;
      var btn = form.querySelector("button[type='submit']");
      var originalText = btn.textContent;
      btn.textContent = "Sending...";
      btn.disabled = true;

      function showSuccess() {
        form.classList.add("hidden");
        success.classList.add("is-shown");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (endpoint) {
        var fd = new FormData(form);
        fd.append("subject", "New enquiry from " + cfg.business.name + " website");
        fetch(endpoint, { method: "POST", body: fd })
          .then(function (r) { return r.json(); })
          .then(function () { showSuccess(); })
          .catch(function () {
            btn.textContent = originalText;
            btn.disabled = false;
            alert("Something went wrong. Please try again or call us directly.");
          });
      } else {
        showSuccess();
      }
    });

    return el("section", { class: "section", id: "contact" }, [
      el("div", { class: "container" }, [
        el("div", { class: "section__head" }, [
          el("span", { class: "section__eyebrow" }, "Get in Touch"),
          el("h2", { class: "section__title", html: "Contact <span class='accent'>Us</span>" }),
          el("p", { class: "section__subtitle" }, "We'd love to hear from you. Reach out and we'll respond within 24 hours." )
        ]),
        el("div", { class: "contact-grid" }, [ leftCol, formWrap ])
      ])
    ]);
  }

  function infoCard(icon, title, value, href) {
    return el("div", { class: "info-card" }, [
      el("div", { class: "info-card__icon", html: icon }),
      el("div", null, [
        el("h4", null, title),
        href ? el("p", null, [ el("a", { href: href }, value) ]) : el("p", null, value)
      ])
    ]);
  }
  function field(name, label, type, placeholder, width) {
    var errId = "error-" + name;
    var input;
    if (type === "textarea") {
      input = el("textarea", { name: name, id: name, placeholder: placeholder, rows: "4", "aria-describedby": errId });
    } else {
      input = el("input", { type: type, name: name, id: name, placeholder: placeholder, "aria-describedby": errId });
    }
    return el("div", { class: "form-group" + (width === "full" ? " form-group--full" : "") }, [
      el("label", { for: name }, label),
      input,
      el("span", { class: "form-error", id: errId, role: "alert" }, "Please enter a valid " + label.toLowerCase())
    ]);
  }

  /* ---------- CTA band ---------- */
  function buildCtaBand(cfg) {
    var band = el("div", { class: "cta-band reveal" }, [
      el("h2", null, (cfg.ctaBand && cfg.ctaBand.title) || ("Ready to Experience " + cfg.business.name + "?")),
      el("p", null, (cfg.ctaBand && cfg.ctaBand.subtitle) || "Get in touch today and let us take care of the rest."),
      el("div", { class: "hero__actions" }, [
        el("a", { href: "#contact", class: "btn btn--secondary btn--lg" }, "Contact Now"),
        el("a", { href: waLink(similarWebsiteMsg(cfg.business.name)), target: "_blank", rel: "noopener", class: "btn btn--ghost-light btn--lg" }, "Chat on WhatsApp")
      ])
    ]);
    return el("section", { class: "section" }, [ el("div", { class: "container" }, [ band ]) ]);
  }

  /* ---------- Footer ---------- */
  function buildFooter(cfg) {
    var c = cfg.contact || {};
    var f = el("footer", { class: "site-footer" });

    // about col
    var about = el("div", { class: "footer-col footer-about" }, [
      el("a", { href: "#home", class: "brand" }, [
        el("span", { class: "brand__mark" }, (cfg.business.name || "R").charAt(0)), cfg.business.name
      ]),
      el("p", null, cfg.about && cfg.about.footerBlurb ? cfg.about.footerBlurb : (cfg.business.tagline || ""))
    ]);
    if (cfg.social) {
      var socials = el("div", { class: "social-links" });
      if (cfg.social.facebook) socials.appendChild(socialLink("facebook", cfg.social.facebook));
      if (cfg.social.instagram) socials.appendChild(socialLink("instagram", cfg.social.instagram));
      if (cfg.social.twitter) socials.appendChild(socialLink("twitter", cfg.social.twitter));
      if (cfg.social.youtube) socials.appendChild(socialLink("youtube", cfg.social.youtube));
      about.appendChild(socials);
    }

    // quick links col
    var quick = el("div", { class: "footer-col" }, [
      el("h4", null, "Quick Links"),
      el("ul", null, [
        ["#home","Home"],["#about","About"],["#services","Services"],
        ["#gallery","Gallery"],["#testimonials","Reviews"],["#contact","Contact"]
      ].map(function (l) { return el("li", null, [ el("a", { href: l[0] }, l[1]) ]); }))
    ]);

    // contact col
    var contactCol = el("div", { class: "footer-col" }, [
      el("h4", null, "Contact"),
      el("ul", { class: "footer-contact" }, [
        c.address ? liIcon("&#128205;", c.address.full || c.address) : null,
        c.phone ? liIcon("&#128222;", c.phone) : null,
        c.email ? liIcon("&#9993;", c.email) : null
      ].filter(Boolean))
    ]);

    // hours col
    var hoursCol = el("div", { class: "footer-col" }, [ el("h4", null, "Opening Hours") ]);
    if (cfg.hours && cfg.hours.length) {
      hoursCol.appendChild(el("ul", { class: "footer-hours" }, cfg.hours.map(function (h) {
        return el("li", null, [ el("span", null, h.day), el("span", null, h.time) ]);
      })));
    }

    f.appendChild(el("div", { class: "container" }, [
      el("div", { class: "footer-grid" }, [ about, quick, contactCol, hoursCol ]),
      el("div", { class: "footer-bottom container" }, [
        el("span", null, "© " + new Date().getFullYear() + " " + cfg.business.name + ". All rights reserved."),
        el("span", { html: "Demo by <a href='" + RW.domain + "' target='_blank' rel='noopener'>" + RW.shortName + "</a> • <a href='" + RW.contactPage + "' target='_blank' rel='noopener'>Get a similar website</a>" })
      ])
    ]));
    return f;
  }
  function liIcon(icon, text) {
    return el("li", null, [ el("span", { html: icon }), el("span", null, text) ]);
  }
  function socialLink(type, href) {
    var paths = {
      facebook: "M9 8H6v4h3v8h4v-8h3.6l.4-4H13V6.5c0-.6.4-1 1-1h3V2h-3c-2.8 0-5 2.2-5 5v1z",
      instagram: "M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.5-.1 4.8c-.1 3.2-1.6 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.5 2.2 15.2 2.2 12s0-3.5.1-4.8C2.4 4 4 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.6A6.2 6.2 0 1 0 18.2 12 6.2 6.2 0 0 0 12 5.8zm0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.8a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z",
      twitter: "M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.6.8-2.5 1A4 4 0 0 0 12 9c0 .3 0 .6.1.9-3.3-.2-6.2-1.8-8.2-4.2a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.8-.5a4 4 0 0 0 3.2 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 3 19.5a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.4-1.3 2-2.1z",
      youtube: "M23 7.5a3 3 0 0 0-2.1-2.1C19 4.8 12 4.8 12 4.8s-7 0-8.9.6A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5zM9.8 15.3V8.7l5.7 3.3z"
    };
    return el("a", { href: href, target: "_blank", rel: "noopener", "aria-label": type, title: type },
      [ el("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", html: "<path d='" + paths[type] + "'/>" }) ]);
  }

  /* ---------- Floating WhatsApp (lead-gen → RavyaWorks) ---------- */
  function buildWhatsAppFloat(cfg) {
    var msg = similarWebsiteMsg(cfg.business.name);
    var float = el("a", {
      class: "whatsapp-float", href: waLink(msg), target: "_blank", rel: "noopener",
      "aria-label": "Chat on WhatsApp", title: "Get a similar website"
    }, [ el("svg", { viewBox: "0 0 24 24", fill: "currentColor", html: "<path d='M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 0 16 8 8 0 0 1-4-1.1l-.4-.2-3 .8.8-2.9-.2-.4A8 8 0 0 1 12 4zm-2.5 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7s1.5-.6 1.7-1.2c.2-.6.2-1.1.1-1.2l-.7-.4c-.4-.2-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-.4-.2-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4z'/>" }) ]);
    var tip = el("div", { class: "whatsapp-tooltip" }, "Get a similar website →");
    return [ float, tip ];
  }

  /* ---------- Cookie Consent (GDPR) ---------- */
  function buildCookieConsent(cfg) {
    if (!cfg.cookieConsent) return null;
    if (localStorage.getItem("rw_cookie_consent")) return null;
    var banner = el("div", { class: "cookie-banner", id: "cookieBanner", role: "alert" });
    var text = typeof cfg.cookieConsent === "string" ? cfg.cookieConsent :
      "We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.";
    banner.appendChild(el("div", { class: "cookie-banner__text" }, [el("p", null, text)]));
    var actions = el("div", { class: "cookie-banner__actions" });
    actions.appendChild(el("button", {
      class: "btn btn--primary",
      onClick: function () {
        localStorage.setItem("rw_cookie_consent", "accepted");
        banner.classList.remove("is-shown");
        document.body.style.paddingBottom = "0";
      }
    }, "Accept"));
    actions.appendChild(el("button", {
      class: "btn btn--ghost",
      onClick: function () {
        localStorage.setItem("rw_cookie_consent", "declined");
        banner.classList.remove("is-shown");
        document.body.style.paddingBottom = "0";
      }
    }, "Decline"));
    banner.appendChild(actions);
    setTimeout(function () {
      banner.classList.add("is-shown");
      document.body.style.paddingBottom = "80px";
    }, 1500);
    return banner;
  }

  /* ---------- "Request Similar Website" ribbon ---------- */
  function buildRibbon(cfg) {
    var ribbon = el("div", { class: "ravya-ribbon", id: "ravyaRibbon" }, [
      el("div", { class: "ravya-ribbon__label", html: "Like this website? <b>" + RW.shortName + "</b> can build one for your business." }),
      el("a", { href: RW.contactPage, target: "_blank", rel: "noopener", class: "btn btn--primary" }, "Request Similar Website →"),
      el("button", { class: "ravya-ribbon__close", "aria-label": "Dismiss", onClick: function () { ribbon.classList.remove("is-shown"); document.body.style.paddingBottom = "0"; } }, "×")
    ]);
    // Show after scroll / delay
    setTimeout(function () {
      if (sessionStorage.getItem("rw_ribbon_dismissed")) return;
      ribbon.classList.add("is-shown");
      document.body.style.paddingBottom = "64px";
    }, 4000);
    return ribbon;
  }

  /* ============================================================
     INTERACTIONS: sticky header, reveal-on-scroll, parallax,
     counter animation, staggered cards, smooth close
     ============================================================ */
  function initInteractions() {
    // Sticky header shadow
    var header = document.getElementById("siteHeader");
    function onScroll() {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Close mobile nav on link click
    var nav = document.getElementById("mainNav");
    var toggle = document.querySelector(".nav-toggle");
    if (nav) nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        if (toggle) { toggle.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
      }
    });

    // ---------- Parallax: hero background moves slower ----------
    var heroBg = document.querySelector(".hero__bg");
    if (heroBg) {
      window.addEventListener("scroll", function () {
        var st = window.scrollY;
        heroBg.style.transform = "translateY(" + (st * 0.35) + "px)";
      }, { passive: true });
    }

    // ---------- 3D tilt on cards ----------
    var tiltCards = document.querySelectorAll(".service-card, .team-card, .blog-card, .testi-card, .pricing-card");
    tiltCards.forEach(function (card) {
      card.style.transformStyle = "preserve-3d";
      card.addEventListener("mouseenter", function () { card.classList.add("tilt-active"); });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("tilt-active");
        card.style.transform = "";
      });
      card.addEventListener("mousemove", function (e) {
        if (!card.classList.contains("tilt-active")) return;
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(800px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg) translateY(-4px) scale(1.02)";
      });
    });

    // ---------- Button ripple ----------
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.2;
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        var ripple = el("span", { class: "ripple", style: "width:" + size + "px;height:" + size + "px;left:" + x + "px;top:" + y + "px" });
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });

    // ---------- Staggered card entrance (assign --i index) ----------
    var gridSelectors = [".services-grid", ".pricing-grid", ".menu-list",
      ".gallery-grid", ".gallery-grid--masonry", ".gallery-grid--scroll",
      ".testi-grid", ".team-grid", ".blog-grid", ".faq-list", ".stats"];
    gridSelectors.forEach(function (sel) {
      var container = document.querySelector(sel);
      if (!container) return;
      var items = container.querySelectorAll(".reveal");
      items.forEach(function (item, idx) {
        item.style.setProperty("--i", idx);
      });
    });

    // ---------- Counter animation on stats ----------
    var stats = document.querySelectorAll(".stat__num");
    if (stats.length) {
      if ("IntersectionObserver" in window) {
        var countObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        stats.forEach(function (s) { countObserver.observe(s); });
      } else {
        stats.forEach(function (s) { animateCounter(s); });
      }
    }

    // ---------- Reveal-on-scroll via IntersectionObserver ----------
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
    }
  }

  /* Counter animation helper: counts up from 0 to displayed value */
  function animateCounter(el) {
    var raw = el.textContent.trim();
    var suffix = raw.replace(/[\d.,]+/g, "").trim();
    var numStr = raw.replace(/[^\d.,]/g, "").replace(/,/g, "");
    var target = parseFloat(numStr);
    if (isNaN(target) || target <= 0) return;
    var prefix = raw.indexOf("+") !== -1 ? "+" : "";
    var duration = 1500;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      var current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + (suffix ? " " + suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     BOOTSTRAP
     ============================================================ */
  function boot() {
    var cfg = window.SITE_CONFIG;
    if (!cfg || !cfg.business) {
      console.error("[RavyaWorks Framework] No SITE_CONFIG found. Did you include config.js before app.js?");
      return;
    }

    applyTheme(cfg.theme);
    buildHead(cfg);
    applyLang(cfg);

    // Dark mode
    if (cfg.darkMode) document.body.classList.add("dark-mode");

    // Normalize gallery config: if it's an array of strings, wrap in object with style
    if (Array.isArray(cfg.gallery)) {
      cfg.gallery = { style: cfg.galleryStyle || "grid", images: cfg.gallery };
    }

    var mount = document.getElementById("app");
    if (!mount) { mount = document.body; }

    // Build pieces
    var pieces = [];
    pieces.push(buildHeader(cfg));
    pieces.push(buildHero(cfg));
    var stats = buildStats(cfg);
    if (stats) pieces.push(stats);
    if (cfg.about) pieces.push(buildAbout(cfg));
    if (cfg.services) pieces.push(buildServices(cfg));
    var gallery = buildGallery(cfg);
    if (gallery) pieces.push(gallery);
    var faq = buildFaq(cfg);
    if (faq) pieces.push(faq);
    var team = buildTeam(cfg);
    if (team) pieces.push(team);
    var blog = buildBlog(cfg);
    if (blog) pieces.push(blog);
    var testi = buildTestimonials(cfg);
    if (testi) pieces.push(testi);
    pieces.push(buildCtaBand(cfg));
    pieces.push(buildContact(cfg));
    pieces.push(buildFooter(cfg));

    pieces.forEach(function (p) { if (p) mount.appendChild(p); });

    // Floating widgets (body-level)
    buildWhatsAppFloat(cfg).forEach(function (n) { document.body.appendChild(n); });
    document.body.appendChild(buildRibbon(cfg));
    var cookieBanner = buildCookieConsent(cfg);
    if (cookieBanner) document.body.appendChild(cookieBanner);

    // PWA: register service worker
    if ("serviceWorker" in navigator) {
      // sw.js lives at /demos/sw.js so scope covers all demos/
      var swPath = (cfg._swPath || "../sw.js");
      navigator.serviceWorker.register(swPath).catch(function () {});
    }

    initInteractions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
