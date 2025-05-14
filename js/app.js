const btn = document.getElementById('btn')
const phoneList = document.querySelector('.phones')
const inputImg = document.querySelector('.input-file')
const inputApiKey = document.querySelector('.input-api-key')
const selectChannelId = document.querySelector('.input-channelId')
const img = document.querySelector('.img')
const sendStatus = document.querySelector('.status')

window.addEventListener('load', () => {
  if (localStorage.getItem('apiKey')) {
    inputApiKey.value = localStorage.getItem('apiKey')
    fillChannelId()
  }
})

inputApiKey.addEventListener('blur', (e) => {
  localStorage.setItem('apiKey', e.target.value.trim())
  fillChannelId()
})

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
  getChannelId()
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
  const channelId = getChannelId()
	return fetch("https://api.wazzup24.com/v3/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getApiKey()}`,
		},
		body: JSON.stringify({
			channelId: channelId,
			chatId: String(phone),
			chatType: "whatsapp",
			contentUri: file
		}),
	})
}

function sendText(phone, message) {  
  const channelId = getChannelId()

	return fetch("https://api.wazzup24.com/v3/message", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getApiKey()}`,
		},
		body: JSON.stringify({
			channelId: channelId,
			chatId: String(phone),
			chatType: "whatsapp",
			text: message
		}),
	});
}

function fetchApi() {
  return fetch('https://api.wazzup24.com/v3/channels', {
    headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getApiKey()}`,
		}
  })
}

function fillChannelId() {
  
  const createOptionElem = (value, text) => {
    const optionElem = document.createElement('option')
    optionElem.setAttribute('value', value)
    optionElem.text = text
    
    return optionElem
  }
  selectChannelId.innerHTML = ''
  selectChannelId.appendChild(createOptionElem('', '--Канал для отправки сообщений--'))

  fetchApi()
    .then(res => {
      if (!getApiKey()) throw new Error('Пустое поле ApiKey')
      if (res.status === 401) throw new Error('Неверный ApiKey')
      if (res.ok) return res.json()
    })
    .then(data => {
      data.forEach(channel => {
        const optionElem = createOptionElem(channel.channelId, `${channel.transport} ${channel.plainId}`)
        
        selectChannelId.appendChild(optionElem)
      })
    })
    .catch(error => console.log(error.message))
}

function getApiKey() {
  return inputApiKey.value.trim()
}

function getChannelId() {
  return selectChannelId.value
}