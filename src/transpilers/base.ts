import { AST, Position } from '../types'
import { ErrorHandler } from '../errors/handler'

export interface TransplierOptions {
  errorHandler: ErrorHandler
}

export abstract class Transplier {
  protected varCount = 0
  protected randomVarCount = 0
  protected readonly errorHandler: ErrorHandler

  constructor(
    options: TransplierOptions,
  ) {
    this.errorHandler = options.errorHandler
  }

  abstract name: string

  abstract transpile(ast: AST): string

  protected randomVar() {
    return `_rand${++this.randomVarCount}`
  }

  protected currentVar() {
    return `_ans${this.varCount}`
  }

  protected nextVar() {
    return `_ans${++this.varCount}`
  }

  protected throwError(pos?: Position, message = '', ...parameters: string[]) {
    this.errorHandler.throwError({
      pos,
      message,
      parameters,
    })
  }
}
