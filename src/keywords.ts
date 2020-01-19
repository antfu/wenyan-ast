import { TokenDefine } from './types'

export const KEYWORDS_NUMBERS = '負·又零〇一二三四五六七八九十百千萬億兆京垓秭穰溝澗正載極分釐毫絲忽微纖沙塵埃渺漠'

export const KEYWORDS_ALL: Record<string, TokenDefine> = {
  吾有: { type: 'declarion', value: 'private' },
  今有: { type: 'declarion', value: 'public' },
  物之: { type: 'declarion', value: 'objectProperty' },
  有: { type: 'declarion' },

  數: { type: 'type', value: 'number' },
  列: { type: 'type', value: 'array' },
  言: { type: 'type', value: 'string' },
  術: { type: 'type', value: 'function' },
  爻: { type: 'type', value: 'bool' },
  物: { type: 'type', value: 'object' },
  元: { type: 'type', value: 'any' },

  曰: { type: 'assign' },

  書之: { type: 'builtin', value: 'print' },
  名之曰: { type: 'name' },
  施: { type: 'call', value: 'right' },
  以施: { type: 'call', value: 'left' },
  噫: { type: 'builtin', value: 'discard' },
  取: { type: 'builtin', value: 'take' },

  昔之: { type: 'reassign', value: 'part1' },
  今: { type: 'reassign', value: 'part2' },
  是矣: { type: 'reassign', value: 'part3' },
  不復存矣: { type: 'reassign', value: 'delete' },
  其: { type: 'answer' },

  乃得: { type: 'control', value: 'return' },
  乃得矣: { type: 'control', value: 'returnPrev' },
  乃歸空無: { type: 'control', value: 'returnVoid' },
  是謂: { type: 'control', value: 'bigend' },
  之術也: { type: 'control', value: 'functionEnd' },
  必先得: { type: 'control', value: 'functionArgs' },
  是術曰: { type: 'control', value: 'functionBody' },
  乃行是術曰: { type: 'control', value: 'functionBody' },
  欲行是術: { type: 'control', value: 'functionStart' },
  也: { type: 'control', value: 'end' },
  云云: { type: 'control', value: 'end' },
  凡: { type: 'control', value: 'for' },
  中之: { type: 'control', value: 'forIn' },
  恆為是: { type: 'control', value: 'whiletrue' },
  為是: { type: 'control', value: 'whileN0' },
  遍: { type: 'control', value: 'whileN1' },
  乃止: { type: 'control', value: 'break' },
  乃止是遍: { type: 'control', value: 'continue' },

  若非: { type: 'control', value: 'else' },
  若: { type: 'control', value: 'if' },
  者: { type: 'control', value: 'conj' },
  若其然者: { type: 'control', value: 'ifTrue' },
  若其不然者: { type: 'control', value: 'ifFalse' },
  或若: { type: 'control', value: 'elseif' },

  其物如是: { type: 'control', value: 'objectBody' },
  之物也: { type: 'control', value: 'objectEnd' },

  夫: { type: 'expression' },

  等於: { type: 'operator', value: '==' },
  不等於: { type: 'operator', value: '!=' },
  不大於: { type: 'operator', value: '<=' },
  不小於: { type: 'operator', value: '>=' },
  大於: { type: 'operator', value: '>' },
  小於: { type: 'operator', value: '<' },

  加: { type: 'operator', value: '+' },
  減: { type: 'operator', value: '-' },
  乘: { type: 'operator', value: '*' },
  除: { type: 'operator', value: '/' },
  中有陽乎: { type: 'operator', value: '||' },
  中無陰乎: { type: 'operator', value: '&&' },
  變: { type: 'operator', value: 'not' },
  所餘幾何: { type: 'operator', value: 'mod' },

  以: { type: 'opord', value: 'left' },
  於: { type: 'opord', value: 'right' },

  之長: { type: 'arrayOperator', value: 'len' },
  之: { type: 'arrayOperator', value: 'subs' },
  充: { type: 'arrayOperator', value: 'push' },
  銜: { type: 'arrayOperator', value: 'cat' },
  其餘: { type: 'arrayOperator', value: 'rest' },

  陰: { type: 'bool', value: 'false' },
  陽: { type: 'bool', value: 'true' },

  吾嘗觀: { type: 'import', value: 'file' },
  中: { type: 'import', value: 'in' },
  之書: { type: 'import', value: 'fileEnd' },
  方悟: { type: 'import', value: 'iden' },
  之義: { type: 'import', value: 'idenEnd' },

  嗚呼: { type: 'throw', value: 'a' },
  之禍: { type: 'throw', value: 'b' },
  姑妄行此: { type: 'try', value: 'try' },
  如事不諧: { type: 'try', value: 'catch' },
  豈: { type: 'try', value: 'catchErr0' },
  之禍歟: { type: 'try', value: 'catchErr1' },
  不知何禍歟: { type: 'try', value: 'catchAll' },
  乃作罷: { type: 'try', value: 'end' },

  或云: { type: 'macro', value: 'from' },
  蓋謂: { type: 'macro', value: 'to' },

  注曰: { type: 'comment' },
  疏曰: { type: 'comment' },
  批曰: { type: 'comment' },
}

export const KEYWORDS_MAX_LENGTH = 5

export const KEYWORDS = new Array(KEYWORDS_MAX_LENGTH)
  .fill(null)
  .map((): Record<string, TokenDefine> => ({}))

export const KEYWORDS_TEXTS = Object.keys(KEYWORDS_ALL)

KEYWORDS_TEXTS.forEach((v) => {
  KEYWORDS[v.length - 1][v] = KEYWORDS_ALL[v]
})
