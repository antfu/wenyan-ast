export type TokenType =
  | 'EOF'
  | 'declarion'
  | 'type'
  | 'number'
  | 'assign'
  | 'control'
  | 'text'
  | 'operator'
  | 'builtin'
  | 'punctuations'
  | 'name'
  | 'bool'
  | 'call'
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
