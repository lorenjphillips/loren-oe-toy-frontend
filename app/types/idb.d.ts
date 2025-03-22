declare module 'idb' {
  // Database schema
  export interface DBSchema {
    [tableName: string]: {
      key: string;
      value: any;
      indexes?: { [indexName: string]: string | string[] };
    };
  }

  // Database options
  export interface OpenDBOptions<T extends DBSchema> {
    upgrade?: (db: IDBPDatabase<T>, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction<T>) => void;
    blocked?: () => void;
    blocking?: () => void;
    terminated?: () => void;
  }

  // Database connection
  export interface IDBPDatabase<T extends DBSchema> {
    readonly name: string;
    readonly version: number;
    readonly objectStoreNames: DOMStringList;

    transaction<K extends keyof T>(
      storeNames: K | K[],
      mode?: 'readonly' | 'readwrite' | 'versionchange'
    ): IDBPTransaction<T, K>;

    close(): void;
    
    add<K extends keyof T>(
      storeName: K,
      value: T[K]['value'],
      key?: IDBValidKey
    ): Promise<IDBValidKey>;
    
    get<K extends keyof T>(
      storeName: K,
      key: IDBValidKey
    ): Promise<T[K]['value'] | undefined>;
    
    put<K extends keyof T>(
      storeName: K,
      value: T[K]['value'],
      key?: IDBValidKey
    ): Promise<IDBValidKey>;
    
    delete<K extends keyof T>(
      storeName: K,
      key: IDBValidKey
    ): Promise<void>;
    
    clear<K extends keyof T>(
      storeName: K
    ): Promise<void>;
    
    getAll<K extends keyof T>(
      storeName: K,
      query?: IDBValidKey | IDBKeyRange | null,
      count?: number
    ): Promise<T[K]['value'][]>;

    // Add missing methods
    count<K extends keyof T>(
      storeName: K,
      query?: IDBValidKey | IDBKeyRange | null
    ): Promise<number>;

    createObjectStore<K extends keyof T>(
      name: K,
      options?: { keyPath?: string | string[]; autoIncrement?: boolean }
    ): IDBPObjectStore<T, K, K>;

    getAllFromIndex<K extends keyof T>(
      storeName: K,
      indexName: string,
      query?: IDBValidKey | IDBKeyRange | null,
      count?: number
    ): Promise<T[K]['value'][]>;
  }

  // Transaction interface
  export interface IDBPTransaction<T extends DBSchema, K extends keyof T = keyof T> {
    readonly db: IDBPDatabase<T>;
    readonly done: Promise<void>;
    readonly mode: 'readonly' | 'readwrite' | 'versionchange';
    readonly objectStoreNames: DOMStringList;
    
    objectStore<N extends K>(name: N): IDBPObjectStore<T, K, N>;
    abort(): void;
    
    // Add store property for direct access to the transaction's first store
    readonly store: IDBPObjectStore<T, K, K extends string ? K : string>;
  }

  // Object store interface
  export interface IDBPObjectStore<T extends DBSchema, K extends keyof T, N extends K> {
    readonly name: string;
    readonly keyPath: string | string[] | null;
    readonly autoIncrement: boolean;
    readonly indexNames: DOMStringList;
    
    add(value: T[N]['value'], key?: IDBValidKey): Promise<IDBValidKey>;
    get(key: IDBValidKey): Promise<T[N]['value'] | undefined>;
    put(value: T[N]['value'], key?: IDBValidKey): Promise<IDBValidKey>;
    delete(key: IDBValidKey): Promise<void>;
    clear(): Promise<void>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<T[N]['value'][]>;
    
    index(name: string): IDBPIndex<T, K, N>;
  }

  // Index interface
  export interface IDBPIndex<T extends DBSchema, K extends keyof T, N extends K> {
    readonly name: string;
    readonly keyPath: string | string[];
    readonly multiEntry: boolean;
    readonly unique: boolean;
    
    get(key: IDBValidKey): Promise<T[N]['value'] | undefined>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<T[N]['value'][]>;
  }

  // Main functions
  export function openDB<T extends DBSchema>(
    name: string,
    version: number,
    options?: OpenDBOptions<T>
  ): Promise<IDBPDatabase<T>>;

  export function deleteDB(name: string, options?: { blocked?: () => void }): Promise<void>;
} 