//Code for registering users.

var value = function(id){
		return document.getElementById(id).value;
	}

btn_register = document.getElementById('register_button');
btn_register.addEventListener("click", function(event){
	register_user(value('name'), value('skills'), value('wage'), value('experience'), value('select-education'));
});

function register_user(name, skills, wage, years, education){
	var name = filter_name(name);
	var skills = filter_skills(skills);
	var wage = filter_number(wage);
	var years = filter_number(years);

	if (!name || !skills || !wage || !years || education == -1){
		alert('Please enter valid values for all required fields.');
	}else{
		data = format_data(name, skills, wage, years, education);
		push_to_database(data);
	}
}

function format_data(name, skills, wage, years, education){
	result = {};
	result['First_Name'] = name[0];
	if (name.length == 3){
		result['Middle_Name'] = name[1];
		result['Last_Name'] = name[2];
	}
	else{
		result['Middle_Name'] = 'none';
		result['Last_Name'] = name[1];
	}
	result['Skills'] = skills;
	result['Wage_Aim'] = wage;
	result['Years_Experience'] = years;
	result['Education'] = Number(education);
	return result
}

function push_to_database(data){
	console.log(data);
	socket.emit('submit_user', data);
}

function connect_to_host(){
	//connect socket to localhost.
	socket = io.connect('http://127.0.0.1:4000')
	if (socket !== undefined){
		console.log('Connected to socket.');
	}
	socket.on('success_message', function(name){
		success = document.getElementById('success_message');
		success.textContent = "Thank you for registering, " + name[0] + ' ' + name[1];
	})
}

connect_to_host();

function filter_name(name){
	if (!name){
		return undefined
	}
	name = name.split(" ");
	if (name.length !== 3 && name.length !== 2){
		return undefined
	}
	return name

}

function filter_skills(skills){
	if (!skills){
		return undefined
	}
	skills = skills.replace(/, /g, ",");
	skills = skills.split(",");
	return skills
}

function filter_number(number){
	if (number == '0'){
		number = 1;
	}
	number = Number(number);
	if (!number){
		return undefined
	}
	return number
}