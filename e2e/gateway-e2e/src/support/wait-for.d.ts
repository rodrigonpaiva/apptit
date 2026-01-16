type WaitOptions = {
    timeoutMs?: number;
    intervalMs?: number;
};
export declare function waitForTcp(host: string, port: number, options?: WaitOptions): Promise<void>;
export declare function waitForHttp(url: string, options?: WaitOptions): Promise<void>;
export {};
//# sourceMappingURL=wait-for.d.ts.map