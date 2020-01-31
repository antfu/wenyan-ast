import { parse } from '../src/parse'
import { VarType, AST, VariableDeclaration, Accessability } from '../src/types'

describe('parse', () => {
  it('empty', () => {
    expect(parse(''))
      .toEqual(
        expect.objectContaining<AST>({
          type: 'Program',
          body: [],
        }),
      )
  })

  it('var a = 3', () => {
    expect(parse('吾有一數。曰三。名之曰「甲」。').body)
      .toEqual([
        expect.objectContaining<VariableDeclaration>({
          type: 'VariableDeclaration',
          count: 1,
          varType: VarType.Number,
          names: ['甲'],
          values: [
            expect.objectContaining({
              type: 'Value',
              value: 3,
            }),
          ],
          accessability: Accessability.private,
        }),
      ])
  })
})
