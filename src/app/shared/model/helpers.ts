export class APIs {
  public static Account = {
    login: 'Authentication/Webtoken',
    forgetPassword: 'Authentication/ResendEMailOtp',
    verifyCode: 'Authentication/VerifyEmailOtp',
    resetPassword: 'Authentication/ForgetPassword'
  };
  public static enums = {
    GetUserLimit: 'Enums/GetUserLimit',
    getPaymentStatus: 'Enums/GetBookingStatus',
    getRoomBoardingsTypes: 'Enums/GetBordingType'
  };
  public static roles = {
    getAllRoles: 'Users/GetAllRoles',
    addRole: 'Role/AddRole',
    deleteRole: 'Role/DeleteRole'
  };
  public static nationalities = {
    GetAllNationalitys: 'Nationality/GetAllNationalitys',
    AddNationality: 'Nationality/AddNationality',
    DeleteNationality: 'Nationality/DeleteNationality',
    update: 'Nationality/UpdateNationality',
    delete: 'Nationality/DeleteNationality?id='
  };
  public static manasik = {
    GetAllManasik: 'Hajj/GetAllHajj',
    GetManasikById: 'Hajj/GetHajjById?id=',
    updateManasikInfo: 'Hajj/UpdateHajj',
    deleteManasik: 'Hajj/DeleteHajj?id=',
    addManasikFirstStep: 'Hajj/AddHajj',
    addManasikProgramStep: 'Hajj/AddHajjProgramStepsV3',
    UpdateProgramStep: 'Hajj/UpdateHajjProgramStepsV2',
    addManasikTicketStep: 'HajjTickets/AddHajjTickets',
    UpdateManasikTicketStep: 'HajjTickets/UpdateListHajjTicket',
    toggleManasikBlockStatus: 'Hajj/BlockUnBlockHajj?id=',
    toggleManasikStatus: 'Hajj/ActiveUnActiveHajj?id='
  };
  public static mobileSideBar = {
    GetAllMobileSideBar: 'SideBars/GetAllSideBars',
    GetMobileSideBarById: 'SideBars/GetSideBarById?id=',
    GetCouponSideBar: 'SideBars/GetCouponSideBar',
    editCouponSideBar: 'SideBars/AddCouponSideBar',
    AddMobileSideBar: 'SideBars/AddSideBar',
    updateMobileSideBar: 'SideBars/UpdateSideBar',
    deleteMobileSideBar: 'SideBars/DeleteSideBar?id='
  };
  public static outingCategoty = {
    GetAllOutingCategories: 'OutingCategories/GetAllOutingCategories',
    GetOutingCategoryById: 'OutingCategories/GetOutingCategoryById?id=',
    AddOutingCategory: 'OutingCategories/AddOutingCategory',
    update: 'OutingCategories/UpdateOutingCategory',
    delete: 'OutingCategories/DeleteOutingCategory?id=',
    toggleStatus: 'OutingCategories/ToggleStatus?id='
  };
  public static notifications = {
    GetAllNotifications: 'Notification/GetAllNotifications',
    GetNotificationById: 'Notification/GetNotification?Id=',
    AddNotification: 'Notification/SendNotification',
    update: 'Notification/UpdateNotification',
    delete: 'Notification/DeleteNotification?id='
  };

  public static Outing = {
    getAllOutings: 'Outings/GetAllOutings',
    getOutingById: 'Outings/GetOutingById?id=',
    getOutingBookingById: 'OutingBooking/ScannerOutingBookingById?id=',
    UseTicketSerialNumber: 'OutingBooking/UseTicketSerialNumber?id=',
    AddOutingOnly: 'Outings/AddOutingOnly',
    addOuting: 'Outing/AddOuting',
    updateOuting: 'Outings/UpdateOuting',
    UpdateListOutingAddOn: 'OutingAddOns/UpdateListOutingAddOn',
    updateOutingOffers: 'OutingOffers/UpdateOutingOffer',
    updateOutingTickets: 'OutingTickets/UpdateListOutingTicket',
    updateOutingTicket: 'OutingTickets/UpdateOutingTicket',
    deleteOuting: 'Outings/DeleteOuting?id=',
    updateOutingStatus: 'Outing/UpdateOutingStatus',
    updateOutingBlockStatus: 'Outings/BlockUnBlockOutings?id=',
    updateOutinStatus: 'Outings/ActiveUnActiveOuting?id=',
    deleteOutingImage: 'Outing/OutingDeleteImage?imageId=',
    addTicketExel: 'OutingTickets/AddOutingFileTickets',
    addOutingBranches: 'Branshes/AddBransh',
    getAllOutingBranches: 'Branshes/GetAllBranshes',
    getOutingBranchesById: 'Branshes/GetBranshById?id=',
    updateOutingBranches: 'Branshes/UpdateBransh',
    deleteOutingBranches: 'Branshes/DeleteBransh?id='
  };
  public static OutingFeatures = {
    getAllOutingsFeatures: 'OutingFeature/GetAllOutingFeatures',
    getOutingFeaturesById: 'OutingFeature/GetOutingFeatureById?id=',
    addOutingFeatures: 'OutingFeature/AddOutingFeature',
    updateOutingFeatures: 'OutingFeature/UpdateOutingFeature',
    deleteOutingFeatures: 'OutingFeature/DeleteOutingFeature?id='
  };
  public static financialSettings = {
    getAllFinancialSettings: 'Financial/GetAllFinancialSetting',
    editFinancialSettings: 'Financial/UpdateFinancialSetting',
    // ── User / Bonus Settings ──
    getUserSettings: 'Settings/UserSettings',
    updateUserSettings: 'Settings/UserSettings',
    // ── InstaPay Details ──
    getInstaPayDetails: 'Financial/InstaPayDetails'
  };
  public static salesAgancies = {
    getsalesAgancies: 'SalesAgency/GetAllSalesAgencies',
    setSalesAgancy: 'SalesAgency/AddSalesAgency',
    getSalesAgancyById: 'SalesAgency/GetSalesAgencyById?id=',
    updateSalesAgancy: 'SalesAgency/UpdateSalesAgency',
    deleteSalesAgancy: 'SalesAgency/DeleteSalesAgency?id='
  };
  public static VendorContracts = {
    getVendorContracts: 'VendorContract/GetAllVendorContracts',
    getVendorContractById: 'VendorContract/GetVendorContractById?id=',
    UpdateVendorContract: 'vendorContract/UpdateVendorContract'
  };
  public static permissions = {
    getAllPermissionsForROle: 'Permissions/GetPermissionsForRole',
    AddPermissionsToRole: 'Permissions/AddPermissionsToRole'
  };
  public static advertisings = {
    getAlladvertisings: 'AD/GetAllADs',
    getadvertisingsById: 'AD/GetADById?id=',
    updateadvertisings: 'AD/UpdateAD',
    Addadvertisings: 'AD/AddAD',
    deleteadvertisings: 'AD/DeleteAD?id='
  };
  public static companyWallet = {
    AddToCompanyWallet: 'CompaniesWallet/AddCompanyWallet',
    getCompanyWallet: 'CompaniesWallet/GetAllCompanyWallet',
    CallculateSattlements: 'CompaniesWallet/CallculateSattlements'
  };
  public static emails = {
    getAllEmails: 'Email/GetAllEmails',
    getEmailById: 'Email/GetSendEmailLogByIdAsync?id=',
    sendEmail: 'Email/SendEmail?id=',
    getAllEmailsTrackers: 'Email/GetEmailTrackers'
  };
  public static policies = {
    getPolicies: 'Policy/GetPolicies',
    editPolicies: 'Policy/AddOrUpdatePolicy'
  };
  public static transactions = {
    getTransactions: 'Wallet/GetWalletTransaction',
    getWalletChargeTransaction: 'Wallet/GetWalletChargeTransaction',
    // ── Wallets list (admin) ──
    getAllWallets: 'Wallet/GetAllWallets',
    adjustWalletBalance: 'Wallet/AdjustWalletBalance'
  };

  public static reservations = {
    getReservationById: 'CustomerBooking/GetCustomerBookingById',
    getReservationByRef: 'CustomerBooking/GetCustomerBookingByRefernce?BookingRefernce=',
    getTravelReservationDetail: 'Booking/GetTravelBookingByBookingId',
    getroomReservationDetail: 'Booking/GetRooMBookingByBookingId',
    getOutingReservationDetail: 'OutingBooking/GetOutingBookingByBookingId',
    getManasikReservationDetail: 'Booking/GetHajjBookingByBookingId',
    RefundRoomBookingById: 'CustomerBooking/RefundRoomBookingById?id=',
    RefundTripBookingById: 'CustomerBooking/RefundTripBookingById?id=',
    RefundOutingBookingById: 'CustomerBooking/RefundOutingBookingById?id=',
    RefundManasikBookingById: 'CustomerBooking/RefundHajjBookingById?id=',
    RefundCustomerBookingById: 'CustomerBooking/RefundCustomerBookingById?id=',
    getRoomReservationForVendor: 'Booking/GetAllBooking',
    getTravelReservationForVendor: 'TripReservations/GetAllTripReservation',
    getOutingReservationForVendor: 'OutingBooking/GetAllOutingBooking',
    getManasikReservationForVendor: 'HajjReservations/GetAllHajjReservation',
    // ── InstaPay Admin Actions ──
    confirmInstaPayBooking: 'CustomerBooking/ConfirmInstaPayBooking?id=',
    cancelInstaPayBooking: 'CustomerBooking/CancelInstaPayBooking?id='
  };
  public static useries = {
    createUser: 'Users/CreateUser',
    updateUser: 'Users/WepEditUser',
    GetUserInfoById: 'Users/GetUserInfoById',
    getAllUser: 'Users/GetAllUsers',
    deleteUser: 'Users/DeleteUser?UserId=',
    resetPassword: 'Users/ResetPassword'
  };
  public static customeries = {
    getAllCustomeries: 'Customers/GetAllCustomers',
    updateCustomerStatus: 'Customers/UpdateCustomerStatus',
    getCustomerById: 'Customers/GetCustomerById'
  };

  public static countries = {
    setCountries: 'Countries/AddCountry',
    GetAllCountries: 'Countries/GetAllCountries',
    GetCountriesById: 'Countries/GetCountryById',
    deleteCountry: 'Countries/DeleteCountry',
    editStatus: 'Countries/UpdateCountryStatus'
  };
  public static cities = {
    setCities: 'Cities/AddCity',
    GetAllCities: 'Cities/GetAllCities',
    GetCitiesById: 'Cities/GetCityById?id=',
    deleteCities: 'Cities/UpdateCityStatus',
    editStatus: 'Cities/UpdateCityStatus'
  };
  public static BedTybies = {
    setBedTybe: 'BedType/AddBedType',
    GetAllBedTybies: 'BedType/GetAllBedTypes',
    GetBedTybeById: 'BedType/GetBedTypeById?id=',
    deleteBedTybe: 'BedType/DeleteBedType?id=',
    updateBedTybe: 'BedType/UpdateBedType'
  };
  public static RoomTybies = {
    GetAllRoomTybe: 'RoomTypes/GetAllRoomTypes',
    deleteRoomTybe: 'RoomTypes/DeleteRoomType?id=',
    updateRoomtybe: 'RoomTypes/UpdateRoomType',
    setRoomTybe: 'RoomTypes/AddRoomType',
    ssss: ''
  };
  public static coupons = {
    GetAllcoupons: 'Coupons/GetAllCoupons',
    setcoupons: 'Coupons/AddCoupons',
    deletecoupons: 'Coupons/DeleteCoupons?id=',
    getusedcoupons: 'Coupons/GetAllUsedCoupons',
    getcouponById: 'Coupons/GetCouponsById?id=',
    getAllSettings: 'Coupons/Settings/GetAll',
    updateSettings: 'Coupons/Settings/Update',
    getWeekend: 'Coupons/Settings/Weekend',
    updateWeekend: 'Coupons/Settings/Weekend',
    getBirthday: 'Coupons/Settings/Birthday',
    updateBirthday: 'Coupons/Settings/Birthday',
    getRecovery: 'Coupons/Settings/Recovery',
    updateRecovery: 'Coupons/Settings/Recovery',
    getWeekendItems: 'Coupons/Settings/GetWeekendCouponItems',
    updateWeekendItems: 'Coupons/Settings/UpdateWeekendCouponItems',
    getBirthdayItems: 'Coupons/Settings/GetBirthdayCouponItems',
    updateBirthdayItems: 'Coupons/Settings/UpdateBirthdayCouponItems'
  };
  public static roomGroups = {
    GetAllroomGroups: 'RoomGroups/GetAllRoomGroups',
    setGroupOfRooms: 'RoomGroups/AddRoomGroups',
    getRoomGroupById: 'RoomGroups/GetRoomGroupById?id=',
    updateGroup: 'RoomGroups/UpdateRoomGroup'
  };
  public static Booking = {
    getAllBooking: 'CustomerBooking/GetAllCustomerBooking',
    getBookingById: 'Booking/GetBookingById?id=',
    addBooking: 'Booking/AddBooking',
    updateBooking: 'Booking/UpdateBooking',
    deleteBooking: 'Booking/DeleteBooking?id=',
    RefundRoomBookingById: 'CustomerBooking/RefundRoomBookingById?id=',
    RefundTripBookingById: 'CustomerBooking/RefundTripBookingById?id=',
    RefundCustomerBookingById: 'CustomerBooking/RefundCustomerBookingById?id='
  };

  public static Vendors = {
    getAllCompanies: 'Company/GetAllCompanies',
    getCompanyById: 'Company/GetCompanyById?id=',
    addCompany: 'Company/AddCompany',
    updateCompany: 'Company/UpdateCompany',
    deleteCompany: 'Company/DeleteCompany?id=',
    getStatistics: 'Dashboard/GetDashboardInfo',
    getTravelStatistics: 'Dashboard/GetAccountTripInfo',
    getRoomStatistics: 'Dashboard/GetAccountRoomInfo',
    getOutingStatistics: 'Dashboard/GetAccountOutingInfo',
    getHajjStatistics: 'Dashboard/GetAccountHajjInfo',
    deleteCompanyImage: 'Company/CompanyDeleteImage?imageId=',
    toggleCompanyStatus: 'Companies/BlockUnBlockCompany?id='
  };

  public static TravelTrips = {
    getAllTravels: 'Travels/GetAllTravels',
    getTravelById: 'Travels/GetTravelById?id=',
    addTravel: 'Travels/AddTravel',
    updateTravel: 'Travels/UpdateTravel',
    updateTravelStatus: 'Travels/UpdateTravelStatus',
    updateTravelBlockStatus: 'Travels/BlockUnBlockTravels?id=',
    deleteTravel: 'Travels/DeleteTravel?id=',
    deleteTravelImage: 'Travels/TravelsDeleteImage?imageId=',
    addProgramSteps: 'Travels/AddProgramStepsV3',
    updateProgramSteps: 'Travels/UpdateProgramSteps?tripId=',
    getProgramStepsByTripId: 'Travels/GetProgramStepsByTripId?tripId=',
    deleteProgramStep: 'Travels/DeleteProgramStep?id=',
    getProgramStepType: 'ProgramStep/ProgramStep/Type',

    getAllTripReservation: 'TripReservations/GetAllTripReservation',
    addTripReservation: 'TripReservations/AddTripReservation',
    deleteReservation: 'TripReservations/DeleteReservation?id=',
    getAllAccommodationTypes: 'AccommodationType/GetAllAccommodationTypes',
    addAccommodationType: 'AccommodationType/AddAccommodationType',
    getAllTravelFeatures: 'TravelFeature/GetAll',
    createTravelFeature: 'TravelFeature/Create'
  };

  public static Hotel = {
    getAllHotels: 'Hotel/GetAllHotelsWeb',
    getHotelById: 'Hotel/GetHotelById?id=',
    addHotel: 'Hotel/AddHotel',
    updateHotel: 'Hotel/UpdateHotel',
    updateHotelStatus: 'Hotel/UpdateHotelStatus',
    deleteHotel: 'Hotel/DeleteHotel?id=',

    getAllHotelAddresses: 'HotelAddress/GetAllHotelAddresses',
    getHotelAddressById: 'HotelAddress/GetHotelAddressById?id=',
    addHotelAddress: 'HotelAddress/AddHotelAddress',
    updateHotelAddress: 'HotelAddress/UpdateHotelAddress',
    deleteHotelAddress: 'HotelAddress/DeleteHotelAddress?id=',

    getAllHotelFeatures: 'HotelFeatures/GetAllHotelFeatures',
    getHotelFeatureById: 'HotelFeatures/GetHotelFeatureById?id=',
    addHotelFeature: 'HotelFeatures/AddHotelFeature',
    updateHotelFeature: 'HotelFeatures/UpdateHotelFeature',
    deleteHotelFeature: 'HotelFeatures/DeleteHotelFeature?id='
  };
  public static Room = {
    getAllRoomTypes: 'RoomTypes/GetAllRoomTypes',
    getRoomTypeById: 'RoomTypes/GetRoomTypeById?id=',
    addRoomType: 'RoomTypes/AddRoomType',
    updateRoomType: 'RoomTypes/UpdateRoomType',
    deleteRoomType: 'RoomTypes/DeleteRoomType?id=',

    getAllRooms: 'Room/GetAllRooms',
    getRoomById: 'Room/GetRoomById?id=',
    addRoom: 'Room/AddRoom',
    updateRoom: 'Room/UpdateRoom',
    deleteRoom: 'Room/DeleteRoom?id=',
    toggleBlockRoom: 'Room/BlockUnBlockRoom?id=',

    getAllRoomImages: 'RoomImages/GetAllRoomImages',
    getRoomImageById: 'RoomImages/GetRoomImageById?id=',
    addRoomImage: 'RoomImages/AddRoomImage',
    updateRoomImage: 'RoomImages/UpdateRoomImage',
    deleteRoomImage: 'RoomImages/DeleteRoomImage?id=',

    getAllRoomFeatures: 'RoomFeature/GetAllRoomFeatures',
    getRoomFeatureById: 'RoomFeature/GetRoomFeatureById?id=',
    addRoomFeature: 'RoomFeature/AddRoomFeature',
    updateRoomFeature: 'RoomFeature/UpdateRoomFeature',
    deleteRoomFeature: 'RoomFeature/DeleteRoomFeature?id=',

    getAllRoomFeaturesMapping: 'RoomFeatureMapping/GetAllRoomFeaturesMapping',
    getRoomFeatureMappingById: 'RoomFeatureMapping/GetRoomFeatureMappingById?id=',
    addRoomFeatureMapping: 'RoomFeatureMapping/AddRoomFeatureMapping',
    updateRoomFeatureMapping: 'RoomFeatureMapping/UpdateRoomFeatureMapping',
    deleteRoomFeatureMapping: 'RoomFeatureMapping/DeleteRoomFeatureMapping?id='
  };

  public static Reports = {
    getOutingSummary: 'Reports/GetOutingSummary',
    getTravelSummary: 'Reports/GetTripSummary',
    getHotelSummary: 'Reports/GetRoomSummary',
    getHajjSummary: 'Reports/GetHajjSummary'
  };

  public static CustomerAnalytics = {
    getCustomerAnalytics: 'Dashboard/GetCustomerAnalytics',
    getCustomersByAnalyticsType: 'Dashboard/GetCustomersByAnalyticsType'
  };

  public static Pricing = {
    GetCommissionPolicy: 'Pricing/GetCommissionPolicy',
    SaveCommissionPolicy: 'Pricing/SaveCommissionPolicy',
    GetPricingPolicyStatistics: 'Pricing/GetPricingPolicyStatistics'
  };
}
