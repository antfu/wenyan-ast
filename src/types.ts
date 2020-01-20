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

export interface TokenDefine {
  type: TokenType
  value?: string
}

export interface Token extends TokenDefine {
  start: Position
  end: Position
}

export interface Position {
  line: number
  char: number
  index: number
}
