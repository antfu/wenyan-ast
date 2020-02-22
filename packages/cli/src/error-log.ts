import chalk from 'chalk'
import { WenyanError } from '../../compiler/src/errors'

function getCodeOfLine(code: string, line: number) {
  return code.split(/\s?\n/)[line - 1]
}

export function printError(error: WenyanError, logger = console.log) {
  const { file, pos, source, name, message } = error

  if (pos && source) {
    logger(`${file || 'Anonymous'}:${pos.line}:${pos.column}\n`)

    let line = getCodeOfLine(source, pos.line)
    line = chalk.green(line.slice(0, pos.column - 1))
      + chalk.red(line.slice(pos.column - 1, pos.column))
      + chalk.gray(line.slice(pos.column))
    logger(line.trim())

    logger()

    logger(chalk.red(`${name}: ${message}`))
  }
  console.error(error)
}
