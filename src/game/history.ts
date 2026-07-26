export function isNarrativeEventId(eventId: string) {
  return !eventId.startsWith('training-') && !eventId.startsWith('transfer-')
}
