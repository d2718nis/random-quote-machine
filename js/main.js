// Trim html tags, json responce contains some
function trimHtmlTags(html) {
	 var tmp = document.createElement('div');
	 tmp.innerHTML = html;
	 return tmp.textContent || tmp.innerText || '';
}
// The clock
function startClock() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		$('.clock').text(formatTime(h, m));
		var t = setTimeout(startClock, 500);
}
// Format clock: AM/PM and minutes like 3 -> 03
function formatTime(h, m) {
	if (h > 12) {
		return (h - 12) + ':' + (m < 10 ? m = '0' + m : m) + ' PM';
	} else {
		return h + ':' + (m < 10 ? m = '0' + m : m) + ' AM';
	}
}
// Calculate window position
function calculateWindowPosition(elem) {
	var creditsLeftPosition = ($(window).width() - $(elem).width()) / 2;
	$(elem).css('left', creditsLeftPosition + 'px');
}
// Show credits window
function displayCredits() {
	calculateWindowPosition('#credits');
	$('#credits').css('top', '25%');
	$('#credits').css('display', 'block');
	$('.block-content').css('display', 'block');
	// TODO: Should change during focus too! + z-index
	$('.panel-title-text').text('About author');
}
// Hide credits window
function closeCredits() {
	$('#credits').css('display', 'none');
	$('.block-content').css('display', 'none');
	$('.panel-title-text').text('Quotes');
}
// Start JSON request
var counter = 0;
function startJson() {
	// Counter to prevent hanging while making JSON request recursively
	counter = 0;
	gotoJson();
}
// Recursive function, request quote until it fits 140 symbols
function gotoJson() {
	// Receive 10 objects at the one time
	// TODO: now it's just one
	var getQuote = $.getJSON('https://jsonp.afeld.me/?callback=?&url=\
		https%3A%2F%2Fquotesondesign.com%2Fwp-json%2Fposts%3Ffilter%5Borderby%5D%3Drand%26filter%5Bposts_per_page%5D%3D1')
	getQuote.then(function(json) {
		// Get pure text without tags and spaces etc.
		var quote = trimHtmlTags(json[0].content).replace(/^\s+|\s+$/g, '');
		var author = trimHtmlTags(json[0].title).replace(/^\s+|\s+$/g, '');
		// Check if whole text fits twitter 140 symbols
		if ((quote + '\n— ' + author).length <= 140) {
			// Apply quote and author
			$('.quote').html(quote);
			$('.author').html('— ' + author);
			// Prepare the Tweet button
			$('.button-shr').removeClass('button-disabled');
			$('.button-shr').attr('href', 'https://twitter.com/intent/tweet?text=' + 
			encodeURIComponent($('.quote').text() + '\n' + $('.author').text()));
		} else {
			// Give up after 30 tries to prevent hanging
			if (counter > 30) {
				$('.quote').html(`Can't load proper quote, please try again later.`);
				$('.author').html('');
				return;
			}
			// Quote is too long, repeat
			counter++;
			gotoJson();
		}
	});
	getQuote.catch(function(err) {
		alert('getQuote: ' + JSON.stringify(err));
	})
}

$(document).ready(function() {
	// ======== Startup ========
	// Start top panel clock
	startClock();

	// Prepare the Tweet button href attribute
	$('.button-shr').attr('href', 'https://twitter.com/intent/tweet?text=' + 
			encodeURIComponent($('.quote').text() + '\n' + $('.author').text()));

	// Calculate window position on start
	calculateWindowPosition('#app');
	$('#app').css('display', 'block');

	// Toggle draggable object
	$('.app-window').draggable({ 
		cursor: 'move',
		// drag only by window title bar
		cancel: '.window-body'
	});

	// ======== Events ========
	// Request quote via API
	$('.button-roll').on('click', function() {
		// Disable twitter button
		$('.button-shr').removeAttr('href');
		$('.button-shr').addClass('button-disabled');
		$('.quote').html('Loading quote...<br><br>');
		$('.author').html('<br>');
		startJson();
	});

	// Easter egg
	$('.panel-title-text').on('click', function() {
		if ($('.panel-title-text').text() == 'Quotes'){
			$('.panel-title-text').text('Yes We Code');
		} else {
			$('.panel-title-text').text('Quotes');
		}
	});

	// Show credits
	$('.close-button, .minimize-button').on('click', function() {
		displayCredits();
	});
	// Hide credits
	$('.button-credits-ok').on('click', function() {
		closeCredits();
	});
});
