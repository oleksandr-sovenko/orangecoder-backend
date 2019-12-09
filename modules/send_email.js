process.on('message', async function(message) {

	console.log('send_email:', message);

	// process.send({ counter: numberOfMailsSend });
});

setInterval(function() {
	process.send({ test: 123 });
}, 3000);