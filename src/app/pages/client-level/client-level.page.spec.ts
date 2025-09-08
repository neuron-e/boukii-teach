import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClientLevelPage } from './client-level.page';

describe('ClientLevelPage', () => {
  let component: ClientLevelPage;
  let fixture: ComponentFixture<ClientLevelPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ClientLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
