import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { HomeContentAdmin, HomeContentService, HomeTrust } from './home-content.service';

describe('HomeContentService', () => {
  let service: HomeContentService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const trust: HomeTrust = {
    isVisible: true,
    kicker: 'احجز وانت مطمّن',
    title: 'آلاف المسافرين بيثقوا في Trips',
    backgroundColor: '#1E4FA3',
    textColor: '#FFFFFF',
    accentColor: '#FFC24B',
    stats: [{ key: 'downloads', label: 'تحميل', value: '+100K', mode: 'manual', iconKey: 'download', color: '#1E4FA3', tint: '#EAF1FB' }],
    badges: [{ text: 'دفع آمن', iconKey: 'lock' }]
  };
  const content: HomeContentAdmin = {
    trust,
    icons: { 'service.travel': null },
    iconSlots: [{ key: 'service.travel', labelAr: 'الرحلات', group: 'sections' }],
    autoValues: { companies: 134, customers: 50000, products: 900 },
    version: 3
  };

  beforeEach(() => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(HomeContentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs staff/home-content and unwraps data', () => {
    let result: HomeContentAdmin | undefined;
    service.getContent().subscribe((r) => (result = r));
    const req = http.expectOne(`${api}staff/home-content`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: content });
    expect(result).toEqual(content);
  });

  it('PUTs the trust block as the body of staff/home-content/trust', () => {
    let result: HomeContentAdmin | undefined;
    service.saveTrust(trust).subscribe((r) => (result = r));
    const req = http.expectOne(`${api}staff/home-content/trust`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(trust);
    req.flush({ success: true, data: { ...content, version: 4 } });
    expect(result?.version).toBe(4);
  });

  it('POSTs the icon as multipart field "file" to staff/home-content/icons/{slot}', () => {
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'plane.svg', { type: 'image/svg+xml' });
    let url: string | null | undefined;
    service.uploadIcon('trust.stat.companies', file).subscribe((r) => (url = r.url));
    const req = http.expectOne(`${api}staff/home-content/icons/trust.stat.companies`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    const sent = (req.request.body as FormData).get('file') as File;
    expect(sent.name).toBe('plane.svg');
    req.flush({ success: true, data: { slot: 'trust.stat.companies', url: '/images/HomeContent/a.svg', version: 5 } });
    expect(url).toBe('/images/HomeContent/a.svg');
  });

  it('DELETEs staff/home-content/icons/{slot} to go back to the built-in icon', () => {
    let result: any;
    service.resetIcon('nav.home').subscribe((r) => (result = r));
    const req = http.expectOne(`${api}staff/home-content/icons/nav.home`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: { slot: 'nav.home', url: null, version: 6 } });
    expect(result).toEqual({ slot: 'nav.home', url: null, version: 6 });
  });

  it('prefixes relative icon URLs with the image host', () => {
    const host = environment.imgUrl.replace(/\/+$/, '');
    expect(HomeContentService.imageUrl('/images/HomeContent/a.svg')).toBe(`${host}/images/HomeContent/a.svg`);
    expect(HomeContentService.imageUrl('images/HomeContent/a.svg')).toBe(`${host}/images/HomeContent/a.svg`);
    expect(HomeContentService.imageUrl('https://cdn.example.com/a.svg')).toBe('https://cdn.example.com/a.svg');
    expect(HomeContentService.imageUrl(null)).toBeNull();
  });

  it('reads validation, conflict, forbidden and not-found errors', () => {
    const validation = HomeContentService.parseError(
      new HttpErrorResponse({
        status: 400,
        error: { success: false, message: 'العنوان مطلوب', errorCode: 'VALIDATION_FAILED', data: { errors: ['العنوان مطلوب', 'لون الخلفية غلط'] } }
      })
    );
    expect(validation).toEqual({ kind: 'validation', messages: ['العنوان مطلوب', 'لون الخلفية غلط'] });

    const conflict = HomeContentService.parseError(new HttpErrorResponse({ status: 409, error: { errorCode: 'CONFLICT', message: 'حد تاني حفظ' } }));
    expect(conflict).toEqual({ kind: 'conflict', messages: ['حد تاني حفظ'] });

    expect(HomeContentService.parseError(new HttpErrorResponse({ status: 403, error: { Message: '', status: 401 } })).kind).toBe('forbidden');
    expect(HomeContentService.parseError(new HttpErrorResponse({ status: 404, error: {} })).kind).toBe('notFound');
    expect(HomeContentService.parseError(new HttpErrorResponse({ status: 500, error: {} })).kind).toBe('other');
  });
});
