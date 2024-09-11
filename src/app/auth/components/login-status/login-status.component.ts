import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean;

  userFullName: string = '';

  constructor(private authService: AuthService) {

    this.isAuthenticated = !!this.authService.authUser;

    // Subscribe to user changes to update isAuthenticated
    this.authService.authUser.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.userFullName = user?.firstName!;
    });
  }

  ngOnInit(): void {
  }


  async logout() {
    // Terminates the session with Okta and removes current tokens.
    await this.authService.logout();
  }
}
