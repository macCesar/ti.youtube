let googleApiKey = Ti.App.Properties.getString('googleApiKey');
const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
let videoId;
let url;
let videoDetails = {};

module.exports.init = function(urlStream, callback, errorCallback) {
	videoId = getVideoIdFromUrl(urlStream);

	if (videoId) {
		const xhr = Ti.Network.createHTTPClient();

		let ytURL = `https://www.youtube.com/watch?v=${videoId}&pbj=1&key=${INNERTUBE_API_KEY}`;

		xhr.clearCookies(ytURL);

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

			// Check if it does not contain any streaming Data
			if (!player_response.streamingData) {
				noValidUrls(errorCallback);
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
			videoDetails = processDetails(urls, player_response.videoDetails);

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

		console.warn('ytURL:', ytURL);
		xhr.open("POST", ytURL);

		// xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
		// xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');

		xhr.send();
	} else {
		if (errorCallback) {
			errorCallback({ error: "no_video_id" });
		} else {
			alert('No Video ID provided!');
		}
	}
}

function getUrlByVideoId(videoId, callback, errorCallback) {
	if (videoId) {
		const xhr = Ti.Network.createHTTPClient();

		let ytURL = `https://www.youtube.com/watch?v=${videoId}&pbj=1&key=${INNERTUBE_API_KEY}`;

		xhr.clearCookies(ytURL);

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

			// Check if it does not contain any streaming Data
			if (!player_response.streamingData) {
				noValidUrls(errorCallback);
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
			videoDetails = processDetails(urls, player_response.videoDetails);

			if (callback) {
				callback(urls);
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

		console.warn('ytURL:', ytURL);
		xhr.open("POST", ytURL);

		// xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
		// xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');

		xhr.send();
	} else {
		if (errorCallback) {
			errorCallback({ error: "no_video_id" });
		} else {
			alert('No Video ID provided!');
		}
	}
}
module.exports.getUrlByVideoId = getUrlByVideoId;

function noValidUrls(errorCallback) {
	if (errorCallback) {
		errorCallback({ error: "no_valid_urls" });
	} else {
		alert('There are no valid URLs to play the video!');
	}
}

function getVideoIdFromUrl(urlStream) {
	// https://stackoverflow.com/a/53142593/5791020 & https://regex101.com/r/l0m7yh/1
	let regExp = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)(\/)?(watch\?v=|\?v=)?(.*)$/;

	let match = urlStream.match(regExp);

	return (match && match[6].length === 11) ? match[6] : false;
}
module.exports.getVideoIdFromUrl = getVideoIdFromUrl;

function qsToJson(qs) {
	let res = {};

	let pars = qs.split('&');

	let kv, k, v;

	for (let i in pars) {
		kv = pars[i].split('=');
		k = kv[0];
		v = kv[1];
		res[k] = decodeURIComponent(v);
	}

	res.player_response = JSON.parse(res.player_response);

	return res;
}

function getVideoDetails() {
	return videoDetails;
}
module.exports.getVideoDetails = getVideoDetails;

module.exports.setApiKey = function(_googleApiKey) {
	googleApiKey = _googleApiKey;
}

module.exports.getApiKey = function() {
	return googleApiKey;
}

function send(args) {
	const request = Ti.Network.createHTTPClient();

	request.onload = function() {
		let response;

		try {
			response = JSON.parse(this.responseText);
			if (_.isFunction(args.success)) {
				args.success(response);
			}
		} catch (e) {
			Ti.API.warn('Unable to parse JSON for xhr(): ' + JSON.stringify(e));
		}
	};

	request.onerror = function(e) {
		Ti.API.warn('HTTP error for: ' + args.url);

		let status = this.status;

		Ti.API.error('Xhr lib response error: ');

		Ti.API.error('status: ' + status);

		Ti.API.error('responseText: ' + this.responseText);

		if (_.isFunction(args.error)) {
			args.error(e);
		}

	};

	request.timeout = 30000;

	request.open(args.method || 'GET', args.url);

	// add any headers
	for (let header in args.headers) {
		request.setRequestHeader(header, args.headers[header]);
	}

	if (args.data) {
		request.send(JSON.stringify(args.data));
	} else {
		request.send();
	}
}

function processDetails(_urls, _videoDetails) {
	return {
		url: _urls,
		videoId: _videoDetails.videoId,
		channelId: _videoDetails.channelId,
		viewCount: _videoDetails.viewCount,
		isLiveContent: _videoDetails.isLiveContent,
		title: _videoDetails.title.replace(/\+/g, ' '),
		author: _videoDetails.author.replace(/\+/g, ' '),
		thumbnail: { xs: _videoDetails.thumbnail.thumbnails[0], sm: _videoDetails.thumbnail.thumbnails[1], md: _videoDetails.thumbnail.thumbnails[2], lg: _videoDetails.thumbnail.thumbnails[3], xl: _videoDetails.thumbnail.thumbnails[4] },
		shortDescription: _videoDetails.shortDescription.replace(/\+/g, ' '),
	};
}
