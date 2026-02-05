// Polyfill for crypto.randomUUID (Hermes doesn't support it)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

if (typeof g.crypto === 'undefined' || !g.crypto?.randomUUID) {
  g.crypto = {
    ...g.crypto,
    randomUUID: () => {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      // TypeScript's lib.dom.d.ts narrows this to a UUID template literal.
      return uuid as unknown as `${string}-${string}-${string}-${string}-${string}`;
    },
  };
}

export {};
