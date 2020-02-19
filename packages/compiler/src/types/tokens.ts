import { KeywordTokenDefinition } from '../keywords'
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
  ConditionOperator = 'ConditionOperator',
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

export interface StringTokenDefinition {
  type:
  | TokenType.Punctuations
  | TokenType.String
  | TokenType.Identifier
  value: string
}

export interface GeneralTokenDefinition {
  type:
  | TokenType.EOF
  value?: undefined
}

export type TokenDefinition =
  | NumberTokenDefinition
  | KeywordTokenDefinition
  | StringTokenDefinition
  | GeneralTokenDefinition

export type Token = TokenDefinition & {
  loc: SourceLocation
}
