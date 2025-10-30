// script.js
document.addEventListener('DOMContentLoaded', () => {
  const voteBtn = document.getElementById('voteBtn');
  const voteCount = document.getElementById('voteCount');

  let hasVoted = localStorage.getItem('hasVoted') === 'true';
  if (hasVoted) {
    voteBtn.classList.add('voted');
    voteBtn.disabled = true;
  }

  async function loadVotes() {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      voteCount.textContent = data.votes;
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
        voteBtn.querySelector('.btn-success').style.display = 'block';
        voteBtn.querySelector('.btn-text').style.display = 'none';
        voteCount.textContent = data.votes; // Now exists!
      } else {
        throw new Error('Vote failed');
      }
    } catch (e) {
      alert('Vote failed. Try again.');
      voteBtn.disabled = false;
      voteBtn.querySelector('.btn-text').textContent = 'Vote Now';
    }
  }

  loadVotes();
  voteBtn.addEventListener('click', incrementVote);
});
