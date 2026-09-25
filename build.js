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

function makeLoader({ name, cssFile, appFile, injectHtml }) {
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

  var pre = document.createElement('link');
  pre.rel = 'preconnect';
  pre.href = 'https://store.tildaapi.com';
  pre.crossOrigin = 'anonymous';
  document.head.appendChild(pre);

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
})();
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
    injectHtml: catalogHtml
  })
);

write(
  path.join(DIST, 'prod.embed.js'),
  makeLoader({
    name: 'prod',
    cssFile: 'prod.css',
    appFile: 'prod.js',
    injectHtml: prodShell
  })
);

const VERSION = 'main';
const PLACEHOLDER = 'YOUR_GITHUB_USER/cdp-tilda-cdn';

write(
  path.join(EMBEDS, 'catalog-tilda.html'),
  `<!-- Каталог CDP: вставить в T123 на странице /cdp -->
<script
  src="https://cdn.jsdelivr.net/gh/${PLACEHOLDER}@${VERSION}/dist/catalog.embed.js"
  data-storepart="618946506333"
  data-native-rec="3505096201"
  data-url-prefix="/cdp"
  data-currency="$"
></script>
`
);

write(
  path.join(EMBEDS, 'prod-tilda.html'),
  `<!-- Карточка CDP: вставить в Footer страниц товара (каталог CDP) -->
<script
  src="https://cdn.jsdelivr.net/gh/${PLACEHOLDER}@${VERSION}/dist/prod.embed.js"
  data-storepart="618946506333"
  data-url-prefix="/cdp"
></script>
`
);

write(
  path.join(EMBEDS, 'README-EMBEDS.txt'),
  `Строки для Tilda (после деплоя замените YOUR_GITHUB_USER на ваш логин GitHub)

КАТАЛОГ (страница /cdp, блок T123):
<script src="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USER/cdp-tilda-cdn@main/dist/catalog.embed.js" data-storepart="618946506333" data-native-rec="3505096201" data-url-prefix="/cdp" data-currency="$"></script>

КАРТОЧКА (Footer страниц товара каталога CDP):
<script src="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USER/cdp-tilda-cdn@main/dist/prod.embed.js" data-storepart="618946506333" data-url-prefix="/cdp"></script>
`
);

console.log('OK: dist/ + embeds/');
console.log('  catalog.embed.js, catalog.css, catalog.js');
console.log('  prod.embed.js, prod.css, prod.js');
