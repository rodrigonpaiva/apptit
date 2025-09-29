export type Brand<TValue, TBrand extends string> = TValue & { readonly __brand: TBrand };

export type Nullable<T> = T | null;
