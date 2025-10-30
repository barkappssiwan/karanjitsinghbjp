const voteBtn = document.getElementById('voteBtn');
const voteCountEl = document.getElementById('voteCount');
let hasVoted = false;

// Check if already voted (using localStorage)
if (localStorage.getItem('hasVoted')) {
  hasVoted = true;
  voteBtn.classList.add('voted');
  voteBtn.disabled = true;
}

// Fetch current vote count
async function fetchVotes() {
  try {
    const res = await fetch('/api/vote');
    const data = await res.json();
    voteCountEl.textContent = data.votes || 0;
  } catch (err) {
    console.error('Failed to fetch votes:', err);
  }
}

// Handle vote
async function castVote() {
  if (hasVoted) return;

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      hasVoted = true;
      localStorage.setItem('hasVoted', 'true');
      voteBtn.classList.add('voted');
      voteBtn.disabled = true;
      fetchVotes(); // Update count
    }
  } catch (err) {
    alert('Failed to record vote. Please try again.');
  }
}

// Event Listeners
voteBtn.addEventListener('click', castVote);

// Load initial vote count
fetchVotes();
