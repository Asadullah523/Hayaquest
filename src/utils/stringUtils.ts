export const normalizeName = (name: string): string => {
    if (!name) return '';
    return name.trim().toLowerCase();
};
