'use client';
import {
  Auth,
  User,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(
  authInstance: Auth,
  onSuccess: (user: User) => void,
  onError: (error: any) => void
): void {
  signInAnonymously(authInstance)
    .then((userCredential: UserCredential) => {
      onSuccess(userCredential.user);
    })
    .catch((error) => {
      onError(error);
    });
}

/** Initiate email/password sign-up (non-blocking) with callbacks. */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess: (user: User) => void,
  onError: (error: any) => void
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      onSuccess(userCredential.user);
    })
    .catch((error) => {
      onError(error);
    });
}

/** Initiate email/password sign-in (non-blocking) with callbacks. */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onSuccess: (user: User) => void,
  onError: (error: any) => void
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      onSuccess(userCredential.user);
    })
    .catch((error) => {
      onError(error);
    });
}
