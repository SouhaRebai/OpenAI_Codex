import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval ; 

function loadLoader (element) {
  // render three dots while the actual response is being prepared
  element.textContent ='';
  //we will concatenate a dot every 300 ms 3 times
  loadInterval = setInterval(() => {
    element.textContent +='.';
  },300)

  //reset and restart after 3 times
  if (element.textContent ==="..."){
    element.textContent='';
  }
}

//implement typing functionnality : letter by letter for visual aesthetic 
function loadResponse(element, text) {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

//generate a unique id for every message to be able to map over them 
function generateUniqueId(){
  // a good approash is JS is to use time and date 

  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexString}`
}

//implement color difference between human and bot messages
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  //create the user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input at submission
  form.reset()

  //create the bot's chatstripe
  const uniqueId = generateUniqueId()
  //message empty at first
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  //this code will put the new message in view
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //get the specific message div 
  const messageDiv = document.getElementById(uniqueId)
  loadLoader(messageDiv)

  //fetch data ffrom server => get the bot's response
  const response = await fetch('http://localhost:5000',{
    method :'POST',
    headers :{
      'Content-Type' :'application/json'
    },
    body : JSON.stringify({
      prompt: data.get('prompt')
    })
  })
  clearInterval(loadInterval)
  messageDiv.innerHTML=" ";

  if (response.ok){
    const data = await response.json();
    //to trim any trailing spaces/'\n' 
    const parsedData = data.bot.trim();
    loadResponse(messageDiv,parsedData)
  }else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong. Please try again!"
    alert (err)
  }
}

form.addEventListener('submit', handleSubmit)
//sumit using the enter key
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
      handleSubmit(e)
  }
})
