import { tokenize } from '../src/tokenize'
import { TokenType } from '../src/types'

describe('tokenize', () => {
  it('empty', () => {
    expect(tokenize('')).toEqual([{
      type: TokenType.EOF,
      loc: {
        start: {
          line: 0,
          column: 0,
          index: 0,
        },
        end: {
          line: 0,
          column: 0,
          index: 0,
        },
      },
    }])
  })

  it('declarion', () => {
    expect(tokenize('吾有一數。曰三。書之。'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Declarion, value: 'private' }),
        expect.objectContaining({ type: TokenType.Number, value: 1 }),
        expect.objectContaining({ type: TokenType.Type, value: 'number' }),
        expect.objectContaining({ type: TokenType.Punctuations, value: '。' }),
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.Number, value: 3 }),
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

  it('comment 1', () => {
    expect(tokenize('批曰『甲』'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Comment, value: '批曰『甲』' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('comment 2', () => {
    expect(tokenize('批曰「「甲」」'))
      .toEqual([
        expect.objectContaining({ type: TokenType.Comment, value: '批曰「「甲」」' }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })

  it('multi-line comment', () => {
    const comment = `批曰。「「
    甲
    乙
    丙
    丁
    」」`
    expect(tokenize(`曰「「甲」」${comment}`))
      .toEqual([
        expect.objectContaining({ type: TokenType.Assign }),
        expect.objectContaining({ type: TokenType.String, value: '甲' }),
        expect.objectContaining({ type: TokenType.Comment, value: comment }),
        expect.objectContaining({ type: TokenType.EOF }),
      ])
  })
})
