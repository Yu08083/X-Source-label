// ==UserScript==
// @name         Tweet Source Label
// @name:ja      ツイートソースラベル復元
// @namespace    https://github.com/Yu08083/X-Source-label
// @version      1.0.0
// @description  X(Twitter) のツイートに、消えた投稿元ラベル（Twitter for iPhone 等）を日付の隣に再表示します。
// @description:en Restores the hidden tweet source label (e.g. "Twitter for iPhone") inline next to the timestamp on x.com.
// @author       @yu_
// @match        https://x.com/*
// @match        https://twitter.com/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// @homepageURL  https://yu08083.github.io/X-Source-label/
// @supportURL   https://github.com/Yu08083/X-Source-label/issues
// @downloadURL  https://raw.githubusercontent.com/Yu08083/X-Source-label/main/source-label.user.js
// @updateURL    https://raw.githubusercontent.com/Yu08083/X-Source-label/main/source-label.user.js
// @icon         https://yu08083.github.io/X-Source-label/assets/icons/favicon.svg
// ==/UserScript==

(() => {
  'use strict';

  const QUERY_ID = 'zAz9764BcLZOJ0JU2wrd1A';
  const BEARER = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
  const FEATURES = {
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true
  };

  // tweetId -> label (or null if failed). Reduces redundant API calls.
  const cache = new Map();
  let pendingFetch = null;

  const getTweetIdFromUrl = () => {
    const m = location.pathname.match(/\/status\/(\d+)/);
    return m ? m[1] : null;
  };

  const findAnchor = (tweetId) => {
    const links = document.querySelectorAll(`a[href*="/status/${tweetId}"]`);
    for (const link of links) {
      if (link.querySelector('time')) return link;
    }
    return null;
  };

  const fetchSource = async (tweetId) => {
    if (cache.has(tweetId)) return cache.get(tweetId);

    const ct0 = document.cookie.match(/ct0=([^;]+)/)?.[1];
    if (!ct0) {
      cache.set(tweetId, null);
      return null;
    }

    const variables = encodeURIComponent(JSON.stringify({
      tweetId,
      withCommunity: false,
      includePromotedContent: false,
      withVoice: false
    }));
    const features = encodeURIComponent(JSON.stringify(FEATURES));
    const url = `https://api.x.com/graphql/${QUERY_ID}/TweetResultByRestId`
              + `?variables=${variables}&features=${features}`;

    try {
      const res = await fetch(url, {
        headers: {
          'authorization': 'Bearer ' + BEARER,
          'x-csrf-token': ct0
        },
        credentials: 'include'
      });
      const data = await res.json();
      const result = data?.data?.tweetResult?.result;
      const sourceHtml = (result?.tweet || result)?.source;
      const label = sourceHtml?.match(/>([^<]+)</)?.[1] || null;
      cache.set(tweetId, label);
      return label;
    } catch (e) {
      cache.set(tweetId, null);
      return null;
    }
  };

  const inject = (tweetId, label) => {
    // Already injected for this tweet?
    if (document.querySelector(`[data-tsl-id="${tweetId}"]`)) return;
    const anchor = findAnchor(tweetId);
    if (!anchor) return;

    const timeEl = anchor.querySelector('time');
    const color = timeEl ? window.getComputedStyle(timeEl).color : 'inherit';

    const span = document.createElement('span');
    span.setAttribute('data-tsl-id', tweetId);
    span.style.cssText = `color: ${color}; margin-left: 4px; font: inherit;`;
    span.textContent = ` · ${label}`;
    anchor.insertAdjacentElement('afterend', span);
  };

  const tryRun = async () => {
    const tweetId = getTweetIdFromUrl();
    if (!tweetId) return;
    if (document.querySelector(`[data-tsl-id="${tweetId}"]`)) return;
    if (!findAnchor(tweetId)) return;       // DOM not ready yet
    if (pendingFetch === tweetId) return;   // Already in-flight

    pendingFetch = tweetId;
    try {
      const label = await fetchSource(tweetId);
      if (label && getTweetIdFromUrl() === tweetId) {
        inject(tweetId, label);
      }
    } finally {
      if (pendingFetch === tweetId) pendingFetch = null;
    }
  };

  // ---- React to DOM changes (async content loading) ----
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      tryRun();
    }, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ---- React to SPA navigation ----
  let lastUrl = location.href;
  const checkUrlChange = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    pendingFetch = null;
    // X needs a moment to render the new tweet's DOM
    setTimeout(tryRun, 300);
    setTimeout(tryRun, 900);
    setTimeout(tryRun, 1800);
  };

  // Patch history methods to catch pushState/replaceState (SPA routing)
  const _push = history.pushState;
  const _replace = history.replaceState;
  history.pushState = function (...args) {
    _push.apply(this, args);
    checkUrlChange();
  };
  history.replaceState = function (...args) {
    _replace.apply(this, args);
    checkUrlChange();
  };
  window.addEventListener('popstate', checkUrlChange);

  // Initial run
  tryRun();
})();
