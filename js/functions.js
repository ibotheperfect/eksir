/**
 * Created by ibrahim on 22.05.2017.
 */


$( document ).ready(function() {
    $.get( "https://eksisozluk.com/basliklar/gundem", function( data ) {
        $( ".result" ).html( data );
            var html = $.parseHTML(data);

            $("#gundem").html($(html).find(".topic-list"));
    });

});