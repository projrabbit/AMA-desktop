/// <reference types="vite/client" />

interface ArcgisCdnGlobal {
  import<T = unknown>(modules: string | string[]): Promise<T>;
}

interface Window {
  $arcgis?: ArcgisCdnGlobal;
}
