const input = document.querySelector('#ghost-search');
const rows = [...document.querySelectorAll('tbody tr')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#no-results');

input?.addEventListener('input', () => {
  const query = input.value.trim().toLowerCase();
  let visible = 0;
  for (const row of rows) {
    const match = row.dataset.search.includes(query);
    row.hidden = !match;
    if (match) visible += 1;
  }
  count.textContent = `Showing ${visible} ${visible === 1 ? 'ghost' : 'ghosts'}.`;
  empty.hidden = visible !== 0;
});
