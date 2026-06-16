import { Injectable } from '@angular/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { BehaviorSubject } from 'rxjs';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  icon?: string;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  permissions?: string[]; // to manage permissions instead of roles
}

export interface Navigation extends NavigationItem {
  children?: NavigationItem[];
}

// Define permission constants
export const Permissions = {
  //home
  HomeView: 'Permissions.Home.View',
  // User permissions
  UsersView: 'Permissions.Users.View',
  UsersCreate: 'Permissions.Users.Create',
  UsersManage: 'Permissions.Users.ManageRoles',
  UsersEdit: 'Permissions.Users.Edit',
  UsersDelete: 'Permissions.Users.Delete',

  // Role permissions
  RolesView: 'Permissions.Roles.View',
  RolesCreate: 'Permissions.Roles.Create',
  RolesEdit: 'Permissions.Roles.Edit',
  RolesDelete: 'Permissions.Roles.Delete',

  // Trip permissions
  TripView: 'Permissions.Trip.View',
  TripCreate: 'Permissions.Trip.Create',
  TripEdit: 'Permissions.Trip.Edit',
  TripDelete: 'Permissions.Trip.Delete',

  // TripImage permissions
  TripImageView: 'Permissions.TripImage.View',
  TripImageCreate: 'Permissions.TripImage.Create',
  TripImageEdit: 'Permissions.TripImage.Edit',
  TripImageDelete: 'Permissions.TripImage.Delete',

  // TripReservation permissions
  TripReservationView: 'Permissions.TripReservation.View',
  TripReservationCreate: 'Permissions.TripReservation.Create',
  TripReservationEdit: 'Permissions.TripReservation.Edit',
  TripReservationDelete: 'Permissions.TripReservation.Delete',

  // ProgramSteps permissions
  ProgramStepsView: 'Permissions.ProgramSteps.View',
  ProgramStepsCreate: 'Permissions.ProgramSteps.Create',
  ProgramStepsEdit: 'Permissions.ProgramSteps.Edit',
  ProgramStepsDelete: 'Permissions.ProgramSteps.Delete',

  // BedType permissions
  BedTypeView: 'Permissions.BedType.View',
  BedTypeCreate: 'Permissions.BedType.Create',
  BedTypeEdit: 'Permissions.BedType.Edit',
  BedTypeDelete: 'Permissions.BedType.Delete',

  // Booking permissions
  BookingView: 'Permissions.Booking.View',
  BookingCreate: 'Permissions.Booking.Create',
  BookingEdit: 'Permissions.Booking.Edit',
  BookingDelete: 'Permissions.Booking.Delete',

  // Cart permissions
  CartView: 'Permissions.Cart.View',
  CartCreate: 'Permissions.Cart.Create',
  CartEdit: 'Permissions.Cart.Edit',
  CartDelete: 'Permissions.Cart.Delete',

  // City permissions
  CityView: 'Permissions.City.View',
  CityCreate: 'Permissions.City.Create',
  CityEdit: 'Permissions.City.Edit',
  CityDelete: 'Permissions.City.Delete',

  // Country permissions
  CountryView: 'Permissions.Country.View',
  CountryCreate: 'Permissions.Country.Create',
  CountryEdit: 'Permissions.Country.Edit',
  CountryDelete: 'Permissions.Country.Delete',

  // Company permissions
  CompanyView: 'Permissions.Company.View',
  CompanyCreate: 'Permissions.Company.Create',
  CompanyEdit: 'Permissions.Company.Edit',
  CompanyDelete: 'Permissions.Company.Delete',

  // Customers permissions
  CustomersView: 'Permissions.Customers.View',
  CustomersCreate: 'Permissions.Customers.Create',
  CustomersEdit: 'Permissions.Customers.Edit',
  CustomersDelete: 'Permissions.Customers.Delete',

  // Hotel permissions
  HotelView: 'Permissions.Hotel.View',
  HotelCreate: 'Permissions.Hotel.Create',
  HotelEdit: 'Permissions.Hotel.Edit',
  HotelDelete: 'Permissions.Hotel.Delete',

  // Rooms permissions
  RoomsView: 'Permissions.Rooms.View',
  RoomsCreate: 'Permissions.Rooms.Create',
  RoomsEdit: 'Permissions.Rooms.Edit',
  RoomsDelete: 'Permissions.Rooms.Delete',

  // Coupons permissions
  CouponsView: 'Permissions.Coupons.View',
  CouponsCreate: 'Permissions.Coupons.Create',
  CouponsEdit: 'Permissions.Coupons.Edit',
  CouponsDelete: 'Permissions.Coupons.Delete',

  // AD permissions (Advertising)
  ADView: 'Permissions.AD.View',
  ADCreate: 'Permissions.AD.Create',
  ADEdit: 'Permissions.AD.Edit',
  ADDelete: 'Permissions.AD.Delete',

  // CompanyWallet permissions
  CompanyWalletView: 'Permissions.CompanyWallet.View',
  CompanyWalletCreate: 'Permissions.CompanyWallet.Create',
  CompanyWalletEdit: 'Permissions.CompanyWallet.Edit',
  CompanyWalletDelete: 'Permissions.CompanyWallet.Delete',

  // RoomFeature permissions
  RoomFeatureView: 'Permissions.RoomFeature.View',
  RoomFeatureCreate: 'Permissions.RoomFeature.Create',
  RoomFeatureEdit: 'Permissions.RoomFeature.Edit',
  RoomFeatureDelete: 'Permissions.RoomFeature.Delete',

  // RoomGroup permissions
  RoomGroupView: 'Permissions.RoomGroup.View',
  RoomGroupCreate: 'Permissions.RoomGroup.Create',
  RoomGroupEdit: 'Permissions.RoomGroup.Edit',
  RoomGroupDelete: 'Permissions.RoomGroup.Delete',

  // ProgramStep permissions (مختلف عن ProgramSteps)
  ProgramStepView: 'Permissions.ProgramStep.View',
  ProgramStepCreate: 'Permissions.ProgramStep.Create',
  ProgramStepEdit: 'Permissions.ProgramStep.Edit',
  ProgramStepDelete: 'Permissions.ProgramStep.Delete',

  // Travel permissions (مختلف عن Trip)
  TravelView: 'Permissions.Travel.View',
  TravelCreate: 'Permissions.Travel.Create',
  TravelEdit: 'Permissions.Travel.Edit',
  TravelDelete: 'Permissions.Travel.Delete',

  // TravelReservation permissions (مختلف عن TripReservation)
  TravelReservationView: 'Permissions.TravelReservation.View',
  TravelReservationCreate: 'Permissions.TravelReservation.Create',
  TravelReservationEdit: 'Permissions.TravelReservation.Edit',
  TravelReservationDelete: 'Permissions.TravelReservation.Delete',

  // SalesAgency permissions
  SalesAgencyView: 'Permissions.SalesAgency.View',
  SalesAgencyCreate: 'Permissions.SalesAgency.Create',
  SalesAgencyEdit: 'Permissions.SalesAgency.Edit',
  SalesAgencyDelete: 'Permissions.SalesAgency.Delete',

  // VendorContract permissions
  VendorContractView: 'Permissions.VendorContract.View',
  VendorContractCreate: 'Permissions.VendorContract.Create',
  VendorContractEdit: 'Permissions.VendorContract.Edit',
  VendorContractDelete: 'Permissions.VendorContract.Delete',
  // Financial permissions
  FinancialView: 'Permissions.Financial.View',
  FinancialCreate: 'Permissions.Financial.Create',
  FinancialEdit: 'Permissions.Financial.Edit',
  FinancialDelete: 'Permissions.Financial.Delete',

  // Policy permissions
  PolicyView: 'Permissions.Policy.View',
  PolicyCreate: 'Permissions.Policy.Create',
  PolicyEdit: 'Permissions.Policy.Edit',
  PolicyDelete: 'Permissions.Policy.Delete',

  // Nationality permissions
  NationalityView: 'Permissions.Nationality.View',
  NationalityCreate: 'Permissions.Nationality.Create',
  NationalityEdit: 'Permissions.Nationality.Edit',
  NationalityDelete: 'Permissions.Nationality.Delete',

  // Hajj permissions
  HajjView: 'Permissions.Hajj.View',
  HajjCreate: 'Permissions.Hajj.Create',
  HajjEdit: 'Permissions.Hajj.Edit',
  HajjDelete: 'Permissions.Hajj.Delete',

  // HajjSegmants permissions
  HajjSegmantsView: 'Permissions.HajjSegmants.View',
  HajjSegmantsCreate: 'Permissions.HajjSegmants.Create',
  HajjSegmantsEdit: 'Permissions.HajjSegmants.Edit',
  HajjSegmantsDelete: 'Permissions.HajjSegmants.Delete',

  // OutingCategory permissions
  OutingCategoryView: 'Permissions.OutingCategory.View',
  OutingCategoryCreate: 'Permissions.OutingCategory.Create',
  OutingCategoryEdit: 'Permissions.OutingCategory.Edit',
  OutingCategoryDelete: 'Permissions.OutingCategory.Delete',

  // Outings permissions
  OutingsView: 'Permissions.Outings.View',
  OutingsCreate: 'Permissions.Outings.Create',
  OutingsEdit: 'Permissions.Outings.Edit',
  OutingsDelete: 'Permissions.Outings.Delete',

  // OutingFeature permissions
  OutingFeatureView: 'Permissions.OutingFeature.View',
  OutingFeatureCreate: 'Permissions.OutingFeature.Create',
  OutingFeatureEdit: 'Permissions.OutingFeature.Edit',
  OutingFeatureDelete: 'Permissions.OutingFeature.Delete',

  // OutingBooking permissions
  OutingBookingView: 'Permissions.OutingBooking.View',
  OutingBookingCreate: 'Permissions.OutingBooking.Create',
  OutingBookingEdit: 'Permissions.OutingBooking.Edit',
  OutingBookingDelete: 'Permissions.OutingBooking.Delete',
  // Wallet permissions
  WalletView: 'Permissions.Wallet.View',
  WalletCreate: 'Permissions.Wallet.Create',
  WalletEdit: 'Permissions.Wallet.Edit',
  WalletDelete: 'Permissions.Wallet.Delete',
  // scanner permissions
  ScannerView: 'Permissions.Scanner.View',
  ScannerCreate: 'Permissions.Scanner.Create',
  ScannerEdit: 'Permissions.Scanner.Edit',
  ScannerDelete: 'Permissions.Scanner.Delete',
  //notifications permissions
  NotificationsView: 'Permissions.Notification.View',
  NotificationsCreate: 'Permissions.Notification.Create',
  NotificationsEdit: 'Permissions.Notification.Edit',
  NotificationsDelete: 'Permissions.Notification.Delete',

  // Reports permissions
  ReportsView: 'Permissions.Reports.View'
};

const NavigationItems = [
  {
    id: 'default',
    title: 'Home',
    type: 'item',
    classes: 'nav-item',
    url: '/default',
    icon: 'fas fa-house',
    breadcrumbs: false,
    permissions: [Permissions.UsersView] // Everyone can access home
  },
  {
    id: 'customers',
    title: 'Customers',
    type: 'item',
    classes: 'nav-item',
    url: '/customers',
    icon: 'fas fa-user-group',
    breadcrumbs: false,
    permissions: [Permissions.CustomersCreate]
  },
  {
    id: 'customer-analytics',
    title: 'Customer Analytics',
    type: 'item',
    classes: 'nav-item',
    url: '/customer-analytics',
    icon: 'fas fa-chart-line',
    breadcrumbs: false,
    permissions: [Permissions.CustomersCreate]
  },
  {
    id: 'vendors',
    title: 'Vendors',
    type: 'item',
    classes: 'nav-item',
    url: '/vendors',
    icon: 'fas fa-store',
    permissions: [Permissions.CompanyCreate]
  },
  {
    id: 'overallReservations',
    title: 'Reservations',
    type: 'item',
    classes: 'nav-item',
    url: '/all-reservations',
    icon: 'fas fa-calendar-check',
    breadcrumbs: false,
    permissions: [Permissions.BookingView, Permissions.OutingBookingView, Permissions.TravelReservationView]
  },
  {
    id: 'hotels',
    title: 'Hotels',
    type: 'item',
    classes: 'nav-item',
    url: '/hotels',
    icon: 'fas fa-hotel',
    breadcrumbs: false,
    permissions: [Permissions.HotelCreate]
  },
  {
    id: 'rooms',
    title: 'Rooms',
    type: 'item',
    classes: 'nav-item',
    url: '/hotel-rooms',
    icon: 'fas fa-bed',
    breadcrumbs: false,
    permissions: [Permissions.RoomsCreate]
  },
  {
    id: 'hajj',
    title: 'hajj',
    type: 'item',
    classes: 'nav-item',
    url: '/hajj',
    icon: 'fas fa-solid fa-kaaba',
    breadcrumbs: false,
    permissions: [Permissions.HajjCreate]
  },
  {
    id: 'ummrah',
    title: 'ummrah',
    type: 'item',
    classes: 'nav-item',
    url: '/ummrah',
    icon: 'fas fa-solid fa-mosque',
    breadcrumbs: false,
    permissions: [Permissions.HajjCreate]
  },
  {
    id: 'travels',
    title: 'Travels',
    type: 'item',
    classes: 'nav-item',
    url: '/travels',
    icon: 'fas fa-plane-departure',
    breadcrumbs: false,
    permissions: [Permissions.TravelCreate]
  },
  {
    id: 'Outing',
    title: 'Outing',
    type: 'collapse',
    classes: 'nav-item',
    icon: 'fas fa-solid fa-peace',
    breadcrumbs: false,
    permissions: [Permissions.TravelCreate],
    children: [
      // --- 1. New 'Settings' Collapse Item (Child of Outing) ---
      {
        id: 'OutingSettings',
        title: 'Settings',
        type: 'collapse', // It will be a sub-collapse
        classes: 'nav-item',
        icon: 'fas fa-solid fa-gears', // Settings icon
        breadcrumbs: false,
        permissions: [Permissions.OutingCategoryCreate, Permissions.OutingFeatureCreate],
        children: [
          {
            id: 'outing-category-A', // Changed ID to distinguish the first category item
            title: 'Category',
            type: 'item',
            classes: 'nav-item',
            url: '/outing-category',
            icon: 'fas fa-solid fa-star-half-stroke',
            breadcrumbs: false,
            permissions: [Permissions.OutingCategoryCreate]
          },
          // Assuming this was the 'featuries' you mentioned, I'll keep the second item here.
          {
            id: 'outing-category-B', // Changed ID to distinguish the second category/features item
            title: 'Features', // Renamed title to 'Features' based on your request
            type: 'item',
            classes: 'nav-item',
            url: '/outing-features', // Assuming a different URL for features, adjust if needed
            icon: 'fas fa-solid fa-list-check', // Features icon
            breadcrumbs: false,
            permissions: [Permissions.OutingFeatureCreate]
          },
          // Assuming this was the 'featuries' you mentioned, I'll keep the second item here.
          {
            id: 'outing-category-B', // Changed ID to distinguish the second category/features item
            title: 'Branches', // Renamed title to 'Features' based on your request
            type: 'item',
            classes: 'nav-item',
            url: '/outing-branches', // Assuming a different URL for features, adjust if needed
            icon: 'fas fa-solid fa-code-branch', // Features icon
            breadcrumbs: false,
            permissions: [Permissions.OutingFeatureCreate]
          }
        ]
      },
      // --- 2. 'Management' Item (Direct Child of Outing) ---
      {
        id: 'outing-management',
        title: 'Management',
        type: 'item',
        classes: 'nav-item',
        url: '/outing',
        icon: 'fas fa-solid fa-table',
        breadcrumbs: false,
        permissions: [Permissions.OutingsCreate]
      }
    ]
  },

  {
    id: 'transactions',
    title: 'transactions',
    type: 'collapse',
    classes: 'nav-item',
    icon: 'fas fa-solid fa-money-bill-trend-up',
    breadcrumbs: false,
    permissions: [Permissions.WalletView],
    children: [
      {
        id: 'transactions',
        title: 'charge Transaction',
        type: 'item',
        classes: 'nav-item fs-5',
        url: '/chargeTransaction',
        icon: 'fas fa-solid fa-arrows-spin',
        breadcrumbs: true,
        permissions: [Permissions.WalletView]
      },
      {
        id: 'transactions',
        title: 'wallet transactions',
        type: 'item',
        classes: 'nav-item fs-5',
        url: '/walletTransactions',
        icon: 'fas fa-solid fa-check',
        breadcrumbs: true,
        permissions: [Permissions.WalletView]
      }
    ]
  },
  {
    id: 'coupons',
    title: 'coupons',
    type: 'collapse',
    classes: 'nav-item',
    icon: 'fa-solid fa-ticket',
    breadcrumbs: false,
    permissions: [Permissions.CouponsCreate],
    children: [
      {
        id: 'coupons',
        title: 'all coupons',
        type: 'item',
        classes: 'nav-item',
        url: '/coupons',
        icon: 'fa-solid fa-ticket',
        breadcrumbs: false,
        permissions: [Permissions.CouponsCreate]
      },
      {
        id: 'coupons',
        title: 'used coupons',
        type: 'item',
        classes: 'nav-item',
        url: '/used-coupons',
        icon: 'fa-solid fa-square-check',
        breadcrumbs: false,
        permissions: [Permissions.CouponsCreate]
      }
    ]
  },
  {
    id: 'emails',
    title: 'emails',
    type: 'item',
    classes: 'nav-item',
    url: '/emails',
    icon: 'fa-solid fa-envelope',
    breadcrumbs: false,
    permissions: [Permissions.CouponsCreate]
  },
  {
    id: 'reports',
    title: 'Reports',
    type: 'collapse',
    classes: 'nav-item',
    icon: 'fas fa-chart-bar',
    breadcrumbs: false,
    permissions: [],
    children: [
      {
        id: 'outing-reports',
        title: 'Outing Reports',
        type: 'item',
        classes: 'nav-item',
        url: '/reports/outing',
        icon: 'fas fa-solid fa-peace',
        breadcrumbs: false,
        permissions: []
      },
      {
        id: 'travel-reports',
        title: 'Travel Reports',
        type: 'item',
        classes: 'nav-item',
        url: '/reports/travel',
        icon: 'fas fa-plane-departure',
        breadcrumbs: false,
        permissions: []
      },
      {
        id: 'hotel-reports',
        title: 'Hotel Reports',
        type: 'item',
        classes: 'nav-item',
        url: '/reports/hotel',
        icon: 'fas fa-hotel',
        breadcrumbs: false,
        permissions: []
      },
      {
        id: 'hajj-reports',
        title: 'Manasik Reports',
        type: 'item',
        classes: 'nav-item',
        url: '/reports/hajj',
        icon: 'fas fa-solid fa-kaaba',
        breadcrumbs: false,
        permissions: []
      }
    ]
  },

  {
    id: 'settings',
    title: 'Settings',
    type: 'group',
    icon: 'fas fa-gear',
    permissions: [], // Parent will show if any child is visible
    children: [
      {
        id: 'users',
        title: 'Users',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'fas fa-user-cog',
        breadcrumbs: false,
        permissions: [Permissions.UsersView]
      },
      {
        id: 'roles',
        title: 'Roles',
        type: 'item',
        classes: 'nav-item',
        url: '/roles',
        icon: 'fas fa-user-shield',
        breadcrumbs: false,
        permissions: [Permissions.RolesCreate]
      },
      {
        id: 'mobSideBar',
        title: 'Mobile Side Bar',
        type: 'item',
        classes: 'nav-item',
        url: '/mobile-sidebar',
        icon: 'fas fa-solid fa-sliders',
        breadcrumbs: false,
        permissions: [Permissions.VendorContractView]
      },
      {
        id: 'VendorContracts',
        title: 'Vendor Contracts',
        type: 'item',
        classes: 'nav-item',
        url: '/all-Vendor-Contracts',
        icon: 'fa-solid fa-file-contract',
        breadcrumbs: false,
        permissions: [Permissions.VendorContractView]
      },
      {
        id: 'countries',
        title: 'Countries',
        type: 'item',
        classes: 'nav-item',
        url: '/countries',
        icon: 'fas fa-globe',
        breadcrumbs: false,
        permissions: [Permissions.CountryCreate]
      },
      {
        id: 'nationalities',
        title: 'nationalities',
        type: 'item',
        classes: 'nav-item',
        url: '/nationalities',
        icon: 'fa-solid fa-earth-africa',
        breadcrumbs: false,
        permissions: [Permissions.CountryCreate]
      },
      {
        id: 'city',
        title: 'Cities',
        type: 'item',
        classes: 'nav-item',
        url: '/cities',
        icon: 'fas fa-city',
        breadcrumbs: false,
        permissions: [Permissions.CityCreate]
      },
      {
        id: 'bed-type',
        title: 'Bed Type',
        type: 'item',
        classes: 'nav-item',
        url: '/bed-types',
        icon: 'fas fa-couch',
        breadcrumbs: false,
        permissions: [Permissions.BedTypeCreate]
      },
      {
        id: 'room-type',
        title: 'Room Type',
        type: 'item',
        classes: 'nav-item',
        url: '/room-types',
        icon: 'fas fa-door-open',
        breadcrumbs: false,
        permissions: [Permissions.CountryCreate] // Assuming room types fall under room management
      },
      {
        id: 'room-features',
        title: 'Room Features',
        type: 'item',
        classes: 'nav-item',
        url: '/room-features',
        icon: 'fas fa-tools',
        breadcrumbs: false,
        permissions: [Permissions.CountryCreate] // Assuming room features fall under room management
      },

      {
        id: 'advertisings',
        title: 'advertisings',
        type: 'item',
        classes: 'nav-item',
        url: '/advertisings',
        icon: 'fa-solid fa-rectangle-ad',
        breadcrumbs: false,
        permissions: [Permissions.ADCreate]
      },
      {
        id: 'Sales-Agencies',
        title: 'Sales Agencies',
        type: 'item',
        classes: 'nav-item',
        url: '/Sales-Agencies',
        icon: 'fa-solid fa-handshake',
        breadcrumbs: false,
        permissions: [Permissions.SalesAgencyCreate]
      },
      {
        id: 'mobile-policy',
        title: 'mobile policy',
        type: 'item',
        classes: 'nav-item',
        url: '/mobile-policy',
        icon: 'fa-solid fa-square-poll-horizontal',
        breadcrumbs: false,
        permissions: [Permissions.SalesAgencyCreate]
      },
      {
        id: 'financial-settings',
        title: 'financial settings',
        type: 'item',
        classes: 'nav-item',
        url: '/financial-settings',
        icon: 'fa-solid fa-coins',
        breadcrumbs: false,
        permissions: [Permissions.SalesAgencyCreate]
      },
      {
        id: 'scanner',
        title: 'scanner',
        type: 'item',
        classes: 'nav-item',
        url: '/scanner',
        icon: 'fas fa-qrcode',
        breadcrumbs: false,
        permissions: [Permissions.ScannerView]
      },
      {
        id: 'notifications',
        title: 'notifications',
        type: 'item',
        classes: 'nav-item',
        url: '/notifications',
        icon: 'fas fa-solid fa-bell',
        breadcrumbs: false,
        permissions: [Permissions.NotificationsView]
      },
      {
        id: 'room-groups',
        title: 'room groups',
        type: 'item',
        classes: 'nav-item space',
        url: '/room-groups',
        icon: 'fas fa-tags',
        breadcrumbs: false,
        permissions: [Permissions.RoomGroupCreate] // Assuming room groups fall under room management
      }
    ]
  }
];

@Injectable()
export class NavigationItem {
  private navigationSubject = new BehaviorSubject<any>([]);
  public navigation$ = this.navigationSubject.asObservable();

  constructor(private _configService: ConfigureService) {
    setTimeout(() => {
      this.refreshNavigation();
    }, 0);

    this._configService.userState$.subscribe(() => {
      setTimeout(() => {
        this.refreshNavigation();
      }, 0);
    });
  }
  refreshNavigation() {
    const navigation = this.getFilteredNavigation();
    this.navigationSubject.next(navigation);
  }
  private getFilteredNavigation() {
    const userPermissions = this._configService.userPermissions();
    const user = this._configService.User();
    console.log('User Permissions:....................', userPermissions);
    if (!user || !userPermissions || userPermissions.length === 0) {
      return [];
    }

    let navigation = JSON.parse(JSON.stringify(NavigationItems));

    const filterItems = (items) => {
      return items.filter((item) => {
        // Debug للـ Settings
        if (item.id === 'settings') {
          console.log('🔧 Settings item check:');
          console.log('📁 Has children:', item.children?.length || 0);
        }

        if (item.children && item.children.length > 0) {
          item.children = filterItems(item.children);
          console.log(`📂 "${item.id}" children after filter:`, item.children.length);

          if (item.id === 'settings') {
            console.log('🔧 Settings final decision:', item.children.length > 0);
            console.log(
              '🔧 Settings children IDs:',
              item.children.map((c) => c.id)
            );
          }

          return item.children.length > 0;
        }

        if (['bed-type', 'room-type', 'room-features'].includes(item.id)) {
          console.log(`🔍 Checking item: ${item.id}`);
          console.log('📋 Required permissions:', item.permissions);
          console.log('👤 User permissions:', userPermissions);

          if (item.permissions && item.permissions.length > 0) {
            const hasPermission = item.permissions.some((permission) => {
              const found = userPermissions.includes(permission);
              console.log(`🔐 Permission "${permission}" found: ${found}`);
              return found;
            });
            console.log(`✅ Item "${item.id}" has access: ${hasPermission}`);
            return hasPermission;
          }
        }

        if (item.permissions && item.permissions.length > 0) {
          return item.permissions.some((permission) => userPermissions.includes(permission));
        }
        return true;
      });
    };

    navigation = filterItems(navigation);

    console.log('🎯 Final navigation result:', navigation);
    console.log(
      '🎯 Settings in final result:',
      navigation.find((item) => item.id === 'settings')
    );

    return navigation;
  }

  get() {
    return this.navigationSubject.value;
  }
}
