export type BrandedString<Brand extends string> = string & { __brand: Brand };
