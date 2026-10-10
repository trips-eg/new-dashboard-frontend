import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  CatalogEntity,
  SelectedTripStarItem,
  TripStarDto,
  TripStarEntityType,
  TripStarFormValue,
  TripStarItemDto
} from '../model/trip-star.model';

export function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function parseLocalDate(value: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  return new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +(match[6] || 0));
}

export function tripStarImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${environment.imgUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function tripStarStatus(card: TripStarDto): 'active' | 'inactive' | 'expired' | 'reactivated' {
  if (card.isActive) return card.isExpired ? 'reactivated' : 'active';
  return card.isExpired ? 'expired' : 'inactive';
}

export function itemEntity(item: TripStarItemDto): CatalogEntity | null {
  switch (item.entityType) {
    case TripStarEntityType.Trip: return item.trip;
    case TripStarEntityType.Outing: return item.outing;
    case TripStarEntityType.Room: return item.room;
    case TripStarEntityType.HajjUmrah: return item.hajj;
    default: return null;
  }
}

export function tripStarItemWarning(type: TripStarEntityType, entity: CatalogEntity | null): 'unavailable' | 'inactive' | 'blocked' | null {
  if (!entity) return 'unavailable';
  if (entity.isBlocked === true) return 'blocked';
  if (type !== TripStarEntityType.Room && entity.isActive === false) return 'inactive';
  return null;
}

export function selectedFromDto(item: TripStarItemDto): SelectedTripStarItem {
  const entity = itemEntity(item);
  return {
    type: item.entityType,
    entityId: item.entityId,
    itemId: item.id,
    title: item.title || `#${item.entityId}`,
    imageUrl: item.imageUrl || entity?.imageUrl || null,
    entity
  };
}

export function buildTripStarFormData(value: TripStarFormValue, items: SelectedTripStarItem[], image: File | null): FormData {
  const form = new FormData();
  form.append('Title', value.title ?? '');
  form.append('TitleAr', value.titleAr ?? '');
  form.append('Description', value.description ?? '');
  form.append('DescriptionAr', value.descriptionAr ?? '');
  form.append('LinkUrl', value.linkUrl ?? '');
  form.append('DisplayOrder', String(value.displayOrder ?? 0));
  if (value.expiryDate) form.append('ExpiryDate', toLocalIso(value.expiryDate));
  if (image) form.append('Image', image, image.name);

  const byType: Record<TripStarEntityType, { id: number; order: number }[]> = {
    [TripStarEntityType.Trip]: [],
    [TripStarEntityType.Outing]: [],
    [TripStarEntityType.Room]: [],
    [TripStarEntityType.HajjUmrah]: []
  };
  items.forEach((item, order) => byType[item.type].push({ id: item.entityId, order }));
  form.append('TripIds', JSON.stringify(byType[TripStarEntityType.Trip]));
  form.append('RoomIds', JSON.stringify(byType[TripStarEntityType.Room]));
  form.append('OutingIds', JSON.stringify(byType[TripStarEntityType.Outing]));
  form.append('HajjIds', JSON.stringify(byType[TripStarEntityType.HajjUmrah]));
  return form;
}

export function tripStarError(error: HttpErrorResponse | unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Something went wrong';
  if (error.status === 401) return 'Your session has expired. Please sign in again.';
  if (error.status === 403) return 'You do not have permission to perform this action.';
  if (error.status === 0) return 'Unable to connect to the server.';
  const body = error.error;
  if (body && typeof body === 'object') {
    if (body.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors).flat().filter((message): message is string => typeof message === 'string');
      if (messages.length) return messages.join(', ');
    }
    const message = body.message ?? body.Message;
    if (typeof message === 'string' && message.trim()) {
      return error.status === 500 ? `Something went wrong. ${message}` : message;
    }
  }
  return 'Something went wrong';
}
