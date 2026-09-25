/**
 * Собирает CDN-пакет из исходников CDP (родительская папка).
 * Не трогает тилдовские HTML — пишет только в github-cdn/dist и embeds.
 *
 * Запуск: node build.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, '..');
const DIST = path.join(ROOT, 'dist');
const EMBEDS = path.join(ROOT, 'embeds');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

function write(abs, content) {
  fs.writeFileSync(abs, content, 'utf8');
}

function jsString(s) {
  return JSON.stringify(String(s));
}

function stripHtmlComment(s) {
  return String(s).replace(/^<!--[\s\S]*?-->\n?/, '').trim();
}

function catalogMarkup() {
  return stripHtmlComment(read('cdp-catalog-inner.html'))
    .replace(/<link[^>]*preconnect[^>]*>\s*/i, '')
    .trim();
}

function prodTemplateInner() {
  return stripHtmlComment(read('cdp-prod-template-inner.html'));
}

function catalogCss() {
  return read('cdp-catalog-tilda.css') + '\n' + read('cdp-catalog.css');
}

function makeLoader({ name, cssFile, appFile, injectHtml, prefetchProd }) {
  const prefetchBlock = prefetchProd
    ? `
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
`
    : '';

  return `/*! CDP ${name} embed — loads CSS/JS from same folder as this file */
(function () {
  if (document.documentElement.__cdpEmbed_${name}) return;
  document.documentElement.__cdpEmbed_${name} = true;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.error('[cdp-${name}] embed must be loaded via <script src="...">');
    return;
  }

  var base = script.src.replace(/[#?].*$/, '').replace(/\\/[^/]*$/, '/');
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

  loadCss(base + ${jsString(cssFile)});

  var wrap = document.createElement('div');
  wrap.innerHTML = ${jsString(injectHtml)};
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

  loadJs(base + ${jsString(appFile)});
${prefetchBlock}})();
`;
}

ensureDir(DIST);
ensureDir(EMBEDS);

write(path.join(DIST, 'catalog.css'), catalogCss());
write(path.join(DIST, 'catalog.js'), read('cdp-catalog.js'));
write(path.join(DIST, 'prod.css'), read('cdp-prod.css'));
write(path.join(DIST, 'prod.js'), read('cdp-prod.js'));

const catalogHtml = catalogMarkup();
const prodShell =
  '<div id="cdpProdAssets" hidden></div>' +
  '<template id="cdpProdPageTpl">' +
  prodTemplateInner() +
  '</template>';

write(
  path.join(DIST, 'catalog.embed.js'),
  makeLoader({
    name: 'catalog',
    cssFile: 'catalog.css',
    appFile: 'catalog.js',
    injectHtml: catalogHtml,
    prefetchProd: true
  })
);

write(
  path.join(DIST, 'prod.embed.js'),
  makeLoader({
    name: 'prod',
    cssFile: 'prod.css',
    appFile: 'prod.js',
    injectHtml: prodShell,
    prefetchProd: false
  })
);

const VERSION = 'main';
const REPO = 'cdn-dmitry-design/cdp-tilda-cdn';

write(
  path.join(EMBEDS, 'catalog-tilda.html'),
  `<!-- Каталог CDP: одна строка в T123 на странице /cdp -->
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/dist/catalog.embed.js" data-storepart="618946506333" data-native-rec="3505096201" data-url-prefix="/cdp" data-currency="$"></script>
`
);

write(
  path.join(EMBEDS, 'prod-tilda.html'),
  `<!-- Карточка CDP: одна строка в Header/Footer страниц товара -->
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/dist/prod.embed.js" data-storepart="618946506333" data-url-prefix="/cdp"></script>
`
);

write(
  path.join(EMBEDS, 'README-EMBEDS.txt'),
  `КАТАЛОГ (/cdp):
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/dist/catalog.embed.js" data-storepart="618946506333" data-native-rec="3505096201" data-url-prefix="/cdp" data-currency="$"></script>

КАРТОЧКА (Header сайта / Footer товара):
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/dist/prod.embed.js" data-storepart="618946506333" data-url-prefix="/cdp"></script>
`
);

console.log('OK: dist/ + embeds/');
console.log('  catalog.embed.js, catalog.css, catalog.js');
console.log('  prod.embed.js, prod.css, prod.js');
