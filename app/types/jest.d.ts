// This is just a minimal type definition to make tests work
// Install @types/jest for full typings

declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function it(name: string, fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function beforeEach(fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function afterEach(fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function beforeAll(fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function afterAll(fn: (done?: jest.DoneCallback) => void | Promise<void>): void;
  function expect<T>(actual: T): jest.Matchers<T>;
}

declare namespace jest {
  interface DoneCallback {
    (...args: any[]): any;
    fail(error?: string | { message: string }): any;
  }

  interface Matchers<R> {
    toEqual(expected: any): R;
    toBe(expected: any): R;
    toBeTruthy(): R;
    toBeFalsy(): R;
    toBeGreaterThan(expected: number): R;
    toBeLessThan(expected: number): R;
    toBeGreaterThanOrEqual(expected: number): R;
    toBeLessThanOrEqual(expected: number): R;
    toBeUndefined(): R;
    toBeNull(): R;
    toBeNaN(): R;
    toContain(expected: any): R;
    toMatch(expected: string | RegExp): R;
    toHaveLength(expected: number): R;
    toHaveProperty(path: string, value?: any): R;
    toThrow(expected?: string | Error | RegExp): R;
    not: Matchers<R>;
  }
}

export {}; 