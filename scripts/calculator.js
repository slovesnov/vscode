/******************************************************
Copyright (c/c++) 2013-doomsday by Alexey Slovesnov
homepage http://slovesnov.users.sourceforge.net/
email slovesnov@yandex.ru
All rights reserved.
******************************************************/

class ExpressionEstimator {
	constructor(...a) {
		if (a.length) {//check for non empty constructor
			this.compile(...a)
		}
	}

	//ExpressionEstimator.calculate('sin(pi/4)')
	static calculate(e) {
		return new ExpressionEstimator(e).calculate();
	}

	/*
	es=new ExpressionEstimator();
	es.compile('x0+2*sin(pi*x1)', 'x0', 'x1');//es.compile('x0+2*sin(pi*x1)', ['x0', 'x1']);
	s+='<br>'+es.calculate(1,1/4)+'<br>'+es.calculate([2,1/6]);
	es.compile('x0+2*x1', 'x0', 'x1');
	s+='<br>'+es.calculate(1,2);
	*/
	calculate(...a) {
		let v = Array.isArray(a[0]) ? a[0] : a;
		if (typeof this.f == 'undefined') {
			throw new Error('Expression is not compiled or compiled with error');
		}
		if (v.length != this.arguments) {
			throw new Error('Invalid number of arguments');
		}
		return this.f(...v);
	}

	compile(expression, ...a) {
		//todo compile('1,2') = error
		//todo compile('sin(1,2)') = error

		//remove previously compiled
		delete this.f
		delete this.arguments

		let i, j, k, s, e, f, t, v = Array.isArray(a[0]) ? a[0] : a
		expression = expression.replace(/\s+/g, "")

		e = expression;
		if (e.length == 0) {
			throw new Error('Empty expression');
		}
		if (!/^[\x00-\x7F]+$/.test(e)) {//check non ascii symbols, for example russian chars
			throw new Error('Invalid character found');
		}

		//slice to leave v array
		t = v.slice().sort()
		t.forEach((e, i) => {
			if (typeof e != 'string') {
				throw new Error(`variable "${e}" is not a string`);
			}
			f = e.toLowerCase();
			ExpressionEstimator.rf.forEach(s => {
				k = s.indexOf('(');
				if (k != -1) {
					s = s.substring(0, k);
				}
				if (s == f) {
					throw new Error("reserved word \"" + f + "\" is used as variable");
				}
			});
			//also check empty
			if (!e.match(/^_*[A-Za-z]\w*$/)) {
				throw new Error("invalid variable name \"" + e + "\"");
			}
			if (i > 0 && e == t[i - 1]) {
				throw new Error("repeated variable \"" + e + "\" in list");
			}
		});

		//check unbalanced parentheses
		t = ['(', ')', '[', ']', '{', '}']
		for (s = 0; s < t.length - 1; s += 2) {
			for (i = 0; i < e.length; i++) {
				if (e.charAt(i) == t[s]) {
					for (k = 0, j = i + 1; j < e.length; j++) {
						if (e.charAt(j) == t[s]) {
							k++;
						}
						else if (e.charAt(j) == t[s + 1]) {
							if (k == 0) {
								f = e.substring(i + 1, j);
								if ((v === undefined || !v.includes(f)) && !e.substring(0, i).toLowerCase().endsWith('random')) {
									this.compile(f, v)
								}
								break;
							}
							k--;
						}
					}
					if (j == e.length) {
						throw new Error('Unbalanced parentheses')
					}
				}
			}
		}

		//should replace before search matches
		f = ["\\[|\\{", "\\]|\\}"];
		t = ["(", ")"];
		for (i = 0; i < f.length; i++) {
			e = e.replace(new RegExp(f[i], 'gi'), t[i])
		}

		//javascript allows "random(bla,bla,bla)" but it's error test it
		if (/random\((?!\))/i.test(e)) {
			throw new Error('Arguments of random function is not possible');
		}

		//javascript allows "2/+2" but it's error test it, ** is ok
		if (/[-+*/][-+/]|[-+/][-+*/]/.test(e)) {
			throw new Error('Two operators in a row');
		}

		e = ExpressionEstimator.replaceRarelyFunction(e).replace('^', '**');
		ExpressionEstimator.rf.forEach(s => {
			k = s.indexOf('(');
			if (k == -1) {//if no arguments toUpperCase pi->PI
				s = s.toUpperCase()
			}
			else {// remove brackets
				s = s.substring(0, k)
				//symbol '(' or alphabet or digit or _ should goes after function name for all functions, compile('3*sina','sina') is ok
				if (new RegExp(s + "(?!\\(|\\w)", 'gi').test(e)) {
					throw new Error("'(' must go after function '" + s + "'");
				}
				if (s.toLowerCase() != 'random') {
					//javascript allows 'sin()' but it's error test it
					if (new RegExp(s + "\\(" + "(?=\\))", 'gi').test(e)) {
						throw new Error("Function '" + s + "' should have argument(s)");
					}

				}
			}
			t = 'Math.' + s;
			e = e.replace(new RegExp("(^|[^a-z0-9_\.])" + s + "(?=\\W|$)", 'gi'), '$1' + t)
		});

		//BEGIN test only allowable variables
		//works with expression because v case sensitive
		s = expression
		if (v.length) {
			v.forEach(e => {
				if (new RegExp('\\b' + e + '\\(', 'gi').test(expression)) {// compile('3*t(t)','t') is error
					throw new Error('variable ' + e + ' is not a function');
				}
				s = s.replace(new RegExp('\\b' + e + '\\b', 'g'), "")//case sensitive
			});
		}
		else {
			t = -1
			for (const i of s.matchAll(/\bx\d+\b/gi)) {
				k = Number(i[0].substring(1));
				if (k > t) {
					t = k
				}
			}
			//t is used below line 164
			s = s.replace(/\bx\d+\b/gi, "")//case insensitive
		}

		ExpressionEstimator.rf.forEach(e => {
			k = e.indexOf('(')
			f = k == -1 ? e : e.substr(0, k)
			s = s.replace(new RegExp('\\b' + f + '\\b', 'gi'), "")//case insensitive
		})

		//0b10.01 or 0b.10, 0b10 - is ok
		//0x10.01 or 0x.10, 0x10 - is ok
		const re = /\b0[box][\w\.]+/gi
		e = e.replace(re, e => {
			let j, k, g, v, r, radix;
			if (e.indexOf('_') != -1) {
				throw new Error("Invalid number " + e);
			}
			g = e.substr(2).split('.');
			if (g.length > 2) {
				throw new Error("Invalid number " + e);
			}
			if (g.length == 1) {
				return e;
			}
			if (g[0].length == 0 && g[1].length == 0) {
				throw new Error("Invalid number " + e);
			}
			// console.log(g)

			j = 'box'.indexOf(e[1].toLowerCase())
			r = [/^[01]*$/, /^[0-7]*$/, /^[\da-fA-f]*$/][j];
			j = [1, 3, 4][j]
			radix = 2 ** j;
			v = 0;
			g.forEach((e, i) => {
				if (!e.match(r)) {
					throw new Error("Invalid number " + e);
				}
				k = e.length ? parseInt(e, radix) : 0
				if (i == 1) {
					k /= 1 << (j * e.length);
				}
				v += k;
			});
			return v;
		})

		//replace all exponential numbers "1.2e+2" with ""
		s = s.replace(/[-+]?(\d*\.?\d+|\d+\.?\d*)e[-+]?\d+/gi, '')
		//replace all hex/bin numbers	
		s = s.replace(re, '')//regex like on line 177
		//complie("0b") output unknown varaible "0b" not "b", so use \d* at the beginnning
		if ((i = s.match(/\d*[a-z_]\w*/i)) != null) {
			throw new Error("Unknown variable \"" + i[0] + "\"")
		}
		//END test only allowable variables

		if (!v.length) {
			for (i = 0; i <= t; i++) {
				v.push('x' + i)
			}
			//if variables list is not set then X0 the same with x0
			//X\d+ -> x\d+
			e = e.replace(/\bX(\d+)\b/g, 'x\$1')//case sensitive
		}


		this.f = new Function(v, 'return ' + e)
		this.arguments = v.length //number of arguments
	}

	static replace = [
		['exp()', 'log()', 'pow(,)', 'sqrt()', 'abs()', 'random()', 'min(,)', 'max(,)']
		, ['pi', 'e', 'sqrt2', 'sqrt1_2', 'ln2', 'ln10', 'log2e', 'log10e']
		, []//fill below
		, []//fill below
		, ['ceil()', 'floor()', 'round()', 'atan2(,)']
	];

	//list of functions which are not in Math object
	static rarely = ['cot', '1/tan(#)'
		, 'sec', '1/cos(#)'
		, 'csc', '1/sin(#)'
		, 'acot', 'pi/2-atan(#)'
		, 'asec', 'acos(1/#)'
		, 'acsc', 'asin(1/#)'
		, 'coth', '1/tanh(#)'
		, 'sech', '1/cosh(#)'
		, 'csch', '1/sinh(#)'
		, 'acoth', 'atanh(1/#)'
		, 'asech', 'acosh(1/#)'
		, 'acsch', 'asinh(1/#)'
	];

	static {
		let a = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc']
		let b = a.concat(a.map(e => 'a' + e))
		for (let i = 0; i < 2; i++) {
			ExpressionEstimator.replace[i + 2] = b.map(e => e + (i ? 'h' : '') + '()')
		}
		ExpressionEstimator.rf = ExpressionEstimator.replace.flat();
	}

	/*replaceRarelyFunction("2*cot(3)")=2*(1/tan(3))
	string should not have whitespaces! and lowercased!
	replace functions which not Math object doesn't have
	*/
	static replaceRarelyFunction(s) {
		let i, j, k, f, c, q, r, a, m;
		for (f = 0; f < ExpressionEstimator.rarely.length - 1; f += 2) {
			r = ExpressionEstimator.rarely[f]
			a = new RegExp(r + '\\(', 'gi')
			while ((m = a.exec(s)) != null) {
				i = m.index
				c = s.charAt(i - 1).toLowerCase()
				q = s.substring(0, i) + '(';
				i += r.length + 1;
				if (i != r.length + 1 && c >= 'a' && c <= 'z') {
					continue;
				}

				for (k = 0, j = i; j < s.length; j++) {
					c = s.charAt(j);
					if (c == '(') {
						k++;
					}
					else if (c == ')') {
						k--;
					}
					if (k == -1) {
						break;
					}
				}

				s = q + ExpressionEstimator.rarely[f + 1].replace(/#/gi, '(' + s.substring(i, j) + ')') + s.substring(j)
			}
		}
		return s
	}

	getArguments() {
		return this.arguments
	}
}