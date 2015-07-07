$(function () {
    var $boxes = $('.id-omnibox');

    function getTotalID() {
        var total = '';
        $boxes.each(function (e, t) {
            total += t.value;
        });
        return total;
    }

    function placeId(id) {
        var index = 0;
        $boxes.each(function (e, t) {
            t.value = id[index++];
        });
    }

    function checkForValidID() {
        var total = getTotalID();

        var $id = $('.id-status');

        if (total.length == 0) {
            $id.removeClass('valid');
            $id.removeClass('invalid');
            return;
        }

        var analysis = extractFromID(total);

        if (!analysis.valid) {
            $id.removeClass('valid');
            $id.addClass('invalid');
            return;
        }

        $id.removeClass('invalid');
        $id.addClass('valid');

        var curr_date = analysis.birthdate.getDate();
        var curr_month = analysis.birthdate.getMonth() + 1; //Months are zero based
        var curr_year = analysis.birthdate.getFullYear();

        $('.dob').val('' + curr_year +"-"+ curr_month +"-"+ curr_date);

        var genderChecked = (analysis.gender == 'male');
        $('.male').attr('checked', genderChecked);

        var citizenChecked = analysis.citizen == 'citizen';
        $('.citizen').attr('checked', citizenChecked);
    }

    $boxes.attr('maxlength', 1);

    $boxes.on('keydown', function (event) {
        var $this = $(this);
        var $prev = $this.prev('.id-omnibox');
        var $next = $this.next('.id-omnibox');

        if (event.which == 8) {
            if ($this.val() == '') {
                $prev.focus();
                $prev.val('');
            } else {
                $this.val('');
            }
        } else if (event.which == 37) {
            $prev.focus();
        } else if (event.which == 39) {
            $next.focus();
        } else {
            var keyCode = event.keyCode;
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

    $('.generate-button').click(function () {
        var dob = $('.dob').val();  //date of birth
        var male = $('.male').is(':checked'); //gender
        var citizen = $('.citizen').is(':checked'); //citizen or resident

        var id = generateID(dob.replace(/-/g, "").substring(dob.length-8), male, citizen);

        placeId(id);
        checkForValidID();
    });

    $('.copy-button').click(function () {
        var $hidden = $('.hidden');
        $hidden.val(getTotalID()).select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy email command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    });
});
