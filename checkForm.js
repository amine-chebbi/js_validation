let errors = [];
let types = ['text', 'number', 'url', 'email', 'date', 'time', 'datetime'];
let req = ['req', 'nreq'];

/* -------------------------------------------------------------------------- */
/*                               ERRORS MESSAGES                              */
/* -------------------------------------------------------------------------- */
let messages = {
    format: 'this field format data checker is wrong',
    required: 'this field is required',
    type: 'the type is not recognized',
    number_min: 'the minimum value should be : ',
    number_max: 'the maximum value should be : ',
    max_length: 'the maximum length should be : ',
    min_length: 'the minimum length should be : ',
    min_time: 'the minimum time should be : ',
    max_time: 'the maximum time should be : ',
    min_date: 'the minimum date should be : ',
    max_date: 'the maximum date should be : ',
    min_datetime: 'the minimum datetime should be : ',
    max_datetime: 'the maximum datetime should be : ',
    email: 'this email is not valid',
    number: 'this number is not valid',
    url: 'this url is not valid',
    date: 'this date is not valid',
    time: 'this time is not valid',
    datetime: 'this datetime is not valid',

};

function checkForm(arr) {
    errors = [];
    let messageErrors = document.querySelectorAll('.messageErrors');
    messageErrors.forEach(messageError => {
        messageError.remove();
    });
    // let inputs = form.querySelectorAll('input[data-checker]');

    arr.forEach(async i => {
        let input = document.querySelector('[name="' + i.name + '"]');
        let type;
        let value = input.value.trim();
        let required = false;
        let firstPart;
        let secondPart;
        let thirdPart;

        let dc = i.checker.trim();
        if (dc == "")
            return;
        /* -------------------------------------------------------------------------- */
        /*                     VALIDATE FIRST PART OF DATA-CHECKER                    */
        /* -------------------------------------------------------------------------- */
        firstPart = dc.split('|')[0];
        if (!validateFormatFirstPart(firstPart)) {
            errors.push({ name: input.name, error: messages.format })
            return;
        }
        type = firstPart.split(',')[0];
        if (firstPart.split(',')[1] === 'req')
            required = true;

        if (required == true && (value == null || value == '')) {
            errors.push({ name: input.name, error: messages.required })
            return;
        }

        if (type === "number" && isNaN(value)) {
            errors.push({ name: input.name, error: `${ messages.number }` })
            return;
        }
        if (type === "email" && !validateEmail(value)) {
            errors.push({ name: input.name, error: `${ messages.email }` })
            return;
        }
        if (type === "url" && !validateUrl(value)) {
            errors.push({ name: input.name, error: `${ messages.url }` })
            return;
        }
        if (type === "time" && !validateTime(value)) {
            errors.push({ name: input.name, error: `${ messages.time }` })
            return;
        }
        if (type === "date" && !validateDate(value)) {
            errors.push({ name: input.name, error: `${ messages.date }` })
            return;
        }
        if (type === "datetime" && !validateDatetime(value)) {
            errors.push({ name: input.name, error: `${ messages.datetime }` })
            return;
        }

        /* -------------------------------------------------------------------------- */
        /*                    VALIDATE SECOND PART OF DATA-CHECKER                    */
        /* -------------------------------------------------------------------------- */
        if (dc.split('|').length > 1) {
            secondPart = dc.split('|')[1];
            datas = secondPart.split(',');
        }

        if (secondPart !== undefined && secondPart !== null && !validateFormatSecondPart(type, secondPart, input.name, value)) {
            errors.push({ name: input.name, error: messages.format })
            return;
        }

    });
    errors.forEach(error => {
        let message = document.createElement('div')
        let small = document.createElement('small')
        message.classList = 'messageErrors'
        small.textContent = error.error;
        small.style.color = 'red';
        message.appendChild(small);
        let element = form.querySelector(`[name="${ error.name }"]`);
        element.parentNode.insertBefore(message, element.nextSibling);
    });

    if (errors.length > 0)
        return false
    else return true
}

function validateFormatFirstPart(firstPart) {
    let array = firstPart.split(',');
    if (array.length !== 2)
        return false;
    if (!types.includes(array[0]))
        return false;
    if (!req.includes(array[1]))
        return false;
    return true;
}

function validateFormatSecondPart(type, secondPart, name, value) {
    let valid = true;
    let array = secondPart.split(',');
    if (array.length > 2)
        return false;
    array.forEach(s => {
        if (!s.includes('min-') && !s.includes('max-')) {
            valid = false;
            return;
        }

        let info = s.split('-');
        if (info.length !== 2) {
            valid = false;
            return;
        }

        /* -------------------------------------------------------------------------- */
        /*                          VALIDATE MIN OR MAX VALUE                         */
        /* -------------------------------------------------------------------------- */

        if (['number', 'text', 'email', 'url'].includes(type) && isNaN(info[1]) === true) {
            valid = false;
            return;
        }

        if (type == "time" && !validateTime(info[1])) {
            valid = false;
            return;
        }
        if (type == "date" && !validateDate(info[1])) {
            valid = false;
            return;
        }
        if (type == "datetime" && !validateDatetime(info[1])) {
            valid = false;
            return;
        }

        /* -------------------------------------------------------------------------- */
        /*                    VALIDATE VALUE COMPARED TO MIN OR MAX                   */
        /* -------------------------------------------------------------------------- */

        if (type === "number" && info[0] === "min" && value < parseInt(info[1])) {
            errors.push({ name: name, error: `${ messages.min_length } ${ info[1] }` })
            return;
        }
        if (type === "number" && info[0] === "max" && value > parseInt(info[1])) {
            errors.push({ name: name, error: `${ messages.max_length } ${ info[1] }` })
            return;
        }
        if (['text', 'email', 'url'].includes(type) && info[0] === "min" && value.length < parseInt(info[1])) {
            errors.push({ name: name, error: `${ messages.min_length } ${ info[1] }` })
            return;
        }
        if (['text', 'email', 'url'].includes(type) && info[0] === "max" && value.length > parseInt(info[1])) {
            errors.push({ name: name, error: `${ messages.max_length } ${ info[1] }` })
            return;
        }

        if (type === "time" && info[0] === "min") {
            let compareResult = Date.parse('01/01/2011 ' + value) >= Date.parse('01/01/2011 ' + info[1]);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.min_time } ${ info[1] }` })
                return;
            }
        }
        if (type === "time" && info[0] === "max") {
            let compareResult = Date.parse('01/01/2011 ' + value) <= Date.parse('01/01/2011 ' + info[1]);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.max_time } ${ info[1] }` })
                return;
            }
        }

        if (type === "date" && info[0] === "min") {
            let d2 = new Date(info[1].split('/')[2], parseInt(info[1].split('/')[1]) - 1, parseInt(info[1].split('/')[0]));
            let d1 = new Date(value);
            d1.setHours(d2.getHours());
            d1.setMinutes(d2.getMinutes());
            d1.setSeconds(d2.getSeconds());
            d1.setMilliseconds(d2.getMilliseconds());
            let compareResult = (d1 >= d2);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.min_date } ${ info[1] }` })
                return;
            }
        }
        if (type === "date" && info[0] === "max") {
            let d2 = new Date(info[1].split('/')[2], parseInt(info[1].split('/')[1]) - 1, parseInt(info[1].split('/')[0]));
            let d1 = new Date(value);
            d1.setHours(d2.getHours());
            d1.setMinutes(d2.getMinutes());
            d1.setSeconds(d2.getSeconds());
            d1.setMilliseconds(d2.getMilliseconds());
            let compareResult = (d1 <= d2);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.max_date } ${ info[1] }` })
                return;
            }
        }

        if (type === "datetime" && info[0] === "min") {

            let d2 = new Date(
                info[1].split(' ')[0].split('/')[2],
                parseInt(info[1].split('/')[1]) - 1,
                parseInt(info[1].split('/')[0]),
                parseInt(info[1].split(' ')[1].split(':')[0]),
                parseInt(info[1].split(' ')[1].split(':')[1]),
                parseInt(info[1].split(' ')[1].split(':')[2]));
            let d1 = new Date(value);
            let compareResult = (d1 >= d2);
            console.log(d1);
            console.log(d2);
            console.log(compareResult);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.min_datetime } ${ info[1] }` })
                return;
            }
        }
        if (type === "datetime" && info[0] === "max") {
            let d2 = new Date(
                info[1].split(' ')[0].split('/')[2],
                parseInt(info[1].split('/')[1]) - 1,
                parseInt(info[1].split('/')[0]),
                parseInt(info[1].split(' ')[1].split(':')[0]),
                parseInt(info[1].split(' ')[1].split(':')[1]),
                parseInt(info[1].split(' ')[1].split(':')[2]));
            let d1 = new Date(value);
            let compareResult = (d1 <= d2);
            console.log(d1);
            console.log(d2);
            console.log(compareResult);
            if (!compareResult) {
                errors.push({ name: name, error: `${ messages.max_datetime } ${ info[1] }` })
                return;
            }
        }

    });

    return valid;
}

function validateUrl(val) {
    let urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    let validUrl = new RegExp(urlPattern).test(val)
    return validUrl;
}

function validateEmail(val) {
    let emailPattern = new RegExp("^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", "gm");
    return emailPattern.test(val);
}

function validateTime(val) {
    let timePattern = '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$';
    let validTime = new RegExp(timePattern, 'i').test(val)
    return validTime;
}

function validateDate(date) {
    let dateRegex_ddmmyyyy = '^(3[01]|[12][0-9]|0[1-9])[\/-](1[0-2]|0[1-9])[\/-][0-9]{4}$';
    let dateRegex_yyyymmdd = '^[0-9]{4}[\/-](1[0-2]|0[1-9])[\/-](3[01]|[12][0-9]|0[1-9])$';
    let r1 = new RegExp(dateRegex_yyyymmdd, 'i').test(date);
    let r2 = new RegExp(dateRegex_ddmmyyyy, 'i').test(date);
    return (new RegExp(dateRegex_yyyymmdd, 'i').test(date) ||
        new RegExp(dateRegex_ddmmyyyy, 'i').test(date));
}

function validateDatetime(datetime) {
    let tmp;
    if (datetime.includes('T'))
        tmp = datetime.split('T');
    if (datetime.includes(' '))
        tmp = datetime.split(' ');
    if (tmp.length !== 2) return false;
    let date = tmp[0];
    let time = tmp[1]
    let res = validateTime(time) && validateDate(date)
    return res
}