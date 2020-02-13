export type RomanizeSystem = 'none' | 'pinyin' | 'unicode' | 'baxter'

export interface SourceContext {
  source: string
  file?: string
}
