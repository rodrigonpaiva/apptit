# Off Service (Open Food Facts)

## Dev

```bash
npm run dev -w @apptit/off-service
```

## RPC examples (Redis)

```ts
import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { OFF_GET_BY_BARCODE, OFF_SEARCH } from "@apptit/contracts";

const client = ClientProxyFactory.create({
  transport: Transport.REDIS,
  options: { host: "localhost", port: 6379 },
});

async function run() {
  const byBarcode = await firstValueFrom(
    client.send(OFF_GET_BY_BARCODE, { barcode: "737628064502" }),
  );
  console.log("OFF_GET_BY_BARCODE", byBarcode);

  const search = await firstValueFrom(
    client.send(OFF_SEARCH, { query: "pasta", page: 1, pageSize: 5 }),
  );
  console.log("OFF_SEARCH", search);

  await client.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
