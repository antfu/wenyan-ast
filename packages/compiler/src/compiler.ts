import transpilers from './transpilers'
import { ErrorHandler } from './errors/handler'
import { Parser } from './parse'
import { AST, Token } from './types'
import { Transplier } from './transpilers/base'

export interface CompileOptions {
  lang: 'js'
  errorHandler: ErrorHandler
  sourcemap: boolean
  isModule: boolean
}

export class Compiler {
  readonly options: CompileOptions
  private _ast: AST | undefined
  private _tokens: Token[] | undefined
  private _transpiler: Transplier
  private _compiled: string | undefined
  private _initialized = false
  private parser: Parser

  constructor(
    public readonly source: string,
    options: Partial<CompileOptions> = {},
  ) {
    const {
      lang = 'js',
      sourcemap = true,
      errorHandler = new ErrorHandler(),
      isModule = false,
    } = options

    this.options = {
      lang,
      errorHandler,
      sourcemap,
      isModule,
    }
    this.parser = new Parser(this.source, this.options)
    this._transpiler = new (transpilers[lang])(this.options)
    this._ast = this.parser.ast
  }

  public run() {
    let error = null

    try {
      this.parser.run()
    }
    catch (e) {
      error = e
    }

    this._ast = this.parser.ast
    this._tokens = this.parser.tokens
    this._compiled = this._transpiler.transpile(this.ast)
    this._initialized = true

    if (error)
      throw error
  }

  get ast() {
    return this._ast!
  }

  get tokens() {
    return this._tokens!
  }

  get compiled() {
    return this._compiled!
  }

  get initialized() {
    return this._initialized
  }
}

export function compile(source: string, options: Partial<CompileOptions> = {}) {
  const compiler = new Compiler(source, options)
  compiler.run()
  return compiler.compiled
}
