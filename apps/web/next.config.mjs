import { resolve } from 'node:path';
// Only the local synthetic gateway is supported; no external-provider routing.
const gatewayPort = process.env.GATEWAY_PORT ?? '4000';
if (!/^\d+$/.test(gatewayPort) || Number(gatewayPort) < 1 || Number(gatewayPort) > 65535) throw new Error('Invalid GATEWAY_PORT');
export default {
  poweredByHeader: false,
  outputFileTracingRoot: resolve(import.meta.dirname, '../..'),
  outputFileTracingIncludes: { '/api/scanner': ['../../node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'] },
  async rewrites() {
    return [{ source: '/api/observations/:path*', destination: `http://127.0.0.1:${gatewayPort}/observations/:path*` }, { source: '/api/evidence/:path*', destination: `http://127.0.0.1:${gatewayPort}/evidence/:path*` }, { source: '/api/receipts/:path*', destination: `http://127.0.0.1:${gatewayPort}/receipts/:path*` }, { source: '/api/graphql', destination: `http://127.0.0.1:${gatewayPort}/graphql` }, { source: '/api/session/:path*', destination: `http://127.0.0.1:${gatewayPort}/session/:path*` }];
  },
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Content-Type-Options', value: 'nosniff' }] }];
  },
};
