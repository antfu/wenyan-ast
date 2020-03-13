/* eslint-disable no-case-declarations */
import { ASTScope, VarType, Accessability, IfStatement, Literal, Expression, FunctionCall, WhileStatement, ExpressStatement, Print, ReassignStatement, AssignTarget, ForInStatement, ImportStatement, ArrayPush, Identifier, Answer, ArrayConcat, ForRangeStatement, ObjectDeclaration } from '../../../types'
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

  private transForRangeStatement(s: ForRangeStatement) {
    const name = s.iterator?.name || this.randomVar()
    const range = typeof s.range === 'number' ? s.range : s.range.name
    return `for (let ${name}=0;${name}<${range};${name}++){${this.transScope(s)}}`
  }

  private transForInStatement(s: ForInStatement) {
    const name = s.iterator?.name || this.randomVar()
    return `for (let ${name} of ${s.collection.name}){${this.transScope(s)}}`
  }

  private transExpressions(expressions: Expression | Expression[]): string {
    if (!Array.isArray(expressions))
      expressions = [expressions]

    // eslint-disable-next-line array-callback-return
    return expressions.map((i) => {
      if (typeof i === 'boolean') {
        return i.toString()
      }
      else if (i.type === 'Answer') {
        return this.currentVar(i.offset)
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
      else if (i.type === 'Literal') {
        return this.transValue(i)
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'length') {
        return `${this.transValue(i.identifier)}.length`
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'item') {
        let offset = '-1'
        if (i.argument.type === 'Literal' && i.argument.varType === VarType.String)
          offset = ''
        return `${this.transValue(i.identifier)}[${this.transExpressions(i.argument)}${offset}]`
      }
      else if (i.type === 'ArrayOperation' && i.operator === 'rest') {
        return `${this.transValue(i.identifier)}.slice(1)`
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
    let code = s.function.name
    for (const i of s.args)
      code += `(${this.transExpressions(i)})`
    if (!s.args.length)
      code += '()'
    return this.transAssign(s.assign, code)
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
    const args = (s.expressions || [{ type: 'Answer' }])
      .map(i => this.transExpressions(i))
      .join(',')
    return `console.log(${args});`
  }

  private transWhile(s: WhileStatement) {
    return `while(${this.transExpressions(s.condition)}){${this.transScope(s)}};`
  }

  private transImportStatement(s: ImportStatement) {
    const m = this.context.imports[s.name]

    if (!m)
      this.throwError(undefined, `Module ${s} not found`)

    return `/*Module:${s.name}:start*/\nlet {${s.imports.join(',')}}=(function(){${getCompiledFromContext(m, this.options)};return this;})();\n/*Module:${s.name}:end*/\n`
  }

  private transValue(node: Literal | Identifier | Answer) {
    if (node.type === 'Answer')
      return this.currentVar(node.offset)

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
    return `${this.transExpressions(s.assign)}=${this.transExpressions(s.value)};`
  }

  private transArrayPush(s: ArrayPush) {
    const name = this.transValue(s.target)
    const values = s.values.map(v => this.transValue(v)).join(',')
    return `${name}.push(${values});`
  }

  private transArrayConcat(s: ArrayConcat) {
    const name = this.transValue(s.target)
    const values = s.values.map(v => `.concat(${this.transValue(v)})`).join('')
    return this.transAssign(s.assign, `${name}${values}`)
  }

  private transObjectDeclaration(s: ObjectDeclaration) {
    const values = s.entries.map(({ value, key }) => `"${key}": ${this.transExpressions(value)}`).join(',')
    return this.transAssign(s.assign, `{${values}}`)
  }

  private transScope(scope: ASTScope) {
    this.context.compiled = ''

    for (const s of scope.body) {
      switch (s.type) {
        case 'VariableDeclaration':
          for (let j = 0; j < s.count; j++) {
            const name = s.names[j]
            let stringName = ''
            if (name === undefined)
              stringName = this.nextVar()
            else
              stringName = name.name
            const value = this.transValue(s.values[j] || { value: undefined, varType: s.varType, type: 'Literal' })
            this.context.compiled += `${this.getAccessDecaleration(stringName, s.accessability)}${value};`
          }
          break

        case 'FunctionDeclaration':
          const name = this.transValue(s.name) as string

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

        case 'ForRangeStatement':
          this.context.compiled += this.transForRangeStatement(s)
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

        case 'ArrayConcat':
          this.context.compiled += this.transArrayConcat(s)
          break

        case 'ObjectDeclaration':
          this.context.compiled += this.transObjectDeclaration(s)
          break

        default:
          // @ts-ignore
          this.throwError(s.loc, 'Unexpected AST Node %0', s.type)
      }
    }

    return this.context.compiled
  }
}
