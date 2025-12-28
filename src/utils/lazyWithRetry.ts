import { lazy, type ComponentType } from 'react';

/**
 * A wrapper for React.lazy that retries the import if it fails.
 * This is particularly useful for handling "Failed to fetch dynamically imported module" errors
 * which often occur after a new deployment when the browser tries to load old chunks.
 */
export const lazyWithRetry = (
  componentImport: () => Promise<{ default: ComponentType<any> }>,
  retriesLeft = 2,
  interval = 1000
): ComponentType<any> => {
  return lazy(async () => {
    for (let i = 0; i <= retriesLeft; i++) {
      try {
        return await componentImport();
      } catch (error) {
        if (i === retriesLeft) {
          console.error('Failed to load module after all retries. Reloading page...', error);
          window.location.reload();
          throw error;
        }
        console.warn(`Retry ${i + 1}/${retriesLeft} failed for module import. Waiting ${interval}ms...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
    throw new Error('Unreachable');
  });
};
