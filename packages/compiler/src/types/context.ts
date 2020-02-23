import { Token } from './tokens'
import { Program } from './ast'

export interface MacroDefinition {
  // TODO:
}

export interface ImportDefinition {
  name: string
  items: string[]
  source: 'stdlib' | 'fs' | 'network' | 'context'
}

export interface ModuleContext {
  name?: string
  entryPath?: string
  module: 'main' | 'module'
  macro: MacroDefinition[]
  tokens: Token[]
  ast: Program
  compiled?: string
  imports: ImportDefinition[]
}

export function createContext(module: ModuleContext['module'] = 'main', name?: string, entryPath?: string): ModuleContext {
  return {
    module,
    name,
    entryPath,
    tokens: [],
    imports: [],
    macro: [],
    ast: {
      type: 'Program',
      body: [],
    },
  }
}
