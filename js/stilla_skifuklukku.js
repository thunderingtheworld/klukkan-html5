
// These variables are the troublemakers: find a way to do this differently
// so the code can be reused in les_tima.js
var turned_full_circles = 0;
var lastMinute = 0;

$(document).ready( function () {
	enableSettingsButton();
	$('#dialog input[type=radio]').on('change', function() {
		getNextQuestion();
	});
	
	preloadPage(); // calls preloader in functions.js & then startGame() below
});

function startGame() {
	initPreloadedImgs();
	
	workaroundMakeMobileLinksWork();

	$('.seconds-container').hide();
	var audio = new Audio('media/audio/stilla_skifuklukku.mp3');
	audio.play();
	
	getNextQuestion();
	userDragClock();
	
	$('#submit-answer').click( function() {
		var answer = $('#cpu-clock-time-minutes').html().split(":");
		clockfaceSubmitAnswer(answer[0], answer[1]);
	});
	
	$('#next-question').click( function() { 
		getNextQuestion();
	});
}

function getNextQuestion() {
	// XML with text, audio, hours, minutes: times1.xml and times2.xml
	
	var settings_radio = $('#dialog :checked').attr("id");
	if (settings_radio == "radio1") {
		var filename = "times1.xml";
	}
	else {
		var filename = "times2.xml";
	}
	
	$.get( filename, function(xml){ 
		var times = $.xml2json(xml); 
		var random = getRandomInt(0, times.time.length);
		var json = times.time[random]; 
		if ( json.hours.length == 1) {
			json.hours = "0"+json.hours;
		}
		if ( json.minutes.length == 1) {
			json.minutes = "0"+json.minutes;
		}
		$('#cpu-clock-time-minutes').html(json.hours + ":" + json.minutes);
	});
}

function xyToDegrees(x, y) { 
	/*
	 note: troublemaker variables: lastMinute and turned_full_circles...
	 how to rewrite?
	*/
	// in: x,y coordinates of mouse or mobile dragging
	// out: The "degrees" the mouse is currently dragging to in a coordinate system where 12 o clock is 0 degrees and the center of the clock is (0,0)
	
	var rect = $('.clock')[0].getBoundingClientRect();
	var clock_center_x = rect.left + rect.width/2;
	var hardcode_img_offset = 70; // hardcoding, image is not rectangular
	var clock_center_y = rect.top + rect.height/2 + hardcode_img_offset;
	var center = new Array(clock_center_x, clock_center_y); // center of clock
	var x_c = x - center[0];
	var y_c = center[1] - y;
	var radians = Math.atan2( x_c, y_c); 
	var degrees = radianToDegrees(radians); // these "degrees" calculate 12 o clock as 0 degrees.
	if (degrees < 0.0) {
		degrees += 360.0;
	}
	
	// To go beyond 360 degrees or below 0 degrees we need to write this here, without it we could never move the minutes more than 360 degrees, which would only allow us one hour of rotation
	var minutes = Math.floor(degrees/6); // using minutes for simplicity 
	if (50 < lastMinute && lastMinute < 60 && 0 <= minutes && minutes < 10) { // going over 12 into one hour more +
		turned_full_circles += 1;
	}
	if (50 < minutes && minutes < 60 && 0 <= lastMinute && lastMinute < 10) { // going over 12 into one hour less -
		turned_full_circles -= 1;
	}
	lastMinute = minutes;
	degrees += turned_full_circles*360;
	
	setupClockMinuteHourHands(degrees);
}