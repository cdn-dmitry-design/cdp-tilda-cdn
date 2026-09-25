(function () {
  var CFG = {
    storepart: '618946506333',
    nativeRec: '',
    api: 'https://store.tildaapi.com/api/getproductslist/',
    pageSize: 100,
    perPage: 5,
    currency: 'auto',
    title: 'Shop',
    urlPrefix: '/cdp',
    badgeNew: 'New',
    bagIcon: 'https://static.tildacdn.com/tild3261-6363-4433-b539-376234623331/Frame.svg',
    screens: { 767: 2, 999: 3, 1199: 4, 9999: 5 },
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
      navy: '#1c2841'
    }
  };

  var DEMO = [
    { uid: 'demo-1', url: '#', title: 'CHARLOTTE WIDE LEG PLEAT PANT', price: 159, mark: 'New', img: 'https://cdp.world/cdn/shop/files/CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-01.png?v=1749806077&width=800', img2: '', sizes: ['S', 'M'], colors: ['Black'] },
    { uid: 'demo-2', url: '#', title: 'ANNA LONG SLEEVE BASIC KNIT TOP', price: 79, mark: 'New', img: 'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-03.png?v=1751868238&width=800', sizes: ['S/M'], colors: ['Black'] },
    { uid: 'demo-3', url: '#', title: 'SOPHIE BASIC SLEEVELESS TANK', price: 49, mark: 'New', img: 'https://cdp.world/cdn/shop/files/CDP16937-CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-04.png?v=1751868238&width=800', sizes: ['S'], colors: ['Black'] },
    { uid: 'demo-4', url: '#', title: 'CLEO HALTER TIE MIDI DRESS', price: 119, mark: 'New', img: 'https://cdp.world/cdn/shop/files/CHARLOTTE-WIDE-LEG-PLEAT-PANT-BLACK-02.png?v=1751868238&width=800', sizes: ['M'], colors: ['Black'] },
    { uid: 'demo-5', url: '#', title: 'ZOE LONG SLEEVE COTTON SHIRT', price: 119, mark: 'New', img: 'https://cdp.world/cdn/shop/files/CDP16937-Black-GM-Front_860a8bb3-d608-4b22-8b0e-2844d3bafe93.png?v=1751868236&width=800', sizes: ['L'], colors: ['Black'] }
  ];

  var root;
  var state = { items: [], page: 1, perPage: CFG.perPage, demo: false, viewMode: 'model' };
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

  function buildVariantUrl(href, size, color) {
    var base = String(href || '#').split('?')[0].split('#')[0];
    var params = [];
    if (size) params.push('size=' + encodeURIComponent(size));
    if (color) params.push('color=' + encodeURIComponent(color));
    if (!params.length) return href || '#';
    return base + '?' + params.join('&');
  }

  function navigateToProduct(href, size, color) {
    var url = buildVariantUrl(href, size, color);
    var seg = tproductSegment(url);
    if (seg) {
      var query = url.indexOf('?') >= 0 ? url.slice(url.indexOf('?')) : '';
      location.assign(seg + query);
      return;
    }
    location.assign(url);
  }

  function normalizeProductUrl(url) {
    var seg = tproductSegment(url);
    if (!seg) return url || '#';
    return prefixedProductPath(url);
  }

  function onCatalogLinkClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="tproduct"]') : null;
    if (!a || e.defaultPrevented) return;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href') || '';
    var seg = tproductSegment(href);
    if (!seg) return;
    var pretty = prefixedProductPath(href);
    if (normPath(href.split('?')[0].split('#')[0]) === pretty) {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      location.assign(seg + (href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')) : ''));
    }
  }

  function patchCatalogLinks() {
    qsa('a[href*="tproduct"]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var next = normalizeProductUrl(href);
      if (next && next !== href) a.setAttribute('href', next);
    });
  }

  function qs(sel, el) {
    return (el || root).querySelector(sel);
  }

  function qsa(sel, el) {
    return Array.prototype.slice.call((el || root || document).querySelectorAll(sel));
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

  function escapeHtml(t) {
    return String(t || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function num(v) {
    if (v == null) return NaN;
    var s = String(v).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(',', '.');
    return parseFloat(s.replace(/[^\d.-]/g, ''));
  }

  function fmtPrice(n, currency) {
    n = Number(n);
    if (!isFinite(n)) return '';
    if (currency === '$') return '$' + n.toFixed(2);
    if (currency === '₽') return Math.round(n).toLocaleString('ru-RU') + ' ₽';
    if (n >= 1000) return Math.round(n).toLocaleString('ru-RU') + ' ₽';
    return '$' + n.toFixed(2);
  }

  function detectCurrency(items) {
    if (CFG.currency === '$' || CFG.currency === '₽') return CFG.currency;
    var curEl = document.querySelector(
      '.t-store__prod-popup__price-currency, .js-store-prod-price .t-store__prod-popup__price-currency, .t706__cartwin-prodamount-currency'
    );
    if (curEl && /₽|руб/i.test(curEl.textContent || '')) return '₽';
    for (var i = 0; i < items.length; i++) {
      var p = num(items[i].price);
      if (p >= 500) return '₽';
    }
    return '$';
  }

  function priceFromCharacteristics(raw) {
    var chars = raw;
    if (typeof raw === 'string') {
      try {
        chars = JSON.parse(raw);
      } catch (e) {
        return NaN;
      }
    }
    if (!Array.isArray(chars)) return NaN;
    for (var i = 0; i < chars.length; i++) {
      var title = String((chars[i] && chars[i].title) || '').toLowerCase();
      if (!/price|цена|стоимость|cost/.test(title)) continue;
      var price = num(chars[i].value);
      if (isFinite(price) && price > 0) return price;
    }
    return NaN;
  }

  function resolvePriceFromProduct(p) {
    if (!p) return NaN;
    var fields = [p.price, p.price_min, p.price_max, p.priceold];
    for (var i = 0; i < fields.length; i++) {
      var price = num(fields[i]);
      if (isFinite(price) && price > 0) return price;
    }
    var editions = parseEditions(p.editions);
    for (var j = 0; j < editions.length; j++) {
      price = num(editions[j].price);
      if (isFinite(price) && price > 0) return price;
      price = num(editions[j].priceold);
      if (isFinite(price) && price > 0) return price;
    }
    price = priceFromCharacteristics(p.characteristics);
    if (isFinite(price)) return price;
    return priceFromCharacteristics(p.json_chars);
  }

  function collectStorePoolPrices() {
    var map = {};
    [window.tStoreSingleProdsObj, window.tStoreProductsObj, window.tStoreProdsObj].forEach(function (pool) {
      if (!pool) return;
      Object.keys(pool).forEach(function (uid) {
        var price = resolvePriceFromProduct(pool[uid]);
        if (isFinite(price) && price > 0) map[String(uid)] = price;
      });
    });
    return map;
  }

  function collectPricesFromInlineScripts() {
    var map = {};
    document.querySelectorAll('script').forEach(function (script) {
      var code = script.textContent || '';
      if (code.indexOf('"uid"') === -1 || code.indexOf('"price"') === -1) return;
      var single = code.match(/var\s+product\s*=\s*(\{[\s\S]*?\});/);
      if (single) {
        try {
          var prod = JSON.parse(single[1]);
          var price = resolvePriceFromProduct(prod);
          if (prod.uid && isFinite(price)) map[String(prod.uid)] = price;
        } catch (e) {}
      }
      var listMatch = code.match(/products\s*=\s*(\[[\s\S]*?\]);/);
      if (listMatch) {
        try {
          var list = JSON.parse(listMatch[1]);
          if (Array.isArray(list)) {
            list.forEach(function (prod) {
              var price = resolvePriceFromProduct(prod);
              if (prod && prod.uid && isFinite(price)) map[String(prod.uid)] = price;
            });
          }
        } catch (e2) {}
      }
    });
    return map;
  }

  function refreshNativePrices(skipScripts) {
    var merged = Object.assign({}, collectStorePoolPrices(), collectNativePriceMap());
    if (!skipScripts) merged = Object.assign(merged, collectPricesFromInlineScripts());
    state.nativePrices = Object.assign(merged, state.nativePrices || {});
    return state.nativePrices;
  }

  function productFromStorePools(uid) {
    uid = String(uid || '');
    if (!uid) return null;
    var pools = [window.tStoreSingleProdsObj, window.tStoreProductsObj, window.tStoreProdsObj];
    for (var i = 0; i < pools.length; i++) {
      var pool = pools[i];
      if (pool && pool[uid]) return pool[uid];
    }
    return null;
  }

  function collectNativePriceMap() {
    var map = {};
    document.querySelectorAll('.js-store-product[data-product-uid]').forEach(function (el) {
      if (root && root.contains(el)) return;
      var uid = String(el.getAttribute('data-product-uid') || '').trim();
      if (!uid || map[uid]) return;
      var priceEl = el.querySelector(
        '.js-store-prod-price-val, .t-store__card__price-value, .t-store__card__price .t-store__card__price-value, .js-product-price, .t-store__prod-popup__price-value, [data-product-price-def]'
      );
      var fromAttr = priceEl && priceEl.getAttribute('data-product-price-def');
      var fromStr = priceEl && priceEl.getAttribute('data-product-price-def-str');
      var price = num(fromAttr || fromStr || (priceEl && priceEl.textContent));
      if (!isFinite(price) || price <= 0) {
        var wrap = el.querySelector('.t-store__card__price, .js-store-price-wrapper, .t-store__prod-popup__price');
        if (wrap) price = num(wrap.textContent);
      }
      if (isFinite(price) && price > 0) map[uid] = price;
    });
    return map;
  }

  function enrichItemPrice(item, nativePrices) {
    if (!item) return item;
    if (isFinite(item.price) && item.price > 0) return item;
    if (nativePrices && nativePrices[item.uid]) {
      item.price = nativePrices[item.uid];
      return item;
    }
    var fromPool = productFromStorePools(item.uid);
    if (fromPool) {
      var poolPrice = resolvePriceFromProduct(fromPool);
      if (isFinite(poolPrice)) item.price = poolPrice;
    }
    return item;
  }

  function productApiUrl(uid, rec) {
    return (
      'https://' +
      (window.t_store_endpoint || 'store.tildaapi.com') +
      '/api/getproduct/?productuid=' +
      encodeURIComponent(uid) +
      '&storepartuid=' +
      encodeURIComponent(CFG.storepart) +
      '&recid=' +
      encodeURIComponent(rec || '')
    );
  }

  function enrichMissingPrices(items, nativePrices) {
    var rec = CFG.nativeRec || detectNativeRec();
    items.forEach(function (it) {
      enrichItemPrice(it, nativePrices);
    });
    var missing = items.filter(function (it) {
      return !(isFinite(it.price) && it.price > 0);
    }).slice(0, 4);
    if (!missing.length) return Promise.resolve(items);
    return Promise.all(
      missing.map(function (it) {
        return apiFetch(productApiUrl(it.uid, rec))
          .then(function (data) {
            var p = data && (data.product || data);
            var price = resolvePriceFromProduct(p);
            if (isFinite(price)) it.price = price;
          })
          .catch(function () {});
      })
    ).then(function () {
      return items;
    });
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

  function parseEditions(raw) {
    try {
      var e = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(e) ? e : [];
    } catch (err) {
      return [];
    }
  }

  function isOptionKey(key) {
    return !/^(uid|price|priceold|sku|quantity|img|externalid)$/i.test(key);
  }

  function isSizeKey(key) {
    return /размер|size|размерный|рост/i.test(String(key || ''));
  }

  function isColorKey(key) {
    return /цвет|color|colour|colourway/i.test(String(key || ''));
  }

  function swatchKey(name) {
    var s = String(name || '')
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/gi, '');
    if (/black|черн|чёрн/.test(s)) return 'black';
    if (/white|бел/.test(s)) return 'white';
    if (/tan|беж/.test(s)) return 'tan';
    if (/beige/.test(s)) return 'beige';
    if (/brown|корич/.test(s)) return 'brown';
    if (/grey|gray|сер/.test(s)) return 'grey';
    if (/navy/.test(s)) return 'navy';
    if (/red|крас/.test(s)) return 'red';
    if (/blue|син/.test(s)) return 'blue';
    if (/green|зел/.test(s)) return 'green';
    if (/pink|роз/.test(s)) return 'pink';
    return s.slice(0, 12) || 'color';
  }

  function swatchStyle(name) {
    var key = swatchKey(name);
    var hex = CFG.swatch[key];
    if (!hex) return '';
    return 'background:' + hex + ';--cdp-swatch-color:' + hex;
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

  function extractFromCharacteristics(chars) {
    var sizes = [];
    var colors = [];
    (chars || []).forEach(function (c) {
      if (!c) return;
      var t = String(c.title || '');
      var v = String(c.value || '').trim();
      if (!v) return;
      if (isSizeKey(t)) sizes.push(v);
      if (isColorKey(t)) colors.push(v);
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

  function uniqueList(list) {
    var seen = {};
    var out = [];
    (list || []).forEach(function (v) {
      v = String(v || '').trim();
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out;
  }

  function cleanTitle(title) {
    return String(title || '')
      .replace(/\s*-\s*(black|white|tan|brown|beige)$/i, '')
      .trim();
  }

  function catalogImages(gallery) {
    if (!gallery.length) return { model: '', product: '', productAlt: '' };
    var model = gallery[0];
    var product = gallery[gallery.length - 1];
    var productAlt = '';
    if (gallery.length > 1) {
      productAlt = gallery.length > 2 ? gallery[gallery.length - 2] : gallery[0];
      if (productAlt === product) productAlt = gallery[0];
    }
    return { model: model, product: product, productAlt: productAlt };
  }

  function cardDisplayImages(it) {
    if (state.viewMode === 'product') {
      return {
        img: it.imgProduct || it.imgModel || it.img || '',
        img2: it.imgProductAlt || ''
      };
    }
    return {
      img: it.imgModel || it.img || '',
      img2: it.imgModelAlt || it.img2 || ''
    };
  }

  function normalizeProduct(p) {
    var gallery = parseGallery(p.gallery);
    var editions = parseEditions(p.editions);
    var fromEd = extractFromEditions(editions);
    var fromOpt = extractFromJsonOptions(p.json_options);
    var chars = [];
    try {
      chars = typeof p.characteristics === 'string' ? JSON.parse(p.characteristics) : p.characteristics || [];
    } catch (e) {}
    if (!chars.length && p.json_chars) {
      try {
        chars = JSON.parse(p.json_chars);
      } catch (e2) {}
    }
    var fromCh = extractFromCharacteristics(chars);
    var sizes = uniqueList(
      fromEd.sizes.length ? fromEd.sizes : fromOpt.sizes.length ? fromOpt.sizes : fromCh.sizes
    );
    var colors = uniqueList(
      fromEd.colors.length ? fromEd.colors : fromOpt.colors.length ? fromOpt.colors : fromCh.colors
    );

    var imgs = catalogImages(gallery);
    var img = imgs.model;
    if (!img && editions[0] && editions[0].img) img = editions[0].img;

    var price = resolvePriceFromProduct(p);

    var mark = String(p.mark || '').trim();
    var badge = /new|нов/i.test(mark) ? CFG.badgeNew : mark.split(',')[0] || '';

    return {
      uid: String(p.uid || ''),
      url: normalizeProductUrl(p.url || '#product' + (p.uid || '')),
      title: cleanTitle(p.title).toUpperCase(),
      price: price,
      mark: badge,
      img: img,
      img2: gallery[1] || '',
      imgModel: imgs.model || img,
      imgModelAlt: gallery[1] || '',
      imgProduct: imgs.product || img,
      imgProductAlt: imgs.productAlt,
      sizes: sizes,
      colors: colors
    };
  }

  var CACHE_TTL = 5 * 60 * 1000;

  function cacheKey() {
    return 'cdpCat_' + CFG.storepart + '_' + (CFG.nativeRec || '0');
  }

  function getCacheAge() {
    try {
      var raw = sessionStorage.getItem(cacheKey());
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && data.t ? Date.now() - data.t : null;
    } catch (e) {
      return null;
    }
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(cacheKey());
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.t || Date.now() - data.t > CACHE_TTL || !Array.isArray(data.products)) return null;
      return data.products;
    } catch (e) {
      return null;
    }
  }

  function readStaleCache() {
    try {
      var raw = sessionStorage.getItem(cacheKey());
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && Array.isArray(data.products) && data.products.length ? data.products : null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(products) {
    try {
      sessionStorage.setItem(cacheKey(), JSON.stringify({ t: Date.now(), products: products }));
    } catch (e) {}
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

  function listApiUrl(rec, slice) {
    var params = {
      storepartuid: CFG.storepart,
      recid: rec || '',
      size: CFG.pageSize,
      slice: slice || 1
    };
    var allrecords = document.getElementById('allrecords');
    if (!isPublishedPage() && allrecords) {
      params.projectid = allrecords.getAttribute('data-tilda-project-id') || '';
      var host = window.location.hostname.split('.');
      return (
        'https://tilda.' +
        host[host.length - 1] +
        '/projects/store/getproductslist/?' +
        serializeParams(params)
      );
    }
    var endpoint = window.t_store_endpoint || 'store.tildaapi.com';
    return 'https://' + endpoint + '/api/getproductslist/?' + serializeParams(params);
  }

  function apiFetch(url) {
    return fetch(url, { credentials: 'omit', cache: 'default' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().then(function (data) {
        if (!data) throw new Error('empty');
        if (typeof data === 'string' && data.indexOf('ERROR:') === 0) throw new Error(String(data).slice(0, 160));
        return data;
      });
    });
  }

  function isCartRec(rec) {
    if (!rec) return false;
    if (rec.id === 'rec3509649301') return true;
    return !!(rec.querySelector('.t706, [data-record-type="706"]') || rec.classList.contains('t706'));
  }

  function hideNativeStoreBlocks() {
    document.querySelectorAll('[id^="rec"]').forEach(function (rec) {
      if (!rec.id || rec.contains(root) || isCartRec(rec)) return;
      if (rec.querySelector('.js-store-grid-cont, .t-store__grid-cont, .js-store')) {
        rec.setAttribute('data-cdp-native-hidden', '1');
      }
    });
  }

  function getPerPage() {
    var w = window.innerWidth || 1200;
    var keys = Object.keys(CFG.screens)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    for (var i = 0; i < keys.length; i++) {
      if (w <= keys[i]) return CFG.screens[keys[i]];
    }
    return CFG.perPage;
  }

  function totalPages() {
    var per = state.perPage || CFG.perPage;
    return Math.max(1, Math.ceil(state.items.length / per));
  }

  function renderPager() {
    var box = qs('.cdp-cat__pager');
    if (box) box.innerHTML = '';
  }

  function colorsHTML(colors, uid) {
    if (!colors || !colors.length) return '';
    return colors
      .map(function (c, i) {
        var key = swatchKey(c);
        var style = swatchStyle(c);
        return (
          '<button type="button" class="cdp-cat__swatch' +
          (i === 0 ? ' is-active' : '') +
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

  function sizesHTML(sizes) {
    if (!sizes || !sizes.length) return '';
    return sizes
      .map(function (s, i) {
        return (
          '<button type="button" class="cdp-cat__size' +
          (i === 0 ? ' is-active' : '') +
          '" data-size="' +
          escapeHtml(s) +
          '">' +
          escapeHtml(s) +
          '</button>'
        );
      })
      .join('');
  }

  function bagHTML(url, extraClass) {
    return (
      '<a class="cdp-cat__bag' +
      (extraClass || '') +
      '" href="' +
      escapeHtml(url) +
      '" aria-label="View product">' +
      '<img src="' +
      escapeHtml(CFG.bagIcon) +
      '" alt="" width="16" height="16" loading="lazy" decoding="async">' +
      '</a>'
    );
  }

  var fitSizesRaf = 0;

  function fitCardSizes() {
    if (!root) return;
    var isMobile = window.matchMedia('(max-width: 999px)').matches;

    root.querySelectorAll('.cdp-cat__card').forEach(function (card) {
      var body = card.querySelector('.cdp-cat__body');
      var box = card.querySelector('.cdp-cat__sizes');
      if (!body || !box || !box.children.length) return;

      if (isMobile) {
        box.hidden = true;
        card.classList.add('is-sizes-hidden');
        return;
      }

      box.hidden = false;
      card.classList.remove('is-sizes-hidden');

      var available = body.clientWidth - 4;

      if (available <= 0 || box.scrollWidth > available) {
        box.hidden = true;
        card.classList.add('is-sizes-hidden');
      }
    });
  }

  function scheduleFitCardSizes() {
    if (fitSizesRaf) cancelAnimationFrame(fitSizesRaf);
    fitSizesRaf = requestAnimationFrame(function () {
      fitSizesRaf = 0;
      fitCardSizes();
    });
  }

  function cardHTML(it, currency, idx) {
    var alt = escapeHtml(it.title);
    var display = cardDisplayImages(it);
    var primary = display.img;
    var secondary = display.img2;
    var isProduct = state.viewMode === 'product';
    var eager = idx < 8;
    var imgs = '';
    if (primary) {
      imgs =
        '<div class="cdp-cat__imgs">' +
        '<img class="cdp-cat__img is-primary' +
        (secondary ? ' has-alt' : '') +
        '" src="' +
        escapeHtml(primary) +
        '" alt="' +
        alt +
        '" loading="' +
        (eager || isProduct ? 'eager' : 'lazy') +
        '">';
      if (secondary) {
        imgs +=
          '<img class="cdp-cat__img is-alt" src="' +
          escapeHtml(secondary) +
          '" alt="" loading="' +
          (eager || isProduct ? 'eager' : 'lazy') +
          '" aria-hidden="true">';
      }
      imgs += '</div>';
    }
    var badge = it.mark ? '<span class="cdp-cat__badge">' + escapeHtml(it.mark) + '</span>' : '';
    return (
      '<article class="cdp-cat__card" data-uid="' +
      escapeHtml(it.uid) +
      '">' +
      '<div class="cdp-cat__media">' +
      '<a class="cdp-cat__media-link" href="' +
      escapeHtml(it.url) +
      '">' +
      badge +
      imgs +
      '</a>' +
      '<div class="cdp-cat__colors"></div>' +
      '</div>' +
      '<div class="cdp-cat__body">' +
      '<div class="cdp-cat__top">' +
      '<a class="cdp-cat__name" href="' +
      escapeHtml(it.url) +
      '">' +
      alt +
      '</a>' +
      '<span class="cdp-cat__price">' +
      escapeHtml(fmtPrice(it.price, currency)) +
      '</span>' +
      '</div>' +
      '<div class="cdp-cat__sizes">' +
      sizesHTML(it.sizes) +
      '</div>' +
      '<div class="cdp-cat__foot">' +
      bagHTML(it.url, ' cdp-cat__bag--mob') +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function patchGridPrices(currency) {
    state.items.forEach(function (it) {
      if (!(isFinite(it.price) && it.price > 0)) return;
      var card = root.querySelector('.cdp-cat__card[data-uid="' + it.uid + '"]');
      if (!card) return;
      var priceEl = card.querySelector('.cdp-cat__price');
      if (priceEl) priceEl.textContent = fmtPrice(it.price, currency);
    });
    scheduleFitCardSizes();
  }

  function setStatus(msg) {
    var el = qs('.cdp-cat__status');
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = msg;
  }

  function renderGrid() {
    var grid = qs('.cdp-cat__grid');
    var empty = qs('.cdp-cat__empty');
    if (!grid) return;

    var currency = detectCurrency(state.items);
    var chunk = state.items;

    grid.innerHTML = chunk
      .map(function (it, i) {
        return cardHTML(it, currency, i);
      })
      .join('');

    try {
      patchCatalogLinks();
    } catch (err) {
      console.warn('[cdp-catalog] links', err);
    }

    if (empty) empty.hidden = chunk.length > 0;
    setStatus('');
    root.setAttribute('aria-busy', 'false');

    try {
      document.dispatchEvent(new CustomEvent('cdp-catalog-rendered'));
    } catch (e) {}

    scheduleFitCardSizes();
  }

  function bindCardInteractions() {
    if (root.__cdpCardBound) return;
    root.__cdpCardBound = true;

    root.addEventListener('click', function (e) {
      var card = e.target.closest('.cdp-cat__card');
      var sizeBtn = e.target.closest('.cdp-cat__size');
      if (sizeBtn && card) {
        e.preventDefault();
        var box = sizeBtn.closest('.cdp-cat__sizes');
        if (box) {
          box.querySelectorAll('.cdp-cat__size').forEach(function (btn) {
            btn.classList.toggle('is-active', btn === sizeBtn);
          });
        }
        var link = card.querySelector('.cdp-cat__media-link');
        var colorBtn = card.querySelector('.cdp-cat__swatch.is-active');
        navigateToProduct(
          link ? link.getAttribute('href') || '#' : '#',
          sizeBtn.getAttribute('data-size') || '',
          colorBtn ? colorBtn.getAttribute('data-value') || '' : ''
        );
        return;
      }

      var bagLink = e.target.closest('.cdp-cat__bag');
      if (bagLink && card) {
        e.preventDefault();
        var activeSize = card.querySelector('.cdp-cat__size.is-active');
        var activeColor = card.querySelector('.cdp-cat__swatch.is-active');
        navigateToProduct(
          bagLink.getAttribute('href') || '#',
          activeSize ? activeSize.getAttribute('data-size') || '' : '',
          activeColor ? activeColor.getAttribute('data-value') || '' : ''
        );
        return;
      }

      var prodLink = e.target.closest('.cdp-cat__media-link, .cdp-cat__name');
      if (prodLink && card && !e.target.closest('.cdp-cat__swatch, .cdp-cat__size, .cdp-cat__bag')) {
        e.preventDefault();
        var activeSize = card.querySelector('.cdp-cat__size.is-active');
        var activeColor = card.querySelector('.cdp-cat__swatch.is-active');
        navigateToProduct(
          prodLink.getAttribute('href') || '#',
          activeSize ? activeSize.getAttribute('data-size') || '' : '',
          activeColor ? activeColor.getAttribute('data-value') || '' : ''
        );
        return;
      }

      var swatch = e.target.closest('.cdp-cat__swatch');
      if (swatch) {
        e.preventDefault();
        var card = swatch.closest('.cdp-cat__card');
        if (!card) return;
        var colors = swatch.closest('.cdp-cat__colors');
        if (colors) {
          colors.querySelectorAll('.cdp-cat__swatch').forEach(function (btn) {
            btn.classList.toggle('is-active', btn === swatch);
          });
        }
        var link = card.querySelector('.cdp-cat__media-link');
        var sizeBtn = card.querySelector('.cdp-cat__size.is-active');
        var size = sizeBtn ? sizeBtn.getAttribute('data-size') || '' : '';
        var color = swatch.getAttribute('data-value') || '';
        if (link) navigateToProduct(link.getAttribute('href') || '#', size, color);
        return;
      }

      if (window.matchMedia('(hover: none)').matches) {
        var card = e.target.closest('.cdp-cat__card');
        if (!card || e.target.closest('.cdp-cat__name, .cdp-cat__media-link')) return;
        var open = card.classList.contains('is-touch-open');
        root.querySelectorAll('.cdp-cat__card.is-touch-open').forEach(function (c) {
          c.classList.remove('is-touch-open');
        });
        if (!open) card.classList.add('is-touch-open');
      }
    });
  }

  function muteNativeStore() {
    var recId = CFG.nativeRec || detectNativeRec();
    if (!recId) return;
    var rec = document.getElementById('rec' + recId);
    if (!rec) return;
    rec.setAttribute('data-already-loaded-first-products', 'true');
    var store = rec.querySelector('.js-store');
    if (store) store.setAttribute('data-store-load-products', 'false');
    var grid = rec.querySelector('.js-store-grid-cont');
    if (grid) grid.innerHTML = '';
    var hide = rec.querySelectorAll(
      '.js-store-grid-cont-preloader,.js-store-load-more-btn-container,.t-store__pagination,.js-store-parts-select-container,.t-store__filter'
    );
    hide.forEach(function (el) {
      el.style.display = 'none';
    });
  }

  function detectNativeRec() {
    if (CFG.nativeRec) return CFG.nativeRec;
    var found = '';
    var nodes = document.querySelectorAll('[data-record-type="786"], [data-record-type="200"], .js-store');
    for (var i = 0; i < nodes.length; i++) {
      var rec = nodes[i].closest('[id^="rec"]');
      if (!rec || !rec.id || rec.contains(root)) continue;
      if (rec.querySelector('.js-store-grid-cont, .js-store')) {
        found = rec.id.replace(/^rec/, '');
        break;
      }
    }
    return found;
  }

  function loadAllProducts(slice, acc, rec) {
    slice = slice || 1;
    acc = acc || [];
    rec = rec == null ? CFG.nativeRec || detectNativeRec() : rec;

    return apiFetch(listApiUrl(rec, slice)).then(function (data) {
      var list = (data && data.products) || [];
      acc = acc.concat(list);
      if (list.length >= CFG.pageSize && slice < 3) return loadAllProducts(slice + 1, acc, rec);
      return acc;
    });
  }

  function fetchProductList() {
    var rec = CFG.nativeRec || detectNativeRec();
    return apiFetch(listApiUrl(rec, 1)).then(function (data) {
      var first = (data && data.products) || [];
      if (first.length >= CFG.pageSize) {
        loadAllProducts(2, first.slice(), rec)
          .then(function (all) {
            if (!all || all.length <= first.length) return;
            state._rawProducts = all;
            writeCache(all);
            window.__cdpCatRawProducts = all;
            if (state.items.length) {
              applyProducts(all);
              var currency = detectCurrency(state.items);
              enrichMissingPrices(state.items, state.nativePrices || {}).then(function () {
                patchGridPrices(currency);
              });
            }
          })
          .catch(function () {});
      }
      return first;
    });
  }

  function ensureProductList() {
    if (window.__cdpCatRawProducts && window.__cdpCatRawProducts.length) {
      return Promise.resolve(window.__cdpCatRawProducts);
    }
    var cached = readCache() || readStaleCache();
    if (cached && cached.length) {
      window.__cdpCatRawProducts = cached;
      return Promise.resolve(cached);
    }
    if (window.__cdpCatFetchPromise) return window.__cdpCatFetchPromise;
    window.__cdpCatFetchPromise = fetchProductList()
      .then(function (products) {
        state._rawProducts = products;
        writeCache(products);
        window.__cdpCatRawProducts = products;
        return products;
      })
      .catch(function (err) {
        window.__cdpCatFetchPromise = null;
        throw err;
      });
    return window.__cdpCatFetchPromise;
  }

  function applyProducts(products) {
    state.items = products
      .map(normalizeProduct)
      .filter(function (x) {
        return x.uid && x.title;
      });
    refreshNativePrices(true);
    state.items.forEach(function (it) {
      enrichItemPrice(it, state.nativePrices);
    });
    var needsScripts = state.items.some(function (it) {
      return !(isFinite(it.price) && it.price > 0);
    });
    if (needsScripts) {
      refreshNativePrices(false);
      state.items.forEach(function (it) {
        enrichItemPrice(it, state.nativePrices);
      });
    }
    state.demo = false;
    window.__cdpCatRawProducts = state._rawProducts || state.items;
    renderGrid();
    renderPager();
  }

  function applyDemo() {
    state.items = DEMO.slice();
    state.demo = true;
    state.page = 1;
    setStatus('');
    renderGrid();
    renderPager();
  }

  function loadProducts(tryN, silent) {
    tryN = tryN || 0;
    if (!CFG.storepart) {
      if (root.getAttribute('data-demo') !== null) applyDemo();
      else setStatus('Укажите data-storepart');
      root.setAttribute('aria-busy', 'false');
      return;
    }

    if (!silent) setStatus('Загрузка каталога…');
    var loader = silent ? fetchProductList() : ensureProductList();
    loader
      .then(function (products) {
        state._rawProducts = products;
        writeCache(products);
        window.__cdpCatRawProducts = products;
        if (!products.length) {
          if (root.getAttribute('data-demo') !== null) applyDemo();
          else setStatus('Товаров пока нет');
          root.setAttribute('aria-busy', 'false');
          return;
        }
        if (silent && state.items.length) {
          state.items = products
            .map(normalizeProduct)
            .filter(function (x) {
              return x.uid && x.title;
            });
          refreshNativePrices(true);
          state.items.forEach(function (it) {
            enrichItemPrice(it, state.nativePrices);
          });
          var silentCurrency = detectCurrency(state.items);
          enrichMissingPrices(state.items, state.nativePrices || {}).then(function () {
            patchGridPrices(silentCurrency);
          });
          root.setAttribute('aria-busy', 'false');
          try {
            document.dispatchEvent(new CustomEvent('cdp-catalog-rendered'));
          } catch (e) {}
          return;
        }
        applyProducts(products);
        var currency = detectCurrency(state.items);
        enrichMissingPrices(state.items, state.nativePrices || {}).then(function () {
          patchGridPrices(currency);
        });
      })
      .catch(function (err) {
        console.error('[cdp-catalog]', err);
        if (tryN < 1) {
          setTimeout(function () {
            loadProducts(tryN + 1);
          }, 250);
          return;
        }
        if (root.getAttribute('data-demo') !== null) applyDemo();
        else setStatus('Не удалось загрузить каталог. Добавьте data-native-rec блока Store или data-demo.');
        root.setAttribute('aria-busy', 'false');
      });
  }

  function bindResize() {
    if (root.__cdpResizeBound) return;
    root.__cdpResizeBound = true;
    window.addEventListener('resize', scheduleFitCardSizes);
    try {
      document.fonts.ready.then(scheduleFitCardSizes);
    } catch (e) {}
  }


  function readRootConfig() {
    var sp = String(root.getAttribute('data-storepart') || '').trim();
    if (/^\d{6,}$/.test(sp)) CFG.storepart = sp;

    var rec = String(root.getAttribute('data-native-rec') || root.getAttribute('data-rec') || '').trim();
    if (/^\d+$/.test(rec)) CFG.nativeRec = rec;
    else CFG.nativeRec = detectNativeRec();

    var pp = Number(root.getAttribute('data-per-page'));
    if (pp > 0) CFG.perPage = pp;

    var cur = String(root.getAttribute('data-currency') || '').trim();
    if (cur) CFG.currency = cur;

    var title = String(root.getAttribute('data-title') || '').trim();
    if (title) CFG.title = title;

    var prefix = String(root.getAttribute('data-url-prefix') || '').trim();
    if (prefix) CFG.urlPrefix = prefix.charAt(0) === '/' ? prefix : '/' + prefix;

    var h = qs('.cdp-cat__title');
    if (h) h.textContent = CFG.title;
  }

  function updateViewUI() {
    var isProduct = state.viewMode === 'product';
    root.classList.toggle('cdp-cat--product', isProduct);
    var label = qs('#cdpCatViewLabel');
    var toggle = qs('#cdpCatViewToggle');
    if (label) label.textContent = isProduct ? 'Product' : 'Model';
    if (toggle) {
      toggle.setAttribute('aria-checked', isProduct ? 'true' : 'false');
      toggle.classList.toggle('is-on', isProduct);
    }
  }

  function bindToolbar() {
    var toggle = qs('#cdpCatViewToggle');
    var filter = qs('#cdpCatFilter');
    var panel = qs('#cdpCatFilters');

    try {
      var saved = sessionStorage.getItem('cdpCatView');
      if (saved === 'product' || saved === 'model') state.viewMode = saved;
    } catch (e) {}

    updateViewUI();

    if (toggle && !toggle.__cdpBound) {
      toggle.__cdpBound = true;
      toggle.addEventListener('click', function () {
        state.viewMode = state.viewMode === 'product' ? 'model' : 'product';
        try {
          sessionStorage.setItem('cdpCatView', state.viewMode);
        } catch (e) {}
        updateViewUI();
        renderGrid();
      });
    }

    if (filter && !filter.__cdpBound) {
      filter.__cdpBound = true;
      filter.addEventListener('click', function () {
        if (!panel) return;
        var open = panel.hidden;
        panel.hidden = !open;
        filter.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  function beginCatalog() {
    hideNativeStoreBlocks();
    muteNativeStore();
    bindToolbar();
    bindCardInteractions();
    bindResize();

    var cached = readCache() || readStaleCache();
    if (cached && cached.length) {
      state._rawProducts = cached;
      window.__cdpCatRawProducts = cached;
      applyProducts(cached);
      var age = getCacheAge();
      if (age === null || age > CACHE_TTL / 2) loadProducts(0, true);
      else if (!readCache()) loadProducts(0, true);
      return;
    }

    loadProducts();
  }

  function start() {
    readRootConfig();
    state.perPage = CFG.perPage;
    state.nativePrices = {};

    if (!document.documentElement.__cdpCatUrlBound) {
      document.documentElement.__cdpCatUrlBound = true;
      document.addEventListener('click', onCatalogLinkClick, true);
    }

    beginCatalog();
  }

  function boot() {
    if (document.documentElement.__cdpCatBoot) return;
    root = document.getElementById('cdpCatalog');
    if (!root) return;
    document.documentElement.__cdpCatBoot = true;
    start();
  }

  if (document.getElementById('cdpCatalog')) {
    boot();
  } else if (typeof window.t_onReady === 'function') {
    window.t_onReady(boot);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
