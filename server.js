//Server-side code for registering new users and using the search engine.

const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
const express = require('express');
const router = express.Router();
const assert = require('assert');

var similar_dict = {'management': ['consulting', 'logistics', 'manager', 'middle management'], 'programming': ['computer', 'tech', 'it', 'programmer'], 
'technician': ['mechanic', 'maintenance'], 'driving': ['driver', 'transportation']}

function getRelevancy(values, searchTerms){
	var common_factor = 0;
	for (var i = 0; i < searchTerms.length; i++){
		if (values.includes(searchTerms[i])){
			common_factor += 1;
		} else {
			extended_values = Object.values(similar_dict) //extended_values is an array of arrays.
			for (var j = 0; j < extended_values.length; j++){
				if (extended_values[j].includes(searchTerms[i])){
					new_search_term = Object.keys(similar_dict)[j];
					if (values.includes(new_search_term)){
						common_factor += 0.5;
					}
				}
			}
		}
	}
	return common_factor
}

//connects to mongodb database
mongo.connect('mongodb://127.0.0.1/Website_database', function(err, db){
	if(err){
		throw err;
	}
	console.log('MongoDB connected...');

	client.on('connection', function(socket){
		let data = db.collection('user_data');
		sendStatus = function(s){
			socket.emit('status', s);
		}
		sendStatus('testing');

		data.find().sort({_id: 1}).toArray(function(err, res){
			if (err){
				throw(err);
			}
			user_data = res;
		})

		socket.on('search_query', function(parameters){
			minwage = parameters['minwage'];
			maxwage = parameters['maxwage'];
			skills = parameters['skills'];
			results = [];
			parse_data();
			socket.emit('yield', results);
		})

		socket.on('submit_user', function(data){
			db.collection('user_data').insert(data);
			console.log('data inserted...');
			socket.emit('success_message', [data['First_Name'], data['Last_Name']]);
		})

		function parse_data(){
			for (var x = 0; x < user_data.length; x++){ //get the search_results
				if (user_data[x].Wage_Aim <= maxwage && user_data[x].Wage_Aim >= minwage){
					common_factor = getRelevancy(user_data[x].Skills, skills);
					if (common_factor){
						results.push([user_data[x], common_factor]);
					}
				}
			}
		}
	})
})