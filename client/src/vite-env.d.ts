/// <reference types="vite/client" />

// Type definitions for Vite environment variables
declare interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other environment variables here as needed
}

// Type definitions for our path aliases
declare module "@/*" {
  // This allows importing any file with @/ prefix
  const value: any;
  export default value;
}

declare module "@shared/*" {
  // This allows importing any file with @shared/ prefix
  const value: any;
  export default value;
}
