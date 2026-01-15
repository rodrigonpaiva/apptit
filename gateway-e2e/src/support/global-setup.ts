import { waitForTcp, waitForHttp } from "./wait-for";

module.exports = async function() {
  const redisHost = process.env.REDIS_HOST ?? "localhost";
  const redisPort = Number(process.env.REDIS_PORT ?? "6379");
  const authHost = process.env.AUTH_HOST ?? "localhost";
  const authPort = Number(process.env.AUTH_PORT ?? "4001");
  const gatewayHost = process.env.HOST ?? "localhost";
  const gatewayPort = Number(process.env.PORT ?? "4000");

  await waitForTcp(redisHost, redisPort);
  await waitForTcp(authHost, authPort);
  await waitForHttp(`http://${gatewayHost}:${gatewayPort}/graphql`);
};
