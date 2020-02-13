/* eslint-disable no-case-declarations */
import { AST, ASTScope, VarType, Accessability, Condition, IfStatement, ASTValue } from '../types'
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

  private transConditions(conditions: Condition | Condition[]): string {
    if (!Array.isArray(conditions))
      conditions = [conditions]

    // eslint-disable-next-line array-callback-return
    return conditions.map((i) => {
      if (i === 'ans') {
        return this.currentVar()
      }
      else if (typeof i === 'boolean') {
        return i.toString()
      }
      else if (i.type === 'Identifier') {
        return i.name
      }
      else if (i.type === 'UnaryCondition') {
        const op = '!'
        return `${op}(${this.transConditions(i.union)})`
      }
      else if (i.type === 'BinaryCondition') {
        return `${this.transConditions(i.left)}${i.operator}${this.transConditions(i.right)}`
      }
      else if (i.type === 'Value') {
        return this.transpileValue(i)
      }
      else {
        this.errorHandler.throwError({
          // @ts-ignore
          message: `UNEXPECTED NODE ${i.type}`,
        })
      }
    })
      .join(' ')
  }

  private transIf(s: IfStatement) {
    let code = ''
    if (s.condition != null)
      code = `if(${this.transConditions(s.condition)}){${this.transpileScope(s)}}`
    else
      code = `{${this.transpileScope(s)}}`
    if (s.else)
      code += `else ${this.transIf(s.else)}`
    return code
  }

  private transpileValue(node: ASTValue) {
    let value = node.value

    if (value === undefined) {
      switch (node.varType) {
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
          value = '_=>{}'
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

    if (node.varType === VarType.String)
      value = `\`${this.escapeQuote(value.toString())}\``

    return value
  }

  private transpileScope(scope: ASTScope) {
    let code = ''
    const strayVars = []

    for (const s of scope.body) {
      switch (s.type) {
        case 'VariableDeclaration':
          for (let j = 0; j < s.count; j++) {
            let name = s.names[j]
            if (name === undefined) {
              name = this.nextVar()
              strayVars.push(name)
            }
            const value = this.transpileValue(s.values[j] || { value: undefined, varType: s.varType, type: 'Value' })
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

        case 'IfStatement':
          code += this.transIf(s)
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return code
  }
}
