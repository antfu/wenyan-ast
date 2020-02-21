import { Token, TokenType, AST, VariableDeclaration, VarType, ASTScope, Accessability, FunctionDeclaration, Program, Statement, IfStatement, Expression, ReturnStatement, FunctionCall } from './types'
import { Tokenizer } from './tokenize'
import { Messages } from './messages'
import { ErrorHandler } from './errors/handler'

export interface ParseOptions {
  errorHandler: ErrorHandler
  sourcemap: boolean
}

export class Parser {
  protected _tokens: Token[] | undefined
  protected _ast: AST
  protected _length = 0
  protected index = 0

  readonly options: ParseOptions
  protected tokenier: Tokenizer
  protected scopeStack: ASTScope[] = []

  constructor(
    public readonly source: string,
    options: Partial<ParseOptions> = {},
  ) {
    const {
      errorHandler = new ErrorHandler(),
      sourcemap = true,
    } = options

    this.options = {
      errorHandler,
      sourcemap,
    }

    this.tokenier = new Tokenizer(this.source, this.options)
    this._ast = {
      type: 'Program',
      body: [],
    }
  }

  public run() {
    this._tokens = this.tokenier.getTokens()

    this._ast = {
      type: 'Program',
      body: [],
      loc: this.sourcemap
        ? {
          start: this.tokens[0].loc.start,
          end: this.tokens.slice(-1)[0].loc.end,
        }
        : undefined,
    }

    this.preprocessTokens()
    this._length = this._tokens.length - 1 // ignore the EOF token

    this.index = 0

    return this.parseScope(this.ast) as AST
  }

  get length() {
    return this._length
  }

  get tokens() {
    return this._tokens!
  }

  get ast() {
    return this._ast!
  }

  get errorHandler() {
    return this.options.errorHandler
  }

  get sourcemap() {
    return this.options.sourcemap
  }

  get eof() {
    return this.index >= this._length
  }

  private get current() {
    return this.tokens[this.index]
  }

  private get next() {
    return this.tokens[this.index + 1]
  }

  private get next2() {
    return this.tokens[this.index + 2]
  }

  private get next3() {
    return this.tokens[this.index + 3]
  }

  private get next4() {
    return this.tokens[this.index + 4]
  }

  private get next5() {
    return this.tokens[this.index + 5]
  }

  private get prev() {
    return this.tokens[this.index - 2]
  }

  private get prev2() {
    return this.tokens[this.index - 1]
  }

  protected get scope() {
    return this.scopeStack[0]
  }

  private preprocessTokens() {
    this._tokens = this.tokens.filter(t => t.type !== TokenType.Punctuations)
  }

  protected pushScope(scope: ASTScope) {
    this.scopeStack.unshift(scope)
  }

  protected popScope() {
    return this.scopeStack.shift()
  }

  private parseScope(scope: ASTScope, shouldExit = () => false) {
    // console.log(this.tokens.map(i => i.type))
    this.pushScope(scope)
    while (!this.eof && !shouldExit()) {
      if (this.current.type === TokenType.Declarion) {
        this.pushAST(this.scanDeclarion())
        continue
      }
      if (this.current.type === TokenType.PropertyDeclarion) {
        this.pushAST(this.scanPropertyDeclarion())
        continue
      }
      if (this.current.value === 'functionStart') {
        this.pushAST(this.scanFunctionDeclarion())
        continue
      }
      if (this.current.value === 'if'
        || this.current.value === 'ifTrue'
        || this.current.value === 'ifFalse'
      ) {
        this.pushAST(this.scanIfStatement())
        continue
      }
      if (this.current.value?.toString().startsWith('return')) {
        this.pushAST(this.scanReturnStatement())
        continue
      }
      if (this.current.value === 'continue') {
        this.pushAST({
          type: 'ContinueStatement',
        })
        this.index += 1
        continue
      }
      if (this.current.type === TokenType.Call) {
        if (this.current.value === 'right') {
          this.pushAST(this.scanFunctionCallRight())
        }
        else {
          // TODO:
          this.throwUnexpectedToken()
        }
        continue
      }

      this.index++
    }
    return this.popScope()
  }

  // 吾有三數。曰一。曰三。曰五。名之曰「甲」曰「乙」曰「丙」。
  private scanDeclarion() {
    const node: VariableDeclaration = {
      type: 'VariableDeclaration',
      varType: VarType.Auto,
      count: 1,
      values: [],
      names: [],
      accessability: this.current.value as Accessability,
    }

    if (this.sourcemap)
      node.loc = { ...this.current.loc }

    // 有數四
    if (this.next.type === TokenType.Type) {
      this.typeassert(this.next2, [TokenType.String, TokenType.Number, TokenType.Bool, TokenType.Answer], 'literals')

      node.count = 1
      node.varType = this.next.value as VarType
      node.values = [{
        type: 'Value',
        varType: node.varType,
        value: this.next2.value as string,
        loc: this.sourcemap ? this.next.loc : undefined,
      }]
      this.index += 3
      // 名之曰「甲」
      if (!this.eof && this.current.type === TokenType.Name) {
        node.names.push(this.next.value as unknown as string)
        this.index += 2
      }
    }
    // 吾有三數
    else if (this.next.type === TokenType.Number) {
      this.typeassert(this.next2, TokenType.Type, 'variable type')

      const count = Number(this.next.value)
      this.assert(Number.isSafeInteger(count) && count > 0, `Invalid variable count ${count}`)

      node.count = count
      node.varType = this.next2.value as VarType

      this.index += 3
      // 曰一。曰三。曰五
      while (!this.eof && this.current.type === TokenType.Assign) {
        node.values.push({
          type: 'Value',
          varType: node.varType,
          value: this.next.value as unknown as string,
          loc: this.sourcemap ? this.next.loc : undefined,
        })
        this.index += 2
      }
      // 名之曰「甲」
      if (!this.eof && this.current.type === TokenType.Name) {
        node.names.push(this.next.value as unknown as string)
        this.index += 2
      }
      // 曰「乙」曰「丙」
      while (!this.eof && this.current.type === TokenType.Assign) {
        node.names.push(this.next.value as unknown as string)
        this.index += 2
      }
    }
    else {
      this.throwUnexpectedToken()
    }

    return node
  }

  private scanPropertyDeclarion(): Statement {
    /*
    this.typeassert(this.next, ['lit'], 'property key')
    this.typeassert(this.next3, ['type'], 'property type')
    this.typeassert(this.next4, ['assgn'], 'property value')
    const x: Prop = {
      op: 'prop',
      type: gettok(i + 3, 1),
      name: tokens[i + 1][1],
      value: tokens[i + 5],
      pos,
    }
    i += 6
    asc.push(x)
    */

    throw new Error('not yet')
  }

  // 施「漢諾塔」於「盤數」。於一。於二。於三。名之曰「史」。
  private scanFunctionCallRight() {
    this.typeassert(this.next, TokenType.Identifier, 'identifier')

    const node: FunctionCall = {
      type: 'FunctionCall',
      function: {
        type: 'Identifier',
        name: this.next.value as string,
      },
      args: [],
    }
    this.index += 2
    while (!this.eof && this.current.type === TokenType.OpOrd && this.current.value === 'right') {
      if (this.next.type === TokenType.Answer) {
        node.args.push('Answer')
      }
      else if (this.next.type === TokenType.Identifier) {
        node.args.push({
          type: 'Identifier',
          name: this.next.value as string,
        })
      }
      else if (this.next.type === TokenType.Number) {
        node.args.push({
          type: 'Value',
          varType: VarType.Number,
          value: this.next.value,
        })
      }
      else if (this.next.type === TokenType.String) {
        node.args.push({
          type: 'Value',
          varType: VarType.String,
          value: this.next.value,
        })
      }
      else if (this.next.type === TokenType.Bool) {
        node.args.push({
          type: 'Value',
          varType: VarType.Boolean,
          value: this.next.value,
        })
      }
      else {
        this.throwUnexpectedToken()
      }
      this.index += 2
    }
    if (this.current.type === TokenType.Name) {
      this.typeassert(this.next, TokenType.Identifier, 'identifier')
      node.resultName = {
        type: 'Identifier',
        name: this.next.value,
      }
      this.index += 2
    }
    return node
  }

  // 吾有一術。名之曰「甲」。欲行是術。必先得二數。曰「乙」。曰「丙」。是術曰。
  private scanFunctionDeclarion() {
    const node: FunctionDeclaration = {
      type: 'FunctionDeclaration',
      body: [],
      args: [],
      accessability: Accessability.private,
    }

    this.index += 1
    if (this.current.value === 'functionArgs') {
      this.index += 1
      // @ts-ignore
      while (this.current.value !== 'functionBody') {
        this.typeassert(this.current, TokenType.Number, 'argument count')
        this.typeassert(this.next, TokenType.Type, 'argument type')
        const varType = this.next.value as VarType
        const count = Number(this.current.value)
        this.assert(Number.isSafeInteger(count) && count > 0, `Invalid argument count ${count}`)
        this.index += 2
        for (let j = 0; j < count; j++) {
          this.typeassert(this.current, TokenType.Assign, 'another argument')
          this.typeassert(this.next, TokenType.Identifier, 'argument')
          node.args.push({
            name: this.next.value as string,
            varType,
          })
          this.index += 2
        }
      }
    }

    const lastAST = this.lastASTNode

    if (lastAST?.type === 'VariableDeclaration' && lastAST.varType === VarType.Function && lastAST.count === 1) {
      node.name = lastAST.names[0]
      node.accessability = lastAST.accessability
      this.popLastAST()
    }

    this.parseScope(node, () => this.current.value === 'functionEnd')

    return node
  }

  private scanIfStatement() {
    let condition: Expression | undefined

    if (this.current.value === 'if'
      || this.current.value === 'elseIf'
    ) {
      const conditionsTokens = []
      this.index += 1
      // @ts-ignore
      while (!this.eof && this.current.value !== 'conj') {
        conditionsTokens.push(this.current)
        this.index += 1
      }
      condition = this.parseExpressions(conditionsTokens)
    }
    else if (this.current.value === 'ifTrue') {
      condition = 'Answer'
    }
    else if (this.current.value === 'ifFalse') {
      condition = {
        type: 'UnaryOperation',
        operator: 'not',
        expression: 'Answer',
      }
    }
    else if (this.current.value === 'else') {
      condition = undefined
    }

    this.index += 1

    const node: IfStatement = {
      type: 'IfStatement',
      body: [],
      condition,
    }

    this.parseScope(node, () =>
      this.current.value === 'else'
      || this.current.value === 'elseIf'
      || this.current.value === 'end',
    )

    if (this.current.value === 'else')
      node.else = this.scanIfStatement()

    return node
  }

  private scanReturnStatement() {
    const node: ReturnStatement = {
      type: 'ReturnStatement',
    }

    if (this.current.value === 'returnPrev') {
      node.expression = 'Answer'
      this.index += 1
    }
    else if (this.current.value === 'return') {
      const tokens: Token[] = []
      this.index += 1
      // @ts-ignore
      while (!this.eof && this.current.value !== 'end') {
        tokens.push(this.current)
        this.index += 1
      }
      node.expression = this.parseExpressions(tokens)
    }
    else if (this.current.value === 'returnVoid') {
      this.index += 1
    }

    return node
  }

  private parseExpressions(tokens: Token[]): Expression {
    if (tokens.length === 0)
      return true

    if (tokens.length === 1) {
      if (tokens[0].type === TokenType.Bool) {
        return tokens[0].value
      }
      else if (tokens[0].type === TokenType.Answer) {
        return 'Answer'
      }
      else if (tokens[0].type === TokenType.Identifier) {
        return {
          type: 'Identifier',
          name: tokens[0].value as string,
        }
      }
      else if (tokens[0].type === TokenType.String) {
        return {
          type: 'Value',
          varType: VarType.String,
          value: tokens[0].value,
        }
      }
      else if (tokens[0].type === TokenType.Number) {
        return {
          type: 'Value',
          varType: VarType.Number,
          value: tokens[0].value as number,
        }
      }
    }

    if (tokens.length === 2) {
      this.typeassert(tokens[0], TokenType.Operator)
      return {
        type: 'UnaryOperation',
        operator: 'not',
        expression: this.parseExpressions([tokens[1]]),
      }
    }

    if (tokens.length === 3) {
      this.typeassert(tokens[1], TokenType.ConditionOperator)
      return {
        type: 'BinaryOperation',
        operator: tokens[1].value as any,
        left: this.parseExpressions([tokens[0]]),
        right: this.parseExpressions([tokens[2]]),
      }
    }

    this.throwUnexpectedToken(`Unexpected expression sequence: ${tokens.map(i => i.type).join(',')}`)
  }

  private get lastASTNode(): Statement | undefined {
    return this.scope.body.slice(-1)[0]
  }

  private popLastAST() {
    return this.scope.body.pop()
  }

  private pushAST(statement: Statement) {
    this.scope.body.push(statement)
  }

  private assert(bool: boolean, message = Messages.UnexpectedTokenIllegal) {
    if (!bool)
      this.throwUnexpectedToken(message)
  }

  private typeassert(token: Token, types: TokenType | TokenType[], message = Messages.UnexpectedTokenIllegal) {
    if (!Array.isArray(types))
      types = [types]
    if (!types.includes(token.type))
      this.throwUnexpectedToken(`Invalid token. Expecting ${message}`, token.loc)
  }

  private throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal, loc = this.current?.loc, ...parameters: string[]): never {
    return this.errorHandler.throwError({
      name: 'ParseError',
      pos: loc?.start,
      message,
      parameters,
      source: this.source,
    })
  }
}

export function parse(src: string, options: Partial<ParseOptions> = {}) {
  const parser = new Parser(src, options)
  parser.run()
  return parser.ast
}
