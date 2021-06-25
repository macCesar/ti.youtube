## ti.youtube

A small library to get the URL of the desired ***YouTube video ID*** to use it natively in Ti.Media.VideoPlayer.

It returns an URL object with the following properties:

```javascript
{
    small: 'typically 180p',
    medium: 'typically 360p',
    high: 'typically 720p',
    best: 'best quality available either small, medium or high'
}
```

## NOTE: The current solution only loads data from certain types of videos
The data received from YouTube is a big pile of mess, different type of video (live video, normal video, member-only video, unlisted video, .etc) can have a different response schema, so at the moment finding the right path is difficult.

## Warning and Restrictions
### Legal notice
`ti.youtube` may brake YouTube’s [Terms of Service](https://www.youtube.com/t/terms). The only *official* way of playing a YouTube video inside an app is with a `WebView` and the [iframe player API](https://developers.google.com/youtube/iframe_api_reference).

It is up to you to give proper credit to YouTube, their services, and to the owner's video sources.

### Restricted playback
Some YouTube videos are restricted by their owners to play only on YouTube or embedded on websites.

The library will show an alert that the given video cannot be played natively.

## Two ways to install the library
### Install from NPM
Run the following command in your `lib` directory in Alloy, Resources directory for classic or the project root for Titanium Webpack projects.
```terminal
npm i ti.youtube
```

### Download the library
If you don't use `npm`, you can download the [latest version](https://github.com/macCesar/ti.youtube/blob/master/ti.youtube.js) and place it in your `lib` folder (or Resources for classic project).

## Using it
### I'm keeping this method for compatibilty reasons.
> index.js
```javascript
const tiYoutube = require('ti.youtube');

let videoID = tiYoutube.getVideoIdFromUrl('https://youtu.be/M5QY2_8704o');

if (videoID) {
    tiYoutube.getUrlByVideoId(videoID, url => {
        // Available Video Qualities:
        // small ( typically 180p )
        // medium ( typically 360p )
        // high ( typically 720p )
        // best ( best quality available either medium or high )
        $.videoPlayer.url = url.best;
    }, e => {
        // optional callback in case of an error
        // can return e.error statuses ["no_valid_urls", "video_not_allowed", "http_error"]
    });
}

$.window.open();
```


## A better option: `init`
### With this method you will get the Video Details along with the direct URLs in one call

> index.js
```javascript
const tiYoutube = require('ti.youtube');

tiYoutube.init('https://youtu.be/M5QY2_8704o', (response) => {
    $.videoPlayer.url = response.url.best;
});

$.window.open();
```

### The response contains the following data:
```json
response {
    "url": {
        "small": "https...",
        "medium": "https...",
        "high": "https...",
        "best": "https..."
    },
    "videoId": "M5QY2_8704o",
    "channelId": "UCwVQIkAtyZzQSA-OY1rsGig",
    "viewCount": "3412928",
    "isLiveContent": false,
    "title": "Chillstep Music for Programming / Cyber / Coding",
    "author": "Music Lab",
    "thumbnail": {
        "xs": {
            "url": "https://i.ytimg.com/vi/M5QY2_8704o/default.jpg",
            "width": 120,
            "height": 90
        },
        "sm": {
            "url": "https://i.ytimg.com/vi/M5QY2_8704o/mqdefault.jpg",
            "width": 320,
            "height": 180
        },
        "md": {
            "url": "https://i.ytimg.com/vi/M5QY2_8704o/hqdefault.jpg",
            "width": 480,
            "height": 360
        },
        "lg": {
            "url": "https://i.ytimg.com/vi/M5QY2_8704o/sddefault.jpg",
            "width": 640,
            "height": 480
        },
        "xl": {
            "url": "https://i.ytimg.com/vi/M5QY2_8704o/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBne48YMp_VLuCJtrje7oK_xI--4A",
            "width": 686,
            "height": 386
        }
    },
    "shortDescription": "___THE VIDEO DESCRIPTION___"
}
```

> index.xml
```xml
<Alloy>
    <Window id="window">
        <VideoPlayer id="videoPlayer" ns="Ti.Media" />
    </Window>
</Alloy>
```

> app.tss
```css
"#window": {
    backgroundColor: '#ffffff'
}

"#videoPlayer" : {
    autoplay: true,
    width: Ti.UI.FILL,
    height: Ti.UI.FILL,
    showsControls: true
}

"#videoPlayer[platform=ios]" : {
    allowsAirPlay: true,
    backgroundColor: 'transparent',
    mediaTypes: [ Ti.Media.VIDEO_MEDIA_TYPE_VIDEO ]
}

"#videoPlayer[platform=android]" : {
    keepScreenOn: true,
    backgroundColor: '#000000'
}
```

## Helper Functions
### getVideoIdFromUrl()
To get the `video ID` from any of the supported URL formats.
```javascript
const tiYoutube = require('ti.youtube');

tiYoutube.getVideoIdFromUrl('https://youtu.be/M5QY2_8704o');
// output: M5QY2_8704o

// Supported URL Formats
// 'youtu.be/M5QY2_8704o',
// 'https://youtu.be/M5QY2_8704o',
// 'https://youtube.com/M5QY2_8704o',
// 'youtube.com/watch?v=M5QY2_8704o',
// 'https://youtu.be/?v=M5QY2_8704o',
// 'https://youtu.be/watch?v=M5QY2_8704o',
// 'https://youtube.com/watch?v=M5QY2_8704o',
// 'https://www.youtu.be/watch?v=M5QY2_8704o',
// 'https://www.youtube.com/watch?v=M5QY2_8704o'
```
It returns the **Video ID**, or `false` if it cannot find any.

### getVideoDetails()
When you call `init` or `getUrlByVideoId` the data returned it's also store in a local variable inside of the module, you can retreive it at any moment by calling getVideoDetails() helper function.

> **[Here's an example of the returned data](https://github.com/macCesar/ti.youtube/blob/master/videoDetails.md)**

### Google API Key
`ti.youtube` uses a publicly available `INNERTUBE_API_KEY`. But if you want to, you can provide your own [Google API Key](https://support.google.com/googleapi/answer/6158862) with [YouTube Data API v3](https://support.google.com/googleapi/answer/6158841?hl=en&ref_topic=7013279) enabled.

### Setting your own Google API Key globally
You can place it as a property in your project’s `tiapp.xml` file:
```xml
<property name="googleApiKey" type="string">PLACE-YOUR-GOOGLE-API-KEY</property>
```

### setApiKey()
Useful if you don’t want to set your `Google API key` in your `tiapp.xml` file, or if you get it from a database call, or if for some reason you need to change it at runtime.

```javascript
const tiYoutube = require('ti.youtube');

tiYoutube.setApiKey('YOUR-NEW-OR-UPDATED-GOOGLE-API-KEY');
```

### getApiKey()
To view your Google API Key

```javascript
const tiYoutube = require('ti.youtube');

console.log(tiYoutube.getApiKey());
// output: YOUR-GOOGLE-API-KEY
```

## Useful information
### Getting video metadata
In order to find and resolve media streams, you need to first get video metadata. There are a few ways to do it, but the most reliable one is by querying an AJAX endpoint used internally by YouTube’s iframe embed API. The format is as follows: https://www.youtube.com/get_video_info?video_id={videoId}.

The request can take a lot of different parameters, but at a minimum it needs a video ID — the value in the URL that comes after /watch?v=, for example dQw4w9WgXcQ.

The response contains URL-encoded metadata, which has to be decoded first before it’s usable. After that, you can map the parameter names to values in a dictionary for easier access. Some parameter values are nested objects themselves, so they can in turn be mapped to nested dictionaries.

***Source [Reverse-Engineering YouTube](https://tyrrrz.me/blog/reverse-engineering-youtube) by Alexey Golub***

### License
Apache Version 2.0

See [License](https://github.com/appit-online/youtube-info-streams/blob/master/LICENSE)
