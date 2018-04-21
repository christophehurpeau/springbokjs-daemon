export interface Options {
    key?: string;
    displayName?: string;
    prefixStdout?: boolean;
    command?: string;
    args?: Array<string | number>;
    cwd?: string;
    autoRestart?: boolean;
    SIGTERMTimeout?: number;
}
declare const _default: ({ key, displayName, prefixStdout, command, args, cwd, autoRestart, SIGTERMTimeout, }?: Options) => {
    hasExited(): boolean;
    start(): Promise<{}>;
    stop(): Promise<void>;
    restart(): Promise<{}>;
    sendSIGUSR2(): void;
};
export default _default;
