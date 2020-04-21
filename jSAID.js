const generateLuhnDigit = function (inputString) {
	let total = 0;
	let count = 0;
	for (let i = 0; i < inputString.length; i++) {
		const multiple = count % 2 + 1;
		count++;
		let temp = multiple * +inputString[i];
		temp = Math.floor(temp / 10) + (temp % 10);
		total += temp;
	}

	total = (total * 9) % 10;

	return total;
};

const oldLuhnDigit = function (nin) {
	let sumEven = 0;
	let sumOdd = 0;
	let even = false;
	for (i = 0; i < 12; i++) {
		if (!even) {
			sumOdd += parseInt(nin.charAt(i));
		} else {
			const doubleEven = 2 * parseInt(nin.charAt(i));
			sumEven += Math.floor(doubleEven / 10) + (doubleEven % 10);
		}
		even = !even
	}

	const total = sumOdd + sumEven;
	return (10 - (total % 10)) % 10;
};

const extractFromID = function (idNumber) {
	if (idNumber.length != 13) {
		return {valid: false};
	}

	const checkIDNumber = function (idNumber) {
		const number = idNumber.substring(0, idNumber.length - 1);
		return generateLuhnDigit(number) === +idNumber[idNumber.length - 1];
	};

	const getBirthdate = function (idNumber) {
		const year = idNumber.substring(0, 2);
		const currentYear = new Date().getFullYear() % 100;

		let prefix = "19";
		if (+year < currentYear)
			prefix = "20";

		const month = idNumber.substring(2, 4);
		const day = idNumber.substring(4, 6);
		return new Date(prefix + year + "/" + month + "/" + day);
	};

	const getGender = function (idNumber) {
		return +idNumber.substring(6, 7) < 5 ? "female" : "male";
	};

	const getCitizenship = function (idNumber) {
		return +idNumber.substring(10, 11) === 0 ? "citizen" : "resident";
	};

	const result = {};
	result.valid = checkIDNumber(idNumber);
	result.birthdate = getBirthdate(idNumber);
	result.gender = getGender(idNumber);
	result.citizen = getCitizenship(idNumber);
	return result;
};

const generateID = function (dob, male, citizen) {
	const getRandom = function (range) {
		return Math.floor(Math.random() * range);
	};

	if (!/[0-9][0-9][0-1][0-9][0-3][0-9]/.test(dob)) {
		return "Please check your date of birth string.";
	}

	const gender = getRandom(5) + (male ? 5 : 0);
	const citBit = +!citizen;
	let random = getRandom(1000);

	if (random < 10) random = "00" + random;
	else if (random < 100) random = "0" + random;

	let total = "" + dob + gender + random + citBit + "8";
	total += generateLuhnDigit(total);
	return total;
};

function randomValueBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function randomDate(date1, date2) {
	date1 = date1 || '01-01-1970'
	date2 = date2 || new Date().toLocaleDateString()

	date1 = new Date(date1).getTime()
	date2 = new Date(date2).getTime()

	if (date1 > date2) {
		return new Date(randomValueBetween(date2, date1));
	} else {
		return new Date(randomValueBetween(date1, date2));
	}
}

function dateToUnformattedString(date) {
	let month = date.getMonth() + 1;
	if (month < 10) {
		month = "0" + month;
	}
	let day = date.getDate();
	if (day < 10) {
		day = "0" + day;
	}

	return "" + date.getFullYear() + month + day;
}