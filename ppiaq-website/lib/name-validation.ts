const INVALID_NAME_TOKENS = new Set(['na', 'n/a']);

const normalizeNameToken = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s+/g, '');
};

export const isInvalidNameValue = (value: string): boolean => {
  const normalized = normalizeNameToken(value);
  if (!normalized) return true;
  return INVALID_NAME_TOKENS.has(normalized);
};

export const validateFirstLastName = (firstName: string, lastName: string): string | null => {
  if (isInvalidNameValue(firstName) || isInvalidNameValue(lastName)) {
    return 'First name and last name cannot be empty or N/A';
  }
  return null;
};

