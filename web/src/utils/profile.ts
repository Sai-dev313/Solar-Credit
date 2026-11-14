/** Two-letter initials for an avatar, ignoring suffixes like "(Producer)". */
export const getInitials = (fullName: string): string => {
  const words = fullName
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
};

/** Display name without role suffixes like "(Producer)". */
export const displayName = (fullName: string): string =>
  fullName.replace(/\s*\(.*?\)\s*/g, ' ').trim() || fullName;
