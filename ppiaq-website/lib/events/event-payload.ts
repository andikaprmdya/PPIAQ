type EventStatusValue = 'DRAFT' | 'PUBLISHED';

type LocalizedText = {
  id: string;
  en: string;
};

type EventPayloadRecord = Record<string, unknown>;

const VALID_EVENT_STATUSES = new Set<EventStatusValue>(['DRAFT', 'PUBLISHED']);

export class EventPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventPayloadError';
  }
}

function isRecord(value: unknown): value is EventPayloadRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: EventPayloadRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLocalizedText(value: unknown): LocalizedText {
  if (isRecord(value)) {
    return {
      id: asTrimmedString(value.id),
      en: asTrimmedString(value.en),
    };
  }

  const text = asTrimmedString(value);
  return { id: text, en: text };
}

function hasLocalizedText(value: LocalizedText): boolean {
  return Boolean(value.id || value.en);
}

function normalizeEventStatus(value: unknown): EventStatusValue {
  const normalized = asTrimmedString(value || 'DRAFT').toUpperCase();
  if (VALID_EVENT_STATUSES.has(normalized as EventStatusValue)) {
    return normalized as EventStatusValue;
  }

  throw new EventPayloadError('Status must be DRAFT or PUBLISHED');
}

export function normalizeEventCreatePayload(body: unknown, createdBy: string): EventPayloadRecord {
  if (!isRecord(body)) {
    throw new EventPayloadError('Invalid event payload');
  }

  const day = asTrimmedString(body.day);
  const month = asTrimmedString(body.month);
  const title = normalizeLocalizedText(body.title);
  const date = asTrimmedString(body.date);
  const organizer = asTrimmedString(body.organizer) || 'Other';
  const location = normalizeLocalizedText(body.location);
  const description = normalizeLocalizedText(body.description);
  const image = typeof body.image === 'string' ? body.image : '';
  const registrationUrl = asTrimmedString(body.registrationUrl);
  const status = normalizeEventStatus(body.status);

  if (!day || !month || !date || !hasLocalizedText(title) || !hasLocalizedText(location)) {
    throw new EventPayloadError('Missing required fields: day, month, title, date, and location');
  }

  return {
    day,
    month,
    title,
    date,
    organizer,
    location,
    description,
    image,
    registrationUrl: registrationUrl || undefined,
    status,
    createdBy,
  };
}

export function normalizeEventUpdatePayload(body: unknown): EventPayloadRecord {
  if (!isRecord(body)) {
    throw new EventPayloadError('Invalid event payload');
  }

  const updates: EventPayloadRecord = {};

  if (hasOwn(body, 'day')) updates.day = asTrimmedString(body.day);
  if (hasOwn(body, 'month')) updates.month = asTrimmedString(body.month);
  if (hasOwn(body, 'title')) updates.title = normalizeLocalizedText(body.title);
  if (hasOwn(body, 'date')) updates.date = asTrimmedString(body.date);
  if (hasOwn(body, 'organizer')) updates.organizer = asTrimmedString(body.organizer) || 'Other';
  if (hasOwn(body, 'location')) updates.location = normalizeLocalizedText(body.location);
  if (hasOwn(body, 'description')) updates.description = normalizeLocalizedText(body.description);
  if (hasOwn(body, 'image')) updates.image = typeof body.image === 'string' ? body.image : '';
  if (hasOwn(body, 'registrationUrl')) {
    const registrationUrl = asTrimmedString(body.registrationUrl);
    updates.registrationUrl = registrationUrl || null;
  }
  if (hasOwn(body, 'status')) updates.status = normalizeEventStatus(body.status);

  const title = updates.title as LocalizedText | undefined;
  const location = updates.location as LocalizedText | undefined;
  if (
    updates.day === '' ||
    updates.month === '' ||
    updates.date === '' ||
    (title && !hasLocalizedText(title)) ||
    (location && !hasLocalizedText(location))
  ) {
    throw new EventPayloadError('Missing required fields: day, month, title, date, and location');
  }

  return updates;
}
