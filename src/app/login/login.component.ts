import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  email = this.loginForm.get('email');
  password = this.loginForm.get('password');

  constructor(
    public authService: AuthService,
    public router: Router,
    private toast: HotToastService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit() {}

  loginAsGuest() {
    this.authService
      .login('guest@example.com', 'password')
      .pipe(
        this.toast.observe({
          success: 'Logged in successfully',
          loading: 'Logging in ...',
          error: 'There was an error',
        })
      )
      .subscribe(() => {
        this.router.navigate(['/client']);
      });
  }

  submit() {
    if (!this.loginForm.valid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService
      .login(email, password)
      .pipe(
        this.toast.observe({
          success: 'Logged in successfully',
          loading: 'Logging in ...',
          error: ({ message }) => `${message}`,
        })
      )
      .subscribe(() => {
        this.router.navigate(['/client']);
      });
  }
}
