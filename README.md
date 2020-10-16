## ti.youtube

A small library to get the URL of the desired ***YouTube video ID*** to use it natively in Ti.Media.VideoPlayer.

It returns an URL object with the following properties:

```javascript
{
    medium: 'typically 360p',
    high: 'typically 720p',
    best: 'best quality available either medium or high'
}
```
### Live Streaming Media
When available, ti.youtube will use HLS manifest file to play adaptive media from live streaming.

## Warning and Restrictions
### Legal notice
`ti.youtube` may brake YouTube [Terms of Service](https://www.youtube.com/t/terms). The only *official* way of playing a YouTube video inside an app is with a `WebView` and the [iframe player API](https://developers.google.com/youtube/iframe_api_reference).

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
> index.js
```javascript
const tiYoutube = require('ti.youtube');

let videoID = tiYoutube.getVideoIdFromUrl('https://youtu.be/SMKPKGW083c');

if (videoID) {
    tiYoutube.getUrlByVideoId(videoID, url => {
        // Available Video Qualities:
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
To get the video ID from any of the supported URL formats.
```javascript
    // Sample URLs
    // 'youtu.be/SMKPKGW083c',
    // 'https://youtu.be/SMKPKGW083c',
    // 'https://youtube.com/SMKPKGW083c',
    // 'youtube.com/watch?v=SMKPKGW083c',
    // 'https://youtu.be/?v=SMKPKGW083c',
    // 'https://youtu.be/watch?v=SMKPKGW083c',
    // 'https://youtube.com/watch?v=SMKPKGW083c',
    // 'https://www.youtu.be/watch?v=SMKPKGW083c',
    // 'https://www.youtube.com/watch?v=SMKPKGW083c'

    getVideoIdFromUrl('https://youtu.be/SMKPKGW083c')
```
It returns the Video ID, or `false` if it cannot find any.

## ToDo
I will try to export more information from the returned data. Like video title, description, length, thumbnails, etc.

## Useful information
### Getting video metadata
In order to find and resolve media streams, you need to first get video metadata. There are a few ways to do it, but the most reliable one is by querying an AJAX endpoint used internally by YouTube’s iframe embed API. The format is as follows: https://www.youtube.com/get_video_info?video_id={videoId}.

The request can take a lot of different parameters, but at a minimum it needs a video ID — the value in the URL that comes after /watch?v=, for example dQw4w9WgXcQ.

The response contains URL-encoded metadata, which has to be decoded first before it’s usable. After that, you can map the parameter names to values in a dictionary for easier access. Some parameter values are nested objects themselves, so they can in turn be mapped to nested dictionaries.

***Source [Reverse-Engineering YouTube](https://tyrrrz.me/blog/reverse-engineering-youtube) by Alexey Golub***

### License
Apache Version 2.0

See [License](https://github.com/appit-online/youtube-info-streams/blob/master/LICENSE)
