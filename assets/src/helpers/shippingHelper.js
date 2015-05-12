var needle = require('needle');
var _ = require("underscore");

function ShippingHelper(ctx, cb) {
  this.callback = cb;
  this.context = ctx;
}

/* Construct Payload Needed For My Companies Shipping Service Using Mozu Order Data */
ShippingHelper.prototype.getRequestPayload = function() {

  var requestData = this.context.apiRequest.params.rateRequest;

  var items = requestData.items;
  var fulfillmentContact = requestData.destinationAddress;

  //Init Payload with Customer Info and Order Info
  var payLoad = {
    "items": [],
    "shippingAddress": {
      "firstName" : "Mozu",
      "lastName" : "API",
      "address1" : fulfillmentContact.address1,
      "city" : fulfillmentContact.cityOrTown,
      "country" : fulfillmentContact.countryCode,
      "postalCode" : fulfillmentContact.postalOrZipCode,
      "state" : fulfillmentContact.stateOrProvince,
      "profileId" : "12345",
      "email" : "mozuapi@fake.com",
      "phone" : "8001234567"
    },
    "orderId": 0,
    "storeId": "myStore",
    "orderAmountTax": 0
  };

  //Loop Through the Order Items
  for(var i=0; i<items.length; i++) {

    //Data Greps
    
    var prod = items[i];
    /*
    var colorProperty = _.first(_.where(prod.product.properties, { attributeFQN: "tenant~color" }));
    var colorName = _.first(colorProperty.values).value;
    var brandProperty = _.first(_.where(prod.product.properties, { attributeFQN: "tenant~brand" }));
    var brandName = _.first(brandProperty.values).value;
    */
    //var size = prod.product.options.length < 1 ? "" : prod.product.options[0].value;
    var pid = prod.productSummaries[0].productCode;

    var item =  {
      "salePrice" : 0,
      "name" : pid, //Format and Append Brand to Match BF Convention
      "price" : 0,
      "fulfillerId" : "QL",  //Todo This Should be Dom or Int Fulfiller I think?
      "qty" : prod.quantity,
      "description" : "size:" + 'size' + "; color: " + 'colorName' + "; style: " + pid,  //Keep Correct Even Know Not Used
      "mzuSkuId": pid //This is the lookup key!
    };

    payLoad.items.push(item);
  }

  return payLoad;

};

/* Gets Default Shipping Methods in Case A Timeout or Error Occurs */
ShippingHelper.prototype.getDefaultMethods = function() {
  return [];
};

/* Uses Needle To Fetch Shipping Rates from My Service */
ShippingHelper.prototype.execute = function() {

  var self = this;

  var requestPayload = self.getRequestPayload();

  //Set Some Timeouts to Be Safe
  var options = {
    open_timeout: 2000,
    read_timeout: 3000,
    json: true,
    rejectUnauthorized : false  // don't verify SSL certificate
  };

  //var serviceUrl = self.context.configuration && self.context.configuration.url ? self.context.configuration.url || 'https://gist.githubusercontent.com/dirkelfman/f946a79edb22c9608f92/raw/5008bc468510d157619bf08db5de83f94e4c9516/shipping1';

  //tempUrl Override
  var serviceUrl = 'https://gist.githubusercontent.com/dirkelfman/f946a79edb22c9608f92/raw/379ebe2ab4d066f1009d68d2742cdac49f5bcab0/shipping1?cb='+  new Date().getTime();

  // Request Executes
  // when server ready change to needle.post(serviceUrl, requestPayload, options, function(err, resp) {
  needle.get(serviceUrl, options, function(err, resp) {

      try {

        if (err)
        {
          if(resp.statusCode === 400 || resp.statusCode === 500) {
            var errorMsg = JSON.parse(resp.body).faultInfo.exceptionMessage;

            if(errorMsg === null || errorMsg === undefined) {
              errorMsg = "We're sorry an error occured.";
            }

            self.callback(err);
          }
          else {
            self.callback(err);
          }
        }
          
        var availableMethods;

        if(resp.statusCode == 200) //This Means Success
        {
          var shippingData = JSON.parse(resp.body);

          if(shippingData.length > 0) {

            availableMethods = _.uniq(_.map(shippingData, function(item) {
              return {
                label: item.label,
                cost: item.totalCost,
                key: item.key,
                deliveryTime: item.deliveryDays,
                pitneyBowesQuoteId : item.quoteId
              };
            }));

          }
          else {
             throw new Error("We're sorry an error occurred.");
          }

        }
        else {
          self.callback(new Error("We're sorry an error occured."));
        }

        var retVal = {};

        //If the are Shipping Methods Set Them
        if(availableMethods.length > 0 ) {

          retVal.resolvedShippingZoneCode = "United States";
          
          retVal.shippingZoneCodes = [
            "United States"
          ];

          retVal.rates = [{
            "carrierId": "custom",
            "shippingRates": [],
            "customAttributes": []
          }];

          //Parse Out What We Need
          for(var i=0; i<availableMethods.length; i++) {

            var rate = {
              code: availableMethods[i].key,
              amount: availableMethods[i].cost,
              content: {
                "localeCode": "en-us",
                "name": availableMethods[i].label
              },
              shippingItemRates: [],
              customAttributes: [],
              messages: [],
              data: { 
                "deliveryTime": availableMethods[i].deliveryTime , 
                "pitneyBowesQuoteId": availableMethods[i].pitneyBowesQuoteId}
            };

            retVal.rates[0].shippingRates.push(rate);
            
          }

          self.context.apiResponse.body = retVal;
          //call end when code has been deployed.
          //self.context.apiResponse.end();
          self.callback();

        }
        //No Shipping Methods Available in the end...
        else {
          self.callback(new Error("We're sorry an error occured."));
        }
    }
    catch( e)
    {
      self.callback(e);
    }

  });

};

module.exports = ShippingHelper; 