function getUrlByVideoId(videoID, callback, errorCallback) {
	const xhr = Ti.Network.createHTTPClient({
		onload: function () {
			let player_response = qsToJson(this.responseText).player_response;

			if (player_response.playabilityStatus.playableInEmbed) {
				let urls = {};
				let formats = player_response.streamingData.formats;
				let hlsManifestUrl = player_response.streamingData.hlsManifestUrl;

				if (hlsManifestUrl) {
					urls.medium = urls.high = urls.best = hlsManifestUrl;
					callback(urls);
				} else if (formats) {
					// formats[0] typically contains 360p video ( medium quality )
					if (formats[0]) {
						urls.medium = formats[0].url;
					}

					// formats[1] typically contains 720p video ( hd720 quality )
					if (formats[1]) {
						urls.high = formats[1].url;
					}

					urls.best = (urls.high) ? urls.high : urls.medium;

					callback(urls);
				} else {
					if (errorCallback) {
						errorCallback({ error: "no_valid_urls" });
					} else {
						alert('There are no valid URLs to play the video!');
					}
				}
			} else {
				if (errorCallback) {
					errorCallback({ error: "video_not_allowed" });
				} else {
					alert('This video cannot be played natively!');
				}
			}
		},

		onerror: function (e) {
			Ti.API.info('error, HTTP status = ' + this.status);
			if (errorCallback) {
				errorCallback({ error: "http_error", result: e });
			} else {
				alert(e.error);
			}
		},

		timeout: 5000
	});

	xhr.open("GET", `https://www.youtube.com/get_video_info?video_id=${videoID}`);

	xhr.send();
}
module.exports.getUrlByVideoId = getUrlByVideoId;

function getVideoIdFromUrl(urlStream) {
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
