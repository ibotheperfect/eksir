/**
 * Created by ibrahim on 22.05.2017.
 */

var setintervalid = 0;
var basliklink = "";
var pagecount = 0;
var lastentryid = 0;

$.fn.exists = function () {
    return this.length !== 0;
};

function get_titles(url, title) {
    $("#gundem-content section").html("");
    $.ajax({
        url: url,
        type: "GET",
        timeout: 10000,

        success: function (data) {
            var html = $.parseHTML(data);

            //remove advertisement
            $(html).find("#sponsored-adrazzi-item-first").remove();

            //change href tag with data-href
            $(html).find("li a").each(function () {
                var val = jQuery.attr(this, "href");
                jQuery.attr(this, "data-href", val);
                jQuery.attr(this, "data-title", title);
                jQuery.removeAttr(this, "href");
            });

            //put content into div
            $("#" + title + "-topics").html($(html).find("#content-body .topic-list li"));
            $("#content-body .full-index-continue-link-container").remove();
            $("#content-body .topic-list-description").remove();
        },
        error: function () {
            $("#" + title + "-topics").html("Ekşisözlüğe erişilemiyor");
        }
    });
}

function fix_link(elem) {
    $(elem).attr("href", "https://eksisozluk.com/" + $(elem).attr("href"));
    $(elem).attr("target", "_blank");
}

function get_nice(link, curpage) {
    //get page
    $.ajax({
        url: link + "&p=" + curpage,
        type: 'GET',
        timeout: 10000,
        success: function (data) {
            var html = $.parseHTML(data);
            $(html).find("#entry-item-list li").each(function () {

                //fix links
                $(this).find(".b").each(function () {
                    fix_link(this);
                });
                fix_link($(this).find(".entry-date"));
                fix_link($(this).find(".entry-author"));
                $("#entry-nice").append("<li class='col'>" + $(this).html() + "</li>");


            });
            if ($(html).find(".pager").exists()) {
                var nicepagecount = $(html).find(".pager").first().attr("data-pagecount");
                if (curpage < 3 && nicepagecount > curpage) {
                    get_nice(link, curpage + 1);
                } else {
                    return;
                }
            } else {
                return;
            }
        },
        error: function () {
            console.log("Can not get page " + curpage);
        }

    });
}

function get_live(link) {

    //get lasest page
    $.ajax({
        url: link + "?p=" + pagecount,
        type: 'GET',
        timeout: 10000,
        success: function (data) {
            var html = $.parseHTML(data);
            var pagecountnew = $(html).find(".pager").first().attr("data-pagecount");

            $(html).find("#entry-item-list li").each(function () {
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
                    $('#entry-live li').first().delay(0).fadeOut().fadeIn('slow');
                }
            });

            if (pagecountnew == pagecount) {
                $("#progresbar").hide();
            } else {
                pagecount = pagecountnew;
            }
        },
        error: function () {
            console.log("Can not get page " + pagecount);
        }

    });
}

$(document).ready(function () {

    //jQuery.ajaxSetup({async: false, timeout: 4000});

    $("#progresbar").progressbar();
    $("#progresbar").progressbar("option", "value", false);
    $("#progresbar").hide();
    get_titles("https://eksisozluk.com/basliklar/gundem", "gundem");

    $(document).on('click', '#ilk', function () {
        var vis = $("#firstentry").css("display");
        if (vis == "none") {
            $("#firstentry").css("display", "block");
            $(this).css("font-weight", "bold");
        } else {
            $("#firstentry").css("display", "none");
            $(this).css("font-weight", "normal");
        }

    });

    $(document).on('click', '#gundem', function () {
        get_titles("https://eksisozluk.com/basliklar/gundem", "gundem");
    });

    $(document).on('click', '#debe', function () {
        get_titles("https://eksisozluk.com/debe", "debe");
    });

    $(document).on('click', '#entry-header .nice', function () {
        if ($(this).css("font-weight") == "bold") return;
        $("#progresbar").show();

        $("#entry-header .nice").css("font-weight", "normal");
        $(this).css("font-weight", "bold");

        $("#entry-nice").empty();


        if ($(this).attr("id") == "live") {
            $("#entry-live").css("display", "block");
            setintervalid = setInterval(function () {
                get_live(basliklink);
            }, 2000);
        } else {
            clearInterval(setintervalid);
            $("#entry-live").css("display", "none");

            get_nice(basliklink + "?a=" + $(this).val(), 1);
        }
        $("#progresbar").hide();

    });
    $(document).on('click', '#debe-topics li a', function () {
        $("#entry-live").empty();
        $("#entry-live").css("display", "block");
        $("#entry-header").empty();

        $("#entry-nice").empty();

        clearInterval(setintervalid);

        basliklink = "https://eksisozluk.com/" + $(this).attr("data-href");

        $.ajax({
            url: basliklink,
            type: 'GET',
            timeout: 10000,
            beforeSend: function () {
                $("#progresbar").show();
            },
            success: function (data) {
                $("#progresbar").hide();
                var html = $.parseHTML(data);

                $("#entry-header").empty();
                $("#entry-header").html($(html).find("#title"));
                fix_link($("#entry-header h1 a"));

                //fix links
                $("#entry-header .b").each(function () {
                    fix_link(this);
                });
                fix_link($("#entry-header .entry-date"));
                fix_link($("#entry-header .entry-author"));

                var first_entry = $(html).find("#entry-item-list li").first();
                //fix links
                first_entry.find(".b").each(function () {
                    fix_link(this);
                });
                fix_link(first_entry.find(".entry-date"));
                fix_link(first_entry.find(".entry-author"));
                $("#entry-live").prepend("<li class='col'>" + first_entry.html() + "</li>");


            },
            error: function () {
                $("#progresbar").hide();
                $("#entry-header").append("<span>Ekşisözlüğe bağlanılamıyor.</span>");
            }

        });
    });

    $(document).on('click', '#gundem-topics li a', function () {
        $("#entry-live").empty();
        $("#entry-live").css("display", "block");
        $("#entry-header").empty();

        $("#entry-nice").empty();

        clearInterval(setintervalid);

        lastentryid = 0;

        basliklink = "https://eksisozluk.com/" + $(this).attr("data-href");
        basliklink = basliklink.replace("?a=popular", "");


        //get title
        $.ajax({
            url: basliklink,
            type: 'GET',
            timeout: 10000,
            beforeSend: function () {
                $("#progresbar").show();
            },
            success: function (data) {
                var html = $.parseHTML(data);
                pagecount = $(html).find(".pager").first().attr("data-pagecount");
                pagecount -= 1;
                //pagecount = pagecount - 1;
                if (lastentryid == 0) {
                    $("#entry-header").empty();
                    $("#entry-header").html($(html).find("#title"));

                    var first_entry = $(html).find("#entry-item-list li").first();

                    //add butttons
                    $("#entry-header").append("<button id='ilk' class='btn-link'>İlk Entry</button>");
                    $("#entry-header").append("<button id='live' value='live' style='font-weight: bold;' class='nice btn-link'>Akıt</button>");

                    $("#entry-header").append("<span style='margin-left: 20px; font-size: 15px;'>Şukela:</span> <button id='nice' value='nice' class='nice btn-link'>Tümü</button>|" +
                        "<button id='dailynice' value='dailynice' class='btn-link nice'>Bugün</button>");
                    $("#entry-header").append("<li style='display: none;' id='firstentry'>" + first_entry.html() + "</li>");
                    fix_link($("#entry-header h1 a"));

                    //fix links
                    $("#entry-header .b").each(function () {
                        fix_link(this);
                    });
                    fix_link($("#entry-header .entry-date"));
                    fix_link($("#entry-header .entry-author"));

                }
                get_live(basliklink);
                setintervalid = setInterval(function () {
                    get_live(basliklink);
                }, 2000);
            },
            error: function () {
                $("#progresbar").hide();
                $("#entry-header").append("<span>Ekşisözlüğe bağlanılamıyor.</span>");
            }

        });
    });


});
