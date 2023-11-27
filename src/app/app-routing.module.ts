import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  {
    path: 'start',
    loadChildren: () => import('./pages/start/start.module').then( m => m.StartPageModule),
    canActivate: [LoginGuard]
  },
  /*
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule),
    canActivate: [LoginGuard]
  },
  */
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'monitor-detail',
    loadChildren: () => import('./pages/monitor-detail/monitor-detail.module').then( m => m.MonitorDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    loadChildren: () => import('./pages/courses/courses.module').then( m => m.CoursesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stations',
    loadChildren: () => import('./pages/stations/stations.module').then( m => m.StationsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'new-booking',
    loadChildren: () => import('./pages/new-booking/new-booking.module').then( m => m.NewBookingPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/cart/cart.module').then( m => m.CartPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    loadChildren: () => import('./pages/calendar/calendar.module').then( m => m.CalendarPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'station',
    loadChildren: () => import('./pages/station/station.module').then( m => m.StationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then( m => m.MessagesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stations-list',
    loadChildren: () => import('./pages/stations-list/stations-list.module').then( m => m.StationsListPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'monitor-profile',
    loadChildren: () => import('./pages/monitor-profile/monitor-profile.module').then( m => m.MonitorProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'group',
    loadChildren: () => import('./pages/group/group.module').then( m => m.GroupPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'promotions',
    loadChildren: () => import('./pages/promotions/promotions.module').then( m => m.PromotionsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking-detail',
    loadChildren: () => import('./pages/booking-detail/booking-detail.module').then( m => m.BookingDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clients',
    loadChildren: () => import('./pages/clients/clients.module').then( m => m.ClientsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'client-detail/:id',
    loadChildren: () => import('./pages/client-detail/client-detail.module').then( m => m.ClientDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'client-level/:client/:sport',
    loadChildren: () => import('./pages/client-level/client-level.module').then( m => m.ClientLevelPageModule),
    canActivate: [AuthGuard]
  },
  /*
  {
    path: 'register-complete',
    loadChildren: () => import('./pages/register-complete/register-complete.module').then( m => m.RegisterCompletePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'register-monitor',
    loadChildren: () => import('./pages/register-monitor/register-monitor.module').then( m => m.RegisterMonitorPageModule),
    canActivate: [AuthGuard]
  },
  */
  {
    path: 'schools',
    loadChildren: () => import('./pages/schools/schools.module').then( m => m.SchoolsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'school-add',
    loadChildren: () => import('./pages/school-add/school-add.module').then( m => m.SchoolAddPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-detail/:id/:date',
    loadChildren: () => import('./pages/course-detail/course-detail.module').then( m => m.CourseDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-detail-level/:id/:date/:client/:sport',
    loadChildren: () => import('./pages/course-detail-level/course-detail-level.module').then( m => m.CourseDetailLevelPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-detail-level-update/:id/:date/:client/:sport',
    loadChildren: () => import('./pages/course-detail-level-update/course-detail-level-update.module').then( m => m.CourseDetailLevelUpdatePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-group',
    loadChildren: () => import('./pages/course-group/course-group.module').then( m => m.CourseGroupPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-participation',
    loadChildren: () => import('./pages/course-participation/course-participation.module').then( m => m.CourseParticipationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-transfer',
    loadChildren: () => import('./pages/course-transfer/course-transfer.module').then( m => m.CourseTransferPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar-available',
    loadChildren: () => import('./pages/calendar-available/calendar-available.module').then( m => m.CalendarAvailablePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadChildren: () => import('./pages/stats/stats.module').then( m => m.StatsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'scan-client',
    loadChildren: () => import('./pages/scan-client/scan-client.module').then( m => m.ScanClientPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'scan',
    loadChildren: () => import('./pages/scan/scan.module').then( m => m.ScanPageModule),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
