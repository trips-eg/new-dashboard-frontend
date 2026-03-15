import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdtiPermissionsForRoleComponent } from './edti-permissions-for-role.component';

describe('EdtiPermissionsForRoleComponent', () => {
  let component: EdtiPermissionsForRoleComponent;
  let fixture: ComponentFixture<EdtiPermissionsForRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdtiPermissionsForRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdtiPermissionsForRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
