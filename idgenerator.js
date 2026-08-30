document.addEventListener('DOMContentLoaded', function () {
    const LAST_ID = "last-id";

    const boxes = Array.prototype.slice.call(document.querySelectorAll('.id-omnibox'));
    const status = document.querySelector('.id-status');
    const dobInput = document.querySelector('.dob');
    const maleInput = document.querySelector('.male');
    const citizenInput = document.querySelector('.citizen');
    const hiddenInput = document.querySelector('.hidden');

    function getTotalID() {
        return boxes.map(function (box) {
            return box.value;
        }).join('');
    }

    function placeId(id) {
        boxes.forEach(function (box, index) {
            box.value = id[index];
        });
    }

    function siblingBox(box, direction) {
        const sibling = direction === 'prev' ? box.previousElementSibling : box.nextElementSibling;
        return sibling && sibling.classList.contains('id-omnibox') ? sibling : null;
    }

    function setStatus(state) {
        status.classList.remove('valid', 'invalid');
        if (state) {
            status.classList.add(state);
        }
    }

    function checkForValidID() {
        const total = getTotalID();

        if (total.length === 0) {
            setStatus(null);
            return;
        }

        const analysis = extractFromID(total);

        if (!analysis.valid) {
            setStatus('invalid');
            return;
        }

        setStatus('valid');

        dobInput.value = dateToString(analysis.birthdate);
        maleInput.checked = analysis.gender === 'male';
        citizenInput.checked = analysis.citizen === 'citizen';
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

    function produceRandomIDNumber() {
        const fullYear = new Date().getFullYear();

        const date = randomDate("01-01-" + (fullYear - 70), "01-01-" + (fullYear - 19));
        const dob = dateToUnformattedString(date);
        const dobString = dob.substring(dob.length - 6);
        const male = !!Math.round(randomValueBetween(0, 1));

        const id = generateID(dobString, male, true);
        placeId(id);
        checkForValidID();
    }

    boxes.forEach(function (box) {
        box.setAttribute('maxlength', '1');

        box.addEventListener('keydown', function (event) {
            const prev = siblingBox(box, 'prev');
            const next = siblingBox(box, 'next');

            if (event.key === 'Backspace') {
                if (box.value === '') {
                    if (prev) {
                        prev.focus();
                        prev.value = '';
                    }
                } else {
                    box.value = '';
                }
            } else if (event.key === 'ArrowLeft') {
                if (prev) {
                    prev.focus();
                }
            } else if (event.key === 'ArrowRight') {
                if (next) {
                    next.focus();
                }
            } else if (/^[0-9]$/.test(event.key)) {
                box.value = event.key;
                if (next) {
                    next.focus();
                }
            }

            checkForValidID();
            event.preventDefault();
        });
    });

    document.querySelector('.random-button').addEventListener('click', function () {
        produceRandomIDNumber();
    });

    document.querySelector('.generate-button').addEventListener('click', function () {
        const dob = dobInput.value;             // date of birth (YYYY-MM-DD)
        const male = maleInput.checked;         // gender
        const citizen = citizenInput.checked;  // citizen or resident

        localStorage.setItem(LAST_ID, 'null');

        const id = generateID(dob.replace(/-/g, "").substring(dob.length - 8), male, citizen);

        placeId(id);
        checkForValidID();
    });

    document.querySelector('.copy-button').addEventListener('click', function () {
        const total = getTotalID();

        hiddenInput.value = total;
        hiddenInput.select();

        localStorage.setItem(LAST_ID, total);

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });

    const lastIdGenerated = localStorage.getItem(LAST_ID);
    if (lastIdGenerated && lastIdGenerated !== "null") {
        placeId(lastIdGenerated);
        checkForValidID();
    } else {
        produceRandomIDNumber();
    }
});
