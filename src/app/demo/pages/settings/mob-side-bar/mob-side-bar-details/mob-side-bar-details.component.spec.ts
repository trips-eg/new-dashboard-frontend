import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarDetailsComponent } from './mob-side-bar-details.component';

describe('MobSideBarDetailsComponent', () => {
  let component: MobSideBarDetailsComponent;
  let fixture: ComponentFixture<MobSideBarDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
