export type TokenType =
  | 'EOF'
  | 'declarion'
  | 'type'
  | 'number'
  | 'assign'
  | 'control'
  | 'operator'
  | 'builtin'
  | 'punctuations'
  | 'name'
  | 'bool'
  | 'call'
  | 'string'
  | 'reassign'
  | 'answer'
  | 'control'
  | 'expression'
  | 'import'
  | 'throw'
  | 'try'
  | 'macro'
  | 'comment'
  | 'opord'
  | 'arrayOperator'
  | 'identifier'

export interface TokenDefine {
  type: TokenType
  value?: string
}

export interface Token extends TokenDefine {
  lineNumber: number
  lineStart: number
  start: number
  end: number
}
