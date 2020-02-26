import chalk from 'chalk'
import { WenyanError } from '../../compiler/src/errors'

function getCodeOfLine(code: string, line: number) {
  return code.split(/\r?\n/)[line - 1]
}

export function printError(error: WenyanError, logger = console.log) {
  const { file, loc, source, name, message } = error

  if (loc && source) {
    logger(`${file || 'Anonymous'}:${loc.start.line}:${loc.start.column}\n`)

    let line = getCodeOfLine(source, loc.start.line)
    line = chalk.green(line.slice(0, loc.start.column - 1))
      + chalk.red(line.slice(loc.start.column - 1, loc.end.column - 1))
      + chalk.gray(line.slice(loc.end.column - 1))
    logger(line.trim())

    logger()

    logger(chalk.red(`${name}: ${message}`))
  }
  console.error(error)
}
