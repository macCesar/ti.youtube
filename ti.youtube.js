let videoDetails = null;
let googleApiKey = Ti.App.Properties.getString('googleApiKey');
const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

function getVideoIdFromUrl(urlStream, errorCallback) {
	// https://stackoverflow.com/a/53142593/5791020 & https://regex101.com/r/l0m7yh/1
	let regExp = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)(\/)?(watch\?v=|\?v=)?(.*)$/;

	let match = urlStream.match(regExp);

	return (match && match[6].length === 11) ? match[6] : noValidUrls(errorCallback);
}
module.exports.getVideoIdFromUrl = getVideoIdFromUrl;

module.exports.init = function(urlStream, callback, errorCallback) {
	makeTheCall(getVideoIdFromUrl(urlStream), callback, errorCallback);
}

module.exports.getUrlByVideoId = function(videoId, callback, errorCallback) {
	makeTheCall(videoId, callback, errorCallback);
}

module.exports.getVideoDetails = function() {
	if (videoDetails) {
		return videoDetails;
	}

	alert('No video details available');
}

module.exports.setApiKey = function(_googleApiKey) {
	googleApiKey = _googleApiKey;
}

module.exports.getApiKey = function() {
	return googleApiKey;
}

//! Helper Functions
function makeTheCall(videoId, callback, errorCallback) {
	if (videoId) {
		const xhr = Ti.Network.createHTTPClient();

		let defaultGoogleApiKey = (googleApiKey) ? googleApiKey : INNERTUBE_API_KEY;

		let ytURL = `https://m.youtube.com/watch?v=${videoId}&pbj=1&key=${defaultGoogleApiKey}`;

		// xhr.clearCookies(ytURL);

		xhr.onload = function() {
			let responseText = JSON.parse(this.responseText);

			let player_response = responseText[2].playerResponse;

			// Playable In Embed
			if (!player_response.playabilityStatus.playableInEmbed) {
				if (errorCallback) {
					errorCallback({ error: "video_not_allowed" });
				} else {
					alert('This video cannot be played natively!');
				}
				return;
			}

			let formats = player_response.streamingData.formats;
			let hlsManifestUrl = player_response.streamingData.hlsManifestUrl;

			// URLs
			let urls = {};
			if (hlsManifestUrl) {
				urls.medium = urls.high = urls.best = hlsManifestUrl;
			}

			if (formats) {
				// formats[0] typically contains 720p video ( hd720 quality )
				if (formats[0]) {
					urls.high = formats[0].url;
				}

				// formats[1] typically contains 360p video ( medium quality )
				if (formats[1]) {
					urls.medium = formats[1].url;
				}

				// formats[2] typically contains 180p video ( small quality )
				if (formats[2]) {
					urls.small = formats[2].url;
				}

				urls.best = (formats[0]) ? formats[0].url : (formats[1]) ? formats[1].url : (formats[2]) ? formats[2].url : '';
			}

			// Video Info
			videoDetails = processVideoDetails(urls, player_response.videoDetails);

			if (callback) {
				callback(videoDetails);
			}
		};

		xhr.onerror = function(e) {
			Ti.API.info('error, HTTP status = ' + this.status);
			if (errorCallback) {
				errorCallback({ error: "http_error", result: e });
			} else {
				alert(e.error);
			}
		};

		xhr.open("POST", ytURL);

		xhr.setRequestHeader('Accept-Encoding', 'gzip');
		xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');

		xhr.send();
	} else {
		if (errorCallback) {
			errorCallback({ error: "no_video_id" });
		} else {
			alert('No Video ID provided!');
		}
	}
}

function noValidUrls(errorCallback) {
	if (errorCallback) {
		errorCallback({ error: "no_valid_urls" });
	} else {
		alert('There are no valid URLs to play the video!');
	}

	return false;
}

function processVideoDetails(_urls, _videoDetails) {
	let bestImage = (_videoDetails.thumbnail.thumbnails[4]) ? _videoDetails.thumbnail.thumbnails[4] : (_videoDetails.thumbnail.thumbnails[3]) ? _videoDetails.thumbnail.thumbnails[3] : (_videoDetails.thumbnail.thumbnails[2]) ? _videoDetails.thumbnail.thumbnails[2] : (_videoDetails.thumbnail.thumbnails[1]) ? _videoDetails.thumbnail.thumbnails[1] : (_videoDetails.thumbnail.thumbnails[0]) ? _videoDetails.thumbnail.thumbnails[0] : '';
	return {
		url: _urls,
		videoId: _videoDetails.videoId,
		keywords: _videoDetails.keywords,
		channelId: _videoDetails.channelId,
		viewCount: _videoDetails.viewCount,
		isLiveContent: _videoDetails.isLiveContent,
		averageRating: _videoDetails.averageRating,
		title: _videoDetails.title.replace(/\+/g, ' '),
		author: _videoDetails.author.replace(/\+/g, ' '),
		thumbnail: { xs: _videoDetails.thumbnail.thumbnails[0], sm: _videoDetails.thumbnail.thumbnails[1], md: _videoDetails.thumbnail.thumbnails[2], lg: _videoDetails.thumbnail.thumbnails[3], xl: _videoDetails.thumbnail.thumbnails[4], best: bestImage },
		shortDescription: _videoDetails.shortDescription.replace(/\+/g, ' '),
	};
}
