import { Routes } from '@angular/router';
import { Page404Component } from './pages/page404/page404.component';
import { HomepageComponent } from './pages/homepage/homepage.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },

  { path: '**', component: Page404Component },
];
