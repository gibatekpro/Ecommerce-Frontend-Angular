import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import {ReactiveFormsModule} from "@angular/forms";
import {AuthComponent} from "./components/auth/auth.component";
import {RegisterComponent} from "./components/register/register.component";
import {LoginComponent} from "./components/login/login.component";
import {LoginStatusComponent} from "./components/login-status/login-status.component";
import {AuthService} from "./service/auth.service";


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    AuthComponent,
    LoginStatusComponent
  ],
  exports: [
    LoginStatusComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ],
})
export class AuthModule { }
