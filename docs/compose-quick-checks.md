# Compose quick checks

## Auth health

```bash
curl -s http://localhost:4001/api/health
```

Expected:

```json
{"ok":true}
```

## Gateway health (GraphQL)

```bash
curl -s -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ health }"}'
```

Expected:

```json
{"data":{"health":true}}
```

## OFF RPC (barcode)

```bash
npm run off:rpc:example
```

Expected: `OFF_GET_BY_BARCODE` ok with `found: true` (and product data).
