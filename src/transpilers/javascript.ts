/* eslint-disable no-case-declarations */
import { start } from 'repl'
import { AST, ASTScope, VarType, Accessability } from '../types'
import { Transplier } from './base'

export class JavascriptTranspiler extends Transplier {
  name = 'javascript'

  transpile(ast: AST): string {
    return this.transpileScope(ast)
  }

  private escapeQuote(str: string) {
    return str.replace(/`/g, '`')
  }

  private transpileScope(scope: ASTScope) {
    let code = ''
    const strayVars = []
    let prevFunctionName: string | null = null
    let prevFunctionAccess: Accessability | null = null
    let prevObjectName: string | null = null
    const prevObjectAccess: Accessability | null = null

    for (const s of scope.body) {
      switch (s.type) {
        case 'VariableDeclaration':
          for (let j = 0; j < s.count; j++) {
            let name = s.names[j]
            let value = s.values[j]?.value
            if (name === undefined) {
              name = this.nextVar()
              strayVars.push(name)
            }
            if (value === undefined) {
              switch (s.varType) {
                case VarType.Array:
                  value = '[]'
                  break
                case VarType.Number:
                  value = '0'
                  break
                case VarType.String:
                  value = '""'
                  break
                case VarType.Function:
                  value = '()=>0'
                  prevFunctionName = name
                  prevFunctionAccess = s.accessability
                  break
                case VarType.Object:
                  value = '{}'
                  prevObjectName = name
                  prevObjectName = s.accessability
                  break
                case VarType.Auto:
                  value = 'undefined'
                  break
                case VarType.Boolean:
                  value = 'false'
                  break
              }
            }
            if (s.varType === VarType.String)
              value = `\`${this.escapeQuote(value.toString())}\``

            const declaration = s.accessability === Accessability.public
              ? `var ${name} = this.`
              : 'var '
            code += `${declaration}${name}=${value};`
          }
          break

        case 'FunctionDeclaration':
          let name = s.name
          if (name === undefined)
            name = this.nextVar()

          let starts = ''
          let ends = ''
          if (s.args.length > 0) {
            s.args.forEach((arg, i) => {
              if (i === 0)
                starts += `function ${name}(${arg.name}){`
              else
                starts += `return (${arg.name})=>{`
              ends += '};'
            })
          }
          else {
            starts = 'function () {'
            ends = '};'
          }
          code += starts + this.transpileScope(s) + ends
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return code
  }
}
