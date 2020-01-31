import transpilers from './transpilers'
import { ErrorHandler } from './error-handler'
import { parse } from './parse'

export interface CompileOptions {
  lang: 'js'
}

export function compile(source: string, options: Partial<CompileOptions> = {}) {
  const {
    lang = 'js',
  } = options

  const errorHandler = new ErrorHandler()

  const ast = parse(source, { errorHandler })

  const Transpiler = transpilers[lang]
  const transpiler = new Transpiler({ errorHandler })

  const compiled = transpiler.transpile(ast)

  return compiled
}
