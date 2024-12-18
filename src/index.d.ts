declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.glb' {
  const value: string;
  export default value;
}

declare module 'cannon' {
  export interface Body {
    option?: string;
  }
}