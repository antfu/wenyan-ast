export enum TokenType {
  EOF,
  Answer,
  ArrayOperator,
  Assign,
  Bool,
  Builtin,
  Call,
  Comment,
  Control,
  Declarion,
  Expression,
  Identifier,
  Import,
  Macro,
  Name,
  Number,
  Operator,
  OpOrd,
  Punctuations,
  Reassign,
  String,
  Throw,
  Try,
  Type,
  PropertyDeclarion
}

export type TokenDefine = {
  type: TokenType.Number
  value?: number
} | {
  type: TokenType
  value?: string
}

export type Token = TokenDefine & {
  start: Position
  end: Position
}

export interface Position {
  line: number
  char: number
  index: number
}

export type RomanizeSystem = 'none' | 'pinyin' | 'unicode' | 'baxter'
