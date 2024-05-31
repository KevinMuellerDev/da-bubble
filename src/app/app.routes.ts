import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { MainsectionComponent } from './mainsection/mainsection.component';
import { RegisterComponent } from './login/register/register.component';
import { ResetpasswordComponent } from './login/resetpassword/resetpassword.component';
import { ConfirmpasswordComponent } from './login/confirmpassword/confirmpassword.component';
import { ChooseavatarComponent } from './login/chooseavatar/chooseavatar.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'mainsection', component: MainsectionComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'register/chooseavatar', component: ChooseavatarComponent},
    {path: 'resetpassword', component: ResetpasswordComponent},
    {path: 'confirmpassword', component: ConfirmpasswordComponent},
    {path: 'imprint', component: ImprintComponent},
    {path: 'privacypolicy', component: PrivacypolicyComponent}
];
