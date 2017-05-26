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
        $("#gundem-content").append($(html).find("#content-body .topic-list li"));
        $("#content-body .full-index-continue-link-container").remove();
        $("#content-body .topic-list-description").remove();

    });
}

function fix_link(elem){
    $(elem).attr("href", "https://eksisozluk.com/" + $(elem).attr("href"));
    $(elem).attr("target","_blank" );
}


var setintervalid = 0;

$(document).ready(function () {

    $("#progresbar").progressbar();
    $("#progresbar").progressbar("option", "value", false);
    $("#progresbar").hide();
    get_gundem("https://eksisozluk.com/basliklar/gundem");

    $(document).on('click', '#ilk', function () {
        var vis = $("#firstentry").css("display");
        if (vis == "none"){
            $("#firstentry").css("display", "block");
        }
        else{
            $("#firstentry").css("display", "none");
        }

    });

    $(document).on('click', '#gundem-content li a', function () {
        $("#entry-live").empty();
        $("#entry-header").empty();
        $("#progresbar").show();
        var lastentryid = 0;

        clearInterval(setintervalid);
        var basliklink = "https://eksisozluk.com/" + $(this).attr("data-href");
        basliklink = basliklink.replace("?a=popular", "");
        setintervalid = setInterval(function () {

            //get title
            $.get(basliklink, function (data) {
                $("#progresbar").hide();

                var html = $.parseHTML(data);
                var pagecount = $(html).find(".pager").first().attr("data-pagecount");

                if (lastentryid == 0) {
                    $("#entry-header").empty();
                    $("#entry-header").html($(html).find("#title"));

                    var first_entry =   $(html).find("#entry-list li").first();

                    //add butttons
                    $("#entry-header").append("<button id='ilk' class='btn-link'>İlk Entry</button><li style='display: none;' id='firstentry'>"+first_entry.html()+"</li>");

                    fix_link($("#entry-header h1 a"));

                    //fix links
                    $("#entry-header .b").each(function () {
                        fix_link(this);
                    });
                    fix_link($("#entry-header .entry-date"));
                    fix_link($("#entry-header .entry-author"));

                }
                //get lasest page
                $.get(basliklink + "?p=" + pagecount, function (data) {
                    var html = $.parseHTML(data);
                    $(html).find("#entry-list li").each(function () {
                        var entryid = $(this).attr("data-id");
                        if (entryid > lastentryid) {

                            //fix links
                            $(this).find(".b").each(function () {
                                fix_link(this);
                            });
                            fix_link($(this).find(".entry-date"));
                            fix_link($(this).find(".entry-author"));
                            $("#entry-live").prepend("<li class='col'>" + $(this).html() + "</li>");
                            lastentryid = entryid;
                        }
                    });


                });


            });
        }, 2000);
    });


});