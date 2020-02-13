import { SourceLocation } from './location'
import { Token } from './tokens'

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

export type UnaryCondition = {
  type: 'UnaryCondition'
  operator: 'not'
  union: Condition
}

export type BinaryCondition = {
  type: 'BinaryCondition'
  left: Condition
  operator: '&&' | '||'
  right: Condition
}

export type Condition =
  | UnaryCondition
  | BinaryCondition
  | boolean
  | Identifier
  | ASTValue
  | 'ans'

export interface Identifier {
  type: 'Identifier'
  name: string
}

export interface IfStatement extends Node {
  type: 'IfStatement'
  condition?: Condition
  body: Statement[]
  else?: IfStatement
}

export interface WhileStatement extends Node {
  type: 'WhileStatement'
  condition: Condition
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

export interface FunctionCall extends Node {
  type: 'FunctionCall'
  function: Identifier
  args: Identifier[]
}

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

export type ASTScope =
  | Program
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForInStatement
  | TryStatement
  | CatchStatement
