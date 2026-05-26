// ============================================
// Tweet Source Label — Page interactions
// ============================================

(() => {
  // Minified bookmarklet (synced with bookmarklet.js)
  const minifiedCode = `(async()=>{const m=location.pathname.match(/\\/status\\/(\\d+)/);if(!m){alert('個別ツイートページで実行してください');return}const id=m[1];const ct0=document.cookie.match(/ct0=([^;]+)/)?.[1];if(!ct0){alert('X.com にログインしてください');return}const v=encodeURIComponent(JSON.stringify({tweetId:id,withCommunity:false,includePromotedContent:false,withVoice:false}));const f=encodeURIComponent(JSON.stringify({creator_subscriptions_tweet_preview_api_enabled:true,responsive_web_graphql_timeline_navigation_enabled:true}));const findA=()=>{const ls=document.querySelectorAll('a[href*="/status/'+id+'"]');for(const l of ls){if(l.querySelector('time'))return l}return null};const inject=l=>{document.getElementById('TSL-inline')?.remove();const a=findA();if(!a)return false;const t=a.querySelector('time');const c=t?window.getComputedStyle(t).color:'inherit';const s=document.createElement('span');s.id='TSL-inline';s.style.cssText='color:'+c+';margin-left:4px;font:inherit';s.textContent=' · '+l;a.insertAdjacentElement('afterend',s);return true};const toast=msg=>{document.getElementById('TSL-toast')?.remove();if(!document.getElementById('TSL-style')){const st=document.createElement('style');st.id='TSL-style';st.textContent='@keyframes TSL-in{from{transform:translateY(-6px);opacity:0}to{transform:translateY(0);opacity:1}}#TSL-toast{position:fixed;top:24px;right:24px;background:#fff;color:#000;border:1px solid #000;padding:14px 18px;font-family:-apple-system,BlinkMacSystemFont,\"Hiragino Sans\",sans-serif;font-size:14px;line-height:1.5;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,0.18);animation:TSL-in .35s ease;max-width:320px;display:flex;align-items:center;gap:16px}#TSL-toast .x{background:none;border:none;color:#000;cursor:pointer;padding:0;font:inherit;font-size:16px;line-height:1}';document.head.appendChild(st)}const t=document.createElement('div');t.id='TSL-toast';t.innerHTML='<span></span><button class=\"x\">×</button>';t.querySelector('span').textContent=msg;t.querySelector('.x').onclick=()=>t.remove();document.body.appendChild(t);setTimeout(()=>t.remove(),6000)};try{const r=await fetch(\`https://api.x.com/graphql/zAz9764BcLZOJ0JU2wrd1A/TweetResultByRestId?variables=\${v}&features=\${f}\`,{headers:{authorization:'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA','x-csrf-token':ct0},credentials:'include'});const d=await r.json();const x=d?.data?.tweetResult?.result;const s=(x?.tweet||x)?.source;const l=s?.match(/>([^<]+)</)?.[1];if(l){if(!inject(l))toast(l)}else{toast('ソース情報を取得できませんでした')}}catch(e){toast('取得に失敗しました: '+e.message)}})()`;

  // Set bookmarklet href
  const bookmarklet = document.getElementById('bookmarklet');
  if (bookmarklet) {
    bookmarklet.href = 'javascript:' + encodeURI(minifiedCode);
    bookmarklet.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('ボタンをクリックではなく、ブックマークバーへドラッグしてください');
    });
  }

  // Display code in the code section
  const codeDisplay = document.getElementById('code-display');
  if (codeDisplay) {
    codeDisplay.textContent = minifiedCode;
  }

  // Copy code button
  const copyBtn = document.getElementById('copy-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('javascript:' + encodeURI(minifiedCode));
        copyBtn.textContent = 'コピーしました';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'コピー';
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (e) {
        copyBtn.textContent = 'コピー失敗';
        setTimeout(() => { copyBtn.textContent = 'コピー'; }, 2000);
      }
    });
  }

  // Toast for landing page
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Subtle scroll-triggered reveal
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('.section, .hero, .section-warnings');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    sections.forEach((section, i) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(12px)';
      section.style.transition = `opacity 0.6s ease ${i === 0 ? 0 : 0.04}s, transform 0.6s ease ${i === 0 ? 0 : 0.04}s`;
      observer.observe(section);
    });
  }
})();
