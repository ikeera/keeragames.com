document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  async function fetchSteamRating() {
    const steamRatingEl = document.getElementById('steam-rating');
    if (!steamRatingEl) return;

    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://store.steampowered.com/appreviews/4312280?json=1&language=all&purchase_type=all')}`);
      if (!res.ok) return;
      const data = await res.json();
      const rawJson = JSON.parse(data.contents);

      if (rawJson && rawJson.success === 1 && rawJson.query_summary) {
        const summary = rawJson.query_summary;
        const total = summary.total_reviews || 0;
        const desc = summary.review_score_desc || 'Positive';
        if (total > 0) {
          steamRatingEl.textContent = `${desc} (${total} reviews)`;
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async function fetchItchRating(gameName, badgeEl) {
    if (!badgeEl) return;
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://keeragames.itch.io/' + gameName)}`);
      if (!res.ok) return;
      const data = await res.json();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
      
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent);
          if (json && json.aggregateRating) {
            const val = parseFloat(json.aggregateRating.ratingValue).toFixed(1);
            const count = json.aggregateRating.ratingCount;
            if (val && count) {
              badgeEl.textContent = `★ ${val} (${count} reviews)`;
              break;
            }
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn(err);
      const fallback = badgeEl.getAttribute('data-fallback');
      if (fallback) badgeEl.textContent = fallback;
    }
  }

  fetchSteamRating();

  document.querySelectorAll('.rating-itch').forEach(badge => {
    const cardEl = badge.closest('.game-card');
    if (cardEl) {
      const itchName = cardEl.getAttribute('data-itch');
      if (itchName) fetchItchRating(itchName, badge);
    }
  });
});
