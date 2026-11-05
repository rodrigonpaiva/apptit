export const fixtureSites = [
  { id: '20000000-0000-4000-8000-000000000001', tenantId: '10000000-0000-4000-8000-000000000001', name: 'Restaurant synthétique A', timeZone: 'Europe/Paris' },
  { id: '20000000-0000-4000-8000-000000000002', tenantId: '10000000-0000-4000-8000-000000000002', name: 'Restaurant synthétique B', timeZone: 'Europe/Paris' },
];
export const fixtureAccounts = [
  { id: '30000000-0000-4000-8000-000000000001', login: 'chef.a@apptit.test', name: 'Chef synthétique A', role: 'chef', sites: [0], passwordKey: 'FIXTURE_CHEF_A_PASSWORD' },
  { id: '30000000-0000-4000-8000-000000000002', login: 'stock.a@apptit.test', name: 'Magasinier synthétique A', role: 'storekeeper', sites: [0], passwordKey: 'FIXTURE_STOREKEEPER_A_PASSWORD' },
  { id: '30000000-0000-4000-8000-000000000003', login: 'cook.a@apptit.test', name: 'Cuisinier synthétique A', role: 'cook', sites: [0], passwordKey: 'FIXTURE_COOK_A_PASSWORD' },
  { id: '30000000-0000-4000-8000-000000000004', login: 'chef.b@apptit.test', name: 'Chef synthétique B', role: 'chef', sites: [1], passwordKey: 'FIXTURE_CHEF_B_PASSWORD' },
  { id: '30000000-0000-4000-8000-000000000005', login: 'chef.multi@apptit.test', name: 'Chef synthétique multisite', role: 'chef', sites: [0, 1], passwordKey: 'FIXTURE_MULTI_PASSWORD' },
];
