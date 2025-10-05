import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-school-selector',
  templateUrl: './school-selector.component.html',
  styleUrls: ['./school-selector.component.scss'],
})
export class SchoolSelectorComponent implements OnInit {
  @Input() schools: any[] = [];
  @Input() currentSchoolId: number | null = null;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  selectSchool(school: any) {
    this.modalController.dismiss({
      school: school
    });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
