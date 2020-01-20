import { KEYWORDS_MAX_LENGTH, KEYWORDS, KEYWORDS_NUMBERS } from './keywords'
import { ErrorHandler } from './error-handler'
import { Messages } from './messages'
import { Character } from './character'
import { Token, TokenDefine, TokenType, Position } from './types'
import { formatErrorMessage } from './utils'
import { hanzi2numstr } from './converts/hanzi2num'

export interface TokenizerOptions {
  tolerant: boolean
}

export class Tokenizer {
  readonly options: TokenizerOptions

  private readonly length: number
  errorHandler: ErrorHandler
  index: number
  lineNumber: number
  lineStart: number
  curlyStack: string[]
  tokens: Token[] = []

  constructor(
    public readonly source: string,
    options: Partial<TokenizerOptions> = {},
  ) {
    const {
      tolerant = false,
    } = options

    this.options = { tolerant }

    this.errorHandler = new ErrorHandler()
    this.errorHandler.tolerant = tolerant

    this.length = source.length
    this.index = 0
    this.lineNumber = (source.length > 0) ? 1 : 0
    this.lineStart = 0
    this.curlyStack = []
  }

  getNextToken(): Token {
    throw new Error('as')
  }

  getTokens() {
    this.tokens = []

    let last = this.index - 1

    while (!this.eof()) {
      if (last === this.index)
        this.throwUnexpectedToken()
      last = this.index

      const ch = this.source.charCodeAt(this.index)
      const char = this.source[this.index]

      if (Character.isWhiteSpace(ch)) {
        this.index++
        continue
      }

      if (Character.isLineTerminator(ch)) {
        this.newLine()
        continue
      }

      if (Character.isPunctuation(ch)) {
        this.index++
        const start = this.getPosition(-1)
        this.pushToken({ type: TokenType.Punctuations, value: char }, start)
        continue
      }

      if (KEYWORDS_NUMBERS.includes(char)) {
        this.scanNumber()
        continue
      }

      if (Character.isBracketStart(ch)) {
        this.scanBracket()
        continue
      }

      // TODO: comments

      if (!this.scanKeywords())
        this.throwUnexpectedToken(Messages.UnexpectedToken, char)
    }

    // EOF
    this.pushToken({ type: TokenType.EOF })

    return this.tokens
  }

  public eof() {
    return this.index >= this.length
  }

  public scanKeywords() {
    for (let len = KEYWORDS_MAX_LENGTH; len > 0; len--) {
      const keywords = KEYWORDS[len - 1]

      const id = this.source.slice(this.index, this.index + len)

      if (keywords[id]) {
        const end = this.getPosition(len)
        this.index += len
        this.pushToken(keywords[id], undefined, end)
        return true
      }
    }
  }

  private newLine() {
    const ch = this.source.charCodeAt(this.index)
    const next = this.source.charCodeAt(this.index + 1)

    this.index++

    if (ch === 0x0D && next === 0x0A) // \n\t
      this.index++

    this.lineNumber++
    this.lineStart = this.index
  }

  public scanNumber() {
    let chars = ''
    while (true) {
      const char = this.source[this.index]
      if (!KEYWORDS_NUMBERS.includes(char))
        break

      chars += char
      this.index++
    }
    if (chars)
      this.pushToken({ type: TokenType.Number, value: hanzi2numstr(chars) || undefined })
  }

  public scanBracket() {
    let curly = 1
    let chars = ''
    let type: TokenType = TokenType.Identifier
    let bracketType: 'single' | 'double' = 'single'

    const start = this.getPosition()
    const char = this.source[this.index]
    const next = this.source[this.index + 1]

    if (char === '『') {
      type = TokenType.String
      bracketType = 'double'
      curly = 2
      this.index += 1
    }
    else if (char === '「' && next === '「') {
      type = TokenType.String
      curly = 2
      this.index += 2
    }
    else {
      curly = 1
      this.index += 1
    }

    while (!this.eof()) {
      const char = this.source[this.index]
      const ch = this.source.charCodeAt(this.index)

      if (char === '\\') {
        chars += this.source[this.index + 1]
        this.index += 2
        continue
      }
      if (Character.isLineTerminator(ch)) {
        this.newLine()
        continue
      }

      if (bracketType === 'single') {
        if (char === '「') {
          curly += 1
        }
        else if (char === '」') {
          curly -= 1
          if (curly <= 0) {
            if (type === TokenType.String)
              chars = chars.slice(0, -1)
            this.index += 1
            break
          }
        }
      }
      else {
        if (char === '『') {
          curly += 2
        }
        else if (char === '』') {
          curly -= 2
          if (curly <= 0) {
            this.index += 2
            break
          }
        }
      }

      chars += char

      this.index++
    }

    if (curly < 0)
      this.throwUnexpectedToken()

    this.pushToken({ type, value: chars }, start)
  }

  /**
   * Return current position
   */
  private getPosition(offest = 0): Position {
    const index = this.index + offest
    return {
      line: this.lineNumber,
      index,
      char: index - this.lineStart,
    }
  }

  private pushToken(define: TokenDefine, start?: Position, end?: Position) {
    this.tokens.push({
      ...define,
      start: start || this.getPosition(),
      end: end || this.getPosition(),
    })
  }

  public throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal, ...values: string[]): never {
    return this.errorHandler.throwError(
      this.index,
      this.lineNumber,
      this.index - this.lineStart + 1,
      formatErrorMessage(message, values),
    )
  }

  private tolerateUnexpectedToken(message = Messages.UnexpectedTokenIllegal, ...values: string[]) {
    this.errorHandler.tolerateError(
      this.index,
      this.lineNumber,
      this.index - this.lineStart + 1,
      formatErrorMessage(message, values),
    )
  }
}

export function tokenize(src: string, options: Partial<TokenizerOptions> = {}) {
  return new Tokenizer(src, options).getTokens()
}
