import { RomanizeSystem } from '../types'
import pinyin from './hanzi2roman-map-pinyin.json'
import baxter from './hanzi2roman-map-baxter.json'

export function hanzi2unicodeEntry(s: string) {
  let y = ''
  for (const c of s) {
    y += 'U'
    y += c
      .charCodeAt(0)
      .toString(16)
      .toUpperCase()
  }
  return y
}

export function hanzi2pinyin(a: string, system: RomanizeSystem = 'pinyin') {
  if (system === 'unicode')
    return hanzi2unicodeEntry(a)

  const tab = ({ pinyin, baxter } as any)[system]
  let s = ''
  for (const x of a) {
    const key = x
      .charCodeAt(0)
      .toString(16)
      .toUpperCase()
    let r = tab[key]

    if (r === undefined)
      r = '_'

    s += r.split(' ')[0]
  }
  return s
}
