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

  it('print', () => {
    expect(tokenize('數書之'))
      .toEqual([
        expect.objectContaining({ type: 'type', value: 'number' }),
        expect.objectContaining({ type: 'builtin', value: 'print' }),
        expect.objectContaining({ type: 'EOF' }),
      ])
  })

  /*
  it('declarion', () => {
    expect(tokenize('吾有一數。'))
      .toEqual([
        { type: 'declarion', value: 'private' },
        { type: 'number', value: '1' },
        { type: 'type', value: 'number' },
        { type: 'text', value: '。' },
      ])
  })

  it('assign', () => {
    expect(tokenize('曰三。'))
      .toEqual([
        { type: 'assign' },
        { type: 'number', value: 3 },
        { type: 'text', value: '。' },
      ])
  })

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
