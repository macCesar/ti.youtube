let googleApiKey = Ti.App.Properties.getString('googleApiKey');

function getUrlByVideoId(videoID, callback, errorCallback) {
	if (videoID) {
		const xhr = Ti.Network.createHTTPClient({
			onload: function() {
				let player_response = qsToJson(this.responseText).player_response;

				if (!player_response.playabilityStatus.playableInEmbed) {
					if (errorCallback) {
						errorCallback({ error: "video_not_allowed" });
					} else {
						alert('This video cannot be played natively!');
					}
					return;
				}

				if (!player_response.streamingData) {
					noValidUrls(errorCallback);
					return;
				}

				let urls = {};
				let formats = player_response.streamingData.formats;
				let hlsManifestUrl = player_response.streamingData.hlsManifestUrl;

				if (hlsManifestUrl) {
					urls.medium = urls.high = urls.best = hlsManifestUrl;
					callback(urls);
					return;
				}

				if (formats) {
					// formats[0] typically contains 360p video ( medium quality )
					if (formats[0] && formats[0].url) {
						urls.medium = formats[0].url;
					}

					// formats[1] typically contains 720p video ( hd720 quality )
					if (formats[1] && formats[1].url) {
						urls.high = formats[1].url;
					}

					if (urls.high || urls.medium) {
						urls.best = (urls.high) ? urls.high : urls.medium;
					}

					if (!_.isEmpty(urls)) {
						callback(urls);
						return;
					}
				}

				noValidUrls(errorCallback);
			},

			onerror: function(e) {
				Ti.API.info('error, HTTP status = ' + this.status);
				if (errorCallback) {
					errorCallback({ error: "http_error", result: e });
				} else {
					alert(e.error);
				}
			},

			timeout: 5000
		});

		xhr.open("GET", `https://www.youtube.com/get_video_info?video_id=${videoID}&html5=1`);

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

module.exports.getVideoDetails = (videoID, callback, errorCallback) => {
	if (googleApiKey) {
		if (videoID) {
			send({
				method: 'GET',
				url: `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${googleApiKey}`,
				success: function(res) {
					callback(res.items[0].snippet);
				},
				error: function(err) {
					if (errorCallback) {
						errorCallback({ error: err });
					} else {
						alert(err);
					}
				}
			});
		} else {
			if (errorCallback) {
				errorCallback({ error: "no_video_id" });
			} else {
				alert('No Video ID provided!');
			}
		}
	} else {
		if (errorCallback) {
			errorCallback({ error: "no_api_key" });
		} else {
			alert('No Google API Key provided!');
		}
	}
}

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
