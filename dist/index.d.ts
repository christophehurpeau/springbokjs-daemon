export interface Options<Messages = any> {
    key?: string;
    displayName?: string;
    prefixStdout?: boolean;
    command?: string;
    args?: (string | number)[];
    cwd?: string;
    autoRestart?: boolean;
    SIGTERMTimeout?: number;
    onMessage?: (message: Messages) => void;
}
export interface Daemon {
    hasExited(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    sendSIGUSR2(): void;
}
export default function createDaemon({ key, displayName, prefixStdout, command, args, cwd, autoRestart, SIGTERMTimeout, onMessage, }?: Options): Daemon;
//# sourceMappingURL=index.d.ts.map