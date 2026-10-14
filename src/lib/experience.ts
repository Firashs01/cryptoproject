export const EXPERIENCE_VALUES = ['safe', 'inexperienced', 'scam'] as const;

export type Experience = (typeof EXPERIENCE_VALUES)[number];

export const UNKNOWN_BORDER_CLASS = 'card--unknown';

const BORDER_CLASS: Record<Experience, string> = {
  safe: 'card--safe',
  inexperienced: 'card--inexperienced',
  scam: 'card--scam',
};

export function isExperience(value: unknown): value is Experience {
  return (
    typeof value === 'string' &&
    (EXPERIENCE_VALUES as readonly string[]).includes(value)
  );
}

export function resolveExperienceBorder(
  title: string,
  experience: unknown
): string {
  if (isExperience(experience)) {
    return BORDER_CLASS[experience];
  }

  const reason =
    experience === undefined || experience === null
      ? 'is missing'
      : `has an invalid value (${JSON.stringify(experience)})`;

  console.warn(
    `[experience] Project "${title.trim()}" ${reason}. ` +
      `Falling back to a neutral gray border. ` +
      `Allowed values: ${EXPERIENCE_VALUES.join(', ')}.`
  );

  return UNKNOWN_BORDER_CLASS;
}
