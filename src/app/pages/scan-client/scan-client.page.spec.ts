import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScanClientPage } from './scan-client.page';

describe('ScanClientPage', () => {
  let component: ScanClientPage;
  let fixture: ComponentFixture<ScanClientPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ScanClientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
