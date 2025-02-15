// Debounce function to limit the rate at which a function can be called
// Useful for optimizing performance in scenarios like window resizing or scrolling
// @param func - The function to debounce
// @param delay - The delay in milliseconds to wait before invoking the function
// @returns A debounced version of the input function

/* eslint-disable @typescript-eslint/no-explicit-any */

function debounce<F extends (...args: any[]) => any>(func: F, delay: number): F {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<F>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as F;
}
export default debounce;
