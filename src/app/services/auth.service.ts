// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {

      user: Observable<firebase.User>;
      
      constructor(public afAuth: AngularFireAuth) {
        this.user = afAuth.authState;
      }
    
      login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        console.log(this.user);
      }
    
      logout() {
        console.log(this.user);     
        this.afAuth.auth.signOut();
      }

  public isAuthenticated(): boolean {
    if (this.user) {
      return true;
    }
  }



}
