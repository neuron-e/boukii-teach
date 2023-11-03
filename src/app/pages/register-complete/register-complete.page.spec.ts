import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterCompletePage } from './register-complete.page';

describe('RegisterCompletePage', () => {
  let component: RegisterCompletePage;
  let fixture: ComponentFixture<RegisterCompletePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegisterCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
