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
