function caller() {
    var s = $("#start").val();
    var e = $("#end").val();
    var park = $("#parkPicker").val();
    $.ajax({
        //https://disneyworld.disney.go.com/availability-calendar/api/calendar?segment=tickets&startDate=2021-10-01&endDate=2021-10-02
        url: "/caller",
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({ start: s, end: e, park: park, passtype: $('#passPicker').val() }),
        success: function (result) {
            $("#dates").text("");
            function cardMaker(date, bool) {
                if (date) {
                    title = "Date: "+date;
                } else {
                    title ="not in range";
                }

                if (bool == true){
                    var symbol = '&#10004';
                    var className = 'true';
                } else if (bool== false){
                    var symbol = '&#10006';
                    var className = 'false';
                } else {
                    var symbol = "&#10145";
                    var className = 'neutral';
                }
                return '<div class = "card"><div class = "title">'+title+'</div><div class = "bool '+ className +'"> '+symbol+'</div></div>'
            }
        
            var dates = 0;
            var trues = 0;
            for (const [date, bool] of Object.entries(result["dates"])) {

                var day = moment.tz(date, 'US/Eastern');
                console.log(day);
                var weekday = day.day();

                if (dates == 0) {
                    $("#results").html("<div class = 'weekday' id = '0'></div><div class = 'weekday' id = '1'></div><div class = 'weekday' id = '2'></div><div class = 'weekday' id = '3'></div><div class = 'weekday' id = '4'></div><div class = 'weekday' id = '5'></div><div class = 'weekday' id = '6'></div>");
                    var i=0;
                    while (i < weekday) {
                        $('#'+i).append(cardMaker());
                        i++;
                    }
                }

                $('#'+ weekday).append(cardMaker(date, bool));

                    // $("#dates").append(cardMaker(date, bool));
                if (bool == true) {

                    trues++;
                    $("body").css("background-color", "#00ff66");
                }
                dates++;
            }

            if (trues == 0) {
                $("body").css("background-color", "#ffffff");
            }


        },
        error: function (e) {
            console.log("in the error");
            console.log(e);
        }
    });
}

function repeater () {
    setInterval(caller, 60000);
}


$(function () {


    $("#submit").click(function () {
        console.log("hello");
        caller();
        // repeater();
    });

});