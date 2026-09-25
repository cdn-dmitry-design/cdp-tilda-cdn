(function () {
  var CFG = {
    storepart: '618946506333',
    nativeRec: '',
    apiProduct: 'https://store.tildaapi.com/api/getproduct/',
    apiTabs: 'https://store.tildaapi.com/api/getproducttabs/',
    apiList: 'https://store.tildaapi.com/api/getproductslist/',
    buyTitle: 'Add to Bag',
    notifyTitle: 'Notify Me',
    currency: '$',
    pageTitleBrand: '',
    demoKey: 'charlotte',
    urlPrefix: '/cdp',
    swatch: {
      black: '#000',
      white: '#fff',
      tan: '#c4a574',
      beige: '#d8cbb8',
      brown: '#6b4c3b',
      grey: '#9a9a9a',
      gray: '#9a9a9a',
      red: '#8b1a1a',
      blue: '#1a3a6b',
      green: '#2d4a2d',
      pink: '#d4a5a5',
      navy: '#1c2841',
      'черный': '#000',
      'чёрный': '#000',
      'белый': '#fff',
      'беж': '#c4a574'
    },
    tabs: [
      { id: 'details', label: 'DETAILS' },
      { id: 'materials', label: 'MATERIALS & CARE' },
      { id: 'fit', label: 'SIZE & FIT' },
      { id: 'shipping', label: 'SHIPPING & RETURNS' }
    ]
  };

  var DEMO = {
    charlotte: {
      title: 'CHARLOTTE WIDE LEG PLEAT PANT',
      price: 159,
      currency: '$',
      modelNote: "Maria is 5'11\"/180cm and wears a size S",
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL'],
      color: 'Black',
      available: false,
      gallery: [
        'https://cdp.world/cdn/shop/files/CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-01.png?v=1749806077&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-03.png?v=1751868238&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-04.png?v=1751868238&width=1600',
        'https://cdp.world/cdn/shop/files/CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-02.png?v=1751868238&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-01.png?v=1751868238&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-02.png?v=1751868238&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-Black-GM-Front_860a8bb3-d608-4b22-8b0e-2844d3bafe93.png?v=1751868236&width=1600',
        'https://cdp.world/cdn/shop/files/CDP16937-Black-GM-Back_27ca1f1e-4f5e-4d54-b4c7-b88a86fd388d.png?v=1751868236&width=1600'
      ],
      tabs: {
        details: '<p>The Charlotte wide-leg pleat pants in classic black feature a low-rise, oversized fit with exaggerated belt loops and rivet detailing. Designed with pleat accents, a front fly closure with an internal button for added security, and side seam pockets, they are finished with contrast tonal stitching.</p><p>Custom CDP signature embroidery at the back waistband and an invisible hem finish complete the look.</p>',
        materials: '<p>60% Polyester 35% Rayon 5% Elastane</p><p>Please follow provided care instructions and only wash with dark colors.</p><p>Wash and dry garment inside out<br>Cold hand wash or gentle machine wash<br>Dry flat<br>Do not iron<br>Do not bleach<br>Do not tumble dry</p>',
        fit: '<p>Relaxed, baggy fit<br>True to size<br>Maria is 5\'11"/180cm and wears a size S</p>',
        shipping: '<p>Free express shipping for orders over $200 USD.<br><br>View full shipping details <a href="https://cdp.world/pages/shipping" target="_blank" rel="noopener">here</a>.</p>'
      }
    }
  };

  var root, card;
  var state = {
    gallery: [],
    activeSlide: 0,
    activeTab: '',
    tabDefs: [],
    activeSize: '',
    activeColor: '',
    productUid: '',
    loaded: false,
    apiRecId: '',
    available: true,
    demoMode: false
  };

  function normPath(path) {
    var p = String(path || '/');
    if (p.charAt(0) !== '/') p = '/' + p;
    return p.replace(/\/+/g, '/');
  }

  function tproductSegment(path) {
    var m = String(path || '').match(/(\/tproduct\/\d+[^?#]*)/i);
    return m ? m[1] : '';
  }

  function prefixedProductPath(path) {
    var seg = tproductSegment(path);
    if (!seg) return '';
    return normPath(CFG.urlPrefix + seg);
  }

  function normalizeProductUrl(url) {
    var seg = tproductSegment(url);
    if (!seg) return url || '#';
    return prefixedProductPath(url);
  }

  function syncProductUrl() {
    if (!isTproductRoute()) return;
    var next = prefixedProductPath(location.pathname);
    if (!next) return;
    var cur = normPath(location.pathname.split('?')[0].split('#')[0]);
    if (cur === next) return;
    if (cur === normPath(tproductSegment(location.pathname)) || /\/commerce\/tproduct\//i.test(cur)) {
      try {
        history.replaceState(history.state, '', next + location.search + location.hash);
      } catch (e) {}
    }
  }

  function onProductLinkClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="tproduct"]') : null;
    if (!a || e.defaultPrevented) return;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href') || '';
    var seg = tproductSegment(href);
    if (!seg) return;
    if (normPath(href.split('?')[0].split('#')[0]) === prefixedProductPath(href)) {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      location.assign(seg + (href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')) : ''));
    }
  }

  function isTproductRoute() {
    return /\/tproduct\/\d+/i.test(String(location.pathname || ''));
  }

  /** Не монтировать CDP-карточку на чужих каталогах (/flats, /commerce и т.д.). */
  function isCdpProductScope() {
    if (document.querySelector('[data-cdp-prod-demo]')) return true;
    if (!isTproductRoute()) return false;
    var path = String(location.pathname || '');
    var prefix = String(CFG.urlPrefix || '/cdp').trim() || '/cdp';
    var tplEl = document.querySelector('#cdpProdPage.cdp-prod, #cdpProdPageTpl .cdp-prod');
    if (tplEl) {
      var fromTpl = String(tplEl.getAttribute('data-url-prefix') || '').trim();
      if (fromTpl) prefix = fromTpl;
    }
    if (prefix.charAt(0) !== '/') prefix = '/' + prefix;
    prefix = prefix.replace(/\/$/, '') || '/cdp';
    return path === prefix || path.indexOf(prefix + '/') === 0;
  }

  function qs(sel, el) {
    if (!el && sel.charAt(0) === '#') {
      var byId = document.getElementById(sel.slice(1));
      if (byId) return byId;
    }
    return (el || root).querySelector(sel);
  }

  function qsa(sel, el) {
    return Array.prototype.slice.call((el || root).querySelectorAll(sel));
  }

  function mountPoint() {
    if (isTproductRoute()) {
      var allrecords = document.getElementById('allrecords');
      if (allrecords) {
        var recs = allrecords.querySelectorAll('[id^="rec"]');
        for (var i = 0; i < recs.length; i++) {
          if (recs[i].querySelector('.t-store__prod-snippet__container, .js-store-product[data-product-uid]')) {
            return recs[i].querySelector('.t-container') || recs[i];
          }
        }
        return allrecords;
      }
    }

    var assets = document.getElementById('cdpProdAssets');
    if (assets) {
      var rec = assets.closest('[id^="rec"]');
      if (rec) return rec.querySelector('.t-container') || rec.querySelector('.t123__content') || rec;
    }
    return document.getElementById('allrecords') || document.body;
  }

  function nativeStoreProduct() {
    var allrecords = document.getElementById('allrecords');
    if (!allrecords) return null;
    var el = allrecords.querySelector(
      '.js-store-product[data-product-uid]:not(.js-store-product_single), .t-store__prod-snippet__container .js-store-product'
    );
    if (el && root && root.contains(el)) return null;
    return el;
  }

  function nativeControlsWrap() {
    var native = nativeStoreProduct();
    if (!native) return null;
    return native.querySelector('.js-product-controls-wrapper');
  }

  function findProductStoreRec() {
    var allrecords = document.getElementById('allrecords');
    if (!allrecords) return '';
    var recs = allrecords.querySelectorAll('[id^="rec"]');
    for (var i = 0; i < recs.length; i++) {
      if (recs[i].querySelector('.t-store__prod-snippet__container, .js-store-product[data-product-uid]')) {
        return recs[i].id.replace(/^rec/, '');
      }
    }
    return '';
  }

  function isPopupProductPage() {
    return !!document.querySelector('#allrecords .t-store__prod-snippet__container');
  }

  function decodeTabHtml(raw) {
    raw = String(raw || '').trim();
    if (!raw) return '';
    if (raw.indexOf('&lt;') >= 0 && raw.indexOf('<') < 0) {
      var ta = document.createElement('textarea');
      ta.innerHTML = raw;
      raw = ta.value;
    }
    return raw;
  }

  function tabHtmlFromRaw(tab, prod) {
    if (tab.type === 'chars') {
      return characteristicsHtml(prod) || sanitizeRichHtml(decodeTabHtml(tab.data || ''));
    }
    var raw = decodeTabHtml(tab.data || tab.html || tab.content || '');
    if (!raw && tab.type === 'text') raw = decodeTabHtml((prod && prod.text) || '');
    if (!raw) return '';
    if (tab.type === 'text' && raw.indexOf('<') < 0) return richTextHtml(raw);
    return sanitizeRichHtml(raw);
  }

  function queryMountedPage() {
    var nodes = document.querySelectorAll('#cdpProdPage');
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].closest('template')) return nodes[i];
    }
    return null;
  }

  function ensurePageRoot() {
    var el = queryMountedPage();
    if (el) return el;
    if (!isCdpProductScope()) return null;

    var tpl = document.getElementById('cdpProdPageTpl');
    if (!tpl || !tpl.content) return null;

    var frag = tpl.content.cloneNode(true);
    var nativeRecId = findProductStoreRec();
    var nativeEl = nativeRecId ? document.getElementById('rec' + nativeRecId) : null;
    var parent = document.getElementById('allrecords') || document.body;

    if (nativeEl && nativeEl.parentNode) {
      nativeEl.parentNode.insertBefore(frag, nativeEl);
    } else if (parent.firstChild) {
      parent.insertBefore(frag, parent.firstChild);
    } else {
      parent.appendChild(frag);
    }

    return queryMountedPage();
  }

  function setupPageRoot() {
    root = ensurePageRoot();
    if (!root) return false;

    document.documentElement.classList.add('cdp-prod-page');

    var hdr = document.getElementById('cdpHeader');
    if (hdr) {
      var hdrH = Math.ceil(hdr.getBoundingClientRect().height);
      if (hdrH > 0) document.documentElement.style.setProperty('--cdp-hdr-h', hdrH + 'px');
    }

    var sp = String(root.getAttribute('data-storepart') || '').trim();
    if (/^\d{6,}$/.test(sp)) CFG.storepart = sp;

    var prefix = String(root.getAttribute('data-url-prefix') || '').trim();
    if (prefix) CFG.urlPrefix = prefix.charAt(0) === '/' ? prefix : '/' + prefix;

    var demo = String(root.getAttribute('data-demo') || '').trim();
    if (demo) state.demoMode = demo;

    var rec = String(root.getAttribute('data-native-rec') || CFG.nativeRec || '').trim();
    if (/^\d+$/.test(rec)) CFG.nativeRec = rec;

    card = root.querySelector('.js-store-product_single');
    return true;
  }

  function escapeHtml(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeRichHtml(html) {
    var raw = String(html || '').trim();
    if (!raw) return '';
    raw = raw.replace(/<script[\s\S]*?<\/script>/gi, '');
    raw = raw.replace(/\son\w+\s*=\s*(['"])[^'"]*\1/gi, '');
    raw = raw.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '');
    return raw;
  }

  function richTextHtml(html) {
    var raw = String(html || '').trim();
    if (!raw) return '';
    if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeRichHtml(raw);
    return escapeHtml(stripHtml(raw)).replace(/\n/g, '<br>');
  }

  function setRichHtml(el, html) {
    if (!el) return;
    var out = richTextHtml(html);
    if (!out) {
      el.innerHTML = '';
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML = out;
  }

  function parseEditions(raw) {
    try {
      var e = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(e) ? e : [];
    } catch (err) {
      return [];
    }
  }

  function isOptionKey(key) {
    return !/^(uid|price|priceold|sku|quantity|img|externalid)$/i.test(String(key || ''));
  }

  function isSizeKey(key) {
    return /размер|size|размерный|рост/i.test(String(key || ''));
  }

  function isColorKey(key) {
    return /цвет|color|colour|colourway/i.test(String(key || ''));
  }

  function uniqueList(list) {
    var seen = {};
    var out = [];
    (list || []).forEach(function (v) {
      v = String(v || '').trim();
      if (!v || /не выбрано|not selected/i.test(v) || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out;
  }

  function splitVals(list) {
    var out = [];
    (list || []).forEach(function (v) {
      String(v)
        .split(/[,;|/]/)
        .forEach(function (s) {
          s = s.trim();
          if (s) out.push(s);
        });
    });
    return out;
  }

  function extractFromEditions(editions) {
    var sizes = [];
    var colors = [];
    var seenS = {};
    var seenC = {};

    editions.forEach(function (ed) {
      Object.keys(ed || {}).forEach(function (key) {
        if (!isOptionKey(key)) return;
        var val = String(ed[key] || '').trim();
        if (!val || /не выбрано|not selected/i.test(val)) return;
        if (isSizeKey(key)) {
          splitVals([val]).forEach(function (s) {
            if (!seenS[s]) {
              seenS[s] = true;
              sizes.push(s);
            }
          });
        } else if (isColorKey(key)) {
          splitVals([val]).forEach(function (s) {
            if (!seenC[s]) {
              seenC[s] = true;
              colors.push(s);
            }
          });
        }
      });
    });

    return { sizes: sizes, colors: colors };
  }

  function extractFromJsonOptions(raw) {
    var sizes = [];
    var colors = [];
    try {
      var opts = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(opts)) return { sizes: sizes, colors: colors };
      opts.forEach(function (opt) {
        var title = String((opt && opt.title) || '');
        var vals = String((opt && opt.values) || '')
          .split('\n')
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        if (isSizeKey(title)) sizes = sizes.concat(splitVals(vals));
        if (isColorKey(title)) colors = colors.concat(splitVals(vals));
      });
    } catch (e) {}
    return { sizes: sizes, colors: colors };
  }

  function extractVariants(prod) {
    if (!prod) return { sizes: [], colors: [], editions: [] };
    var editions = parseEditions(prod.editions);
    var fromEd = extractFromEditions(editions);
    var fromOpt = extractFromJsonOptions(prod.json_options);
    return {
      sizes: uniqueList(fromOpt.sizes.length ? fromOpt.sizes : fromEd.sizes),
      colors: uniqueList(fromOpt.colors.length ? fromOpt.colors : fromEd.colors),
      editions: editions
    };
  }

  function swatchKey(name) {
    var raw = String(name || '').toLowerCase();
    var s = raw.replace(/[^a-zа-яё0-9]/gi, '');
    if (/black|черн|чёрн/.test(raw) || /chern|chorn/.test(s)) return 'black';
    if (/white|бел/.test(raw)) return 'white';
    if (/tan|беж/.test(raw)) return 'tan';
    if (/beige/.test(raw)) return 'beige';
    if (/brown|корич/.test(raw)) return 'brown';
    if (/grey|gray|сер/.test(raw)) return 'grey';
    if (/navy/.test(raw)) return 'navy';
    if (/red|крас/.test(raw)) return 'red';
    if (/blue|син/.test(raw)) return 'blue';
    if (/green|зел/.test(raw)) return 'green';
    if (/pink|роз/.test(raw)) return 'pink';
    return s.slice(0, 12) || 'color';
  }

  function swatchStyle(name) {
    var key = swatchKey(name);
    var hex = CFG.swatch[key] || CFG.swatch[String(name || '').toLowerCase()];
    return hex ? 'background:' + hex : 'background:#000';
  }

  function pickSelect(sel, value) {
    if (!sel || !value) return false;
    for (var i = 0; i < sel.options.length; i++) {
      var opt = sel.options[i];
      if (opt.value === value || opt.text === value || String(opt.text).trim() === value) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function pickNativeVariant(kind, value) {
    var wrap = nativeControlsWrap() || qs('.js-product-controls-wrapper');
    if (!wrap || !value) return;

    qsa('.t-product__option, .js-product-edition-option', wrap).forEach(function (opt) {
      var titleEl = opt.querySelector(
        '.t-product__option-title, .js-product-edition-option-name, .js-product-option-name'
      );
      var title = titleEl ? titleEl.textContent.trim() : '';
      if (kind === 'size' && !isSizeKey(title)) return;
      if (kind === 'color' && !isColorKey(title)) return;
      if (pickSelect(opt.querySelector('select'), value)) return;
      qsa('.t-product__option-chooser button, .js-product-option-chooser button, .t-store__prod-popup__option-btn', opt).forEach(
        function (btn) {
          var label = String(btn.getAttribute('data-option-value') || btn.textContent || '').trim();
          if (label === value) btn.click();
        }
      );
    });
  }

  function matchVariantValue(list, value) {
    if (!value || !list || !list.length) return '';
    var v = decodeURIComponent(String(value)).trim();
    for (var i = 0; i < list.length; i++) {
      if (list[i] === v) return list[i];
      if (String(list[i]).toLowerCase() === v.toLowerCase()) return list[i];
    }
    return '';
  }

  function readVariantFromUrl() {
    try {
      var sp = new URLSearchParams(location.search);
      var size = sp.get('size') || sp.get('Size') || '';
      var color = sp.get('color') || sp.get('Color') || sp.get('colour') || '';
      if (size) state.activeSize = decodeURIComponent(size);
      if (color) state.activeColor = decodeURIComponent(color);
    } catch (e) {}
  }

  function applyVariants(prod) {
    var v = extractVariants(prod);
    state.variants = v;

    var urlSize = matchVariantValue(v.sizes, state.activeSize);
    var urlColor = matchVariantValue(v.colors, state.activeColor);
    if (urlSize) state.activeSize = urlSize;
    else if (!state.activeSize || v.sizes.indexOf(state.activeSize) === -1) state.activeSize = v.sizes[0] || '';

    if (urlColor) state.activeColor = urlColor;
    else if (!state.activeColor || v.colors.indexOf(state.activeColor) === -1) state.activeColor = v.colors[0] || '';

    renderSizes(v.sizes, state.activeSize);
    renderColors(v.colors, state.activeColor);

    setTimeout(function () {
      syncVariantsToNative();
    }, 300);
  }

  function syncVariantsToNative() {
    if (state.activeSize) pickNativeVariant('size', state.activeSize);
    var colorBox = qs('#cdpProdColors') || qs('.cdp-prod__colors');
    if (state.activeColor && !(colorBox && colorBox.getAttribute('data-cdp-colors'))) {
      pickNativeVariant('color', state.activeColor);
    }
  }

  function num(v) {
    if (v == null) return NaN;
    var s = String(v).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(',', '.');
    return parseFloat(s.replace(/[^\d.-]/g, ''));
  }

  function fmtPrice(n, currency) {
    n = Number(n);
    if (!isFinite(n)) return '';
    currency = currency || CFG.currency;
    if (currency === '$') return '$' + n.toFixed(2);
    if (currency === '₽' || currency === 'руб') return Math.round(n).toLocaleString('ru-RU') + ' ₽';
    return Math.round(n).toLocaleString('ru-RU') + ' ' + currency;
  }

  function parseGallery(raw) {
    try {
      var g = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(g)) return [];
      return g.map(function (x) {
        return (x && (x.img || x.orig)) || '';
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function stripHtml(html) {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();
  }

  function serializeParams(obj) {
    return Object.keys(obj)
      .filter(function (k) {
        return obj[k] != null && obj[k] !== '';
      })
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
      })
      .join('&');
  }

  function isPublishedPage() {
    var allrecords = document.getElementById('allrecords');
    if (!allrecords) return true;
    var mode = allrecords.getAttribute('data-tilda-mode');
    return mode !== 'edit' && mode !== 'preview';
  }

  function tabsApiUrl(uid, storepart, recId) {
    var params = {
      storepartuid: storepart,
      recid: recId || '',
      productuid: uid,
      c: Date.now()
    };
    var allrecords = document.getElementById('allrecords');
    if (!isPublishedPage() && allrecords) {
      params.projectid = allrecords.getAttribute('data-tilda-project-id') || '';
      var host = window.location.hostname.split('.');
      var tildaHost = 'tilda.' + host[host.length - 1];
      return 'https://' + tildaHost + '/projects/store/getproducttabs/?' + serializeParams(params);
    }
    var endpoint = window.t_store_endpoint || 'store.tildaapi.com';
    return 'https://' + endpoint + '/api/getproducttabs/?' + serializeParams(params);
  }

  function slugTabId(title, index) {
    var s = String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return s || 'tab-' + index;
  }

  function characteristicsHtml(prod) {
    if (!prod) return '';
    var chars = prod.characteristics;
    if (!chars && prod.json_chars) {
      try {
        chars = JSON.parse(prod.json_chars);
      } catch (e) {}
    }
    if (!chars) return '';
    if (typeof chars === 'string') {
      try {
        chars = JSON.parse(chars);
      } catch (e) {
        return '<p>' + chars + '</p>';
      }
    }
    if (Array.isArray(chars)) {
      return chars
        .map(function (c) {
          if (!c) return '';
          var title = c.title || c.name || c.key || '';
          var val = c.value != null ? c.value : c.val || '';
          if (!title && !val) return '';
          return title
            ? '<p><strong>' + title + ':</strong> ' + val + '</p>'
            : '<p>' + val + '</p>';
        })
        .filter(Boolean)
        .join('');
    }
    if (typeof chars === 'object') {
      return Object.keys(chars)
        .map(function (key) {
          return '<p><strong>' + key + ':</strong> ' + chars[key] + '</p>';
        })
        .join('');
    }
    return '';
  }

  function normalizeTildaTabs(rawTabs, prod) {
    if (!rawTabs || !rawTabs.length) return null;
    var tabs = [];
    var data = {};
    var used = {};

    rawTabs.forEach(function (tab, i) {
      if (!tab) return;
      var label = String(tab.title || '').trim();
      if (!label) return;
      var id = slugTabId(label, i);
      while (used[id]) id = id + '-' + i;
      used[id] = true;
      tabs.push({ id: id, label: label });
      data[id] = tabHtmlFromRaw(tab, prod);
    });

    if (!tabs.length) return null;
    return { tabs: tabs, data: data };
  }

  function fetchProductTabs(uid, prod) {
    var tries = storepartCandidates();
    if (!tries.length) return Promise.reject(new Error('no storepart'));

    var recId = getApiRecId();
    var chain = Promise.reject(new Error('init'));
    tries.forEach(function (sp) {
      chain = chain.catch(function () {
        return apiFetch(tabsApiUrl(uid, sp, recId)).then(function (data) {
          if (!data || !data.tabs || !data.tabs.length) throw new Error('empty tabs');
          CFG.storepart = String(sp);
          if (root) root.setAttribute('data-storepart', CFG.storepart);
          var normalized = normalizeTildaTabs(data.tabs, prod);
          if (!normalized) throw new Error('empty tabs');
          return normalized;
        });
      });
    });
    return chain;
  }

  function tabsFromStoreList(uid, prod) {
    var list = window.tStoreTabsList && window.tStoreTabsList[String(uid)];
    if (!list || !list.length) return null;
    return normalizeTildaTabs(list, prod);
  }

  function applyTabsResult(result) {
    if (!result || !result.tabs || !result.tabs.length) return;
    state.tabDefs = result.tabs;
    var ids = result.tabs.map(function (t) {
      return t.id;
    });
    if (ids.indexOf(state.activeTab) === -1) state.activeTab = result.tabs[0].id;
    renderTabsContent(result.tabs, result.data);
  }

  function loadProductTabs(uid, prod) {
    fetchProductTabs(uid, prod)
      .then(function (result) {
        applyTabsResult(result);
      })
      .catch(function () {
        waitForStoreTabs(uid, prod);
      });
  }

  function waitForStoreTabs(uid, prod, attempt) {
    attempt = attempt || 0;
    var result = tabsFromStoreList(uid, prod);
    if (result) {
      applyTabsResult(result);
      return;
    }
    if (attempt >= 80) return;
    setTimeout(function () {
      waitForStoreTabs(uid, prod, attempt + 1);
    }, 250);
  }

  function parseDetailsFromText(html) {
    var sections = { details: '', materials: '', fit: '', shipping: '' };
    var raw = String(html || '').trim();
    if (!raw) return sections;

    if (/<[a-z][\s\S]*>/i.test(raw)) {
      sections.details = sanitizeRichHtml(raw);
      return sections;
    }

    var text = stripHtml(raw);
    if (!text) return sections;

    var lines = text.split(/\n/).map(function (s) {
      return String(s || '').trim();
    }).filter(Boolean);

    var current = 'details';
    var buffers = { details: [], materials: [], fit: [], shipping: [] };

    lines.forEach(function (line) {
      var low = line.toLowerCase();
      if (/^materials|^состав|^уход/.test(low)) current = 'materials';
      else if (/^size|^размер|^посадка|^fit/.test(low)) current = 'fit';
      else if (/^shipping|^доставк|^возврат/.test(low)) current = 'shipping';
      else buffers[current].push(line);
    });

    Object.keys(buffers).forEach(function (key) {
      if (buffers[key].length) {
        sections[key] = buffers[key].map(function (l) {
          return '<p>' + escapeHtml(l) + '</p>';
        }).join('');
      }
    });

    if (!sections.details && raw) sections.details = richTextHtml(raw);
    return sections;
  }

  function productUidFromUrl() {
    var m = String(location.pathname || '').match(/\/tproduct\/(\d+)/i);
    return m ? m[1] : '';
  }

  function readUidAttr(el) {
    if (!el) return '';
    var uid = String(el.getAttribute('data-product-gen-uid') || el.getAttribute('data-product-uid') || '').trim();
    return /^\d{6,}$/.test(uid) ? uid : '';
  }

  function getRecId() {
    var rec = root.closest('[id^="rec"]');
    return rec && rec.id ? rec.id.replace(/^rec/, '') : '';
  }

  function detectNativeRec() {
    var productRec = findProductStoreRec();
    if (productRec) return productRec;

    var allrecords = document.getElementById('allrecords');
    var nodes = document.querySelectorAll('[data-record-type="786"], [data-record-type="200"], .t-store');
    for (var i = 0; i < nodes.length; i++) {
      var rec = nodes[i].closest('[id^="rec"]');
      if (!rec || !rec.id) continue;
      if (root && rec.contains(root)) continue;
      if (allrecords && !allrecords.contains(rec)) continue;
      return rec.id.replace(/^rec/, '');
    }
    return getRecId() || CFG.nativeRec;
  }

  function getApiRecId() {
    if (!state.apiRecId) state.apiRecId = detectNativeRec();
    return state.apiRecId;
  }

  function apiFetch(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) {
      return r.text().then(function (text) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (!text || String(text).indexOf('ERROR:') === 0) throw new Error(String(text));
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('API:' + String(text).slice(0, 120));
        }
      });
    });
  }

  function resolvePrice(prod) {
    if (!prod) return NaN;
    var price = num(prod.price);
    if (isFinite(price)) return price;
    var editions = parseEditions(prod.editions);
    for (var i = 0; i < editions.length; i++) {
      price = num(editions[i].price);
      if (isFinite(price)) return price;
    }
    return NaN;
  }

  function editionQuantityAvailable(ed) {
    if (!ed) return true;
    var q = ed.quantity;
    if (q === 0 || q === '0') return false;
    return true;
  }

  function isProductAvailable(prod) {
    if (!prod) return false;
    if (prod.quantity === 0 || prod.quantity === '0') return false;
    var editions = parseEditions(prod.editions);
    if (!editions.length) return prod.quantity !== 0 && prod.quantity !== '0';
    for (var i = 0; i < editions.length; i++) {
      if (editionQuantityAvailable(editions[i])) return true;
    }
    return false;
  }

  function detectCurrencyFromProd(prod) {
    var curEl = document.querySelector('.t-store__prod-popup__price-currency, .js-store-prod-price .t-store__prod-popup__price-currency');
    if (curEl && /₽|руб/i.test(curEl.textContent || '')) return '₽';
    if (prod && /rub/i.test(String(prod.currency || prod.pricecurrency || ''))) return '₽';
    var price = resolvePrice(prod);
    if (isFinite(price) && price >= 500) return '₽';
    return CFG.currency;
  }

  function normalizeProduct(raw) {
    if (!raw) return null;
    var p = raw.product || raw;
    if (!p || !p.uid) return null;
    if (!p.characteristics && p.json_chars) {
      try {
        p.characteristics = JSON.parse(p.json_chars);
      } catch (e) {}
    }
    return p;
  }

  function resolveProductUid() {
    var uid = readUidAttr(card) || readUidAttr(root);
    if (uid) return uid;
    uid = productUidFromUrl();
    if (uid) return uid;
    var el = document.querySelector('.js-store-product[data-product-uid]:not(.js-store-product_single)');
    if (el && !root.contains(el)) return readUidAttr(el);
    return '';
  }

  function storepartFromNative() {
    var el = document.querySelector('.js-store-product[data-product-part-uid]:not(.js-store-product_single)');
    if (!el || (root && root.contains(el))) return '';
    var sp = String(el.getAttribute('data-product-part-uid') || '').split(',')[0].trim();
    return /^\d{6,}$/.test(sp) ? sp : '';
  }

  function storepartCandidates() {
    var tries = [];
    var fromRoot = String((root && root.getAttribute('data-storepart')) || '').trim();
    [fromRoot, storepartFromNative(), CFG.storepart, '618946506333'].forEach(function (sp) {
      sp = String(sp || '').trim();
      if (/^\d{6,}$/.test(sp) && tries.indexOf(sp) === -1) tries.push(sp);
    });
    return tries;
  }

  function productFromStoreObj(uid) {
    uid = String(uid || '');
    if (!uid) return null;
    var pools = [window.tStoreSingleProdsObj, window.tStoreProductsObj, window.tStoreProdsObj];
    for (var i = 0; i < pools.length; i++) {
      var pool = pools[i];
      if (pool && pool[uid]) return normalizeProduct(pool[uid]);
    }
    return null;
  }

  function productFromPageInline(uid) {
    uid = String(uid || '');
    if (!uid) return null;
    var scripts = document.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      var code = scripts[i].textContent || '';
      if (code.indexOf('t_store_productInit') === -1 || code.indexOf('"uid":' + uid) === -1) continue;
      var m = code.match(/var\s+product\s*=\s*(\{[\s\S]*?\});/);
      if (!m) continue;
      try {
        var prod = normalizeProduct(JSON.parse(m[1]));
        if (prod && String(prod.uid) === uid) return prod;
      } catch (e) {}
    }
    return null;
  }

  function galleryFromNativeDom() {
    var imgs = [];
    var native = document.querySelector('.js-store-product:not(.js-store-product_single)');
    if (!native || (root && root.contains(native))) return imgs;
    native.querySelectorAll('img[src]').forEach(function (img) {
      var src = String(img.getAttribute('src') || img.getAttribute('data-original') || '').trim();
      if (src && imgs.indexOf(src) === -1) imgs.push(src);
    });
    return imgs;
  }

  function fetchProductByUid(uid) {
    var tries = storepartCandidates();
    if (!tries.length) return Promise.reject(new Error('no storepart'));

    var chain = Promise.reject(new Error('init'));
    tries.forEach(function (sp) {
      chain = chain.catch(function () {
        var url =
          CFG.apiProduct +
          '?productuid=' +
          encodeURIComponent(uid) +
          '&storepartuid=' +
          encodeURIComponent(sp) +
          '&recid=' +
          encodeURIComponent(getApiRecId());
        return apiFetch(url).then(function (data) {
          var p = normalizeProduct(data);
          if (!p || !p.uid) throw new Error('empty');
          CFG.storepart = String(sp);
          if (root) root.setAttribute('data-storepart', CFG.storepart);
          return p;
        });
      });
    });
    return chain;
  }

  function setStatus(msg) {
    var el = qs('#cdpProdStatus');
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = msg;
  }

  function renderGallery(images) {
    var box = qs('#cdpProdGallery');
    var dots = qs('#cdpProdDots');
    if (!box) return;

    state.gallery = images || [];
    state.activeSlide = 0;
    box.innerHTML = state.gallery
      .map(function (src, i) {
        return (
          '<div class="cdp-prod__gallery-item" data-idx="' +
          i +
          '"><img' +
          (i === 0 ? ' class="js-product-img"' : '') +
          ' src="' +
          escapeHtml(src) +
          '" alt="" loading="' +
          (i < 2 ? 'eager' : 'lazy') +
          '"></div>'
        );
      })
      .join('');

    if (dots) {
      dots.innerHTML = state.gallery
        .map(function (_, i) {
          return '<span class="cdp-prod__dot' + (i === 0 ? ' is-active' : '') + '" data-idx="' + i + '"></span>';
        })
        .join('');
    }

    if (card && state.gallery[0]) card.setAttribute('data-product-img', state.gallery[0]);

    var prog = qs('#cdpProdGalleryProgress');
    if (prog) {
      prog.innerHTML = state.gallery
        .map(function (_, i) {
          return '<span' + (i === 0 ? ' class="is-active"' : '') + ' data-idx="' + i + '"></span>';
        })
        .join('');
    }

    updateSlideUI(0);
    bindGalleryObserver();
  }

  function updateGalleryProgress() {
    var bar = qs('#cdpProdGalleryProgress');
    if (!bar || !state.gallery.length) return;
    var idx = state.activeSlide || 0;
    qsa('span', bar).forEach(function (seg, i) {
      seg.classList.toggle('is-active', i === idx);
    });
  }

  function updateSlideUI(idx) {
    if (!state.gallery.length) return;
    idx = Math.max(0, Math.min(idx, state.gallery.length - 1));
    state.activeSlide = idx;
    qsa('.cdp-prod__dot').forEach(function (dot) {
      dot.classList.toggle('is-active', Number(dot.getAttribute('data-idx')) === idx);
    });
    updateGalleryProgress();
  }

  function bindGalleryObserver() {
    var box = qs('#cdpProdGallery');
    if (!box) return;
    var items = qsa('.cdp-prod__gallery-item', box);
    if (!items.length) return;

    if (box.__cdpIo) box.__cdpIo.disconnect();
    if (typeof IntersectionObserver === 'undefined') return;

    var isMobile = window.matchMedia('(max-width: 999px)').matches;

    box.__cdpIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.45) {
            updateSlideUI(Number(en.target.getAttribute('data-idx')));
          }
        });
      },
      { root: isMobile ? box : box, threshold: [0.45, 0.65] }
    );
    items.forEach(function (item) {
      box.__cdpIo.observe(item);
    });
  }

  function bindGalleryScroll() {
    var box = qs('#cdpProdGallery');
    var dots = qs('#cdpProdDots');
    if (!box || box.__cdpScrollBound) return;
    box.__cdpScrollBound = true;

    var scrollTm = 0;
    box.addEventListener(
      'scroll',
      function () {
        if (scrollTm) return;
        scrollTm = requestAnimationFrame(function () {
          scrollTm = 0;
          if (!window.matchMedia('(max-width: 999px)').matches) return;
          var items = qsa('.cdp-prod__gallery-item', box);
          if (!items.length) return;
          var center = box.scrollLeft + box.clientWidth * 0.5;
          var best = 0;
          var bestDist = Infinity;
          items.forEach(function (item, i) {
            var mid = item.offsetLeft + item.offsetWidth * 0.5;
            var dist = Math.abs(mid - center);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          });
          if (best !== state.activeSlide) updateSlideUI(best);
          else updateGalleryProgress();
        });
      },
      { passive: true }
    );

    if (dots && !dots.__cdpBound) {
      dots.__cdpBound = true;
      dots.addEventListener('click', function (e) {
        var dot = e.target.closest('.cdp-prod__dot');
        if (!dot) return;
        var item = box.querySelector('.cdp-prod__gallery-item[data-idx="' + dot.getAttribute('data-idx') + '"]');
        if (item) {
          if (window.matchMedia('(max-width: 999px)').matches) {
            box.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
          } else {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    }
  }

  function bindStickyBuy() {
    /* sticky buy disabled — caused scroll jank on mobile */
  }

  function renderTabsContent(tabDefs, tabsData) {
    var panels = qs('#cdpProdDetailsPanels');
    var nav = qs('#cdpProdDetailsNav');
    if (!panels || !nav) return;

    tabDefs = tabDefs && tabDefs.length ? tabDefs : CFG.tabs;
    tabsData = tabsData || {};
    state.tabDefs = tabDefs;

    if (!state.activeTab || !tabDefs.some(function (t) { return t.id === state.activeTab; })) {
      state.activeTab = tabDefs[0].id;
    }

    var arrowHtml =
      '<svg class="cdp-prod__tab-arrow" id="cdpProdTabArrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M6 5L10 8L6 11" stroke="currentColor"></path></svg>';

    nav.innerHTML =
      tabDefs
        .map(function (t) {
          var on = t.id === state.activeTab;
          return (
            '<button type="button" class="cdp-prod__tab-btn' +
            (on ? ' is-active' : '') +
            '" data-tab="' +
            t.id +
            '">' +
            t.label +
            '</button>'
          );
        })
        .join('') + arrowHtml;

    panels.innerHTML = tabDefs
      .map(function (t) {
        var on = t.id === state.activeTab;
        return (
          '<div class="cdp-prod__details-panel' +
          (on ? ' is-open' : '') +
          '" data-panel="' +
          t.id +
          '">' +
          (tabsData[t.id] || '') +
          '</div>'
        );
      })
      .join('');

    if (!nav.__cdpBound) {
      nav.__cdpBound = true;
      nav.addEventListener('click', function (e) {
        var btn = e.target.closest('.cdp-prod__tab-btn');
        if (!btn) return;
        state.activeTab = btn.getAttribute('data-tab');
        qsa('.cdp-prod__tab-btn', nav).forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        qsa('.cdp-prod__details-panel', panels).forEach(function (p) {
          p.classList.toggle('is-open', p.getAttribute('data-panel') === state.activeTab);
        });
        updateTabArrow();
      });
    }

    updateTabArrow();
  }

  function updateTabArrow() {
    var nav = qs('#cdpProdDetailsNav');
    var arrow = qs('#cdpProdTabArrow');
    var active = nav && nav.querySelector('.cdp-prod__tab-btn.is-active');
    if (!nav || !arrow || !active) return;
    arrow.style.top = active.offsetTop + 'px';
  }

  function renderSizes(sizes, activeSize) {
    var html = '';
    if (sizes && sizes.length) {
      html = sizes
        .map(function (s) {
          var on = s === activeSize;
          return (
            '<button type="button" class="cdp-prod__size' +
            (on ? ' is-active' : '') +
            (!state.available ? ' is-disabled' : '') +
            '" data-size="' +
            escapeHtml(s) +
            '">' +
            escapeHtml(s) +
            '</button>'
          );
        })
        .join('');
    }

    var box = qs('#cdpProdSizes');
    if (box) {
      if (!sizes || !sizes.length) {
        box.hidden = true;
        box.innerHTML = '';
      } else {
        box.hidden = false;
        box.innerHTML = html;
      }
    }
  }

  function renderColors(colors, activeColor) {
    var box = qs('#cdpProdColors') || qs('.cdp-prod__colors');
    if (!box) return;

    if (box.getAttribute('data-cdp-colors')) return;

    if (!colors || !colors.length) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }

    box.hidden = false;
    box.innerHTML = colors
      .map(function (c) {
        var on = c === activeColor;
        var key = swatchKey(c);
        var style = swatchStyle(c);
        return (
          '<button type="button" class="cdp-prod__swatch' +
          (on ? ' is-active' : '') +
          '" data-color="' +
          escapeHtml(key) +
          '" data-value="' +
          escapeHtml(c) +
          '" title="' +
          escapeHtml(c) +
          '" aria-label="' +
          escapeHtml(c) +
          '" style="' +
          escapeHtml(style) +
          '"></button>'
        );
      })
      .join('');
  }

  function bindVariantClicks() {
    if (root.__cdpVariantBound) return;
    root.__cdpVariantBound = true;

    document.addEventListener('click', function (e) {
      var sizeBtn = e.target.closest('.cdp-prod__size');
      if (!sizeBtn) return;
      if (!root.contains(sizeBtn)) return;
      if (sizeBtn.classList.contains('is-disabled')) return;

      state.activeSize = sizeBtn.getAttribute('data-size') || '';
      qsa('.cdp-prod__size', root).forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-size') === state.activeSize);
      });
      pickNativeVariant('size', state.activeSize);
    });

    root.addEventListener('click', function (e) {
      var swatch = e.target.closest('.cdp-prod__swatch');
      if (swatch && root.contains(swatch)) {
        if (swatch.getAttribute('data-variant-url')) return;
        state.activeColor = swatch.getAttribute('data-value') || '';
        qsa('.cdp-prod__swatch', qs('#cdpProdColors') || qs('.cdp-prod__colors')).forEach(function (b) {
          b.classList.toggle('is-active', b === swatch);
        });
        pickNativeVariant('color', state.activeColor);
      }
    });
  }

  function updateBuyButton() {
    var btn = qs('#cdpProdBuy');
    if (!btn) return;
    var txt = btn.querySelector('span') || btn;
    var prod = window.__cdpProd;
    var price = resolvePrice(prod);
    var canBuy = state.available && (isFinite(price) || !!findNativeBuyBtn());
    if (canBuy) {
      btn.classList.remove('is-notify');
      txt.textContent = CFG.buyTitle;
      btn.removeAttribute('aria-disabled');
    } else {
      btn.classList.add('is-notify');
      txt.textContent = CFG.notifyTitle;
      if (!state.available) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    }
  }

  function tabsFromProduct(prod) {
    if (!prod) return null;
    if (prod.tabs && prod.tabs.length) return normalizeTildaTabs(prod.tabs, prod);
    if (prod.json_tabs) {
      try {
        return normalizeTildaTabs(JSON.parse(prod.json_tabs), prod);
      } catch (e) {}
    }
    return null;
  }

  function applyProduct(prod) {
    if (!prod) return;
    window.__cdpProd = prod;

    state.productUid = String(prod.uid || state.productUid || '');
    state.available = isProductAvailable(prod);
    CFG.currency = detectCurrencyFromProd(prod);

    if (card) {
      card.setAttribute('data-product-gen-uid', state.productUid);
      if (prod.url) {
        card.setAttribute('data-product-url', prod.url);
        var mediaLink = qs('.cdp-prod__media-link');
        var nameLink = qs('.cdp-prod__name');
        var pretty = normalizeProductUrl(prod.url);
        if (mediaLink) mediaLink.setAttribute('href', pretty);
        if (nameLink) nameLink.setAttribute('href', pretty);
      }
    }

    var titleEl = qs('.js-store-prod-name');
    var title = String(prod.title || '').trim();
    if (titleEl) titleEl.textContent = title;

    var h1 = qs('.cdp-prod__title');
    if (h1) h1.textContent = title.toUpperCase();

    var price = resolvePrice(prod);
    var priceEl = qs('.js-store-prod-price-val');
    if (priceEl && isFinite(price)) {
      priceEl.textContent = fmtPrice(price, CFG.currency);
      priceEl.setAttribute('data-product-price-def', String(price));
    }

    var displayPrice = qs('#cdpProdPrice');
    if (displayPrice) {
      if (isFinite(price)) displayPrice.textContent = fmtPrice(price, CFG.currency);
      else displayPrice.textContent = '';
    }

    state.gallery = parseGallery(prod.gallery);
    if (!state.gallery.length) {
      var imgs = galleryFromNativeDom();
      if (imgs.length) state.gallery = imgs;
    }
    renderGallery(state.gallery);

    var modelNote = String(prod.text || prod.descr || '').trim();
    var noteEl = qs('#cdpProdModelNote');
    if (noteEl) setRichHtml(noteEl, modelNote);

    var fromProd = tabsFromProduct(prod);
    if (fromProd) {
      applyTabsResult(fromProd);
    } else {
      state.activeTab = CFG.tabs[0].id;
      renderTabsContent(CFG.tabs, parseDetailsFromText(String(prod.text || '')));
      if (state.productUid) loadProductTabs(state.productUid, prod);
    }

    var skuEl = qs('.js-store-prod-sku');
    if (skuEl && prod.sku) skuEl.textContent = String(prod.sku);

    applyVariants(prod);
    try {
      document.dispatchEvent(new CustomEvent('cdp-prod-ready'));
    } catch (e) {}
    updateBuyButton();

    if (CFG.pageTitleBrand && title) document.title = title + ' | ' + CFG.pageTitleBrand;

    setStatus('');
    root.setAttribute('aria-busy', 'false');
    state.loaded = true;

    syncStoreCart(state.productUid);
  }

  function applyDemo(key) {
    var d = DEMO[key] || DEMO.charlotte;
    if (!d) return;

    state.available = d.available !== false;
    state.demoMode = key;

    var h1 = qs('.cdp-prod__title');
    if (h1) h1.textContent = d.title;

    var titleEl = qs('.js-store-prod-name');
    if (titleEl) titleEl.textContent = d.title;

    var displayPrice = qs('#cdpProdPrice');
    if (displayPrice) displayPrice.textContent = fmtPrice(d.price, d.currency);

    var note = qs('#cdpProdModelNote');
    if (note) note.textContent = d.modelNote || '';

    renderGallery(d.gallery);
    state.activeSize = 'S';
    state.activeColor = (d.colors && d.colors[0]) || 'Black';
    state.activeTab = CFG.tabs[0].id;
    renderTabsContent(CFG.tabs, d.tabs);
    renderSizes(d.sizes, state.activeSize);
    renderColors(d.colors || ['Black'], state.activeColor);
    updateBuyButton();

    root.setAttribute('aria-busy', 'false');
    state.loaded = true;
    setStatus('');
  }

  function tryFallbackProduct(uid) {
    var prod = productFromStoreObj(uid) || productFromPageInline(uid);
    if (prod) {
      applyProduct(prod);
      return true;
    }
    var imgs = galleryFromNativeDom();
    if (imgs.length) {
      renderGallery(imgs);
      setStatus('');
      root.setAttribute('aria-busy', 'false');
      return true;
    }
    if (root.getAttribute('data-demo')) {
      applyDemo(root.getAttribute('data-demo'));
      return true;
    }
    return false;
  }

  function waitForStoreProduct(uid, attempt) {
    attempt = attempt || 0;
    if (tryFallbackProduct(uid)) return;
    if (attempt >= 25) return;
    setTimeout(function () {
      waitForStoreProduct(uid, attempt + 1);
    }, 200);
  }

  function loadProductViaApi() {
    if (state.demoMode) {
      applyDemo(state.demoMode);
      return;
    }

    var uid = resolveProductUid();
    if (!uid) {
      if (root.getAttribute('data-demo')) {
        applyDemo(root.getAttribute('data-demo'));
        return;
      }
      setStatus('Укажите data-product-gen-uid или откройте /tproduct/…');
      root.setAttribute('aria-busy', 'false');
      return;
    }

    setStatus('Загрузка…');
    fetchProductByUid(uid)
      .then(function (prod) {
        if (!prod) throw new Error('Товар не найден');
        applyProduct(prod);
      })
      .catch(function (err) {
        console.error('[cdp-prod]', err);
        if (!tryFallbackProduct(uid)) {
          setStatus('Не удалось загрузить: ' + (err && err.message ? err.message : 'ошибка'));
          root.setAttribute('aria-busy', 'false');
        }
        waitForStoreProduct(uid);
      });
  }

  function storeRecId() {
    var own = getRecId();
    if (own) return own;
    var assets = document.getElementById('cdpProdAssets');
    if (assets) {
      var rec = assets.closest('[id^="rec"]');
      if (rec && rec.id) return rec.id.replace(/^rec/, '');
    }
    var attr = String(root.getAttribute('data-native-rec') || CFG.nativeRec || '').trim();
    if (/^\d+$/.test(attr)) return attr;
    return findStoreRecId();
  }

  function storeControlsReady() {
    var wrap = nativeControlsWrap() || qs('.js-product-controls-wrapper');
    return !!(
      wrap &&
      wrap.querySelector('select, .t-product__option, .js-product-edition-option, .js-product-option, .t-store__prod-popup__btn')
    );
  }

  function afterStoreReady(recId) {
    enableNativeBuyBtn();
    syncVariantsToNative();
    document.documentElement.classList.add('cdp-prod-store-ready');
    if (typeof window.t_prod__init === 'function') {
      try {
        t_prod__init(recId);
      } catch (e) {}
    }
    bindBuyButton();
    updateBuyButton();
    waitForStoreTabs(state.productUid, window.__cdpProd);
    if (window.__cdpProd) applyVariants(window.__cdpProd);
  }

  function hookPageStoreInit() {
    if (document.documentElement.__cdpStoreHooked) return;
    document.documentElement.__cdpStoreHooked = true;

    var runAfterNative = function () {
      var recId = findProductStoreRec() || findStoreRecId() || storeRecId();
      setTimeout(function () {
        afterStoreReady(recId);
        var uid = resolveProductUid();
        if (uid && !state.loaded) {
          var prod = productFromStoreObj(uid) || productFromPageInline(uid);
          if (prod) applyProduct(prod);
        } else if (state.loaded && window.__cdpProd) {
          updateBuyButton();
        }
      }, 120);
    };

    if (typeof window.t_onFuncLoad === 'function') {
      t_onFuncLoad('t_store_productInit', runAfterNative);
    }
    setTimeout(runAfterNative, 1200);
  }

  function waitForStoreControls(recId, attempt) {
    attempt = attempt || 0;
    if (storeControlsReady() || attempt >= 40) {
      afterStoreReady(recId);
      return;
    }
    setTimeout(function () {
      waitForStoreControls(recId, attempt + 1);
    }, 150);
  }

  function ensureStoreLibs() {
    if (typeof window.t_store_oneProduct_init === 'function') return Promise.resolve();
    var urls = [
      'https://static.tildacdn.com/js/tilda-products-1.0.min.js',
      'https://static.tildacdn.com/js/tilda-catalog-1.1.min.js'
    ];
    var chain = Promise.resolve();
    urls.forEach(function (url) {
      chain = chain.then(function () {
        return new Promise(function (res, rej) {
          var s = document.createElement('script');
          s.src = url;
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      });
    });
    return chain;
  }

  function findStoreRecId() {
    var productRec = findProductStoreRec();
    if (productRec) return productRec;

    var allrecords = document.getElementById('allrecords');
    var nodes = document.querySelectorAll(
      '[data-record-type="786"], [data-record-type="744"], [data-record-type="200"], .t-store'
    );
    for (var i = 0; i < nodes.length; i++) {
      var rec = nodes[i].closest('[id^="rec"]');
      if (!rec || !rec.id || (root && rec.contains(root))) continue;
      if (allrecords && !allrecords.contains(rec)) continue;
      return rec.id.replace(/^rec/, '');
    }
    nodes = document.querySelectorAll('.js-store-product_single, .js-product-single');
    for (var j = 0; j < nodes.length; j++) {
      if (root.contains(nodes[j])) continue;
      var rec2 = nodes[j].closest('[id^="rec"]');
      if (rec2 && rec2.id) return rec2.id.replace(/^rec/, '');
    }
    return '';
  }

  function findNativeBuyBtn() {
    var scopes = [];
    var native = nativeStoreProduct();
    if (native) scopes.push(native);
    var snippet = document.querySelector('#allrecords .t-store__prod-snippet__container');
    if (snippet) scopes.push(snippet);
    scopes.push(document);

    var sels = [
      '.t-store__prod-popup__btn[href^="#order"]',
      '.t744__btn[href^="#order"]',
      'a[href^="#order"].t-store__prod-popup__btn',
      '.t-store__prod-popup__btn-wrapper a[href^="#order"]',
      '.js-store-product:not(.js-store-product_single) a[href^="#order"]'
    ];

    for (var si = 0; si < scopes.length; si++) {
      for (var sj = 0; sj < sels.length; sj++) {
        var nodes = scopes[si].querySelectorAll(sels[sj]);
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (node.id === 'cdpProdBuy' || node.getAttribute('data-cdp-buy')) continue;
          if (root && root.contains(node)) continue;
          return node;
        }
      }
    }
    return null;
  }

  function enableNativeBuyBtn() {
    var btn = findNativeBuyBtn();
    if (btn) btn.classList.remove('t-store__prod-popup__btn_disabled');
  }

  function handleBuyClick(e) {
    if (!state.available || e.currentTarget.classList.contains('is-notify')) return;
    e.preventDefault();
    syncVariantsToNative();
    enableNativeBuyBtn();
    var nativeBtn = findNativeBuyBtn();
    if (nativeBtn) {
      nativeBtn.click();
      return;
    }
    console.warn('[cdp-prod] Не найдена штатная кнопка #order в блоке Tilda Store.');
  }

  function bindBuyButton() {
    var buy = root && root.querySelector('#cdpProdBuy');
    if (!buy || buy.__cdpBuyBound) return;
    buy.__cdpBuyBound = true;
    buy.addEventListener('click', handleBuyClick);
  }

  function bindRichTextLinks() {
    if (!root || root.__cdpRichBound) return;
    root.__cdpRichBound = true;
    root.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link || !root.contains(link)) return;
      var href = String(link.getAttribute('href') || '').trim();
      if (!href || href.charAt(0) === '#') return;
      if (/^https?:\/\//i.test(href) || href.charAt(0) === '/') return;
      link.setAttribute('href', '/' + href.replace(/^\/+/, ''));
    });
  }

  function waitForNativeStoreReady(recId, attempt) {
    attempt = attempt || 0;
    if (findNativeBuyBtn() || storeControlsReady() || attempt >= 80) {
      afterStoreReady(recId);
      return;
    }
    setTimeout(function () {
      waitForNativeStoreReady(recId, attempt + 1);
    }, 200);
  }

  function syncStoreCart(uid) {
    if (!uid || state.demoMode) return;
    state.productUid = uid;
    if (card) card.setAttribute('data-product-gen-uid', uid);

    hookPageStoreInit();

    var recId = findProductStoreRec() || findStoreRecId() || storeRecId();
    if (!recId) {
      bindBuyButton();
      return;
    }
    state.apiRecId = recId;

    if (isPopupProductPage()) {
      waitForNativeStoreReady(recId);
      return;
    }

    setTimeout(function () {
      ensureStoreLibs()
        .then(function () {
          var opts = { storeprod: uid, previewmode: 'yes', buyBtnTitle: CFG.buyTitle };
          var run = function () {
            try {
              t_store_oneProduct_init(recId, opts);
            } catch (e) {
              console.warn('[cdp-prod] store init', e);
            }
            waitForStoreControls(recId);
          };
          if (typeof window.t_onFuncLoad === 'function') t_onFuncLoad('t_store_oneProduct_init', run);
          else if (typeof window.t_store_oneProduct_init === 'function') run();
          else waitForNativeStoreReady(recId);
        })
        .catch(function (e) {
          console.warn('[cdp-prod] store libs', e);
          waitForNativeStoreReady(recId);
        });
    }, 80);
  }

  function runBoot() {
    if (!document.documentElement.__cdpUrlBound) {
      document.documentElement.__cdpUrlBound = true;
      document.addEventListener('click', onProductLinkClick, true);
    }
    syncProductUrl();
    setTimeout(syncProductUrl, 600);
    setTimeout(syncProductUrl, 1800);
    bindBuyButton();
    bindGalleryScroll();
    bindStickyBuy();
    bindVariantClicks();
    bindRichTextLinks();
    hookPageStoreInit();
    readVariantFromUrl();
    loadProductViaApi();
  }

  function boot(attempt) {
    attempt = attempt || 0;
    try {
      if (document.documentElement.__cdpProdBoot) return;
      if (!setupPageRoot()) {
        if (attempt < 50 && isCdpProductScope() && document.getElementById('cdpProdPageTpl')) {
          setTimeout(function () {
            boot(attempt + 1);
          }, 100);
        }
        return;
      }
      document.documentElement.__cdpProdBoot = true;
      runBoot();
    } catch (e) {
      console.error('[cdp-prod] boot', e);
      if (root) setStatus('Ошибка инициализации карточки');
    }
  }

  if (typeof window.t_onReady === 'function') window.t_onReady(function () { boot(0); });
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(0); });
  else boot(0);
})();
