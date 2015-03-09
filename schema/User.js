'use strict';

exports = module.exports = function(app, mongoose) {
  var userSchema = new mongoose.Schema({
    username: { type: String, default: '' },
    password: String,
    email: { type: String, unique: true },
    banned: { type: Boolean, default: false},
    roles: {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    },
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    facebook: {},
    google: {},
    search: [String]
  });

  userSchema.methods.canPlayRoleOf = function(role) {
    if (role === "admin" && this.roles.admin) {
      return true;
    }
    if (role === "account" && this.roles.account) {
      return true;
    }
    return false;
  };

  userSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('account')) {
      returnUrl = '/account/';
    }
    if (this.canPlayRoleOf('admin')) {
      returnUrl = '/admin/';
    }
    return returnUrl;
  };

  userSchema.statics.encryptPassword = function(password) {
    return require('crypto').createHmac('sha512', app.get('crypto-key')).update(password).digest('hex');
  };

  userSchema.plugin(require('./plugins/pagedFind'));
  userSchema.index({ username: 1 }, { unique: true });
  userSchema.index({ email: 1 }, { unique: true });
  userSchema.index({ timeCreated: 1 });
  userSchema.index({ resetPasswordToken: 1 });
  userSchema.index({ 'facebook.id': 1 });
  userSchema.index({ 'google.id': 1 });
  userSchema.index({ search: 1 });
  userSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('User', userSchema);
};
