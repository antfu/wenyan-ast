import { Token, TokenType } from './types'
import { Tokenizer } from './tokenize'

export enum ASTType {
  Program,
  VariableDeclaration
}

export interface ASTNode {
  type: ASTType
  body: ASTNode[]
}

export class Parser {
  tokens: Token[]
  index: number
  ast: ASTNode
  readonly length: number

  constructor(
    public readonly source: string,
  ) {
    this.tokens = new Tokenizer(this.source).getTokens()
    this.length = this.tokens.length - 1 // ignore the EOF token
    this.index = 0
    this.ast = {
      type: ASTType.Program,
      body: [],
    }
  }

  get eof() {
    return this.index < this.length
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

  private parse(root: ASTNode) {
    while (!this.eof) {
      if (this.current.type === TokenType.Declarion) {
        this.scanDeclarion()
        continue
      }

      this.index++
    }
  }

  private scanDeclarion() {
    // TODO:
  }

  getAST() {
    return this.parse(this.ast)
  }
}
