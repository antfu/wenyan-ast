import stdlib from '../../stdlib/index'
import { ErrorHandler } from './errors/handler'
import { ModuleContext, createContext, CompileOptions, CompilerInternalOptions } from './types'
import { parseContext } from './parse'
import { transpileContext } from './transpilers'

export class Compiler {
  readonly options: CompilerInternalOptions
  private _initialized = false

  constructor(
    public readonly context: ModuleContext,
    options: Partial<CompileOptions> = {},
  ) {
    const {
      lang = 'js',
      sourcemap = true,
      errorHandler = new ErrorHandler(),
      romanizeIdentifiers = 'none',
      resetVariableCounter = true,
      lib = stdlib,
      strict = false,

      // import options
      entryFilepath = undefined,
      importPaths = [],
      importCache = {},
      importContext = {},
      allowHttp = false,
      trustedHosts = [],
      requestTimeout = 2000,
    } = options

    this.options = {
      lang,
      errorHandler,
      sourcemap,
      romanizeIdentifiers,
      resetVariableCounter,
      lib,
      strict,
      importOptions: {
        lib,
        lang,
        entryFilepath,
        importPaths,
        importCache,
        importContext,
        allowHttp,
        trustedHosts,
        requestTimeout,
      },
    }
  }

  public run() {
    let error = null

    try {
      parseContext(this.context, this.options)
      transpileContext(this.context, this.options)
    }
    catch (e) {
      error = e
    }

    this._initialized = true

    if (error)
      throw error
  }

  get ast() {
    return this.context.ast
  }

  get tokens() {
    return this.context.tokens
  }

  get compiled() {
    return this.context.compiled || ''
  }

  get initialized() {
    return this._initialized
  }
}

export function compile(source: string, options: Partial<CompileOptions> = {}) {
  const compiler = new Compiler(createContext(source), options)
  compiler.run()
  return compiler.compiled
}
