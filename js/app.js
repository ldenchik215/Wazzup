const btn = document.getElementById('btn')
const phoneList = document.querySelector('.phones')
const inputImg = document.querySelector('.input-file')
const img = document.querySelector('.img')
const sendStatus = document.querySelector('.status')

inputImg.addEventListener('blur', (e) => {
  if (e.target.value.trim()) {
    img.src = e.target.value.trim()
  } else {
    img.src = './img/No-Image-Placeholder.svg'
  }
})

phoneList.addEventListener('input', function (e) {
	this.value = this.value.replace(/\D+/g, '\n')	
})

btn.onclick = () => {
	const data = getDataForm()
	console.log(data.phones);
	console.log('Сообщение: \n' + data.textMsg);

  delaySend(data)
}

const delaySend = async (data) => {
  let counterSend = 0

  for (let i = 0; i < data.phones.length; i++) {
    if (counterSend >= 48) {
      await new Promise(resolve => setTimeout(resolve, 180000))
      counterSend = 0
    }
		send(data.phones[i], data.textMsg, data.fileMsg)
		sendStatus.innerHTML = `Сообщений отправленно: ${i+1} из ${data.phones.length}` 
    counterSend++
	}
}

const getDataForm = () => {
	const textMsg = document.querySelector('.textMsg').value
	const fileMsg = document.querySelector('.input-file').value
	const phones = phoneList.value.split('\n')
	
	if (!phones[phones.length - 1]) phones.pop()
	
	if (!phones[0]) phones.shift()

	return {
		textMsg: textMsg,
    fileMsg: fileMsg,
		phones: phones
	}
}

function send(phone, text, file = '') {
	if (file) {
		sendFile(phone, file)
			.then((res) => res.json())
			.then((data) => {
				console.log(`${phone} Файл отправлен`);
				sendText(phone, text)
				.then((res) => res.json())
				.then((data) => {
					console.log(`${phone} Текст отправлен`);
				})
			})
			.catch((error) => {
				console.error(`${phone} Ошибка отправки ${error}`)
			})
	} else {
		sendText(phone, text)
				.then((res) => res.json())
				.then((data) => {
					console.log(`${phone} Текст отправлен`);
				})
	}
}


function sendFile(phone, file) {
	return fetch("https://api.wazzup24.com/v3/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${_apiKey}`,
		},
		body: JSON.stringify({
			channelId: _chanelId,
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
			"Authorization": `Bearer ${_apiKey}`,
		},
		body: JSON.stringify({
			channelId: _chanelId,
			chatId: String(phone),
			chatType: "whatsapp",
			text: message
		}),
	});
}
