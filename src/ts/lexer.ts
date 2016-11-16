import Token = require('./token');

class Lexer {
    expression: string;
    exprLength: number;
    index: number;
    marker: number;
    T: Token;

    constructor() {
        this.expression = '';
        this.exprLength = 0;
        this.index = 0;
        this.marker = 0;
        this.T = new Token();
    }

    peekNextChar() {
        var idx = this.index;
        return ((idx < this.exprLength) ? this.expression.charAt(idx) : '\x00');
    }

    getNextChar() {
        var ch = '\x00',
            idx = this.index;
        if (idx < this.exprLength) {
            ch = this.expression.charAt(idx);
            this.index += 1;
        }
        return ch;
    }

    isWhiteSpace(ch) {
        return (ch === '\u0009') || (ch === ' ') || (ch === '\u00A0');
    }

    isLetter(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }

    isDecimalDigit(ch) {
        return (ch >= '0') && (ch <= '9');
    }

    createToken(type, value) {
        return {
            type: type,
            value: value,
            start: this.marker,
            end: this.index - 1
        };
    }

    skipSpaces() {
        var ch;

        while (this.index < this.exprLength) {
            ch = this.peekNextChar();
            if (!this.isWhiteSpace(ch)) {
                break;
            }
            this.getNextChar();
        }
    }

    scanOperator() {
        var ch = this.peekNextChar();
        if ('+-*/()^%=;,'.indexOf(ch) >= 0) {
            return this.createToken(this.T.Operator, this.getNextChar());
        }
        return undefined;
    }

    isIdentifierStart(ch) {
        return (ch === '_') || (ch === '#') || this.isLetter(ch);
    }

    isIdentifierPart(ch) {
        return this.isIdentifierStart(ch) || this.isDecimalDigit(ch);
    }

    scanIdentifier() {
        var ch, id;

        ch = this.peekNextChar();
        if (!this.isIdentifierStart(ch)) {
            return undefined;
        }

        id = this.getNextChar();
        while (true) {
            ch = this.peekNextChar();
            if (!this.isIdentifierPart(ch)) {
                break;
            }
            id += this.getNextChar();
        }

        return this.createToken(this.T.Identifier, id);
    }

    scanNumber() {
        var ch, number;

        ch = this.peekNextChar();
        if (!this.isDecimalDigit(ch) && (ch !== '.')) {
            return undefined;
        }

        number = '';
        if (ch !== '.') {
            number = this.getNextChar();
            while (true) {
                ch = this.peekNextChar();
                if (!this.isDecimalDigit(ch)) {
                    break;
                }
                number += this.getNextChar();
            }
        }

        if (ch === '.') {
            number += this.getNextChar();
            while (true) {
                ch = this.peekNextChar();
                if (!this.isDecimalDigit(ch)) {
                    break;
                }
                number += this.getNextChar();
            }
        }

        if (ch === 'e' || ch === 'E') {
            number += this.getNextChar();
            ch = this.peekNextChar();
            if (ch === '+' || ch === '-' || this.isDecimalDigit(ch)) {
                number += this.getNextChar();
                while (true) {
                    ch = this.peekNextChar();
                    if (!this.isDecimalDigit(ch)) {
                        break;
                    }
                    number += this.getNextChar();
                }
            } else {
                ch = 'character ' + ch;
                if (this.index >= this.exprLength) {
                    ch = '<end>';
                }
                throw new SyntaxError('Unexpected ' + ch + ' after the exponent sign');
            }
        }

        if (number === '.') {
            throw new SyntaxError('Expecting decimal digits after the dot sign');
        }

        return this.createToken(this.T.Number, number);
    }

    reset(str) {
        this.expression = str;
        this.exprLength = str.length;
        this.index = 0;
    }

    next() {
        var token;

        this.skipSpaces();
        if (this.index >= this.exprLength) {
            return undefined;
        }

        this.marker = this.index;

        token = this.scanNumber();
        if (typeof token !== 'undefined') {
            return token;
        }

        token = this.scanOperator();
        if (typeof token !== 'undefined') {
            return token;
        }

        token = this.scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }


        throw new SyntaxError('Unknown token from character ' + this.peekNextChar());
    }

    peek() {
        var token, idx;

        idx = this.index;
        try {
            token = this.next();
            delete token.start;
            delete token.end;
        } catch (e) {
            token = undefined;
        }
        this.index = idx;

        return token;
    }
}

export = Lexer;