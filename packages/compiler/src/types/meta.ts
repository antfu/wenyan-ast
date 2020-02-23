import { ErrorHandler } from '../errors'

export type TargetLanguages = 'js' | 'py'
export type RomanizeSystem = 'none' | 'pinyin' | 'unicode' | 'baxter'
export type CacheObject = Record<string, string>
export type StandardLibraryObject = Record<TargetLanguages | 'default', Record<string, string>>

export interface CompileOnlyOptions {
  lang: TargetLanguages
  romanizeIdentifiers: RomanizeSystem
  resetVariableCounter: boolean
  lib: StandardLibraryObject
  strict: boolean
  errorHandler: ErrorHandler
  sourcemap: boolean
}

export interface ImportOptions {
  lib: CompileOnlyOptions['lib']
  lang: CompileOnlyOptions['lang']

  entryFilepath?: string
  importPaths: string | string[]
  importCache: CacheObject
  importContext: Record<string, string | { entry: string; src?: string }>
  allowHttp: boolean
  trustedHosts: string[]
  requestTimeout: number
}

export type CompileOptions = CompileOnlyOptions & ImportOptions

export type CompilerInternalOptions = CompileOnlyOptions & {
  importOptions: ImportOptions
}
