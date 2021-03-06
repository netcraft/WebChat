WebChat.controller('AppController', ['$scope', 'server', 'beeper', 'counter', 'localization', 'i18nFilter', function($scope, server, beeper, counter, localization, i18nFilter) {

	var langCode = (navigator.language || navigator.userLanguage).toLowerCase();

	function serverConnected() {
		console.log('WebChat is ready!');
	}

	function updateUserNick(nick) {
		$scope.user.newNick = nick;
	}

	function loggedIn() {
		$scope.user.nick = $scope.user.newNick;
		$scope.user.loggedIn = true;
		bindCounter();
	}

	function bindCounter() {
		if (!this.bound) {
			window.addEventListener('focus', disableCounter);
			window.addEventListener('blur', enableCounter);
			this.bound = true;
		}
	}

	function displayCounter() {
		$scope.title = $scope.appName + ' (' + counter.getValue() + ')';
	}

	function enableCounter() {
		counter.enable();
	}

	function disableCounter() {
		counter.disable();
		$scope.title = $scope.appName;
	}

	$scope.appName = 'Web Chat';
	$scope.title = $scope.appName;

	// Default user information
	$scope.user = {
		nick: '',
		newNick: '',
		loggedIn: false
	};

	$scope.templates = {
		userList:		'templates/general/user_list.html',
		loginMessage:	'templates/general/login_message.html',
		chatMessages:	'templates/general/messages.html',
		loginForm:		'templates/forms/login.html',
		messageForm:	'templates/forms/message.html'
	};

	$scope.logout = function() {
		$scope.user.nick = '';
		$scope.user.loggedIn = false;
		$scope.$emit('messageAll', { message: 'app:logout' });
	};

	$scope.setLanguage = function(methodCode, lang) {
		var method;

		if (methodCode === 'name') {
			method = 'setLanguageByName';
		} else {
			method = 'setLanguageByCode';
		}

		localization[method](lang).then( function(data) {
			$scope.i18n = data;
			$scope.language = localization.getLanguage().name;
		});
	};

	$scope.setLanguage('code', langCode);
	$scope.languages = localization.getLanguageList();

	$scope.beeperActive = beeper.isActive;
	$scope.beeperTooltip = beeper.isActive() ? 'disable_sound' : 'enable_sound';

	$scope.toggleBeeper = function() {
		if (beeper.isActive()) {
			beeper.disable();
			$scope.beeperTooltip = 'enable_sound';
		} else {
			beeper.enable();
			$scope.beeperTooltip = 'disable_sound';
		}
	};

	$scope.$on('messageAll', function(e, data) {
		$scope.$broadcast(data.message, data.data);
	});

	$scope.$on('server:connected', serverConnected);

	$scope.$on('app:login', function(e, nick) {
		updateUserNick(nick);
	});

	$scope.$on('app:nickError', function(e) {
		window.alert(i18nFilter('nick_is_already_in_use'));
	});

	$scope.$on('app:loggedIn', loggedIn);

	$scope.$on('chat:message', function(e) {
		beeper.beep();

		if (counter.isActive()) {
			counter.increase();
			displayCounter();
		}
	});

}]).run( ['server', 'speechRecognition', function(server, speechRecognition) {

	if ('WebSocket' in window) {
		console.log('Preparing WebChat..');
		server.connect();
	} else {
		console.error('We are sorry, you cannot use WebChat.');
		return false;
	}

	if ('webkitSpeechRecognition' in window) {
		speechRecognition.init();
	}

}]);