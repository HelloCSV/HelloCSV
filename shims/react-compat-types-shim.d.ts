declare module 'preact' {
  export * from 'react';
  export const h: typeof React.createElement;
}

declare module 'preact/hooks' {
  export * from 'react';
}

declare module 'preact/jsx-runtime' {
  export * from 'react/jsx-runtime';
}

declare module 'preact/compat' {
  export * from 'react';
}
