export interface Options {
    key?: string;
    displayName?: string;
    prefixStdout?: boolean;
    command?: string;
    args?: (string | number)[];
    cwd?: string;
    autoRestart?: boolean;
    SIGTERMTimeout?: number;
}
export interface Daemon {
    hasExited(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    sendSIGUSR2(): void;
}
declare const _default: ({ key, displayName, prefixStdout, command, args, cwd, autoRestart, SIGTERMTimeout, }?: Options) => Daemon;
export default _default;
//# sourceMappingURL=index.d.ts.map