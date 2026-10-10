import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SelectedTripStarItem, TripStarEntityType } from 'src/app/shared/model/trip-star.model';
import { TripStarMobilePreviewComponent } from './trip-star-mobile-preview.component';

describe('TripStarMobilePreviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TripStarMobilePreviewComponent, TranslateModule.forRoot()] }).compileComponents();
  });

  it('shows draft content in either language without saving', () => {
    const fixture = TestBed.createComponent(TripStarMobilePreviewComponent);
    fixture.componentRef.setInput('titleEn', 'Desert escape');
    fixture.componentRef.setInput('titleAr', 'رحلة الصحراء');
    fixture.detectChanges();

    fixture.componentInstance.setLanguage('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-copy h3').textContent).toContain('Desert escape');

    fixture.componentInstance.setLanguage('ar');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-copy h3').textContent).toContain('رحلة الصحراء');
    expect(fixture.nativeElement.querySelector('.tsp-stage').getAttribute('dir')).toBe('rtl');
  });

  it('keeps the selected experience position valid after items are removed', () => {
    const fixture = TestBed.createComponent(TripStarMobilePreviewComponent);
    const items: SelectedTripStarItem[] = [
      { type: TripStarEntityType.Trip, entityId: 1, title: 'Trip', imageUrl: null, entity: { id: 1, name: 'Trip' } },
      { type: TripStarEntityType.Room, entityId: 2, title: 'Room', imageUrl: null, entity: { id: 2, name: 'Room' } }
    ];
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    fixture.componentInstance.selectItem(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-item-number').textContent).toContain('2 / 2');

    fixture.componentRef.setInput('items', items.slice(0, 1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-item-number').textContent).toContain('1 / 1');
    expect(fixture.nativeElement.querySelector('.tsp-copy h3').textContent).toContain('Trip');
  });

  it('changes the main artwork, title, description and date through arrows and dots', () => {
    const fixture = TestBed.createComponent(TripStarMobilePreviewComponent);
    fixture.componentRef.setInput('titleEn', 'Collection title');
    fixture.componentRef.setInput('image', 'collection-image.jpg');
    fixture.componentRef.setInput('items', [
      { type: TripStarEntityType.Outing, entityId: 1, title: 'Outing', imageUrl: '/images/outing.jpg', entity: { id: 1, name: 'Escape room', description: 'Solve the mystery', startDate: '2026-10-01T12:00:00' } },
      { type: TripStarEntityType.Trip, entityId: 2, title: 'Trip', imageUrl: null, entity: { id: 2, name: 'Desert adventure', description: '<p>Explore the dunes</p>', startDate: '2026-10-02T12:00:00', images: [{ imageUrl: '/images/desert.jpg', isFavoriteImage: true }] } }
    ]);
    fixture.detectChanges();
    const slide = fixture.nativeElement;
    expect(slide.querySelector('.tsp-copy h3').textContent).toContain('Escape room');
    expect(slide.querySelector('.tsp-visual img').getAttribute('src')).toContain('/images/outing.jpg');

    slide.querySelector('.tsp-arrow-next').click();
    fixture.detectChanges();
    expect(slide.querySelector('.tsp-copy h3').textContent).toContain('Desert adventure');
    expect(slide.querySelector('.tsp-description').textContent).toContain('Explore the dunes');
    expect(slide.querySelector('.tsp-visual img').getAttribute('src')).toContain('/images/desert.jpg');
    expect(slide.querySelector('.tsp-date').textContent).toContain('Oct 2, 2026');
    expect(slide.querySelectorAll('.tsp-dots button')[1].getAttribute('aria-current')).toBe('true');

    slide.querySelectorAll('.tsp-dots button')[0].click();
    fixture.detectChanges();
    expect(slide.querySelector('.tsp-copy h3').textContent).toContain('Escape room');
    expect(slide.querySelector('.tsp-visual img').getAttribute('src')).toContain('/images/outing.jpg');
  });

  it('shows a missing-item-image placeholder instead of leaking the collection artwork', () => {
    const fixture = TestBed.createComponent(TripStarMobilePreviewComponent);
    fixture.componentRef.setInput('image', 'collection-image.jpg');
    fixture.componentRef.setInput('items', [{ type: TripStarEntityType.Room, entityId: 3, title: 'Room', imageUrl: null, entity: { id: 3, name: 'Suite' } }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-visual img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.tsp-image-placeholder')).not.toBeNull();

    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tsp-visual img').getAttribute('src')).toBe('collection-image.jpg');
  });

  it('keeps parent content visible while navigating independently through its items', () => {
    const fixture = TestBed.createComponent(TripStarMobilePreviewComponent);
    const parentImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    fixture.componentRef.setInput('titleEn', 'Sherlocked');
    fixture.componentRef.setInput('descriptionEn', 'Curated experiences for your next adventure.');
    fixture.componentRef.setInput('image', parentImage);
    fixture.componentRef.setInput('linkUrl', 'trips://tripstars/34');
    fixture.componentRef.setInput('expiryDate', new Date(2026, 10, 30));
    fixture.componentRef.setInput('items', [
      { type: TripStarEntityType.Outing, entityId: 1, title: 'Escape room', imageUrl: null, entity: { id: 1, name: 'Escape room', description: 'Solve the mystery.' } },
      { type: TripStarEntityType.Trip, entityId: 2, title: 'Aswan', imageUrl: null, entity: { id: 2, name: 'Aswan', startDate: '2026-10-01T12:00:00' } }
    ]);
    fixture.detectChanges();
    const preview = fixture.nativeElement;
    const parent = preview.querySelector('.tsp-parent-header');
    expect(parent.querySelector('h2').textContent).toContain('Sherlocked');
    expect(parent.querySelector('.tsp-parent-description').textContent).toContain('Curated experiences');
    expect(parent.querySelector('.tsp-parent-image img').getAttribute('src')).toBe(parentImage);
    expect(parent.querySelector('.tsp-parent-expiry').textContent).toContain('Nov 30, 2026');
    expect(parent.querySelector('.tsp-parent-link-value').textContent).toBe('trips://tripstars/34');

    preview.querySelector('.tsp-arrow-next').click();
    fixture.detectChanges();
    expect(preview.querySelector('.tsp-copy h3').textContent).toContain('Aswan');
    expect(preview.querySelector('.tsp-date').textContent).toContain('Oct 1, 2026');
    expect(preview.querySelector('.tsp-description')).toBeNull();
    expect(parent.querySelector('h2').textContent).toContain('Sherlocked');
    expect(parent.querySelector('.tsp-parent-expiry').textContent).toContain('Nov 30, 2026');
    expect(parent.querySelector('.tsp-parent-description').textContent).toContain('Curated experiences');
    expect(parent.querySelector('.tsp-parent-image img').getAttribute('src')).toBe(parentImage);
  });
});
