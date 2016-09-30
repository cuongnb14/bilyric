/**
 * Requirement mCustomScrollbar.js
 * Create transcript for html element have format:
 *      <div id="transcript">
            <ul>

            </ul>
        </div>
 *
 * @param sub1 Srt subtitle 1
 * @param sub2 Srt subtitle 2
 * @returns {*|jQuery|HTMLElement}
 */
function appendTranscript(sub1, sub2) {
    var transcript = $("#transcript>ul");
    for (i = 0; i < sub1.lines.length; i++) {
        var element = "";
        if (jQuery.type(sub2.lines) !== 'undefined') {
            element = '<li class="tline" data-index="' + i + '" id="tline-' + i + '">' +
                '<p class="tsub1"> ' + sub1.lines[i].subtitle + '</p>' +
                '<p class="tsub2">' + sub2.lines[i].subtitle + '</p>' +
                '</li>';
        } else {
            element = '<li class="tline" data-index="' + i + '" id="tline-' + i + '">' +
                '<p class="tsub1">' + sub1.lines[i].subtitle + '</p>' +
                '</li>';
        }
        transcript.append(element);
    }

    $("#transcript").mCustomScrollbar({
        axis: "y",
        setHeight: 500,
        theme: "dark"
    });
    return $("#transcript");
}

// function PlayerAdapter(playerFrame) {
//
// }

function processSubtitle(subtitle) {
    var sub1 = new Srt(subtitle["sub1"]);
    var sub2 = new Srt(subtitle["sub2"]);

    var transcript = appendTranscript(sub1, sub2);

    var index = 0;
    var preIndex = 0;
    var preTime = 0;
    var durationTime = 0;
    var slugNextSong = $(".random-song").data("slug");

    var autoplay = readCookie('autoplay');
    if (autoplay == null) {
        autoplay = 1;
        createCookie('autoplay', 1, 360);
    }

    var state = false;
    if (autoplay == 1) {
        state = true;
    }

    $(".switch").bootstrapSwitch({
        state: state,
        size: "mini",
        offColor: "warning"
    });

    $('.switch').on('switchChange.bootstrapSwitch', function (event, state) {
        if (state) {
            createCookie('autoplay', 1, 360);
            autoplay = 1;
        } else {
            createCookie('autoplay', 0, 360);
            autoplay = 0;
        }
    });


    function isInIndex(time, sub, i) {
        return time > sub.lines[i].start.abtime && time < sub.lines[i].end.abtime;
    }

    function findIndex(time, sub) {
        for (i = 0; i < sub.lines.length; i++) {
            if (isInIndex(time, sub, i)) {
                return i;
            }
        }
        return index;
    }

    function action(index) {
        $("#sub1").text(sub1.lines[index].subtitle);
        if (jQuery.type(sub2.lines) !== 'undefined') {
            $("#sub2").text(sub2.lines[index].subtitle);
        }
        var pre = index - 1;
        if (pre < 0) {
            pre = 0;
        }
        if (!transcript.is(":hover")) {
            transcript.mCustomScrollbar("scrollTo", "#tline-" + pre);
        }
        transcript.find("#tline-" + preIndex).removeClass("active")
        transcript.find("#tline-" + index).addClass("active")
        preIndex = index;
    }

    var zmp3Frame = document.getElementById("zmp3-frame").contentWindow;

    zmp3HTML5 = null;
    $("#zmp3-frame").on("load", function () {
        zmp3Frame = document.getElementById("zmp3-frame").contentWindow;
        zmp3HTML5 = zmp3Frame.zmp3HTML5;
    });

    var play = setInterval(function () {
        if (zmp3HTML5.currentTime == 0) {
            zmp3HTML5.player.jPlayer("play", 0);
        } else {
            clearInterval(play);
        }
    }, 1000);

    function nextSong(currentTime) {
        if (durationTime == 0) {
            var dtime = zmp3Frame.document.getElementsByClassName('jp-duration')[0].textContent;
            dtime = dtime.split(":");
            durationTime = parseInt(dtime[0]) * 60 + parseInt(dtime[1]);
        }
        if (durationTime != 0 && currentTime > (durationTime - 1.5)) {
            setTimeout(function () {
                window.open('/song/' + slugNextSong, '_self');
            }, 4);
        }
    }

    function updateSubtitle() {
        try {
            if (zmp3HTML5 == null) {
                zmp3HTML5 = zmp3Frame.zmp3HTML5;
            }
            currentTime = zmp3HTML5.currentTime;
            if (autoplay == 1) {
                nextSong(currentTime);
            }
            if (currentTime == preTime) {
                return 0;
            }
            currentTime = currentTime + 0.5;
            if (currentTime > sub1.lines[index].end.abtime) {
                if (isInIndex(currentTime, sub1, index + 1)) {
                    index += 1;
                    action(index);
                } else {
                    index = findIndex(currentTime, sub1);
                    if (index != null) {
                        action(index);
                    }
                }
            } else {
                if (!isInIndex(currentTime, sub1, index)) {
                    index = findIndex(currentTime, sub1);
                    if (index != null) {
                        action(index);
                    }
                }
            }
            preTime = zmp3HTML5.currentTime;
        } catch (err) {

        }
    }

    $(".tline").click(function () {
        index = $(this).data("index");
        zmp3HTML5.player.jPlayer('play', sub1.lines[index].start.abtime);
        action(index);
    });

    $("#shift").change(function () {
        var value = $("#shift").val();
        sub1 = new Srt(subtitle["sub1"]);
        sub1.shift(value, "seconds");
        if (jQuery.type(sub2.lines) !== 'undefined') {
            sub2 = new Srt(subtitle["sub2"]);
            sub2.shift(value, "seconds");
        }
    });

    $('#save-shift').click(function () {
        var sub2Content = "";
        if (jQuery.type(sub2.lines) !== 'undefined') {
            sub2Content = sub2.getSrtContent()
        }
        $.ajax({
            url: $(this).data("url"),
            async: true,
            type: 'post',
            dataType: "json",
            data: {
                'sub1': sub1.getSrtContent(),
                'sub2': sub2Content
            },
            success: function (data) {
                toastr[data.status](data.message);
            }
        });
    });

    setInterval(updateSubtitle, 500);
}
