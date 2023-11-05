import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  {
    path: 'start',
    loadChildren: () => import('./pages/start/start.module').then( m => m.StartPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'monitor-detail',
    loadChildren: () => import('./pages/monitor-detail/monitor-detail.module').then( m => m.MonitorDetailPageModule)
  },
  {
    path: 'courses',
    loadChildren: () => import('./pages/courses/courses.module').then( m => m.CoursesPageModule)
  },
  {
    path: 'stations',
    loadChildren: () => import('./pages/stations/stations.module').then( m => m.StationsPageModule)
  },
  {
    path: 'new-booking',
    loadChildren: () => import('./pages/new-booking/new-booking.module').then( m => m.NewBookingPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'calendar',
    loadChildren: () => import('./pages/calendar/calendar.module').then( m => m.CalendarPageModule)
  },
  {
    path: 'station',
    loadChildren: () => import('./pages/station/station.module').then( m => m.StationPageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'stations-list',
    loadChildren: () => import('./pages/stations-list/stations-list.module').then( m => m.StationsListPageModule)
  },
  {
    path: 'monitor-profile',
    loadChildren: () => import('./pages/monitor-profile/monitor-profile.module').then( m => m.MonitorProfilePageModule)
  },
  {
    path: 'group',
    loadChildren: () => import('./pages/group/group.module').then( m => m.GroupPageModule)
  },
  {
    path: 'promotions',
    loadChildren: () => import('./pages/promotions/promotions.module').then( m => m.PromotionsPageModule)
  },
  {
    path: 'booking-detail',
    loadChildren: () => import('./pages/booking-detail/booking-detail.module').then( m => m.BookingDetailPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./pages/clients/clients.module').then( m => m.ClientsPageModule)
  },
  {
    path: 'client-detail',
    loadChildren: () => import('./pages/client-detail/client-detail.module').then( m => m.ClientDetailPageModule)
  },
  {
    path: 'client-level',
    loadChildren: () => import('./pages/client-level/client-level.module').then( m => m.ClientLevelPageModule)
  },
  {
    path: 'register-complete',
    loadChildren: () => import('./pages/register-complete/register-complete.module').then( m => m.RegisterCompletePageModule)
  },
  {
    path: 'register-monitor',
    loadChildren: () => import('./pages/register-monitor/register-monitor.module').then( m => m.RegisterMonitorPageModule)
  },
  {
    path: 'schools',
    loadChildren: () => import('./pages/schools/schools.module').then( m => m.SchoolsPageModule)
  },
  {
    path: 'school-add',
    loadChildren: () => import('./pages/school-add/school-add.module').then( m => m.SchoolAddPageModule)
  },
  {
    path: 'course-detail',
    loadChildren: () => import('./pages/course-detail/course-detail.module').then( m => m.CourseDetailPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
