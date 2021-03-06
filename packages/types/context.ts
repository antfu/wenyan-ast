import { Token } from './tokens'
import { Program } from './ast'

export interface MacroDefinition {
  from: RegExp
  to: string
}

export interface ModuleContext {
  name?: string
  entryPath?: string
  source: string
  expandedSource?: string
  moduleType: 'stdlib' | 'fs' | 'network' | 'context' | 'anonymous'
  type: 'main' | 'module'
  macros: MacroDefinition[]
  tokens: Token[]
  ast: Program
  compiled?: string
  imports: Record<string, ModuleContext>

  // transplie
  variableCount: number
}

export function createContext(
  source: string,
  module: ModuleContext['type'] = 'main',
  name?: string,
  moduleType: ModuleContext['moduleType'] = 'anonymous',
  entryPath?: string,
): ModuleContext {
  return {
    source,
    expandedSource: source,
    type: module,
    name,
    entryPath,
    moduleType,
    tokens: [],
    imports: {},
    macros: [],
    ast: {
      type: 'Program',
      body: [],
    },
    variableCount: 0,
  }
}
