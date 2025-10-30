document.addEventListener('DOMContentLoaded', () => {
  const voteBtn = document.getElementById('voteBtn');
  const voteCount = document.getElementById('voteCount');
  const newsContainer = document.getElementById('newsContainer');

  let hasVoted = localStorage.getItem('hasVoted') === 'true';
  if (hasVoted) {
    voteBtn.classList.add('voted');
    voteBtn.disabled = true;
    voteBtn.querySelector('.btn-success').style.display = 'inline';
    voteBtn.querySelector('.btn-text').style.display = 'none';
  }

  // === VOTING SYSTEM ===
  async function loadVotes() {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      voteCount.textContent = data.votes || 0;
    } catch (e) {
      voteCount.textContent = 'Error';
    }
  }

  async function incrementVote() {
    if (hasVoted) return;

    voteBtn.disabled = true;
    voteBtn.querySelector('.btn-text').textContent = 'Voting...';

    try {
      const res = await fetch('/api/vote', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        hasVoted = true;
        localStorage.setItem('hasVoted', 'true');
        voteBtn.classList.add('voted');
        voteBtn.querySelector('.btn-success').style.display = 'inline';
        voteBtn.querySelector('.btn-text').style.display = 'none';
        voteCount.textContent = data.votes;
      } else {
        throw new Error('Vote failed');
      }
    } catch (e) {
      alert('Vote failed. Try again.');
      voteBtn.disabled = false;
      voteBtn.querySelector('.btn-text').textContent = 'Vote Now';
    }
  }

  voteBtn.addEventListener('click', incrementVote);
  loadVotes();

  // === NEWS SYSTEM ===
  const RSS_FEED_URL = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frss.feedspot.com%2Fnda_news_rss%2F";

  async function fetchNDANews() {
    newsContainer.innerHTML = '<p class="loading">Loading latest NDA news...</p>';
    
    try {
      const res = await fetch(RSS_FEED_URL);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        throw new Error("No news found");
      }

      const latestNews = data.items.slice(0, 6); // Show top 6
      newsContainer.innerHTML = latestNews.map(item => `
        <div class="news-item">
          ${item.enclosure?.link ? `<img src="${item.enclosure.link}" alt="${item.title}">` : ''}
          <div class="news-content">
            <h3>${item.title}</h3>
            <p>${item.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
            <div class="news-meta">
              <span>${new Date(item.pubDate).toLocaleDateString('en-IN')}</span> | 
              <a href="${item.link}" target="_blank">Read more →</a>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      newsContainer.innerHTML = '<p class="error">Failed to load news. Please try again later.</p>';
      console.error("News fetch error:", error);
    }
  }

  // Load news immediately
  fetchNDANews();

  // Auto-refresh every 30 minutes (1800000 ms)
  setInterval(fetchNDANews, 30 * 60 * 1000);
});
