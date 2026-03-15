import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjListComponent } from './hajj-list.component';

describe('HajjListComponent', () => {
  let component: HajjListComponent;
  let fixture: ComponentFixture<HajjListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
