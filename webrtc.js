var host = location.origin.replace(/^http/,'ws');
var  ws = new WebSocket(host);
var localVideoElem = null, remoteVideoElem = null, localVideoStream = null,
    videoCallButton = null, endCallButton = null,
    peerConn = null,
    peerConnCfg = {'iceServers': 
      [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]
    };
  
function pageReady() {
  // check browser WebRTC availability 
  console.log("this is WebRTC");
  console.log("navigator.getUserMedia"); 
  if(navigator.getUserMedia) {
    videoCallButton = document.getElementById("videoCallButton");
    endCallButton = document.getElementById("endCallButton");
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
    videoCallButton.removeAttribute("disabled");
    videoCallButton.addEventListener("click", initiateCall);
    endCallButton.addEventListener("click", function (evt) {
      ws.send(JSON.stringify({"closeConnection": true }));
    });
  } else {
    alert("Sorry, your browser does not support WebRTC!")
  }
};

function prepareCall() {
  peerConn = new RTCPeerConnection(peerConnCfg);
  console.log(peerConn);
  // send any ice candidates to the other peer
  peerConn.onicecandidate = onIceCandidateHandler;
  console.log(peerConn.onicecandidate);
  // once remote stream arrives, show it in the remote video element
  peerConn.onaddstream = onAddStreamHandler;
  console.log(peerConn.onaddstream);
  console.log("Gere");
};

// run start(true) to initiate a call
function initiateCall() {
  prepareCall();
  // get the local stream, show it in the local video element and send it
  navigator.getUserMedia({ "audio": true, "video": true }, function (stream) {
    localVideoStream = stream;
    localVideo.src = URL.createObjectURL(localVideoStream);
    peerConn.addStream(localVideoStream);
    createAndSendOffer();
  }, function(error) { console.log(error);});
};

function answerCall() {
  prepareCall();
  // get the local stream, show it in the local video element and send it
  navigator.getUserMedia({ "audio": true, "video": true }, function (stream) {
    localVideoStream = stream;
    localVideo.src = URL.createObjectURL(localVideoStream);
    peerConn.addStream(localVideoStream);
    createAndSendAnswer();
  }, function(error) { console.log(error);});
};

ws.onmessage = function (evt) {
  var signal = null;
  if (!peerConn)
    answerCall();
  signal = JSON.parse(evt.data);
  if (signal.sdp) {
    peerConn.setRemoteDescription(new RTCSessionDescription(signal.sdp));
  }
  else if (signal.candidate) {
    peerConn.addIceCandidate(new RTCIceCandidate(signal.candidate));
  } else if ( signal.closeConnection){
    endCall();
  }
};

function createAndSendOffer() {
  peerConn.createOffer(
    function (offer) {
      var off = new RTCSessionDescription(offer);
      peerConn.setLocalDescription(new RTCSessionDescription(off), 
        function() {
          ws.send(JSON.stringify({"sdp": off }));
        }, 
        function(error) { 
          console.log(error);
        }
      );
    }, 
    function (error) { 
      console.log(error);
    }
  );
};

function createAndSendAnswer() {
  peerConn.createAnswer(
    function (answer) {
      var ans = new RTCSessionDescription(answer);
      peerConn.setLocalDescription(ans, function() {
          ws.send(JSON.stringify({"sdp": ans }));
        }, 
        function (error) { 
          console.log(error);
        }
      );
    },
    function (error) { 
      console.log(error);
    }
  );
};

function onIceCandidateHandler(evt) {
  if (!evt || !evt.candidate) return;
  ws.send(JSON.stringify({"candidate": evt.candidate }));
};

function onAddStreamHandler(evt) {
  videoCallButton.setAttribute("disabled", true);
  endCallButton.removeAttribute("disabled"); 
  // set remote video stream as source for remote video HTML5 element
  remoteVideo.src = URL.createObjectURL(evt.stream);
};

function endCall() {
  peerConn.close();
  peerConn = null;
  videoCallButton.removeAttribute("disabled");
  endCallButton.setAttribute("disabled", true);
  localVideoStream.getTracks().forEach(function (track) {
    track.stop();
  });
  localVideo.src = "";
  remoteVideo.src = "";
};