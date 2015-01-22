var moment = require('moment');
var colors = require('colors');

exports = module.exports = function(req, res) {
	var typeAssoc = {
		act: 0
	};

	var selector = {
		'act': Activity
	};

	// selector[req.body.type](req, res);
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		console.log('validate'.green);
		if (!req.body.title) {
			workflow.outcome.errfor.title = req.i18n.t('errors.required');
		}
		else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
			workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		}

		var reg = new RegExp(req.i18n.t('dateRegex'));

		if (!req.body.date0) {
			workflow.outcome.errfor.date = req.i18n.t('errors.required');
		}

		if (!req.body.date1) {
			workflow.outcome.errfor.date = req.i18n.t('errors.required');
		}

		if (!req.body.hashtag) {
			workflow.outcome.errfor.hashtag = req.i18n.t('errors.required');
		}

		if (!req.body.place || !req.body.place_value || !req.body.place_Lng || !req.body.place_Lat) {
			workflow.outcome.errfor.place = req.i18n.t('errors.required');
		}

		// if (req.body.numOfPtc < 0) {
		// 	workflow.outcome.errfor.numOfPtc = req.i18n.t('errors.required');
		// }

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}
		workflow.emit('insertEvent');
	});

	workflow.on('insertEvent', function() {
		console.log('insertEvent'.green);
		var fieldsToSet = {
			acc: req.user._id,
			accType: req.session.accType,
			type: typeAssoc[req.body.type],
			category: req.body.category,
			title: req.body.title,
			desc: req.body.desc,
			date: moment(req.body.date0).toDate(),
			date2: moment(req.body.date1).toDate(),
			hashtag: req.body.hashtag,
			place: req.body.place_value,
			latLng: [req.body.place_Lng, req.body.place_Lat],
			toNotif: req.body.toNotif
		};
		fieldsToSet.troc = (req.body.swap ? req.body.swap : false);
		fieldsToSet.numOfPtc = ((!req.body.numOfPtc || !(req.body.numOfPtc).match(/^[0-9]+$/)) ? 0 : req.body.numOfPtc);

		console.log("before request create");
		req.app.db.models.Event.create(fieldsToSet, function(err, event) {
			console.log("inside".green);
			console.log(err+''.red);
			console.log(event+''.green);
			if (err) {
				return workflow.emit('exception', err);
			}
			var notif = require('../../tools/RRNotifications.js');
			notif.addNotification(req.app, req, event, req.body.toNotif, typeAssoc[req.body.type]);
			workflow.outcome.event = event;
			return workflow.emit('response');
		});
		console.log("after request create");
	});

	workflow.emit('validate');
}

var Activity = function(req, res){
	var workflow = req.app.utility.workflow(req, res);
	// req.body.date0 = moment(req.body.date0, "DD/MM/YYYY HH:mm").toDate();

	workflow.on('validate', function() {
		if (!req.body.title) {
			workflow.outcome.errfor.title = req.i18n.t('errors.required');
		}
		else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
			workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		}

		var reg = new RegExp(req.i18n.t('dateRegex'));

		if (!req.body.date0) {
			workflow.outcome.errfor.date = req.i18n.t('errors.required');
		}

		if (!req.body.date1) {
			workflow.outcome.errfor.date = req.i18n.t('errors.required');
		}

		if (!req.body.hashtag) {
			workflow.outcome.errfor.hashtag = req.i18n.t('errors.required');
		}

		if (!req.body.place) {
			workflow.outcome.errfor.place = req.i18n.t('errors.required');
		} else if (!req.body.place_value || !req.body.place_Lng || !req.body.place_Lat) {
			workflow.outcome.errfor.place = req.i18n.t('errors.place');
		}

		if (!req.body.numOfPtc < 0) {
			workflow.outcome.errfor.numOfPtc = req.i18n.t('errors.required');
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}
		workflow.emit('insertAEvent');
	});

	workflow.on('insertAEvent', function() {
		var fieldsToSet = {
			acc: req.user._id,
			accType: req.session.accType,
			title: req.body.title,
			desc: req.body.desc,
			date: moment(req.body.date0).toDate(),
			date2: moment(req.body.date1).toDate(),
			hashtag: req.body.hashtag,
			place: req.body.place_value,
			latLng: [req.body.place_Lng, req.body.place_Lat],
			price: (!(req.body.price).match(/^[0-9]+$/) ? 0 : req.body.price),
			numOfPtc: req.body.numOfPtc,
			toNotif: req.body.toNotif
		};
		console.log("list to user : " + req.body.toNotif);
		req.app.db.models.Aevent.create(fieldsToSet, function(err, event) {
			if (err)
				return workflow.emit('exception', err);
			var notif = require('../../tools/RRNotifications.js');
			notif.addNotification(req.app, req, event, req.body.toNotif, "activity");
			workflow.outcome.event = event;
			return workflow.emit('response');
		});
	});

	// workflow.on('uploadImage', function() {
	//   var ext = (/([^.;+_]+)$/).exec(req.files.file.originalFilename);
	//   require('../../../tools/image_upload').uploadEvent(req, res, 'aevent', workflow.event._id, ext[1]);
	// });
	workflow.emit('validate');
};

