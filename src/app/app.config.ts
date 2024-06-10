import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Environment } from '../../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'da-bubble-e6d79',
        appId: '1:728652156728:web:52fda9767640c5a89efbcd',
        storageBucket: 'da-bubble-e6d79.appspot.com',
        apiKey: Environment.API_KEY,
        authDomain: 'da-bubble-e6d79.firebaseapp.com',
        messagingSenderId: '728652156728',
      })
    ),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
  ],
};
