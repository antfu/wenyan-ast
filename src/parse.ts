import { Token, TokenType } from './types'
import { Tokenizer } from './tokenize'

export enum ASTType {
  Program,
  VariableDeclaration,
  Value,
}

export enum VarType {
  Number = 'number',
  String = 'string',
  Array = 'array',
  Object = 'object',
  Boolean = 'bool',
  Auto = 'auto',
}

export interface ASTProgram {
  type: ASTType.Program
  body: ASTNode[]
}

export interface ASTValue {
  type: ASTType.Value
  value: string | number | boolean
}

export interface ASTVariableDeclaration {
  type: ASTType.VariableDeclaration
  varType: VarType
  count: number
  name: string[]
  values: ASTValue[]
  accessability: 'public' | 'private'
}

export type ASTNode =
  | ASTProgram
  | ASTVariableDeclaration

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
    return this.index <= this.length
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
    return root
  }

  private scanDeclarion() {
    // TODO:
  }

  getAST() {
    return this.parse(this.ast)
  }
}

export function parse(src: string) {
  return new Parser(src).getAST()
}
