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

  // === NEWS SYSTEM (Static fetch from provided URLs) ===
  const NEWS_SOURCES = [
    {
      url: 'https://www.bhaskar.com/local/bihar/siwan/news/bjps-sole-aim-is-to-serve-the-people-karanjit-singh-136255993.html',
      title: 'भाजपा का एकमात्र उद्देश्य जनता की सेवा करना : कर्णजीत सिंह',
      source: 'Dainik Bhaskar',
      excerpt: 'दरौंदा विधानसभा क्षेत्र के भाजपा प्रत्याशी एवं वर्तमान विधायक कर्णजीत सिंह उर्फ व्यास सिंह ने शनिवार को सिसवन प्रखंड के कचनार, भागर, शुभहाता, सरौत और विशुनपुरा गांवों में जनसंपर्क किया। उन्होंने एनडीए सरकार की उपलब्धियों को गिनाया और वोट की अपील की। "एनडीए की सरकार ने गांवों के विकास, किसानों की समृद्धि और युवाओं के रोजगार के लिए निरंतर कार्य किया है।"',
      date: 'Siwan, 4 days ago',
      fullLink: 'https://www.bhaskar.com/local/bihar/siwan/news/bjps-sole-aim-is-to-serve-the-people-karanjit-singh-136255993.html'
    },
    {
      url: 'https://www.livehindustan.com/assembly-elections/bihar-elections/constituency/daraundha',
      title: 'दरौंदा विधानसभा चुनाव 2025 - Karanjit Singh Wins',
      source: 'Live Hindustan',
      excerpt: '2025 चुनाव में BJP के कर्णजीत सिंह उर्फ व्यास सिंह विजेता बने। अमरनाथ यादव (CPI(ML)) को 11,320 वोटों (7.20%) से हराया। कुल वोट: 157,705 | मतदाता: 313,947 | जिला: सिवान। 2020 में भी इसी अंतर से जीत।',
      date: 'Daraundha Election Results 2025',
      fullLink: 'https://www.livehindustan.com/assembly-elections/bihar-elections/constituency/daraundha'
    }
  ];

  async function fetchKaranjitNews() {
    newsContainer.innerHTML = '<p class="loading">Loading latest Karanjit Singh news...</p>';
    
    try {
      // For demo/static, use pre-extracted data; in production, fetch and parse HTML if needed
      // Here, we use the reliable extracted content directly for stability
      const newsHtml = NEWS_SOURCES.map(item => `
        <div class="news-item">
          <div class="news-source">${item.source}</div>
          <div class="news-content">
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            <div class="news-meta">
              <span>${item.date}</span> | 
              <a href="${item.fullLink}" target="_blank">Read more →</a>
            </div>
          </div>
        </div>
      `).join('');

      newsContainer.innerHTML = newsHtml;
    } catch (error) {
      // Fallback to static document content if fetch fails
      newsContainer.innerHTML = `
        <div class="error">
          <p>Failed to load live news. Here's the latest on Karanjit Singh:</p>
          <p><strong>From Bhaskar:</strong> भाजपा का एकमात्र उद्देश्य जनता की सेवा करना : कर्णजीत सिंह (Siwan, recent). NDA achievements highlighted in village outreach.</p>
          <p><strong>From Live Hindustan:</strong> Karanjit Singh (BJP) wins Daraundha 2025 by 11,320 votes vs. Amar Nath Yadav. Total votes: 157,705.</p>
        </div>
      `;
      console.error("News fetch error:", error);
    }
  }

  // Load news immediately
  fetchKaranjitNews();

  // Auto-refresh every 30 minutes (1800000 ms)
  setInterval(fetchKaranjitNews, 30 * 60 * 1000);
});
