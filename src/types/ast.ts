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

export type AST = Program
export type Statement = VariableDeclaration | FunctionDeclaration
export type ASTScope = Program | FunctionDeclaration
