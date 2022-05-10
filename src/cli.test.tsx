import React from 'react';
import test from 'ava';
import { render } from 'ink-testing-library';
import App from './ui';

test('App renders without throwing error.', (t) => {
  t.notThrows(() => render(<App />));
});
