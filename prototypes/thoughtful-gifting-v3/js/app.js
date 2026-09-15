/* =============================================================
   Photobox — "Thoughtful Gifting" prototype
   Vanilla JS. No frameworks, no build, no backend.
   ============================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     Image helper — graceful degradation.
     Builds a .media block: a real (swappable) stock image on top
     of a neutral fallback that shows the label if the image fails
     to load. Stock images are deliberate placeholders (see README).
     Swap `img` to point at curated/AI imagery later.
     ----------------------------------------------------------- */
  /* Build the card image area. Accepts an array of image URLs:
     - one image  → a single cover image (as before)
     - two images → a mini slider (slide 0 = recipient being gifted,
       slide 1 = the product). On desktop it swaps on card hover; on
       mobile it's a swipeable track with dot affordance (see
       initCardSliders + CSS). */
  function mediaBlock(imgs, icon, label, isReal, badge) {
    imgs = imgs || [];
    var wrap = document.createElement("div");
    wrap.className = "media";

    if (badge) {
      var badgeEl = document.createElement("span");
      badgeEl.className = "badge";
      badgeEl.textContent = badge;
      wrap.appendChild(badgeEl);
    }

    if (!imgs.length) {
      var fallback = document.createElement("div");
      fallback.className = "media-fallback";
      fallback.innerHTML =
        '<span class="ic">' + (icon || "🎁") + '</span>' +
        '<span class="lbl">' + label + "</span>";
      wrap.appendChild(fallback);
    }

    /* A slide is either a plain src string, or { src, placeholder: true }
       for a slot where we don't have real hover content yet — that slide
       is always blurred (never gets .is-real) so the gap reads clearly. */
    function makeImg(spec) {
      var isPlaceholder = spec && typeof spec === "object" && spec.placeholder;
      var src = isPlaceholder ? spec.src : spec;
      var el = new Image();
      el.src = src;
      el.alt = isPlaceholder ? label + " (image coming soon)" : label;
      el.loading = "lazy";
      if (isReal && !isPlaceholder) el.classList.add("is-real"); // exempt from user-testing blur
      el.addEventListener("error", function () { el.classList.add("failed"); });
      return el;
    }

    if (imgs.length > 1) {
      wrap.classList.add("has-slider");
      var track = document.createElement("div");
      track.className = "media-track";
      imgs.forEach(function (spec) {
        var slide = document.createElement("div");
        slide.className = "media-slide";
        slide.appendChild(makeImg(spec));
        track.appendChild(slide);
      });
      wrap.appendChild(track);

      var dots = document.createElement("div");
      dots.className = "media-dots";
      dots.setAttribute("aria-hidden", "true");
      imgs.forEach(function (_, i) {
        var d = document.createElement("span");
        d.className = "dot" + (i === 0 ? " is-active" : "");
        dots.appendChild(d);
      });
      wrap.appendChild(dots);
    } else if (imgs.length === 1) {
      wrap.appendChild(makeImg(imgs[0]));
    }
    return wrap;
  }


  /* -----------------------------------------------------------
     Gift-category promotion (JTBD-49).

     "Gifts" carries two meanings that currently collide: the S1 PRODUCT
     CATEGORY — mugs, jigsaws, blocks, magnets, cushions — that campaigns
     and promo bars target, and the Thoughtful Gifting JTBD, which needs
     to surface books, calendars, prints and wall decor as well.

     Keying the offer to the product category rather than to the page is
     what lets both live here: a photo book can sit beside a mug and
     visibly not inherit gift-category pricing, so campaign targeting
     needs no reconfiguration and the page needs no promo bar.

     Icons are the product-type discriminator in this dataset.
     ----------------------------------------------------------- */
  var GIFT_CATEGORY_ICONS = ["☕", "🧩", "🧲", "🛋️", "🧊"];
  var PROMO_TAG_ICON =
    '<svg class="promo-tag-icon" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M7 2H2v5l7 7 5-5-7-7Z" fill="currentColor"/>' +
      '<circle class="promo-tag-dot" cx="4.2" cy="4.2" r="1.1"/>' +
    "</svg>";
  var GIFT_PROMO = {
    label: "40% off over \xA335",
    terms: "40% off gifts on orders from \xA335"
  };
  function giftPromo(p) {
    return GIFT_CATEGORY_ICONS.indexOf(p.icon) !== -1 ? GIFT_PROMO : null;
  }

  /* -----------------------------------------------------------
     Recipient data. days values reflect Photobox express delivery
     speeds by product category:
       prints/wallet prints: 2  |  mugs/cards: 3
       calendars/canvas/cushion: 4  |  softcover books: 5
       hardcover books: 6  |  bundles: 7
     ----------------------------------------------------------- */
  var RECIPIENTS = [
    {
      key: "her", emoji: "💐", label: "Her",
      products: [
        { badge: "Quick to make", title: "Family Print Set", desc: "24 prints of the family's year — a thoughtful little gift, ready in days.", price: "13.99", days: 2, seed: "tg-mum-prints", icon: "🖼️", imgs: ["assets/mum-prints.png", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-6x4" },
        { title: "Fridge Photo Magnets", desc: "The grandkids on the fridge, where she'll see them every morning.", price: "9.99", days: 3, seed: "tg-mum-magnets", icon: "🧲", imgs: ["assets/mum-mug.png", "assets/lifestyle-magnets.jpg"], url: "https://www.photobox.co.uk/photo-magnets" },
        { badge: "Bestseller", title: "Canvas Gallery Print", desc: "Her favourite family photo, printed at gallery quality and ready to hang.", price: "19.99", days: 4, seed: "tg-mum-canvas", icon: "🖼️", imgs: ["assets/mum-canvas.png", "assets/lifestyle-canvas.jpg"], url: "https://www.photobox.co.uk/wall-art/canvas-prints" },
        { badge: "Most Popular", title: "Grandchildren Calendar", desc: "12 months of photos from the grandkids, with every birthday pre-marked.", price: "14.99", days: 4, seed: "tg-mum-calendar", icon: "📅", imgs: ["assets/mum-calendar.png", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Bestseller", title: "Family Photo Book", desc: "A beautifully printed record of the family's year — every milestone, every moment.", price: "24.99", days: 6, seed: "tg-mum-book", icon: "📖", imgs: ["assets/mum-book.png", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-hardcover-layflat" },
        { title: "Sunday Lunch Jigsaw", desc: "A treasured family photo as a puzzle — one for the whole family to do.", price: "16.99", days: 9, seed: "tg-mum-jigsaw", icon: "🧩", imgs: ["assets/mum-jigsaw.png", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    },
    {
      key: "him", emoji: "👔", label: "Him",
      products: [
        { badge: "Quick to make", title: "Wallet Photo Set", desc: "12 wallet-sized prints in a personalised sleeve — great for the desk.", price: "12.99", days: 2, seed: "tg-dad-wallet", icon: "🖼️", imgs: ["assets/dad-print-set.png", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-4x4" },
        { title: "Personalised Photo Mug", desc: "A collage of his favourite people, on a mug for his desk.", price: "9.99", days: 3, seed: "tg-dad-mug", icon: "☕", imgs: ["assets/dad-mug.png", "assets/product-mug.jpg"], url: "https://www.photobox.co.uk/personalised-mugs/classic" },
        { title: "Framed Canvas Print", desc: "His favourite family photo, printed large and framed to hang.", price: "24.99", days: 4, seed: "tg-dad-canvas", icon: "🖼️", imgs: ["assets/dad-canvas.png", "assets/lifestyle-canvas.jpg"], url: "https://www.photobox.co.uk/wall-art/framed-canvas" },
        { badge: "Most Popular", title: "The Year Calendar", desc: "A desk or wall calendar of the family — handy and personal.", price: "14.99", days: 4, seed: "tg-dad-calendar", icon: "📅", imgs: ["assets/dad-calendar.png", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Bestseller", title: "Family Photo Book", desc: "The year in photos — a keepsake he'll actually look at.", price: "24.99", days: 6, seed: "tg-dad-book", icon: "📖", imgs: ["assets/dad-book.png", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-hardcover-layflat" },
        { title: "Sunday Drive Jigsaw", desc: "A favourite family photo as a 500-piece puzzle — a slow-Sunday gift.", price: "16.99", days: 9, seed: "tg-dad-jigsaw", icon: "🧩", imgs: ["assets/dad-jigsaw.png", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    },
    {
      key: "friends", emoji: "👯", label: "Friends",
      products: [
        { badge: "Quick to make", title: "Favourite Moments Print Set", desc: "30 of your best photos together, printed and boxed — ready to unwrap.", price: "14.99", days: 2, seed: "tg-bf-prints", icon: "🖼️", imgs: ["assets/friend-print-set.png", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-6x4" },
        { title: "Inside-Joke Photo Mug", desc: "A favourite photo and your running joke, on a mug they'll use every day.", price: "9.99", days: 3, seed: "tg-bf-mug", icon: "☕", imgs: ["assets/friend-mug.png", "assets/product-mug.jpg"], url: "https://www.photobox.co.uk/personalised-mugs/classic" },
        { title: "Memory Collage Cushion", desc: "A collage of your best moments, printed on a luxury velvet cushion.", price: "18.99", days: 4, seed: "tg-bf-cushion", icon: "🛋️", imgs: ["assets/friend-cushion.png", "assets/product-cushion.jpg"], url: "https://www.photobox.co.uk/personalised-cushion" },
        { badge: "Bestseller", title: "Friendship Calendar", desc: "12 months of shared memories, with space for birthdays and anniversaries.", price: "14.99", days: 4, seed: "tg-bf-calendar", icon: "📅", imgs: ["assets/friend-calendar.png", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Most Popular", title: '"The Story of Us" Photo Book', desc: "Turn your friendship photos into a hardcover, lay-flat story book.", price: "24.99", days: 6, seed: "tg-bf-storybook", icon: "📖", imgs: ["assets/friend-book.png", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-hardcover-layflat" },
        { title: "Memory Lane Jigsaw", desc: "A favourite photo as a 500-piece puzzle — for your next night in together.", price: "16.99", days: 9, seed: "tg-bf-jigsaw", icon: "🧩", imgs: ["assets/friend-jigsaw.png", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    },
    {
      key: "grandparents", emoji: "👵", label: "Grandparents",
      products: [
        { badge: "Quick to make", title: "Grandchildren Print Set", desc: "24 prints of all the grandkids — a thoughtful gift, ready in days.", price: "13.99", days: 2, seed: "tg-gp-prints", icon: "🖼️", imgs: ["assets/grandparent-print-set.png", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-6x4" },
        { title: "Grandkids Fridge Magnets", desc: "Every grandchild on the fridge, where they'll see them every day.", price: "9.99", days: 3, seed: "tg-gp-magnets", icon: "🧲", imgs: ["assets/grandparent-mug.png", "assets/lifestyle-magnets.jpg"], url: "https://www.photobox.co.uk/photo-magnets" },
        { badge: "Bestseller", title: "Family Portrait Canvas", desc: "That rare photo when everyone's together, printed gallery-quality.", price: "19.99", days: 4, seed: "tg-gp-canvas", icon: "🖼️", imgs: ["assets/grandparent-canvas.png", "assets/lifestyle-canvas.jpg"], url: "https://www.photobox.co.uk/wall-art/canvas-prints" },
        { badge: "Most Popular", title: "Family Calendar", desc: "Photos of all the family, month by month, with space for every grandchild's birthday.", price: "14.99", days: 4, seed: "tg-gp-calendar", icon: "📅", imgs: ["assets/grandparent-calendar.png", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Bestseller", title: "Grandchildren Photo Book", desc: "Every grandchild, every visit — a book they'll keep on the coffee table.", price: "24.99", days: 6, seed: "tg-gp-book", icon: "📖", imgs: ["assets/grandparent-book.png", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-hardcover-layflat" },
        { title: "Family Jigsaw", desc: "A treasured family photo as a puzzle — one to do together on a visit.", price: "16.99", days: 9, seed: "tg-gp-jigsaw", icon: "🧩", imgs: ["assets/grandparent-jigsaw.png", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    },
    {
      key: "newlyweds", emoji: "❤️", label: "Newlyweds",
      products: [
        { badge: "Quick to make", title: "\"Just Us\" Print Set", desc: "20 prints of your favourite moments together — small, personal, ready fast.", price: "12.99", days: 2, seed: "tg-partner-prints", icon: "🖼️", imgs: ["assets/partner-print-set.jpg", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-6x4" },
        { title: "\"Us\" Photo Mug", desc: "A favourite photo of you two, on a mug for their morning coffee.", price: "9.99", days: 3, seed: "tg-partner-mug", icon: "☕", imgs: ["assets/partner-mug.jpg", "assets/product-mug.jpg"], url: "https://www.photobox.co.uk/personalised-mugs/classic" },
        { title: "Your Favourite Photo Canvas", desc: "That one photo you both love, printed wall-ready in your choice of size and finish.", price: "19.99", days: 4, seed: "tg-partner-canvas", icon: "🖼️", imgs: ["assets/partner-canvas.jpg", "assets/lifestyle-canvas.jpg"], url: "https://www.photobox.co.uk/wall-art/canvas-prints" },
        { badge: "Most Popular", title: "Personalised Photo Calendar", desc: "A year of your favourite moments together, with key dates pre-filled.", price: "14.99", days: 4, seed: "tg-partner-calendar", icon: "📅", imgs: ["assets/partner-calendar.jpg", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Bestseller", title: "Anniversary Photo Book", desc: "From your first photo together to now, in a hardcover lay-flat book.", price: "29.99", days: 6, seed: "tg-partner-book", icon: "📖", imgs: ["assets/partner-book.jpg", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-hardcover-layflat" },
        { title: "\"Two of Us\" Jigsaw", desc: "A favourite couple photo as a 500-piece puzzle — a cosy night-in gift.", price: "16.99", days: 9, seed: "tg-partner-jigsaw", icon: "🧩", imgs: ["assets/partner-jigsaw.jpg", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    },
    {
      key: "new-parents", emoji: "🧒", label: "New parents",
      products: [
        { badge: "Quick to make", title: "Adventure Print Set", desc: "24 prints of their favourite days out — small, sturdy, ready fast.", price: "12.99", days: 2, seed: "tg-child-prints", icon: "🖼️", imgs: ["assets/child-prints.png", "assets/product-print-set.jpg"], url: "https://www.photobox.co.uk/photo-printing/photo-prints-6x4" },
        { title: "Bedtime Story Mug", desc: "A mug printed with their own drawing or photo — for their milk before bed.", price: "9.99", days: 3, seed: "tg-child-mug", icon: "☕", imgs: ["assets/child-mug.png", "assets/product-mug.jpg"], url: "https://www.photobox.co.uk/personalised-mugs/classic" },
        { title: "Growing Up Canvas Print", desc: "A favourite photo, printed gallery-quality for their bedroom wall.", price: "18.99", days: 4, seed: "tg-child-canvas", icon: "🖼️", imgs: ["assets/child-canvas.png", "assets/lifestyle-canvas.jpg"], url: "https://www.photobox.co.uk/wall-art/canvas-prints" },
        { badge: "Most Popular", title: "My Year Calendar", desc: "12 months of their milestones, drawings and days out.", price: "14.99", days: 4, seed: "tg-child-calendar", icon: "📅", imgs: ["assets/child-calendar.png", "assets/product-calendar.jpg"], url: "https://www.photobox.co.uk/personalised-calendars/a4" },
        { badge: "Bestseller", title: "My Story So Far Photo Book", desc: "Every milestone from the year — softcover, lay-flat, easy to page through.", price: "22.99", days: 5, seed: "tg-child-book", icon: "📖", imgs: ["assets/child-book.png", "assets/product-book.jpg"], url: "https://www.photobox.co.uk/photo-books/landscape-l-softcover" },
        { title: "Favourite Day Jigsaw", desc: "A favourite photo as a puzzle — sized right for smaller hands.", price: "14.99", days: 9, seed: "tg-child-jigsaw", icon: "🧩", imgs: ["assets/child-jigsaw.png", "assets/product-jigsaw.jpg"], url: "https://www.photobox.co.uk/personalised-jigsaw" }
      ]
    }
  ];

  function stockUrl(seed, w, h) {
    return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h;
  }

  /* A real date ("Delivered by Mon 7 Sep") reads faster than a day-count
     ("Arrives in 9 days") — customers don't have to do the maths against
     today's date themselves. Built by hand (not Intl) so the format is
     exact and doesn't depend on the browser's locale defaults. */
  var WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTH_ABBR   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function deliveryDateLabel(days, mode) {
    /* Express uses p.days; Standard adds 2 days on top */
    var isExpress = mode === "deadline";
    var d = new Date();
    d.setDate(d.getDate() + days + (isExpress ? 0 : 2));
    var date = WEEKDAY_ABBR[d.getDay()] + " " + d.getDate() + " " + MONTH_ABBR[d.getMonth()];
    var service = isExpress ? "Express" : "Standard";
    return "<span>" + date + " with " + service + "</span>";
  }

  /* -----------------------------------------------------------
     Urgency filter — "Need it by:" row beneath recipient chips.
     No longer filters products out — it only re-orders them.
     "No Rush" keeps each recipient's curated default order;
     "I have a Deadline" re-sorts fastest-arriving first.
     ----------------------------------------------------------- */
  var URGENCY_OPTIONS = [
    { label: "No Rush",           mode: null },
    { label: "Express Delivery", icon: "local_shipping", mode: "deadline" }
  ];

  /* State */
  var currentRecipientKey = null;
  var currentUrgencyMode  = null;   /* null = No Rush (curated order) */
  var transitionId        = 0;      /* incremented each render to cancel in-flight transitions */

  /* -----------------------------------------------------------
     Product grid — build, order, animate.
     ----------------------------------------------------------- */
  function filterProducts(recipient) {
    if (currentUrgencyMode === "deadline") return recipient.products.slice().sort(function (a, b) { return a.days - b.days; });
    return recipient.products.slice().sort(function (a, b) { return b.days - a.days; });
  }

  /* -----------------------------------------------------------
     Per-product star rating (trust signal).
     Ratings/counts are MOCK — deterministically derived from the
     product so each card shows a stable, realistic-looking score.
     The block links out to Photobox's Trustpilot page. Placed in the
     product foot, by the price, so the trust signal is scannable right
     where the recommendation is (per the "scannable trust" principle).
     ----------------------------------------------------------- */
  var TRUSTPILOT_URL = "https://www.trustpilot.com/review/www.photobox.co.uk";

  function productRating(p) {
    var key = (p.seed || p.title || "");
    var h = 0;
    for (var i = 0; i < key.length; i++) { h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff; }
    var score = 4.2 + (h % 9) * 0.1;                 // 4.2 – 5.0 in 0.1 steps
    var count = 18 + (Math.floor(h / 9) % 620);      // 18 – 637 reviews
    return { score: Math.round(score * 10) / 10, count: count };
  }

  /* Real ARC-3 arc3-star-rating component only ships whole/half-star
     steps (--1, --1-5, --2 ... --5), so the mock 0.1-step score is
     rounded to the nearest half star for the visual, while the exact
     score is still what's printed and read out. */
  function starStepClass(score) {
    var half = Math.round(score * 2) / 2;
    return "arc3-star-rating--" + String(half).replace(".", "-").replace(/-0$/, "");
  }

  function ratingHtml(p) {
    var r = productRating(p);
    return '<a class="product-rating" href="' + TRUSTPILOT_URL + '" target="_blank" rel="noopener noreferrer" ' +
             'aria-label="Rated ' + r.score.toFixed(1) + ' out of 5 from ' + r.count + ' reviews on Trustpilot">' +
             '<span class="arc3-star-rating ' + starStepClass(r.score) + '" aria-hidden="true"></span>' +
             '<span class="rating-count">' + r.score.toFixed(1) + ' (' + r.count + ')</span>' +
           "</a>";
  }

  function buildGrid(grid, products) {
    grid.innerHTML = "";
    /* defer so DOM has updated before measuring */
    setTimeout(function(){
      if (grid._syncScrollbar) grid._syncScrollbar();
      if (grid._syncArrows) grid._syncArrows();
    }, 0);

    if (!products.length) {
      var empty = document.createElement("p");
      empty.className = "product-grid-empty";
      empty.textContent = "No gifts available for this recipient yet.";
      grid.appendChild(empty);
      return;
    }

    var recipientPool = [
      "assets/header-recipient.jpg",
      "assets/gallery_03_gift_being_opened_tom.png",
      "assets/gallery_05_gift_wrapping_moment_rachel.png",
      "assets/gallery_02_cosy_memory_moment_emma.png"
    ];

    products.forEach(function (p, idx) {
      var card = document.createElement("article");
      card.className = "product-card";

      var cardImgs;
      if (p.imgs && p.imgs.length) {
        cardImgs = p.imgs;
      } else {
        // Slide 1: product-specific recipient lifestyle shot, or cycle through pool.
        // Slide 2: the product image itself.
        var isCanvas  = p.icon === "🖼️" && p.title.toLowerCase().indexOf("canvas") !== -1;
        var isBook    = p.icon === "📖";
        var isCushion = p.icon === "🛋️";
        var recipientSlide = isCanvas  ? "assets/slide-canvas-recipient.jpg"
                           : isBook    ? "assets/slide-book-recipient.jpg"
                           : isCushion ? "assets/slide-cushion-recipient.jpg"
                           : recipientPool[idx % recipientPool.length];
        var productSlide = p.img || stockUrl(p.seed, 520, 400);
        cardImgs = [recipientSlide, productSlide];
      }
      card.appendChild(mediaBlock(cardImgs, p.icon, p.title, true, p.badge));

      var promo = giftPromo(p);

      var body = document.createElement("div");
      body.className = "product-body";
      body.innerHTML =
        '<h3 class="product-title">' + p.title + "</h3>" +
        '<p class="product-desc">' + p.desc + "</p>" +
        '<div class="product-foot">' +
          '<div class="product-price">' +
            '<span class="from">From</span>' +
            '<div class="price-row">' +
              "\xA3" + p.price +
              (promo
                ? '<span class="promo-tag" title="' + promo.terms + '" aria-label="' + promo.terms + '">' + PROMO_TAG_ICON + promo.label + "</span>"
                : "") +
            "</div>" +
          "</div>" +
          ratingHtml(p) +
        "</div>";
      var arrives = document.createElement("div");
      arrives.className = "arrives";
      var icon = currentUrgencyMode === "deadline"
        ? '<i class="arc3-icon icon--small notranslate arrives-icon" aria-hidden="true">delivery_fast_track_v2</i>'
        : '<span class="material-symbols-outlined arrives-icon" aria-hidden="true">local_shipping</span>';
      arrives.innerHTML = icon + ' ' + deliveryDateLabel(p.days, currentUrgencyMode);
      card.appendChild(body);
      card.appendChild(arrives);
      if (false && p.url) { /* set to true to re-enable PDP click-through */
        card.style.cursor = "pointer";
        card.addEventListener("click", function () { window.open(p.url, "_blank", "noopener"); });
      }
      grid.appendChild(card);
    });

    initCardSliders(grid);   // wire hover-swap / swipe for two-image cards
  }

  /* -----------------------------------------------------------
     Two-image card slider. Desktop (hover: hover): hovering the card
     slides from the "being gifted" shot to the product shot. Mobile:
     the track is a native swipeable scroller; the dots reflect and
     control the current slide.
     ----------------------------------------------------------- */
  function initCardSliders(grid) {
    var hoverCapable = window.matchMedia && window.matchMedia("(hover: hover) and (min-width: 601px)").matches;
    grid.querySelectorAll(".media.has-slider").forEach(function (media) {
      var track = media.querySelector(".media-track");
      var dots  = media.querySelectorAll(".media-dots .dot");
      var card  = media.closest(".product-card");
      if (!track) return;

      var currentSlide = 0;
      var slideCount   = dots.length;
      var prevBtn = null, nextBtn = null;

      function setActive(i) {
        currentSlide = i;
        dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
        if (prevBtn) prevBtn.hidden = (i <= 0);
        if (nextBtn) nextBtn.hidden = (i >= slideCount - 1);
      }
      function slideTo(i, behavior) {
        track.scrollTo({ left: i * track.clientWidth, behavior: behavior || "smooth" });
        setActive(i);
      }

      // Mobile: keep dots in sync with swipe position.
      track.addEventListener("scroll", function () {
        if (!track.clientWidth) return;
        setActive(Math.round(track.scrollLeft / track.clientWidth));
      });
      // Dots are tappable on touch.
      dots.forEach(function (d, i) {
        d.addEventListener("click", function (e) { e.stopPropagation(); slideTo(i); });
      });

      // Mobile arrows — injected on touch devices only.
      // pointer-events:none on the track removes it as a touch target so the
      // outer product grid can't capture taps intended for the arrows.
      // programmatic scrollTo (used by arrows + dots) is unaffected.
      // touchend fires immediately and reliably before any scroll-gesture
      // suppression can cancel the subsequent click event.
      if (!hoverCapable && slideCount > 1) {
        track.style.pointerEvents = "none";

        /* Only treat a touch as a tap if the finger didn't travel more than
           10 px — prevents a grid scroll that ends over an arrow from
           accidentally advancing the image. */
        function makeTapHandler(action) {
          var startX = null, startY = null;
          return {
            start: function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; },
            end: function (e) {
              if (startX === null) return;
              var dx = Math.abs(e.changedTouches[0].clientX - startX);
              var dy = Math.abs(e.changedTouches[0].clientY - startY);
              startX = startY = null;
              if (dx > 10 || dy > 10) return;
              e.preventDefault(); e.stopPropagation(); action();
            }
          };
        }

        prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "media-arrow media-arrow--prev";
        prevBtn.setAttribute("aria-label", "Previous image");
        prevBtn.innerHTML = '<span class="media-arrow-icon" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,3 5,8 10,13"/></svg></span>';
        prevBtn.hidden = true;
        var prevTap = makeTapHandler(function () { slideTo(Math.max(0, currentSlide - 1)); });
        prevBtn.addEventListener("touchstart", prevTap.start, { passive: true });
        prevBtn.addEventListener("touchend", prevTap.end);
        prevBtn.addEventListener("click", function (e) { e.stopPropagation(); slideTo(Math.max(0, currentSlide - 1)); });

        nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "media-arrow media-arrow--next";
        nextBtn.setAttribute("aria-label", "Next image");
        nextBtn.innerHTML = '<span class="media-arrow-icon" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,3 11,8 6,13"/></svg></span>';
        nextBtn.hidden = false;
        var nextTap = makeTapHandler(function () { slideTo(Math.min(slideCount - 1, currentSlide + 1)); });
        nextBtn.addEventListener("touchstart", nextTap.start, { passive: true });
        nextBtn.addEventListener("touchend", nextTap.end);
        nextBtn.addEventListener("click", function (e) { e.stopPropagation(); slideTo(Math.min(slideCount - 1, currentSlide + 1)); });

        media.appendChild(prevBtn);
        media.appendChild(nextBtn);
      }

      // Desktop: hover swaps to the product shot, then back on leave.
      if (hoverCapable && card) {
        card.addEventListener("mouseenter", function () { slideTo(1, "auto"); });
        card.addEventListener("mouseleave", function () { slideTo(0, "auto"); });
      }
    });
  }

  function fadeInCards(grid, tid) {
    if (transitionId !== tid) return;
    var cards = grid.querySelectorAll(".product-card");
    /* Set initial hidden state */
    cards.forEach(function (card) {
      card.style.opacity   = "0";
      card.style.transform = "translateY(8px)";
      card.style.transition = "none";
    });
    /* Force reflow so the browser registers the start state */
    void grid.offsetHeight;
    /* Staggered entrance */
    cards.forEach(function (card, i) {
      var delay = i * 50;
      card.style.transition =
        "opacity 220ms ease-out " + delay + "ms, " +
        "transform 220ms ease-out " + delay + "ms";
      card.style.opacity   = "1";
      card.style.transform = "translateY(0)";
    });
  }

  function renderProducts(recipient, skipAnimation) {
    var grid     = document.getElementById("product-grid");
    var products = filterProducts(recipient);

    /* First render — no animation, cards appear at full opacity */
    if (skipAnimation) {
      buildGrid(grid, products);
      return;
    }

    var tid      = ++transitionId;
    var existing = grid.querySelectorAll(".product-card");

    /* If grid is empty (first urgency change or empty state), skip fade-out */
    if (!existing.length) {
      buildGrid(grid, products);
      fadeInCards(grid, tid);
      return;
    }

    /* Fade out existing cards */
    existing.forEach(function (card) {
      card.style.transition = "opacity 180ms ease-out, transform 180ms ease-out";
      card.style.opacity    = "0";
      card.style.transform  = "translateY(6px)";
    });

    /* After fade-out completes, swap and fade in — bail if superseded */
    setTimeout(function () {
      if (transitionId !== tid) return;
      buildGrid(grid, products);
      fadeInCards(grid, tid);
    }, 185);
  }

  /* Recipient chip icons — Google Material Symbols Outlined (icon font,
     loaded in index.html). Using the font instead of hand-embedded SVGs
     guarantees every glyph renders at the same true outline weight
     (FILL axis pinned to 0), matching jtbd-photo-books-v2's pills. */
  var CHIP_ICONS = {
    'her': 'face_3',
    'him': 'face_6',
    'friends': 'group',
    'grandparents': 'favorite',
    'newlyweds': 'cake',
    'new-parents': 'child_care'
  };

  /* Build the recipient chips and wire selection. */
  function buildChips() {
    var row = document.getElementById("chips");
    RECIPIENTS.forEach(function (r, i) {
      var chip = document.createElement("button");
      chip.className = "chip" + (i === 0 ? " is-active" : "");
      chip.type = "button";
      chip.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      chip.dataset.key = r.key;
      var icon = CHIP_ICONS[r.key] || '';
      chip.innerHTML = (icon ? '<span class="material-symbols-outlined chip-icon" aria-hidden="true">' + icon + '</span>' : '') + r.label;
      chip.addEventListener("click", function () { selectRecipient(r.key); });
      row.appendChild(chip);
    });
  }

  /* Build the urgency filter chips. */
  function buildUrgencyFilter() {
    var row = document.getElementById("urgency-chips");
    if (!row) return;
    URGENCY_OPTIONS.forEach(function (opt) {
      var btn = document.createElement("button");
      /* Default: "No Rush" (mode === null) is pre-selected */
      btn.className = "chip" + (opt.mode === null ? " is-active" : "");
      btn.type = "button";
      btn.setAttribute("aria-pressed", opt.mode === null ? "true" : "false");
      btn.dataset.urgencyMode = opt.mode === null ? "" : opt.mode;
      if (opt.icon) {
        btn.innerHTML = '<i class="arc3-icon notranslate chip-icon chip-icon--express" aria-hidden="true">delivery_fast_track_v2</i><span class="express-label">' + opt.label + '</span>';
      } else {
        btn.textContent = opt.label;
      }
      btn.addEventListener("click", function () { selectUrgency(opt.mode); });
      row.appendChild(btn);
    });
  }

  function selectUrgency(mode) {
    currentUrgencyMode = mode;

    /* Update urgency chip active states */
    document.querySelectorAll("#urgency-chips .chip").forEach(function (c) {
      var m = c.dataset.urgencyMode === "" ? null : c.dataset.urgencyMode;
      var active = m === mode;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var hint = document.getElementById("urgency-hint");
    if (hint) hint.textContent = mode ? "Shows products with Express delivery." : "Shows products with Standard delivery.";

    var r = RECIPIENTS.find(function (x) { return x.key === currentRecipientKey; });
    if (r) renderProducts(r, false);
  }

  function selectRecipient(key) {
    currentRecipientKey = key;

    /* Update recipient chip active states */
    document.querySelectorAll("#chips .chip").forEach(function (c) {
      var active = c.dataset.key === key;
      c.classList.toggle("is-active", active);
      c.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var r = RECIPIENTS.find(function (x) { return x.key === key; });
    if (r) renderProducts(r, false);
  }

  /* -----------------------------------------------------------
     How it works — clickable steps with image swap
     ----------------------------------------------------------- */
  var STEP_MEDIA = [
    { type: "video", alphaSrc: "../../assets/Video/1_my_photos_alpha.mp4", src: "../../assets/Video/1_my_photos.mp4",  label: "Picking photos on a phone" },
    { type: "video", alphaSrc: "../../assets/Video/2_edit_pages_alpha.mp4", src: "../../assets/Video/2_edit_pages.mp4", label: "Designing a photo book layout" },
    { type: "video", alphaSrc: "../../assets/Video/3_ui_generic_alpha.mp4", src: "../../assets/Video/3_ui_generic.mp4", label: "Previewing a photo book" },
    { type: "image", src: "../../assets/Stink%20Studios%20Imagery/Lifestyle/PB_LIFESTYLE_ISOMETRIC_LS_X1_SOFA%20Large.jpeg", label: "Giving a gift" }
  ];

  function initHowItWorks() {
    var steps           = document.querySelectorAll(".step[data-step]");
    var captionTitle    = document.querySelector(".how-caption-title");
    var captionDesc   = document.querySelector(".how-caption-desc");
    var captionDetail = document.querySelector(".how-caption-detail");
    var video         = document.getElementById("how-media-video");
    var videoSrcAlpha = document.getElementById("how-media-video-src-alpha");
    var videoSrc      = document.getElementById("how-media-video-src");
    var img           = document.getElementById("how-media-img");
    if (!steps.length || !video || !img) return;

    var hevcSupported = (function () {
      var v = document.createElement("video");
      return v.canPlayType('video/mp4; codecs="hvc1"') !== "";
    })();

    function setSrc(data) {
      if (videoSrcAlpha) {
        videoSrcAlpha.src = (hevcSupported && data.alphaSrc) ? data.alphaSrc : "";
      }
      videoSrc.src = data.src;
    }

    function loadAndPlay() {
      video.addEventListener("canplay", function onCanPlay() {
        video.removeEventListener("canplay", onCanPlay);
        video.play().catch(function () {});
      }, {once: true});
      video.load();
    }

    /* Mirrors the active step's own title/desc/callout into the mobile
       caption — .steps stays the single source of that copy, this just
       reads it live so the two views can never drift apart. Briefly fades
       the caption on change so a tap reads as a clear content swap,
       not a silent text replacement. */
    var captionEl = document.querySelector(".how-caption");
    function syncCaption(stepNum, immediate) {
      if (!captionTitle) return;
      var stepEl   = document.querySelector('.step[data-step="' + stepNum + '"]');
      var titleEl  = stepEl && stepEl.querySelector(".step-title");
      var descEl   = stepEl && stepEl.querySelector(".step-desc");
      var detailEl = stepEl && stepEl.querySelector(".step-detail");
      var apply = function () {
        captionTitle.textContent  = titleEl  ? titleEl.textContent  : "";
        captionDesc.textContent   = descEl   ? descEl.textContent   : "";
        if (captionDetail) captionDetail.textContent = detailEl ? detailEl.textContent : "";
        if (captionEl) captionEl.classList.remove("is-changing");
      };
      if (captionEl && !immediate) {
        captionEl.classList.add("is-changing");
        setTimeout(apply, 150);
      } else {
        apply();
      }
    }

    var scrollbarThumb = document.getElementById("how-scrollbar-thumb");
    var STEP_COUNT_FOR_THUMB = 4;

    function startScrollbarAnimation(stepNum) {
      if (!scrollbarThumb) return;
      var thumbW = 100 / STEP_COUNT_FOR_THUMB;
      scrollbarThumb.style.left = ((stepNum - 1) * thumbW) + "%";
    }

    var prevBtn = document.querySelector(".how-arrow[data-dir='prev']");
    var nextBtn = document.querySelector(".how-arrow[data-dir='next']");


    function setActiveControls(stepNum) {
      steps.forEach(function (s) { s.classList.toggle("is-active", parseInt(s.dataset.step, 10) === stepNum); });
      syncCaption(stepNum);
      startScrollbarAnimation(stepNum);
      if (prevBtn) prevBtn.disabled = stepNum <= 1;
      if (nextBtn) nextBtn.disabled = stepNum >= (steps.length || 4);
    }

    // Set the correct initial state based on whichever step is .is-active in the HTML.
    var activeStep = document.querySelector(".step.is-active[data-step]");
    var initNum    = activeStep ? parseInt(activeStep.dataset.step, 10) : 4;
    syncCaption(initNum, true);
    if (prevBtn) prevBtn.disabled = initNum <= 1;
    if (nextBtn) nextBtn.disabled = initNum >= (steps.length || 4);
    var initData   = STEP_MEDIA[initNum - 1];
    if (initData && initData.type === "video") {
      setSrc(initData);
      loadAndPlay();
      video.classList.remove("is-hidden");
      img.classList.add("is-hidden");
    } else {
      video.classList.add("is-hidden");
      img.classList.remove("is-hidden");
    }

    function showMedia(stepNum) {
      /* Mobile: scroll the carousel to the target slide */
      if (howMobile() && howCarouselWrap && howCarouselTrack) {
        var targetSlide = howCarouselTrack.querySelector('[data-slide="' + stepNum + '"]');
        if (targetSlide) {
          var carouselPad = parseInt(getComputedStyle(howCarouselWrap).scrollPaddingLeft, 10) || 20;
          progScroll = true;
          howCarouselWrap.scrollTo({ left: targetSlide.offsetLeft - carouselPad, behavior: "smooth" });
          setTimeout(function () { progScroll = false; }, 700);
        }
        playCarouselSlide(stepNum);
        return;
      }
      /* Desktop: crossfade the single panel */
      var data = STEP_MEDIA[stepNum - 1];
      if (!data) return;
      var showVideo = data.type === "video";
      var current   = showVideo ? img   : video;
      var next      = showVideo ? video : img;

      current.classList.add("is-fading");
      setTimeout(function () {
        if (showVideo) {
          setSrc(data);
          loadAndPlay();
        } else {
          img.src = data.src;
          img.alt = data.label;
        }
        current.classList.add("is-hidden");
        current.classList.remove("is-fading");
        next.classList.remove("is-hidden");
      }, 200);
    }

    function selectStep(stepNum) {
      setActiveControls(stepNum);
      showMedia(stepNum);
    }

    steps.forEach(function (step) {
      step.addEventListener("click", function () {
        var n = parseInt(step.dataset.step, 10);
        selectStep(n);
        restartTimer(n);
      });
    });
    /* Prev/next arrow buttons for mobile */
    document.querySelectorAll(".how-arrow[data-dir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.dataset.dir;
        var n = dir === "prev"
          ? ((currentAutoStep - 2 + STEP_COUNT) % STEP_COUNT) + 1
          : (currentAutoStep % STEP_COUNT) + 1;
        selectStep(n);
        restartTimer(n);
      });
    });

    /* Mobile swipe carousel — sync native scroll ↔ step state */
    var howMobileQuery   = window.matchMedia("(max-width: 900px)");
    function howMobile() { return howMobileQuery.matches; }
    var howCarouselWrap  = document.getElementById("how-carousel-wrap");
    var howCarouselTrack = document.getElementById("how-carousel-track");
    var progScroll       = false; /* prevents scroll→selectStep loop */

    function playCarouselSlide(stepNum) {
      if (!howCarouselTrack) return;
      howCarouselTrack.querySelectorAll(".how-slide video").forEach(function (v) {
        var s = parseInt(v.closest(".how-slide").dataset.slide, 10);
        if (s === stepNum) { v.play().catch(function () {}); }
        else               { v.pause(); }
      });
    }

    if (howCarouselWrap && howCarouselTrack) {
      /* Play slide 1 on load if already in mobile/tablet range */
      if (howMobile()) { playCarouselSlide(1); }

      /* When native swipe settles, sync step state */
      var scrollSettleTimer = null;
      howCarouselWrap.addEventListener("scroll", function () {
        if (!howMobile()) return;
        clearTimeout(scrollSettleTimer);
        scrollSettleTimer = setTimeout(function () {
          if (progScroll) return;
          var slides = howCarouselTrack.querySelectorAll(".how-slide");
          var sx     = howCarouselWrap.scrollLeft;
          var snapPad = parseInt(getComputedStyle(howCarouselWrap).scrollPaddingLeft, 10) || 20;
          var active = 1;
          slides.forEach(function (slide) {
            if (slide.offsetLeft - snapPad <= sx + 8) {
              active = parseInt(slide.dataset.slide, 10);
            }
          });
          if (active !== currentAutoStep) {
            currentAutoStep = active;
            setActiveControls(active);
            playCarouselSlide(active);
            clearTimeout(autoTimer);
            if (!paused) {
              startBarAnimation();
              startScrollbarAnimation(active);
              scheduleNext();
            }
          }
        }, 80);
      });
    }

    /* Auto-rotate with progress bar */
    var STEP_COUNT  = steps.length || 4;
    var STEP_DUR_MS = window.matchMedia("(max-width: 574px)").matches ? 20000 : 10000;
    var timerBar    = document.getElementById("how-timer-bar");
    var currentAutoStep = initNum;
    var autoTimer   = null;
    var paused      = false;

    function startBarAnimation() {
      if (!timerBar || howMobile()) return;
      timerBar.classList.remove("is-animating");
      void timerBar.offsetWidth;
      timerBar.style.animationDuration = STEP_DUR_MS + "ms";
      timerBar.style.animationPlayState = "running";
      timerBar.classList.add("is-animating");
    }

    function restartTimer(stepNum) {
      clearTimeout(autoTimer);
      currentAutoStep = stepNum || currentAutoStep;
      if (!paused && !howMobile()) {
        startBarAnimation();
        startScrollbarAnimation(currentAutoStep);
        scheduleNext();
      }
    }

    function scheduleNext() {
      if (howMobile()) return;
      autoTimer = setTimeout(function () {
        if (paused || howMobile()) return;
        currentAutoStep = (currentAutoStep % STEP_COUNT) + 1;
        selectStep(currentAutoStep);
        startBarAnimation();
        startScrollbarAnimation(currentAutoStep);
        scheduleNext();
      }, STEP_DUR_MS);
    }

    function pauseAuto() {
      paused = true;
      clearTimeout(autoTimer);
      if (timerBar) timerBar.style.animationPlayState = "paused";
      if (howMobile() && howCarouselTrack) {
        howCarouselTrack.querySelectorAll("video").forEach(function (v) { v.pause(); });
      }
    }

    function resumeAuto() {
      paused = false;
      if (howMobile()) {
        playCarouselSlide(currentAutoStep);
        return;
      }
      startBarAnimation();
      startScrollbarAnimation(currentAutoStep);
      scheduleNext();
    }

    /* IntersectionObserver — pause when section leaves viewport */
    var howSection = document.getElementById("how");
    if (howSection && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          resumeAuto();
        } else {
          pauseAuto();
        }
      }, { threshold: 0.2 });
      observer.observe(howSection);
    } else {
      /* Fallback: just start immediately */
      resumeAuto();
    }
  }

  /* -----------------------------------------------------------
     Gallery shoppable dots — hover-triggered with delay bridge
     so the card stays open while the cursor travels dot → card.
     ----------------------------------------------------------- */
  function initGalleryDots() {
    var dots     = document.querySelectorAll(".shop-dot");
    var allCards = document.querySelectorAll(".shop-card");
    var closeTimer;

    function closeAll() {
      allCards.forEach(function (c) { c.classList.remove("is-open"); });
    }

    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeAll, 150);
    }

    function cancelClose() {
      clearTimeout(closeTimer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("mouseenter", function () {
        cancelClose();
        closeAll();
        var card = dot.parentNode.querySelector(".shop-card");
        if (card) card.classList.add("is-open");
      });
      dot.addEventListener("mouseleave", scheduleClose);
    });

    allCards.forEach(function (card) {
      card.addEventListener("mouseenter", cancelClose);
      card.addEventListener("mouseleave", scheduleClose);
    });

    document.querySelectorAll(".shop-card-cta").forEach(function (cta) {
      cta.addEventListener("click", function () { closeAll(); });
    });
  }

  /* -----------------------------------------------------------
     Occasions carousel — custom scrollbar synced to scroll position.
     The native scrollbar spans from viewport edge (x=0); this one
     lives inside .container so it starts aligned with the first card.
     ----------------------------------------------------------- */
  function initProductScrollbar() {
    var grid  = document.getElementById("product-grid");
    var thumb = document.querySelector(".product-scrollbar-thumb");
    if (!grid || !thumb) return;

    function update() {
      var maxScroll = grid.scrollWidth - grid.clientWidth;
      if (maxScroll <= 0) return;
      var ratio  = grid.scrollLeft / maxScroll;
      var thumbW = Math.max(10, (grid.clientWidth / grid.scrollWidth) * 100);
      thumb.style.width = thumbW + "%";
      thumb.style.left  = (ratio * (100 - thumbW)) + "%";
    }

    grid.addEventListener("scroll", update);
    update();

    /* Re-sync after each render (product count changes) */
    grid._syncScrollbar = update;
  }

  /* -----------------------------------------------------------
     Prev/next arrow controls for a horizontal scroller. Each
     .scroll-arrows[data-scroller="<id>"] drives that element; the
     arrows disable at each end and page by ~85% of the visible width.
     ----------------------------------------------------------- */
  function initScrollArrows() {
    document.querySelectorAll(".scroll-arrows").forEach(function (ctrl) {
      var target = document.getElementById(ctrl.dataset.scroller);
      if (!target) return;
      var prev = ctrl.querySelector('[data-dir="prev"]');
      var next = ctrl.querySelector('[data-dir="next"]');

      function step(dir) {
        var amount = Math.max(240, target.clientWidth * 0.85);
        var dest   = target.scrollLeft + dir * amount;
        var max    = target.scrollWidth - target.clientWidth;
        target.scrollTo({ left: Math.max(0, Math.min(dest, max)), behavior: "smooth" });
      }
      function sync() {
        var max = target.scrollWidth - target.clientWidth - 1;
        if (prev) prev.disabled = target.scrollLeft <= 0;
        if (next) next.disabled = target.scrollLeft >= max;
      }
      if (prev) prev.addEventListener("click", function () { step(-1); });
      if (next) next.addEventListener("click", function () { step(1); });
      target.addEventListener("scroll", sync);
      window.addEventListener("resize", sync);
      sync();
      target._syncArrows = sync;   // re-sync after the grid re-renders
    });
  }

  /* .carousel-scrollbar[data-scroller="<id>"] drives that element —
     same pairing convention as .scroll-arrows, so any number of
     horizontal scrollers can each get their own synced scrollbar. */
  function initCarouselScrollbars() {
    document.querySelectorAll(".carousel-scrollbar").forEach(function (bar) {
      var target = document.getElementById(bar.dataset.scroller);
      var thumb  = bar.querySelector(".carousel-scrollbar-thumb");
      if (!target || !thumb) return;

      function update() {
        var maxScroll = target.scrollWidth - target.clientWidth;
        if (maxScroll <= 0) return;
        var ratio  = target.scrollLeft / maxScroll;
        var thumbW = Math.max(20, (target.clientWidth / target.scrollWidth) * 100);
        thumb.style.width = thumbW + "%";
        thumb.style.left  = (ratio * (100 - thumbW)) + "%";
      }

      target.addEventListener("scroll", update);
      window.addEventListener("resize", update);
      update();
    });
  }

  /* -----------------------------------------------------------
     Themed covers parallax — scroll-linked horizontal drift.
     As the section passes through the viewport, the top row shifts
     left and the bottom row shifts right, proportional to scroll
     position. Movement tracks scroll exactly, so it stops when the
     page stops. Disabled under prefers-reduced-motion.
     ----------------------------------------------------------- */
  function initCoverParallax() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var section   = document.querySelector(".covers-section");
    var topRow    = document.querySelector(".covers-row-top");
    var bottomRow = document.querySelector(".covers-row-bottom");
    if (!section || !topRow || !bottomRow) return;

    var MAX         = 90;
    var ticking     = false;
    var scrollShift = 0;
    var dragOffset  = 0;

    /* Auto-animation */
    var autoOffset      = 0;
    var autoDir         = 1;
    var autoBoost       = 0;
    var autoPaused      = false;
    var AUTO_BASE       = 0.35;
    var AUTO_BOOST_START = 1.8;
    var autoRaf;

    /* Drag bounds — how far the top row can shift before showing empty
       space. Recomputed on each gesture so it reflects the active filter's
       row width (books vs mugs vs cards have different widths). */
    function getBounds() {
      var vw  = window.innerWidth;
      var lim = Math.max(0, topRow.offsetWidth / 2 - vw / 2);
      return { min: -lim, max: lim };
    }

    /* Rubber-band: outside the edge, resistance scales the overreach to 30%. */
    function clampRubber(val, b) {
      if (val > b.max) return b.max + (val - b.max) * 0.3;
      if (val < b.min) return b.min + (val - b.min) * 0.3;
      return val;
    }

    function applyShifts() {
      var total   = scrollShift + dragOffset + autoOffset;
      var display = clampRubber(total, getBounds());
      topRow.style.setProperty("--shift", display.toFixed(1) + "px");
      bottomRow.style.setProperty("--shift", (-display).toFixed(1) + "px");
    }

    function update() {
      ticking = false;
      applyShifts();
    }

    window.addEventListener("resize", update);
    update();

    /* Auto-animation: slow drift that ping-pongs within bounds,
       pauses on hover, and gets a brief speed burst from scroll. */
    function autoTick() {
      if (!autoPaused) {
        var bounds = getBounds();
        var step   = AUTO_BASE + autoBoost;
        autoBoost  = autoBoost > 0 ? Math.max(0, autoBoost * 0.94) : 0;
        autoOffset += autoDir * step;
        if (autoOffset >= bounds.max) { autoOffset = bounds.max; autoDir = -1; }
        if (autoOffset <= bounds.min) { autoOffset = bounds.min; autoDir =  1; }
        applyShifts();
      }
      autoRaf = requestAnimationFrame(autoTick);
    }

    var coversRows = section.querySelector(".covers-rows");
    autoTick();

    /* Desktop click-and-drag — only above 600 px */
    if (coversRows && window.matchMedia && window.matchMedia("(min-width: 601px)").matches) {
      var mouseStartX     = null;
      var mouseDragStart  = 0;
      var mouseDragDir    = 1;  /* +1 top row, -1 bottom row */
      var isDraggingMouse = false;
      var idleTimer       = null;

      function setCursorIdle() {
        coversRows.style.cursor = "pointer";
      }
      function resetIdleTimer() {
        coversRows.style.cursor = "";
        clearTimeout(idleTimer);
        idleTimer = setTimeout(setCursorIdle, 200);
      }

      var lastMoveX = null;
      var lastMoveY = null;

      coversRows.addEventListener("mousemove", function(e) {
        if (mouseStartX !== null) return;
        var dx = lastMoveX === null ? 99 : e.clientX - lastMoveX;
        var dy = lastMoveY === null ? 99 : e.clientY - lastMoveY;
        if (Math.sqrt(dx * dx + dy * dy) < 3) return;
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;
        resetIdleTimer();
      });
      coversRows.addEventListener("mouseleave", function() {
        clearTimeout(idleTimer);
        coversRows.style.cursor = "";
        lastMoveX = null;
        lastMoveY = null;
      });

      coversRows.addEventListener("mousedown", function(e) {
        if (e.button !== 0) return;
        clearTimeout(idleTimer);
        mouseStartX     = e.clientX;
        mouseDragStart  = dragOffset;
        isDraggingMouse = false;
        autoPaused      = true;
        coversRows.style.cursor = "grabbing";
        var midY    = coversRows.getBoundingClientRect().top + coversRows.offsetHeight / 2;
        mouseDragDir = e.clientY < midY ? 1 : -1;
        e.preventDefault();
      });

      document.addEventListener("mousemove", function(e) {
        if (mouseStartX === null) return;
        var dx = e.clientX - mouseStartX;
        if (!isDraggingMouse && Math.abs(dx) >= 4) isDraggingMouse = true;
        if (!isDraggingMouse) return;
        dragOffset = mouseDragStart + dx * mouseDragDir;
        applyShifts();
      });

      var wasDragging = false;

      document.addEventListener("mouseup", function() {
        if (mouseStartX === null) return;
        mouseStartX             = null;
        coversRows.style.cursor = "";
        resetIdleTimer();
        if (!isDraggingMouse) { autoPaused = false; return; }
        isDraggingMouse = false;
        wasDragging     = true;
        /* Continue auto-animation in the direction of the drag.
           dragOffset is already in top-row space (scaled by mouseDragDir during drag),
           so read its sign directly — no extra multiplication needed. */
        if (dragOffset !== 0) autoDir = dragOffset > 0 ? 1 : -1;
        /* Absorb dragOffset into autoOffset so animation resumes from the dragged position */
        autoOffset += dragOffset;
        dragOffset   = 0;
        var b = getBounds();
        if (autoOffset > b.max) autoOffset = b.max;
        if (autoOffset < b.min) autoOffset = b.min;
        autoPaused   = false;
      });

      coversRows.addEventListener("click", function(e) {
        if (wasDragging) { wasDragging = false; e.preventDefault(); }
      });
    }

    /* Mobile/tablet touch drag with momentum + rubber-band bounce. */
    if (!window.matchMedia || !window.matchMedia("(max-width: 900px)").matches) return;

    var dragStartX      = null;
    var dragStartY      = null;
    var dragStartOffset = 0;
    var dragDir         = 1;  /* +1 top row, -1 bottom row (inverts offset so dragged row follows finger) */
    var isDragging      = false;
    var velX            = 0;   /* px/ms at last touchmove sample */
    var lastSampleX     = 0;
    var lastSampleT     = 0;
    var rafId           = null;

    function cancelAnim() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    /* Absorb dragOffset into autoOffset and let auto-animation resume
       from the settled position in the direction the user swiped. */
    function absorbAndResume() {
      var b = getBounds();
      autoOffset += dragOffset;
      dragOffset  = 0;
      if (autoOffset > b.max) autoOffset = b.max;
      if (autoOffset < b.min) autoOffset = b.min;
      autoPaused  = false;
    }

    /* Spring: ease dragOffset back inside bounds, re-evaluating each frame
       so a simultaneous page-scroll doesn't derail the snap target. */
    function springBack() {
      cancelAnim();
      function step() {
        var b     = getBounds();
        var total = scrollShift + dragOffset;
        if (total >= b.min && total <= b.max) { absorbAndResume(); rafId = null; return; }
        var target = total > b.max ? b.max : b.min;
        var diff   = target - total;
        if (Math.abs(diff) < 0.5) {
          dragOffset += diff;
          applyShifts();
          absorbAndResume();
          rafId = null;
          return;
        }
        dragOffset += diff * 0.1;
        applyShifts();
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    /* Momentum: continue moving after finger lifts, decaying at ~6% per frame.
       Hits the edge → clamp immediately, then spring back. */
    function startMomentum() {
      cancelAnim();
      if (Math.abs(velX) < 0.05) { springBack(); return; }

      var lastTs = null;
      function step(ts) {
        if (lastTs === null) { lastTs = ts; rafId = requestAnimationFrame(step); return; }
        var dt = Math.min(ts - lastTs, 32);  /* cap at 32 ms so paused tabs don't lurch */
        lastTs = ts;

        /* Exponential decay normalised to 60 fps */
        velX       *= Math.pow(0.94, dt / 16);
        dragOffset += velX * dt * dragDir;

        var b     = getBounds();
        var total = scrollShift + dragOffset;
        /* Past the boundary: heavy friction lets momentum bleed in
           smoothly instead of hard-clamping to the edge. */
        if (total > b.max || total < b.min) velX *= 0.7;

        applyShifts();
        if (Math.abs(velX) > 0.04) {
          rafId = requestAnimationFrame(step);
        } else {
          velX  = 0;
          rafId = null;
          springBack();
        }
      }
      rafId = requestAnimationFrame(step);
    }

    section.addEventListener("touchstart", function (e) {
      if (!coversRows || !coversRows.contains(e.target)) return;
      cancelAnim();
      autoPaused      = true;
      dragStartX      = e.touches[0].clientX;
      dragStartY      = e.touches[0].clientY;
      dragStartOffset = dragOffset;
      isDragging      = false;
      var midY = coversRows.getBoundingClientRect().top + coversRows.offsetHeight / 2;
      dragDir  = e.touches[0].clientY < midY ? 1 : -1;
      velX            = 0;
      lastSampleX     = dragStartX;
      lastSampleT     = Date.now();
    }, { passive: true });

    section.addEventListener("touchmove", function (e) {
      if (dragStartX === null) return;
      var dx = e.touches[0].clientX - dragStartX;
      var dy = e.touches[0].clientY - dragStartY;
      if (!isDragging) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { dragStartX = null; return; }
        isDragging = true;
      }
      e.preventDefault();

      /* Track instantaneous velocity using the last 80 ms window */
      var now = Date.now();
      var dt  = now - lastSampleT;
      if (dt > 0 && dt < 80) velX = (e.touches[0].clientX - lastSampleX) / dt;
      lastSampleX = e.touches[0].clientX;
      lastSampleT = now;

      dragOffset = dragStartOffset + dx * dragDir;
      applyShifts();
    }, { passive: false });

    section.addEventListener("touchend", function (e) {
      if (dragStartX === null || !isDragging) { dragStartX = null; autoPaused = false; return; }
      var finalDx = e.changedTouches[0].clientX - dragStartX;
      dragOffset  = dragStartOffset + finalDx * dragDir;
      dragStartX  = null;
      isDragging  = false;
      /* If the finger rested before lifting, velocity is stale — zero it */
      if (Date.now() - lastSampleT > 80) velX = 0;
      /* Set auto-animation direction from swipe: prefer velocity, fall back to total displacement.
         Multiply by dragDir so the signal reflects the direction of the top-row offset. */
      var swipeSignal = velX !== 0 ? velX * dragDir : finalDx * dragDir;
      if (swipeSignal !== 0) autoDir = swipeSignal > 0 ? 1 : -1;
      startMomentum();
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     Themed covers — filter tabs (Photo Books / Calendars / Mugs).
     Cross-fades non-matching covers out, then hides them from the
     flex flow so the row width (and parallax centring) still tracks
     only the visible set.
     ----------------------------------------------------------- */
  function initThemeFilter() {
    var tabs     = document.querySelectorAll(".theme-tab");
    var covers   = document.querySelectorAll(".cover-block");
    var ctaBtn   = document.querySelector(".theme-cta-btn");
    var rowsEl   = document.querySelector(".covers-rows");
    if (!tabs.length || !covers.length) return;

    var CTA_LABEL = {
      book:     "See all Photo Book themes",
      calendar: "See all Calendar themes",
      mug:      "See all Mug themes",
      card:     "See all Card themes"
    };
    var filterId = 0;

    function applyFilter(product, animate) {
      var myId = ++filterId;

      function swap() {
        if (myId !== filterId) return;
        if (ctaBtn) ctaBtn.textContent = CTA_LABEL[product];
        if (rowsEl) rowsEl.dataset.activeProduct = product;
        covers.forEach(function (c) {
          c.classList.toggle("is-filtered-out", c.dataset.product !== product);
        });
      }

      if (!animate) {
        swap();
        return;
      }

      /* On mobile use a simple whole-section fade — the positional clone
         trick relies on stable getBoundingClientRect coordinates that can
         shift when the flex-row layout reflows on small screens. */
      if (window.innerWidth <= 600) {
        if (rowsEl) {
          rowsEl.style.transition = "opacity 220ms ease";
          rowsEl.style.opacity    = "0";
          setTimeout(function () {
            if (myId !== filterId) return;
            swap();
            rowsEl.style.opacity = "1";
            setTimeout(function () {
              if (myId === filterId) {
                rowsEl.style.transition = "";
                rowsEl.style.opacity    = "";
              }
            }, 230);
          }, 230);
        } else {
          swap();
        }
        return;
      }

      var FADE_DUR = 450;
      var STAGGER  = 35;

      var rowTop  = rowsEl.querySelector(".covers-row-top");
      var rowBot  = rowsEl.querySelector(".covers-row-bottom");
      var section = rowsEl.closest(".covers-section");

      /* Remove stale clones and reset inline styles from any interrupted animation */
      Array.prototype.forEach.call(section.querySelectorAll("[data-anim-clone]"), function (c) {
        c.parentNode.removeChild(c);
      });
      covers.forEach(function (c) {
        c.style.transition = "none";
        c.style.opacity    = "1";
      });
      function visibleIn(row) {
        if (!row) return [];
        return Array.prototype.filter.call(row.querySelectorAll(".cover-block"), function (c) {
          return !c.classList.contains("is-filtered-out") && !c.dataset.animClone;
        });
      }

      /* Snapshot old covers as clones positioned in VIEWPORT space (relative to
         .covers-section, which never moves) rather than inside their row — the
         row's own translateX jumps to a different value for the new product
         (its width depends on which covers are display:none), so a clone left
         INSIDE the row would get dragged sideways with it and briefly reveal a
         different, previously off-screen slice of the old row's covers. */
      var oldTop = visibleIn(rowTop);
      var oldBot = visibleIn(rowBot);

      var sectionRect = section.getBoundingClientRect();
      function cloneIntoSection(rowCovers) {
        return rowCovers.map(function (cover) {
          var rect  = cover.getBoundingClientRect();
          var clone = cover.cloneNode(true);
          clone.style.position  = "absolute";
          clone.style.left      = (rect.left - sectionRect.left) + "px";
          clone.style.top       = (rect.top  - sectionRect.top)  + "px";
          clone.style.width     = rect.width  + "px";
          clone.style.height    = rect.height + "px";
          clone.style.margin    = "0";
          clone.style.zIndex    = "20";
          clone.style.pointerEvents = "none";
          clone.style.opacity   = "1";
          clone.style.transition = "none";
          clone.dataset.animClone = "1";
          section.appendChild(clone);
          return clone;
        });
      }
      var clonesTop = cloneIntoSection(oldTop);
      var clonesBot = cloneIntoSection(oldBot);

      /* Sort clones left-to-right by visual position */
      function byLeft(a, b) { return parseFloat(a.style.left) - parseFloat(b.style.left); }
      clonesTop.sort(byLeft);
      clonesBot.sort(byLeft);

      /* Pre-hide new covers before swap so they don't flash */
      covers.forEach(function (c) {
        if (c.dataset.product === product) {
          c.style.opacity    = "0";
          c.style.transition = "none";
        }
      });

      swap(); /* old covers → display:none in rows; new covers → visible at opacity 0 */

      /* Sort new covers left-to-right by visual position */
      var newTop = visibleIn(rowTop).sort(function(a, b) { return a.offsetLeft - b.offsetLeft; });
      var newBot = visibleIn(rowBot).sort(function(a, b) { return a.offsetLeft - b.offsetLeft; });

      /* Two overlapping sweeps: old covers fade out L→R, and new covers start
         fading in L→R before the old sweep has fully finished (OVERLAP is the
         fraction of the out-sweep's duration to wait before starting the in-sweep). */
      var OVERLAP    = 0.45;
      var outLen     = Math.max(clonesTop.length, clonesBot.length);
      var outDur     = (outLen - 1) * STAGGER + FADE_DUR;
      var inStart    = Math.round(outDur * OVERLAP);
      var inLen      = Math.max(newTop.length, newBot.length);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (myId !== filterId) return;

          function stagger(arr, opacity, baseDelay) {
            arr.forEach(function (el, i) {
              el.style.transition = "opacity " + FADE_DUR + "ms ease-out " + (baseDelay + i * STAGGER) + "ms";
              el.style.opacity    = String(opacity);
            });
          }
          stagger(clonesTop, 0, 0);        /* Fade OUT old — left to right */
          stagger(clonesBot, 0, 0);
          stagger(newTop,    1, inStart);  /* Fade IN new — left to right, shortly after */
          stagger(newBot,    1, inStart);

          /* Remove clones once both sweeps have fully faded */
          var inFinish     = inStart + (inLen - 1) * STAGGER + FADE_DUR;
          var cleanupDelay = Math.max(outDur, inFinish) + 50;
          setTimeout(function () {
            clonesTop.concat(clonesBot).forEach(function (c) {
              if (c.parentNode) c.parentNode.removeChild(c);
            });
            /* Restore CSS transitions on covers so hover works again.
               Skipped if a newer animation has already started (it
               will have set its own inline styles). */
            if (myId === filterId) {
              covers.forEach(function (c) {
                c.style.transition = "";
                c.style.opacity    = "";
              });
            }
          }, cleanupDelay);
        });
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        applyFilter(tab.dataset.product, true);
      });
    });

    applyFilter("book", false);
  }

  /* -----------------------------------------------------------
     Hero video — fade-on-loop and play/pause control
     ----------------------------------------------------------- */
  function initHeroVideo() {
    var video  = document.querySelector(".hero-video");
    var canvas = document.querySelector(".hero-frame");
    var btn    = document.querySelector(".hero-play-btn");
    if (!video || !btn) return;

    var fading   = false;
    var fadingIn = false;

    function captureFirstFrame() {
      if (!canvas || video.videoWidth === 0 || video.videoHeight === 0) return;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      try {
        canvas.getContext("2d").drawImage(video, 0, 0);
      } catch (e) {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    video.addEventListener("loadeddata", captureFirstFrame, { once: true });

    var autoplayPromise = video.play();
    if (autoplayPromise !== undefined) {
      autoplayPromise.catch(function () {
        btn.classList.add("is-paused");
        btn.setAttribute("aria-label", "Play video");
      });
    }

    video.addEventListener("timeupdate", function () {
      if (video.paused || fading || fadingIn) return;
      var remaining = video.duration - video.currentTime;
      if (!isNaN(remaining) && remaining > 0 && remaining <= 0.7) {
        fading = true;
        video.style.opacity = "0";
        setTimeout(function () {
          video.currentTime = 0;
          video.play().catch(function () {});
          fadingIn = true;
          fading   = false;
          video.style.opacity = "1";
          setTimeout(function () { fadingIn = false; }, 500);
        }, 500);
      }
    });

    btn.addEventListener("click", function () {
      if (video.paused) {
        video.play().catch(function () {});
        btn.classList.remove("is-paused");
        btn.setAttribute("aria-label", "Pause video");
        video.style.opacity = "1";
        fading   = false;
        fadingIn = false;
      } else {
        video.pause();
        btn.classList.add("is-paused");
        btn.setAttribute("aria-label", "Play video");
        video.style.opacity = "1";
        fading   = false;
        fadingIn = false;
      }
    });
  }

  /* -----------------------------------------------------------
     INTERNAL: version switcher (dev/stakeholder tool).
     Each version is its own frozen folder; this control links across
     them, preserving the current query string. This build is V2.
     ----------------------------------------------------------- */
  var VERSION = "v3";

  function updateProtoSummary() {
    var el = document.getElementById("proto-summary");
    if (el) el.textContent = VERSION.toUpperCase();
  }

  function initVersionSwitcher() {
    var host = document.getElementById("version-switcher");
    if (!host) return;
    host.querySelectorAll(".ver-btn").forEach(function (b) {
      var isCurrent = b.dataset.version === VERSION;
      b.classList.toggle("is-active", isCurrent);
      b.setAttribute("aria-pressed", isCurrent ? "true" : "false");
      if (isCurrent) {
        b.disabled = true;                    // already viewing this version
      } else {
        b.addEventListener("click", function () {
          window.location.href = b.dataset.base + window.location.search;
        });
      }
    });
  }

  function initPrototypeBar() {
    var wrap = document.getElementById("variant-switcher");
    var toggle = document.getElementById("proto-toggle");
    var panel = document.getElementById("proto-panel");
    var closeBtn = document.getElementById("proto-close");
    if (!wrap || !toggle || !panel) return;

    // ?clean hides the bar for user-test sessions.
    if (new URLSearchParams(window.location.search).get("clean")) {
      wrap.classList.add("is-hidden");
    }
    // ?promo=b auto-applies the red promo variant (style B) on load.
    if (new URLSearchParams(window.location.search).get("promo") === "b") {
      document.body.classList.add("promo-style-b");
    }
    if (new URLSearchParams(window.location.search).get("clean")) { return; }

    var copyBtn = document.getElementById("proto-copy-link");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = new URL(window.location.href);
        url.searchParams.set("clean", "1");
        navigator.clipboard.writeText(url.toString()).then(function () {
          copyBtn.textContent = "✓ Copied!";
          setTimeout(function () { copyBtn.textContent = "Copy test link"; }, 2500);
        }).catch(function () {
          prompt("Copy this link:", url.toString());
        });
      });
    }

    function isOpen() { return wrap.classList.contains("is-open"); }
    function setOpen(open) {
      wrap.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) { var first = panel.querySelector(".ver-btn:not(:disabled)"); if (first) first.focus(); }
    }
    toggle.addEventListener("click", function () { setOpen(!isOpen()); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); toggle.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (isOpen() && !wrap.contains(e.target)) setOpen(false);
    });
    setOpen(false);
    updateProtoSummary();
  }

  /* -----------------------------------------------------------
     Category mega-menu (Row 2 nav). Each .nav-item's .nav-dropdown
     opens on CSS :hover (desktop mouse — see styles.css) and on click,
     so it also works for keyboard/touch. Only one open at a time;
     closes on outside click or Escape. Disabled on mobile widths
     (the dropdown itself is display:none there — see the phone
     breakpoint in styles.css).
     ----------------------------------------------------------- */
  function initNavDropdowns() {
    var items = document.querySelectorAll(".nav-cats .nav-item");
    if (!items.length) return;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove("is-open");
        var t = item.querySelector(".nav-trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }

    items.forEach(function (item) {
      var trigger = item.querySelector(".nav-trigger");
      var dropdown = item.querySelector(".nav-dropdown");
      if (!trigger || !dropdown) return;
      trigger.addEventListener("click", function (e) {
        // Mobile hides .nav-dropdown entirely (see the phone breakpoint
        // in styles.css) — when it's not actually going to show, let the
        // tap navigate normally instead of "opening" an invisible menu.
        if (getComputedStyle(dropdown).display === "none") return;

        // The trigger's href is a no-JS fallback only — once the dropdown
        // is interactive, a click always toggles it and never navigates
        // (this covers the close click too, not just the opening one).
        e.preventDefault();

        var willOpen = !item.classList.contains("is-open");
        closeAll(willOpen ? item : null);
        if (willOpen) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        } else {
          item.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-item")) closeAll();
    });
  }

  /* -----------------------------------------------------------
     Build the mobile drawer's content by CLONING the real desktop nav
     (.nav-cats-inner's items + .nav-utility-links) instead of hand-
     duplicating link text — so mobile can never drift out of sync
     with desktop. Each category with a dropdown becomes an accordion
     item; "Wedding" (no dropdown on desktop) clones straight through
     as a plain link; Gifts' three mega-menu columns stack in order.
     ----------------------------------------------------------- */
  function buildMobileMenu() {
    var linksHost   = document.getElementById("mobile-menu-links");
    var utilityHost = document.getElementById("mobile-menu-utility");
    var catsInner   = document.querySelector(".nav-cats-inner");
    if (!linksHost || !catsInner) return;

    Array.prototype.forEach.call(catsInner.children, function (child) {
      if (child.classList.contains("nav-item")) {
        var trigger  = child.querySelector(".nav-trigger");
        var dropdown = child.querySelector(".nav-dropdown");
        var label    = trigger ? trigger.textContent.trim() : "";

        var item = document.createElement("div");
        item.className = "mobile-acc-item";

        var accTrigger = document.createElement("button");
        accTrigger.type = "button";
        accTrigger.className = "mobile-acc-trigger";
        accTrigger.setAttribute("aria-expanded", "false");
        accTrigger.innerHTML = label +
          ' <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>';

        var panel = document.createElement("div");
        panel.className = "mobile-acc-panel";
        if (dropdown) {
          if (dropdown.classList.contains("nav-dropdown--mega")) {
            // Gifts: clone each .nav-col (heading + list) — they stack
            // vertically in the drawer via the .mobile-acc-panel .nav-col
            // CSS override (no side-by-side columns on a phone width).
            Array.prototype.forEach.call(dropdown.querySelectorAll(".nav-col"), function (col) {
              panel.appendChild(col.cloneNode(true));
            });
          } else {
            // Clone the <li> items into a fresh <ul> rather than cloning
            // the <ul class="nav-dropdown"> wrapper itself — that class
            // carries desktop-only opacity:0/visibility:hidden/position
            // rules (only revealed via a .nav-item.is-open ancestor,
            // which doesn't exist inside the drawer), so the links would
            // be in the DOM but invisible.
            var ul = document.createElement("ul");
            Array.prototype.forEach.call(dropdown.querySelectorAll("li"), function (li) {
              ul.appendChild(li.cloneNode(true));
            });
            panel.appendChild(ul);
          }
        }

        accTrigger.addEventListener("click", function () {
          var willOpen = !item.classList.contains("is-open");
          // Close any other open accordion item first.
          Array.prototype.forEach.call(linksHost.querySelectorAll(".mobile-acc-item.is-open"), function (open) {
            if (open === item) return;
            open.classList.remove("is-open");
            open.querySelector(".mobile-acc-trigger").classList.remove("is-open");
            open.querySelector(".mobile-acc-trigger").setAttribute("aria-expanded", "false");
            open.querySelector(".mobile-acc-panel").classList.remove("is-open");
          });
          item.classList.toggle("is-open", willOpen);
          accTrigger.classList.toggle("is-open", willOpen);
          accTrigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
          panel.classList.toggle("is-open", willOpen);
        });

        item.appendChild(accTrigger);
        item.appendChild(panel);
        linksHost.appendChild(item);
      } else if (child.matches(".nav-trigger--plain")) {
        // "Wedding" — no dropdown on desktop, so no accordion here either.
        linksHost.appendChild(child.cloneNode(true));
      }
    });

    if (utilityHost) {
      var utilityLinks = document.querySelectorAll(".nav-utility-links > a");
      utilityLinks.forEach(function (a) {
        utilityHost.appendChild(a.cloneNode(true));
      });
    }
  }

  /* -----------------------------------------------------------
     Mobile menu drawer — opened by the Menu button in .nav-mobile-bar.
     Only visible/interactive under the phone breakpoint (see CSS); the
     toggle itself has no width dependency, so it's simply inert when
     the trigger is display:none.
     ----------------------------------------------------------- */
  function initMobileMenu() {
    // ARC-3's own checkbox (#mobile-nav-toggle) drives its native
    // :checked-reveal CSS for the category drawer, but that CSS is
    // scoped to ARC-3's own (lower) breakpoint. Between that breakpoint
    // and our extended 810px one, styles.css hides #main-menu by
    // default and reveals it only via this JS-toggled body class.
    var toggle = document.getElementById("mobile-nav-toggle");
    var bar    = document.querySelector(".arc3-menu__bar");
    if (!toggle) return;

    function setOpen(open) {
      if (open && bar) {
        document.documentElement.style.setProperty("--nav-bar-height", bar.offsetHeight + "px");
      }
      document.body.classList.toggle("nav-drawer-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("change", function () { setOpen(toggle.checked); });

    // The MENU button is a <div>, not a <label>, so clicks on it don't
    // natively toggle the checkbox — wire it up manually.
    var btn = document.querySelector(".arc3-menu__bar__mobile-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        toggle.checked = !toggle.checked;
        setOpen(toggle.checked);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.checked) {
        toggle.checked = false;
        setOpen(false);
      }
    });
    // Resizing past our extended breakpoint shouldn't leave the drawer's
    // forced-open state stuck once ARC-3's own desktop layout takes over.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 810 && toggle.checked) {
        toggle.checked = false;
        setOpen(false);
      }
    });
  }

  /* Floating "Find a gift" button — shown once the hero has scrolled
     out of view, hidden again near the top of the page. */
  function initReviewModal() {
    var overlay  = document.getElementById("review-modal-overlay");
    var titleEl  = document.getElementById("review-modal-title");
    var bodyEl   = document.getElementById("review-modal-body");
    var attrEl   = document.getElementById("review-modal-attr");
    var closeBtn = document.getElementById("review-modal-close");
    if (!overlay || !titleEl || !bodyEl) return;

    function openModal(title, body, name, meta) {
      titleEl.textContent = title;
      bodyEl.textContent  = body;
      if (attrEl) {
        attrEl.innerHTML = "";
        if (name) {
          var strong = document.createElement("strong");
          strong.textContent = name;
          attrEl.appendChild(strong);
        }
        if (meta) {
          var metaSpan = document.createElement("span");
          metaSpan.textContent = meta;
          attrEl.appendChild(metaSpan);
        }
      }
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = "";
    }

    /* Inline truncation: moves .review-see-more inside .review-quote
       and binary-searches for the longest text that fits in 4 lines.
       Deferred until fonts are ready so line-height measurements are accurate. */
    function clampReviews() {
      document.querySelectorAll(".review-card").forEach(function (card) {
      var quoteEl = card.querySelector(".review-quote");
      var btn     = card.querySelector(".review-see-more");
      if (!quoteEl || !btn) return;

      var fullText = quoteEl.textContent.trim();
      quoteEl.dataset.full = fullText;

      /* Measure line height and 6-line max.
         Temporarily clear flex and overflow so scrollHeight = actual text height. */
      quoteEl.style.overflow = "visible";
      quoteEl.style.maxHeight = "none";
      quoteEl.style.flex = "none";
      var lineH = parseFloat(getComputedStyle(quoteEl).lineHeight) || 25.6;
      var maxH  = lineH * 6;

      /* Check if truncation is actually needed */
      if (quoteEl.scrollHeight <= maxH + 2) {
        btn.hidden = true;
        quoteEl.style.overflow = "";
        quoteEl.style.flex = "";
        return;
      }

      /* Move button inline and binary-search for max word count */
      card.removeChild(btn);
      btn.hidden = false;
      quoteEl.style.flex = "";
      quoteEl.style.overflow = "hidden";
      quoteEl.style.maxHeight = maxH + "px";

      var words = fullText.split(/\s+/);
      var lo = 1, hi = words.length;
      while (lo < hi) {
        var mid = Math.ceil((lo + hi) / 2);
        quoteEl.innerHTML = "";
        quoteEl.appendChild(document.createTextNode(words.slice(0, mid).join(" ") + "… "));
        quoteEl.appendChild(btn);
        if (quoteEl.scrollHeight <= maxH + 2) { lo = mid; } else { hi = mid - 1; }
      }
      quoteEl.innerHTML = "";
      quoteEl.appendChild(document.createTextNode(words.slice(0, lo).join(" ") + "… "));
      quoteEl.appendChild(btn);

      btn.addEventListener("click", function () {
        var title = (card.querySelector(".review-title") || {}).textContent || "";
        var name  = (card.querySelector(".review-name")  || {}).textContent || "";
        var meta  = (card.querySelector(".review-meta")  || {}).textContent || "";
        openModal(title, fullText, name, meta);
      });
    });
    } /* end clampReviews */

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(clampReviews);
    } else {
      clampReviews();
    }

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) closeModal();
    });
  }

  function initFloatingGiftButton() {
    var btn = document.getElementById("floating-gift-btn");
    var picker = document.getElementById("picker");
    if (!btn || !picker) return;
    var footer = document.getElementById("arc3-footer__end-row") || document.querySelector(".arc3-footer__end-row");
    var GAP = 12; /* px clearance above the footer */
    function onScroll() {
      var pickerBottom = picker.getBoundingClientRect().bottom;
      btn.classList.toggle("is-visible", pickerBottom < 0);
      /* Pin above footer when it enters the viewport */
      if (footer) {
        var footerTop = footer.getBoundingClientRect().top;
        if (footerTop < window.innerHeight) {
          btn.style.bottom = (window.innerHeight - footerTop + GAP) + "px";
        } else {
          btn.style.bottom = "";
        }
      }
    }
    var scrollSuppressed = false;
    /* Hide immediately on click; suppress scroll listener until animation settles */
    btn.addEventListener("click", function () {
      btn.classList.remove("is-visible");
      scrollSuppressed = true;
      setTimeout(function () { scrollSuppressed = false; onScroll(); }, 800);
    });
    document.addEventListener("scroll", function () { if (!scrollSuppressed) onScroll(); }, { passive: true });
    onScroll();
  }

  /* -----------------------------------------------------------
     App download QR — one QR code, routed by device.
     The QR encodes this page's own URL (?dl=app#app-promo), so
     scanning it opens the real site already scrolled to the app
     download section — never a bare, disconnected page. If the
     visitor is on iOS or Android, this then sends them on to the
     right store; if detection can't tell (desktop, unknown UA), they're
     simply left looking at the section with both badges to tap.
     Runs after the browser's own #app-promo anchor scroll, so the
     section is already in view before (if it happens) the handoff.
     Uses a plain navigation (not .replace()) so the back button
     returns here. */
  function initAppDownloadRedirect() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("dl") !== "app") return;

    var IOS_URL     = "https://apps.apple.com/gb/app/id574408353";
    var ANDROID_URL = "https://play.google.com/store/apps/details?id=com.photobox.android&hl=en-GB";
    var ua = navigator.userAgent || "";
    var isIOS     = /iPad|iPhone|iPod/.test(ua) || (ua.indexOf("Macintosh") > -1 && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/.test(ua);

    if (isIOS)          window.location.href = IOS_URL;
    else if (isAndroid) window.location.href = ANDROID_URL;
    // Desktop / unknown device: no redirect — the page is already
    // sitting on #app-promo with both store badges to tap.
  }

  /* -----------------------------------------------------------
     Init
     ----------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildChips();
    buildUrgencyFilter();

    /* Initial render — no animation, cards appear at full opacity */
    currentRecipientKey = RECIPIENTS[0].key;
    renderProducts(RECIPIENTS[0], true);

    initHowItWorks();
    initGalleryDots();
    initProductScrollbar();
    initScrollArrows();
    initCarouselScrollbars();
    initCoverParallax();
    initThemeFilter();

    /* App download QR code */
    var qrEl = document.getElementById("app-qr-code");
    if (qrEl && window.QRCode) {
      new window.QRCode(qrEl, {
        text:   window.location.origin + window.location.pathname + "?dl=app#app-promo",
        width:  160,
        height: 160,
        colorDark:  "#1c1c1e",
        colorLight: "#fdf6ed",
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
    initVersionSwitcher();
    initPrototypeBar();
    initNavDropdowns();
    buildMobileMenu();
    initMobileMenu();
    initPromoTagToggle();
    initFloatingGiftButton();
    initReviewModal();
    initAppDownloadRedirect();

    /* Press H to hide/show the internal prototype switcher.
       Resets on page refresh — no persistence needed. */
    document.addEventListener("keydown", function (e) {
      if ((e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        var sw = document.getElementById("variant-switcher");
        if (sw) sw.classList.toggle("is-hidden");
      }
    });
  });
})();

function initPromoTagToggle() {
  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.classList && el.classList.contains("promo-tag")) {
        document.body.classList.toggle("promo-style-b");
        return;
      }
      el = el.parentNode;
    }
  });
}
