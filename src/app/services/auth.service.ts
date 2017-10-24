// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NoteDialog } from '../shared/note/note.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: 'RlqH0baoNguqnJ1X9BG2cbFTqRUy271I',
    domain: 'cercec.eu.auth0.com',
    responseType: 'token id_token',
    audience: 'https://cercec.eu.auth0.com/userinfo',
    redirectUri: 'https://russian-deeds.herokuapp.com/callback',      
    scope: 'openid%20profile'
  });

  constructor(public router: Router, public dialogNoteRef: MatDialogRef<NoteDialog>, public dialogConfirmRef: MatDialogRef<ConfirmDialogComponent>) {}

  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.getUserInfo(authResult);
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/list']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    this.dialogNoteRef.close();
    this.dialogConfirmRef.close();
    // Go back to the home route
    this.router.navigate(['/home']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  private getUserInfo(authResult) {
      this.auth0.client.userInfo(authResult.accessToken, function(err, user) {
        console.log(err);
        console.log(user);
        localStorage.setItem('userName', user.nickname);
        
    });
  }


}
