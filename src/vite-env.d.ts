/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_APP_KEY: string
  readonly VITE_KAKAO_REST_API_KEY: string
  readonly VITE_ENV_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

