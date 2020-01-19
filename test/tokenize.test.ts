import { tokenize } from '../src/tokenize'

describe('should', () => {
  it('empty', () => {
    expect(tokenize('')).toEqual([{
      type: 'EOF',
      lineNumber: 0,
      lineStart: 0,
      start: 0,
      end: 0,
    }])
  })

  it('declarion', () => {
    expect(tokenize('吾有一數。曰三。書之。'))
      .toEqual([
        expect.objectContaining({ type: 'declarion', value: 'private' }),
        expect.objectContaining({ type: 'number', value: '一' }),
        expect.objectContaining({ type: 'type', value: 'number' }),
        expect.objectContaining({ type: 'punctuations', value: '。' }),
        expect.objectContaining({ type: 'assign' }),
        expect.objectContaining({ type: 'number', value: '三' }),
        expect.objectContaining({ type: 'punctuations', value: '。' }),
        expect.objectContaining({ type: 'builtin', value: 'print' }),
        expect.objectContaining({ type: 'punctuations', value: '。' }),
        expect.objectContaining({ type: 'EOF' }),
      ])
  })

  /*
  it('naming', () => {
    expect(tokenize('名之曰「甲」。'))
    .toEqual([
      { type: 'name' },
      { type: 'identifier', value: '甲' },
      { type: 'text', value: '。' },
    ])
  })
  */
})
