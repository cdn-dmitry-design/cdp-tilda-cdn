# CDP Tilda CDN

Публичный репозиторий для подключения каталога и карточки CDP на Tilda одной строкой (через jsDelivr).

Исходники правок лежат рядом в папке `CDP/` проекта. Тилдовские HTML (`Каталог CDP.html`, `CSS и JS карточки CDP.html` и т.д.) **не трогаются**.

## Сборка

```bash
cd CDP/github-cdn
node build.js
```

Копирует `cdp-catalog.*` / `cdp-prod.*` в `dist/` и генерирует `catalog.embed.js` / `prod.embed.js`.

## Строки для Tilda

После пуша в GitHub замените `USER` на ваш логин.

**Каталог** (T123 на странице `/cdp`):

```html
<script src="https://cdn.jsdelivr.net/gh/USER/cdp-tilda-cdn@main/dist/catalog.embed.js" data-storepart="618946506333" data-native-rec="3505096201" data-url-prefix="/cdp" data-currency="$"></script>
```

**Карточка** (Footer страниц товара каталога CDP):

```html
<script src="https://cdn.jsdelivr.net/gh/USER/cdp-tilda-cdn@main/dist/prod.embed.js" data-storepart="618946506333" data-url-prefix="/cdp"></script>
```

Атрибуты `data-*` на `<script>` пробрасываются в `#cdpCatalog` / шаблон карточки.

## Обновление

1. Правите исходники в `CDP/` (`cdp-catalog.js`, `cdp-prod.css`, …)
2. `node build.js` в этой папке
3. `git add -A && git commit && git push`
4. При необходимости сбросьте кэш jsDelivr: `https://www.jsdelivr.com/tools/purge`

Для продакшена лучше тегировать версии (`@v1.0.1`) вместо `@main`.
