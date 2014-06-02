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

var totalFolders = 3;

var folderArray = new Array();
folderArray[0] = "spr";
folderArray[1] = "spf";
folderArray[2] = "publications";

var downloadArray = new Array();
downloadArray[0] = "http://192.168.117.21/skillmatrix/downloads/file.zip";
downloadArray[1] = "http://192.168.117.21/skillmatrix/downloads/file.zip";
downloadArray[2] = "http://192.168.117.21/skillmatrix/downloads/file.zip";

var downloadError = new Array();
downloadError[0] = "1"
downloadError[1] = "1"
downloadError[2] = "1"

var folderPathArray = new Array();
folderPathArray[0] = "";
folderPathArray[1] = "";
folderPathArray[2] = "";


var statusDom ;

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

        //Get File System
        document.addEventListener('online', downloadAgain, false);
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);       
    }
};


function fail() {
    alert("FAILS");
    console.log("failed to get filesystem");
}

function checkConnection(){
    if(navigator.connection.type == Connection.NONE){        
        return false;
    }
    else{
        return true;
    }
}

function gotFS(fileSystem) {   
    
    console.log("filesystem got");
    //Create Folders
    alert("file system" + fileSystem.root);
    createFolders(fileSystem);
}

function createFolders(fileSystem){
    alert(fileSystem.root);
    for (var i = 0; i < totalFolders; i++) {
        fileSystem.root.getDirectory(folderArray[i], {
            create : true,
            exclusive : false
        }, 
        function(entry){           
            var fileName = entry.toURL();
            var index = $.inArray(fileName.split('/')[fileName.split('/').length - 1].toLowerCase(), folderArray);
            alert(index);
            alert(fileName);  
            folderPathArray[index] = fileName;                       
            //(checkConnection()) ? downloadZip(index, entry) : alert("No internet connection");
        }, fail);  
    };
}

function download () {
    if (checkConnection()) {   
        for(var i = totalFolders; i >= 0; i--) {
            downloadZip (folderPathArray[i], downloadArray[i]);
        }
    }
    else
        alert("No internet connection");
}

function downloadZip (source, target) {    
    
    console.log('download file' + source);

    var fileName = new Date().getTime() + ".zip";
    var filePath = target.toURL() + "/" + fileName;
    
    ft = new FileTransfer();

    ft.onprogress = function(progressEvent) {

        if (progressEvent.lengthComputable) {
            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            statusDom.innerHTML = perc + "% loaded...";
        } else {
            if(statusDom.innerHTML == "") {
                statusDom.innerHTML = "Loading";
            } else {
                statusDom.innerHTML += ".";
            }
        }
    };

    $.mobile.loading('show');
    ft.download(
        source,        
        filePath,
        function(entry) {
            alert(entry.toURL());
            downloadError[index] = "0";
            console.log("download complete: " + entry.fullPath);

            zip.unzip(target.toURL() + "/" + fileName, target.toURL(), zipSuccess);

            statusDom.innerHTML = "Extracting...";
           
            function zipSuccess(param){

                if(param == 0){                    
                    alert("Download and extraction complete");             

                    // remove the file
                    entry.remove();
                    statusDom.innerHTML = "Extraction Complete";
                    $.mobile.loading('hide');
                }else{
                    alert("Extraction Failed");
                }
            }
        },
        function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
            var fileName = error.target;
            alert(fileName);
            var index = $.inArray(fileName.split('/')[fileName.split('/').length - 2].toLowerCase(), folderArray);
            alert("The file " + folderArray[index] + " could not be downloaded completely");
            downloadError[index]  = "1";
        }
    );
}

function downloadAgain (){
    alert("Download Again");
    for (var i = totalFolders; i >= 0; i--) {
        if (downloadError[i] == "1") {
            alert("Download" + downloadArray[i]);
        };
    };
}