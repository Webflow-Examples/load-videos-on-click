# load-videos-on-click

A repo to show how to load YouTube and Vimeo videos on click instead of on page load.

Clone an example site from Made in Webflow:

https://webflow.com/made-in-webflow/website/load-videos-onclick

See the published version here:

https://load-videos-onclick.webflow.io/

One thing we hear from customers is that they'd like to be able to lazy load their YouTube and Vimeo videos so that they don't impact page performance on page load. This repo will walk you through how to accomplish this in Webflow.

## Setting up your CMS

In the example, we're using the Webflow CMS and our videos will live there. Here's what our CSM Schema looks like for both YouTube and Vimeo (separate collections):

- Name:
- Slug
- Poster image (image field)
- Video ID (plain text field)
  - For YouTube, located in the URL of the video page right after the v= URL parameter
  - For Vimeo, it's in the URL after the vimeo.com/ URL
- Video description (plain text field, mult-line)

Once set up, you'll need to populate your data with poster images (placeholder for the video), and all the other content.

## Structuring the elements on the page

Add a collection list to the page and style your list however you like, then I'm using the following structure inside the CMS item:

- a link block with a class of `.video-wrapper-vimeo` or `.video-wrapper-yt` and inside of that...
  - a div with the class `.sr-only` with a heading inside
  - an HTML embed with an SVG inside
  - an image with the class of `.video-poster-image`
- I also have a div with the class `video-player` as a sibling element to video-wrapper (this div is empty and set to display: none)
- For YouTube, they need a div inside the player, so for that list you'll find a div with a class name of `.video-youtube-target`

We add an extra div in the YouTube structure because YouTube takes the place of the div where Vimeo adds the video as a child of the div.

You'll want to check out the Webflow project to get a feel for positioning and styling.

## The code

### JavaScript

Let's look at the JavaScript for the page.

First, on page load we're adding the YouTube API and Vimeo SDK scripts and then initializing the video players by adding an `onclick` event to all the link blocks with the poster images in them.

Here's that code:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  initializeVideoPlayers(".video-wrapper-vimeo", playVimeoOnClick);
  initializeVideoPlayers(".video-wrapper-yt", playYouTubeOnClick);
  loadScript("https://www.youtube.com/iframe_api");
  loadScript("https://player.vimeo.com/api/player.js");
});
```

You can see here we're doing this through two functions. The first are `initializeVideoPlayers(selector, clicHandler)`

Here's the code:

```javascript
function initializeVideoPlayers(selector, clickHandler) {
  const videoWrappers = document.querySelectorAll(selector);
  videoWrappers.forEach((wrapper) => {
    wrapper.addEventListener("click", clickHandler);
  });
}
```

When we call this function we're passing through the selector of the items we want to add click events to and then the funciton the click will call.

The second function in the on page load piece is `loadScript` which is just adding the `<script src=""></script>` tags for the YouTube API and Vimeo SDK. It creates a script element, passes the URL of it through, then adds it to the head of the document.

```javascript
function loadScript(url) {
  const script = document.createElement("script");
  script.src = url;
  const firstScript = document.querySelector("script");
  firstScript.parentNode.insertBefore(script, firstScript);
}
```

Now let's look at the functions that run when the poster images are clicked. They're very similar:

```javascript
function playVimeoOnClick() {
  const videoId = this.getAttribute("data-video-id");
  const playerDiv = this.nextElementSibling;

  this.remove();
  playerDiv.style.display = "block";

  const shouldMute = isMobileDevice();

  const player = new Vimeo.Player(playerDiv, {
    id: videoId,
    width: "100%",
    autoplay: true,
    muted: shouldMute,
  });

  player.on("ready", function () {
    player.play();
  });
}
```

In this code, we're getting the video ID from the custom attribute we added to the link we're clicking. Once we have it, we're getting the empty div that will hold the iframe. Then we remove the poster image and the link wrapping it, check whether we're on mobile, and then initialize the player and play the video.

You may be wondering why we're checking whether the user is on mobile. That's becuase videos won't autoplay on most mobile devices unless they're muted. So we check with this function:

```javascript
function isMobileDevice() {
  const maxWidth = 767;
  return (
    window.innerWidth <= maxWidth ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}
```

This returns a boolean which we pass through to the Vimeo SDK on initialization. That way if it's desktop, they click and the video plays with sound, but on mobile it plays and they'll be prompted to unmute.

The YouTube function is very similar with a few small differences. Let's look at the code:

```javascript
// function to play YouTube video on click
function playYouTubeOnClick() {
  const videoId = this.getAttribute("data-youtube-id");
  const iframeDiv = this.nextElementSibling;
  const iframeWrapper = iframeDiv.querySelector(".video-youtube-target");

  const shouldMute = isMobileDevice();
  const muteState = shouldMute ? 1 : 0;

  this.remove();
  iframeDiv.style.display = "block";

  new YT.Player(iframeWrapper, {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      mute: muteState,
    },
  });
}
```

The main differences here are that we have to account for that extra div we added in our HTML structure and then we need to convert the boolean on the mobile check to integers (1/0) since that's what the YouTube API expects.

### The CSS

Now let's look at the CSS for the site:

```css
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.video-player iframe,
.video-player object,
.video-player embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

svg {
  filter: drop-shadow(0px 0px 5px rgb(0 0 0 / 0.4));
}

.video-summary {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

This code can be found in the `Global Code` components. There's some code for font smoothing, but aside from that you'll see code for `.video-player iframe`, etc. This is to help keep the video the right aspect ratio and responsive.

The svg code just adds a drop shadow to our play icon SVG's and the video summary uses line clamp to keep our descriptions uniform.

You can remove the Vimeo or YouTube pieces if you're exclusively using one service over the other. We hope this repo helps and that you see a lot of performance gains on your site. Cheers!
