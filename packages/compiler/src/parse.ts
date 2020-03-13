import { Token, TokenType, AST, VariableDeclaration, VarType, ASTScope, Accessability, FunctionDeclaration, Statement, IfStatement, Expression, Return, FunctionCall, OperationStatement, BinaryOperation, WhileStatement, ExpressStatement, Identifier, ReassignStatement, Answer, ForInStatement, Position, Continue, Break, Comment, Print, Literal, ModuleContext, createContext, ImportOptions, ImportStatement, MacroStatement, ArrayPush, ArrayConcat, ForRangeStatement, UnaryOperation, ObjectDeclaration, AssignableNode } from '../../types'
import { tokenizeContext, TokenizerOptions } from './tokenize'
import { Messages } from './messages'
import { ErrorHandler } from './errors/handler'

export interface ParseOptions extends TokenizerOptions {
  importOptions?: ImportOptions
}

export class Parser {
  protected _length = 0
  protected index = 0

  readonly options: ParseOptions
  protected scopeStack: ASTScope[] = []

  constructor(
    public readonly context: ModuleContext,
    options: Partial<ParseOptions> = {},
  ) {
    const {
      errorHandler = new ErrorHandler(),
    } = options

    this.options = {
      ...options,
      errorHandler,
    }
  }

  public run() {
    tokenizeContext(this.context, this.options)

    this.ast.loc = {
      start: this.tokens[0].loc.start,
      end: this.tokens.slice(-1)[0].loc.end,
    }

    this.preprocessTokens()
    this._length = this.tokens.length - 1 // ignore the EOF token

    this.index = 0

    return this.parseScope(this.ast) as AST
  }

  get length() {
    return this._length
  }

  get tokens() {
    return this.context.tokens
  }

  get ast() {
    return this.context.ast
  }

  get errorHandler() {
    return this.options.errorHandler
  }

  get eof() {
    return this.index >= this._length
  }

  private get prev() {
    return this.tokens[this.index - 1]
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

  protected get scope() {
    return this.scopeStack[0]
  }

  private preprocessTokens() {
    this.context.tokens = this.tokens.filter(t => t.type !== TokenType.Punctuations)
  }

  protected pushScope(scope: ASTScope) {
    this.scopeStack.unshift(scope)
  }

  protected popScope() {
    return this.scopeStack.shift()
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

    // 有數四
    if (this.next.type === TokenType.Type) {
      this.typeassert(this.next2, [TokenType.String, TokenType.Number, TokenType.Bool, TokenType.Answer, TokenType.Identifier], 'literals')

      node.count = 1
      node.varType = this.next.value as VarType

      node.values = [this.tokenToIdentifierOrValue(this.next2, node.varType)]

      this.index += 3
      // 名之曰「甲」
      if (!this.eof && this.current.type === TokenType.Name) {
        node.names.push(this.tokenToIdentifier(this.next))
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
        node.values.push(this.tokenToIdentifierOrValue(this.next, node.varType))
        this.index += 2
      }
      // 名之曰「甲」
      if (!this.eof && this.current.type === TokenType.Name) {
        node.names.push(this.tokenToIdentifier(this.next))
        this.index += 2
        // 曰「乙」曰「丙」
        // @ts-ignore
        while (!this.eof && this.current.type === TokenType.Assign) {
          node.names.push(this.tokenToIdentifier(this.next))
          this.index += 2
        }
      }
    }
    else {
      this.throwUnexpectedToken()
    }

    return node
  }

  // 其物如是。
  //  物之「「引」」者。數曰「引」。
  //  物之「「實」」者。數曰「實」。
  // 是謂「表列」之物也。
  private scanObjectDeclaration() {
    const node: ObjectDeclaration = {
      type: 'ObjectDeclaration',
      entries: [],
    }
    this.index += 1

    while (!this.eof && this.current.type === TokenType.PropertyDeclarion) {
      this.typeassert(this.next, TokenType.String, 'property key')
      this.valueassert(this.next2, 'conj', 'property key')
      this.typeassert(this.next3, TokenType.Type, 'property type')
      this.typeassert(this.next4, TokenType.Assign, 'property value')
      const key = this.next.value as string
      const varType = this.next3.value as VarType
      this.index += 5
      const value = this.scanExpression()
      node.entries.push({ key, varType, value })
    }

    const lastAST = this.lastASTNode

    if (lastAST?.type === 'VariableDeclaration' && lastAST.varType === VarType.Object && lastAST.count === 1) {
      node.assign = lastAST.names[0]
      this.popLastAST()
    }

    this.index += 1

    this.assert(this.current.value === node.assign?.name, `end with same object name ${this.current.value}`)
    this.assert(this.next.value === 'objectEnd', 'expecting 之物也')

    this.index += 2

    return node
  }

  // 施「漢諾塔」於「盤數」。於一。於二。於三。名之曰「史」。
  private scanFunctionCallRight() {
    const node: FunctionCall = {
      type: 'FunctionCall',
      function: this.tokenToIdentifier(this.next),
      args: [],
    }
    this.index += 2
    while (!this.eof && this.current.type === TokenType.OperationOrder && this.current.value === 'right') {
      if (this.next.type === TokenType.Answer)
        node.args.push({ type: 'Answer' })

      else if (this.next.type === TokenType.Identifier)
        node.args.push(this.tokenToIdentifier(this.next))

      else if (this.next.type === TokenType.Number || this.next.type === TokenType.String || this.next.type === TokenType.Bool)
        node.args.push(this.tokenToValue(this.next))

      else
        this.throwUnexpectedToken()

      this.index += 2
    }
    if (this.current.type === TokenType.Name) {
      node.assign = this.tokenToIdentifier(this.next)
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
      name: { type: 'Answer' },
      accessability: Accessability.private,
    }

    if (this.current.value === 'functionStart') {
      this.index += 1

      // @ts-ignore
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
    }

    const lastAST = this.lastASTNode

    if (lastAST?.type === 'VariableDeclaration' && lastAST.varType === VarType.Function && lastAST.count === 1) {
      node.name = lastAST.names[0]
      node.accessability = lastAST.accessability
      this.popLastAST()
    }

    this.index += 1

    this.parseScope(node, () => this.current.value === 'functionEnd1')

    this.index += 1

    // @ts-ignore
    this.assert(this.current.value === node.name?.name, `end with same function name ${this.current.value}`)
    this.assert(this.next.value === 'functionEnd2', 'expecting 之術也')

    this.index += 2

    return node
  }

  // 恆為是
  private scanWhileTrue() {
    const node: WhileStatement = {
      type: 'WhileStatement',
      condition: {
        type: 'Literal',
        varType: VarType.Boolean,
        value: true,
      },
      body: [],
    }
    this.index += 1
    this.parseScope(node, () => this.current.value === 'end')
    this.index += 1
    return node
  }

  // 凡「甲餘」中之「丁」。
  private scanForInStatement() {
    this.valueassert(this.next2, 'forIn', '中之')

    const node: ForInStatement = {
      type: 'ForInStatement',
      body: [],
      collection: this.tokenToIdentifier(this.next),
      iterator: this.tokenToIdentifier(this.next3),
    }

    this.index += 4

    this.parseScope(node, () => this.current.value === 'end')

    this.index += 1

    return node
  }

  // 昔之「乙」者今其是矣。
  private scanReassignStatement() {
    // 昔之
    this.index += 1

    const assign = this.scanExpression()

    // 者 今
    this.index += 2

    // xxx
    const node: ReassignStatement = {
      type: 'ReassignStatement',
      value: this.scanExpression(),
      assign,
    }

    // 是矣
    this.index += 1

    return node
  }

  private scanIfStatement(isElseIf = false) {
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
      condition = { type: 'Answer' }
    }
    else if (this.current.value === 'ifFalse') {
      condition = {
        type: 'UnaryOperation',
        operator: 'not',
        expression: { type: 'Answer' },
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

    if (this.current.value === 'else'
    || this.current.value === 'elseIf')
      node.else = this.scanIfStatement(true)

    if (!isElseIf)
      this.index += 1

    return node
  }

  // 夫「心語」之長。
  private scanExpressStatement() {
    this.index += 1

    const node: ExpressStatement = {
      type: 'ExpressStatement',
      expression: this.scanExpression(),
    }

    if (this.current.value === 'conj')
      this.index += 1

    return node
  }

  // 乃得「甲」
  private scanReturn() {
    const node: Return = {
      type: 'Return',
    }

    // 乃得矣
    if (this.current.value === 'returnPrev') {
      node.expression = { type: 'Answer' }
      this.index += 1
    }
    // 乃得「甲」
    else if (this.current.value === 'return') {
      this.index += 1
      node.expression = this.scanExpression()
    }
    // 乃歸空無
    else if (this.current.value === 'returnVoid') {
      this.index += 1
    }

    return node
  }

  private scanExpression() {
    const tokens: Token[] = []

    const scan = () => {
      const scanValue = () => {
        tokens.push(this.current)
        this.index += 1

        if (this.current.value === 'length') {
          tokens.push(this.current)
          this.index += 1
        }

        if (this.current.value === 'item') {
          tokens.push(this.current)
          tokens.push(this.next)
          this.index += 2
        }
      }

      scanValue()
      if (this.current.type === TokenType.ConditionOperator) {
        tokens.push(this.current)
        this.index += 1
        scanValue()
      }
    }

    // 「天」「地」中無陰乎
    if (this.current.type === TokenType.Identifier && this.next.type === TokenType.Identifier && this.next2.type === TokenType.BooleanOperator) {
      tokens.push(this.current)
      tokens.push(this.next)
      tokens.push(this.next2)
      this.index += 3
    }
    else {
      scan()
    }

    return this.parseExpressions(tokens)
  }

  // 為是「幾何」遍。
  private scanForRangeStatement() {
    let range: number | Identifier

    if (this.next.type === TokenType.Number)
      range = this.next.value as number

    else if (this.next.type === TokenType.Identifier)
      range = this.tokenToIdentifier(this.next)

    else
      this.throwUnexpectedToken('Expecting number or identifier')

    this.assert(this.next2.value === 'forRange2', 'expecting 遍')

    const node: ForRangeStatement = {
      type: 'ForRangeStatement',
      range,
      body: [],
    }

    this.index += 3

    this.parseScope(node, () => this.current.value === 'end')

    this.index += 1

    return node
  }

  // 除十三以十。名之曰「乙」。
  private scanOperationStatement() {
    let expression: BinaryOperation | UnaryOperation | undefined

    // 變「甲」
    if (this.current.value === 'not') {
      this.typeassert(this.next, [TokenType.String, TokenType.Number, TokenType.Bool, TokenType.Answer, TokenType.Identifier])
      expression = {
        type: 'UnaryOperation',
        operator: 'not',
        expression: this.parseExpressions([this.next]),
      }
      this.index += 2
    }
    // 除「甲」以十
    else {
      this.typeassert(this.next, [TokenType.String, TokenType.Number, TokenType.Bool, TokenType.Answer, TokenType.Identifier])
      this.typeassert(this.next2, TokenType.OperationOrder)
      this.typeassert(this.next3, [TokenType.String, TokenType.Number, TokenType.Bool, TokenType.Answer, TokenType.Identifier])

      expression = {
        type: 'BinaryOperation',
        operator: this.current.value as any,
        left: this.parseExpressions([this.next]),
        right: this.parseExpressions([this.next3]),
      }

      // 於
      if (this.next2.value === 'right')
        [expression.left, expression.right] = [expression.right, expression.left]

      this.index += 4

      if (this.current.type === TokenType.Operator && this.current.value === 'mod') {
        if (expression.operator === '/')
          expression.operator = 'mod'
        else
          this.throwUnexpectedToken('所餘幾何 should follow by 除')
        this.index += 1
      }
    }

    const node: OperationStatement = {
      type: 'OperationStatement',
      expression,
    }

    return node
  }

  // 充「己」以五。以三。以二十。以八。以三十五。以七百。
  private scanArrayPush() {
    const node: ArrayPush = {
      type: 'ArrayPush',
      target: this.tokenToIdentifierOrAnswer(this.next),
      values: [],
    }

    this.index += 2

    while (!this.eof && this.current.type === TokenType.OperationOrder && this.current.value === 'left') {
      node.values.push(this.tokenToIdentifierOrValue(this.next))
      this.index += 2
    }

    return node
  }

  // 銜「首」以「頷」以「尾」。名之曰「乙」。
  private scanArrayConcat() {
    const node: ArrayConcat = {
      type: 'ArrayConcat',
      target: this.tokenToIdentifierOrValue(this.next),
      values: [],
      assign: undefined,
    }

    this.index += 2

    while (!this.eof && this.current.type === TokenType.OperationOrder && this.current.value === 'left') {
      node.values.push(this.tokenToIdentifierOrValue(this.next))
      this.index += 2
    }

    return node
  }

  // 吾嘗觀「「算經」」之書。方悟「絕對」「平方根」之義。
  private scanImportStatement() {
    this.index += 1

    this.typeassert(this.current, TokenType.String)

    const name = this.current.value as string
    // TODO: support import path

    this.index += 3

    const imports: string[] = []
    while (!this.eof && this.current.type === TokenType.Identifier) {
      imports.push(this.current.value as string)
      this.index += 1
    }

    this.index += 1

    const node: ImportStatement = {
      type: 'ImportStatement',
      name,
      imports,
    }
    return node
  }

  // 或云「「書「甲」焉」」。
  // 蓋謂「「吾有一言。曰「甲」。書之」」。
  private scanMacro() {
    this.typeassert(this.next, TokenType.String)
    this.typeassert(this.next3, TokenType.String)

    const node: MacroStatement = {
      type: 'MacroStatement',
      from: this.next.value as string,
      to: this.next3.value as string,
    }

    this.index += 4

    return node
  }

  // 名之曰「甲」曰「乙」曰「丙」
  private scanNames() {
    const names: Token[] = []

    // 名之曰「甲」
    names.push(this.next)
    this.index += 2
    // 曰「乙」曰「丙」
    while (!this.eof && this.current.type === TokenType.Assign) {
      names.push(this.next)
      this.index += 2
    }

    const length = this.scope.body.length
    this.assert(length - names.length >= 0, 'too many names to assign')
    names.forEach((name, i) => {
      const node = this.scope.body[length - names.length + i]
      if (this.isAssignableNode(node)) {
        this.assert(node.assign == null, `node ${node.type} is already named as "${node.assign?.name}", trying to assign a new name "${name.value}"`)
        node.assign = this.tokenToIdentifier(name)
      }
      else {
        this.pushAST({
          type: 'ReassignStatement',
          value: {
            type: 'Answer',
            offset: -names.length + i,
          },
          assign: this.tokenToIdentifier(name),
        },
        name.loc.start,
        name.loc.end,
        )
      }
    })
  }

  private isAssignableNode(node: Statement): node is AssignableNode {
    return [
      'ObjectDeclaration',
      'OperationStatement',
      'FunctionCall',
      'ArrayConcat',
      'ExpressStatement',
    ].includes(node.type)
  }

  private tokenToIdentifier(token: Token): Identifier {
    this.typeassert(token, TokenType.Identifier, 'identifier')
    return {
      type: 'Identifier',
      name: token.value as string,
      loc: token.loc,
    }
  }

  private tokenToIdentifierOrAnswer(token: Token): Identifier | Answer {
    if (token.type === TokenType.Answer)
      return { type: 'Answer' }
    else
      return this.tokenToIdentifier(token)
  }

  private tokenToIdentifierOrValue(token: Token, varType?: VarType): Identifier | Literal | Answer {
    if (token.type === TokenType.Answer)
      return { type: 'Answer' }
    else if (token.type === TokenType.Identifier)
      return this.tokenToIdentifier(token)
    else
      return this.tokenToValue(token, varType)
  }

  private tokenToValue(token: Token, varType?: VarType): Literal {
    if (!varType) {
      varType = ({
        [TokenType.Number]: VarType.Number,
        [TokenType.String]: VarType.String,
        [TokenType.Bool]: VarType.Boolean,
      } as Record<TokenType, VarType>)[token.type]
    }

    if (!varType)
      this.throwUnexpectedToken(`Expecting value token, got ${token.type}`)

    return {
      type: 'Literal',
      varType,
      value: token.value as any,
      loc: token.loc,
    }
  }

  private parseExpressions(tokens: Token[]): Expression {
    if (tokens.length === 0)
      return { type: 'Literal', varType: VarType.Boolean, value: true }

    if (tokens.length === 1) {
      if (tokens[0].type === TokenType.Bool)
        return { type: 'Literal', varType: VarType.Boolean, value: tokens[0].value }

      else if (tokens[0].type === TokenType.Answer)
        return { type: 'Answer' }

      else if (tokens[0].type === TokenType.Identifier)
        return this.tokenToIdentifier(tokens[0])

      else if (tokens[0].type === TokenType.String || tokens[0].type === TokenType.Number)
        return this.tokenToValue(tokens[0])
    }

    if (tokens.length === 2) {
      if (tokens[0].type === TokenType.Operator) {
        return {
          type: 'UnaryOperation',
          operator: 'not',
          expression: this.parseExpressions([tokens[1]]),
        }
      }
      else if (tokens[1].type === TokenType.ArrayOperator) {
        return {
          type: 'ArrayOperation',
          operator: 'length',
          identifier: this.tokenToIdentifier(tokens[0]),
        }
      }
    }

    if (tokens.length === 3) {
      // x y 中無陰乎
      if (tokens[2].type === TokenType.BooleanOperator) {
        return {
          type: 'BinaryOperation',
          operator: tokens[2].value as any,
          left: this.parseExpressions([tokens[0]]),
          right: this.parseExpressions([tokens[1]]),
        }
      }
      // x 之 y
      else if (tokens[1].type === TokenType.ArrayOperator && tokens[1].value === 'item') {
        // 之其餘
        if (tokens[2].value === 'rest') {
          return {
            type: 'ArrayOperation',
            operator: 'rest',
            identifier: this.tokenToIdentifier(tokens[0]),
          }
        }
        else {
          return {
            type: 'ArrayOperation',
            operator: 'item',
            identifier: this.tokenToIdentifierOrAnswer(tokens[0]),
            argument: this.tokenToIdentifierOrValue(tokens[2]), // TODO: number, string
          }
        }
      }
    }

    if (tokens.length >= 3) {
      const conditionIndex = tokens.findIndex(i => i.type === TokenType.ConditionOperator)
      if (conditionIndex > 0) {
        return {
          type: 'BinaryOperation',
          operator: tokens[conditionIndex].value as any,
          left: this.parseExpressions(tokens.slice(0, conditionIndex)),
          right: this.parseExpressions(tokens.slice(conditionIndex + 1)),
        }
      }
    }

    this.throwUnexpectedToken(`Unexpected expression sequence: ${tokens.map(i => i.type).join(',')}`)
  }

  // 取二以施「甲」
  private scanTake() {
    this.typeassert(this.next, TokenType.Number, 'number')
    this.typeassert(this.next2, TokenType.Call, '以施')
    this.valueassert(this.next2, 'left', '以施')
    this.typeassert(this.next3, TokenType.Identifier, 'function name')

    const argsAmount = this.next.value as number

    const args: Answer[] = new Array(argsAmount).fill(0).map((_, i) => ({
      type: 'Answer',
      offset: i - argsAmount + 1,
    }))
    const node: FunctionCall = {
      type: 'FunctionCall',
      function: this.tokenToIdentifier(this.next3),
      args,
    }
    this.index += 4
    return node
  }

  private get lastASTNode(): Statement | undefined {
    return this.scope.body.slice(-1)[0]
  }

  private popLastAST() {
    return this.scope.body.pop()
  }

  private pushAST(statement: Statement, start: Position, end: Position = this.prev.loc.end) {
    statement.loc = { start, end }
    this.scope.body.push(statement)
  }

  private parseScope(scope: ASTScope, shouldExit = () => false) {
    this.pushScope(scope)
    let prev_index = this.index - 1

    while (!this.eof && !shouldExit()) {
      if (prev_index === this.index)
        this.throwUnexpectedToken('Parser cursor stuck')
      prev_index = this.index

      const start = this.current.loc.start

      // var declarion
      if (this.current.type === TokenType.Declarion) {
        this.pushAST(this.scanDeclarion(), start)
        continue
      }

      // name
      if (this.current.type === TokenType.Name) {
        this.scanNames()
        continue
      }

      // object declarion
      if (this.current.value === 'objectBody') {
        this.pushAST(this.scanObjectDeclaration(), start)
        continue
      }

      // function body
      if (this.current.value === 'functionStart' || this.current.value === 'functionBody') {
        this.pushAST(this.scanFunctionDeclarion(), start)
        continue
      }

      // if
      if (this.current.value === 'if'
        || this.current.value === 'ifTrue'
        || this.current.value === 'ifFalse'
      ) {
        this.pushAST(this.scanIfStatement(), start)
        continue
      }

      // return
      if (this.current.value?.toString().startsWith('return')) {
        this.pushAST(this.scanReturn(), start)
        continue
      }

      // continue
      if (this.current.value === 'continue') {
        const node: Continue = {
          type: 'Continue',
        }
        this.index += 1
        this.pushAST(node, start)
        continue
      }

      // break
      if (this.current.value === 'break') {
        const node: Break = {
          type: 'Break',
        }
        this.index += 1
        this.pushAST(node, start)
        continue
      }

      // function call
      if (this.current.type === TokenType.Call) {
        if (this.current.value === 'right') {
          this.pushAST(this.scanFunctionCallRight(), start)
        }
        else {
          // TODO:
          this.throwUnexpectedToken()
        }
        continue
      }

      // operation
      if (this.current.type === TokenType.Operator) {
        this.pushAST(this.scanOperationStatement(), start)
        continue
      }

      // while
      if (this.current.value === 'whileTrue') {
        this.pushAST(this.scanWhileTrue(), start)
        continue
      }

      // express
      if (this.current.type === TokenType.Express) {
        this.pushAST(this.scanExpressStatement(), start)
        continue
      }

      // print
      if (this.current.value === 'print') {
        const node: Print = {
          type: 'Print',
        }
        this.index += 1
        if (this.lastASTNode?.type === 'VariableDeclaration') {
          node.expressions = [...this.lastASTNode.names]
          for (let i = node.expressions.length; i < this.lastASTNode.count; i++) {
            node.expressions.push({
              type: 'Answer',
              offset: i - this.lastASTNode.count + 1,
            })
          }
        }

        this.pushAST(node, start)
        continue
      }

      // comments
      if (this.current.type === TokenType.Comment) {
        const node: Comment = {
          type: 'Comment',
          value: this.current.value as string,
        }
        this.index += 1
        this.pushAST(node, start)
        continue
      }

      // reassign
      if (this.current.value === 'reassign1') {
        this.pushAST(this.scanReassignStatement(), start)
        continue
      }

      // for
      if (this.current.value === 'forRange1') {
        this.pushAST(this.scanForRangeStatement(), start)
        continue
      }

      // for in
      if (this.current.value === 'for') {
        this.pushAST(this.scanForInStatement(), start)
        continue
      }

      // import
      if (this.current.value === 'importStart') {
        this.pushAST(this.scanImportStatement(), start)
        continue
      }

      // macro
      if (this.current.value === 'macroFrom') {
        this.pushAST(this.scanMacro(), start)
        continue
      }

      if (this.current.value === 'push') {
        this.pushAST(this.scanArrayPush(), start)
        continue
      }

      if (this.current.value === 'concat') {
        this.pushAST(this.scanArrayConcat(), start)
        continue
      }

      if (this.current.value === 'take') {
        this.pushAST(this.scanTake(), start)
        continue
      }

      console.warn('Unhandled token ', this.current)

      this.index++
    }
    return this.popScope()
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

  private valueassert(token: Token, value: string| number|undefined, message = Messages.UnexpectedTokenIllegal) {
    if (token.value !== value)
      this.throwUnexpectedToken(`Invalid token. Expecting ${message}`, token.loc)
  }

  private throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal, loc = this.current?.loc, ...parameters: string[]): never {
    return this.errorHandler.throwError({
      name: 'ParseError',
      loc,
      file: this.context.name,
      message,
      parameters,
      source: this.context.source,
    })
  }
}

export function parse(src: string, options: Partial<ParseOptions> = {}) {
  const parser = new Parser(createContext(src), options)
  parser.run()
  return parser.ast
}

export function parseContext(context: ModuleContext, options: Partial<ParseOptions> = {}) {
  const parser = new Parser(context, options)
  parser.run()

  for (const moduleContext of Object.values(context.imports))
    parseContext(moduleContext, options)

  return context
}
