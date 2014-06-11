/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var statusDom = '';
var appDirectory = 'MyFileApp';
var audios = [];
var videos = [];
var images = [];
var description = [];
var myMedia = null;
var playing = false;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        statusDom = document.querySelector('#status');

        updateMedia();
        //Get Device's FileSystem
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }
};

function isOnline () {
    // body...
    if(navigator.connection.type == Connection.NONE){
        return false;
    }
    else{
        return true;
    }
}

function gotFS (fileSystem) {
    // body...
    console.log('Got FileSystem');    
    statusDom.innerHTML = fileSystem.root;

    fileSystem.root.getDirectory(appDirectory, {
        create : true,
        exclusive : false 
        },
        function (entry) {
            localStorage.setItem('appDirectory', entry.toURL());
            statusDom.innerHTML = entry.toURL();

            //$('#btnDownload').on('click', download ('http://www.google.com', localStorage.getItem('appDirectory')));
            $('#btnDownload').off().on('click', download ('http://103.254.238.7/nasp/assets_old.zip', localStorage.getItem('appDirectory')));
            alert(localStorage.getItem('appDirectory'));
        },
        fail
    );
}

function download (source, target) {
    // body...
    alert('Downloading...');
    var fileName = new Date().getTime() + '.zip';
    var filePath = target + '/' + fileName;

    ft = new FileTransfer();

    ft.onprogress = function (progressEvent) {
        // body...
        if (progressEvent.lengthComputable) {
            var perc = Math.floor (progressEvent.loaded / progressEvent.total * 100);
            statusDom.innerHTML = perc + '% loaded...';
        }
        else{
            if (statusDom.innerHTML == '') {
                statusDom.innerHTML = 'Loading';
            } else{
                statusDom.innerHTML += '.';
            }
        }
    }

    ft.download(
        source,
        filePath,
        function (entry) {
            // body...
            console.log('Download Complete:'  + entry.fullPath);
            statusDom.innerHTML = 'Downloaded';

            zip.unzip (filePath, target, zipSuccess);

            function zipSuccess (param) {
                // body...
                if (param == 0) {
                    alert('Download and extraction Complete');
                    
                    statusDom.innerHTML = 'Extraction Complete';

                    readJSON();

                    entry.remove();
                } else{
                    alert('Extraction Failed');
                }
            }
        },
        function (error) {
            // body...
            console.log('download error source' + error.source);
            console.log('download error target' + error.target);
            console.log('upload error code' + error.code);
        }
    );
}

function fail (error) {
    // body...
    alert('Fails');
    console.log('A fileSystem error occurred: ' + error);
}

function checkFileExists (fileName){
    var http = new XMLHttpRequest();
    http.open('HEAD', fileName, false);
    http.send(null);
    return (http.status != 404);
};

//Read Extracted Contents
function readJSON () {
    // body...   
    var directory = localStorage.getItem('appDirectory');
    var jsonfile = directory + '/assets_old/Media.json';     

    $.ajax({
        url: jsonfile,
        type: 'GET',
        success: function (data){
            alert('success');
            data = $.parseJSON(data);
            $.each( data, function (key, val) {   

                for (var i = 0; i < val.length ; i++){
                    if (key == 'Audios'){
                        audios.push(val[i]);
                        alert(val[i].url);
                    }
                    if (key == 'Videos'){
                        videos.push(val[i]);
                    }
                    if (key == 'Images'){
                        images.push(val[i]);
                    }
                    if (key == 'Description'){
                        description.push(val[i]);
                    }              
                }
            });     
        },
        error: function (xhr, error){
           
            console.log('readyState: '+xhr.readyState+'\nstatus: '+xhr.status);

            if (xhr.responseText.length >= 10) {
                alert('success in responseText');
                data = $.parseJSON(xhr.responseText);

                $.each( data, function (key, val) {   

                    for (var i = 0; i < val.length ; i++){
                        if (key == 'Audios'){
                            audios.push(val[i]);
                        }
                        if (key == 'Videos'){
                            videos.push(val[i]);
                        }
                        if (key == 'Images'){
                            images.push(val[i]);
                        }
                        if (key == 'Description'){
                            description.push(val[i]);
                        }              
                    }
                });   
            }
        }
    });
}

function loadMe (id) {
    // body...
    document.getElementById('fileContent').style.display = 'block';
    if(id == 1){
        document.getElementById('videoStream').src = videos[0].url; 
        updateMedia(audios[0].url);
    }
    if(id == 2){        
        alert('local media');
        document.getElementById('videoStream').src = localStorage.getItem('appDirectory') + '/assets_old/' + videos[1].url;
        updateMedia(localStorage.getItem('appDirectory') + '/assets_old/' + audios[1].url);
    }
    
    
}

function updateMedia (src) {   
    
    // Clean up old file
    if (myMedia != null && device.platform.toLowerCase() != 'ios') {
        myMedia.release();
    }

    alert(device.platform);

    if (device.platform.toLowerCase() == 'ios') {
        myMedia = document.getElementById('btnAudioPlayer');
        myMedia.src = src;
    }
    else{
        // Get the new media file        
        myMedia = new Media(src, stopAudio, null);
        // Update media position every second]
        var mediaTimer = setInterval(function() {
            // get media position
            myMedia.getCurrentPosition(
            // success callback
                function(position) {
                    if (position > -1) {
                        document.getElementById('audio_position').innerHTML = (position) + " sec";
                    }
                },
                // error callback
                function(e) {
                    console.log("Error getting pos=" + e);
                }
            );
        }, 1000);
    }
    
    
}


function playAudio() {
    if (!playing) {
        myMedia.play();
        document.getElementById('btnAudio').innerHTML = 'pause';
        playing = true; 
    } 
    else {
        myMedia.pause();
        document.getElementById('btnAudio').innerHTML = 'play';
        playing = false; 
    }
}
 
function stopAudio() {
    myMedia.stop();
    playing = false;
    document.getElementById('btnAudio').innerHTML = 'play';
    document.getElementById('audio_position').innerHTML = "0.000 sec";
}

function setAudioPosition (position) {
    // body...
    document.getElementById('audio_position').innerHTML =position;
}