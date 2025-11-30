declare module 'expo-firebase-recaptcha' {
  import type { FirebaseApp } from 'firebase/app';
    import type { ApplicationVerifier } from 'firebase/auth';
    import * as React from 'react';

  export interface FirebaseRecaptchaVerifierModalProps {
    firebaseConfig: FirebaseApp['options'];
    attemptInvisibleVerification?: boolean;
    title?: string;
    cancelLabel?: string;
    androidHardwareAccelerationDisabled?: boolean;
  }

  export class FirebaseRecaptchaVerifierModal
    extends React.Component<FirebaseRecaptchaVerifierModalProps>
    implements ApplicationVerifier
  {
    type: string;
    verify(): Promise<string>;
  }
}
