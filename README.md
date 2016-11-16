# Math Expression Evaluator
JavaScript plugin for math expressions evaluation

##Usage

```
var context = {
    constants: {
        pi: '3.14'
    },
    functions: {
        pow: Math.pow
    },
    variables: {
        a: '5.2 + 10^3',
        b: 'a + 20%'
    }
};

var mathee = new MathEE(context);

mathee.addVariable("c", "pow(b,2)");
var value = mathee.getValueOfVariable("c");     // value should be equal 1455014.9376
```

## Features

#### Supported operators and symbols
- \+ Addition operator eg. 2+3 results 5 
- \- Subtraction operator eg. 2-3 results -1 
- \/ Division operator eg. 3/2 results 1.5 
- \* Multiplication operator eg. 2*3 results 6 
- \^ Power operator eg. 5^3 results 125 
- \% Percentage operator eg. 5% results 0.05 and 10 + 50% results 15 
- \( Opening parenthesis 
- \) Closing parenthesis

### Default constants
- pi Math constant pi returns 3.1415926535897932384 
- phi Math constant phi returns 1.6180339887498948482

### Default functions
- abs Math.abs 
- ceil Math.ceil 
- exp Math.exp 
- floor Math.floor 
- log Math.log 
- pow Math.pow 
- random Math.random 
- sqrt Math.sqrt

## API

```
/**
 * @desc add variable to the context (return false if exist)
 * @param {String} variable - name of variable
 * @param {String} expression - math expression
 * @return {Boolean} - success or failure
 */
mathee.addVariable(variable, expression)


/**
 * @desc check if variable exists in the context
 * @param {String} variable - name of variable
 * @return {Boolean} - exist or not exist
 */
mathee.isVariableInContext(variable)


/**
 * @desc return array of variables available in the context
 * @return {Array} - list of variables' names
 */
mathee.getAvailableVariables()


/**
 * @desc update variable in the context
 * @param {String} variable - name of variable
 * @param {String} expression - math expression
 * @return {Boolean} - success or failure
 */
mathee.updateVariable(variable, expression)


/**
 * @desc evaluate and return value of variable
 * @param {String} variable - name of variable
 * @return {Number} - value of variable
 * @return {Error} - error object
 */
mathee.getValueOfVariable(variable)


/**
 * @desc evaluate and return value of variable or custom error message
 * @param {String} variable - name of variable
 * @param {String} errorValue - value that will be returned if error
 * @return {Number} - value of variable
 * @return {Any} - return errorValue if result of expression is error
 */
mathee.getValueOrError(variable, errorValue = 'Error')


/**
 * @desc returns original expression of variable or error object
 * @param {String} variable - name of variable
 * @return {string} - original math expression of variable
 * @return {Error} - error object if variable doesn't exist in scope
 */
mathee.getVariableExpression(variable)


/**
 * @desc remove variable from the context
 * @param {String} variable - name of variable
 */
mathee.removeVariable(variable)


/**
 * @desc delete all variables from the context
 */
mathee.deleteAllVariables()


/**
 * @desc evaluate and return value of expression
 * @param {String} expression - math expression
 * @return {Number} - value of variable
 * @return {Error} - error object
 */
mathee.evaluate(expression)
```
