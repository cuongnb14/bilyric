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
        try {
            return time > this.sub1.lines[index].start.abtime && time < this.sub1.lines[index].end.abtime;
        } catch (err) {
            return false;
        }
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
                        this.action();
                    }
                }
            }
            this.preTime = currentTime;
        } catch (err) {
            console.log(err);
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
