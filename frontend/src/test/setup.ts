import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up mounting after every test
afterEach(() => {
  cleanup();
});
