import { Injectable, inject } from '@angular/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

/** The permission strings the app checks (core/auth/permissions.dart). The backend enforces every one of them. */
export const P = {
  bookingView: 'Permissions.Booking.View',
  bookingCreate: 'Permissions.Booking.Create',
  bookingEdit: 'Permissions.Booking.Edit',
  bookingRefund: 'Permissions.Booking.Refund',
  customersView: 'Permissions.Customers.View',
  customersEdit: 'Permissions.Customers.Edit',
  walletView: 'Permissions.Wallet.View',
  walletEdit: 'Permissions.Wallet.Edit',
  companyView: 'Permissions.Company.View',
  companyCreate: 'Permissions.Company.Create',
  companyEdit: 'Permissions.Company.Edit',
  companyDelete: 'Permissions.Company.Delete',
  companyWalletView: 'Permissions.CompanyWallet.View',
  companyWalletCreate: 'Permissions.CompanyWallet.Create',
  travelReservationEdit: 'Permissions.TravelReservation.Edit',
  outingBookingEdit: 'Permissions.OutingBooking.Edit',
  hajjReservationEdit: 'Permissions.HajjReservation.Edit',
  usersView: 'Permissions.Users.View',
  usersCreate: 'Permissions.Users.Create',
  usersEdit: 'Permissions.Users.Edit',
  rolesView: 'Permissions.Roles.View',
  travelView: 'Permissions.Travel.View',
  travelCreate: 'Permissions.Travel.Create',
  travelEdit: 'Permissions.Travel.Edit',
  travelDelete: 'Permissions.Travel.Delete',
  outingsView: 'Permissions.Outings.View',
  outingsCreate: 'Permissions.Outings.Create',
  outingsEdit: 'Permissions.Outings.Edit',
  outingsDelete: 'Permissions.Outings.Delete',
  hajjView: 'Permissions.Hajj.View',
  hajjCreate: 'Permissions.Hajj.Create',
  hajjEdit: 'Permissions.Hajj.Edit',
  hajjDelete: 'Permissions.Hajj.Delete',
  hotelView: 'Permissions.Hotel.View',
  hotelEdit: 'Permissions.Hotel.Edit',
  roomsCreate: 'Permissions.Rooms.Create',
  roomsEdit: 'Permissions.Rooms.Edit',
  roomsDelete: 'Permissions.Rooms.Delete',
  couponsView: 'Permissions.Coupons.View',
  couponsCreate: 'Permissions.Coupons.Create',
  couponsEdit: 'Permissions.Coupons.Edit',
  homeContentView: 'Permissions.HomeContent.View',
  couponsDelete: 'Permissions.Coupons.Delete',
  financialView: 'Permissions.Financial.View',
  financialEdit: 'Permissions.Financial.Edit',
  emailView: 'Permissions.Email.View',
  emailEdit: 'Permissions.Email.Edit',
  notificationView: 'Permissions.Notification.View',
  notificationCreate: 'Permissions.Notification.Create',
  notificationDelete: 'Permissions.Notification.Delete',
  adCreate: 'Permissions.AD.Create',
  adEdit: 'Permissions.AD.Edit',
  searchView: 'Permissions.Search.View',
  searchEdit: 'Permissions.Search.Edit',
  scannerView: 'Permissions.Scanner.View',
  scannerEdit: 'Permissions.Scanner.Edit',
  customTripSettingView: 'Permissions.CustomTripSetting.View',
  vendorContractView: 'Permissions.VendorContract.View',
  policyView: 'Permissions.Policy.View',
  outingCategoryView: 'Permissions.OutingCategory.View',
  supportChatView: 'Permissions.SupportChat.View',
  supportChatReply: 'Permissions.SupportChat.Reply'
} as const;

/**
 * The signed-in account, read from what the dashboard's sign-in stored (Authentication/Webtoken answers the same
 * AuthResponse as the app's sign-in). A vendor's staff have a company; Trips admins have none.
 */
@Injectable({ providedIn: 'root' })
export class StaffSession {
  private readonly config = inject(ConfigureService);

  private get user(): any {
    return this.config.User() ?? {};
  }

  get username(): string {
    return this.user.username ?? '';
  }

  get email(): string | null {
    return this.user.email ?? null;
  }

  get phone(): string | null {
    return this.user.phoneNumber ?? null;
  }

  get roles(): string[] {
    return this.user.roles ?? [];
  }

  get permissions(): string[] {
    return this.user.permissions ?? [];
  }

  get companyId(): number | null {
    return this.user.companyId ?? null;
  }

  get isVendor(): boolean {
    return this.companyId != null || this.roles.some((r) => r.startsWith('Vendor.'));
  }

  /** Which modules a vendor sells (isTravelCommission, isOutCommission, ...). */
  get travel(): boolean {
    return !!this.user.isTravelCommission;
  }

  get outings(): boolean {
    return !!this.user.isOutCommission;
  }

  get hajj(): boolean {
    return !!this.user.isHajjCommission;
  }

  get hotels(): boolean {
    return !!this.user.isHotelCommission;
  }

  get acceptsCustomTrips(): boolean {
    return !!this.user.isAcceptingCustomTrip;
  }

  can(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
