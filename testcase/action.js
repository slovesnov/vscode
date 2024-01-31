const ActionEnum = new Enum(
	'STATIC_COMPILE',
	'COMPILE_CALCULATE'
);

class Action {

	//ActionEnum action;
	set(s, line) {
		this.action = ActionEnum[s.toUpperCase()];
		if (this.action === undefined) {
			throw new Error('unknown string ' + s + ' at line' + line);
		}
	}

	toString() {
		return ActionEnum.toString(this.action);
	}

}
