function caller() {
    var s = $("#start").val();
    var e = $("#end").val();
    var hollywood = "80007998";
    var magicKingdom = "80007944";
    var epcot = "80007838";
    var animalKingdom = "80007823";
    console.log(s);
    console.log(e);
    $.ajax({
        //https://disneyworld.disney.go.com/availability-calendar/api/calendar?segment=tickets&startDate=2021-10-01&endDate=2021-10-02
        url:"192.168.1.12:3000/caller",
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({'start': s, 'end': e, 'park': magicKingdom, "passtype": "passholder"}),
        success: function(result){
            console.log(result);
        },
        error: function(e){
            console.log("in the error");
            console.log(e);
        }
    });
}


$(function(){

    $("#submit").click(function(){
        console.log("hello");
        caller();
    });

});