import { KeywordTokenDefinition, TokenType } from './keywords'
import { SourceLocation } from './location'

export interface NumberTokenDefinition {
  type: TokenType.Number
  value: number
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

export interface UnknownTokenDefinition {
  type: TokenType.Unknown
  value: string
}

export type TokenDefinition =
  | NumberTokenDefinition
  | KeywordTokenDefinition
  | StringTokenDefinition
  | GeneralTokenDefinition
  | UnknownTokenDefinition

export type Token = TokenDefinition & {
  loc: SourceLocation
}
