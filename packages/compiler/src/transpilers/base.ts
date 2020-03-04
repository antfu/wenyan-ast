import { ModuleContext, SourceLocation } from '../../../types'
import { TransplierOptions } from '.'

export abstract class Transplier {
  constructor(
    public readonly context: ModuleContext,
    public readonly options: TransplierOptions,
  ) {
  }

  abstract name: string

  abstract transpile(): string

  protected randomVar() {
    return `_rand${++this.context.variableCount}`
  }

  protected currentVar(offset = 0) {
    return `_ans${this.context.variableCount + offset}`
  }

  protected nextVar() {
    return `_ans${++this.context.variableCount}`
  }

  protected throwError(loc?: SourceLocation, message = '', ...parameters: string[]): never {
    this.options.errorHandler.throwError({
      loc,
      message,
      parameters,
    })
  }
}
