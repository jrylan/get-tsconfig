import * as path from 'path'
import ts from 'typescript'

/**
 * Options found in a tsconfig.json file.
 *
 * @public
 */
export interface TsconfigOptions extends ts.CompilerOptions {
  /**
   * The module path to another tsconfig configuration file.
   */
  // tslint:disable-next-line no-reserved-keywords
  extends?: string
}

/**
 * Partial tsconfig value.
 *
 * @public
 */
export interface PartialConfig {
  /**
   * The unresolved configuration options for the parsed config file.
   */
  config: TsconfigOptions

  /**
   * The file name of the discovered config file.
   */
  fileName: string
}

/**
 * Resolved tsconfig.json file name and compiler config values.
 *
 * @public
 */
export interface ResolvedTsconfig {
  /**
   * The fully resolved TypeScript compiler options.
   */
  config: ts.ParsedCommandLine

  /**
   * Absolute path to the resolved `tsconfig.json` file.
   */
  fileName: string
}

/**
 * Find a tsconfig.json file.
 *
 * @public
 * @param cwd - Starting directory. Defaults to `process.cwd()`.
 * @returns Absolute path of the found tsconfig.json file.
 * @example
```typescript
// Infer CWD:
const configFile = findTsConfigFile()
```
 * @example
```typescript
// Provide CWD:
const configFile = findTsConfigFile(YOUR_PROJECT_PATH)
```
 */
export function findTsconfigFile(cwd: string = process.cwd()): string {
  const fileName = ts.findConfigFile(cwd, ts.sys.fileExists)
  if (fileName === undefined || path.isAbsolute(fileName) === false) {
    throw new Error(
      `Could not find a "tsconfig.json" file starting from "${cwd}".`
    )
  }
  return fileName
}

/**
 * Read a tsconfig.json file and return the JSON as-is without further value
 * resolution.
 *
 * @public
 * @param fileName - Absolute path to the tsconfig.json file to read.
 * @returns Partial config object.
 * @example
```typescript
const config = readTsconfigFile(PATH_TO_YOUR_TSCONFIG)
```
 */
export function readTsconfigFile(fileName: string): TsconfigOptions {
  const { config, error } = ts.readConfigFile(fileName, ts.sys.readFile)
  if (error !== undefined) {
    throw new Error(error.messageText.toString())
  }

  return config as TsconfigOptions
}

/**
 * Find a tsconfig.json file, parse it and return the JSON as-is without further
 * value resolution.
 *
 * @public
 * @param cwd - Current working directory.
 * @returns Partial TypeScript configuration options.
 * @example
```typescript
// Infer CWD:
const tsconfig = getPartialTsconfig()
```
 * @example
```typescript
// Provide CWD:
const tsconfig = getPartialTsconfig(YOUR_PROJECT_PATH)
```
 */
export function getPartialTsconfig(cwd: string = process.cwd()): PartialConfig {
  const fileName = findTsconfigFile(cwd)
  const config = readTsconfigFile(fileName)

  return { config, fileName }
}

/**
 * Get tsconfig.json contents.
 *
 * @public
 * @param cwd - Current working directory.
 * @param formatTsConfig - An optional function to format the contents of the
 * found `tsconfig.json` JSON object before resolving all the options.
 * @returns Fully resolved TypeScript configuration options.
 * @example
```typescript
// Infer CWD
const tsconfig = getTsconfig()
```
 *
 * @example
```typescript
// Provide CWD:
const tsconfig = getTsconfig(YOUR_PROJECT_PATH)
```
 *
 * @example
```typescript
// Config formatter:
const tsconfig = getTsconfig(YOUR_PROJECT_PATH, (config) => {
  config.exclude = ['**\/__tests__/**']
  return config
})
```
 */
export function getTsconfig(
  cwd: string = process.cwd(),
  // tslint:disable-next-line no-any
  formatTsConfig?: (json: any) => any
): ResolvedTsconfig {
  const { config, fileName } = getPartialTsconfig(cwd)
  const lazyConfig = { ...config, files: ['index.ts'] }
  const resolvedConfig = ts.parseJsonConfigFileContent(
    formatTsConfig !== undefined ? formatTsConfig(lazyConfig) : lazyConfig,
    ts.sys,
    path.dirname(fileName),
    undefined,
    fileName
  )

  return {
    fileName,
    config: ({
      ...resolvedConfig,
      get fileNames() {
        const completeConfig = ts.parseJsonConfigFileContent(
          formatTsConfig !== undefined ? formatTsConfig(config) : config,
          ts.sys,
          path.dirname(fileName),
          undefined,
          fileName
        )

        const fileNames = completeConfig.fileNames
        Object.defineProperty(this, 'fileNames', { value: fileNames })
        return fileNames
      }
      // tslint:disable-next-line no-any
    } as any) as ts.ParsedCommandLine
  }
}
