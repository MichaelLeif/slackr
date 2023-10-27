import { post, path, put } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, blurBackground, closePopUp, popUpError, getChannels, getChannelDetail, createPopUp, getUser, joinChannel, forceClosePopUp, leaveChannel, sendMessage, getMessages, unblurBackground, deleteMessage, editMessage, reactMessage, unreactMessage } from './helpers.js';

const base = document.getElementById('base');

//creates the message bubbles
export function createMessageBox(message) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    messageWrapper.id = message.id;
    messageWrapper.sender = message.sender;
    const messageBubbleWrapper = document.createElement('div');
    messageBubbleWrapper.classList.add('message-bubble-wrapper');
    messageWrapper.appendChild(messageBubbleWrapper);
    const messageBubbleContent = document.createElement('div');
    messageBubbleContent.classList.add('message-bubble-content');
    messageBubbleWrapper.appendChild(messageBubbleContent);
    const messageBubble = document.createElement('span');

    for (const react of message.reacts) {
        if (react.user === parseInt(userId)) {
            messageWrapper.setAttribute(react.react, 'true');
        }
    }

    if (message.message) {
        messageBubble.textContent = message.message;
        messageBubble.name = 'content';
    } else {
        messageBubble.textContent = message.image;
    }
    messageBubbleContent.appendChild(messageBubble);
    
    if (message.edited) {
        const edited = document.createElement('span');
        edited.classList.add('message-edited');
        edited.textContent = `Edited ${ new Date(message.editedAt).toLocaleString()}`;
        messageWrapper.appendChild(edited);
    }
    getUser(token, message.sender)
    .then((data) => {
        if (data.error) {
            popUpError(data.error);
        } else {
            const span = document.createElement('span');
            if (data.name === "") {
                span.textContent = 'UNNAMED USER'
            } else {
                span.textContent = data.name;
            }
            span.classList.add('message-user-name');
            span.name = 'message-user';
            span.id = message.sender;
            messageWrapper.insertBefore(span, messageBubbleWrapper);

            const image = document.createElement('img');
            image.classList.add('message-user-bubble');
            if (data.image) {
                image.src = data.image;
            } else {
                image.src = '../img/default.jpeg';
            }
            messageBubbleWrapper.insertBefore(image, messageBubbleContent);

            const timer = document.createElement('span');
            timer.classList.add('message-timer-bubble');
            timer.textContent = new Date(message.sentAt).toLocaleString();
            messageBubbleWrapper.appendChild(timer);
        }
    });

    return messageWrapper;
}

//sends the messages and creates the bubble
export function createSendMessage(message, channelId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const body = JSON.stringify({message: message});
    console.log(userId);
    sendMessage(token, body, channelId)
    .then((data) => {
        if (data.error) {
            popUpError(data.error);
        } else {
            getMessages(token, channelId, 0)
            .then((data) => {
                if (data.error) {
                    popUpError(data.error);
                } else {
                    const container = document.getElementById('main-page-messages-container');
                    container.insertBefore(createMessageBox(data.messages[0]), container.firstElementChild);
                    const wrapper = document.getElementById('main-page-messages-wrapper');
                    wrapper.scrollTop = wrapper.scrollHeight;
                }
            });
        }
    });
}

//creates the form when pressing on a message, actions such as reacting can appear
export function createMessageForm(messageId, messageContent, channelId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    blurBackground(base);

    const popInfo = createPopUp();
    popInfo.box.style.rowGap = 30 + 'px';

    const reactForm = document.createElement('form');
    reactForm.classList.add('auth-form');
    reactForm.id = 'react-form';
    popInfo.box.appendChild(reactForm);

    const happyRadio = document.createElement('input');
    reactForm.appendChild(happyRadio);
    happyRadio.type = 'checkbox';
    happyRadio.id = 'happy';
    happyRadio.value = 'happy';
    const happyLabel = document.createElement('label');
    reactForm.appendChild(happyLabel);
    happyLabel.setAttribute('for', 'happy');
    happyLabel.textContent = '🤣';

    const loveRadio = document.createElement('input');
    reactForm.appendChild(loveRadio);
    loveRadio.type = 'checkbox';
    loveRadio.id = 'love';
    loveRadio.value = 'love';
    const loveLabel = document.createElement('label');
    reactForm.appendChild(loveLabel);
    loveLabel.setAttribute('for', 'love');
    loveLabel.textContent = '❤️';

    const likeRadio = document.createElement('input');
    reactForm.appendChild(likeRadio);
    likeRadio.type = 'checkbox';
    likeRadio.id = 'like';
    likeRadio.value = 'like';
    const likeLabel = document.createElement('label');
    reactForm.appendChild(likeLabel);
    likeLabel.setAttribute('for', 'like');
    likeLabel.textContent = '👍';

    const wrapper = document.getElementById(messageId);
    if (wrapper.getAttribute('happy')) {
        happyRadio.checked = true;
    }
    if (wrapper.getAttribute('like')) {
        likeRadio.checked = true;
    }
    if (wrapper.getAttribute('love')) {
        loveRadio.checked = true;
    }
    reactListener(messageId, channelId, 'happy', messageContent);
    reactListener(messageId, channelId, 'love', messageContent);
    reactListener(messageId, channelId, 'like', messageContent);

    if (document.getElementById(messageId).sender === parseInt(userId)) {
        popInfo.box.style.height = popInfo.box.offsetHeight + 200 + 'px';

        const editForm = document.createElement('form');
        editForm.classList.add('auth-form');
        editForm.id = 'message-update';
        popInfo.box.appendChild(editForm);

        const desDiv = document.createElement('div');
        const dinput = document.createElement('input');
        dinput.classList.add('auth-input');
        dinput.type = 'message';
        dinput.id = 'message';
        dinput.value = messageContent;
        desDiv.appendChild(dinput);
        editForm.appendChild(desDiv);

        const updateBtn = document.createElement('button');
        updateBtn.classList.add('auth-button');
        updateBtn.type = 'submit';
        updateBtn.textContent = 'Update';
        updateBtn.id = 'message-update-button';
        editForm.appendChild(updateBtn);
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('auth-button');
        deleteButton.style.background = 'red';
        deleteButton.id = 'message-delete-button';
        popInfo.box.appendChild(deleteButton);
        
        updateButtonListener(messageId, channelId);
        deleteButtonListener(messageId, channelId);
    }
    closePopUp(popInfo.close, popInfo.container.id);
}


//shows the user information when pressing from the message page
export function createUserForm(userId) {
    const token = localStorage.getItem('token');
    blurBackground(base);

    const popInfo = createPopUp();
    popInfo.box.style.rowGap = 30 + 'px';

    const wrapper = document.createElement('div');
    wrapper.classList.add('user-click-form-wrapper');
    popInfo.box.appendChild(wrapper);

    getUser(token, userId)
    .then((data) => {
        if (data.error) {
            popUpError(data.error);
        } else {
            const img = document.createElement('img');
            console.log(data.image);
            if (data.image) {
                img.src = data.image;
            } else {
                img.src = '../img/default.jpeg';
            }
            wrapper.appendChild(img);

            const container = document.createElement('div');
            container.classList.add('user-click-form-container');
            wrapper.appendChild(container);

            const nameSpan = document.createElement('span');
            nameSpan.textContent = 'Name: ' + data.name;
            container.appendChild(nameSpan);

            const bioSpan = document.createElement('span');
            bioSpan.textContent = 'Bio: ' + data.bio;
            container.appendChild(bioSpan);

            const emailSpan = document.createElement('span');
            emailSpan.textContent = 'Email: ' + data.email;
            container.appendChild(emailSpan);
        }
    });
    closePopUp(popInfo.close, popInfo.container.id);
}

//deletes a message displayed on the page
function deleteButtonListener(messageId, channelId) {
    const token = localStorage.getItem('token');
    const button = document.getElementById('message-delete-button');
    button.addEventListener('click', (e) => {
        forceClosePopUp();
        deleteMessage(token, channelId, messageId);
        document.getElementById(messageId).remove();
    });
}

//updates the messages and displays it
function updateButtonListener(messageId, channelId) {
    const token = localStorage.getItem('token');
    const editForm = document.getElementById('message-update');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newMsg= document.getElementById('message').value;
        const body = JSON.stringify({message: newMsg});
        forceClosePopUp();
        editMessage(token, body, channelId, messageId)
        .then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                const wrapper = document.getElementById(messageId);
                const span = wrapper.getElementsByTagName('span')[1];
                span.textContent = newMsg;

                const edited = document.createElement('span');
                edited.classList.add('message-edited');
                edited.textContent = `Edited ${new Date().toLocaleString()}`;
                wrapper.appendChild(edited);
            }
        })
    });
}

//reacts to the message
function reactListener(messageId, channelId, type, messageContent) {
    const token = localStorage.getItem('token');
    const button = document.getElementById(type);
    if (button.checked) {
        button.addEventListener('click', (e) => {
            button.checked = false;
            document.getElementById(messageId).removeAttribute(type);
            const body = JSON.stringify({react: type});
            unreactMessage(token, body, channelId, messageId)
            .then((data) => {
                if (data.error) {
                    popUpError(data.error)
                }
            })
            forceClosePopUp();
            createMessageForm(messageId, messageContent, channelId);
        });
    } else {
        button.addEventListener('click', (e) => {
            document.getElementById(messageId).setAttribute(type, true);
            const body = JSON.stringify({react: type});
            reactMessage(token, body, channelId, messageId)
            .then((data) => {
                if (data.error) {
                    popUpError(data.error);
                }
            });
            forceClosePopUp();
            createMessageForm(messageId, messageContent, channelId);
        });
    }
}