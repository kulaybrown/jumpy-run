export const assetPath = (path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${normalizedPath}`;
};
