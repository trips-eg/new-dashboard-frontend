import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialSettingsListComponent } from './financial-settings-list.component';

describe('FinancialSettingsListComponent', () => {
  let component: FinancialSettingsListComponent;
  let fixture: ComponentFixture<FinancialSettingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialSettingsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialSettingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
