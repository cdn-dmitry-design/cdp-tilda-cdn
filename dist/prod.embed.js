/*! CDP prod embed — loads CSS/JS from same folder as this file */
(function () {
  if (document.documentElement.__cdpEmbed_prod) return;
  document.documentElement.__cdpEmbed_prod = true;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.error('[cdp-prod] embed must be loaded via <script src="...">');
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

  loadCss(base + "prod.css");

  var wrap = document.createElement('div');
  wrap.innerHTML = "<div id=\"cdpProdAssets\" hidden></div><template id=\"cdpProdPageTpl\"><div id=\"cdpProdPage\" class=\"cdp-prod\" data-storepart=\"618946506333\" data-url-prefix=\"/cdp\" aria-busy=\"true\">\n  <div class=\"cdp-prod__frame\">\n    <article\n      class=\"cdp-prod__card js-product js-product-single js-store-product js-store-product_single\"\n      data-card-size=\"large\"\n    >\n      <section class=\"cdp-prod__hero\">\n        <div class=\"cdp-prod__gallery-col\">\n          <div class=\"cdp-prod__gallery-wrap\">\n            <div class=\"cdp-prod__dots\" id=\"cdpProdDots\" aria-hidden=\"true\"></div>\n            <div class=\"cdp-prod__gallery\" id=\"cdpProdGallery\"></div>\n            <div class=\"cdp-prod__gallery-progress\" id=\"cdpProdGalleryProgress\" aria-hidden=\"true\"></div>\n          </div>\n        </div>\n\n        <div class=\"cdp-prod__meta js-store-single-product-info\">\n          <header class=\"cdp-prod__header\">\n            <h1 class=\"cdp-prod__title js-store-prod-name js-product-name\"></h1>\n            <p class=\"cdp-prod__price js-store-prod-price\" id=\"cdpProdPrice\"></p>\n            <span class=\"js-store-prod-price-val js-product-price notranslate\" translate=\"no\" hidden></span>\n          </header>\n\n          <div class=\"cdp-prod__form\">\n            <div class=\"cdp-prod__colors\" id=\"cdpProdColors\" aria-label=\"Colour\" hidden></div>\n\n            <div class=\"cdp-prod__buy-row t-store__prod-popup__btn-wrapper\">\n              <button type=\"button\" class=\"cdp-prod__buy t-btn\" id=\"cdpProdBuy\" data-cdp-buy=\"1\">\n                <span class=\"js-store-prod-buy-btn-txt\">Add to Bag</span>\n              </button>\n            </div>\n\n            <div class=\"cdp-prod__sizes\" id=\"cdpProdSizes\"></div>\n            <p class=\"cdp-prod__model-note\" id=\"cdpProdModelNote\"></p>\n\n            <div class=\"cdp-prod__tilda-opts\" id=\"cdpProdTildaOpts\" aria-hidden=\"true\"></div>\n\n            <div class=\"cdp-prod__sku\" aria-hidden=\"true\">\n              <span class=\"js-store-prod-sku js-product-sku notranslate\" translate=\"no\"></span>\n            </div>\n          </div>\n\n          <nav class=\"cdp-prod__details-nav\" id=\"cdpProdDetailsNav\" aria-label=\"Product details\">\n            <svg class=\"cdp-prod__tab-arrow\" id=\"cdpProdTabArrow\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" aria-hidden=\"true\">\n              <path d=\"M6 5L10 8L6 11\" stroke=\"currentColor\"></path>\n            </svg>\n          </nav>\n          <div class=\"cdp-prod__details-content\" id=\"cdpProdDetailsPanels\"></div>\n        </div>\n      </section>\n    </article>\n\n    <p class=\"cdp-prod__status\" id=\"cdpProdStatus\" hidden></p>\n  </div>\n</div></template>";
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

  loadJs(base + "prod.js");
})();
