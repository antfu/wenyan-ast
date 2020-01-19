import { KEYWORDS_MAX_LENGTH, KEYWORDS, KEYWORDS_NUMBERS } from './keywords'
import { ErrorHandler } from './error-handler'
import { Messages } from './messages'
import { Character } from './character'
import { Token, TokenDefine, TokenType } from './types'

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
    options: Partial<TokenizerOptions>,
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
        this.pushToken({ type: 'punctuations', value: char }, {
          start: this.index - 1,
        })
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

      this.scanKeywords()
    }

    // EOF
    this.pushToken({ type: 'EOF' })

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
        this.index += len
        this.pushToken(keywords[id], {
          start: this.index - 1,
        })
        return
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
      this.pushToken({ type: 'number', value: chars })
  }

  public scanBracket() {
    let curly = 1
    let chars = ''
    let type: TokenType = 'identifier'
    let bracketType: 'single' | 'double' = 'single'

    const start = this.index
    const char = this.source[this.index]
    const next = this.source[this.index + 1]

    if (char === '『') {
      type = 'string'
      bracketType = 'double'
      curly = 2
      this.index += 1
    }
    else if (char === '「' && next === '「') {
      type = 'string'
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
            if (type === 'string')
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

    this.pushToken({ type, value: chars }, { start })
  }

  /**
   * Return current position
   */
  private getPosition() {
    return {
      lineNumber: this.lineNumber,
      lineStart: this.lineStart,
      start: this.index,
      end: this.index,
    }
  }

  private pushToken(define: TokenDefine, override: Partial<Token> = {}) {
    this.tokens.push({
      ...define,
      ...this.getPosition(),
      ...override,
    })
  }

  public throwUnexpectedToken(message = Messages.UnexpectedTokenIllegal): never {
    return this.errorHandler.throwError(
      this.index,
      this.lineNumber,
      this.index - this.lineStart + 1,
      message,
    )
  }

  private tolerateUnexpectedToken(message = Messages.UnexpectedTokenIllegal) {
    this.errorHandler.tolerateError(
      this.index,
      this.lineNumber,
      this.index - this.lineStart + 1,
      message,
    )
  }
}

export function tokenize(src: string, options: Partial<TokenizerOptions> = {}) {
  return new Tokenizer(src, options).getTokens()
}
