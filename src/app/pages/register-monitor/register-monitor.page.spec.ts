import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegisterMonitorPage } from './register-monitor.page';

describe('RegisterMonitorPage', () => {
  let component: RegisterMonitorPage;
  let fixture: ComponentFixture<RegisterMonitorPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(RegisterMonitorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
