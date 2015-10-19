'use strict';

(function(){
	//declare necessary global variables
	var	jbuilder = require('jbuilder'),
		request = require('request'),
		cheerio = require('cheerio'),
		Promise = require('bluebird');

	var servcorpAu = 'http://www.servcorp.com.au',
		worldwideLocations = '/en/worldwide-locations';
	var links = [];
	var servcorp = [];

	function Country(name){
		this.name = name,
		this.url = '',
		this.locations = [];
	}

	function Location(name, url){
		this.name = name,
		this.url = url,
		this.address = '',
		this.gps = [];
	}

	// 1Go to webpage
	function goToWebpage( callback ){
		// get country links
		request(servcorpAu + worldwideLocations, function(error, response, body){
			if(!error && response.statusCode == 200){
				var country;
				var $ = cheerio.load(body);
				// country names
				$('li a span', 'ul.locations').each( function( index, element ){
					country = new Country($(element).text());
					servcorp[index] = country;
				});

				$('li a', 'ul.locations').each( function( index, element ){
					servcorp[index].url = servcorpAu + $(element).attr('href');
				});

			}
			//console.log(servcorp);
			
			callback();
		});
	}

	function pusher( pushee, data, callback ) {
		var res = pushee.push(data);

		callback && callback();
	}

	// this function goes to multiple urls and gets information
	function getInfo (country, url, selector, callback) {
	  
	  var res = [];
	  var res2 = [];
	  var locations = [];

		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(body);
				//name
   			$(selector[0][0], selector[0][1]).each(function( index, element ){
	   			res[index] = $(element).text();
			  });

   			//url
				$(selector[1][0], selector[1][1]).each( function( index, element){
					res2[index] = $(element).attr('href');
				});
  				
			} else {
				  throw error;
			}
			res.forEach(function( res, i ){
				var location = new Location(res, res2[i]);
				locations.push(location);
			});

			callback && callback(locations);
		}); 
	}
	// this function goes to multiple urls and gets information
	function getInfo2 (country, url, selector, callback) {
	  
	  var res = [];
	  var res2 = [];
	  var locations = [];

		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(body);
				//name
	   			$(selector[0][0], selector[0][1]).each(function( index, element ){
		   			res = $(element).html().replace(/\s{2,}/g, '');
				  });

	   			//url
				$(selector[1][0], selector[1][1]).each( function( index, element){
					res2 = $(element).html().match(/\d{1,3}.\d{4,}/g);
				});
  				
			} else {
				console.log('there was an error with: ', url)
				//throw error;
			}
			country.address = res;
			country.gps = res2;

			callback && callback(res);
		}); 
	}

	function getInfoNew (countryLocations, selector, callback) {
	
		return new Promise(function( resolve, reject ){
			var res = [];
			var res2 = [];
			var locations = [];

		    countryLocations.forEach( function( countryLocation, i, countryLocations ){

				request(countryLocation.url, function(error, response, body){
					if(!error && response.statusCode == 200){
						var $ = cheerio.load(body);
						//name
			   			$(selector[0][0], selector[0][1]).each(function( index, element ){
				   			res = $(element).html().replace(/\s{2,}/g, '');
						  });

			   			//url
						$(selector[1][0], selector[1][1]).each( function( index, element){
							res2 = $(element).html().match(/\d{1,3}.\d{4,}/g);
						});
		  				
					} else {
						//console.log('there was an error with: ', countryLocation.url)
						//throw error;
						countryLocation.address = "not found";
						countryLocation.gps = [0, 0];
						reject(error);
					}
					countryLocation.address = res;
					countryLocation.gps = res2;

					//callback && callback(res);
					resolve(countryLocations);
				}); 
		    } );		
		
		});

	}

	function fillThoseObjects( ){

		servcorp.forEach(function(country, i){
			// 3. get info about each country (name and links) and put that into the object
			getInfo(country, country.url, [['strong','p.building-name'], ['a:first-child', 'div.building-call-to-action']], function(countryLocations) {
				// 4. Put the results in the object			
				pusher(servcorp[i].locations, countryLocations);

				// 5. go to each location
				// get gps and address
				var filledCountries = getInfoNew(countryLocations, [['p','.location-info address'], ['script','.module.building-location-map .column-container']] );
				Promise.settle(filledCountries).then( function(results){
					console.log('done');
					console.log(results);
					allPromiseResults.push(results);
				});

			});
		});
		
	}

	// 1. go to main page and put all data in the servcorp object
	goToWebpage( function(){
		// 2. go to each country link in the servcorp object
		var filledObjects = fillThoseObjects();
		Promise.settle(filledObjects).then( function(results) {
			console.log('All done.');
		});

		//servcorp.forEach(function(country, i){
			// 3. get info about each country (name and links) and put that into the object
		//	getInfo(country, country.url, [['strong','p.building-name'], ['a:first-child', 'div.building-call-to-action']], function(countryLocations) {
				// 4. Put the results in the object			
		//		pusher(servcorp[i].locations, countryLocations);

				// 5. go to each location
				// get gps and address
				// var filledCountries = getInfoNew(countryLocations, [['p','.location-info address'], ['script','.module.building-location-map .column-container']] );
				// Promise.settle(filledObjects).then( function(results){
				// 	console.log('done');
				// 	allPromiseResults.push(results);
				// });

				// getInfoNew(countryLocations, [['p','.location-info address'], ['script','.module.building-location-map .column-container']], function(res){
				// 	console.log('done');
				// });

				// countryLocations.forEach( function( countryLocation, i, locations ){
				// 	getInfo2( countryLocation, countryLocation.url, [['p','.location-info address'], ['script','.module.building-location-map .column-container']], function( address ){
				// 		console.log(countryLocation);
				// 	} );
				// } );

				// 6. Log the information

		//	});

		//});

	});
})();