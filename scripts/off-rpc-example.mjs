import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { OFF_GET_BY_BARCODE } from "@apptit/contracts";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPortRaw = process.env.REDIS_PORT || "6379";
const redisPort = Number(redisPortRaw);

if (!Number.isFinite(redisPort) || redisPort <= 0) {
  throw new Error(`Invalid REDIS_PORT: ${redisPortRaw}`);
}

const client = ClientProxyFactory.create({
  transport: Transport.REDIS,
  options: { host: redisHost, port: redisPort },
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
