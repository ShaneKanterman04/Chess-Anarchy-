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
		const card = document.createElement('a');
		card.className = 'match-card';
		
		if (role == 'player') {
			card.href = '/index.html?role=player&matchID=' + data[key].match_ID + '&user=' + user;
		}
		else {
			card.href = '/index.html?role=spectator&matchID=' + data[key].match_ID + '&user=' + user;
		}

		let player1ID = data[key].player1_ID;
		let player2ID = data[key].player2_ID;
		if (player1ID == null) {
			player1ID = 'Open';
		}
		if (player2ID == null) {
			player2ID = 'Open';
		}
		let rules = data[key].Ruleset_ID;
		// switch (rules) {
		// 	default: //will add more rules once gamemodes added
		// 		rules = 'Regular Chess';
		// }
		const title = document.createElement('h3');
		title.textContent = `Match #${data[key].match_ID}`;
		
		const details = document.createElement('div');
		details.className = 'match-details';
		
		details.innerHTML = `
			<p><strong>Admin:</strong> ${data[key].admin_ID}</p>
			<p><strong>Gamemode:</strong> ${rules}</p>
			<div class="players">
				<span class="player-white">⚪ ${player1ID}</span>
				<span class="vs">vs</span>
				<span class="player-black">⚫ ${player2ID}</span>
			</div>
			<div class="win-loss">
				<span class="win-loss-white">W:${data[key].player1Win || 0} D:${data[key].player1Draw || 0} L:${data[key].player1Loss || 0}</span>
				<span class="win-loss-black">W:${data[key].player2Win || 0} D:${data[key].player2Draw || 0} L:${data[key].player2Loss || 0}</span>
			</div>
		`;

		card.appendChild(title);
		card.appendChild(details);
		div.appendChild(card);
	}
});
