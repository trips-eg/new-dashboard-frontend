import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StaffSession } from '../core/session';
import { VendorPermissionsApi, VendorPermissionsComponent } from './vendor-permissions';

const URL = '/api/staff/vendors/12/permissions';

const DATA = {
  companyId: 12,
  // Out of the card's order, with a key the dashboard doesn't know yet
  features: [
    { key: 'reviews', on: false, source: 'override' },
    { key: 'bookings', on: true, source: 'role' },
    { key: 'products', on: true, source: 'role' },
    { key: 'settlements', on: false, source: 'role' },
    { key: 'scanner', on: true, source: 'override' },
    { key: 'future', on: true, source: 'role' }
  ]
};

describe('VendorPermissionsApi', () => {
  let api: VendorPermissionsApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, TranslateModule.forRoot()] });
    api = TestBed.inject(VendorPermissionsApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('reads the vendor permissions from GET /api/staff/vendors/{id}/permissions', () => {
    let result: any;
    api.get(12).subscribe((v) => (result = v));
    const req = http.expectOne((r) => r.url.endsWith(URL));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: DATA });
    expect(result).toEqual(DATA);
  });

  it('sends only the changed switches with PUT and returns the full set', () => {
    let result: any;
    api.save(12, [{ key: 'scanner', on: false }]).subscribe((v) => (result = v));
    const req = http.expectOne((r) => r.url.endsWith(URL));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ features: [{ key: 'scanner', on: false }] });
    req.flush({ success: true, message: '', data: DATA });
    expect(result.features.length).toBe(6);
  });

  it('treats success: false as an error with the server message', () => {
    let error: any;
    api.get(12).subscribe({ next: () => fail('Unexpected success'), error: (e) => (error = e) });
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: false, message: 'Company not found', data: null });
    expect(error.message).toBe('Company not found');
  });

  it('copes with an empty answer', () => {
    let result: any;
    api.get(12).subscribe((v) => (result = v));
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: true, message: '', data: null });
    expect(result).toEqual({ companyId: 0, features: [] });
  });
});

describe('VendorPermissionsComponent', () => {
  let fixture: ComponentFixture<VendorPermissionsComponent>;
  let component: VendorPermissionsComponent;
  let http: HttpTestingController;
  let toastr: jasmine.SpyObj<ToastrService>;
  let permissions: string[];

  function create(): void {
    fixture = TestBed.createComponent(VendorPermissionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('companyId', 12);
    fixture.detectChanges();
  }

  function switches(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input[type=checkbox]'));
  }

  function titles(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('ts-switch-row strong')).map((e: any) => e.textContent.trim());
  }

  beforeEach(async () => {
    permissions = ['Permissions.Company.Edit'];
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error']);
    await TestBed.configureTestingModule({
      imports: [VendorPermissionsComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ToastrService, useValue: toastr },
        { provide: StaffSession, useValue: { can: (p: string) => permissions.includes(p) } }
      ]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shows nothing and calls nothing without Permissions.Company.Edit', () => {
    permissions = ['Permissions.Company.View'];
    create();
    http.expectNone((r) => r.url.endsWith(URL));
    expect(fixture.nativeElement.querySelector('ts-card')).toBeNull();
  });

  it('loads the switches in the card order and skips unknown keys', () => {
    create();
    expect(fixture.nativeElement.querySelector('ts-loading')).not.toBeNull();
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: true, message: '', data: DATA });
    fixture.detectChanges();
    expect(titles()).toEqual(['APP.vpBookings', 'APP.vpProducts', 'APP.vpSettlements', 'APP.vpScanner', 'APP.vpReviews']);
    expect(switches().map((s) => s.checked)).toEqual([true, true, false, true, false]);
    expect(fixture.nativeElement.textContent).toContain('APP.vpSyncHint');
    expect(fixture.nativeElement.textContent).toContain('APP.vpCustom');
    expect(fixture.nativeElement.textContent).toContain('APP.vpFromRole');
  });

  it('saves a flipped switch with PUT and shows a success toast', () => {
    create();
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: true, message: '', data: DATA });
    fixture.detectChanges();

    const settlements = switches()[2];
    settlements.checked = true;
    settlements.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.saving).toBe('settlements');
    expect(switches()[2].disabled).toBeTrue();

    const req = http.expectOne((r) => r.url.endsWith(URL) && r.method === 'PUT');
    expect(req.request.body).toEqual({ features: [{ key: 'settlements', on: true }] });
    const after = { ...DATA, features: DATA.features.map((f) => (f.key === 'settlements' ? { ...f, on: true, source: 'override' } : f)) };
    req.flush({ success: true, message: '', data: after });
    fixture.detectChanges();

    expect(component.saving).toBeNull();
    expect(switches()[2].checked).toBeTrue();
    expect(switches()[2].disabled).toBeFalse();
    expect(component.features.find((f) => f.key === 'settlements')!.source).toBe('override');
    expect(toastr.success).toHaveBeenCalledWith('APP.vpTurnedOn');
  });

  it('puts the switch back and shows an error toast when the save fails', () => {
    create();
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: true, message: '', data: DATA });
    fixture.detectChanges();

    component.set('bookings', false);
    fixture.detectChanges();
    expect(switches()[0].checked).toBeFalse();

    http.expectOne((r) => r.url.endsWith(URL) && r.method === 'PUT').flush({ success: false, message: 'Not allowed' }, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();

    expect(switches()[0].checked).toBeTrue();
    expect(component.saving).toBeNull();
    expect(toastr.error).toHaveBeenCalled();
    expect(toastr.success).not.toHaveBeenCalled();
  });

  it('shows the error with a retry when loading fails', () => {
    create();
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: false, message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ts-error')).not.toBeNull();
    expect(switches().length).toBe(0);

    component.load();
    http.expectOne((r) => r.url.endsWith(URL)).flush({ success: true, message: '', data: DATA });
    fixture.detectChanges();
    expect(switches().length).toBe(5);
  });
});
