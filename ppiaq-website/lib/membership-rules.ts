type MembershipPerson = {
  university?: string | null;
  nationality?: string | null;
};

const GRIFFITH_UNIVERSITY = 'griffith university';
const INDONESIAN_NATIONALITY_VALUES = new Set(['indonesia', 'indonesian', 'wni']);

const normalize = (value?: string | null): string =>
  String(value || '').trim().toLowerCase();

export const isGriffithUniversity = (university?: string | null): boolean =>
  normalize(university) === GRIFFITH_UNIVERSITY;

export const isIndonesianNationality = (nationality?: string | null): boolean =>
  INDONESIAN_NATIONALITY_VALUES.has(normalize(nationality));

/**
 * Business rule from PPIAQ:
 * Griffith University member list should only include Indonesian nationals.
 */
export const isEligibleForMembershipList = (person: MembershipPerson): boolean => {
  if (isGriffithUniversity(person.university)) {
    return isIndonesianNationality(person.nationality);
  }
  return true;
};
