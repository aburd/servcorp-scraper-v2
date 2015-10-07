'use strict';

(function(){
	//declare necessary global variables
	var request = require('request'),
		cheerio = require('cheerio'),
		jbuilder = require('jbuilder');

	var servcorpAu = 'http://www.servcorp.com.au',
			worldwideLocations = '/en/worldwide-locations';
	var links = [];

	// 1Go to webpage
	function goToWebpage( callback ){
		// get country links
		request(servcorpAu + worldwideLocations, function(error, response, body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(body);
				$('li a', 'ul.locations').each( function( index, element ){
					links[index] = $(element).attr('href');
				});
			}

			links.forEach(function(link, i){
				links[i] = servcorpAu + link;
			});
			callback();
		});

	}

	goToWebpage( function(){
		// 2go to each country link
		links.forEach(function(link, i){
			getInfo(link, 'text', ['strong','p.building-name'], function(name) {
				console.log(name);
			});			
		});	

	});


	
	
	
	
	// get location links and names
	
	// 3go to each location
	
	// get gps and address
	
	// 4Log the information

	// this function goes to multiple urls and gets information
	function getInfo (url, type, selector, callback) {
	  
	  var res = [];
	  var res2 = [];

		request(url, function(error, response, body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(body);

				if(type ==='text' && body){
	   			$(selector[0], selector[1]).each(function( index, element ){
		   				res[index] = $(element).text();
				  });
				} else if (type === 'html' && body) {
  				$(selector[0][0], selector[0][1]).each( function( index, element){
  					res = $(element).html();
  				});
  				$(selector[1][0], selector[1][1]).each( function( index, element){
  					res2 = $(element).html();
  				});
  				
				} else {
				  throw error;
				}
			}
			callback && callback(res);
		});
	 
	}
})();