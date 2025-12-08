const socket = io();

socket.emit("requestMatchData", () => {
});

socket.on('matchDataRecieved', (data) => {
	const div = document.getElementById("matchID");
	const indent = '                ';
	const query = new URLSearchParams(window.location.search);
	const role = query.get('role');
	const user = query.get('user');
	for (let key in data) {
		const newLine = document.createElement('a');
		if (role == 'player') {
			newLine.href = '/index.html?role=player&user=' + user + '&matchID=' + data[key].match_ID;
		}
		else {
			newLine.href = '/index.html?role=spectator&user=' + user + '&matchID=' + data[key].match_ID;
		}
		let player1ID = data[key].player1_ID;
		let player2ID = data[key].player2_ID;
		if (player1ID == null) {
			player1ID = 'none';
		}
		if (player2ID == null) {
			player2ID = 'none';
		}
		let rules = data[key].Ruleset_ID;
		// switch (rules) {
		// 	default: //will add more rules once gamemodes added
		// 		rules = 'Regular Chess';
		// }
		newLine.textContent = '\n\nmatch: ' + data[key].match_ID + indent + 'Admin: ' + data[key].admin_ID + indent + 'Player 1: '
		 + player1ID + indent + 'Player 2: ' + player2ID + indent + 'Gamemode: ' + rules;
		div.appendChild(newLine);
	}
});
