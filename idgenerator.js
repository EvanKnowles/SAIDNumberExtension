$(function () {
    const LAST_ID = "last-id";
    let $boxes = $('.id-omnibox');

    function getTotalID() {
        let total = '';
        $boxes.each(function (e, t) {
            total += t.value;
        });
        return total;
    }

    let lastIdGenerated = localStorage.getItem(LAST_ID);
    if (lastIdGenerated && lastIdGenerated !== "null") {
        placeId(lastIdGenerated);
        checkForValidID();
    } else {
        produceRandomIDNumber();
    }

    function placeId(id) {
        let index = 0;
        $boxes.each(function (e, t) {
            t.value = id[index++];
        });
    }

    function checkForValidID() {
        const total = getTotalID();

        const $id = $('.id-status');

        if (total.length === 0) {
            $id.removeClass('valid');
            $id.removeClass('invalid');
            return;
        }

        const analysis = extractFromID(total);

        if (!analysis.valid) {
            $id.removeClass('valid');
            $id.addClass('invalid');
            return;
        }

        $id.removeClass('invalid');
        $id.addClass('valid');

        $('.dob').val(dateToString(analysis.birthdate));

        const genderChecked = (analysis.gender === 'male');
        $('.male').prop('checked', genderChecked);

        const citizenChecked = analysis.citizen === 'citizen';
        $('.citizen').prop('checked', citizenChecked);
    }

    function dateToString(date) {
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        let day = date.getDate();
        if (day < 10) {
            day = "0" + day;
        }

        return "" + date.getFullYear() + "-" + month + "-" + day;
    }

    $boxes.attr('maxlength', 1);

    $boxes.on('keydown', function (event) {
        const $this = $(this);
        const $prev = $this.prev('.id-omnibox');
        const $next = $this.next('.id-omnibox');

        if (event.which === 8) {
            if ($this.val() === '') {
                $prev.focus();
                $prev.val('');
            } else {
                $this.val('');
            }
        } else if (event.which === 37) {
            $prev.focus();
        } else if (event.which === 39) {
            $next.focus();
        } else {
            const keyCode = event.keyCode;
            if (keyCode >= 48 && keyCode <= 57) {
                $this.val(String.fromCharCode(keyCode));
                $next.focus();
            } else if (keyCode >= 96 && keyCode <= 105) {
                $this.val(String.fromCharCode(keyCode - 48));
                $next.focus();
            }
        }

        checkForValidID();

        event.preventDefault();
    });

    function produceRandomIDNumber() {
        let fullYear = new Date().getFullYear();

        let date = randomDate("01-01-" + (fullYear - 70), "01-01-" + (fullYear - 19));
        let dob = dateToUnformattedString(date);
        let dobString = dob.substring(dob.length - 6);
        let male = !!Math.round(randomValueBetween(0, 1));

        let id = generateID(dobString, male, true);
        placeId(id);
        checkForValidID();
    }

    $('.random-button').click(function () {
        produceRandomIDNumber();
    });

    $('.generate-button').click(function () {
        const dob = $('.dob').val();  //date of birth
        const male = $('.male').is(':checked'); //gender
        const citizen = $('.citizen').is(':checked'); //citizen or resident

        localStorage.setItem(LAST_ID, null);

        const id = generateID(dob.replace(/-/g, "").substring(dob.length - 8), male, citizen);

        placeId(id);
        checkForValidID();
    });

    $('.copy-button').click(function () {
        const $hidden = $('.hidden');
        $hidden.val(getTotalID()).select();

        localStorage.setItem(LAST_ID, getTotalID());

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });
});
