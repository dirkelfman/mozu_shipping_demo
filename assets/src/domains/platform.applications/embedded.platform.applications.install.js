module.exports = function(context, callback) {
    var extensionInstaller = require('mozu-extension-helpers/installers/extensions').installer();
    extensionInstaller.enableExtensions(context)
        .then(function() {
            callback();
        })
        .catch(callback);
};