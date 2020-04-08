//Search engine Javascript code

var chosen_traits = [];

function Appendtags(){
	if (chosen_traits.length <= 10){
	var box = document.getElementById("box");
	string = box.value;
	Refreshtraits(string);
	chosen_traits.push(string);
	box.value = '';
	}
}

function Refreshtraits(input){
	if (input !== "" && !chosen_traits.includes(input)){
		document.getElementById("tags-div").innerHTML += '<button class = "tag" onclick = "remove(this)">'+input+'</button>';
	}
}

function remove(index){
	var element = index;
	element.remove();
	string = index.innerHTML;
	chosen_traits.splice(chosen_traits.indexOf(string), 1);
}

function Cleartraits(){
	document.getElementById("tags-div").innerHTML = "";
	chosen_traits = [];
}

function connect_to_host(){
	//connect socket to localhost.
	socket = io.connect('http://127.0.0.1:4000')
	if (socket !== undefined){
		console.log('Connected to socket.');
	}
}

(function(){
	var element = function(id){
		return document.getElementById(id);
	}
	var status = element('status');
	var search_results = element('search_results');
	var Name = element('Name');
	var Skills = element('Skills');
	var Wage_Aim = element('Wage_Aim');

	var statusDefault = status.textContent;
	//setStatus is a helper function.
	var setStatus = function(s){
		status.textContent = s;
		if(s !== statusDefault){
			var delay = setTimeout(function(){
				setStatus(statusDefault);
			}, 4000);
		}
	}
	connect_to_host();
})()

function get_user_data(){ //function used for debugging
	console.log(user_data)
}

function check_valid_wage_values(minwage, maxwage){
	console.log(minwage, maxwage);
	if (!minwage || !maxwage){
		alert('Please enter valid values for minimum and maximum wages.');
		return 0
	}
	else if (!chosen_traits[0]){
		alert('Please select at least one skill.');
		return 0
	}
	else if (minwage > maxwage){ //set maximum wage to be at least as large as minimum wage.
		maxwage = minwage;
		document.getElementById('maxwage').value = minwage;
	}
	return 1
}

function show_entries(results){
	console.log(results);
	label_name = document.getElementById('label_name');
	label_skills = document.getElementById('label_skills');
	label_wages = document.getElementById('label_wages');
	label_years = document.getElementById('label_years');
	label_education = document.getElementById('label_education');

	label_name.textContent = "Name";
	label_skills.textContent = "Skills/Experience";
	label_wages.textContent = "Desired Wage ($/yr)";
	label_years.textContent = "Experience";
	label_education.textContent = "Education";

	console.log(results, results.length);
	for (var x = 0; x < results.length; x++){
		var entry = document.createElement('div');
		entry.setAttribute('class', 'user_entry')

		var entry_name = document.createElement('div');
		var entry_skills = document.createElement('div');
		var entry_wages = document.createElement('div');
		var entry_years = document.createElement('div');
		var entry_education = document.createElement('div');

		var First_Name = results[x][0]['First_Name'];
		if (results[x][0]['Middle_Name'] == 'none'){
			var Middle_Name = '';
		} else {
			var Middle_Name = results[x][0]['Middle_Name'].toString();
		}
		var Last_Name = results[x][0]['Last_Name'];

		entry_name.setAttribute('class', 'user_entry_name');
		entry_name.textContent = First_Name + ' ' + Middle_Name + ' ' + Last_Name;

		entry_skills.setAttribute('class', 'user_entry_skills');
		entry_skills.textContent = String(results[x][0]['Skills']).replace(/,/g, ", ");

		entry_wages.setAttribute('class', 'user_entry_wages');
		entry_wages.textContent = results[x][0]['Wage_Aim'];

		entry_years.setAttribute('class', 'user_entry_years');
		entry_years.textContent = results[x][0]['Years_Experience'] + ' years';

		entry_education.setAttribute('class', 'user_entry_education');
		entry_education.textContent = get_education(results[x][0]['Education']);

		search_results.appendChild(entry);
		entry.appendChild(entry_name);
		entry.appendChild(entry_skills);
		entry.appendChild(entry_wages)
		entry.appendChild(entry_years);
		entry.appendChild(entry_education);

	}
}

var results = [];
function Search(minwage, maxwage){
	if (minwage == 0){minwage = 1}
	if (maxwage == 0){maxwage = 1}
	minwage = Number(minwage);
	maxwage = Number(maxwage);

	valid = check_valid_wage_values(minwage, maxwage, chosen_traits);
	clearResults();
	if (valid){
		parameters = {'minwage': minwage, 'maxwage': maxwage, 'skills': chosen_traits};
		socket.emit('search_query', parameters);
	}
}

function setNoResults(){
	console.log('no results');
	search_results.innerHTML = '<h1><strong><font color = "white">No results found.</font></strong></h1>.';
	label_name = document.getElementById('label_name').textContent = '';
	label_skills = document.getElementById('label_skills').textContent = '';
	label_wages = document.getElementById('label_wages').textContent = '';
}

function clearResults(){
	results = [];
	search_results.innerHTML = '';
}

var similar_dict = {'management': ['consulting', 'logistics', 'manager', 'middle management'], 'programming': ['computer', 'tech', 'it', 'programmer'], 
'technician': ['mechanic'], 'driving': ['driver', 'transportation']}

var education_dict = {"0": "No Education", "1": "High School", "2": "Bachelor's Degree", "3": "Master's Degree", "4": "PhD"};

function get_education(number){
	return education_dict[number];
}

socket.on('yield', function(results){
	if (results.length === 0){
		setNoResults()
		} else {
			results = results.sort(function(a, b){
				return b[1] - a[1]
			});
			show_entries(results)
		}
	})