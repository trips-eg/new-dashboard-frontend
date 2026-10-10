import { HttpErrorResponse } from '@angular/common/http';
import { TripStarDto, TripStarEntityType, TripStarItemDto } from '../model/trip-star.model';
import {
  buildTripStarFormData, parseLocalDate, selectedFromDto, toLocalIso, tripStarError, tripStarItemWarning, tripStarStatus
} from './trip-star.utils';

describe('TripStar helpers', () => {
  const card = (isActive: boolean, isExpired: boolean) => ({ isActive, isExpired }) as TripStarDto;

  it('derives all four lifecycle badges', () => {
    expect(tripStarStatus(card(true, false))).toBe('active');
    expect(tripStarStatus(card(false, false))).toBe('inactive');
    expect(tripStarStatus(card(false, true))).toBe('expired');
    expect(tripStarStatus(card(true, true))).toBe('reactivated');
  });

  it('warns for deleted, inactive and blocked items with room visibility rules', () => {
    expect(tripStarItemWarning(TripStarEntityType.Trip, null)).toBe('unavailable');
    expect(tripStarItemWarning(TripStarEntityType.Outing, { id: 1, isActive: false })).toBe('inactive');
    expect(tripStarItemWarning(TripStarEntityType.HajjUmrah, { id: 1, isBlocked: true })).toBe('blocked');
    expect(tripStarItemWarning(TripStarEntityType.Room, { id: 1, isActive: false })).toBeNull();
  });

  it('uses the catalog entity ID and falls back to its image for saved previews', () => {
    const item = {
      id: 99, entityType: TripStarEntityType.Trip, entityId: 12, displayOrder: 0,
      title: 'Featured trip', imageUrl: null,
      trip: { id: 12, name: 'Catalog trip', imageUrl: 'trip.jpg' }, outing: null, room: null, hajj: null
    } as TripStarItemDto;
    const selected = selectedFromDto(item);
    expect(selected.entityId).toBe(12);
    expect(selected.itemId).toBe(99);
    expect(selected.imageUrl).toBe('trip.jpg');
  });

  it('serializes a mixed carousel in global order and omits unchanged image and empty expiry', () => {
    const form = buildTripStarFormData(
      { title: 'Summer', titleAr: '', description: '', descriptionAr: '', linkUrl: '', displayOrder: 0, expiryDate: null },
      [
        { type: TripStarEntityType.Trip, entityId: 12, title: 'Trip', imageUrl: null, entity: null },
        { type: TripStarEntityType.Outing, entityId: 7, title: 'Outing', imageUrl: null, entity: null },
        { type: TripStarEntityType.Trip, entityId: 15, title: 'Trip 2', imageUrl: null, entity: null }
      ],
      null
    );
    expect(JSON.parse(form.get('TripIds') as string)).toEqual([{ id: 12, order: 0 }, { id: 15, order: 2 }]);
    expect(JSON.parse(form.get('OutingIds') as string)).toEqual([{ id: 7, order: 1 }]);
    expect(form.get('Image')).toBeNull();
    expect(form.get('ExpiryDate')).toBeNull();
  });

  it('keeps expiry as local wall-clock time', () => {
    const date = new Date(2026, 9, 15, 23, 59, 0);
    expect(toLocalIso(date)).toBe('2026-10-15T23:59:00');
    expect(parseLocalDate('2026-10-15T23:59:00')?.getHours()).toBe(23);
    const form = buildTripStarFormData(
      { title: '', titleAr: '', description: '', descriptionAr: '', linkUrl: '', displayOrder: 0, expiryDate: date },
      [],
      new File(['image'], 'card.png', { type: 'image/png' })
    );
    expect(form.get('ExpiryDate')).toBe('2026-10-15T23:59:00');
    expect((form.get('Image') as File).name).toBe('card.png');
  });

  it('reads both error shapes and framework validation', () => {
    expect(tripStarError(new HttpErrorResponse({ status: 400, error: { message: 'Trip 999 Not Found' } }))).toBe('Trip 999 Not Found');
    expect(tripStarError(new HttpErrorResponse({ status: 400, error: { errors: { TripIds: ['Invalid JSON'] } } }))).toBe('Invalid JSON');
    expect(tripStarError(new HttpErrorResponse({ status: 500, error: { Message: 'Error Process ID - 123' } }))).toContain('123');
    expect(tripStarError(new HttpErrorResponse({ status: 403 }))).toContain('permission');
  });
});
