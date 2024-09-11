import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../service/auth.service";

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  authService.authUser.subscribe(
    user =>{

      if (user != null || user != undefined) {
        // authorised so return true
        return true;
      }else {
        // not logged in so redirect to login page with the return url
        router.navigate(['/auth/login'])
          .then();
        return false;
      }
    }
  )
};
