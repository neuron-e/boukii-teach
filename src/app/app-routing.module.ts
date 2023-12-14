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
    path: 'calendar',
    loadChildren: () => import('./pages/calendar/calendar.module').then( m => m.CalendarPageModule),
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
    path: 'monitor-profile',
    loadChildren: () => import('./pages/monitor-profile/monitor-profile.module').then( m => m.MonitorProfilePageModule),
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
    path: 'client-level/:type/:id/:date/:client/:sport',
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
    path: 'course-group/:id/:date/:course/:hour/:group/:subgroup',
    loadChildren: () => import('./pages/course-group/course-group.module').then( m => m.CourseGroupPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-participation/:id/:date/:course',
    loadChildren: () => import('./pages/course-participation/course-participation.module').then( m => m.CourseParticipationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'course-transfer/:id/:date/:course/:hour/:group/:subgroup',
    loadChildren: () => import('./pages/course-transfer/course-transfer.module').then( m => m.CourseTransferPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar-available',
    loadChildren: () => import('./pages/calendar-available/calendar-available.module').then( m => m.CalendarAvailablePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar-available/:type/:date',
    loadChildren: () => import('./pages/calendar-available/calendar-available.module').then( m => m.CalendarAvailablePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar-available/:type/:date/:id_edit',
    loadChildren: () => import('./pages/calendar-available/calendar-available.module').then( m => m.CalendarAvailablePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'stats',
    loadChildren: () => import('./pages/stats/stats.module').then( m => m.StatsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'scan-client/:client',
    loadChildren: () => import('./pages/scan-client/scan-client.module').then( m => m.ScanClientPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'scan',
    loadChildren: () => import('./pages/scan/scan.module').then( m => m.ScanPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'meteo',
    loadChildren: () => import('./pages/meteo/meteo.module').then( m => m.MeteoPageModule),
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
