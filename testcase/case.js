class Case {
	constructor(){
		this.e = new ExpressionEstimator();
		this.data = new Data();
		this.action = new Action();
		this.result = new Result();
	}

	set(s, lines) {
		this.line=lines[0]
		this.data.set(s[0], lines[0]);
		this.action.set(s[1], lines[1]);
		this.result.set(s[2], lines[2]);
	}

	test() {
		let r = new Result();
		let v;
		if (this.action.action == ActionEnum.STATIC_COMPILE) {
			try {
				v = ExpressionEstimator.calculate(this.data.compile);
				r.set(ErrorCode.OK, v);
			} catch (e) {
				//console.log(e.stack)
				r.set(ErrorCode.COMPILE_ERROR);
			}
		}
		else if (this.action.action == ActionEnum.COMPILE_CALCULATE) {
			try {
				this.e.compile(this.data.compile, this.data.variables);
				try {
					v = this.e.calculate(this.data.values);
					r.set(ErrorCode.OK, v);
				} catch (e) {
					//console.log(e.stack)
					r.set(ErrorCode.CALCULATE_ERROR);
				}
			} catch (e) {
				//console.log(e.stack)
				r.set(ErrorCode.COMPILE_ERROR);
			}
		}
		else {
			throw new Error();
		}

		let b = r.equals(this.result);
		v=b?'': this.data.toString() + " " + r.toString() + " file:"+this.line+" " + this.result.toString() + '<br>';
		return [b,v];
	}

}
