import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiError, fieldErrorsOf } from './staff-http';
import { FieldErrors, StaffText } from '../ui/kit';

/** Clear error messages (15 Nov 2026): the message alone, and the fields the server names marked until changed. */
describe('clear error messages', () => {
  let shown: string[];

  beforeEach(() => {
    shown = [];
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: ToastrService, useValue: { error: (m: string) => shown.push(m), success: () => undefined } }]
    });
  });

  it('reads the fields of a refusal from errors or field', () => {
    expect(fieldErrorsOf({ message: 'x', field: 'StartDate', errors: { StartDate: 'فاضية', Price: 'رقم' } })).toEqual({ StartDate: 'فاضية', Price: 'رقم' });
    expect(fieldErrorsOf({ message: 'm', field: 'Code' })).toEqual({ Code: 'm' });
    expect(fieldErrorsOf({ errors: { Name: ['The Name field is required.'] } })).toEqual({ Name: 'The Name field is required.' });
    expect(fieldErrorsOf({ message: 'm' })).toEqual({});
  });

  it('shows the message without the HTTP status or the API path, and marks the named fields', () => {
    const text = TestBed.inject(StaffText);
    const fields = TestBed.inject(FieldErrors);
    const e = new ApiError(400, null, 'خانة «تاريخ البداية» فاضية', null, '/api/Outings/AddOutingOnly/', 'Bad Request', {
      'TripDates[0].EndDate': 'خانة «تاريخ النهاية (رقم 1)» فاضية',
      name: 'خانة «الاسم» فاضية'
    });
    text.showError(e);
    expect(shown).toEqual(['خانة «تاريخ البداية» فاضية']);
    expect(fields.of('TripDates')).toBe('خانة «تاريخ النهاية (رقم 1)» فاضية');
    expect(fields.of('Name')).toBe('خانة «الاسم» فاضية');
    fields.clear('Name');
    expect(fields.of('Name')).toBeNull();
    expect(fields.of('TripDates')).not.toBeNull();
    // the next refusal replaces the marks
    text.showError(new ApiError(500, null, 'حصلت مشكلة عندنا، جرّب تاني. لو اتكررت ابعتلنا الكود ده: 4F2A'));
    expect(fields.of('TripDates')).toBeNull();
    expect(shown[1]).not.toContain('HTTP');
  });
});
