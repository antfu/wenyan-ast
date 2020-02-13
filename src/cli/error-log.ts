import chalk from 'chalk'
import { WenyanError } from '../errors/handler'

function getCodeOfLine(code: string, line: number) {
  return code.split(/\s?\n/)[line - 1]
}

export function printError(error: WenyanError) {
  if (error instanceof WenyanError) {
    const { file, pos, source, name, message } = error

    if (pos && source) {
      console.log(`${file || 'Anonymous'}:${pos.line}:${pos.column}\n`)

      let line = getCodeOfLine(source, pos.line)
      line = chalk.green(line.slice(0, pos.column - 1))
      + chalk.red(line.slice(pos.column - 1, pos.column))
      + chalk.gray(line.slice(pos.column))
      console.log(line)
    }

    console.log()

    console.log(chalk.red(`${name}: ${message}`))
  }
  else {
    console.error(error)
  }
}
