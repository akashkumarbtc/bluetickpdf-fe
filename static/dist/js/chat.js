
const query = (obj) =>
  Object.keys(obj)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
    .join("&");
const markdown = window.markdownit();
const message_box = document.getElementById("messages");
const message_input = document.getElementById("message-input");
const box_conversations = document.querySelector(".top");
const spinner = box_conversations.querySelector(".spinner");
const stop_generating = document.querySelector(".stop_generating");
const send_button = document.querySelector("#send-button");
let prompt_lock = false;
// var baseURL = localStorage.getItem('baseURL');



const generateQuestionsUrl = base_url + "/generate_questions";

document.addEventListener("DOMContentLoaded", () => {
  const user_id = localStorage.getItem("user_id");
  const questionsKey = "generated_questions"; // Key for localStorage
  
  if (user_id) {
      const storedQuestions = localStorage.getItem(questionsKey);
      
      if (storedQuestions) {
          // Questions are stored in localStorage, display them
          const generatedQuestions = JSON.parse(storedQuestions);
          displayQuestions(generatedQuestions);
      } else {
          // Fetch questions from API and store in localStorage
          showLoading()
          const requestData = {
              user_id: user_id,
          };

          fetch(generateQuestionsUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
          })
          .then((response) => response.json())
          .then((data) => {
              const generatedQuestions = data; // Assuming data is an array of questions
            
              // Store questions in localStorage
              localStorage.setItem(questionsKey, JSON.stringify(generatedQuestions));
              
              // Display the questions
              hideLoading()
              displayQuestions(generatedQuestions);
          })
          .catch((error) => {
              console.error("Error:", error);
              hideLoading()
          });
      }
  }
});

function showLoading() {
  const loadingElement = document.getElementById('loading');
  loadingElement.style.display = 'block'; // Show the loading spinner
}

function hideLoading() {
  const loadingElement = document.getElementById('loading');
  loadingElement.style.display = 'none'; // Hide the loading spinner
}

function displayQuestions(generatedQuestions) {
  const generatedQuestionsContainer = document.getElementById('generated-questions');
  
  // Display the GPT image and welcome message only once
  const welcomeElement = document.createElement('div');
  welcomeElement.innerHTML = `
      <div class="message">
          <div class="user">
              ${gpt_image} <!-- Add your GPT image here -->
          </div>
          <div class="content">
              <p>Welcome!! try asking me questions related to your file. You can ask questions like:</p>
          </div>
      </div>
  `;
  generatedQuestionsContainer.appendChild(welcomeElement);
  
  generatedQuestions.forEach((question, index) => {
      const questionElement = document.createElement('div');
      questionElement.innerHTML = `
          <div class="message">
              <div class="content">
                  <button class="question-button" id="question-button-${index}" >${format(question)}</button>
              </div>
          </div>
      `;
      questionElement.querySelector(`#question-button-${index}`).style.backgroundColor = '#0270d7';
      questionElement.querySelector(`#question-button-${index}`).style.color = 'white';
      questionElement.querySelector(`#question-button-${index}`).style.padding = '10px 20px';
      questionElement.querySelector(`#question-button-${index}`).style.border = 'none';
      questionElement.querySelector(`#question-button-${index}`).style.borderRadius = '5px';
      questionElement.querySelector(`#question-button-${index}`).style.cursor = 'pointer';
      questionElement.querySelector(`#question-button-${index}`).style.marginLeft = '70px';
      generatedQuestionsContainer.appendChild(questionElement);
      
      questionElement.querySelector(`#question-button-${index}`).addEventListener('click', (event) => {
          // Do something when the button is clicked
          // For example, ask the question to the chatbot
          const clickedQuestion = generatedQuestions[index];
          ask_gpt(clickedQuestion);
      });
  });
}








const format = (text) => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>");
};

message_input.addEventListener("blur", () => {
  window.scrollTo(0, 0);
});

message_input.addEventListener("focus", () => {
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
});

const delete_conversations = async () => {
  const prefix = "conversation:";
  let keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Check if the key starts with the specified prefix
    if (key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  // Remove the keys that matched the prefix
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
  // localStorage.clear()
  await new_conversation();
};

const handle_ask = async () => {
  message_input.style.height = `80px`;
  message_input.focus();

  window.scrollTo(0, 0);
  let message = message_input.value;

  if (message.length > 0) {
    message_input.value = ``;
    await ask_gpt(message);
  }
};

const remove_cancel_button = async () => {
  stop_generating.classList.add(`stop_generating-hiding`);

  setTimeout(() => {
    stop_generating.classList.remove(`stop_generating-hiding`);
    stop_generating.classList.add(`stop_generating-hidden`);
  }, 300);
};


const ask_gpt = async (message) => {
  try {
    message_input.value = ``;
    message_input.innerHTML = ``;
    message_input.innerText = ``;

    add_conversation(window.conversation_id, message.substr(0, 20));
    window.scrollTo(0, 0);
    window.controller = new AbortController();

    // jailbreak = document.getElementById("jailbreak");
    model = document.getElementById("model");
    prompt_lock = true;
    window.text = ``;
    window.token = message_id();

    stop_generating.classList.remove(`stop_generating-hidden`);

    message_box.innerHTML += `
            <div class="message">
                <div class="user">
                    ${user_image}
                    
                </div>
                <div class="content" id="user_${token}"> 
                    ${format(message)}
                </div>
            </div>
        `;

        // <i class="fa-regular fa-phone-arrow-up-right"></i>

    /* .replace(/(?:\r\n|\r|\n)/g, '<br>') */

    message_box.scrollTop = message_box.scrollHeight;
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
    window.scrollTo(0, 0);

    message_box.innerHTML += `
            <div class="message">
                <div class="user">
                    ${gpt_image} 
                </div>
                <div class="content" id="gpt_${window.token}">
                    <div id="cursor"></div>
                </div>
            </div>
        `;

        // <i class="fa-regular fa-phone-arrow-down-left"></i>

    message_box.scrollTop = message_box.scrollHeight;
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1000));
    window.scrollTo(0, 0);
    user_id = localStorage.getItem("user_id")

    if(!user_id) {
      console.log("No user id.. Logging out !!")
      logout()
    }
    // const csrfToken = document.querySelector('input[name="csrf_token"]').value;
    const response = await fetch(base_url + `/ask`, {
      method: `POST`,
      signal: window.controller.signal,
      headers: {
        // "X-CSRF-Token": csrfToken,
        "content-type": `application/json`,
        accept: `text/event-stream`,
      },
      body: JSON.stringify({
        conversation_id: window.conversation_id,
        action: `_ask`,
        model: model.options[model.selectedIndex].value,
        user_id: localStorage.getItem("user_id"),
        // jailbreak: jailbreak.options[jailbreak.selectedIndex].value,
        meta: {
          id: window.token,
          content: {
            conversation: await get_conversation(window.conversation_id),
            //internet_access: document.getElementById("switch").checked,
            content_type: "text",
            parts: [
              {
                content: message,
                role: "user",
              },
            ],
          },
        },
      }),
    });

    const reader = response.body.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      chunk = new TextDecoder().decode(value);

      if (
        chunk.includes(
          `<form id="challenge-form" action="/backend-api/v2/conversation?`
        )
      ) {
        chunk = `cloudflare token expired, please refresh the page.`;
      }

      text += chunk;

      // const objects         = chunk.match(/({.+?})/g);

      // try { if (JSON.parse(objects[0]).success === false) throw new Error(JSON.parse(objects[0]).error) } catch (e) {}

      // objects.forEach((object) => {
      //     console.log(object)
      //     try { text += h2a(JSON.parse(object).content) } catch(t) { console.log(t); throw new Error(t)}
      // });

      document.getElementById(`gpt_${window.token}`).innerHTML =
        markdown.render(text);
      document.querySelectorAll(`code`).forEach((el) => {
        hljs.highlightElement(el);
      });

      window.scrollTo(0, 0);
      message_box.scrollTo({ top: message_box.scrollHeight, behavior: "auto" });
    }

    // if text contains :
    if (
      text.includes(
        `instead. Maintaining this website and API costs a lot of money`
      )
    ) {
      document.getElementById(
        `gpt_${window.token}`
      ).innerHTML = 'An error occured, please reload / refresh cache and try again.';
    }

    add_message(window.conversation_id, "user", message);
    add_message(window.conversation_id, "assistant", text);

    message_box.scrollTop = message_box.scrollHeight;
    await remove_cancel_button();
    prompt_lock = false;

    await load_conversations(20, 0);
    window.scrollTo(0, 0);
  } catch (e) {
    add_message(window.conversation_id, "user", message);

    message_box.scrollTop = message_box.scrollHeight;
    await remove_cancel_button();
    prompt_lock = false;

    await load_conversations(20, 0);

    console.log(e);

    let cursorDiv = document.getElementById(`cursor`);
    if (cursorDiv) cursorDiv.parentNode.removeChild(cursorDiv);

    if (e.name != `AbortError`) {
      console.log(e)
      let error_message = `oops ! something went wrong, please try again / reload. [stacktrace in console]`;
      document.getElementById(`gpt_${window.token}`).innerHTML = error_message;
      add_message(window.conversation_id, "assistant", error_message);
      window.scrollTo(0, 0);

      document.getElementById(
        `gpt_${window.token}`
      ).innerHTML = error_message;
      add_message(window.conversation_id, "assistant", error_message);
    } else {
      document.getElementById(
        `gpt_${window.token}`
      ).innerHTML += ` [aborted]`;
      add_message(
        window.conversation_id,
        "assistant",
        text + ` [aborted]`
      );
    }

    window.scrollTo(0, 0);
  }
};

const clear_conversations = async () => {
  const elements = box_conversations.childNodes;
  let index = elements.length;

  if (index > 0) {
    while (index--) {
      const element = elements[index];
      if (
        element.nodeType === Node.ELEMENT_NODE &&
        element.tagName.toLowerCase() !== `button`
      ) {
        box_conversations.removeChild(element);
      }
    }
  }
};

const clear_conversation = async () => {
  let messages = message_box.getElementsByTagName(`div`);

  while (messages.length > 0) {
    message_box.removeChild(messages[0]);
  }
};

const delete_conversation = async (conversation_id) => {
  localStorage.removeItem(`conversation:${conversation_id}`);

  if (window.conversation_id == conversation_id) {
    await new_conversation();
  }

  await load_conversations(20, 0, true);
};

const set_conversation = async (conversation_id) => {
  // history.pushState({}, null, `/chatbot.html/${conversation_id}`);
  window.conversation_id = conversation_id;

  await clear_conversation();
  await load_conversation(conversation_id);
  await load_conversations(20, 0, true);
};

const new_conversation = async () => {
  history.pushState({}, null, `/chatbot.html`);
  window.conversation_id = uuid();

  await clear_conversation();
  await load_conversations(20, 0, true);

  // Fetch questions from API and display them
  showLoading();
  const requestData = {
    user_id: localStorage.getItem("user_id") // Fetch user_id from localStorage or wherever you get it from
  };

  fetch(generateQuestionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      const generatedQuestions = data; // Assuming data is an array of questions
      
      // Store questions in localStorage
      localStorage.setItem(questionsKey, JSON.stringify(generatedQuestions));
      
      // Display the questions
      hideLoading();
      displayQuestions(generatedQuestions);
    })
    .catch((error) => {
      console.error("Error:", error);
      hideLoading();
    });
};


const load_conversation = async (conversation_id) => {
  let conversation = await JSON.parse(
    localStorage.getItem(`conversation:${conversation_id}`)
  );
  console.log(conversation, conversation_id);

  for (item of conversation.items) {
    message_box.innerHTML += `
            <div class="message">
                <div class="user">
                    ${item.role == "assistant" ? gpt_image : user_image}
                    ${
                      item.role == "assistant"
                        ? `<i class="fa-regular fa-phone-arrow-down-left"></i>`
                        : `<i class="fa-regular fa-phone-arrow-up-right"></i>`
                    }
                </div>
                <div class="content">
                    ${
                      item.role == "assistant"
                        ? markdown.render(item.content)
                        : item.content
                    }
                </div>
            </div>
        `;
  }

  document.querySelectorAll(`code`).forEach((el) => {
    hljs.highlightElement(el);
  });

  message_box.scrollTo({ top: message_box.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    message_box.scrollTop = message_box.scrollHeight;
  }, 500);
};

const get_conversation = async (conversation_id) => {
  let conversation = await JSON.parse(
    localStorage.getItem(`conversation:${conversation_id}`)
  );
  return conversation.items;
};

const add_conversation = async (conversation_id, title) => {
  if (localStorage.getItem(`conversation:${conversation_id}`) == null) {
    localStorage.setItem(
      `conversation:${conversation_id}`,
      JSON.stringify({
        id: conversation_id,
        title: title,
        items: [],
      })
    );
  }
};

const add_message = async (conversation_id, role, content) => {
  before_adding = JSON.parse(localStorage.getItem(`conversation:${conversation_id}`));

  before_adding.items.push({
    role: role,
    content: content,
  });

  localStorage.setItem(`conversation:${conversation_id}`, JSON.stringify(before_adding)); // update conversation
};

const load_conversations = async (limit, offset, loader) => {
  //console.log(loader);
  //if (loader === undefined) box_conversations.appendChild(spinner);

  let conversations = [];
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith("conversation:")) {
      let conversation = localStorage.getItem(localStorage.key(i));
      conversations.push(JSON.parse(conversation));
    }
  }

  //if (loader === undefined) spinner.parentNode.removeChild(spinner)
  await clear_conversations();

  for (conversation of conversations) {
    box_conversations.innerHTML += `
            <div class="convo">
                <div class="left" onclick="set_conversation('${conversation.id}')">
                    <i class="fa-regular fa-comments"></i>
                    <span class="convo-title">${conversation.title}</span>
                </div>
                <i onclick="delete_conversation('${conversation.id}')" class="fa-regular fa-trash"></i>
            </div>
        `;
  }

  document.querySelectorAll(`code`).forEach((el) => {
    hljs.highlightElement(el);
  });
};

document.getElementById(`cancelButton`).addEventListener(`click`, async () => {
  window.controller.abort();
  console.log(`aborted ${window.conversation_id}`);
});

function h2a(str1) {
  var hex = str1.toString();
  var str = "";

  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }

  return str;
}

const uuid = () => {
  return `xxxxxxxx-xxxx-4xxx-yxxx-${Date.now().toString(16)}`.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const message_id = () => {
  random_bytes = (Math.floor(Math.random() * 1338377565) + 2956589730).toString(2);
  unix = Math.floor(Date.now() / 1000).toString(2);

  return BigInt(`0b${unix}${random_bytes}`).toString();
};

window.onload = async () => {
  conversations = 0;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith("conversation:")) {
      conversations += 1;
    }
  }

  if (conversations == 0) 
  {
    console.log("here")
  }
  // localStorage.clear();

  await setTimeout(() => {
    load_conversations(20, 0);
  }, 1);

  if (!window.location.href.endsWith(`#`)) {
    if (/\/chat\/.+/.test(window.location.href)) {
      await load_conversation(window.conversation_id);
    }
  }

  message_input.addEventListener("keydown", async (evt) => {
    if (prompt_lock) return;
    if (evt.keyCode === 13 && !evt.shiftKey) {
      console.log("pressed enter");
      await handle_ask();
    } else {
      message_input.style.removeProperty("height");
      message_input.style.height = message_input.scrollHeight + 4 + "px";
    }
  });

  send_button.addEventListener("click", async () => {
    console.log("clicked send");
    if (prompt_lock) return;
    await handle_ask();
  });
};

document.querySelector(".mobile-sidebar").addEventListener("click", (event) => {
  const sidebar = document.querySelector(".conversations");

  if (sidebar.classList.contains("shown")) {
    sidebar.classList.remove("shown");
    event.target.classList.remove("rotated");
  } else {
    sidebar.classList.add("shown");
    event.target.classList.add("rotated");
  }

  window.scrollTo(0, 0);
});

function logout() {
  const user_id = localStorage.getItem("user_id");

  if (user_id) {
      var data = {
          user_id: user_id,
      };

      fetch(base_url + '/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      })
      .then(response => {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          localStorage.clear();
          window.location.href = "login.html";
      })
      .catch(error => {
          alert(error.message);
      });
  } else {
      // Redirect to the login page
      const popupMessage = "Session expired. Please login again.";
      localStorage.setItem("popupMessage", popupMessage);
      window.location.href = "login.html";
  }
}

// Function to continuously check user_id and log out if not present
function checkUserAndLogout() {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    logout();
  }
}

// Call the checkUserAndLogout function every 1000 milliseconds (1 second)
setInterval(checkUserAndLogout, 1000);
