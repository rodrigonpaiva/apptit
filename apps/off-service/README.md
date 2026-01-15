# Off Service (Open Food Facts)

## Dev

```bash
npm run dev -w @apptit/off-service
```

## RPC examples (Redis)

```ts
import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { OFF_GET_BY_BARCODE } from "@apptit/contracts";

const client = ClientProxyFactory.create({
  transport: Transport.REDIS,
  options: { host: "localhost", port: 6379 },
});

async function run() {
  const byBarcode = await firstValueFrom(
    client.send(OFF_GET_BY_BARCODE, { barcode: "737628064502" }),
  );
  console.log("OFF_GET_BY_BARCODE", byBarcode);

  await client.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
