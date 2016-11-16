var MathEE = require('../src/js/evaluator.js');
var mathee = undefined;
var data = {
	a: 5,
	C1: 5,
	C2: 25,
	C3: '5',
	C4: 'C4_S1*2',
	C5: '0',
	C4_S1: '50',
	G1: '(C1 + C2) * C3 - 50% + C4',
	'V#a1#a1_C1_C1': 777
};

describe("Math expressions evaluator", function () {
	it("should initiatise module", function () {
		mathee = new MathEE();
		expect(mathee).toBeDefined();
		mathee = new MathEE({
			constants: {},
			functions: {}
		});
		expect(mathee).toBeDefined();
	});

	beforeEach(function() {
		mathee = new MathEE({
			variables: data	
		});
	});

	describe("Parser", function () {
		it("should process numbers", function () {
			expect(mathee.evaluate(0)).toBe(0);
			expect(mathee.evaluate('0')).toBe(0);
			expect(mathee.evaluate(5)).toBe(5);
			expect(mathee.evaluate(0.12)).toBe(0.12);
			expect(mathee.evaluate('5')).toBe(5);
			expect(mathee.evaluate('5.0')).toBe(5);
			expect(mathee.evaluate(' 5 ')).toBe(5);
			expect(mathee.evaluate('12.')).toBe(12);
			expect(mathee.evaluate('.0120')).toBe(0.012);
			expect(mathee.evaluate('12.34')).toBe(12.34);
			expect(mathee.evaluate('12.34e7')).toBe(12.34e7);
			expect(mathee.evaluate('12.34E7')).toBe(12.34e7);
			expect(mathee.evaluate('12.34e+7')).toBe(12.34e+7);
			expect(mathee.evaluate('12.34E+7')).toBe(12.34e+7);
			expect(mathee.evaluate('12.34e-7')).toBe(12.34e-7);
			expect(mathee.evaluate('12.34E-7')).toBe(12.34e-7);
		});

		it("should process constants", function () {
			expect(mathee.evaluate('pi * 2')).toBe(3.1415926535897932384*2);
		});

		it("should process variables", function () {
			expect(mathee.evaluate('a')).toBe(data.a);
			expect(mathee.evaluate('C2')).toBe(data.C2);
			expect(mathee.evaluate('-C2')).toBe(-data.C2);
			expect(mathee.evaluate('C3')).toBe(parseInt(data.C3));
			expect(mathee.evaluate('V#a1#a1_C1_C1')).toBe(parseInt(data['V#a1#a1_C1_C1']));
		});

		it("should process unary operators '+' and '-'", function () {
			expect(mathee.evaluate('+12')).toBe(12);
			expect(mathee.evaluate('-12')).toBe(-12);
			expect(mathee.evaluate('+--+12')).toBe(12);
			expect(mathee.evaluate('-C1')).toBe(-data.C1);
			expect(mathee.evaluate('-C3')).toBe(-parseInt(data.C3));
		});

		it("should process binary operators '+,-,*,/'", function () {
			expect(mathee.evaluate('12+34')).toBe(12 + 34);
			expect(mathee.evaluate('12*34')).toBe(12*34);
			expect(mathee.evaluate('65-43-21')).toBe(65-43-21);
			expect(mathee.evaluate('12*34+56')).toBe(12*34+56);
			expect(mathee.evaluate('12+34*56')).toBe(12+34*56);
			expect(mathee.evaluate('12*34/6')).toBe(12*34/6);
			expect(mathee.evaluate('12/3*4')).toBe(12/3*4);
			expect(mathee.evaluate('12/3/4')).toBe(12/3/4);
			expect(mathee.evaluate('36/2/3/6')).toBe(36/2/3/6);
			expect(mathee.evaluate('36/2/3/2/3')).toBe(1);
			expect(mathee.evaluate('5 * -5 + 5.5')).toBe((5*-5)+5.5);
			expect(mathee.evaluate('1/3')).toBe(1/3);
			expect(mathee.evaluate('C1 + C2 / C3')).toBe(data.C1+data.C2/parseInt(data.C3));
		});

		it("should process brackets", function () {
			expect(mathee.evaluate('(123)')).toBe(123);
			expect(mathee.evaluate('( 123 )')).toBe(123);
			expect(mathee.evaluate('( C1 )')).toBe(data.C1);
			expect(mathee.evaluate('( C3 )')).toBe(parseInt(data.C3));
			expect(mathee.evaluate('( -C3 )')).toBe(-parseInt(data.C3));
			expect(mathee.evaluate('(12+34)*C1')).toBe((12+34)*data.C1);
			expect(mathee.evaluate('-(5+5)')).toBe(-(5+5));
			expect(mathee.evaluate('(5)+5*((5+5)/5+5)-5/5*5')).toBe((5)+5*((5+5)/5+5)-5/5*5);
		});

		it("should process function call", function () {
			expect(mathee.evaluate('abs(-45)')).toBe(Math.abs(-45));
			expect(mathee.evaluate('acos(0.45)')).toBe(Math.acos(0.45));
			expect(mathee.evaluate('asin(.45)')).toBe(Math.asin(0.45));
			expect(mathee.evaluate('atan(.45)')).toBe(Math.atan(0.45));
			expect(mathee.evaluate('ceil(44.004)')).toBe(Math.ceil(44.004));
			expect(mathee.evaluate('cos(45)')).toBe(Math.cos(45));
			expect(mathee.evaluate('exp( -1 )')).toBe(Math.exp(-1));
			expect(mathee.evaluate('floor(45.9)')).toBe(Math.floor(45.9));
			expect(mathee.evaluate('log(45)')).toBe(Math.log(45));
			expect(mathee.evaluate('pow(C1, C3)')).toBe(Math.pow(data.C1,parseInt(data.C3)));
			expect(mathee.evaluate('sin(45)')).toBe(Math.sin(45));
			expect(mathee.evaluate('tan(45)')).toBe(Math.tan(45));
			expect(mathee.evaluate('sqrt(9)')).toBe(Math.sqrt(9));
			expect(mathee.evaluate('ceil(random())')).toBe(1);
		});

		it("should process PMT function call", function () {
			expect(mathee.evaluate('PMT(10/1200, 60, -1000, 200)')).toBe(18.664302435681343);
			expect(mathee.evaluate('PMT(10/1200, 60, -1000, 200, 1)')).toBe(18.510052002328607);
			expect(mathee.evaluate('PMT(10/1200, 60, -1000, 200, 555)')).toBe(18.510052002328607);
			expect(mathee.evaluate('PMT(10/1200, 60, -1000)')).toBe(21.247044711268348);
			expect(mathee.evaluate('PMT(10/1200, 60)')).toBe(0);
			expect(isNaN(mathee.evaluate('PMT(10/1200)'))).toBe(true);
			expect(isNaN(mathee.evaluate('PMT()'))).toBe(true);
			expect(mathee.evaluate('PMT(C1/1200, 60, -1000, 200)')).toBe(15.930320248542031);
			expect(mathee.evaluate('PMT(C1%/12, 60, -1000, 200)')).toBe(15.930320248542031);
		});

		it("should process percentage sign", function () {
			expect(mathee.evaluate('5%')).toBe(0.05);
			expect(mathee.evaluate('(5%)')).toBe(0.05);
			expect(mathee.evaluate('5+0%')).toBe(5);
			expect(mathee.evaluate('0%+5')).toBe(5);
			expect(mathee.evaluate('5*0%')).toBe(0);
			expect(mathee.evaluate('0%*5')).toBe(0);
			//expect(mathee.evaluate('5---5%')).toBe(4.75);
			expect(mathee.evaluate('5+5%')).toBe(5.25);
			expect(mathee.evaluate('5%+5')).toBe(5.05);
			expect(mathee.evaluate('(5+5%)')).toBe(5.25);
			expect(mathee.evaluate('10%+10%')).toBe(0.11);
			expect(mathee.evaluate('5+10%+10%')).toBe(6.05);
			expect(mathee.evaluate('(2+3)%')).toBe(0.05);
			expect(mathee.evaluate('5-(2+3)%-5')).toBe(-0.25);
			expect(mathee.evaluate('5+(10%+10%)')).toBe(5.11);
			expect(mathee.evaluate('5%/5*5')).toBe(0.05);
			expect(mathee.evaluate('5%/(5*5)')).toBe(0.002);
			expect(mathee.evaluate('5%-(5%)+5+5%+5*((5+5%)/5%+5%)-5%/5*5')).toBe(556.45);
			expect(mathee.evaluate('C1%')).toBe(data.C1*0.01);
			expect(mathee.evaluate('(C1%)')).toBe(data.C1*0.01);
			expect(mathee.evaluate('-C1-C1%')).toBe(-4.75);
			expect(mathee.evaluate('-C1%-C1')).toBe(-5.05);
			expect(mathee.evaluate('5*-(C1-C1%)*5')).toBe(-118.75);
			expect(mathee.evaluate('C1%-(C1%)+C1+C1%+C1*((C1+C1%)/C1%+C1%)-C1%/C1*C1')).toBe(556.45);
			expect(mathee.evaluate('POW(5,3)')).toBe(125);
			expect(mathee.evaluate('pow(5,3)')).toBe(125);
			expect(mathee.evaluate('5+pow(5,3)')).toBe(130);
			expect(mathee.evaluate('pow(5,3)+5')).toBe(130);
			expect(mathee.evaluate('pow(5,3)%')).toBe(1.25);
			expect(mathee.evaluate('5+pow(5,3)%')).toBe(11.25);
			expect(mathee.evaluate('pow(5,3)% + 5')).toBe(6.25);
			expect(mathee.evaluate('pow(5,3)% + 5')).toBe(6.25);
			expect(mathee.evaluate('pow(1000%, 2+2)')).toBe(10000);
		});

		it("should process power sign", function () {
			expect(mathee.evaluate('5^0')).toBe(1);
			expect(mathee.evaluate('0^5')).toBe(0);
			expect(mathee.evaluate('5^-3')).toBe(0.008);
			expect(mathee.evaluate('5^5')).toBe(3125);
			expect(mathee.evaluate('2+5^5+4')).toBe(3131);
			expect(mathee.evaluate('2*5^5/4')).toBe(1562.5);
			expect(mathee.evaluate('(5+5)^4')).toBe(10000);
			expect(mathee.evaluate('5^(5+5)')).toBe(9765625);
			expect(mathee.evaluate('5^(5+5)*2')).toBe(19531250);
			expect(mathee.evaluate('2*5^-3/4')).toBe(0.004);
			expect(mathee.evaluate('C1^(C1+C1)*2')).toBe(19531250);
			expect(mathee.evaluate('2*C1^-3/4')).toBe(0.004);
		});

		it('should process recursive expressions', function () {
			expect(mathee.evaluate('G1')).toBe(175);
		});
	});

	describe("Errors handler", function () {
		it("should return error in case of unknown token like @, & or $", function () {
			expect(mathee.evaluate('5@').message).toBe('Unknown token from character @');
			expect(mathee.evaluate('5&').message).toBe('Unknown token from character &');
			expect(mathee.evaluate('5$').message).toBe('Unknown token from character $');
			expect(mathee.evaluate('5|').message).toBe('Unknown token from character |');
			expect(mathee.evaluate('C1@').message).toBe('Unknown token from character @');
			expect(mathee.evaluate('C1&').message).toBe('Unknown token from character &');
			expect(mathee.evaluate('C1$').message).toBe('Unknown token from character $');
			expect(mathee.evaluate('C1|').message).toBe('Unknown token from character |');
			expect(mathee.evaluate('pow$(12,34)').message).toBe('Unknown token from character $');
		});

		it("should return error in cases like '12.34.'", function () {
			expect(mathee.evaluate('12.34.').message).toBe('Expecting decimal digits after the dot sign');
			expect(mathee.evaluate('C1.').message).toBe('Expecting decimal digits after the dot sign');
		});

		it("should return error if result is Infinity", function () {
			expect(mathee.evaluate('999999^999').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('5+999999^999').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('999999^999-5').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('5*999999^999').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('999999^999/5').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('999999^999/999999^999').message).toBe('Result is not in range of valid numbers');
			expect(mathee.evaluate('pow(999999,999)').message).toBe('Result is not in range of valid numbers');
		});

		it("should return error in cases of unexpected token", function () {
			expect(mathee.evaluate('b=5').message).toBe('Unexpected token =');
			expect(mathee.evaluate('12,34').message).toBe('Unexpected token ,');
			expect(mathee.evaluate('12+34a').message).toBe('Unexpected token a');
			expect(mathee.evaluate('1(23+45').message).toBe('Unexpected token (');
			expect(mathee.evaluate('5+5C').message).toBe('Unexpected token C');
			expect(mathee.evaluate('(5+5)5').message).toBe('Unexpected token 5');
			expect(mathee.evaluate('5(5+5)').message).toBe('Unexpected token (');
			expect(mathee.evaluate('pow%(5,3').message).toBe('Unexpected token (');
			expect(mathee.evaluate('5%%').message).toBe('Unexpected token %');
			expect(mathee.evaluate('5%%%').message).toBe('Unexpected token %');
			expect(mathee.evaluate('5%5').message).toBe('Unexpected token 5');
			expect(mathee.evaluate('5+5%%').message).toBe('Unexpected token %');
			expect(mathee.evaluate('5%%+5').message).toBe('Unexpected token %');
			expect(mathee.evaluate('C1%%').message).toBe('Unexpected token %');
			expect(mathee.evaluate('C1%5').message).toBe('Unexpected token 5');
			expect(mathee.evaluate('pow(5,3)%%').message).toBe('Unexpected token %');
			expect(mathee.evaluate('pow(5,3)%5').message).toBe('Unexpected token 5');
			expect(mathee.evaluate('pow(5,3)%%+5').message).toBe('Unexpected token %');
			expect(mathee.evaluate('5+pow(5,3)%%').message).toBe('Unexpected token %');
		});

		it("should return error in cases of unexpected termination of expression", function () {
			expect(mathee.evaluate('$5').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('5+').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('pow(').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('5^').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('5+5^').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('(5)^').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('(5+5)^').message).toBe('Unexpected termination of expression');
		});

		it("should return error in case of malformed expressions", function () {
			expect(mathee.evaluate('(5+5').message).toBe('Expecting )');
			expect(mathee.evaluate('(C1+C2+C3').message).toBe('Expecting )');
			expect(mathee.evaluate('(12,13)5').message).toBe('Expecting )');
			expect(mathee.evaluate('pow^(5,3)').message).toBe('Expecting )');
			expect(mathee.evaluate('*5').message).toBe('Parse error, can not process token *');
			expect(mathee.evaluate('12**34').message).toBe('Parse error, can not process token *');
			expect(mathee.evaluate('(5^)').message).toBe('Parse error, can not process token )');
			expect(mathee.evaluate('(^5)').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('^(5)').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('^5').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('5^*5').message).toBe('Parse error, can not process token *');
			expect(mathee.evaluate('5^/5').message).toBe('Parse error, can not process token /');
			expect(mathee.evaluate('5-^5').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('5*^5').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('5^^5').message).toBe('Parse error, can not process token ^');
			expect(mathee.evaluate('5%^5').message).toBe('Malformed expression');
			expect(mathee.evaluate('5^5%').message).toBe('Malformed expression');
		});

		it("should return error in cases of unknown function call", function () {
			expect(mathee.evaluate('test(12,34)').message).toBe('Unknown function test');
		});

		it("should return error in cases of malformed function call", function () {
			expect(mathee.evaluate('pow(5').message).toBe('Expecting ) in a function call "pow"');
			expect(mathee.evaluate('pow(5,3').message).toBe('Expecting ) in a function call "pow"');
			expect(mathee.evaluate('pow(5,3').message).toBe('Expecting ) in a function call "pow"');
		});

		it("should return error in cases of malformed exponent expression", function () {
			expect(mathee.evaluate('12e').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('12e$').message).toBe('Unexpected termination of expression');
			expect(mathee.evaluate('12ea').message).toBe('Unexpected termination of expression');
		});

		it("should return error in cases of unknown identifier", function () {
			expect(mathee.evaluate('C125').message).toBe('Unknown identifier');
			expect(mathee.evaluate('w').message).toBe('Unknown identifier');
			expect(mathee.evaluate('pow^(5)').message).toBe('Unknown identifier');
		});

		it("should return error in cases of division by zero", function () {
			expect(mathee.evaluate('5/0').message).toBe('Division by zero');
			expect(mathee.evaluate('5/C5').message).toBe('Division by zero');
			expect(mathee.evaluate('C1 / 0').message).toBe('Division by zero');
			expect(mathee.evaluate('C1 / C5').message).toBe('Division by zero');
			expect(mathee.evaluate('5/pow(0,2)').message).toBe('Division by zero');
			expect(mathee.evaluate('C1 / pow(0,2)').message).toBe('Division by zero');
		});
	});

	describe("API", function () {
		it("should return variable value", function () {
			expect(mathee.getValueOfVariable('C1')).toBe(5);
			expect(mathee.getValueOrError('C1')).toBe(5);
			expect(mathee.getValueOrError('M8')).toBe('Error');
		});
		it("should return error if variable doesn't exist", function () {
			expect(mathee.getValueOfVariable('ABC').message).toBe('Variable doesn\'t exist');
		});
		it("should return original variable expression", function () {
			expect(mathee.getVariableExpression('C1')).toBe('5');
			expect(mathee.getVariableExpression('C4')).toBe(data.C4);
			expect(mathee.getVariableExpression('M8').message).toBe('Variable doesn\'t exist');
			mathee.addVariable('M8', '5*');
			expect(mathee.getVariableExpression('M8')).toBe('5*');
		});
		it("should return error if variable expression is invalid", function () {
			mathee.addVariable('M8', '5*');
			expect(mathee.getValueOfVariable('M8').message).toBe('Unexpected termination of expression');
			mathee.updateVariable('M8', '5');
			expect(mathee.getValueOfVariable('M8')).toBe(5);
			mathee.updateVariable('M8', 'M25');
			expect(mathee.getValueOfVariable('M8').message).toBe('Unknown identifier');
		});
		it("should add new variable to the context", function () {
			expect(mathee.addVariable('M8', '5+C1')).toBe(true);
			expect(mathee.addVariable('M8', '123')).toBe(false);
			expect(mathee.getValueOfVariable('M8')).toBe(10);
		});
		it("should check if variable exists in the context", function() {
			expect(mathee.isVariableInContext('C1')).toBe(true);
			expect(mathee.isVariableInContext('M8')).toBe(false);
		});
		it("should remove variable from the context", function () {
			mathee.removeVariable('C1');
			expect(mathee.getValueOfVariable('C1').message).toBe("Variable doesn't exist");
		});
		it("should delete all variables from context", function () {
			mathee.deleteAllVariables();
			expect(mathee.getValueOfVariable('C1').message).toBe("Variable doesn't exist");
		});
		it("should return array of variables available in the context", function() {
			mathee.deleteAllVariables();
			mathee.addVariable('a', '123');
			mathee.addVariable('b', 'a');
			expect(mathee.getAvailableVariables().length).toBe(2);
			var variables = mathee.getAvailableVariables().sort();
			expect(variables[0]).toBe('a');
			expect(variables[1]).toBe('b');
		});
		it("should update variable", function () {
			mathee.updateVariable('C4', 'C4_S1*4');
			expect(mathee.getValueOfVariable('C4')).toBe(200);
			mathee.updateVariable('M8', '25');
			expect(mathee.getValueOfVariable('M8')).toBe(25);
		});
		it("should return error in case of loopback expression", function () {
			mathee.addVariable('N1', 'N4');
			mathee.addVariable('N2', 'N1');
			mathee.addVariable('N3', 'N2');
			mathee.addVariable('N4', 'N3');
			expect(mathee.getValueOfVariable('N2').message).toBe('Loopback expression');
		});
		it("should return an error if link to malformed expression", function () {
			mathee.addVariable('empty', '');
			mathee.addVariable('M8', 'empty');
			expect(mathee.getValueOfVariable('M8').message).toBe('Unexpected termination of expression');
		});
	});
});