import transpilers from './transpilers'
import { ErrorHandler } from './errors/handler'
import { Parser } from './parse'
import { ModuleContext, createContext } from './types'
import { Transplier } from './transpilers/base'

export interface CompileOptions {
  lang: 'js'
  errorHandler: ErrorHandler
  sourcemap: boolean
}

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
    } = options

    this.options = {
      lang,
      errorHandler,
      sourcemap,
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
