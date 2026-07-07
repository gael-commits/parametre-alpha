// Motion-lab VT demo: carries the ?mode= choice across ClientRouter navigations.
// 'balayage' switches the View Transition CSS (html[data-vt]) from the default
// cross-fade to the ink wipe. astro:page-load fires on initial load AND every swap.
function applyMode(): void {
  const mode = new URLSearchParams(location.search).get('mode') === 'balayage' ? 'balayage' : '';
  if (mode) document.documentElement.setAttribute('data-vt', mode);
  else document.documentElement.removeAttribute('data-vt');

  // The page-to-page link keeps the current mode; the mode links mark the active one.
  document.querySelectorAll<HTMLAnchorElement>('[data-vt-nav]').forEach((a) => {
    const url = new URL(a.getAttribute('href')!, location.origin);
    if (mode) url.searchParams.set('mode', mode);
    else url.searchParams.delete('mode');
    a.href = url.pathname + url.search;
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-vt-mode]').forEach((a) => {
    a.style.borderBottomColor = a.dataset.vtMode === (mode || 'fondu') ? 'var(--color-ink)' : '';
  });
}

document.addEventListener('astro:page-load', applyMode);
