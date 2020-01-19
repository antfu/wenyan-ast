export const Character = {
  fromCodePoint(cp: number): string {
    return (cp < 0x10000) ? String.fromCharCode(cp)
      : String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10))
      + String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023))
  },

  isWhiteSpace(cp: number): boolean {
    return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0)
      || (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].includes(cp))
  },

  isLineTerminator(cp: number): boolean {
    return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029)
  },
}
