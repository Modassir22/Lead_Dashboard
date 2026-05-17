/// <reference types="vite/client" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': any;
      'lottie-player': any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': any;
      'lottie-player': any;
    }
  }
}
export {};
