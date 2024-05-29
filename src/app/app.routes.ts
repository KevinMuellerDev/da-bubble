import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { MainsectionComponent } from './mainsection/mainsection.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'mainsection', component: MainsectionComponent},

];
