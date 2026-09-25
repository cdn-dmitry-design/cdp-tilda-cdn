/*! CDP catalog embed — loads CSS/JS from same folder as this file */
(function () {
  if (document.documentElement.__cdpEmbed_catalog) return;
  document.documentElement.__cdpEmbed_catalog = true;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.error('[cdp-catalog] embed must be loaded via <script src="...">');
    return;
  }

  var base = script.src.replace(/[#?].*$/, '').replace(/\/[^/]*$/, '/');
  var attrs = script.attributes;

  function copyDataAttrs(el) {
    if (!el || !attrs) return;
    for (var i = 0; i < attrs.length; i++) {
      var a = attrs[i];
      if (a.name.indexOf('data-') === 0) el.setAttribute(a.name, a.value);
    }
  }

  function loadCss(href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadJs(src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    (script.parentNode || document.body).appendChild(s);
  }

  function preconnect(href) {
    var l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = href;
    l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  }
  preconnect('https://store.tildaapi.com');
  preconnect('https://cdn.jsdelivr.net');

  loadCss(base + "catalog.css");

  var wrap = document.createElement('div');
  wrap.innerHTML = "<div id=\"cdpCatalog\" class=\"cdp-cat\" data-storepart=\"618946506333\" data-native-rec=\"3505096201\" data-url-prefix=\"/cdp\" data-currency=\"$\" aria-busy=\"true\">\n  <div class=\"cdp-cat__head\">\n    <h2 class=\"cdp-cat__title\">Shop</h2>\n    <nav class=\"cdp-cat__pager\" id=\"cdpCatPager\" aria-label=\"Pagination\"></nav>\n  </div>\n  <div class=\"cdp-cat__toolbar\">\n    <button type=\"button\" class=\"cdp-cat__filter\" id=\"cdpCatFilter\" aria-expanded=\"false\">Filter / Sort</button>\n    <div class=\"cdp-cat__view\">\n      <span class=\"cdp-cat__view-label\" id=\"cdpCatViewLabel\">Model</span>\n      <button type=\"button\" class=\"cdp-cat__view-toggle\" id=\"cdpCatViewToggle\" role=\"switch\" aria-checked=\"false\" aria-label=\"Product or model view\">\n        <span class=\"cdp-cat__view-knob\" aria-hidden=\"true\"></span>\n      </button>\n    </div>\n  </div>\n  <div class=\"cdp-cat__filters\" id=\"cdpCatFilters\" hidden>\n    <p class=\"cdp-cat__filters-note\">Filters coming soon</p>\n  </div>\n  <div class=\"cdp-cat__grid\" id=\"cdpCatGrid\" aria-live=\"polite\"></div>\n  <p class=\"cdp-cat__empty\" id=\"cdpCatEmpty\" hidden>Товаров пока нет</p>\n  <p class=\"cdp-cat__status\" id=\"cdpCatStatus\">Загрузка каталога…</p>\n</div>";
  while (wrap.firstChild) {
    var node = wrap.firstChild;
    wrap.removeChild(node);
    if (node.nodeType === 1) {
      if (node.id === 'cdpCatalog' || (node.classList && node.classList.contains('cdp-prod'))) {
        copyDataAttrs(node);
      }
      if (node.id === 'cdpProdPageTpl') {
        var inner = node.content && node.content.querySelector('.cdp-prod');
        if (inner) copyDataAttrs(inner);
      }
    }
    script.parentNode.insertBefore(node, script);
  }

  loadJs(base + "catalog.js");

  function hint(rel, href, asType) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = rel;
    l.href = href;
    if (asType) l.as = asType;
    // только греем кэш — на каталоге стили карточки не подключаем как stylesheet
    if (rel === 'preload') l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  }
  function warmProductAssets() {
    if (document.documentElement.__cdpProdPrefetch) return;
    document.documentElement.__cdpProdPrefetch = true;
    // CSS карточки — приоритетнее: без него страница «голая»
    hint('preload', base + 'prod.css', 'style');
    hint('prefetch', base + 'prod.embed.js');
    hint('prefetch', base + 'prod.js');
  }
  if ('requestIdleCallback' in window) requestIdleCallback(warmProductAssets, { timeout: 2500 });
  else setTimeout(warmProductAssets, 1200);
})();
