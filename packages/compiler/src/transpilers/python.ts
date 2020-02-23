import { AST } from '../types'
import { Transplier } from './base'

export class PythonTranspiler extends Transplier {
  name = 'python'

  transpile(ast: AST): string {
    return '# NOT IMPLEMENTED'
  }
}
