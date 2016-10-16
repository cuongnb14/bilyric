jQuery(document).ready(function ($) {
    var subPanel = $(".cl-sub-panel").clone().css("display", "none");
    var subContainer = $("#cl-subtitles-container ul");
    //var pnindex = 1;
    var player = new PlayerAdapter(document.getElementById("zmp3-frame").contentWindow);


    $("#cl-add-btn").click(function () {
        var addNumber = $("#cl-add-number").val();
        for (i = 0; i < addNumber; i++) {
            pnindex = pnindex + 1;
            var newId = "ps" + pnindex;
            var newPanel = subPanel.clone();
            newPanel.attr("id", newId);
            newPanel.find(".ps-order").text(pnindex);
            newPanel.find(".ps-action").attr("fpn", newId);
            subContainer.append(newPanel);
            newPanel.show("fast");
        }
        setTimeout(function () {
            $("#cl-subtitles-container").mCustomScrollbar("scrollTo", "#ps"+pnindex);
        }, 300)

    });

    $("#cl-go-btn").click(function () {
        var lineNumber = $("#cl-go-line").val();
        $("#cl-subtitles-container").mCustomScrollbar("scrollTo", "#ps" + lineNumber);
    });
    $("#cl-go-pre").click(function () {
        var lineNumber = parseInt($("#cl-go-line").val());
        lineNumber = lineNumber - 1;
        $("#cl-go-line").val(lineNumber);
        $("#cl-subtitles-container").mCustomScrollbar("scrollTo", "#ps" + lineNumber.toString());
    });
    $("#cl-go-next").click(function () {
        var lineNumber = parseInt($("#cl-go-line").val());
        lineNumber = lineNumber + 1;
        $("#cl-go-line").val(lineNumber);
        $("#cl-subtitles-container").mCustomScrollbar("scrollTo", "#ps" + lineNumber.toString());
    });

    $("#cl-apply-subs").click(function () {
        var sub1 = [];
        var sub2 = [];
        var lineId = 0;
        $(".cl-sub-panel").each(function (index) {
            lineId += 1;
            var lineSub1 = {};
            var lineSub2 = {};
            lineSub1.id = lineSub2.id = lineId;
            lineSub2.startTime = lineSub1.startTime = $(this).find(".ps-start").val() * 1000;
            lineSub2.endTime = lineSub1.endTime = $(this).find(".ps-end").val() * 1000;
            lineSub1.text = $(this).find(".ps-sub1").val();
            lineSub2.text = $(this).find(".ps-sub2").val();
            if (lineSub2.text == ""){
                lineSub2.text = "...";
            }
            sub1.push(lineSub1);
            sub2.push(lineSub2);
        });
        var subtitles = {
            sub1: parser.toSrt(sub1),
            sub2: parser.toSrt(sub2)
        };
        subtitleHandler.reSetSubtitle(subtitles);
    });

    $("#cl-subtitles-container").on("click", ".ps-remove", function () {
        var idPanel = $(this).attr("fpn");
        $("#" + idPanel).hide("fast", function () {
            $("#" + idPanel).remove();
        });
    });
    $("#cl-subtitles-container").on("click", ".ps-play", function () {
        var idPanel = $(this).attr("fpn");
        var startTime = $("#" + idPanel).find(".ps-start").val();
        console.log(startTime);
        subtitleHandler.player.playAt(parseInt(startTime));
    });
    $("#cl-subtitles-container").on("click", ".ps-start-btn", function () {
        $(this).closest(".cl-sub-panel").find(".ps-start").val(player.getCurrentTime());
    });
    $("#cl-subtitles-container").on("click", ".ps-end-btn", function () {
        $(this).closest(".cl-sub-panel").find(".ps-end").val(player.getCurrentTime());
    });

    $("#cl-subtitles-container").mCustomScrollbar({
        axis: "y",
        setHeight: 470,
        theme: "dark",
        mouseWheelPixels: 150,
        scrollButtons: {enable: true, scrollAmount: 35},
        keyboard:{ enable: true },
    });
});
