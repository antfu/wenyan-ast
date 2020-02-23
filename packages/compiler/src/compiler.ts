import stdlib from '../../stdlib'
import transpilers from './transpilers'
import { ErrorHandler } from './errors/handler'
import { Parser } from './parse'
import { ModuleContext, createContext, CompileOptions } from './types'
import { Transplier } from './transpilers/base'

export class Compiler {
  readonly options: CompileOptions
  private _transpiler: Transplier
  private _initialized = false
  private parser: Parser

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

      // import options
      entryFilepath,
      importPaths,
      importCache,
      importContext,
      allowHttp,
      trustedHosts,
      requestTimeout,
    }

    this.parser = new Parser(context, this.options)
    this._transpiler = new (transpilers[lang])(this.options)
  }

  public run() {
    let error = null

    try {
      this.parser.run()
    }
    catch (e) {
      error = e
    }

    this.context.compiled = this._transpiler.transpile(this.ast)
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
