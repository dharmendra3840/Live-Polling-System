/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API?: string
  // add other env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
