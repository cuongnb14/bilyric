function PlayerAdapter(playerFrame) {
    this.playerFrame = playerFrame;

    this.getTimeSong = function () {
        var dtime = this.playerFrame.document.getElementsByClassName('jp-duration')[0].textContent;
        dtime = dtime.split(":");
        durationTime = parseInt(dtime[0]) * 60 + parseInt(dtime[1]);
        return durationTime;
    };

    this.getCurrentTime = function () {
        return this.playerFrame.zmp3HTML5.currentTime;
    };

    this.playAt = function (absoluteTime) {
        this.playerFrame.zmp3HTML5.player.jPlayer('play', absoluteTime);
    }
}

/**
 * process subtitles
 * @param subtitle array
 */
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

    // var zmp3Frame = document.getElementById("zmp3-frame").contentWindow;

    zmp3HTML5 = null;
    $("#zmp3-frame").on("load", function () {
        zmp3Frame = document.getElementById("zmp3-frame").contentWindow;
        zmp3HTML5 = zmp3Frame.zmp3HTML5;
    });

    // var play = setInterval(function () {
    //     if (zmp3HTML5.currentTime == 0) {
    //         zmp3HTML5.player.jPlayer("play", 0);
    //     } else {
    //         clearInterval(play);
    //     }
    // }, 1000);

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


function Subtitles(subtitles) {
    this.sub1 = new Srt(subtitles["sub1"]);
    this.sub2 = new Srt(subtitles["sub2"]);

    this.jsub1 = $("#sub1");
    this.jsub2 = $("#sub2");
    this.transcript = $("#transcript");

    this.index = 0;
    this.preIndex = 0;
    this.preTime = 0;

    this.player = new PlayerAdapter(document.getElementById("zmp3-frame").contentWindow);

    this.appendTranscript = function () {
        var transcript = this.transcript.find("ul");
        for (i = 0; i < this.sub1.lines.length; i++) {
            var element = "";
            if (jQuery.type(this.sub2.lines) !== 'undefined') {
                element = '<li class="tline" data-index="' + i + '" id="tline-' + i + '">' +
                    '<p class="tsub1"> ' + this.sub1.lines[i].subtitle + '</p>' +
                    '<p class="tsub2">' + this.sub2.lines[i].subtitle + '</p>' +
                    '</li>';
            } else {
                element = '<li class="tline" data-index="' + i + '" id="tline-' + i + '">' +
                    '<p class="tsub1">' + this.sub1.lines[i].subtitle + '</p>' +
                    '</li>';
            }
            transcript.append(element);
        }

        this.transcript.mCustomScrollbar({
            axis: "y",
            setHeight: 500,
            theme: "dark"
        });
    };

    this.isInIndex = function (time, index) {
        return time > this.sub1.lines[index].start.abtime && time < this.sub1.lines[index].end.abtime;
    };

    this.getIndex = function (time) {
        for (i = 0; i < this.sub1.lines.length; i++) {
            if (this.isInIndex(time, i)) {
                return i;
            }
        }
        return this.index;
    };

    this.action = function () {
        this.jsub1.text(this.sub1.lines[this.index].subtitle);
        if (jQuery.type(this.sub2.lines) !== 'undefined') {
            this.jsub2.text(this.sub2.lines[this.index].subtitle);
        }
        var preLine = this.index - 1;
        if (preLine < 0) {
            preLine = 0;
        }
        if (!this.transcript.is(":hover")) {
            this.transcript.mCustomScrollbar("scrollTo", "#tline-" + preLine);
        }
        this.transcript.find("#tline-" + this.preIndex).removeClass("active");
        this.transcript.find("#tline-" + this.index).addClass("active");
        this.preIndex = this.index;
    };

    this.updateSubtitles = function () {
        try {
            currentTime = this.player.getCurrentTime();
            // if (autoplay == 1) {
            //     nextSong(currentTime);
            // }
            if (currentTime == this.preTime) {
                return 0;
            }
            if (!this.isInIndex(currentTime, this.index)) {
                if (this.isInIndex(currentTime, this.index + 1)) {
                    this.index += 1;
                    this.action();
                } else {
                    this.index = this.getIndex(currentTime);
                    if (this.index != null) {
                        this.action(this.index);
                    }
                }
            }
            this.preTime = currentTime;
        } catch (err) {
            //console.log(err);
        }
    };

    this.start = function () {
        this.appendTranscript();
        context = this;
        $(".tline").click(function () {
            context.index = $(this).data("index");
            context.player.playAt(context.sub1.lines[context.index].start.abtime);
            context.action(context.index);
        });
        setInterval(this.updateSubtitles.bind(this), 500);
    }
}
