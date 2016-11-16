import Parser = require('./parser');
import Context = require('./context');
import Expression = require('./expression');

function Evaluator(ctx) {

    var parser = new Parser(),
        context = new Context();

    if (typeof ctx !== 'undefined' && ctx !== null) {
        context.Constants = ctx.constants ? ctx.constants : context.Constants;
        context.Functions = ctx.functions ? ctx.functions : context.Functions;
        if (ctx.variables) {
            var variables, variable, expr;
            variables = Object.keys(ctx.variables);
            for (var i = 0; i < variables.length; i++) {
                variable = variables[i];
                expr = ctx.variables[variable];
                addVariable(variable, expr);
            }
        }
    }

    function checkOnInfinity(number) {
        if (number === Infinity) {
            throw new SyntaxError('Result is not in range of valid numbers');
        } else {
            return number;
        }
    }

    function exec(node, isPartOfBinaryOperation, counter) {
        counter++;
        if (counter > 99) {
            throw new SyntaxError('Loopback expression');
        }

        var left, right, expr, args, i;

        if (node.hasOwnProperty('Expression')) {
            if (!isPartOfBinaryOperation && node.percentage) {
                return exec(node.Expression, false, counter) * 0.01;
            } else {
                return exec(node.Expression, false, counter);
            }
        }

        if (node.hasOwnProperty('Number')) {
            var parsedNumber = parseFloat(node.Number);
            if (!isPartOfBinaryOperation && node.percentage) {
                return parsedNumber * 0.01;
            } else {
                return parsedNumber;
            }
        }

        if (node.hasOwnProperty('Binary')) {
            node = node.Binary;
            left = exec(node.left, true, counter);
            right = exec(node.right, true, counter);
            if (node.left.percentage) {
                if (node.operator === '^') {
                    throw new SyntaxError('Malformed expression');
                } else {
                    left = left * 0.01;
                }
            }
            switch (node.operator) {
                case '+':
                    if (node.right.percentage) {
                        right = left * right * 0.01;
                    }
                    return checkOnInfinity(left + right);
                case '-':
                    if (node.right.percentage) {
                        right = left * right * 0.01;
                    }
                    return checkOnInfinity(left - right);
                case '*':
                    if (node.right.percentage) {
                        right = right * 0.01;
                    }
                    return checkOnInfinity(left * right);
                case '/':
                    if (node.right.percentage) {
                        right = right * 0.01;
                    }
                    if (right === 0) {
                        throw new SyntaxError('Division by zero');
                    }
                    return checkOnInfinity(left / right);
                case '^':
                    if (context.Functions.hasOwnProperty('pow')) {
                        if (node.right.percentage) {
                            throw new SyntaxError('Malformed expression');
                        }
                        return checkOnInfinity(context.Functions['pow'](left, right));
                    } else {
                        throw new SyntaxError('Unknown function pow');
                    }
                default:
                    throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Unary')) {
            node = node.Unary;
            expr = exec(node.expression, false, counter);
            switch (node.operator) {
                case '+':
                    return expr;
                case '-':
                    return -expr;
                default:
                    throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Identifier')) {
            var ratio = 1;
            if (!isPartOfBinaryOperation && node.percentage) {
                ratio = 0.01;
            }
            if (context.Constants.hasOwnProperty(node.Identifier)) {
                return context.Constants[node.Identifier] * ratio;
            }
            if (context.Variables.hasOwnProperty(node.Identifier)) {
                var variable = context.Variables[node.Identifier];
                if (variable.tree) {
                    return exec(variable.tree, false, counter) * ratio;
                } else {
                    throw new SyntaxError(variable.err.message);
                }
            }
            throw new SyntaxError('Unknown identifier');
        }

        // if (node.hasOwnProperty('Assignment')) {
        //     right = exec(node.Assignment.value);
        //     context.Variables[node.Assignment.name.Identifier] = right;
        //     return right;
        // }

        if (node.hasOwnProperty('FunctionCall')) {
            expr = node.FunctionCall;
            if (context.Functions.hasOwnProperty(expr.name.toLowerCase())) {
                args = [];
                for (i = 0; i < expr.args.length; i += 1) {
                    args.push(exec(expr.args[i], false, counter));
                }
                var result = context.Functions[expr.name.toLowerCase()].apply(null, args);
                if (!isPartOfBinaryOperation && node.percentage) {
                    result = result * 0.01;
                }
                return checkOnInfinity(result);
            }
            throw new SyntaxError('Unknown function ' + expr.name);
        }

        throw new SyntaxError('Unknown syntax node');
    }

    function parse(expr) {
        var result = {
            expr: expr,
            tree: undefined,
            err: undefined
        };
        try {
            result.tree = parser.parse(expr.toString());
        } catch (err) {
            result.err = err;
        }
        return result;
    }

    function isValidVariable(variable) {
        return typeof variable !== 'undefined' && variable !== null && variable.length > 0;
    }

    function processTree(tree) {
        var value = null,
            err = null;
        try {
            value = exec(tree, false, 0);
        } catch (error) {
            err = error;
        }
        return err == null ? value : err;
    }

    /**
     * @desc add variable to the context (return false if exist)
     * @param {String} variable - name of variable
     * @param {String} expression - math expression
     * @return {Boolean} - success or failure
     */
    function addVariable(variable, expression) {
        if (context.Variables.hasOwnProperty(variable)) { return false; }
        return updateVariable(variable, expression);
    }

    /**
     * @desc check if variable exists in the context
     * @param {String} variable - name of variable
     * @return {Boolean} - exist or not exist
     */
    function isVariableInContext(variable) {
        return !!context.Variables[variable];
    }

    /**
     * @desc update variable in the context
     * @param {String} variable - name of variable
     * @param {String} expression - math expression
     * @return {Boolean} - success or failure
     */
    function updateVariable(variable, expression) {
        if (!isValidVariable(variable)) { return false; }
        variable = variable.toString();
        context.Variables[variable] = new Expression(parse(expression));
        return true;
    }

    /**
     * @desc evaluate and return value of variable
     * @param {String} variable - name of variable
     * @return {Number} - value of variable
     * @return {Error} - error object
     */
    function getValueOfVariable(variable) {
        if (!context.Variables.hasOwnProperty(variable)) {
            return new Error('Variable doesn\'t exist');
        }
        var item = context.Variables[variable];
        return item.err ? item.err : processTree(item.tree);
    }

    /**
     * @desc evaluate and return value of variable or custom error message
     * @param {String} variable - name of variable
     * @param {String} errorValue - value that will be returned if error
     * @return {Number} - value of variable
     * @return {Any} - return errorValue if result of expression is error
     */
    function getValueOrError(variable, errorValue = 'Error') {
        var result = getValueOfVariable(variable);
        if (result instanceof Error) { return errorValue; }
        return result;
    }

    /**
     * @desc returns original expression of variable or error object
     * @param {String} variable - name of variable
     * @return {string} - original math expression of variable
     * @return {Error} - error object if variable doesn't exist in scope
     */
    function getVariableExpression(variable) {
        if (!context.Variables.hasOwnProperty(variable)) {
            return new Error('Variable doesn\'t exist');
        }
        var item = context.Variables[variable];
        return item.expr.toString();
    }

    /**
     * @desc return array of variables available in the context
     * @return {Array} - list of variables' names
     */
    function getAvailableVariables() {
        return Object.keys(context.Variables);
    }

    /**
     * @desc remove variable from the context
     * @param {String} variable - name of variable
     */
    function removeVariable(variable) {
        delete context.Variables[variable];
    }

    /**
     * @desc remove all variables from the context
     */
    function deleteAllVariables() {
        context.Variables = {};
    }

    /**
     * @desc evaluate and return value of expression
     * @param {String} expression - math expression
     * @return {Number} - value of expression
     * @return {Error} - error object
     */
    function evaluate(expression) {
        var result = parse(expression);
        return result.err ? result.err : processTree(result.tree);
    }

    return {
        addVariable: addVariable,
        isVariableInContext: isVariableInContext,
        getValueOrError: getValueOrError,
        getVariableExpression: getVariableExpression,
        getAvailableVariables: getAvailableVariables,
        removeVariable: removeVariable,
        updateVariable: updateVariable,
        getValueOfVariable: getValueOfVariable,
        deleteAllVariables: deleteAllVariables,
        evaluate: evaluate
    };
}

export = Evaluator;
