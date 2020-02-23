import { Token } from './tokens'
import { Program } from './ast'

export interface MacroDefinition {
  from: string
  to: string
}

export interface ImportDefinition {
  name: string
  items: string[]
  source: 'stdlib' | 'fs' | 'network' | 'context'
}

export interface ModuleContext {
  name?: string
  entryPath?: string
  source: string
  expandedSource?: string
  module: 'main' | 'module'
  macros: MacroDefinition[]
  tokens: Token[]
  ast: Program
  compiled?: string
  imports: ImportDefinition[]
}

export function createContext(source: string, module: ModuleContext['module'] = 'main', name?: string, entryPath?: string): ModuleContext {
  return {
    source,
    expandedSource: source,
    module,
    name,
    entryPath,
    tokens: [],
    imports: [],
    macros: [],
    ast: {
      type: 'Program',
      body: [],
    },
  }
}
