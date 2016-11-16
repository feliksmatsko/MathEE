import Token = require('./token');
import Lexer = require('./lexer');

class Parser {
    lexer: Lexer;
    T: Token;

    constructor() {
        this.lexer = new Lexer();
        this.T = new Token();
    }

    matchOp(token, op) {
        return (typeof token !== 'undefined') &&
            token.type === this.T.Operator &&
            token.value === op;
    }

    // ArgumentList := Expression |
    //                 Expression ',' ArgumentList
    parseArgumentList() {
        var token, expr, args = [];

        while (true) {
            expr = this.parseExpression();
            if (typeof expr === 'undefined') {
                // TODO maybe throw exception?
                break;
            }
            args.push(expr);
            token = this.lexer.peek();
            if (!this.matchOp(token, ',')) {
                break;
            }
            this.lexer.next();
        }
        return args;
    }

    // FunctionCall ::= Identifier '(' ')' ||
    //                  Identifier '(' ArgumentList ')'
    parseFunctionCall(name) {
        var token, args = [];

        token = this.lexer.next();
        if (!this.matchOp(token, '(')) {
            throw new SyntaxError('Expecting ( in a function call "' + name + '"');
        }

        token = this.lexer.peek();
        if (!this.matchOp(token, ')')) {
            args = this.parseArgumentList();
        }

        token = this.lexer.next();
        if (!this.matchOp(token, ')')) {
            throw new SyntaxError('Expecting ) in a function call "' + name + '"');
        }

        var percentage = false;
        if (this.matchOp(this.lexer.peek(), '%')) {
            this.lexer.next();
            percentage = true;
        }

        return {
            FunctionCall: {
                'name': name,
                'args': args
            },
            percentage: percentage
        };
    }

    // Primary ::= Identifier |
    //             Number |
    //             '(' Assignment ')' |
    //             FunctionCall
    parsePrimary(): any {
        var token, expr;

        token = this.lexer.peek();

        if (typeof token === 'undefined') {
            throw new SyntaxError('Unexpected termination of expression');
        }

        if (token.type === this.T.Identifier) {
            token = this.lexer.next();
            if (this.matchOp(this.lexer.peek(), '(')) {
                return this.parseFunctionCall(token.value);
            } else {
                var percentage = false;
                if (this.matchOp(this.lexer.peek(), '%')) {
                    this.lexer.next();
                    percentage = true;
                }
                return {
                    Identifier: token.value,
                    percentage: percentage
                };
            }
        }

        if (token.type === this.T.Number) {
            token = this.lexer.next();
            if (this.matchOp(this.lexer.peek(), '%')) {
                this.lexer.next();
                return {
                    Number: token.value,
                    percentage: true
                };
            } else {
                return {
                    'Number': token.value
                };
            }
        }

        if (this.matchOp(token, '(')) {
            this.lexer.next();
            expr = this.parseAssignment();
            token = this.lexer.next();
            if (!this.matchOp(token, ')')) {
                throw new SyntaxError('Expecting )');
            }
            return {
                'Expression': expr
            };
        }

        throw new SyntaxError('Parse error, can not process token ' + token.value);
    }

    // Unary ::= Primary |
    //           '-' Unary
    parseUnary() {
        var token, expr;

        token = this.lexer.peek();
        if (this.matchOp(token, '-') || this.matchOp(token, '+')) {
            token = this.lexer.next();
            expr = this.parseUnary();
            return {
                'Unary': {
                    operator: token.value,
                    expression: expr
                }
            };
        }

        return this.parsePrimary();
    }

    parsePower() {
        var expr, token;

        expr = this.parseUnary();
        token = this.lexer.peek();

        if (this.matchOp(token, '%')) {
            if (expr.percentage) {
                throw new SyntaxError('Unexpected token %');
            }
            this.lexer.next();
            token = this.lexer.peek();
            expr.percentage = true;
        }

        while (this.matchOp(token, '^')) {
            token = this.lexer.next();
            expr = {
                'Binary': {
                    operator: token.value,
                    left: expr,
                    right: this.parseUnary()
                }
            };
            token = this.lexer.peek();
            if (this.matchOp(token, '%')) {
                expr.Binary.right.percentage = true;
                token = this.lexer.next();
            }
        }
        return expr;
    }

    // Multiplicative ::= Unary |
    //                    Multiplicative '*' Unary |
    //                    Multiplicative '/' Unary
    parseMultiplicative() {
        var expr, token;

        expr = this.parsePower();
        token = this.lexer.peek();
        while (this.matchOp(token, '*') || this.matchOp(token, '/')) {
            token = this.lexer.next();
            expr = {
                'Binary': {
                    operator: token.value,
                    left: expr,
                    right: this.parsePower()
                }
            };
            token = this.lexer.peek();
            if (this.matchOp(token, '%')) {
                expr.Binary.right.percentage = true;
                token = this.lexer.next();
            }
        }
        return expr;
    }

    // Additive ::= Multiplicative |
    //              Additive '+' Multiplicative |
    //              Additive '-' Multiplicative
    parseAdditive() {
        var expr, token;

        expr = this.parseMultiplicative();
        token = this.lexer.peek();
        while (this.matchOp(token, '+') || this.matchOp(token, '-')) {
            token = this.lexer.next();
            expr = {
                'Binary': {
                    operator: token.value,
                    left: expr,
                    right: this.parseMultiplicative()
                }
            };
            token = this.lexer.peek();
            if (this.matchOp(token, '%')) {
                expr.Binary.right.percentage = true;
                this.lexer.next();
                token = this.lexer.peek();
            }
        }
        return expr;
    }

    // Assignment ::= Identifier '=' Assignment |
    //                Additive
    parseAssignment() {
        var token, expr;

        expr = this.parseAdditive();

        if (typeof expr !== 'undefined' && expr.Identifier) {
            token = this.lexer.peek();
            // if (matchOp(token, '=')) {
            //     lexer.next();
            //     return {
            //         'Assignment': {
            //             name: expr,
            //             value: parseAssignment()
            //         }
            //     };
            // }
            return expr;
        }

        return expr;
    }

    // Expression ::= Assignment
    parseExpression() {
        return this.parseAssignment();
    }

    parse(expression) {
        var expr, token;

        this.lexer.reset(expression);
        expr = this.parseExpression();

        token = this.lexer.next();
        if (typeof token !== 'undefined') {
            throw new SyntaxError('Unexpected token ' + token.value);
        }
        return {
            'Expression': expr
        };
    }
}

export = Parser;