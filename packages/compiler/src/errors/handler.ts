import { SourceLocation } from '../../../types'
import { assert } from '../utils'

export type WenyanErrorName = 'Error' | 'ParseError' | 'TokenizeError' | 'TranspileError'

export class WenyanError extends Error {
  public name: WenyanErrorName = 'Error'
  public source?: string
  public file?: string
  public loc?: SourceLocation
  public description?: string
}

export interface ErrorOptions {
  name?: WenyanErrorName
  source?: string
  file?: string
  loc?: SourceLocation
  message: string
  parameters?: any[]
}

export class ErrorHandler {
  readonly errors: WenyanError[]
  tolerant: boolean

  constructor() {
    this.errors = []
    this.tolerant = false
  }

  recordError(error: WenyanError): void {
    this.errors.push(error)
  }

  tolerate(error: WenyanError): void {
    if (this.tolerant)
      this.recordError(error)

    else
      throw error
  }

  createError({
    name,
    loc,
    message,
    file,
    source,
    parameters,
  }: ErrorOptions): WenyanError {
    if (parameters)
      message = this.formatErrorMessage(message, parameters)

    const error = new WenyanError(message)

    if (name)
      error.name = name

    error.file = file
    error.description = message
    error.source = source
    error.loc = loc

    return error
  }

  formatErrorMessage(message: string, values: string[]) {
    const args = values.slice()
    return message.replace(/%(\d)/g, (_, idx) => {
      assert(idx < args.length, 'Message reference must be in range')
      return args[idx]
    })
  }

  throwError(options: ErrorOptions): never {
    throw this.createError(options)
  }

  tolerateError(options: ErrorOptions) {
    const error = this.createError(options)

    if (this.tolerant)
      this.recordError(error)

    else
      throw error
  }
}
