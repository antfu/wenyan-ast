import { ModuleContext, SourceLocation } from '../../../types'
import { TransplierOptions } from '.'

export abstract class Transplier {
  protected varCount = 0
  protected randomVarCount = 0

  constructor(
    public readonly context: ModuleContext,
    public readonly options: TransplierOptions,
  ) {
  }

  abstract name: string

  abstract transpile(): string

  protected randomVar() {
    return `_rand${++this.randomVarCount}`
  }

  protected currentVar(offset = 0) {
    return `_ans${this.varCount + offset}`
  }

  protected nextVar() {
    return `_ans${++this.varCount}`
  }

  protected throwError(loc?: SourceLocation, message = '', ...parameters: string[]): never {
    this.options.errorHandler.throwError({
      loc,
      message,
      parameters,
    })
  }
}
