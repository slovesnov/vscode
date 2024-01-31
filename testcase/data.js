class Data {
	// String compile;
	// String variables[];
	// double values[];

	set(s, line) {
		let p = s.indexOf('"'),q;
		if (p == -1) {
			throw new Error();
		}
		p++;
		//assert(s.length()>p);		
		let p1 = s.indexOf('"', p);
		if (p1 == -1) {
			throw new Error();
		}
		this.compile = s.substring(p, p1);

		this.variables = [];
		this.values = [];

		p = s.indexOf('"', p1 + 1);
		if (p == -1) {
			return;
		}
		p++;
		if (s.length <= p) {
			throw new Error();
		}
		p1 = s.indexOf('"', p);
		q=s.substring(p, p1)
		if(q){
			this.variables = q.split(/\s+/);
		}

		p = s.indexOf('"', p1 + 1);
		if (p == -1) {
			throw new Error();
		}
		p++;
		if (s.length <= p) {
			throw new Error();
		}
		p1 = s.indexOf('"', p);
		q=s.substring(p, p1)
		if(q){
			q.split(/\s+/).forEach(e => this.values.push(parseFloat(e)));
		}
	}

	toString() {
		let s = "compile=" + this.compile;
		if (this.variables.length != 0) {
			s += " variables=" + this.variables.join() + " values=" + this.values.join(' ');
		}
		return s;
	}

}
