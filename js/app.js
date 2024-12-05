const btn = document.getElementById('btn')
const phoneList = document.querySelector('.phones')

phoneList.addEventListener('input', function (e) {
	this.value = this.value.replace(/\D+/g, '\n')	
})

btn.onclick = () => {
	const data = getDataForm()
	console.log(data.phones);
	console.log(data.textMsg);
	
	//phones.forEach(send)
	for (let i = 0; i < data.phones.length; i++) {
		send(data.phones[i], data.textMsg, img)
		
	}
}

const getDataForm = () => {
	const textMsg = document.querySelector('.textMsg').value
	const phones = phoneList.value.split('\n')
	
	if (!phones[phones.length - 1]) phones.pop()
	
	if (!phones[0]) phones.shift()

	return {
		textMsg: textMsg,
		phones: phones
	}
}

function send(phone, text, file = '') {
	if (file) {
		sendFile(phone, file)
			.then((res) => res.json())
			.then((data) => {
				console.log(phone);
				console.log('Файл отправлен');
				sendText(phone, text)
				.then((res) => res.json())
				.then((data) => {
					console.log(phone);
					console.log('Текст отправлен');
				})
			})
			.catch(() => {
				console.log(`${phone} Ошибка отправки`)
			})
	} else {
		sendText(phone, text)
				.then((res) => res.json())
				.then((data) => {
					console.log(phone);
					console.log('Текст отправлен');
				})
	}
}


function sendFile(phone, file) {
	return fetch("https://api.wazzup24.com/v3/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer 41238a80cf594a1d958cff1d2e124a2e",
		},
		body: JSON.stringify({
			channelId: "b58b19d0-1df2-4fcd-9dfd-1f53d28e8e39",
			chatId: String(phone),
			chatType: "whatsapp",
			contentUri: file
		}),
	})
}

function sendText(phone, message) {
	return fetch("https://api.wazzup24.com/v3/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer 41238a80cf594a1d958cff1d2e124a2e",
		},
		body: JSON.stringify({
			channelId: "b58b19d0-1df2-4fcd-9dfd-1f53d28e8e39",
			chatId: String(phone),
			chatType: "whatsapp",
			text: message
		}),
	});
}
