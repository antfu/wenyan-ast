import { AST, ASTScope, VarType, Accessability } from '../types'
import { Transplier } from './base'

export class JavascriptTranspiler extends Transplier {
  name = 'javascript'

  transpile(ast: AST): string {
    return this.transpileScope(ast)
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
            const declaration = s.accessability === Accessability.public
              ? `var ${name} = this.`
              : 'var '
            code += `${declaration}${name}=${value};`
          }
          break
        case 'FunctionDeclaration':
          this.throwError(s.loc?.start, 'No Implementation for %0', s.type)
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return code
  }
}
