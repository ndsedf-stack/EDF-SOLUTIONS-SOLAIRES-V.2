/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string;
  // ajoute ici tes autres variables si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
