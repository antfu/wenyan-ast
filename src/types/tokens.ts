import { SourceLocation } from './location'

export enum TokenType {
  EOF = 'EOF',
  Answer = 'Answer',
  ArrayOperator = 'ArrayOperator',
  Assign = 'Assign',
  Bool = 'Bool',
  Builtin = 'Builtin',
  Call = 'Call',
  Comment = 'Comment',
  Control = 'Control',
  Declarion = 'Declarion',
  Expression = 'Expression',
  Identifier = 'Identifier',
  Import = 'Import',
  Macro = 'Macro',
  Name = 'Name',
  Number = 'Number',
  Operator = 'Operator',
  OpOrd = 'OpOrd',
  Punctuations = 'Punctuations',
  Reassign = 'Reassign',
  String = 'String',
  Throw = 'Throw',
  Try = 'Try',
  Type = 'Type',
  PropertyDeclarion = 'PropertyDeclarion',
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
}
