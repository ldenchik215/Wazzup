const btn = document.getElementById('btn')
const btnClear = document.getElementById('btnClear')
const phoneList = document.querySelector('.phones')
const inputImg = document.querySelector('.input-file')
const inputApiKey = document.querySelector('.input-api-key')
const selectChannelId = document.querySelector('.input-channelId')
const img = document.querySelector('.img')
const sendStatus = document.querySelector('.status-text')
const inputLog = document.querySelector('.log')

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

phoneList.addEventListener('input', (e) => {
	e.target.value = e.target.value.replace(/\D+/g, '\n')
})

const phoneReplace = (e) => {
  phones = e.target.value.split('\n')
  e.target.value = phones.map(phone => {
    if (phone[0] == '8') {
      const newPhone = phone.split('')
      newPhone.splice(0, 1, 7)
      return newPhone.join('')
    }

    if (phone[0] != '7' && phone[0]) {
      const newPhone = phone.split('')
      newPhone.splice(0, 0, 7)
      return newPhone.join('')
    }
    return phone
  }).join('\n')
}

phoneList.addEventListener('blur', phoneReplace)

btn.onclick = (e) => {
  e.preventDefault()

	const data = getDataForm()

  if (!inputApiKey.value) {
    addToLog('p', 'Введите ApiKey из ЛК Wazzup', 'error')
    return
  }

  if (!data.phones.length){
    console.log('Введите номера телефонов для отправки')
    addToLog('p', 'Введите номера телефонов для отправки', 'error')
    return
  }
  
  if (!data.textMsg && !data.fileMsg){
    console.log('Введите текст сообщения или добавьте ссылку на файл')
    addToLog('p', 'Введите текст сообщения или добавьте ссылку на файл', 'error')
    return
  }

  if (data.textMsg) {
    console.log(data.phones)
    console.log('Сообщение: \n' + data.textMsg)
  } 

  delaySend(data)
}

btnClear.onclick = (e) => {
  e.preventDefault()
  inputLog.innerHTML = ''
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
			.then(() => {
				if (text) sendText(phone, text)
			})
	} else {
		if (text) sendText(phone, text)
	}
}


function sendFile(phone, file) {
  const channelId = getChannelId()
  const option = {
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
  }
	return fetch("https://api.wazzup24.com/v3/message", option)
    .then((res) => {
      if (res.ok) return res.json()
      if (res.status === 400) throw new Error('Введен не верный номер телефона')
      if (res.status === 500) throw new Error('Ошибка в url ссылке на файл')
      throw new Error('Ошибка отправки')
    })
    .then(() => {
      console.log(`${phone} Файл отправлен`)
      addToLog('p', `${phone} Файл отправлен`)
    })
    .catch((error) => {
      console.error(`Ошибка отправки файла на ${phone} - ${error.message}`)
      addToLog('p', `Ошибка отправки файла на ${phone} - ${error.message}`, 'error')
    })
}

function sendText(phone, message) {  
  const channelId = getChannelId()

  const option = {
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
	}

	return fetch("https://api.wazzup24.com/v3/message", option)
  .then((res) => {
    if (res.ok) return res.json()
    if (!channelId) throw new Error('Канал не выбран')
    if (res.status === 400) throw new Error('Введен не верный номер телефона')
    throw new Error('Ошибка отправки')
  })
  .then(() => {
    console.log(`${phone} Текст отправлен`)
    addToLog('p', `${phone} Текст отправлен`)
  })
  .catch((error) => {
    console.error(`Ошибка отправки текста на ${phone} - ${error.message}`)
    addToLog('p', `Ошибка отправки текста на ${phone} - ${error.message}`, 'error')
  })
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
    .catch(error =>{
      console.log(error.message)
      selectChannelId.appendChild(createOptionElem('', '-- Введите ApiKey, чтобы выбрать канал для отправки --'))
    })
}

function getApiKey() {
  return inputApiKey.value.trim()
}

function getChannelId() {
  if (!selectChannelId.value) console.log('Выбирите канал для отправки')
  return selectChannelId.value
}

function addToLog(tag, text, className) {
  el = document.createElement(tag)
  el.textContent = text
  el.classList.add(className)

  inputLog.appendChild(el)
}