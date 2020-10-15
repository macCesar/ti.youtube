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

tiYoutube.getUrlByVideoId('SMKPKGW083c', url => {
    // Available Video Qualities:
    // medium ( typically 360p )
    // high ( typically 720p )
    // best ( best quality available either medium or high )
    $.videoPlayer.url = url.best;
});
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

## Restrictions:
Some YouTube videos are restricted by their owners to play only on websites.

The library will show an alert that the given video cannot be played natively.

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
