const socket = io();

socket.emit("requestMatchData", () => {
});

socket.on('matchDataRecieved', (data) => {
	console.log(data);
	let p1Win = '0';
	let p1Draw = '0';
	let p1Loss = '0';
	const div = document.getElementById("matchID");
	const indent = '                ';
	const query = new URLSearchParams(window.location.search);
	const role = query.get('role');
	const user = query.get('user');
	for (let key in data) {
		if (data[key].player1Draw !== null) {
			p1Draw = data[key].player1Draw;
		}
		if (data[key].player1Win !== null) {
                         p1Win = data[key].player1Win;
                }
		if (data[key].player1Loss !== null) {
                         p1Loss = data[key].player1Loss;
                }
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
				<span class="win-loss-white">${p1Win}/${p1Draw}/${p1Loss}</span>
				<span class="win-loss-black">win/loss</span>
		`;

		card.appendChild(title);
		card.appendChild(details);
		div.appendChild(card);
	}
});
