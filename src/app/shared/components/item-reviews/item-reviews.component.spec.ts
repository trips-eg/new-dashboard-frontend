import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { ReviewsService } from '../../services/reviews.service';
import { ReviewDto } from '../../model/review.model';
import { ItemReviewsComponent } from './item-reviews.component';

describe('ItemReviewsComponent', () => {
  let fixture: ComponentFixture<ItemReviewsComponent>;
  let component: ItemReviewsComponent;
  let service: jasmine.SpyObj<ReviewsService>;
  let roles: string[];
  const review: ReviewDto = {
    id: 7,
    customerName: 'Customer',
    stars: 4,
    comment: 'Good trip',
    createdAt: '2026-10-06T12:00:00Z',
    userId: null
  };

  beforeEach(async () => {
    roles = ['Admin.Support'];
    service = jasmine.createSpyObj('ReviewsService', ['list', 'create', 'update', 'delete']);
    service.list.and.returnValue(of([review]));
    service.create.and.returnValue(of(undefined));
    service.update.and.returnValue(of(undefined));
    service.delete.and.returnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [ItemReviewsComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ReviewsService, useValue: service },
        { provide: ConfigureService, useValue: { UserToken: () => 'test-token', userRoles: () => roles } }
      ]
    }).compileComponents();
    TestBed.inject(TranslateService).use('en');
    fixture = TestBed.createComponent(ItemReviewsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('itemType', 'Trip');
    fixture.componentRef.setInput('itemId', 42);
    fixture.componentRef.setInput('itemName', 'Trip name');
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  function validForm(): void {
    component.form.setValue({ customerName: '  Customer name  ', stars: 5, comment: '  Nice  ' });
  }
  for (const role of ['Admin.Super', 'Admin.Manager', 'Admin.Support']) {
    it('permits the exact admin role ' + role, () => {
      roles = [role];
      expect(component.canManage).toBeTrue();
    });
  }
  it('hides mutation controls and blocks direct handlers for vendor roles', () => {
    roles = ['Vendor.Owner', 'Admin.Unknown'];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.review-header-actions .primary')).toBeNull();
    expect(fixture.nativeElement.querySelector('.review-card-actions')).toBeNull();
    validForm();
    component.openEditor();
    component.save();
    component.askDelete(review);
    component.confirmDelete();
    expect(component.editorVisible).toBeFalse();
    expect(service.create).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });
  for (const stars of [null, 0, 6, 2.5]) {
    it('rejects invalid rating ' + stars, () => {
      component.openEditor();
      validForm();
      component.form.controls.stars.setValue(stars);
      component.save();
      expect(service.create).not.toHaveBeenCalled();
    });
  }
  it('rejects whitespace-only names', () => {
    component.openEditor();
    validForm();
    component.form.controls.customerName.setValue('   ');
    component.save();
    expect(service.create).not.toHaveBeenCalled();
  });
  for (const [type, key] of [
    ['Trip', 'tripId'],
    ['Outing', 'outingId'],
    ['HajjUmrah', 'hajjUmrahPackageId']
  ]) {
    it('creates a trimmed review attached only to ' + type, () => {
      fixture.componentRef.setInput('itemType', type);
      fixture.detectChanges();
      component.openEditor();
      validForm();
      component.save();
      expect(service.create.calls.mostRecent().args[0] as object).toEqual({
        customerName: 'Customer name',
        stars: 5,
        comment: 'Nice',
        [key]: 42
      });
      expect(component.editorVisible).toBeFalse();
      expect(component.feedback).toBe('REVIEWS.CREATED');
    });
  }
  it('edits by review id, keeps its item, and sends an empty string to clear comments', () => {
    component.openEditor(review);
    component.form.controls.comment.setValue('');
    component.save();
    expect(service.update).toHaveBeenCalledWith(7, { customerName: 'Customer', stars: 4, comment: '' });
    expect(service.create).not.toHaveBeenCalled();
  });
  it('prevents duplicate saves while pending', () => {
    const pending = new Subject<void>();
    service.create.and.returnValue(pending);
    component.openEditor();
    validForm();
    component.save();
    component.save();
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(component.saving).toBeTrue();
    pending.next();
    pending.complete();
    expect(component.saving).toBeFalse();
  });
  it('retains user input and the open editor on API validation failure', () => {
    service.create.and.returnValue(throwError(() => ({ status: 400, error: { errors: { customerName: ['Invalid customer name'] } } })));
    component.openEditor();
    validForm();
    component.save();
    expect(component.editorVisible).toBeTrue();
    expect(component.form.controls.customerName.value).toBe('  Customer name  ');
    expect(component.formError).toBe('Invalid customer name');
    expect(component.saving).toBeFalse();
  });
  it('requires confirmation and retains the delete dialog on permission failure', () => {
    service.delete.and.returnValue(throwError(() => ({ status: 403 })));
    component.askDelete(review);
    expect(service.delete).not.toHaveBeenCalled();
    component.confirmDelete();
    expect(service.delete).toHaveBeenCalledWith(7);
    expect(component.deleteVisible).toBeTrue();
    expect(component.deleteError).toBe('REVIEWS.PERMISSION_ERROR');
    expect(component.deleting).toBeFalse();
  });
  it('clears loading after a failure and supports retry', () => {
    service.list.and.returnValue(throwError(() => ({ status: 0 })));
    component.loadReviews();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBe('REVIEWS.NETWORK_ERROR');
    service.list.and.returnValue(of([]));
    component.loadReviews();
    expect(component.loadError).toBe('');
    expect(component.reviews).toEqual([]);
  });
  it('cancels old item requests so a late result cannot replace the new item reviews', () => {
    const oldRequest = new Subject<ReviewDto[]>();
    service.list.and.returnValue(oldRequest);
    component.loadReviews();
    service.list.and.returnValue(of([{ ...review, id: 8 }]));
    fixture.componentRef.setInput('itemId', 43);
    fixture.detectChanges();
    oldRequest.next([review]);
    expect(component.reviews[0].id).toBe(8);
  });
  it('cancels pending saves when changing items', () => {
    const pending = new Subject<void>();
    service.create.and.returnValue(pending);
    component.openEditor();
    validForm();
    component.save();
    fixture.componentRef.setInput('itemId', 43);
    fixture.detectChanges();
    pending.next();
    expect(component.saving).toBeFalse();
    expect(component.editorVisible).toBeFalse();
    expect(component.feedback).toBe('');
  });
  it('calculates summary from all reviews while filtering and sorting locally', () => {
    service.list.and.returnValue(of([review, { ...review, id: 8, stars: 2, createdAt: '2026-10-07T12:00:00Z' }]));
    component.loadReviews();
    expect(component.average).toBe(3);
    expect(component.filteredReviews[0].id).toBe(8);
    component.setRatingFilter('4');
    expect(component.filteredReviews.map((value) => value.id)).toEqual([7]);
    expect(component.average).toBe(3);
    component.setRatingFilter('0');
    component.setSortOrder('oldest');
    expect(component.filteredReviews[0].id).toBe(7);
  });
  it('clamps the local page after reviews are removed', () => {
    service.list.and.returnValue(of(Array.from({ length: 7 }, (_, index) => ({ ...review, id: index + 1 }))));
    component.loadReviews();
    component.page = 1;
    service.list.and.returnValue(of([review]));
    component.loadReviews();
    expect(component.page).toBe(0);
    expect(component.visibleReviews.length).toBe(1);
  });
});
