import { SourceLocation } from './location'

export interface Node {
  loc?: SourceLocation
}

export interface Program extends Node {
  type: 'Program'
  body: Statement[]
}

export interface Statement extends Node {

}

export const enum VarType {
  Number = 'number',
  String = 'string',
  Array = 'array',
  Object = 'object',
  Boolean = 'bool',
  Auto = 'auto',
}

export interface ASTValue extends Node {
  type: 'Value'
  value: string | number | boolean
}

export interface VariableDeclaration extends Statement {
  type: 'VariableDeclaration'
  varType: VarType
  count: number
  names: string[]
  values: ASTValue[]
  accessability: 'public' | 'private'
}

export type AST = Program
