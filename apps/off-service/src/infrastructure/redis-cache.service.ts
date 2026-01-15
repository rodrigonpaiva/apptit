import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { createHash } from "crypto";
import Redis from "ioredis";

const BARCODE_TTL_SECONDS = 60 * 60 * 24 * 7;
const SEARCH_TTL_SECONDS = 60 * 60;

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || "localhost";
    const portRaw = process.env.REDIS_PORT || "6379";
    const port = Number(portRaw);

    if (!Number.isFinite(port) || port <= 0) {
      throw new Error(`Invalid REDIS_PORT: ${portRaw}`);
    }

    this.client = new Redis({ host, port });
  }

  buildBarcodeKey(barcode: string) {
    return `off:barcode:${barcode}`;
  }

  buildSearchKey(query: string, page: number, pageSize: number) {
    const hash = createHash("sha256")
      .update(`${query}:${page}:${pageSize}`)
      .digest("hex");
    return `off:search:${hash}`;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse cache key ${key}: ${String(error)}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async getBarcode<T>(barcode: string): Promise<T | null> {
    return this.getJson<T>(this.buildBarcodeKey(barcode));
  }

  async setBarcode(barcode: string, value: unknown): Promise<void> {
    await this.setJson(this.buildBarcodeKey(barcode), value, BARCODE_TTL_SECONDS);
  }

  async getSearch<T>(query: string, page: number, pageSize: number): Promise<T | null> {
    return this.getJson<T>(this.buildSearchKey(query, page, pageSize));
  }

  async setSearch(query: string, page: number, pageSize: number, value: unknown): Promise<void> {
    await this.setJson(
      this.buildSearchKey(query, page, pageSize),
      value,
      SEARCH_TTL_SECONDS,
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
