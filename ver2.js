'use strict';

(function(){
	//declare necessary global variables
	var	jbuilder = require('jbuilder'),
			request = require('request'),
			cheerio = require('cheerio');

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
		this.location = [];
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
			console.log(servcorp);
			
			callback();
		});
	}

	goToWebpage( function(){
		//2go to each country link

		servcorp.forEach(function(country, i){
			getInfo(country, country.url, [['strong','p.building-name'], ['a:first-child', 'div.building-call-to-action']], function(countryLocations) {
				//servcorp[i].locations.push(countryLocations);			
				pusher(servcorp[i].locations, countryLocations, function(){
					servcorp.forEach(function( country, i ){
						console.log('The country is: ', country.name, 'and the locations are: ', country.locations);
					});
				})
			});
		});				

	});


	function pusher( pushee, data, callback ) {
		var res = pushee.push(data);

		callback();
	}
	
	
	
	// get location links and names
	
	// 3go to each location
	
	// get gps and address
	
	// 4Log the information

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
})();