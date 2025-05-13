export * from 'react';

// createPortal is imported via react-dom and we need to alias preact/compat to react to support other exports
export { createPortal } from 'react-dom';
