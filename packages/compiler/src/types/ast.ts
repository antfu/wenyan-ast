import { SourceLocation } from './location'

export interface Node {
  loc?: SourceLocation
}

export interface Program extends Node {
  type: 'Program'
  body: Statement[]
}

export const enum VarType {
  Number = 'number',
  String = 'string',
  Array = 'array',
  Object = 'object',
  Boolean = 'bool',
  Function = 'function',
  Auto = 'auto',
}

export interface ASTValue extends Node {
  type: 'Value'
  varType: VarType
  value: string | number | boolean
}

export interface FunctionArgument {
  name: string
  varType: VarType
}

export enum Accessability {
  public = 'public',
  private = 'private'
}

export interface VariableDeclaration extends Node {
  type: 'VariableDeclaration'
  varType: VarType
  count: number
  names: string[]
  values: ASTValue[]
  accessability: Accessability
}

export interface FunctionDeclaration extends Node {
  type: 'FunctionDeclaration'
  body: Statement[]
  args: FunctionArgument[]
  name?: string
  accessability: Accessability
}

export type UnaryOperation = {
  type: 'UnaryOperation'
  operator: 'not'
  expression: Expression
}

export type BinaryOperation = {
  type: 'BinaryOperation'
  left: Expression
  operator: '&&' | '||' | '==' | '+' | '-' | '*' | '/' | 'mod'
  right: Expression
}

export type ArrayOperation = {
  type: 'ArrayOperation'
  identifier: Identifier
} & ({
  operator: 'length'
} | {
  operator: 'item'
  argument: Identifier
})

export type Expression =
  | UnaryOperation
  | BinaryOperation
  | ArrayOperation
  | boolean
  | Identifier
  | ASTValue
  | Answer

export interface Identifier extends Node {
  type: 'Identifier'
  name: string
  declare?: boolean
}

export type AssignTarget = Identifier | undefined

export interface IfStatement extends Node {
  type: 'IfStatement'
  condition?: Expression
  body: Statement[]
  else?: IfStatement
}

export interface WhileStatement extends Node {
  type: 'WhileStatement'
  condition: Expression
  body: Statement[]
}

export interface ForRangeStatement extends Node {
  type: 'ForRangeStatement'
  body: Statement[]
  assign?: Identifier
  range: Identifier | number
}

export interface TryStatement extends Node {
  type: 'TryStatement'
  body: Statement[]
  catches: CatchStatement[]
}

export interface CatchStatement extends Node {
  type: 'CatchStatement'
  body: Statement[]
  errorType?: string
}

export interface Return extends Node {
  type: 'Return'
  expression?: Expression
}

export interface Continue extends Node {
  type: 'Continue'
}

export interface Break extends Node {
  type: 'Break'
}

export interface OperationStatement extends Node {
  type: 'OperationStatement'
  expression: Expression
  assign?: AssignTarget
}

export interface ExpressStatement extends Node {
  type: 'ExpressStatement'
  expression: Expression
  assign?: AssignTarget
}

export interface ReassignStatement extends Node {
  type: 'ReassignStatement'
  value: Expression
  assign?: AssignTarget
}

export interface Print extends Node {
  type: 'Print'
}

export interface Comment extends Node {
  type: 'Comment'
  value: string
}

export interface ImportStatement extends Node {
  type: 'ImportStatement'
  name: string
  imports: string[]
}

export interface MacroStatement extends Node {
  type: 'MacroStatement'
  from: string
  to: string
}

export interface FunctionCall extends Node {
  type: 'FunctionCall'
  function: Identifier
  args: (Identifier | ASTValue | Answer)[]
  assign?: AssignTarget
}

export type Answer = 'Answer'

export type AST = Program

export type Statement =
  | Break
  | CatchStatement
  | Comment
  | Continue
  | ExpressStatement
  | ForRangeStatement
  | FunctionCall
  | FunctionDeclaration
  | IfStatement
  | ImportStatement
  | MacroStatement
  | OperationStatement
  | Print
  | ReassignStatement
  | Return
  | TryStatement
  | VariableDeclaration
  | WhileStatement

export type ASTScope =
  | Program
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForRangeStatement
  | TryStatement
  | CatchStatement
