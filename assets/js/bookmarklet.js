// ============================================
// Tweet Source Label — Bookmarklet (readable version)
//
// Injects the tweet's source label (e.g. "Twitter for iPhone")
// inline next to the timestamp on the X.com page, matching the
// original old-Twitter style:
//   2026年5月26日 · Twitter for iPhone
//
// Falls back to a minimal black & white toast if the inline
// target cannot be found.
// ============================================

(async () => {
  const match = location.pathname.match(/\/status\/(\d+)/);
  if (!match) {
    alert('個別ツイートページで実行してください');
    return;
  }
  const tweetId = match[1];

  const ct0 = document.cookie.match(/ct0=([^;]+)/)?.[1];
  if (!ct0) {
    alert('X.com にログインしてください');
    return;
  }

  const variables = encodeURIComponent(JSON.stringify({
    tweetId,
    withCommunity: false,
    includePromotedContent: false,
    withVoice: false
  }));
  const features = encodeURIComponent(JSON.stringify({
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true
  }));
  const url = `https://api.x.com/graphql/zAz9764BcLZOJ0JU2wrd1A/TweetResultByRestId`
            + `?variables=${variables}&features=${features}`;

  // Find the <a> wrapping the <time> for the main tweet
  const findAnchor = () => {
    const links = document.querySelectorAll(`a[href*="/status/${tweetId}"]`);
    for (const link of links) {
      if (link.querySelector('time')) return link;
    }
    return null;
  };

  // Inject inline label next to the timestamp link
  const injectInline = (label) => {
    document.getElementById('TSL-inline')?.remove();
    const anchor = findAnchor();
    if (!anchor) return false;

    // Match the timestamp's color so it blends with X's theme
    const timeEl = anchor.querySelector('time');
    const color = timeEl ? window.getComputedStyle(timeEl).color : 'inherit';

    const span = document.createElement('span');
    span.id = 'TSL-inline';
    span.style.cssText = `color: ${color}; margin-left: 4px; font: inherit;`;
    span.textContent = ` · ${label}`;
    anchor.insertAdjacentElement('afterend', span);
    return true;
  };

  // Minimal black & white toast (fallback only)
  const showToast = (message) => {
    document.getElementById('TSL-toast')?.remove();
    if (!document.getElementById('TSL-style')) {
      const style = document.createElement('style');
      style.id = 'TSL-style';
      style.textContent = `
        @keyframes TSL-in {
          from { transform: translateY(-6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #TSL-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          padding: 14px 18px;
          font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif;
          font-size: 14px;
          line-height: 1.5;
          z-index: 2147483647;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
          animation: TSL-in 0.35s ease;
          max-width: 320px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        #TSL-toast .x {
          background: none;
          border: none;
          color: #000;
          cursor: pointer;
          padding: 0;
          font: inherit;
          font-size: 16px;
          line-height: 1;
        }
      `;
      document.head.appendChild(style);
    }
    const toast = document.createElement('div');
    toast.id = 'TSL-toast';
    toast.innerHTML = '<span></span><button class="x">×</button>';
    toast.querySelector('span').textContent = message;
    toast.querySelector('.x').onclick = () => toast.remove();
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  };

  try {
    const response = await fetch(url, {
      headers: {
        'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-csrf-token': ct0
      },
      credentials: 'include'
    });
    const data = await response.json();
    const result = data?.data?.tweetResult?.result;
    const sourceHtml = (result?.tweet || result)?.source;
    const label = sourceHtml?.match(/>([^<]+)</)?.[1];

    if (label) {
      const injected = injectInline(label);
      if (!injected) showToast(label);
    } else {
      showToast('ソース情報を取得できませんでした');
    }
  } catch (error) {
    showToast('取得に失敗しました: ' + error.message);
  }
})();
