// Mythium Archive: https://archive.org/details/mythium/


window.onload = function(){
    init();
    document.getElementById('logoutBtn').onclick = logout;
    fetchAllSongs();
    fetchAllPlayLists();

    const source = document.getElementById('search');

    source.addEventListener('input', inputHandler);
    //source.addEventListener('propertychange', inputHandler); // for IE8
// Firefox/Edge18-/IE9+ don’t fire on <select><option>
   // source.addEventListener('change', inputHandler);
}

const inputHandler = function(e) {
    searchSongs(e.target.value);
}

function searchSongs(search){
    fetch('http://localhost:3000/api/music?search='+ search +' ', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(songs => {
            console.log(songs);
            $('#plList').empty();
            loadData(songs);
        });

}

function fetchAllSongs(){
    fetch('http://localhost:3000/api/music', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(songs => {
            console.log(songs);
            loadData(songs);
        });

}

function fetchAllPlayLists(){
    fetch('http://localhost:3000/api/playlist', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(playLists => {
            console.log(playLists);
            loadDataPlayLists(playLists);
        });
}

function removeFromPlayList(songId){
    const data = { songId: "071b2ec8-9635-4011-b589-620ab157e077" };
    fetch('http://localhost:3000/api/playlist/remove', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            songId,
        }),
    })
        .then(() => {
            $('#plList2').empty();
            fetchAllPlayLists();
        });

}

function addToPlayList(songId){
    //const data = { songId: id };
    fetch('http://localhost:3000/api/playlist/add', {
        method: 'POST', // or 'PUT'
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            songId,
        }),
    })
        .then(() => {
            $('#plList2').empty();
            fetchAllPlayLists();
        });

}
function init(){
    document.getElementById('username').innerText = sessionStorage.getItem('username');
}

function logout(){
    console.log("logout sme");
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('token');
    location.href= 'login.html';
}
function loadDataPlayLists(songs) {
    jQuery(function ($) {
        'use strict'
        var supportsAudio = !!document.createElement('audio').canPlayType;
        if (supportsAudio) {
            // initialize plyr
            var player = new Plyr('#audio1', {
                controls: [
                    'restart',
                    'play',
                    'progress',
                    'current-time',
                    'duration',
                    'mute',
                    'volume',
                    'download'
                ]
            });
            // initialize playlist and controls
            var index = 0,
                playing = false,
                mediaPath = window.location.href.toString().split('MAP_Project')[0],
                extension = '',
                buildPlaylist = $.each(songs, function(key, value) {
                    var trackNumber = 1,
                        trackName = value.title,
                        trackDuration = 10;
                    if (trackNumber.toString().length === 1) {
                        trackNumber = '0' + trackNumber;
                    }
                    $('#plList2').append('<li> \
                    <div class="plItem"> \
                        <span class="plNum">' + '.</span> \
                        <span class="plTitle">' + trackName + '</span> \
                        <button class="plLength" id="thisisbutton" data-id = "'+value.id+ '" data-number="' + value.songId + '">play</button> \
                        <button class="pladd" id="removetoplaylist" data-id = "'+value.id+ '" data-number="' + value.songId + '">-</button> \
                    </div> \
                </li>');
                }),
                trackCount = songs.length,
                npAction = $('#npAction'),
                npTitle = $('#npTitle'),
                audio = $('#audio1').on('play', function () {
                    playing = true;
                    npAction.text('Now Playing...');
                }).on('pause', function () {
                    playing = false;
                    npAction.text('Paused...');
                }).on('ended', function () {
                    npAction.text('Paused...');
                    if ((index + 1) < trackCount) {
                        index++;
                        loadTrack(index);
                        audio.play();
                    } else {
                        audio.pause();
                        index = 0;
                        loadTrack(index);
                    }
                }).get(0),
                btnPrev = $('#btnPrev').on('click', function () {
                    if ((index - 1) > -1) {
                        index--;
                        loadTrack(index);
                        if (playing) {
                            audio.play();
                        }
                    } else {
                        audio.pause();
                        index = 0;
                        loadTrack(index);
                    }
                }),
                btnNext = $('#btnNext').on('click', function () {
                    if ((index + 1) < trackCount) {
                        index++;
                        loadTrack(index);
                        if (playing) {
                            audio.play();
                        }
                    } else {
                        audio.pause();
                        index = 0;
                        loadTrack(index);
                    }
                }),
                button = $('#plList2 li div button').on('click', function () {
                    var buttonIndex =  parseInt($(this).index());
                    const idResult = this.dataset.number;
                    const idResultPlay = this.dataset.id;
                    const idPlay = songs.findIndex(item => item.id === idResultPlay);
                    const id = songs.findIndex(item => item.id === idResult);
                    if(buttonIndex === 2){
                        //var id = parseInt($(this).index());
                        if (idPlay !== index) {
                            playTrack(idPlay);
                        }
                    }else if(buttonIndex === 3){
                        console.log("remove button : " + idResult);
                        removeFromPlayList(idResult);
                    }

                }),

                loadTrack = function (id) {
                    $('.plSel').removeClass('plSel');
                    $('#plList2 li:eq(' + id + ')').addClass('plSel');
                    npTitle.text(songs[id].title);
                    index = id;
                    audio.src = mediaPath + "MAP_Project/music-server/src/" + songs[id].urlPath;
                    updateDownload(id, audio.src);
                },
                updateDownload = function (id, source) {
                    player.on('loadedmetadata', function () {
                        $('a[data-plyr="download"]').attr('href', source);
                    });
                },
                playTrack = function (id) {
                    loadTrack(id);
                    audio.play();
                };
            extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
            loadTrack(index);
        } else {
            // no audio support
            $('.column').addClass('hidden');
            var noSupport = $('#audio1').text();
            $('.container').append('<p class="no-support">' + noSupport + '</p>');
        }
    });
}

function loadData(songs) {
    jQuery(function ($) {
        'use strict'
        var supportsAudio = !!document.createElement('audio').canPlayType;
        if (supportsAudio) {
            // initialize plyr
            var player = new Plyr('#audio1', {
                controls: [
                    'restart',
                    'play',
                    'progress',
                    'current-time',
                    'duration',
                    'mute',
                    'volume',
                    'download'
                ]
            });
            // initialize playlist and controls
            var index = 0,
                playing = false,
                mediaPath = window.location.href.toString().split('MAP_Project')[0],
                extension = '',
                buildPlaylist = $.each(songs, function(key, value) {
                    var trackNumber = 1,
                        trackName = value.title,
                        trackDuration = 10;
                    if (trackNumber.toString().length === 1) {
                        trackNumber = '0' + trackNumber;
                    }
                    $('#plList').append('<li> \
                    <div class="plItem"> \
                        <span class="plNum">' + '.</span> \
                        <span class="plTitle">' + trackName + '</span> \
                        <button class="plLength" id="thisisbutton" data-number="' + value.id + '">play</button> \
                        <button class="pladd" id="addtoplaylist" data-number="' + value.id + '">+</button> \
                    </div> \
                </li>');

                }),
                trackCount = songs.length,
                npAction = $('#npAction'),
                npTitle = $('#npTitle'),
                audio = $('#audio1').on('play', function () {
                    playing = true;
                    npAction.text('Now Playing...');
                }).on('pause', function () {
                    playing = false;
                    npAction.text('Paused...');
                }).on('ended', function () {
                    npAction.text('Paused...');
                    if ((index + 1) < trackCount) {
                        index++;
                        loadTrack(index);
                        audio.play();
                    } else {
                        audio.pause();
                        index = 0;
                        loadTrack(index);
                    }
                }).get(0),
                // btnPrev = $('#btnPrev').on('click', function () {
                //     if ((index - 1) > -1) {
                //         index--;
                //         loadTrack(index);
                //         if (playing) {
                //             audio.play();
                //         }
                //     } else {
                //         audio.pause();
                //         index = 0;
                //         loadTrack(index);
                //     }
                // }),
                // btnNext = $('#btnNext').on('click', function () {
                //     if ((index + 1) < trackCount) {
                //         index++;
                //         loadTrack(index);
                //         if (playing) {
                //             audio.play();
                //         }
                //     } else {
                //         audio.pause();
                //         index = 0;
                //         loadTrack(index);
                //     }
                // }),
                button = $('#plList li div button').on('click', function () {
                    var buttonIndex =  parseInt($(this).index());
                    const idResult = this.dataset.number;
                    const id = songs.findIndex(item => item.id === idResult);
                    if(buttonIndex === 2){
                        //var id = parseInt($(this).index());
                        if (id !== index) {
                            playTrack(id);
                        }
                    }else if(buttonIndex === 3){
                        addToPlayList(idResult);
                    }

                }),
                loadTrack = function (id) {
                    $('.plSel').removeClass('plSel');
                    $('#plList li:eq(' + id + ')').addClass('plSel');
                    npTitle.text(songs[id].title);
                    index = id;
                    audio.src = mediaPath + "MAP_Project/music-server/src/" + songs[id].urlPath;
                    updateDownload(id, audio.src);
                },
                updateDownload = function (id, source) {
                    player.on('loadedmetadata', function () {
                        $('a[data-plyr="download"]').attr('href', source);
                    });
                },
                playTrack = function (id) {
                    loadTrack(id);
                    audio.play();
                };
            extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
            loadTrack(index);
        } else {
            // no audio support
            $('.column').addClass('hidden');
            var noSupport = $('#audio1').text();
            $('.container').append('<p class="no-support">' + noSupport + '</p>');
        }
    });
}
