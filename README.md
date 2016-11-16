# Math Expression Evaluator
JavaScript plugin for math expressions evaluation

###Usage

...
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
...
