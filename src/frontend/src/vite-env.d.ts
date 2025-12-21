/// <reference types="vite/client" />
declare const APP_VERSION: string;
declare module "~build/git" {
  export const abbreviatedSha: string;
}
