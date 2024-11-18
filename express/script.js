const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`, {
    host: location.hostname,
    debug: 1,
    path: "/myapp",
  },
);
window.peer = peer;

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: true
    })
    .then((stream) => {
      window.localStream = stream; // A
      window.localAudio.srcObject = stream; // B
      window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}
getLocalStream();

let code;
function getStreamCode() {
  code = window.prompt("Please enter the sharing code");
}
let conn;
function connectPeers() {
  conn = peer.connect(code);
}
peer.on("connection", (connection) => {
  conn = connection;
});


const callBtn = document.querySelector(".call-btn");
callBtn.addEventListener("click", () => {
  getStreamCode();
  connectPeers();
  const call = peer.call(code, window.localStream); // A

  call.on("stream", (stream) => {
    // B
    window.remoteAudio.srcObject = stream; // C
    window.remoteAudio.autoplay = true; // D
    window.peerStream = stream; //E
    showConnectedContent(); //F    });
  });
});
