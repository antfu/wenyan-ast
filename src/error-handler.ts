import { Position } from './types'

declare class Error {
  public name: string
  public message: string
  public index: number
  public lineNumber: number
  public column: number
  public description: string
  constructor(message: string)
}

export class ErrorHandler {
  readonly errors: Error[]
  tolerant: boolean

  constructor() {
    this.errors = []
    this.tolerant = false
  }

  recordError(error: Error): void {
    this.errors.push(error)
  }

  tolerate(error: Error): void {
    if (this.tolerant)
      this.recordError(error)

    else
      throw error
  }

  constructError(msg: string, column: number): Error {
    let error = new Error(msg)
    try {
      throw error
    }
    catch (base) {
      /* istanbul ignore else */
      if (Object.create && Object.defineProperty) {
        error = Object.create(base)
        Object.defineProperty(error, 'column', { value: column })
      }
    }
    /* istanbul ignore next */
    return error
  }

  createError(pos?: Position, description = ''): Error {
    let error
    if (pos) {
      const { index, line, column } = pos
      const msg = `Line ${line}: ${description}`
      error = this.constructError(msg, column)
      error.index = index
      error.lineNumber = line
      error.description = description
    }
    else {
      error = new Error(description)
    }

    // @ts-ignore
    Error.captureStackTrace(error, this)
    return error
  }

  throwError(pos?: Position, description = ''): never {
    throw this.createError(pos, description)
  }

  tolerateError(pos?: Position, description = '') {
    const error = this.createError(pos, description)

    if (this.tolerant)
      this.recordError(error)

    else
      throw error
  }
}
