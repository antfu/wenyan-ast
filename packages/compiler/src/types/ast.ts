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

export type Expression =
  | UnaryOperation
  | BinaryOperation
  | boolean
  | Identifier
  | ASTValue
  | Answer

export interface Identifier {
  type: 'Identifier'
  name: string
}

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

export interface ForInStatement extends Node {
  type: 'ForInStatement'
  body: Statement[]
  iterator: string
  collection: Identifier | number
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

export interface ImportStatement extends Node {
  type: 'ImportStatement'
  source: string
  imports: string[]
}

export interface ReturnStatement extends Node {
  type: 'ReturnStatement'
  expression?: Expression
}

export interface ContinueStatement extends Node {
  type: 'ContinueStatement'
}

export interface BreakStatement extends Node {
  type: 'BreakStatement'
}

export interface OperationStatement extends Node {
  type: 'OperationStatement'
  expression: Expression
  name?: Identifier
}

export interface FunctionCall extends Node {
  type: 'FunctionCall'
  function: Identifier
  args: (Identifier | ASTValue | Answer)[]
  resultName?: Identifier
}

export type Answer = 'Answer'

export type AST = Program

export type Statement =
  | VariableDeclaration
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForInStatement
  | FunctionCall
  | TryStatement
  | CatchStatement
  | ReturnStatement
  | OperationStatement
  | ContinueStatement
  | BreakStatement

export type ASTScope =
  | Program
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForInStatement
  | TryStatement
  | CatchStatement
