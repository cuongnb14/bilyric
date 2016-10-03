// All Ajax

// Configs url
SEARCH_URL = "/ajax/search";
FAVOR_BASE_URL = "/ajax/favor/";
AJAX_SONG_BASE_URL = "/ajax/songs/";
GET_ZMP3ID_URL = "/ajax/get-zmp3id";
AJAX_SUBTITLES_BASE_URL = "ajax/subtitles/";


function updateSong(id, song, callback) {
    $.ajax({
        url: AJAX_SONG_BASE_URL + id,
        type: 'post',
        async: true,
        cache: false,
        data: song,
        dataType: 'json',
        success: function (data) {
            toastr[data.status](data.message);
            if (data.status == 'success') {
                if (callback != null) {
                    callback();
                }
            }
        }
    });
}

function get_zmp3id(zmp3_link, callback) {
    $.ajax({
        url: GET_ZMP3ID_URL,
        type: 'get',
        async: true,
        cache: false,
        data: {zmp3_link: zmp3_link},
        dataType: 'json',
        success: function (data) {
            if (data.status == 'success') {
                toastr[data.status](data.message.zmp3id);
                console.log(data.message.zmp3id);
                if (callback != null) {
                    callback(data);
                }
            } else {
                toastr[data.status](data.message);
            }
        }
    });
}

function favor(action, song_id, callback) {
    $.ajax({
        url: FAVOR_BASE_URL + song_id,
        type: action,
        async: false,
        cache: false,
        data: {song_id: song_id},
        dataType: 'json',
        success: function (data) {
            if (data.status == 'success') {
                toastr[data.status](data.message);
                if (callback != null) {
                    callback(data);
                }
            } else {
                toastr[data.status](data.message);
            }
        }
    });
}

jQuery(document).ready(function ($) {

    // user's favor
    $(".favor").click(function () {
        var context = this;
        var song_id = $(this).data("song");
        var action = $(this).data("action");
        favor(action, song_id, function (data) {
            $(context).find("i").toggleClass('fa-heart');
            $(context).find("i").toggleClass('fa-heart-o');
            if (action == 'post') {
                $(context).data('action', 'delete');
                $(context).attr('title', 'Xóa khỏi bài hát yêu thích');
            } else {
                $(context).data('action', 'post');
                $(context).attr('title', 'Thêm vào bài hát yêu thích');
            }
        });
    });

    // Admin bar
    $("#toggle-toolbar").click(function () {
        $("#admin-toolbar").slideToggle("400");
    });
    $("#bybot").click(function () {
        var value = $("#bybot>i").data("value");
        updateSong($(this).data("song"), {'bybot': value}, function () {
            $("#bybot>i").toggleClass("fa-user-times");
            $("#bybot>i").toggleClass("fa-user");
            $("#bybot>i").data("value", 1 - value);
        });
    });
    $("#visible").click(function () {
        var value = $("#visible>i").data("value");
        updateSong($(this).data("song"), {'visible': value}, function () {
            $("#visible>i").toggleClass("fa-eye");
            $("#visible>i").toggleClass("fa-eye-slash");
            $("#visible>i").data("value", 1 - value);
        });
    });
    $("#get-zmp3id").click(function () {
        get_zmp3id($("#zmp3-link").val(), function (data) {
            $("#zmp3id").val(data.message.zmp3id);
            $("#zmp3xml").val(data.message.zmp3xml);
            $("#name").val(data.message.zmp3name);
            $("#artist").val(data.message.zmp3artist);

        })
    });
    $("#save-zmp3id").click(function () {
        updateSong($(this).data("song"),
            {'zmp3_id': $("#zmp3id").val(), 'zmp3_xml': $("#zmp3xml").val()},
            function () {

            }
        );
    });

    // search box
    $('#search-box>select').selectize({
        valueField: 'song_slug',
        labelField: 'title',
        searchField: 'title',
        placeholder: "Nhập tên bài hát hoặc ca sĩ",
        maxItems: 3,
        create: false,
        render: {
            option: function (item, escape) {
                return '<div>' +
                    '<h6 class="title">' +
                    '<i class="fa fa-music"></i> ' + escape(item.song_name) +
                    '<small class="artist">' + escape(item.song_artist) + '</small>' +
                    '</h6>' +
                    '</div>';
            }
        },
        load: function (query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: SEARCH_URL,
                type: 'GET',
                data: {q: query},
                error: function () {
                    callback();
                },
                success: function (res) {
                    callback(res.songs.slice(0, 30));
                }
            });
        }
    });
    $('#search-box>select').change(function () {
        if ($(this).val() !== '') {
            window.open('/song/' + $(this).val(), '_self');
        }
    });

    // turn off lights
    $("#lights").click(function () {
        $("#lights-background").addClass("off-lights");
        $(".tline p").css('color', '#eee');
        $("#search-box").css("z-index", '998');
    });
    $("#lights-background").click(function () {
        $(this).removeClass("off-lights");
        $(".tline p").css('color', '#353535');
        $("#search-box").css("z-index", '1001');
    });
});


