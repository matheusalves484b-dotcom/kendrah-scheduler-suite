
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const ensureUniqueSlug = async (
  baseSlug: string,
  tableName: 'profiles' | 'services',
  excludeId?: string
): Promise<string> => {
  // This would typically check against the database
  // For now, we'll return the baseSlug as the database function handles uniqueness
  return baseSlug;
};
