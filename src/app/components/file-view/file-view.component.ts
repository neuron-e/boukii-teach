import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.scss'],
})
export class FileViewComponent {
  @Input() type: string = '';
  @Input() file: string = '';
  @Output() close = new EventEmitter<void>();

  doCloseModal() {
    this.close.emit();
  }
}