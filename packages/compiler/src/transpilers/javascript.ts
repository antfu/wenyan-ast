/* eslint-disable no-case-declarations */
import { ASTScope, VarType, Accessability, IfStatement, ASTValue, Expression, FunctionCall, WhileStatement, ExpressStatement, Print, ReassignStatement, AssignTarget, ForInStatement, ModuleContext, ImportStatement, ArrayPush, Identifier, Answer } from '../types'
import { Transplier } from './base'
import { getCompiledFromContext } from '.'

export class JavascriptTranspiler extends Transplier {
  name = 'javascript'

  transpile(): string {
    return this.transScope(this.context.ast)
  }

  private escapeQuote(str: string) {
    return str.replace(/"/g, '\\"')
  }

  private getAccessDecaleration(name: string, accessability: Accessability) {
    return accessability === Accessability.public
      ? `var ${name}=this.${name}=`
      : `var ${name}=`
  }

  private transForInStatement(s: ForInStatement) {
    const name = s.iterator?.name || this.randomVar()
    if (typeof s.collection === 'number')
      return `for (let ${name}=0;${name}<${s.collection};${name}++){${this.transScope(s)}}`
    else
      return `for (let ${name} of ${s.collection.name}){${this.transScope(s)}}`
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
        return this.transValue(i)
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'length') {
        return `${i.identifier.name}.length`
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'item') {
        return `${i.identifier.name}[${this.transExpressions(i.argument)} - 1]`
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'rest') {
        return `${i.identifier.name}.slice(1)`
      }
      else {
        // @ts-ignore
        this.throwError(undefined, `UNEXPECTED NODE ${i.type}`)
      }
    })
      .join(' ')
  }

  private transAssign(assign: AssignTarget, valueString: string, end = ';') {
    const declare = assign?.declare ?? true
    return `${declare ? 'var ' : ''}${assign?.name || this.nextVar()}=${valueString}${end}`
  }

  private transFunctionCall(s: FunctionCall) {
    let code = this.transAssign(s.assign, s.function.name, '')
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
      code = `if(${this.transExpressions(s.condition)}){${this.transScope(s)}}`
    else
      code = `{${this.transScope(s)}}`
    if (s.else)
      code += `else ${this.transIf(s.else)}`
    return code
  }

  private transPrint(s: Print) {
    return `console.log(${this.currentVar()});`
  }

  private transWhile(s: WhileStatement) {
    return `while(${this.transExpressions(s.condition)}){${this.transScope(s)}};`
  }

  private transImportStatement(s: ImportStatement) {
    const m = this.context.imports[s.name]

    if (!m)
      this.throwError(undefined, `Module ${s} not found`)

    return getCompiledFromContext(m, this.options)
  }

  private transValue(node: ASTValue | Identifier | Answer) {
    if (node === 'Answer')
      return this.currentVar()

    if (node.type === 'Identifier')
      return node.name

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
    return this.transAssign(s.assign, this.transExpressions(s.expression))
  }

  private transReassignStatement(s: ReassignStatement) {
    return this.transAssign(s.assign, this.transExpressions(s.value))
  }

  private transArrayPush(s: ArrayPush) {
    const name = s.target === 'Answer' ? this.currentVar : s.target.name
    const values = s.values.map(v => this.transValue(v)).join(',')
    return `${name}.push(${values});`
  }

  private transScope(scope: ASTScope) {
    this.context.compiled = ''
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
            const value = this.transValue(s.values[j] || { value: undefined, varType: s.varType, type: 'Value' })
            this.context.compiled += `${this.getAccessDecaleration(name, s.accessability)}${value};`
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
          this.context.compiled += this.getAccessDecaleration(name, s.accessability) + starts + this.transScope(s) + ends
          break

        case 'IfStatement':
          this.context.compiled += this.transIf(s)
          break

        case 'WhileStatement':
          this.context.compiled += this.transWhile(s)
          break

        case 'Return':
          if (!s.expression)
            this.context.compiled += 'return;'
          else
            this.context.compiled += `return ${this.transExpressions(s.expression)};`
          break

        case 'Continue':
          this.context.compiled += 'continue;'
          break

        case 'Break':
          this.context.compiled += 'break;'
          break

        case 'OperationStatement':
          const exp = this.transExpressions(s.expression)
          this.context.compiled += this.transAssign(s.assign, exp)
          break

        case 'FunctionCall':
          this.context.compiled += this.transFunctionCall(s)
          break

        case 'Comment':
          this.context.compiled += `\n/*${s.value}*/\n`
          break

        case 'ExpressStatement':
          this.context.compiled += this.transExpressStatement(s)
          break

        case 'Print':
          this.context.compiled += this.transPrint(s)
          break

        case 'ReassignStatement':
          this.context.compiled += this.transReassignStatement(s)
          break

        case 'ForInStatement':
          this.context.compiled += this.transForInStatement(s)
          break

        case 'MacroStatement':
          break

        case 'ImportStatement':
          this.context.compiled += this.transImportStatement(s)
          break

        case 'ArrayPush':
          this.context.compiled += this.transArrayPush(s)
          break

        default:
          // @ts-ignore
          this.throwError(s.loc?.start, 'Unexpected AST Node %0', s.type)
      }
    }

    return this.context.compiled
  }
}
