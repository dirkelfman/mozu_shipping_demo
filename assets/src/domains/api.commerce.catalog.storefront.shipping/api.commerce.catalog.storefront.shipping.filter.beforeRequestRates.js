/**
 * Implementation for api.commerce.catalog.storefront.shipping.filter.beforeRequestRates
 * This function will receive the following context object:

{
  "type": "mozu.actions.context.api.filter"
}

 */

var ShippingHelper = require('../../helpers/shippingHelper');

module.exports = function(context, callback) {
  var shippingHelper = new ShippingHelper(context, callback);
  shippingHelper.execute();
};