const tiYoutube = require('ti.youtube');

(function constructor() {
	'use strict';

	tiYoutube.getUrlByVideoId('SMKPKGW083c', url => {
		// Available Video Qualities:
		// medium ( typically 360p )
		// high ( typically 720p )
		// best ( best quality available either medium or high )
		$.videoPlayer.url = url.best;
	});

	$.window.open();
}());
