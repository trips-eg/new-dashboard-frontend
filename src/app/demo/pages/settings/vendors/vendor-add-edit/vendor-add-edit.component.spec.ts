import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAddEditComponent } from './vendor-add-edit.component';

describe('VendorAddEditComponent', () => {
  let component: VendorAddEditComponent;
  let fixture: ComponentFixture<VendorAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
