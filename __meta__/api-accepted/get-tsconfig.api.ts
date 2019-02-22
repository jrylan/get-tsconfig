// @public
declare function findTsconfigFile(cwd?: string): string;

// @public
declare function getPartialTsconfig(cwd?: string): PartialConfig;

// @public
declare function getTsconfig(cwd?: string, formatTsConfig?: (json: any) => any): ResolvedTsconfig;

// @public
interface PartialConfig {
    config: TsconfigOptions;
    fileName: string;
}

// @public
declare function readTsconfigFile(fileName: string): TsconfigOptions;

// @public
interface ResolvedTsconfig {
    config: default.ParsedCommandLine;
    fileName: string;
}

// @public
interface TsconfigOptions extends default.CompilerOptions {
    extends?: string;
}


// (No @packageDocumentation comment for this package)
