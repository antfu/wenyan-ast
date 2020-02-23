import { ModuleContext, TargetLanguages } from '../types'
import { ErrorHandler } from '../errors'
import { JavascriptTranspiler } from './javascript'
import { PythonTranspiler } from './python'

export interface TransplierOptions {
  errorHandler: ErrorHandler
  lang: TargetLanguages
}

export const transpilers = {
  js: JavascriptTranspiler,
  py: PythonTranspiler,
}

export function transpileContext(context: ModuleContext, options: TransplierOptions) {
  const { lang = 'js' } = options

  const transpiler = new (transpilers[lang])(context, options)

  context.compiled = transpiler.transpile()

  return context
}

export function getCompiledFromContext(context: ModuleContext, options: TransplierOptions) {
  if (context.compiled)
    return context.compiled

  transpileContext(context, options)

  return context.compiled || '/*???*/'
}
