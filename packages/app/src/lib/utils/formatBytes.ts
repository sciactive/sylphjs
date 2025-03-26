export function formatBytes(bytes: number) {
  const KB = 1000;
  const MB = KB * 1000;
  const GB = MB * 1000;
  const TB = GB * 1000;

  if (bytes > TB) {
    return `${Math.round((bytes / TB) * 100) / 100}TB`;
  } else if (bytes > GB) {
    return `${Math.round((bytes / GB) * 100) / 100}GB`;
  } else if (bytes > MB) {
    return `${Math.round((bytes / MB) * 100) / 100}MB`;
  } else if (bytes > KB) {
    return `${Math.round((bytes / KB) * 100) / 100}KB`;
  } else {
    return `${bytes}B`;
  }
}
