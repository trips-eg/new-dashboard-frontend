// The enums of the app (shared/models/enums.dart), with their colours and APP.* string keys.

export type Tone = 'ok' | 'pending' | 'cancelled' | 'done' | 'danger' | 'info' | 'neutral' | 'gold';

/** StaffItemType in C#: the numbers used by every /api/staff/items|products|analytics route. */
export interface ItemTypeInfo {
  value: number;
  listKey: string;
  color: string;
  bg: string;
  icon: string;
  label: string;
  plural: string;
}

export const ITEM_TYPES: ItemTypeInfo[] = [
  { value: 1, listKey: 'trips', color: 'var(--ts-trip)', bg: 'var(--ts-trip-bg)', icon: 'ti ti-plane-departure', label: 'APP.moduleTrip', plural: 'APP.trips' },
  { value: 2, listKey: 'outings', color: 'var(--ts-outing)', bg: 'var(--ts-outing-bg)', icon: 'ti ti-compass', label: 'APP.moduleOuting', plural: 'APP.outings' },
  { value: 3, listKey: 'hotels', color: 'var(--ts-hotel)', bg: 'var(--ts-hotel-bg)', icon: 'ti ti-bed', label: 'APP.moduleHotel', plural: 'APP.hotels' },
  { value: 4, listKey: 'hajj', color: 'var(--ts-hajj)', bg: 'var(--ts-hajj-bg)', icon: 'ti ti-moon', label: 'APP.moduleHajj', plural: 'APP.hajjUmrah' }
];

export function itemType(v: number | null | undefined): ItemTypeInfo {
  return ITEM_TYPES.find((t) => t.value === v) ?? ITEM_TYPES[0];
}

export function itemTypeByKey(key: string): ItemTypeInfo | undefined {
  return ITEM_TYPES.find((t) => t.listKey === key);
}

/** BookingStatus in C# (Pending 1 … InstaRefunded 10). */
export const BookingStatus = {
  pending: 1,
  confirmed: 2,
  cancelled: 3,
  completed: 4,
  refunded: 5,
  instaPending: 6,
  instaConfirmed: 7,
  instaCancelled: 8,
  instaCompleted: 9,
  instaRefunded: 10,
  tone(s: number): Tone {
    switch (s) {
      case 4:
      case 9:
      case 2:
      case 7:
        return 'ok';
      case 6:
        return 'pending';
      case 1:
        return 'cancelled';
      case 5:
      case 10:
        return 'done';
      default:
        return 'danger';
    }
  }
};

/** PayMethod in C#. 1–7 go through EasyKash, 8 is InstaPay. */
export const PayMethod = {
  card: 1,
  referenceCode: 2,
  shahry: 3,
  valu: 4,
  mobileWallet: 5,
  installment: 6,
  vodafoneCash: 7,
  instaPay: 8,
  easyKashMethods: [1, 2, 5, 7, 4, 3, 6],
  /** An APP.* key, or a brand name shown as is. */
  label(m: number): string {
    switch (m) {
      case 1:
        return 'APP.payCard';
      case 2:
        return 'APP.payFawry';
      case 3:
        return 'Shahry';
      case 4:
        return 'valU';
      case 5:
        return 'APP.payMobileWallet';
      case 6:
        return 'APP.payInstallment';
      case 7:
        return 'Vodafone Cash';
      case 8:
        return 'APP.payInstaPay';
      default:
        return '—';
    }
  }
};

/** ProductLifecycle in C#. */
export const Lifecycle = {
  active: 1,
  expired: 2,
  in7: 3,
  in30: 4,
  noDates: 5,
  tone(v: number): Tone {
    return v === 1 ? 'ok' : v === 2 ? 'danger' : v === 3 || v === 4 ? 'pending' : 'cancelled';
  },
  label(v: number): string {
    return v === 1 ? 'APP.lifeActive' : v === 2 ? 'APP.lifeExpired' : v === 3 ? 'APP.lifeIn7' : v === 4 ? 'APP.lifeIn30' : 'APP.lifeNoDates';
  }
};

/** VendorSettlementStatus in C#. */
export const SettlementStatus = {
  notSettled: 0,
  partial: 1,
  full: 2,
  tone(v: number): Tone {
    return v === 2 ? 'ok' : v === 1 ? 'pending' : 'cancelled';
  },
  label(v: number): string {
    return v === 2 ? 'APP.settledFull' : v === 1 ? 'APP.settledPartial' : 'APP.notSettled';
  }
};

/** WalletAdjustmentReason in C#. */
export const AdjustReason = {
  all: [1, 2, 3, 4, 5],
  label(r: number): string {
    return r === 1 ? 'APP.reasonCompensation' : r === 2 ? 'APP.reasonRefund' : r === 3 ? 'APP.reasonCorrection' : r === 4 ? 'APP.reasonGift' : 'APP.reasonOther';
  }
};
