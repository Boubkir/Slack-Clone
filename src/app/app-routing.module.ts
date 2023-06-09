import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { SignupComponent } from './signup/signup.component';
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';
import { DialogEditUserComponent } from './dialog-edit-user/dialog-edit-user.component';


const redirectToLogin = () => redirectUnauthorizedTo(['']);
const redirectToHome = () => redirectLoggedInTo(['client']);

const routes: Routes = [
  { path: '', component: LoginComponent, ...canActivate(redirectToHome) },
  { path: 'client', component: ChatComponent, ...canActivate(redirectToLogin) },
  { path: 'client/:id', component: ChatComponent,...canActivate(redirectToLogin) },
  { path: 'profile', component: DialogEditUserComponent, ...canActivate(redirectToLogin) },
  {
    path: 'signup',
    component: SignupComponent,
    ...canActivate(redirectToHome),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
