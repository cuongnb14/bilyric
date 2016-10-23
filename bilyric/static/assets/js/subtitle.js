pnindex = 1;
isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
function PlayerAdapter(playerFrame) {
    this.timeSong = 0;

    this.playerFrame = playerFrame;

    this.getTimeSong = function () {
        if (this.timeSong == 0) {
            var dtime = this.playerFrame.document.getElementsByClassName('jp-duration')[0].textContent;
            dtime = dtime.split(":");
            this.timeSong = parseInt(dtime[0]) * 60 + parseInt(dtime[1]);
        }
        return this.timeSong;
    };

    this.getCurrentTime = function () {
        return this.playerFrame.zmp3HTML5.currentTime;
    };

    this.playAt = function (absoluteTime) {
        this.playerFrame.zmp3HTML5.player.jPlayer('play', absoluteTime);
    }
}

function Subtitles(subtitles) {
    this.subtitles = subtitles;

    this.sub1 = new Srt(subtitles["sub1"]);
    this.sub2 = new Srt(subtitles["sub2"]);

    this.jsub1 = $("#sub1");
    this.jsub2 = $("#sub2");
    this.transcript = $("#transcript");

    this.index = 0;
    this.preIndex = 0;
    this.preTime = 0;

    this.player = new PlayerAdapter(document.getElementById("zmp3-frame").contentWindow);

    this.reSetSubtitle = function (subtitles) {
        console.log(subtitles["sub1"]);
        this.subtitles = subtitles;
        this.sub1 = new Srt(subtitles["sub1"]);
        this.sub2 = new Srt(subtitles["sub2"]);
        this.transcript.find("ul").empty();
        this.appendTranscript();
    };

    this.getLineSub2 = function (sub2, index) {
        try {
            return sub2.lines[index];
        } catch (err) {
            return "";
        }
    };

    this.renderToForm = function () {
        try {
            var subContainer = $("#cl-subtitles-container ul");
            if(subContainer.length == 0) {
                return 0;
            }
            var subPanel = $("#ps-tmpl").clone();
            subContainer.empty();

            var context = this;
            pnindex = 1;
            this.sub1.lines.forEach(function (item, index) {
                var newId = "ps" + pnindex;
                var newPanel = subPanel.clone();
                newPanel.attr("id", newId);
                newPanel.addClass("cl-sub-panel");
                newPanel.find(".ps-order").text(pnindex);
                newPanel.find(".ps-action").attr("fpn", newId);
                subContainer.append(newPanel);
                newPanel.show("fast");
                context.lineToPanel(item, context.getLineSub2(context.sub2, index), newId);
                pnindex = pnindex + 1;
                return 1;
            })
        } catch (err) {
            console.log(err);
        }

    };

    this.lineToPanel = function (sub1, sub2, panelId) {
        $("#" + panelId).find(".ps-start").val(sub1.start.abtime);
        $("#" + panelId).find(".ps-end").val(sub1.end.abtime);
        $("#" + panelId).find(".ps-sub1").val(sub1.subtitle);
        $("#" + panelId).find(".ps-sub2").val(sub2.subtitle);
    };

    this.appendTranscript = function () {
        try {
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
        } catch (err) {
            //console.log(err);
        }
    };

    this.isInIndex = function (time, index) {
        try {
            return time >= this.sub1.lines[index].start.abtime && time < this.sub1.lines[index].end.abtime;
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
        if (!this.transcript.is(":hover") || isMobile) {
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
            //console.log(err);
        }
    };

    this.start = function () {
        this.appendTranscript();

        // event for subtitles
        context = this;

        this.transcript.on("click", ".tline", function () {
            context.index = $(this).data("index");
            context.player.playAt(context.sub1.lines[context.index].start.abtime);
            context.action(context.index);
        });

        $("#shift").change(function () {
            var value = $("#shift").val();
            context.sub1 = new Srt(context.subtitles["sub1"]);
            context.sub1.shift(value, "seconds");
            if (jQuery.type(context.sub2.lines) !== 'undefined') {
                context.sub2 = new Srt(context.subtitles["sub2"]);
                context.sub2.shift(value, "seconds");
            }
            context.renderToForm();
        });

        $('#save-shift').click(function () {
            var sub2Content = "";
            if (jQuery.type(context.sub2.lines) !== 'undefined') {
                sub2Content = context.sub2.getSrtContent()
            }
            $.ajax({
                url: $(this).data("url"),
                async: true,
                type: 'post',
                dataType: "json",
                data: {
                    'sub1': context.sub1.getSrtContent(),
                    'sub2': sub2Content
                },
                success: function (data) {
                    toastr[data.status](data.message);
                }
            });
        });

        setInterval(this.updateSubtitles.bind(this), 500);
    }
}

