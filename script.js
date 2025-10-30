const voteBtn = document.getElementById('voteBtn');
const voteCountEl = document.getElementById('voteCount');
let hasVoted = localStorage.getItem('hasVoted') === 'true';

// Disable button if already voted
if (hasVoted) {
  voteBtn.classList.add('voted');
  voteBtn.disabled = true;
  voteBtn.querySelector('.btn-text').textContent = 'Already Voted';
}

async function fetchVotes() {
  try {
    const res = await fetch('/api/vote');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    voteCountEl.textContent = data.votes ?? 0;
  } catch (err) {
    console.error('Fetch votes failed:', err);
    voteCountEl.textContent = 'Error';
  }
}

async function castVote() {
  if (hasVoted) return;

  voteBtn.disabled = true;
  voteBtn.querySelector('.btn-text').textContent = 'Voting...';

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      hasVoted = true;
      localStorage.setItem('hasVoted', 'true');
      voteBtn.classList.add('voted');
      voteBtn.querySelector('.btn-success').style.display = 'block';
      voteBtn.querySelector('.btn-text').style.display = 'none';
      voteCountEl.textContent = data.votes || (parseInt(voteCountEl.textContent) + 1);
    } else {
      throw new Error(data.error || 'Vote failed');
    }
  } catch (err) {
    console.error('Vote error:', err);
    alert('Vote failed: ' + err.message + '\nCheck console (F12) for details.');
    voteBtn.disabled = false;
    voteBtn.querySelector('.btn-text').textContent = 'Try Again';
  }
}

voteBtn.addEventListener('click', castVote);
fetchVotes();
