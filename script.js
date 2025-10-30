// script.js
document.addEventListener('DOMContentLoaded', () => {
  const voteBtn = document.getElementById('voteBtn');      // matches HTML
  const voteCount = document.getElementById('voteCount'); // matches HTML

  // Prevent double-voting on the same browser
  const hasVoted = localStorage.getItem('hasVoted') === 'true';
  if (hasVoted) {
    voteBtn.classList.add('voted');
    voteBtn.disabled = true;
  }

  // ---- Load current total ----
  async function loadVotes() {
    try {
      const res = await fetch('/api/vote');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      voteCount.textContent = data.votes;
    } catch (e) {
      voteCount.textContent = 'Error';
      console.error('loadVotes error:', e);
    }
  }

  // ---- Cast a vote ----
  async function incrementVote() {
    if (hasVoted) return;

    voteBtn.textContent = 'Voting...';
    voteBtn.disabled = true;

    try {
      const res = await fetch('/api/vote', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('hasVoted', 'true');
        voteBtn.classList.add('voted');
        voteBtn.querySelector('.btn-success').style.display = 'block';
        voteBtn.querySelector('.btn-text').style.display = 'none';
        voteCount.textContent = data.votes;
      } else {
        throw new Error(data.error || 'Vote failed');
      }
    } catch (e) {
      alert('Vote failed – check your connection and try again.');
      console.error('incrementVote error:', e);
    } finally {
      // only re-enable if something went wrong
      if (!hasVoted) {
        voteBtn.textContent = 'Vote Now';
        voteBtn.disabled = false;
      }
    }
  }

  // ---- Wire up ----
  loadVotes();
  voteBtn.addEventListener('click', incrementVote);
});
