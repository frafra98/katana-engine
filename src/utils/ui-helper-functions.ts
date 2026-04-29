function toHex(v: number) {
  return v.toString(16).padStart(2, '0');
}

export function lightenHex(hex: string, percent = 0.2) {
  // Remove #
  hex = hex.replace('#', '');

  // Parse RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Move each channel toward 255
  r = Math.round(r + (255 - r) * percent);
  g = Math.round(g + (255 - g) * percent);
  b = Math.round(b + (255 - b) * percent);

  // Convert back to hex
  //   const toHex = (v) => v.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function darkenHex(hex: string, percent = 0.2) {
  hex = hex.replace('#', '');

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  r = Math.round(r * (1 - percent));
  g = Math.round(g * (1 - percent));
  b = Math.round(b * (1 - percent));

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function adjustHex(hex: string, percent: number) {
  hex = hex.replace('#', '');

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  if (percent > 0) {
    r += (255 - r) * percent;
    g += (255 - g) * percent;
    b += (255 - b) * percent;
  } else {
    r *= 1 + percent;
    g *= 1 + percent;
    b *= 1 + percent;
  }

  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
