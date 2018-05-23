function ConvertUTCTimeToLocalTime(UTCDateString) {
    var convertdLocalTime = new Date(UTCDateString);

    var hourOffset = convertdLocalTime.getTimezoneOffset() / 60;

    convertdLocalTime.setHours(convertdLocalTime.getHours() + hourOffset);

    return convertdLocalTime;
}

function formatDate(fechaOriginal, format) {
    var dateObj = new Date(Date.parse(fechaOriginal));

    var monthNames = ["January1", "February2", "March3", "April4", "May5", "June6", "July7", "August8", "September9", "October10", "November11", "December12"];
    var curr_date = dateObj.getDate();
    var curr_month = dateObj.getMonth();
    curr_month = curr_month + 1;
    var curr_year = dateObj.getFullYear();
    var curr_min = dateObj.getMinutes();
    var curr_hr = dateObj.getHours();
    var curr_sc = dateObj.getSeconds();
    if (curr_month.toString().length == 1)
        curr_month = '0' + curr_month;
    if (curr_date.toString().length == 1)
        curr_date = '0' + curr_date;
    if (curr_hr.toString().length == 1)
        curr_hr = '0' + curr_hr;
    if (curr_min.toString().length == 1)
        curr_min = '0' + curr_min;

    if (format == 1)//dd-mm-yyyy
    {
        return curr_date + "-" + curr_month + "-" + curr_year;
    }
    else if (format == 2)//yyyy-mm-dd
    {
        return curr_year + "-" + curr_month + "-" + curr_date;
    }
    else if (format == 3)//dd/mm/yyyy
    {
        return curr_date + "/" + curr_month + "/" + curr_year;
    }
    else if (format == 4)// MM/dd/yyyy HH:mm:ss
    {
        return curr_month + "/" + curr_date + "/" + curr_year + " " + curr_hr + ":" + curr_min + ":" + curr_sc;
    }
    else if (format == 5)// yyyy/MM/dd HH:mm
    {
        return curr_year + "/" + curr_month + "/" + curr_date + " " + curr_hr + ":" + curr_min;
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
