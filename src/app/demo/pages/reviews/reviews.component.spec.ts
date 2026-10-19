import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { ReviewsComponent } from './reviews.component';

describe('Reviews catalog', () => {
  let component: ReviewsComponent;
  const result = { success: true, data: { data: [{ id: 42, name: 'Trip' }], itemsCount: 25 } };
  let trips: jasmine.SpyObj<TravelTripsService>;
  let outings: jasmine.SpyObj<OutingService>;
  let packages: jasmine.SpyObj<HajjUmmrahService>;
  beforeEach(() => {
    trips = jasmine.createSpyObj('trips', ['getAllTravels']);
    outings = jasmine.createSpyObj('outings', ['getAllOutings']);
    packages = jasmine.createSpyObj('packages', ['getAllManasik']);
    trips.getAllTravels.and.returnValue(of(result));
    outings.getAllOutings.and.returnValue(of(result));
    packages.getAllManasik.and.returnValue(of(result));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TravelTripsService, useValue: trips },
        { provide: OutingService, useValue: outings },
        { provide: HajjUmmrahService, useValue: packages }
      ]
    });
    component = TestBed.runInInjectionContext(() => new ReviewsComponent());
  });
  afterEach(() => component.ngOnDestroy());
  it('uses bounded one-based pages and preserves the submitted search when paging', () => {
    component.search = '  Cairo  ';
    component.find();
    expect(trips.getAllTravels.calls.mostRecent().args[0]).toEqual({
      isPagingEnabled: true,
      pageIndex: 1,
      pageSize: 12,
      search: 'Cairo',
      filters: []
    });
    component.search = 'Unsubmitted';
    component.changePage(1);
    expect(trips.getAllTravels.calls.mostRecent().args[0].search).toBe('Cairo');
    expect(component.page).toBe(2);
  });
  it('clears the selected item and search when switching item types', () => {
    component.selected = { id: 42 };
    component.search = 'old';
    component.page = 3;
    component.changeType('Outing');
    expect(component.selected).toBeNull();
    expect(component.search).toBe('');
    expect(component.page).toBe(1);
    expect(component.reviewType).toBe('Outing');
    expect(outings.getAllOutings).toHaveBeenCalled();
  });
  it('separates package catalogs while sharing the named review API type', () => {
    component.changeType('Hajj');
    expect(packages.getAllManasik.calls.mostRecent().args[0].Type).toBe(1);
    expect(component.reviewType).toBe('HajjUmrah');
    component.changeType('Umrah');
    expect(packages.getAllManasik.calls.mostRecent().args[0].Type).toBe(2);
    expect(component.reviewType).toBe('HajjUmrah');
  });
  it('cancels stale requests so an old catalog cannot overwrite a new type', () => {
    const stale = new Subject<any>();
    trips.getAllTravels.and.returnValue(stale);
    component.ngOnInit();
    component.changeType('Outing');
    stale.next({ success: true, data: { data: [{ id: 99 }], itemsCount: 1 } });
    expect(component.items[0].id).toBe(42);
    expect(component.loading).toBe(false);
    expect(stale.observed).toBe(false);
  });
  it('reports failed envelopes instead of a misleading empty state', () => {
    trips.getAllTravels.and.returnValue(of({ success: false }));
    component.load();
    expect(component.error).toBe('REVIEWS_CATALOG.ERROR');
    expect(component.items).toEqual([]);
  });
  it('allows retry after a catalog permission or network failure', () => {
    trips.getAllTravels.and.returnValue(throwError(() => ({ status: 403 })));
    component.load();
    expect(component.error).toBe('REVIEWS_CATALOG.PERMISSION_ERROR');
    trips.getAllTravels.and.returnValue(of(result));
    component.load();
    expect(component.error).toBe('');
    expect(component.items.length).toBe(1);
  });
});
