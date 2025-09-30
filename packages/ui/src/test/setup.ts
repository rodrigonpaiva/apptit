import { expect } from 'vitest';

type MatcherResult = {
  pass: boolean;
  message: () => string;
};

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeInTheDocument(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): void;
  }
}

expect.extend({
  toBeInTheDocument(received: Element | null): MatcherResult {
    const pass = !!received && document.contains(received);

    return {
      pass,
      message: () =>
        pass
          ? 'expected element not to be present in the document'
          : 'expected element to be present in the document'
    };
  }
});
