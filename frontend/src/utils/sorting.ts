/**
 * Utility function for case-insensitive alphabetical sorting by name
 */
export function sortByNameCaseInsensitive<T extends { name: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, {
      sensitivity: "base",
    })
  );
}

/**
 * Sort array of items by a string property case-insensitively
 */
export function sortByPropertyCaseInsensitive<T>(
  items: T[],
  property: keyof T
): T[] {
  return [...items].sort((a, b) => {
    const aVal = String(a[property] || "").toLowerCase();
    const bVal = String(b[property] || "").toLowerCase();
    return aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
  });
}
