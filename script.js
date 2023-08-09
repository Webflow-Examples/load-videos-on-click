document.addEventListener("DOMContentLoaded", function () {
  // add listener event to all video wrappers
  initializeVideoPlayers(".video-wrapper-vimeo", playVimeoOnClick);
  initializeVideoPlayers(".video-wrapper-yt", playYouTubeOnClick);
  // load YouTube API and Vimeo SDK
  loadScript("https://www.youtube.com/iframe_api");
  loadScript("https://player.vimeo.com/api/player.js");
});

// function to initialize all video players
// selector: class name of video wrapper
// clickHandler: function to handle click event
function initializeVideoPlayers(selector, clickHandler) {
  const videoWrappers = document.querySelectorAll(selector);
  videoWrappers.forEach((wrapper) => {
    wrapper.addEventListener("click", clickHandler);
  });
}

// function to check if device is mobile
// this is used to mute videos on mobile devices
// because most mobile devices do not allow autoplay with sound
function isMobileDevice() {
  const maxWidth = 767;
  return (
    window.innerWidth <= maxWidth ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

// function to play Vimeo video on click
function playVimeoOnClick() {
  // get video id from data attribute
  // don't use data-vimeo-id because
  // it will load the video on page load
  const videoId = this.getAttribute("data-video-id");
  // get the div that will contain the player
  const playerDiv = this.nextElementSibling;

  // remove the poster image from the DOM
  this.remove();
  // show the player div
  playerDiv.style.display = "block";

  // check if device is mobile
  const shouldMute = isMobileDevice();

  // initialize the player
  const player = new Vimeo.Player(playerDiv, {
    id: videoId,
    width: "100%",
    autoplay: true,
    muted: shouldMute,
  });

  // play the video when it's ready
  player.on("ready", function () {
    player.play();
  });
}

// function to play YouTube video on click
function playYouTubeOnClick() {
  // get video id from data attribute
  const videoId = this.getAttribute("data-youtube-id");
  // get the div that will contain the player
  const iframeDiv = this.nextElementSibling;
  // get the div that will contain the iframe
  // this is needed because YouTube API
  // behaves differently from Vimeo SDK
  const iframeWrapper = iframeDiv.querySelector(".video-youtube-target");

  // check if device is mobile
  const shouldMute = isMobileDevice();
  // convert boolean (true/false) to integer
  // because YouTube API requires integer
  const muteState = shouldMute ? 1 : 0;

  // remove the poster image from the DOM
  this.remove();
  // show the player div
  iframeDiv.style.display = "block";

  // initialize the player
  new YT.Player(iframeWrapper, {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      mute: muteState,
    },
  });
}

// function to load scripts
function loadScript(url) {
  const script = document.createElement("script");
  script.src = url;
  const firstScript = document.querySelector("script");
  firstScript.parentNode.insertBefore(script, firstScript);
}
