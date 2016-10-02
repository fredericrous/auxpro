import Utils from 'utils/Utils.js';
import ActionBase from 'core/ActionBase.js';
import RestService from 'services/rest/RestService.js';

// LOGON
var Logon = new ActionBase({ name: 'LOGON' });
Logon.do = function (args) {
	Utils.checkMembers(args, ['user', 'pass']);
	var reqParam = {
		url   : '/auth',
		token : Utils.encode(args.user, args.pass)
	}; 
	return RestService._request(reqParam);
}

// LOGOUT
var Logout = new ActionBase({ name: 'LOGOUT' });
Logout.do = function () {
	return new Promise(function (resolve, reject) {
		resolve();
	});
}

// ROUTING
var RouterChanged = new ActionBase({ name: 'ROUTER_CHANGED' });
RouterChanged.do = function (args) {
	Utils.checkMembers(args, ['route']);
	return new Promise(function (resolve, reject) {
		resolve(args.route);
	});
}


// GET IMAGE
let GetImage = new ActionBase({ name: 'GET_IMAGE' });
GetImage.do = function (args) {
	Utils.checkMembers(args, ['token', 'image']);
	var reqParam = {
		url   : '/images/' + args.image,
		token : args.token,
		type  : 'arraybuffer'
	}; 
	return RestService._request(reqParam);
}

// POST IMAGE
let PostImage = new ActionBase({ name: 'POST_IMAGE' });
PostImage.do = function (args) {
	Utils.checkMembers(args, ['token', 'data']);
	var reqParam = {
		url   : '/images',
		token : args.token,
		method: 'POST',
		data  : args.data
	}; 
	return RestService._sendData(reqParam);
}