// main VARS
export const WEBSITE_NAME = 'Sayf-GPT'
export const max_Chat_History_Load = 20   // how many messages will be loaded from chat database
// openai Chat Models
const models = [
  {
    model: 'gpt-3.5-turbo',
    engine: 1
  },
  {
    model: 'text-davinci-003',
    engine: 2
  }
]


// API
const SERPER_API_URL = 'https://google.serper.dev/search'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_COMPLETION_URL = 'https://api.openai.com/v1/completions'
const IP_API_URL = 'https://api.ipify.org?format=json'
const IP_INFORMATIONS_API_URL = 'https://ipapi.co/'

// HTTP requests
var http_controller;

// other vars
var IP_informations = null
var stopped_bot = false
var notified_internet = false;

export const welcome_messages = [
  "Come on in - We've Been Expecting You!",
  'Greetings and Salutations!',
  "You're Here! Let's Get Started!",
  'Welcome Aboard!',
  'Thanks for Stopping By!',
  "It's a Pleasure to Have You Here!",
  'Bienvenue!',
  'Wilkommen!'
]

export function getRandomArrayItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function stopBotMessages() {
  http_controller.abort()
  http_controller = new AbortController()
  stopped_bot = true
}

function checkBotStopped(callback) {
  if (stopped_bot) {
    callback('\nStopped generating answer...', true, false)
    return true
  }
  return false
}

async function* parseJsonStream(readableStream) {
  for await (const line of readLines(readableStream.getReader())) {
    const trimmedLine = line
      .slice(line.indexOf('{'), line.lastIndexOf('}') + 1)
      .trim()

    if (trimmedLine.length > 1) {
      yield JSON.parse(trimmedLine)
    }
  }
}

async function* readLines(reader) {
  const textDecoder = new TextDecoder()
  let partOfLine = ''
  for await (const chunk of readChunks(reader)) {
    const chunkText = textDecoder.decode(chunk)
    const chunkLines = chunkText.split('\n')
    if (chunkLines.length === 1) {
      partOfLine += chunkLines[0]
    } else if (chunkLines.length > 1) {
      yield partOfLine + chunkLines[0]
      for (let i = 1; i < chunkLines.length - 1; i++) {
        yield chunkLines[i]
      }
      partOfLine = chunkLines[chunkLines.length - 1]
    }
  }
}

function readChunks(reader) {
  return {
    async *[Symbol.asyncIterator]() {
      let readResult = await reader.read()
      while (!readResult.done) {
        yield readResult.value
        readResult = await reader.read()
      }
    }
  }
}

export function getDateTime() {
  var date = new Date()
  var dateStr =
    ('00' + date.getDate()).slice(-2) +
    '/' +
    ('00' + (date.getMonth() + 1)).slice(-2) +
    '/' +
    date.getFullYear() +
    ' ' +
    ('00' + date.getHours()).slice(-2) +
    ':' +
    ('00' + date.getMinutes()).slice(-2) +
    ':' +
    ('00' + date.getSeconds()).slice(-2)
  return dateStr
}

function getChunkedResponse(payload, last_thread, callback) {
  if (checkBotStopped(callback)) {
    return
  }

  fetch(payload.url, {
    method: 'POST',
    signal: http_controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + payload.openai_api_key
    },
    body: JSON.stringify(payload.body)
  })
    .then(async response => {
      if (!response.ok) {


        let response_json = await response.json()
        return callback(response_json.error.message, true, true)
      }

      let last_message = ''
      let message = ''
      let checked = false
      for await (const data of parseJsonStream(response.body)) {


        if (payload.engine === 1) {
          message += data.choices[0].delta.content || ''
        } else {
          message += data.choices[0].text || ''
        }


        if (last_thread) {
          // if last thread then return all message chunks without verification

          last_message += message
            callback(message, false, false)
          

          message = ''
        } else {
          if (!checked && message.split(' ').length >= 3) {
            // check if bot can't answer after few words
            if (checkResult(message)) {
              return callback('', true, true)
            }

            checked = true
          }
          if (checked) {
              callback(message, false, false)

            message = ''
          }
        }
      }

      // response is done
      // check if last thread and full message is empty
      if (last_thread && last_message.length < 2) {
        message = "Sorry i can't find any informations. Try again later..."
      }else{
		  if(!checked){
            if (checkResult(message)) {
              return callback('', true, true)
            }
		  }
	  }
	  
	  // done response chunks
      callback(message, true, false)
    })
    .catch(error => {
      if (!checkBotStopped(callback)) {
        return callback(error.message, true, true)
      }
    })
}

export function getSettings() {
  var settings = {
    openai_api_key: '',
    serper_api_key: 'a93073a515f7cd44bdc8dae18e6d99a341723100',
    username: 'User',
    botname: WEBSITE_NAME,
    botTemperature: 0.5, // bot message type
    botUseInternet: true, // use internet to answer
    botVoice: 7, // bot default voice id
    internetUseCount: 1, // how many times use internet when it to answer
    internetContentUse: false, // use saved internet content to answer
    muteSounds: false
  }

  settings = { ...settings, ...JSON.parse(localStorage.getItem('settings')) }

  return settings
}

export function saveSettings(settings) {
  localStorage.setItem('settings', JSON.stringify(settings))
}

export function getVoices(callback) {
  let done = false
  window.speechSynthesis.onvoiceschanged = function (event) {
    callback(event.target.getVoices())
    done = true
  }

  setTimeout(() => {
    if (!done) {
      // check again
      let voices = window.speechSynthesis.getVoices()
      if (voices) {
        return callback(voices)
      } else {
        return callback([])
      }
    }
  }, 500)
}

function searchInternet(user_message, thread_id, settings, chat_history, callback) {
  // get google search result based on thread_id
  // each time thread_id is differend results will be different too
  getSearchEngineResult(user_message, thread_id, settings, (data, error) => {
    if (error) {
      return callback(data, true, true)
    }
    // save internet content in user message
    let search_query = user_message + ' based on\n' + JSON.stringify(data)

    // get CHATGPT answer based only on user message + internet content
    getCHATGPTMessage(search_query, thread_id + 1, settings, chat_history, (data, done, error) => {
      callback(data, done, error)

      if (done && !error) {
        // save internet content / remove user+chat name messages setup once answer found in current thread
        if (
          chat_history[chat_history.length - 2].internet_content === undefined
        ) {
          chat_history[chat_history.length - 2].internet_content =
            search_query
          chat_history.splice(chat_history.length - 4, 2)
          localStorage.setItem('chat', JSON.stringify(chat_history))
        }
      }
      if (done) {
        return
      }
    }
    )
  })
}

export async function getCHATGPTMessage(user_message, thread_id = 1, settings, chat_history, callback) {
  let engine1_messages = []
  let engine2_messages = ''
  let content

  if (thread_id === 1) {
    // setup once in first thread

    // make request signal so we can stop it if stop button is pressed
    http_controller = new AbortController()


    // set username + botname from settings everytime before user+assistant message
    chat_history.splice(-2, 0,
      { role: 'user', content: 'My name is ' + settings.username + '.' },
      { role: 'assistant', content: 'Hello ' + settings.username + '. My name is ' + settings.botname + '. How can i assist you today?' }
    )

    // setup chat_history once, other threads answer based on internet content
    for (let a = 0; a < chat_history.length; a++) {
      // merge internet content with bot chat
      if (
        (thread_id === 1 &&
          settings.internetContentUse &&
          chat_history[a].internet_content !== undefined) ||
        thread_id !== 1
      ) {
        content = chat_history[a].internet_content
      } else {
        content = chat_history[a].content
      }

      engine1_messages.push({ role: chat_history[a].role, content: content })
      engine2_messages += content + '\r'
    }
  } else {
    // other threads doesn't need chat history, answer only based on internet content
    engine1_messages.push({ role: 'user', content: user_message })
    engine2_messages += user_message + '\r'
  }

  let payload = {
    openai_api_key: settings.openai_api_key,
    serper_api_key: settings.serper_api_key,
    url: undefined,
    engine: undefined,
    body: {
      model: undefined,
      messages: undefined,
      prompt: undefined,
      stream: true,
      max_tokens: 200,
      temperature: settings.botTemperature
    }
  }





  // loop models
  for (let a = 0; a < models.length; a++) {
    payload.body.messages = undefined
    payload.body.prompt = undefined

    if (models[a].engine === 1) {
      payload.url = OPENAI_CHAT_URL
      payload.body.model = models[a].model
      payload.engine = 1
      payload.body.messages = engine1_messages
    } else {
      payload.url = OPENAI_COMPLETION_URL
      payload.body.model = models[a].model
      payload.engine = 2
      payload.body.prompt = engine2_messages
    }


    // send request to model
    const response = await new Promise((resolve, reject) => {
      getChunkedResponse(payload, thread_id === 1 && a === models.length - 1, (data, done, error) => {
        if (error) {
          // try using internet method once in thread level
          // empty data means bot can't provide answer
          // filled data means bot api response fail
          if (data==='' && thread_id <= settings.internetUseCount && settings.botUseInternet) {
            // notify once in main thread
            if (!notified_internet) {
				notified_internet = true;
              callback('Searching in the Internet !! Please wait...\n', false, false)
            }

            searchInternet(user_message, thread_id, settings, chat_history, (data, done, error) => {
              if (error) {
                // finish promise
                resolve({ data: data, done: true, error: true })
              } else {
                if (done) {
                  // finish promise
                  resolve({ data: data, done: true, error: false })
                } else {
                  callback(data, done, false)
                }
              }
            }
            )
          } else {
            // finish promise
            resolve({ data: data, done: true, error: true })
          }
        } else {
          if (done) {
            // finish promise
            resolve({ data: data, done: true, error: false })
          } else {
            callback(data, done, false)
          }
        }
      }
      )
    })

    // reset stopped_bot in main thread when done
    if (thread_id === 1 && response.done) {
      stopped_bot = false
	  notified_internet = false;
    }
    if (response.done && !response.error) {
      return callback(response.data, true, false)
    } else if (a === models.length - 1) {
      return callback(response.data, true, true)
    }
  }
}


export function checkResult(text) {
  let tmp_text = text.toLowerCase()

  // check if can't answer
  if (tmp_text.includes('ai language') ||
  tmp_text.includes('do not') ||
  tmp_text.includes('apologize') ||
  tmp_text.includes('cannot') ||
  tmp_text.includes('sorry') ||
  tmp_text.includes("don't") ||
  tmp_text.includes("couldn't") ||
  tmp_text.includes("can't") 
  
  
  ) {
    return true
  }

  return false
}

export function getIPInformations(callback) {
  fetch(IP_API_URL)
    .then(response => response.json())
    .then(data => {
      fetch(IP_INFORMATIONS_API_URL + '/' + data.ip + '/json')
        .then(response => response.json())
        .then(data => {
          IP_informations = data
          callback()
          //IP_informations.languages = IP_informations.languages.split("-")[0]
        })
    })
    .catch(error => {
      callback()
      IP_informations = null
    })
}

// Online search engine API
export function getSearchEngineResult(query, thread_id, settings, callback) {
  // get user country + language before sending request
  var payload = {
    q: query,
    gl: '',
    page: thread_id
  }
  if (IP_informations !== null) {
    payload['gl'] = IP_informations.country_code.toLowerCase()
    //payload["hl"] = IP_informations.languages
  }

  // search query
  fetch(SERPER_API_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': settings.serper_api_key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    redirect: 'follow'
  })
    .then(response => {
      if (!response.ok) {
        response.json().then(data => {
          return callback(data.error.message, true)
        })
      }
      response.json().then(data => {
        callback(data, false)
      })
    })
    .catch(error => {
      callback(error.message, true)
    })
}

export function getChatHistory(callback) {
  var chat_history = JSON.parse(localStorage.getItem('chat'))

  if (chat_history !== null) {
    callback(chat_history)
  } else {
    callback([])
  }
}
