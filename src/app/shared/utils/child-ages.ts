/**
 * The ages of a reservation's children, as "5, 7": from countDetails.childAges (the booking lists) or childAges
 * (an array, or the stored "5,7" text). Empty when there are none, so the badge can hide.
 */
export function childAgesText(reservation: any): string {
  const raw = reservation?.countDetails?.childAges ?? reservation?.childAges;
  const ages: unknown[] = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [];
  return ages
    .map((a) => String(a).trim())
    .filter((a) => a !== '')
    .join('، ');
}
