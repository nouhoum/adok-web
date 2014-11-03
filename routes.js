/**
* URL Schema for Adok
**/

'use strict';

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.set('X-Auth-Required', 'true');
	res.redirect('/login/?returnUrl='+ encodeURIComponent(req.originalUrl));
}

function ensureAdmin(req, res, next) {
	if (req.user.canPlayRoleOf('admin')) {
		return next();
	}
	res.redirect('/');
}

function ensureAccount(req, res, next) {
	if (req.user.canPlayRoleOf('account') && req.session.accType == 'account') {
		if (req.app.get('require-account-verification')) {
			if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
				return res.redirect('/account/verification/');
			}
		}
		return next();
	}
	res.redirect('/');
}

function checkIfConnected(req, res, next) {
	if (req.isAuthenticated()) {
		console.log("req.user.canPlayRoleOf('admin') =", req.user.canPlayRoleOf('admin'));
		console.log(req.session.accType);
		if (req.session.accType == 'account') {
			if (req.user.canPlayRoleOf('account'))
				return res.redirect('/account/');
		} else if (req.user.canPlayRoleOf('admin')) {
			return res.redirect('/admin/');
		}
		return res.redirect('/logout/');
	}
	return next();
}

function getContactList(req, res, next) {
	req.app.db.models.UserLink.find({ $or: [ { 'folwr.account': req.user.roles.account._id}, {'folwd.account.id': req.user.roles.account._id } ] }).select('-__v').populate('folwr.account').populate('folwd.account.id').exec(function(err, results) {
		if (err)
			res.send(400, err);
		var toRender = [];
		require('async').eachSeries(results, function(row, done) {
			var toPush = {
				id: '',
				name: '',
				pic: ''
			};
			if (row.folwr.account && row.folwd.account && row.folwd.account.id._id) {
				if (row.folwr.account._id.toString() == req.user.roles.account._id.toString()) {
					toPush.id = row.folwd.account.id._id;
					toPush.name = row.folwd.account.id.name.full;
					toPush.pic = row.folwd.account.id.picture;
				} else {
					toPush.id = row.folwr.account._id;
					toPush.name = row.folwr.account.name.full;
					toPush.pic = row.folwr.account.picture;
				}
				toRender.push(toPush);
			}
			return done();
		});
		req.session.contacts = toRender;
		return next();
	});
}

exports = module.exports = function(app, passport) {
	//front end
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	app.all('/', checkIfConnected);
	app.post('/feedback', require('./views/feedback/index').sendFeedback);
	app.get('/', require('./views/index').init);
	app.post('/contact', require('./views/contact/index').sendMessage);

	//sign up
	app.post('/signup', require('./views/signup/index').signup);

	//social -- sign up
	app.post('/signup/social/', require('./views/signup/index').signupSocial);
	app.get('/signup/facebook/', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: ['email'] }));
	app.get('/signup/facebook/callback/', require('./views/signup/index').signupFacebook);
	app.get('/signup/google/', passport.authenticate('google', { callbackURL: '/signup/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/signup/google/callback/', require('./views/signup/index').signupGoogle);

	//login/out
	app.post('/login', require('./views/login/index').login);
	app.get('/login/forgot/', require('./views/login/forgot/index').init);
	app.post('/login/forgot/', require('./views/login/forgot/index').send);
	app.get('/login/reset/', require('./views/login/reset/index').init);
	app.get('/login/reset/:token/', require('./views/login/reset/index').init);
	app.put('/login/reset/:token/', require('./views/login/reset/index').set);
	app.get('/logout/', require('./views/logout/index').init);

	//social login account
	app.get('/login/facebook/', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
	app.get('/login/facebook/callback/', require('./views/login/index').loginFacebook);
	app.get('/login/google/', passport.authenticate('google', { callbackURL: '/login/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/login/google/callback/', require('./views/login/index').loginGoogle);

	//adok-adm
	//app.all('/adok-adm*', ensureAuthenticated);
	//app.all('/adok-adm*', ensureAdmin);
	app.get('/adok-adm/', require('./views/adok-adm/index').init);
	app.post('/adok-adm/', require('./views/adok-adm/index').login);

	//admin
	app.all('/admin*', ensureAuthenticated);
	app.all('/admin*', ensureAdmin);
	app.get('/admin/', require('./views/admin/index').init);

	//admin > users
	app.get('/admin/users/', require('./views/admin/users/index').find);
	app.post('/admin/users/', require('./views/admin/users/index').create);
	app.get('/admin/users/:id/', require('./views/admin/users/index').read);
	app.put('/admin/users/:id/', require('./views/admin/users/index').update);
	app.put('/admin/users/:id/password/', require('./views/admin/users/index').password);
	app.put('/admin/users/:id/role-admin/', require('./views/admin/users/index').linkAdmin);
	app.delete('/admin/users/:id/role-admin/', require('./views/admin/users/index').unlinkAdmin);
	app.put('/admin/users/:id/role-account/', require('./views/admin/users/index').linkAccount);
	app.delete('/admin/users/:id/role-account/', require('./views/admin/users/index').unlinkAccount);
	app.delete('/admin/users/:id/', require('./views/admin/users/index').delete);

	//admin > eevents
	app.get('/admin/eevents/', require('./views/admin/eevents/index').init);
	app.get('/admin/eevents/:id/', require('./views/admin/eevents/index').read);
	app.put('/admin/eevents/:id/', require('./views/admin/eevents/index').update);


	//admin > administrators
	app.get('/admin/administrators/', require('./views/admin/administrators/index').find);
	app.post('/admin/administrators/', require('./views/admin/administrators/index').create);
	app.get('/admin/administrators/:id/', require('./views/admin/administrators/index').read);
	app.put('/admin/administrators/:id/', require('./views/admin/administrators/index').update);
	app.put('/admin/administrators/:id/permissions/', require('./views/admin/administrators/index').permissions);
	app.put('/admin/administrators/:id/groups/', require('./views/admin/administrators/index').groups);
	app.put('/admin/administrators/:id/user/', require('./views/admin/administrators/index').linkUser);
	app.delete('/admin/administrators/:id/user/', require('./views/admin/administrators/index').unlinkUser);
	app.delete('/admin/administrators/:id/', require('./views/admin/administrators/index').delete);

	//admin > admin groups
	app.get('/admin/admin-groups/', require('./views/admin/admin-groups/index').find);
	app.post('/admin/admin-groups/', require('./views/admin/admin-groups/index').create);
	app.get('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').read);
	app.put('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').update);
	app.put('/admin/admin-groups/:id/permissions/', require('./views/admin/admin-groups/index').permissions);
	app.delete('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').delete);

	//admin > accounts
	app.get('/admin/accounts/', require('./views/admin/accounts/index').find);
	app.post('/admin/accounts/', require('./views/admin/accounts/index').create);
	app.get('/admin/accounts/:id/', require('./views/admin/accounts/index').read);
	app.put('/admin/accounts/:id/', require('./views/admin/accounts/index').update);
	app.put('/admin/accounts/:id/user/', require('./views/admin/accounts/index').linkUser);
	app.delete('/admin/accounts/:id/user/', require('./views/admin/accounts/index').unlinkUser);
	app.post('/admin/accounts/:id/notes/', require('./views/admin/accounts/index').newNote);
	app.post('/admin/accounts/:id/status/', require('./views/admin/accounts/index').newStatus);
	app.delete('/admin/accounts/:id/', require('./views/admin/accounts/index').delete);

	 //admin > statuses
	app.get('/admin/statuses/', require('./views/admin/statuses/index').find);
	app.post('/admin/statuses/', require('./views/admin/statuses/index').create);
	app.get('/admin/statuses/:id/', require('./views/admin/statuses/index').read);
	app.put('/admin/statuses/:id/', require('./views/admin/statuses/index').update);
	app.delete('/admin/statuses/:id/', require('./views/admin/statuses/index').delete);

	//admin > search
	app.get('/admin/search/', require('./views/admin/search/index').find);

	//account
	app.all('/account*', ensureAuthenticated);
	app.all('/account*', ensureAccount);
	//app.all('/account*', getContactList);
	app.get('/account/', require('./views/account/index').init);

	//inDev
	app.post('/friends/add', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/cancel', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/deny', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/accept', require('./tools/follow').Accept);
	app.get('/conversations/:id', require('./tools/conversation').getConversations)

	//account > verification
	app.get('/account/verification/', require('./views/account/verification/index').init);
	app.post('/account/verification/', require('./views/account/verification/index').resendVerification);
	app.get('/account/verification/:token/', require('./views/account/verification/index').verify);

	//account > settings
	app.get('/account/settings/', require('./views/account/settings/index').init);
	app.put('/account/settings/identity/', require('./views/account/settings/index').identity);
	app.put('/account/settings/password/', require('./views/account/settings/index').password);
	app.delete('/account/settings/delete/', require('./views/account/settings/index').delete);

	//account > propose
	app.get('/account/propose/', require('./views/account/propose/index').init);
	app.post('/account/propose/activity', require('./views/account/propose/index').addActivity);
	app.post('/account/propose/exchange', require('./views/account/propose/index').addExchange);
	app.put('/account/edit/activity', require('./views/events/activity').update);

	//account > zone
	app.all('/user*', ensureAuthenticated);
	app.get('/user/', function(req, res, next) {
		require('./views/'+req.session.accType+'/zone/user/index').init(req, res, next);
	});
	app.put('/user/', require('./views/account/zone/user/index').update);
	app.get('/user/:id', function(req, res, next) {
		require('./views/'+req.session.accType+'/zone/user/index').init(req, res, next);
	});

	//upload
	app.all('/upload*', ensureAuthenticated);
	app.post('/upload/image/:type', require('./tools/image_upload').init); // check HERE !

	//follow
	app.all('/follow*', ensureAuthenticated);
	app.post('/follow', require('./tools/follow').AddCancelAndDeny);

	//notifications
	app.all('/feed*', ensureAuthenticated);
	app.get('/feed', require('./tools/Notifications').init);
	app.get('/feed/:id', require('./tools/Notifications').init);
	app.post('/feed/follow/accept', require('./tools/follow').notifAccept);
	app.post('/feed/follow/deny', require('./tools/follow').notifDeny);

	//account > network
	app.get('/account/network/', require('./views/account/network/index').init);

	//account > settings > social
	app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }));
	app.get('/account/settings/facebook/callback/', require('./views/account/settings/index').connectFacebook);
	app.get('/account/settings/facebook/disconnect/', require('./views/account/settings/index').disconnectFacebook);
	app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: '/account/settings/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/account/settings/google/callback/', require('./views/account/settings/index').connectGoogle);
	app.get('/account/settings/google/disconnect/', require('./views/account/settings/index').disconnectGoogle);

	app.all('/event*', ensureAuthenticated);
	app.get('/event/activity/:id', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/activity').init(req, res, next);
	});
	app.get('/event/activity/:id/edit', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/activity').edit(req, res, next);
	});

	app.get('/event/ownerActions', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/delete').init(req, res, next);
	})

	app.post('/event/ownerActions', require('./views/events/delete').init);
	app.post('/eventRegister', require('./tools/EventRegister').init);
	app.post('/eventRegister/:type/:uid/accept', require('./tools/EventRegister').accept);
	app.post('/eventRegister/:type/:uid/deny', require('./tools/EventRegister').deny);
	app.post('/eventRegister/accept', require('./tools/EventRegister').notifAccept);
	app.post('/eventRegister/deny', require('./tools/EventRegister').notifDeny);

	//upload
	app.all('/upload*', ensureAuthenticated);
	app.post('/upload/image/:type', require('./tools/image_upload').init);

	//follow
	app.post('/follow', require('./tools/follow').AddCancelAndDeny);

	//map search
	var geocoder = require('node-geocoder').getGeocoder('google', 'https', { apiKey: 'AIzaSyCp2_kKWJ9XEVQHOZbNfgP3trYpJ0CyXtQ'});
	app.all('/geocode*', ensureAuthenticated);
	app.post('/geocode/', function(req, res) {
		geocoder.geocode(req.body.query, function(err, results) {
			if (err)
				return res.send(400, 'An error occured');
			var ret = [];
			results.forEach(function(item) {
				if (item.streetNumber && item.streetName && item.zipcode)
				var addr = item.streetNumber+' '+item.streetName+', '+item.zipcode+' '+item.city;
				ret.push({addr: addr, latlng: {lat: item.latitude, lng: item.longitude }});
			});
			res.jsonp(ret);
		});
	});

	app.all('/geojson*', ensureAuthenticated);
	app.get('/geojson/full', require('./tools/geoGetters').init);
	app.get('/geojson/update/:a/:e/:o', require('./tools/geoGetters').update);

	app.all('/usersearch*', ensureAuthenticated);
	app.post('/usersearch', require('./tools/SearchUsers').init);

	//route not found
	app.all('*', require('./views/http/index').http404);
};
