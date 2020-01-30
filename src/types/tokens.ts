import { SourceLocation } from './location'

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

export interface NumberTokenDefinition {
  type: TokenType.Number
  value?: number
}

export interface GeneralTokenDefinition {
  type: TokenType
  value?: string
}

export type TokenDefinition = NumberTokenDefinition | GeneralTokenDefinition

export type Token = TokenDefinition & {
  loc: SourceLocation
  range?: [number, number]
}
