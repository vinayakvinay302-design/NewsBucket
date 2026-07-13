/* ============================================================
   live.js -- everything that talks to the outside world.

   Two independent live features:
   1. Live news headlines, per category, pulled from real publishers'
      public RSS feeds via a free RSS-to-JSON bridge (rss2json.com) --
      no API key, no backend, no signup.
   2. A real crypto price ticker from CoinGecko's public API -- also
      no key required, genuinely live numeric data (not just headlines).

   Both fail gracefully: if a feed/API is down or rate-limited, that
   piece is simply skipped -- the curated demo content in data.js
   always still renders underneath, so the page never breaks.

   HTML-escaping matters here: unlike the curated demo articles in
   data.js (which we wrote ourselves), everything in this file comes
   from the network and must be treated as untrusted before being
   inserted into the page.
   ============================================================ */

/* ---------- Feed registry: one or more real RSS feeds per category ---------- */
const CATEGORY_FEEDS = {
  football: [{ name: 'BBC Football', url: 'http://feeds.bbci.co.uk/sport/football/rss.xml' }],
  cricket: [{ name: 'ESPN Cricinfo', url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml' }],
  world: [{ name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' }],
  technology: [{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }],
  business: [{ name: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' }],
  crypto: [{ name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' }],
  entertainment: [{ name: 'Variety', url: 'https://variety.com/feed/' }],
};

// The aggregate "Live Headlines" tab pulls one feed from each category above.
const AGGREGATE_FEEDS = Object.values(CATEGORY_FEEDS).map(feeds => feeds[0]);

const RSS_BRIDGE = 'https://api.rss2json.com/v1/api.json?rss_url=';
const LIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes
const CRYPTO_REFRESH_MS = 60 * 1000; // 1 minute -- prices move fast

let liveRefreshTimer = null;
let cryptoRefreshTimer = null;
let liveCache = [];
const categoryLiveCache = {}; // category_slug -> array of live items

/* ---------- Safety helpers (network content is untrusted) ---------- */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function stripTags(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  // textContent walks into <script>/<style> children and returns their raw
  // source as text (never executes, since this is set via innerHTML, but
  // the raw JS/CSS source would otherwise visibly leak into the summary
  // text) -- remove them explicitly before extracting text.
  div.querySelectorAll('script, style').forEach(el => el.remove());
  return div.textContent || div.innerText || '';
}

/* ---------- RSS fetching ---------- */

async function fetchOneFeed(feed) {
  const res = await fetch(RSS_BRIDGE + encodeURIComponent(feed.url) + '&count=6');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok' || !Array.isArray(json.items)) throw new Error('Bad feed response');
  return json.items.map(item => ({
    source: feed.name,
    headline: stripTags(item.title || '').trim(),
    summary: stripTags(item.description || '').trim().slice(0, 160),
    link: item.link,
    published_at: item.pubDate ? new Date(item.pubDate.replace(' ', 'T') + 'Z') : new Date(),
  }));
}

/* ---------- Aggregate "Live Headlines" tab ---------- */

async function loadLiveHeadlines(forceRefresh) {
  const main = document.getElementById('main');
  if (!forceRefresh && liveCache.length > 0) {
    renderLiveHeadlines();
    return;
  }
  main.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;

  const results = await Promise.allSettled(AGGREGATE_FEEDS.map(fetchOneFeed));
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const merged = succeeded.flatMap(r => r.value);

  if (merged.length === 0) {
    main.innerHTML = `<div class="error">
      Couldn't load live headlines right now — this needs an internet connection
      and the RSS bridge service to be reachable.<br/><br/>
      <button class="refresh-btn" onclick="loadLiveHeadlines(true)">Try again</button>
    </div>`;
    return;
  }

  merged.sort((a, b) => b.published_at - a.published_at);
  liveCache = merged;
  renderLiveHeadlines();
}

function renderLiveHeadlines() {
  const main = document.getElementById('main');
  const failedCount = AGGREGATE_FEEDS.length - new Set(liveCache.map(a => a.source)).size;
  main.innerHTML = `
    <div class="live-header-row">
      <span class="last-updated">Updated ${relativeTime(new Date().toISOString())} · real headlines, no AI summary/scoring yet</span>
      <button class="refresh-btn" onclick="loadLiveHeadlines(true)">↻ Refresh</button>
    </div>
    ${failedCount > 0 ? `<div class="live-note">${failedCount} of ${AGGREGATE_FEEDS.length} sources unavailable right now — showing what loaded.</div>` : ''}
    ${liveCache.map(liveCardHtml).join('')}
  `;
}

function liveCardHtml(a) {
  return `
    <a class="live-card" href="${escapeHtml(a.link)}" target="_blank" rel="noopener noreferrer">
      <div class="source-line">🔴 ${escapeHtml(a.source)} · ${relativeTime(a.published_at.toISOString())}</div>
      <div class="headline">${escapeHtml(a.headline)}</div>
      ${a.summary ? `<div class="one-liner">${escapeHtml(a.summary)}</div>` : ''}
    </a>`;
}

function stopLiveAutoRefresh() {
  if (liveRefreshTimer) { clearInterval(liveRefreshTimer); liveRefreshTimer = null; }
}

/* ---------- Per-category live strip (injected at the top of every
   category tab, above the curated demo articles from data.js) ---------- */

async function loadCategoryLiveStrip(categorySlug) {
  const feeds = CATEGORY_FEEDS[categorySlug];
  if (!feeds) return; // home/breaking/trending/bookmarks have no dedicated feed

  const container = document.getElementById('categoryLiveStrip');
  if (!container) return; // renderFeed() re-rendered before this resolved -- bail quietly

  if (categoryLiveCache[categorySlug]) {
    renderCategoryLiveStrip(categorySlug);
    return;
  }

  const results = await Promise.allSettled(feeds.map(fetchOneFeed));
  const merged = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);

  // The container may have been removed by a subsequent tab switch while
  // this fetch was in flight -- always re-check before touching the DOM.
  const stillThere = document.getElementById('categoryLiveStrip');
  if (!stillThere) return;

  if (merged.length === 0) {
    stillThere.innerHTML = ''; // no live content available right now; fail silently, curated content below still shows
    return;
  }

  merged.sort((a, b) => b.published_at - a.published_at);
  categoryLiveCache[categorySlug] = merged.slice(0, 3);
  renderCategoryLiveStrip(categorySlug);
}

function renderCategoryLiveStrip(categorySlug) {
  const container = document.getElementById('categoryLiveStrip');
  if (!container) return;
  const items = categoryLiveCache[categorySlug];
  if (!items || items.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <div class="section-title">🔴 Live right now</div>
    ${items.map(liveCardHtml).join('')}
    <div class="section-title" style="margin-top:20px;">Covered by NewsBucket</div>
  `;
}

/* ---------- Live crypto price ticker (CoinGecko public API, no key) ---------- */

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana'];
const CRYPTO_LABELS = { bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT', binancecoin: 'BNB', solana: 'SOL' };
let cryptoPriceCache = null;

async function fetchCryptoPrices() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadCryptoTicker(forceRefresh) {
  const el = document.getElementById('cryptoTicker');
  if (!el) return;

  if (!forceRefresh && cryptoPriceCache) {
    renderCryptoTicker();
    return;
  }

  el.innerHTML = `<div class="crypto-ticker-loading">Loading live prices…</div>`;
  try {
    const data = await fetchCryptoPrices();
    // Re-check the element still exists -- user may have navigated away
    // while this request was in flight.
    if (!document.getElementById('cryptoTicker')) return;
    cryptoPriceCache = data;
    renderCryptoTicker();
  } catch (e) {
    const stillThere = document.getElementById('cryptoTicker');
    if (stillThere) {
      stillThere.innerHTML = `<div class="crypto-ticker-error">Live prices unavailable right now.</div>`;
    }
  }
}

function renderCryptoTicker() {
  const el = document.getElementById('cryptoTicker');
  if (!el || !cryptoPriceCache) return;

  el.innerHTML = CRYPTO_IDS.map(id => {
    const entry = cryptoPriceCache[id];
    if (!entry) return '';
    const price = entry.usd;
    const change = entry.usd_24h_change;
    const up = change >= 0;
    const priceStr = price >= 1 ? price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : price.toFixed(4);
    return `
      <div class="crypto-chip">
        <span class="crypto-symbol">${CRYPTO_LABELS[id] || id}</span>
        <span class="crypto-price">$${priceStr}</span>
        <span class="crypto-change ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%</span>
      </div>`;
  }).join('');
}

function stopCryptoAutoRefresh() {
  if (cryptoRefreshTimer) { clearInterval(cryptoRefreshTimer); cryptoRefreshTimer = null; }
}
