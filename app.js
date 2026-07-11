/* ============================================================
   Bookmarks -- persisted in localStorage (this is a plain static
   page hosted on GitHub Pages, not a sandboxed artifact, so
   localStorage works normally here and is the right tool for it).
   ============================================================ */
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('nb_bookmarks') || '[]'); }
  catch (e) { return []; }
}
function setBookmarks(ids) {
  localStorage.setItem('nb_bookmarks', JSON.stringify(ids));
}
function toggleBookmark(id) {
  const current = getBookmarks();
  const idx = current.indexOf(id);
  if (idx >= 0) { current.splice(idx, 1); showToast('Removed from Saved'); }
  else { current.push(id); showToast('Saved for later'); }
  setBookmarks(current);
}
function isBookmarked(id) { return getBookmarks().includes(id); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ============================================================
   Grounded "Chat with News" logic -- unchanged from v1: real
   grounding + refusal, answers only from the article's own text
   (plus cluster siblings).
   ============================================================ */
const STOPWORDS = new Set([
  'what', 'when', 'where', 'which', 'this', 'that', 'about', 'will', 'does',
  'have', 'their', 'they', 'there', 'from', 'with', 'been', 'were', 'happen',
]);

function answerFromSources(question, sourceArticles) {
  const REFUSAL = "I don't have enough information in these sources to answer that.";
  const questionWords = question.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  if (questionWords.length === 0) return { answer: REFUSAL, citations: [], grounded: false };

  const scored = sourceArticles.map((src, idx) => {
    const sentences = src.body_text.split(/(?<=[.!?])\s+/);
    const hits = sentences.map((s) => ({
      sentence: s,
      score: questionWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0),
    })).filter((h) => h.score > 0).sort((a, b) => b.score - a.score);
    return { idx, src, hits };
  });

  const minScore = Math.min(2, questionWords.length);
  const withHits = scored
    .map((s) => ({ ...s, hits: s.hits.filter((h) => h.score >= minScore) }))
    .filter((s) => s.hits.length > 0);

  if (withHits.length === 0) return { answer: REFUSAL, citations: [], grounded: false };

  const parts = [];
  const citations = [];
  withHits.forEach(({ idx, src, hits }) => {
    const best = hits[0].sentence.trim();
    parts.push(`${best} [Source ${idx + 1}]`);
    citations.push({ publisher_name: src.publisher.name, excerpt: best.slice(0, 180) });
  });

  return { answer: parts.join(' '), citations, grounded: true };
}

/* ============================================================
   Live Headlines -- real news pulled directly in the browser from
   real publishers' public RSS feeds, via a free RSS-to-JSON bridge
   (rss2json.com) since browsers can't fetch raw cross-origin RSS
   without one. No API key, no backend, no signup.

   IMPORTANT LIMITATION: this pulls real external content, unlike the
   curated demo articles above, so every field is HTML-escaped before
   being inserted into the page -- treat anything from the network as
   untrusted. Live items also don't have AI summaries/bias scores (no
   backend to generate them), so they render as simple linked cards
   that open the original source in a new tab, rather than the full
   AI-annotated card used for the curated demo content.

   If a feed is down, rate-limited, or the network is unavailable,
   that single feed is skipped -- the page never breaks, it just shows
   whatever feeds succeeded, or a clear retry message if all failed.
   ============================================================ */
const LIVE_FEEDS = [
  { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'BBC Football', url: 'http://feeds.bbci.co.uk/sport/football/rss.xml' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
];
const RSS_BRIDGE = 'https://api.rss2json.com/v1/api.json?rss_url=';
const LIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes
let liveRefreshTimer = null;
let liveCache = [];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function stripTags(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  // textContent walks into <script>/<style> children and returns their raw
  // source as text (they never execute since this is set via innerHTML,
  // but their JS/CSS source would otherwise visibly leak into the summary
  // text) -- remove them explicitly before extracting text.
  div.querySelectorAll('script, style').forEach(el => el.remove());
  return div.textContent || div.innerText || '';
}

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

async function loadLiveHeadlines(forceRefresh) {
  const main = document.getElementById('main');
  if (!forceRefresh && liveCache.length > 0) {
    renderLiveHeadlines();
    return;
  }
  main.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;

  const results = await Promise.allSettled(LIVE_FEEDS.map(fetchOneFeed));
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
  const failedCount = LIVE_FEEDS.length - new Set(liveCache.map(a => a.source)).size;
  main.innerHTML = `
    <div class="live-header-row">
      <span class="last-updated">Updated ${relativeTime(new Date().toISOString())} · real headlines, no AI summary/scoring yet</span>
      <button class="refresh-btn" onclick="loadLiveHeadlines(true)">↻ Refresh</button>
    </div>
    ${failedCount > 0 ? `<div class="live-note">${failedCount} of ${LIVE_FEEDS.length} sources unavailable right now — showing what loaded.</div>` : ''}
    ${liveCache.map(a => `
      <a class="live-card" href="${escapeHtml(a.link)}" target="_blank" rel="noopener noreferrer">
        <div class="source-line">${escapeHtml(a.source)} · ${relativeTime(a.published_at.toISOString())}</div>
        <div class="headline">${escapeHtml(a.headline)}</div>
        ${a.summary ? `<div class="one-liner">${escapeHtml(a.summary)}</div>` : ''}
      </a>
    `).join('')}
  `;
}

function stopLiveAutoRefresh() {
  if (liveRefreshTimer) { clearInterval(liveRefreshTimer); liveRefreshTimer = null; }
}

/* ============================================================
   UI rendering
   ============================================================ */
let currentArticleId = null;
let currentTab = 'home';
let searchQuery = '';

document.querySelectorAll('[data-theme-btn]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.setAttribute('data-theme', btn.dataset.themeBtn);
    document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.toggle('active', b === btn));
  });
});

document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
    currentTab = btn.dataset.tab;
    stopLiveAutoRefresh();
    document.getElementById('chatFab').style.display = 'none';
    if (currentTab === 'live') {
      loadLiveHeadlines(false);
      liveRefreshTimer = setInterval(() => loadLiveHeadlines(true), LIVE_REFRESH_MS);
    } else {
      renderFeed();
    }
  });
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  if (currentTab === 'live') return; // search only applies to the curated demo feed
  renderFeed();
});

function relativeTime(iso) {
  const diffMin = Math.round((Date.now() - new Date(iso)) / 60000);
  if (diffMin < 60) return diffMin + 'm ago';
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return diffH + 'h ago';
  return Math.round(diffH / 24) + 'd ago';
}

function factualityBadge(score) {
  if (score == null) return '';
  const tier = score >= 8.5 ? 'high' : score >= 6.5 ? 'medium' : 'low';
  const label = tier === 'high' ? 'High factuality' : tier === 'medium' ? 'Medium factuality' : 'Low factuality';
  return `<span class="badge ${tier}" title="${label}: ${score}/10">● ${score}</span>`;
}

function buildTicker() {
  const breaking = articles.filter(a => a.is_breaking).sort((a,b) => new Date(b.published_at) - new Date(a.published_at));
  const track = document.getElementById('tickerTrack');
  track.innerHTML = breaking.map(a => `<span>🔴 ${a.headline}</span>`).join('');
}

function matchesSearch(a) {
  if (!searchQuery) return true;
  const haystack = (a.headline + ' ' + a.ai_summary.one_line + ' ' + a.publisher.name + ' ' + a.category_slug).toLowerCase();
  return haystack.includes(searchQuery);
}

function getFilteredList() {
  let list = articles.slice().sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  if (currentTab === 'breaking') list = list.filter(a => a.is_breaking);
  else if (currentTab === 'trending') list = list.slice().sort((a, b) => b.reading_now - a.reading_now);
  else if (currentTab === 'bookmarks') { const saved = getBookmarks(); list = list.filter(a => saved.includes(a.id)); }
  else if (currentTab !== 'home') list = list.filter(a => a.category_slug === currentTab);
  return list.filter(matchesSearch);
}

function cardHtml(a, big) {
  const saved = isBookmarked(a.id);
  if (big) {
    return `
      <div class="hero-card" onclick="openArticle('${a.id}')">
        <img src="${a.hero_image_url}" alt="" />
        <button class="bookmark-btn ${saved ? 'saved' : ''}" onclick="event.stopPropagation(); handleBookmarkClickFeed('${a.id}')">${saved ? '♥' : '♡'}</button>
        <div class="hero-overlay">
          <div class="overline ${a.is_breaking ? 'breaking-tag' : ''}">${a.is_live ? '<span class="live-dot"></span>LIVE' : (a.is_breaking ? '● BREAKING · ' : '')}${a.category_slug.toUpperCase()}</div>
          <div class="headline">${a.headline}</div>
          <div class="one-liner">${a.ai_summary.one_line}</div>
          <div class="meta-row"><span>${a.publisher.name}</span><span>·</span><span>${relativeTime(a.published_at)}</span><span>·</span><span>${a.read_minutes} min read</span></div>
        </div>
      </div>`;
  }
  return `
    <div class="card" onclick="openArticle('${a.id}')">
      <button class="bookmark-btn ${saved ? 'saved' : ''}" onclick="event.stopPropagation(); handleBookmarkClickFeed('${a.id}')">${saved ? '♥' : '♡'}</button>
      <img src="${a.hero_image_url}" alt="" />
      <div class="overline ${a.is_breaking ? 'breaking-tag' : ''}">${a.is_live ? '<span class="live-dot"></span>LIVE · ' : (a.is_breaking ? '● BREAKING · ' : '')}${a.category_slug.toUpperCase()}</div>
      <div class="headline">${a.headline}</div>
      <div class="one-liner">${a.ai_summary.one_line}</div>
      <div class="meta-row">
        <span>${a.publisher.name}</span><span>·</span><span>${relativeTime(a.published_at)}</span>
        <span class="readtime-chip">· ${a.read_minutes} min read</span>
        <div class="spacer"></div>
        ${factualityBadge(a.factuality_score)}
      </div>
    </div>`;
}

function handleBookmarkClickFeed(id) {
  toggleBookmark(id);
  renderFeed();
}

function handleBookmarkClickDetail(id) {
  toggleBookmark(id);
  refreshDetailActionRow();
}

function renderFeed() {
  const main = document.getElementById('main');
  document.getElementById('chatFab').style.display = 'none';
  main.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;

  setTimeout(() => {
    const list = getFilteredList();

    if (list.length === 0) {
      const msg = currentTab === 'bookmarks'
        ? 'Nothing saved yet.<br/>Tap the ♡ on any story to save it here.'
        : 'No articles match right now.<br/>Try a different tab or search term.';
      main.innerHTML = `<div class="empty">${msg}</div>`;
      return;
    }

    let html = '';
    if (currentTab === 'home' && !searchQuery && list.length > 0) {
      html += cardHtml(list[0], true);
      html += list.slice(1).map(a => cardHtml(a, false)).join('');
    } else {
      html += list.map(a => cardHtml(a, false)).join('');
    }
    main.innerHTML = html;
  }, 160);
}

function refreshDetailActionRow() {
  const btn = document.getElementById('detailBookmarkBtn');
  if (!btn) return;
  const saved = isBookmarked(currentArticleId);
  btn.classList.toggle('saved', saved);
  btn.innerHTML = saved ? '♥ Saved' : '♡ Save';
}

async function shareArticle(headline) {
  const shareData = { title: 'NewsBucket', text: headline, url: window.location.href };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (e) {
      // User cancelled the native share sheet, or it failed -- fall through
      // to the clipboard path rather than leaving the user with nothing.
    }
  }
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${headline} — ${window.location.href}`);
      showToast('Link copied to clipboard');
      return;
    } catch (e) {
      // Clipboard permission denied or unavailable (e.g. insecure context) --
      // fail gracefully instead of an unhandled rejection.
    }
  }
  showToast('Sharing isn\'t available in this browser');
}

function openArticle(id) {
  currentArticleId = id;
  const main = document.getElementById('main');
  const detail = articles.find(a => a.id === id);
  const sources = detail.cluster_id ? articles.filter(a => a.cluster_id === detail.cluster_id && a.id !== id) : [];
  const saved = isBookmarked(id);

  main.innerHTML = `<div class="skeleton" style="height:400px;"></div>`;

  setTimeout(() => {
    main.innerHTML = `
      <button class="back-btn" onclick="renderFeed(); document.querySelectorAll('[data-tab]').forEach((b,i)=>b.classList.toggle('active', i===0));">← Back to feed</button>
      <img class="detail-hero" src="${detail.hero_image_url}" alt="" />
      <div class="headline" style="font-size:26px; margin-top:16px;">${detail.headline}</div>
      <div class="meta-row" style="margin-top:8px;">
        <span>${detail.author_name}</span><span>·</span><span>${detail.publisher.name}</span><span>·</span><span>${relativeTime(detail.published_at)}</span><span>·</span><span>${detail.read_minutes} min read</span>
      </div>
      <div class="action-row">
        <button id="detailBookmarkBtn" class="${saved ? 'saved' : ''}" onclick="handleBookmarkClickDetail('${detail.id}')">${saved ? '♥ Saved' : '♡ Save'}</button>
        <button onclick="shareArticle('${detail.headline.replace(/'/g, "\\'")}')">↗ Share</button>
      </div>
      <div class="trust-row">
        ${factualityBadge(detail.factuality_score)}
        <span class="trust-chip">Bias: ${detail.bias_rating.replace('_',' ')}</span>
        ${detail.publisher.is_verified_partner ? '<span class="trust-chip">✓ Verified partner</span>' : ''}
        <span class="trust-chip">🔥 ${detail.reading_now.toLocaleString()} reading now</span>
      </div>
      <div class="summary-panel">
        <div class="summary-toggle">
          <button data-mode="bullets" class="active">Bullets</button>
          <button data-mode="full">Full</button>
          <button data-mode="eli5">ELI5</button>
        </div>
        <div class="summary-body" id="summaryBody"></div>
      </div>
      <div class="body-text"><p>${detail.body_text.replace(/\n\n/g, '</p><p>')}</p></div>
      ${sources.length > 0 ? `
        <div class="section-title">Other outlets covering this</div>
        <div class="source-rail">
          ${sources.map(s => `
            <div class="source-chip" onclick="openArticle('${s.id}')">
              <div class="pub">${s.publisher.name}</div>
              <div style="color:var(--text-secondary)">${s.headline}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div style="height:60px;"></div>
    `;

    const summaryData = detail.ai_summary;
    function renderSummary(mode) {
      const el = document.getElementById('summaryBody');
      if (mode === 'bullets') el.innerHTML = `<ul>${summaryData.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
      else if (mode === 'eli5') el.innerHTML = `<div>${summaryData.eli5}</div>`;
      else el.innerHTML = `<div>${summaryData.one_line}</div>`;
    }
    renderSummary('bullets');
    main.querySelectorAll('.summary-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        main.querySelectorAll('.summary-toggle button').forEach(b => b.classList.toggle('active', b === btn));
        renderSummary(btn.dataset.mode);
      });
    });

    document.getElementById('chatFab').style.display = 'block';
    document.getElementById('chatLog').innerHTML = '';
  }, 150);
}

document.getElementById('chatFab').addEventListener('click', () => document.getElementById('chatSheet').classList.add('open'));
document.getElementById('closeChat').addEventListener('click', () => document.getElementById('chatSheet').classList.remove('open'));

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const question = input.value.trim();
  if (!question || !currentArticleId) return;
  const log = document.getElementById('chatLog');
  log.innerHTML += `<div class="chat-msg user">${question}</div>`;
  input.value = '';
  log.scrollTop = log.scrollHeight;

  const article = articles.find(a => a.id === currentArticleId);
  const clusterSiblings = article.cluster_id ? articles.filter(a => a.cluster_id === article.cluster_id && a.id !== article.id) : [];
  const { answer, citations, grounded } = answerFromSources(question, [article, ...clusterSiblings]);

  log.innerHTML += `<div class="chat-msg assistant">${answer}${
    grounded && citations.length ? `<div class="citations">Sources: ${citations.map(c => c.publisher_name).join(', ')}</div>` : ''
  }</div>`;
  log.scrollTop = log.scrollHeight;
}
document.getElementById('sendChat').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

buildTicker();
renderFeed();
