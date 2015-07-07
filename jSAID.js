var generateLuhnDigit = function(inputString) {	
	var total = 0;
	var count = 0;
	for (var i = 0; i < inputString.length; i++) {
		var multiple = count % 2 + 1;
		count++;		
		var temp = multiple * +inputString[i];
		temp = Math.floor(temp / 10) + (temp % 10);
		total += temp;
	}

	total = (total * 9) % 10;

	return total;
};

var oldLuhnDigit = function (nin) {
	var sumEven = 0;
      var sumOdd = 0;
      var even = false;
      for(i=0; i<12; i++) {
        if(!even) { 
          sumOdd += parseInt(nin.charAt(i));
        } else {
          var doubleEven = 2*parseInt(nin.charAt(i));
          sumEven += Math.floor(doubleEven/10)+(doubleEven % 10);
        }        
        even = !even
      }

      var total = sumOdd + sumEven;
      return (10 - (total % 10)) % 10;
}

var extractFromID = function(idNumber) {
	if (idNumber.length != 13) {
		return {valid: false};
	}

	var checkIDNumber = function(idNumber) {
		var number = idNumber.substring(0, idNumber.length - 1);
		return generateLuhnDigit(number) === +idNumber[idNumber.length - 1];
	};

	var getBirthdate = function(idNumber) {
		var year = idNumber.substring(0, 2);
		var currentYear = new Date().getFullYear() % 100;

		var prefix = "19";
		if (+year < currentYear)
			prefix = "20";

		var month = idNumber.substring(2, 4);
		var day = idNumber.substring(4, 6);
		return new Date(prefix + year + "/" + month + "/" + day);
	};

	var getGender = function(idNumber) {
		return +idNumber.substring(6, 7) < 5 ? "female" : "male";
	};

	var getCitizenship = function(idNumber) {
		return +idNumber.substring(10, 11) === 0 ? "citizen" : "resident";
	};

	var result = {};
	result.valid = checkIDNumber(idNumber);
	result.birthdate = getBirthdate(idNumber);
	result.gender = getGender(idNumber);
	result.citizen = getCitizenship(idNumber);
	return result;
}

var generateID = function(dob, male, citizen) {
	var getRandom = function(range) {
		return Math.floor(Math.random() * range);
	};

	if (!/[0-9][0-9][0-1][0-9][0-3][0-9]/.test(dob)) {        
    	return "Please check your date of birth string.";
    }

    var gender = getRandom(5) + (male ? 5 : 0);
    var citBit = +!citizen;
    var random = getRandom(1000);
    
    if (random < 10) random = "00" + random;
    else if (random < 100) random = "0" + random;

    var total = "" + dob + gender + random + citBit + "8";
    total += generateLuhnDigit(total);
    return total;
};