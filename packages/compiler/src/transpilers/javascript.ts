/* eslint-disable no-case-declarations */
import { AST, ASTScope, VarType, Accessability, IfStatement, ASTValue, Expression, FunctionCall, WhileStatement, ExpressStatement, PrintStatement } from '../types'
import { Transplier } from './base'

export class JavascriptTranspiler extends Transplier {
  name = 'javascript'

  transpile(ast: AST): string {
    return this.transpileScope(ast)
  }

  private escapeQuote(str: string) {
    return str.replace(/"/g, '\\"')
  }

  private getAccessDecaleration(name: string, accessability: Accessability) {
    return accessability === Accessability.public
      ? `let ${name}=this.${name}=`
      : `let ${name}=`
  }

  private transExpressions(expressions: Expression | Expression[]): string {
    if (!Array.isArray(expressions))
      expressions = [expressions]

    // eslint-disable-next-line array-callback-return
    return expressions.map((i) => {
      if (i === 'Answer') {
        return this.currentVar()
      }
      else if (typeof i === 'boolean') {
        return i.toString()
      }
      else if (i.type === 'Identifier') {
        return i.name
      }
      else if (i.type === 'UnaryOperation') {
        const op = '!'
        return `${op}(${this.transExpressions(i.expression)})`
      }
      else if (i.type === 'BinaryOperation') {
        let operator = i.operator as string
        if (operator === 'mod')
          operator = '%'
        return `${this.transExpressions(i.left)}${operator}${this.transExpressions(i.right)}`
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

  private transFunctionCall(s: FunctionCall) {
    let code = `let ${s.resultName?.name || this.nextVar()}=${s.function.name}`
    for (const i of s.args)
      code += `(${this.transExpressions(i)})`
    if (!s.args.length)
      code += '()'
    code += ';'
    return code
  }

  private transIf(s: IfStatement) {
    let code = ''
    if (s.condition != null)
      code = `if(${this.transExpressions(s.condition)}){${this.transpileScope(s)}}`
    else
      code = `{${this.transpileScope(s)}}`
    if (s.else)
      code += `else ${this.transIf(s.else)}`
    return code
  }

  private transPrint(s: PrintStatement) {
    return `console.log(${this.currentVar()});`
  }

  private transWhile(s: WhileStatement) {
    return `while(${this.transExpressions(s.condition)}){${this.transpileScope(s)}};`
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
          value = ''
          break
        case VarType.Function:
          value = '()=>{}'
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
      value = `"${this.escapeQuote(value.toString())}"`

    return value
  }

  private transExpressStatement(s: ExpressStatement) {
    let code = ''
    if (!s.operation)
      code = s.target.name

    else if (s.operation === 'length')
      code = `${s.target.name}.length`

    else if (s.operation === 'item')
      code = `${s.target.name}[${s.argument?.name}]`
      // TODO: number, string

    else
      this.throwError(undefined, `NOT IMPLEMENTED FOR OP ${s.operation}`)

    const name = `let ${s.name?.name || this.nextVar()}`

    return `${name}=${code};`
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
              if (i !== s.args.length - 1) {
                starts += `${arg.name}=>`
              }
              else {
                starts += `${arg.name}=>{`
                ends += '};'
              }
            })
          }
          else {
            starts = '()=>{'
            ends = '};'
          }
          code += this.getAccessDecaleration(name, s.accessability) + starts + this.transpileScope(s) + ends
          break

        case 'IfStatement':
          code += this.transIf(s)
          break

        case 'WhileStatement':
          code += this.transWhile(s)
          break

        case 'ReturnStatement':
          if (!s.expression)
            code += 'return;'
          else
            code += `return ${this.transExpressions(s.expression)};`
          break

        case 'ContinueStatement':
          code += 'continue;'
          break

        case 'BreakStatement':
          code += 'break;'
          break

        case 'OperationStatement':
          const exp = this.transExpressions(s.expression)
          code += `let ${s.name?.name || this.nextVar()}=${exp};`
          break

        case 'FunctionCall':
          code += this.transFunctionCall(s)
          break

        case 'ExpressStatement':
          code += this.transExpressStatement(s)
          break

        case 'PrintStatement':
          code += this.transPrint(s)
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return code
  }
}
