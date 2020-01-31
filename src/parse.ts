import { Token, TokenType, AST, VariableDeclaration, VarType, ASTScope } from './types'
import { Tokenizer } from './tokenize'
import { Messages } from './messages'
import { ErrorHandler } from './error-handler'
import { formatErrorMessage } from './utils'

export interface ParseOptions {
  errorHandler: ErrorHandler
  sourcemap: boolean
}

export class Parser {
  tokens: Token[]
  index: number
  ast: AST

  readonly sourcemap: boolean
  protected tokenier: Tokenizer
  protected length: number
  protected scope: ASTScope
  protected readonly errorHandler: ErrorHandler

  constructor(
    public readonly source: string,
    options: Partial<ParseOptions> = {},
  ) {
    this.errorHandler = options.errorHandler || new ErrorHandler()
    this.sourcemap = options.sourcemap ?? true
    this.tokenier = new Tokenizer(this.source, {
      errorHandler: this.errorHandler,
    })
    this.tokens = this.tokenier.getTokens()

    this.preprocessTokens()
    this.length = this.tokens.length - 1 // ignore the EOF token

    this.index = 0
    this.ast = {
      type: 'Program',
      body: [],
      loc: this.sourcemap
        ? {
          start: this.tokens[0].loc.start,
          end: this.tokens.slice(-1)[0].loc.end,
        }
        : undefined,
    }
    this.scope = this.ast
  }

  get eof() {
    return this.index >= this.length
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

  private get prev() {
    return this.tokens[this.index - 2]
  }

  private get prev2() {
    return this.tokens[this.index - 1]
  }

  private preprocessTokens() {
    this.tokens = this.tokens.filter(t => t.type !== TokenType.Punctuations)
  }

  private parse() {
    // console.log(this.tokens.map(i => i.type))
    while (!this.eof) {
      if (this.current.type === TokenType.Declarion) {
        this.scanDeclarion()
        continue
      }
      this.index++
    }
    return this.ast
  }

  private scanDeclarion() {
    this.typeassert(this.next, TokenType.Number, 'variable count')
    this.typeassert(this.next2, TokenType.Type, 'variable type')

    const count = Number(this.next.value)
    this.assert(Number.isSafeInteger(count) && count > 0, `Invalid variable count ${count}`)

    const node: VariableDeclaration = {
      type: 'VariableDeclaration',
      varType: this.next2.value as VarType,
      count,
      values: [],
      names: [],
      accessability: this.current.value as VariableDeclaration['accessability'],
    }

    if (this.sourcemap)
      node.loc = { ...this.current.loc }

    this.index += 3
    while (!this.eof && this.current.type === TokenType.Assign) {
      node.values.push({
        type: 'Value',
        value: this.next.value as string,
        loc: this.sourcemap ? this.next.loc : undefined,
      })
      this.index += 2
    }
    if (!this.eof && this.current.type === TokenType.Name) {
      node.names.push(this.next.value as string)
      this.index += 2
    }
    while (!this.eof && this.current.type === TokenType.Assign) {
      node.names.push(this.next.value as string)
      this.index += 2
    }

    this.scope.body.push(node)
  }

  private assert(bool: boolean, message = Messages.UnexpectedTokenIllegal) {
    if (!bool)
      this.throwUnexpectedToken(message)
  }

  private typeassert(token: Token, type: TokenType, message = Messages.UnexpectedTokenIllegal) {
    if (token.type !== type)
      this.throwUnexpectedToken(message, token.loc)
  }

  public getAST() {
    return this.parse()
  }

  private throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal, loc = this.current.loc, ...values: string[]): never {
    return this.errorHandler.throwError(
      loc.start,
      formatErrorMessage(message, values),
    )
  }
}

export function parse(src: string, options: Partial<ParseOptions> = {}) {
  return new Parser(src, options).getAST()
}
