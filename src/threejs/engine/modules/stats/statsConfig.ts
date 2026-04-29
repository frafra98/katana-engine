import Stats from 'stats.js';

export const initStats = () => {
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  // Move to bottom-right
  stats.dom.style.position = 'fixed';
  stats.dom.style.left = '0px';
  stats.dom.style.bottom = '0px';
  stats.dom.style.left = 'auto';
  stats.dom.style.top = 'auto';

  return stats;
};
