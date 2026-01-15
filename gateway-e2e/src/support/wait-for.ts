import * as net from "net";
import axios from "axios";

type WaitOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

export async function waitForTcp(
  host: string,
  port: number,
  options: WaitOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const intervalMs = options.intervalMs ?? 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const ok = await checkTcp(host, port);
    if (ok) return;
    await sleep(intervalMs);
  }
  throw new Error(`Timeout waiting for TCP ${host}:${port}`);
}

export async function waitForHttp(
  url: string,
  options: WaitOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const intervalMs = options.intervalMs ?? 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.post(url, { query: "query { health }" });
      if (res.status === 200) return;
    } catch {
      // ignore until timeout
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timeout waiting for HTTP ${url}`);
}

async function checkTcp(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
