jQuery(document).ready(function ($) {
    var subPanel = $("#ps-tmpl").clone();
    var subContainer = $("#cl-subtitles-container ul");
    var player = new PlayerAdapter(document.getElementById("zmp3-frame").contentWindow);


    $("#cl-add-btn").click(function () {
        var addNumber = $("#cl-add-number").val();
        for (i = 0; i < addNumber; i++) {
            pnindex = pnindex + 1;
            var newId = "ps" + pnindex;
            var newPanel = subPanel.clone();
            newPanel.attr("id", newId);
            newPanel.addClass("cl-sub-panel");
            newPanel.find(".ps-order").text(pnindex);
            newPanel.find(".ps-action").attr("fpn", newId);
            subContainer.append(newPanel);
            newPanel.show("fast");
        }
        setTimeout(function () {
            $("#cl-subtitles-container").mCustomScrollbar("scrollTo", "#ps" + pnindex);
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
        var preLine1 = null;
        var preLine2 = null;
        $(".cl-sub-panel").each(function (index) {
            lineId += 1;
            var lineSub1 = {};
            var lineSub2 = {};

            lineSub1.id = lineSub2.id = lineId;
            lineSub2.startTime = lineSub1.startTime = $(this).find(".ps-start").val() * 1000;
            lineSub1.text = $(this).find(".ps-sub1").val();
            lineSub2.text = $(this).find(".ps-sub2").val();
            if (lineSub2.text == "") {
                lineSub2.text = "...";
            }
            if (preLine1 == null) {
                preLine1 = lineSub1;
                preLine2 = lineSub2;
            } else {
                preLine1.endTime = preLine2.endTime = lineSub2.startTime;
                sub1.push(preLine1);
                sub2.push(preLine2);
                preLine1 = lineSub1;
                preLine2 = lineSub2;
            }
        });
        preLine1.endTime = preLine2.endTime = player.getTimeSong() * 1000;
        sub1.push(preLine1);
        sub2.push(preLine2);
        var subtitles = {
            sub1: parser.toSrt(sub1),
            sub2: parser.toSrt(sub2)
        };
        subtitleHandler.reSetSubtitle(subtitles);
        toastr["success"]("Subtitles applied");
    });

    $("#cl-ft-apply").click(function (){
        var subtitles = {
            sub1: $("#cl-ft-text").val(),
            sub2: ""
        };
        subtitleHandler.reSetSubtitle(subtitles);
        subtitleHandler.renderToForm();
        $('.en-sub-modal').modal('hide');
        toastr["success"]("Subtitles applied");

    });

    $("#cl-ft-txt-apply").click(function (){
        var sub1 = $("#cl-ft-sub1-text").val().split("\n");
        var sub2 = $("#cl-ft-sub2-text").val().split("\n");
        var sub1Arr = [];
        var sub2Arr = [];
        sub1.forEach(function (item, index) {
            var line1 = {};
            var line2 = {};

            line1.id = line2.id = index + 1;
            line1.startTime = line1.endTime = line2.startTime = line2.endTime = 0;
            line1.text = item;
            try {
                if(sub2.length > index){
                    line2.text = sub2[index];
                    if(line2.text == ""){
                    line2.text = "...";
                }
                } else {
                    line2.text = "...";
                }
            } catch (err) {
                line2.text = "...";
            }
            sub1Arr.push(line1);
            sub2Arr.push(line2);
        });
        var subtitles = {
            sub1: parser.toSrt(sub1Arr),
            sub2: parser.toSrt(sub2Arr)
        };

        subtitleHandler.reSetSubtitle(subtitles);
        subtitleHandler.renderToForm();
        $('.sub-txt-modal').modal('hide');
        toastr["success"]("Subtitles applied");

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
        subtitleHandler.player.playAt(parseInt(startTime) - 2);
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
        keyboard: {enable: true},
    });
});
