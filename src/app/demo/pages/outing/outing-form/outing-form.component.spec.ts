import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFormComponent } from './outing-form.component';

describe('OutingFormComponent', () => {
  let component: OutingFormComponent;
  let fixture: ComponentFixture<OutingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OutingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set availableQuantity and disable the control when excel serials are applied', () => {
    // Arrange: make sure hasSerialNumber is true
    component.ticketsForm.get('hasSerialNumber')?.setValue(true);
    // Example excel data with 5 serial numbers
    component.excelSerialNumbers = Array.from({ length: 5 }, (_, i) => ({ ticketCode: `S${i + 1}` }));

    // Act
    component.applyExcelSerialsToForm();

    // Assert
    const ctrl = component.ticketsForm.get('availableQuantity');
    expect(ctrl?.value).toBe(5);
    expect(ctrl?.disabled).toBeTrue();
  });

  it('should clear excel upload and re-enable available quantity', () => {
    // Arrange: set an uploaded state then clear
    component.excelSerialNumbers = Array.from({ length: 3 }, (_, i) => ({ ticketCode: `S${i + 1}` }));
    component.applyExcelSerialsToForm();

    // Act
    component.clearExcelUpload();

    // Assert
    const ctrl = component.ticketsForm.get('availableQuantity');
    expect(component.excelSerialNumbers.length).toBe(0);
    expect(ctrl?.enabled).toBeTrue();
    expect(ctrl?.value).toBe(1);
  });

  it('should correctly map availableQuantity from backend tickets with serials', () => {
    // Arrange: Prepare a response-like object
    const sample = {
      id: 99,
      name: 'Test Outing',
      tickets: [
        {
          id: 101,
          ticketType: 'serials..',
          description: 'serials..',
          price: 500,
          childPrice: null,
          availableQuantity: 11,
          isActive: true,
          outingId: 97,
          hasSerialNumber: true,
          outingTicketSerialNumbers: [{ ticketCode: 'A1' }, { ticketCode: 'A2' }, { ticketCode: 'A3' }]
        }
      ]
    };

    // Act
    component.populateFormsWithData(sample);

    // Assert: ticketsList should be mapped and availableQuantity set to 3 (from serials array length)
    expect(component.ticketsList.length).toBe(1);
    expect(component.ticketsList[0].availableQuantity).toBe(3);
    expect(component.ticketsList[0].excelData.length).toBe(3);
  });

  it('should set availableQuantity and excelData when adding a ticket with serials', () => {
    // Arrange
    component.ticketsForm.get('hasSerialNumber')?.setValue(true);
    component.excelSerialNumbers = [{ ticketCode: 'S1' }, { ticketCode: 'S2' }, { ticketCode: 'S3' }];
    component.ticketsForm.get('ticketType')?.setValue('serials..');
    component.ticketsForm.get('description')?.setValue('desc');
    component.ticketsForm.get('price')?.setValue(100);

    // Act
    component.addTicket();

    // Assert
    expect(component.ticketsList.length).toBeGreaterThan(0);
    const last = component.ticketsList[component.ticketsList.length - 1];
    expect(last.excelData?.length).toBe(3);
    expect(last.availableQuantity).toBe(3);
  });
});
