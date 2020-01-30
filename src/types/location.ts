export interface SourceLocation {
  source?: string
  start: Position
  end: Position
}

export interface Position {
  line: number
  column: number
  index: number
}
