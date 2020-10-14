const streamingData = require('youtube-streaming-data');

(function constructor() {
	'use strict';

	streamingData.getUrlByVideoId('SMKPKGW083c', url => {
		// Available Video Qualities:
		// medium ( typically 360p )
		// high ( typically 720p )
		// best ( best quality available either medium or high )
		$.videoPlayer.url = url.best;
	});

	$.window.open();
}());
