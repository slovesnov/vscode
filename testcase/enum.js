class Enum {
	constructor(...keys) {
		keys.forEach((key, i) => {
			this[key] = i;
		});
		Object.freeze(this);
	}

	//   *[Symbol.iterator]() {
	//     for (let key of Object.keys(this)) yield key;
	//   }

	//int -> string or returns key from value,undefined if not found
	toString(value) {
		return Object.keys(this).find(key => this[key] === value);
	}

}
