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
): any => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      if (retriesLeft <= 0) {
        // If no retries left, we force a page reload as it's likely a new deployment
        // and the old chunk hashes no longer exist.
        console.error('Failed to load module after multiple retries. Reloading page...', error);
        window.location.reload();
        return { default: () => null } as any; // Fallback to satisfy TypeScript
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
      return lazyWithRetry(componentImport, retriesLeft - 1, interval);
    }
  });
};
