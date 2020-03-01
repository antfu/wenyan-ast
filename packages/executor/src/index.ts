import { num2hanzi, bool2hanzi } from '../../utils/src'
import { TargetLanguages } from '../../types'

export type LogCallback = (...args: any[]) => void

export interface ExecuteOptions{
  lang: TargetLanguages
  outputHanzi: boolean
  scoped: boolean
  output: LogCallback
}

export function isLangSupportedForEval(lang: TargetLanguages) {
  if (lang !== 'js') {
    throw new Error(
      `Executing for target language "${lang}" is not supported in current environment`,
    )
  }
  return true
}

function hanzinizeOutput(value: string): string {
  if (typeof value === 'number')
    return num2hanzi(value)

  else if (typeof value === 'boolean')
    return bool2hanzi(value)

  else if (Array.isArray(value))
    return value.map(i => hanzinizeOutput(i)).join('。')

  else
    return value
}

export function outputHanziWrapper(log: LogCallback, outputHanzi: boolean) {
  return function output(...args: any[]) {
    log(...args.map(i => (outputHanzi ? hanzinizeOutput(i) : i)))
  }
}

export function execute(
  compiledCode: string,
  options: Partial<ExecuteOptions> = {},
) {
  const {
    outputHanzi = true,
    scoped = false,
    lang = 'js',
    output = console.log,
  } = options

  isLangSupportedForEval(lang)

  const code = compiledCode;

  (() => {
    const _console_log = console.log
    console.log = outputHanziWrapper(output, outputHanzi)
    try {
      if (!scoped && typeof window !== 'undefined')
        window.eval(code)

      else
        eval(code)
    }
    // eslint-disable-next-line no-useless-catch
    catch (e) {
      throw e
    }
    finally {
      console.log = _console_log
    }
  })()
}
