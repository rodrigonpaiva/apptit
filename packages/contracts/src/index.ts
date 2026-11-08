/** Runtime shell only; operational contracts are implemented in later packages. */
export type ServiceName = 'gateway-api' | 'identity' | 'kitchen';
export interface RuntimeStatus {
  service: ServiceName;
  mode: 'synthetic';
  schemaVersion: 1;
  operationalFeaturesEnabled: false;
}
export interface Readiness extends RuntimeStatus {
  ready: boolean;
}
export * from './quantity-draft.js';
export * from './access.js';
export * from './catalogue.js';
export * from './receiving.js';
export * from './evidence.js';
export * from './product-lookup.js';
export * from './receipt-workspace.js';
