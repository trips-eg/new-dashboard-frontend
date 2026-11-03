import { Tone } from '../core/enums';

/**
 * How a custom trip request reads on screen, from the fields the APIs already send (status, isAcceptingOffers,
 * offerWindowExpiresAt, offers). Labels are APP.* translation keys.
 *
 * CustomTripRequestStatus: 1 submitted, 2 receiving offers, 3 closed, 4 cancelled, 5 offer selected, 6 booked,
 * 7 unavailable. The four steps: submitted, receiving offers, the customer choosing, booked.
 */
export interface RequestView {
  label: string;
  tone: Tone;
  /** The current step (1–4), 5 when booked; 0 for a closed request (no step is current). */
  step: number;
  closed: boolean;
  /** The colour of the list card's edge. */
  edge: string;
}

export function requestView(r: any): RequestView {
  const offers = r?.offersCount ?? r?.offers?.length ?? 0;
  switch (r?.status) {
    case 6:
      return { label: 'APP.rqBooked', tone: 'ok', step: 5, closed: false, edge: 'var(--ts-ok-fg)' };
    case 5:
      return { label: 'APP.rqOfferChosen', tone: 'done', step: 4, closed: false, edge: 'var(--ts-done-fg)' };
    case 3:
      return { label: 'APP.rqClosed', tone: 'cancelled', step: 0, closed: true, edge: 'var(--ts-canc-line)' };
    case 4:
      return { label: 'APP.rqCancelled', tone: 'cancelled', step: 0, closed: true, edge: 'var(--ts-canc-line)' };
    case 7:
      return { label: 'APP.requestUnavailable', tone: 'cancelled', step: 0, closed: true, edge: 'var(--ts-canc-line)' };
  }
  if (r?.isAcceptingOffers)
    return offers > 0
      ? { label: 'APP.rqReceivingOffers', tone: 'pending', step: 2, closed: false, edge: 'var(--ts-pend-dot)' }
      : { label: 'APP.rqNeedsOffers', tone: 'pending', step: 2, closed: false, edge: 'var(--ts-danger)' };
  return offers > 0
    ? { label: 'APP.rqCustomerChoosing', tone: 'pending', step: 3, closed: false, edge: 'var(--ts-pend-dot)' }
    : { label: 'APP.rqNoOffersInTime', tone: 'danger', step: 2, closed: false, edge: 'var(--ts-danger)' };
}

/** Hours left for offers while the window is open (null once it is closed). */
export function hoursLeft(r: any): number | null {
  if (!r?.isAcceptingOffers) return null;
  const s = r.remainingSeconds ?? (r.offerWindowExpiresAt ? (new Date(r.offerWindowExpiresAt).getTime() - Date.now()) / 1000 : 0);
  return s > 0 ? Math.max(1, Math.ceil(s / 3600)) : null;
}

export interface OfferView {
  offer: any;
  /** The lowest believable price. */
  best: boolean;
  /** A price no one could mean (1 EGP with "not available", or far under the others). */
  odd: boolean;
  /** How much more than the best offer. */
  overBest: number | null;
  perPerson: number | null;
}

/** Offers from the cheapest, with the cheapest believable one marked; odd prices are flagged and listed last. */
export function offerViews(offers: any[] | null | undefined, travellers: number): OfferView[] {
  const list = [...(offers ?? [])].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const prices = list.map((o) => o.price ?? 0).filter((p) => p > 0).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  const odd = (o: any) => (o.price ?? 0) <= 10 || (list.length > 1 && median > 0 && o.price < median * 0.2);
  const best = list.find((o) => !odd(o));
  // Believable prices first; the odd ones go last, still flagged
  list.sort((a, b) => Number(odd(a)) - Number(odd(b)));
  return list.map((o) => ({
    offer: o,
    best: o === best && list.length > 1,
    odd: odd(o),
    overBest: best && o !== best && !odd(o) ? (o.price ?? 0) - (best.price ?? 0) : null,
    perPerson: travellers > 0 && !odd(o) ? Math.round((o.price ?? 0) / travellers) : null
  }));
}

/** VendorTripOfferStatus: 1 waiting for the customer, 2 accepted, 3 rejected, 4 chosen by the customer. */
export function offerStatus(status: number): { label: string; tone: Tone } {
  switch (status) {
    case 2:
      return { label: 'APP.rqOfferAccepted', tone: 'ok' };
    case 3:
      return { label: 'APP.rqOfferRejected', tone: 'cancelled' };
    case 4:
      return { label: 'APP.rqOfferChosenByCustomer', tone: 'ok' };
    default:
      return { label: 'APP.rqWaitingCustomer', tone: 'pending' };
  }
}

/** An Egyptian mobile as the customer typed it (1003314343, 01003314343, +201003314343) → wa.me digits; null otherwise. */
export function whatsAppNumber(phone: string | null | undefined): string | null {
  const d = (phone ?? '').replace(/\D/g, '');
  if (/^1\d{9}$/.test(d)) return '20' + d;
  if (/^01\d{9}$/.test(d)) return '2' + d;
  if (/^201\d{9}$/.test(d)) return d;
  return null;
}
