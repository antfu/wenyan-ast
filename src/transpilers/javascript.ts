/* eslint-disable no-case-declarations */
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

  private getAccessDecaleration(name: string, accessability: Accessability) {
    return accessability === Accessability.public
      ? `let ${name}=this.${name}=`
      : `let ${name}=`
  }

  private transpileScope(scope: ASTScope) {
    let code = ''
    const strayVars = []

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
                  break
                case VarType.Object:
                  value = '{}'
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

            code += `${this.getAccessDecaleration(name, s.accessability)}${value};`
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
                starts += `function(${arg.name}){`
              else
                starts += `return function(${arg.name}){`
              ends += '};'
            })
          }
          else {
            starts = 'function(){'
            ends = '};'
          }
          code += this.getAccessDecaleration(name, s.accessability) + starts + this.transpileScope(s) + ends
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return code
  }
}
