// Polyfill for crypto.randomUUID (Hermes doesn't support it)

type UUID = `${string}-${string}-${string}-${string}-${string}`;

function isUuid(value: string): value is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function createRandomUUID(): UUID {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  if (!isUuid(uuid)) {
    throw new Error('Failed to generate UUID');
  }

  return uuid;
}

function notImplemented(method: string): never {
  throw new Error(`crypto.subtle.${method} is not implemented in this environment`);
}

const subtlePolyfill: SubtleCrypto = {
  encrypt: async () => notImplemented('encrypt'),
  decrypt: async () => notImplemented('decrypt'),
  sign: async () => notImplemented('sign'),
  verify: async () => notImplemented('verify'),
  digest: async () => notImplemented('digest'),
  generateKey: async () => notImplemented('generateKey'),
  deriveKey: async () => notImplemented('deriveKey'),
  deriveBits: async () => notImplemented('deriveBits'),
  importKey: async () => notImplemented('importKey'),
  exportKey: async () => notImplemented('exportKey'),
  wrapKey: async () => notImplemented('wrapKey'),
  unwrapKey: async () => notImplemented('unwrapKey'),
};

function getRandomValues<T extends ArrayBufferView>(array: T): T {
  // This is NOT cryptographically secure; it's only here to satisfy codepaths
  // that expect crypto to exist.
  const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

const cryptoPolyfill: Crypto = {
  randomUUID: createRandomUUID,
  getRandomValues,
  subtle: subtlePolyfill,
};

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = cryptoPolyfill;
} else if (typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: createRandomUUID,
    writable: false,
    configurable: true,
  });
}

export {};
