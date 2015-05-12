module.exports = {
  
 
  'api.commerce.catalog.storefront.shipping.filter.beforeRequestRates': {
      actionName:'api.commerce.catalog.storefront.shipping.filter.beforeRequestRates',
      customFunction: require('./domains/api.commerce.catalog.storefront.shipping/api.commerce.catalog.storefront.shipping.filter.beforeRequestRates')
   },
  
  'api.commerce.catalog.storefront.shipping.filter.afterRequestRates': {
      actionName:'api.commerce.catalog.storefront.shipping.filter.afterRequestRates',
      customFunction: require('./domains/api.commerce.catalog.storefront.shipping/api.commerce.catalog.storefront.shipping.filter.afterRequestRates')
   },
   'embedded.platform.applications.install':{
      actionName:'embedded.platform.applications.install',
      customFunction:require('./domains/platform.applications/embedded.platform.applications.install')
   }

  
};