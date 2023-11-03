import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  @ViewChild('swiperWrapper') swiperWrapper: ElementRef;
  startSwipe: number;
  currentSlide = 0;
  
  constructor(private router: Router) {}

  ngOnInit() {
  }

  onTouchStart(event: TouchEvent) {
      this.startSwipe = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent) {
      const currentX = event.touches[0].clientX;
      const diffX = this.startSwipe - currentX;
      const offset = -this.currentSlide * window.innerWidth - diffX;
      this.setTranslateX(offset);
  }

  onTouchEnd(event: TouchEvent) {
      const endX = event.changedTouches[0].clientX;
      const diffX = this.startSwipe - endX;
      if (Math.abs(diffX) > window.innerWidth / 3) {
          // Change slide
          this.currentSlide += diffX > 0 ? 1 : -1;
          this.currentSlide = Math.min(Math.max(this.currentSlide, 0), 2);
      }
      const offset = -this.currentSlide * window.innerWidth;
      this.setTranslateX(offset);
  }

  setTranslateX(val: number) {
      this.swiperWrapper.nativeElement.style.transform = `translateX(${val}px)`;
  }

  goToSlide(slideIndex: number) {
    this.currentSlide = slideIndex;
    const offset = -this.currentSlide * window.innerWidth;
    this.setTranslateX(offset);
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }
}
