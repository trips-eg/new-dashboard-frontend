import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarComponent } from './mob-side-bar.component';

describe('MobSideBarComponent', () => {
  let component: MobSideBarComponent;
  let fixture: ComponentFixture<MobSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
