import * as path from 'path'
import * as tsconfig from '../index'

const cwd = process.cwd()
const tsconfigPath = path.join(cwd, 'tsconfig.json')
const devPath = path.join('dev', 'null')

describe('findTsconfigFile', () => {
  test('find project file', () => {
    expect(tsconfig.findTsconfigFile(cwd)).toBe(tsconfigPath)
  })
  test('infer cwd', () => {
    expect(tsconfig.findTsconfigFile()).toBe(tsconfigPath)
  })
  test('throw expected error', () => {
    expect(() => tsconfig.findTsconfigFile(devPath)).toThrow()
  })
})

describe('readTsconfigFile', () => {
  test('read project config', () => {
    expect(tsconfig.readTsconfigFile(tsconfigPath)).toMatchSnapshot()
  })
  test('throw expected error', () => {
    expect(() =>
      tsconfig.readTsconfigFile(path.join(devPath, 'tsconfig.json'))
    ).toThrow()
  })
})

describe('getPartialTsconfig', () => {
  test('defined cwd', () => {
    expect(tsconfig.getPartialTsconfig(cwd)).toMatchSnapshot()
  })
  test('infer cwd', () => {
    expect(tsconfig.getPartialTsconfig()).toMatchSnapshot()
  })
})

describe('getTsConfig', () => {
  test('defined cwd', () => {
    const { config } = tsconfig.getTsconfig(tsconfigPath)
    const { fileNames } = config

    expect(config).toMatchSnapshot()
    expect(config.fileNames).toBe(fileNames)
  })

  test('infer cwd', () => {
    const { config } = tsconfig.getTsconfig()
    const { fileNames } = config

    expect(config).toMatchSnapshot()
    expect(config.fileNames).toBe(fileNames)
  })

  test('format tsconfig', () => {
    const { config } = tsconfig.getTsconfig(tsconfigPath, () => {
      return { exclude: ['**/__foobar__/**'] }
    })
    expect(config.raw).toMatchObject({ exclude: ['**/__foobar__/**'] })
  })
})
