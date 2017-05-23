/**
 * Created by ibrahim on 22.05.2017.
 */

function get_gundem(url) {
    $.get(url, function (data) {
        var html = $.parseHTML(data);

        //remove advertisement
        $(html).find("#sponsored-adrazzi-item-first").remove();

        //change href tag with data-href
        $(html).find("li a").each(function () {
            var val = jQuery.attr(this, "href");
            jQuery.attr(this, "data-href", val);
            jQuery.removeAttr(this, "href");
        });

        //put content into div
        $("#gundem-content").html($(html).find("#content-body"));


    });
}
var setintervalid = 0;
var lastentryid = 0;

$(document).ready(function () {
    get_gundem("https://eksisozluk.com/basliklar/gundem");
    $(document).on('click', 'li a', function () {
        $("#entry").empty();
        clearInterval(setintervalid);
        var basliklink = "https://eksisozluk.com/" + $(this).attr("data-href");
        basliklink = basliklink.replace("?a=popular", "");
        console.log(basliklink);
        setintervalid = setInterval(function() {

            //get title
            $.get(basliklink, function (data) {
                var html = $.parseHTML(data);
                var pagecount = $(html).find(".pager").first().attr("data-pagecount");
                //get lasest page
                $.get(basliklink + "?p=" + pagecount, function (data) {
                    var html = $.parseHTML(data);
                    entryid =  $(html).find("#entry-list li").last().attr("data-id");
                    if (entryid != lastentryid) {
                        $("#entry").append($(html).find("#entry-list li .content").last().text() + "<br><br>");
                        lastentryid = entryid;
                    }

                });


            });
        }, 2000);
    });


});