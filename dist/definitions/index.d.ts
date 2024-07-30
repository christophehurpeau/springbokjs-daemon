export interface Options<Messages = any> {
    key?: string;
    displayName?: string;
    prefixStdout?: boolean;
    outputKey?: string;
    outputDisplayName?: string;
    command?: string;
    args?: (number | string)[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    autoRestart?: boolean;
    SIGTERMTimeout?: number;
    onMessage?: (message: Messages) => void;
}
export interface Daemon {
    hasExited: () => boolean;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    restart: () => Promise<void>;
    sendSIGUSR2: () => void;
}
export declare function createDaemon({ key, displayName, prefixStdout, outputKey, outputDisplayName, command, args, cwd, env, autoRestart, SIGTERMTimeout, onMessage, }?: Options): Daemon;
/** @deprecated use named export instead */
export default createDaemon;
//# sourceMappingURL=index.d.ts.map