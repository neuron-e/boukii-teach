import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientLevelPage } from './client-level.page';

describe('ClientLevelPage', () => {
  let component: ClientLevelPage;
  let fixture: ComponentFixture<ClientLevelPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClientLevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
