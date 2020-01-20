import { tokenize } from '../src/tokenize'
import { TokenType } from '../src/types'

describe('should', () => {
  it('empty', () => {
    expect(tokenize('')).toEqual([{
      type: TokenType.EOF,
      start: {
        line: 0,
        char: 0,
        index: 0,
      },
      end: {
        line: 0,
        char: 0,
        index: 0,
      },
    }])
  })

  it('declarion', () => {
    expect(tokenize('吾有一數。曰三。書之。'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Declarion, value: 'private' }),
        expect.objectContaining({ type: TokenType.Number, value: '1' }),
        expect.objectContaining({ type: TokenType.Type, value: 'number' }),
        expect.objectContaining({ type: TokenType.Punctuations, value: '。' }),
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.Number, value: '3' }),
        expect.objectContaining({ type: TokenType.Punctuations, value: '。' }),
        expect.objectContaining({ type: TokenType.Builtin, value: 'print' }),
        expect.objectContaining({ type: TokenType.Punctuations, value: '。' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('naming', () => {
    expect(tokenize('名之曰「甲」。'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Name }),
        expect.objectContaining({ type: TokenType.Identifier, value: '甲' }),
        expect.objectContaining({ type: TokenType.Punctuations, value: '。' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('string', () => {
    expect(tokenize('曰「「甲」」'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.String, value: '甲' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('nested string', () => {
    expect(tokenize('曰「「「「甲」」」」'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.String, value: '「「甲」」' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('nested string', () => {
    expect(tokenize('曰『甲』'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.String, value: '甲' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('nested string', () => {
    expect(tokenize('曰「「甲』」」'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.String, value: '甲』' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })
})
