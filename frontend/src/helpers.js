import { base, main } from './main.js';
import { path, get, post, put, deleteMethod } from './config.js';

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export function clear(id="") {
    if (id) {
        const parent = document.getElementById(id);
        const child = parent.getElementsByTagName('*');
        for (const element of child) {
            element.remove();
        }
        parent.remove();
    } else {
        const child = base.getElementsByTagName('*');
        for (const element of child) {
            element.remove();
        }
        base.removeAttribute('class');
    }
}

export function infiniteScrollLoading() {
    console.log('hi');
    const span = document.createElement('span');
    span.classList.add('message-loading');
    span.id = 'scroll-load';
    span.textContent = 'Loading in more messages... sit tight!';
    const container = document.getElementById('main-page-messages-container');
    console.log(container);
    container.appendChild(span);
}

export function infiniteScrollUnloading() {
    document.getElementById('scroll-load').remove();
}

export function blurBackground(element) {
    element.style.setProperty('opacity', '0.2');
}

export function unblurBackground(element) {
    element.style.removeProperty('opacity');
}

export function createPopUp() {
    const popContainer = document.createElement('div');
    main.appendChild(popContainer);
    popContainer.id = 'pop-up-container';
    popContainer.classList.add('pop-up-container');

    const popBox = document.createElement('div');
    popContainer.appendChild(popBox);
    popBox.classList.add('pop-up-box');

    const popBtn = document.createElement('button');
    popBtn.textContent = '🆇';
    popBtn.id = 'close-pop-up';
    popBtn.classList.add('close-btn');
    popBox.appendChild(popBtn);

    return {box: popBox, container: popContainer, close: popBtn};
}

export function popUpError(message) {
    const popInfo = createPopUp();
    popInfo.container.id = 'pop-up-error';

    blurBackground(popInfo.container.previousElementSibling);

    const spanPop = document.createElement('span');
    spanPop.textContent = 'ERROR'
    spanPop.classList.add('pop-up-header');
    popInfo.box.appendChild(spanPop);

    const span = document.createElement('span');
    span.textContent = message;
    popInfo.box.appendChild(span);

    closePopUp(popInfo.close, popInfo.container.id);
}

export function forceClosePopUp() {
    clear('pop-up-container');
    unblurBackground(base);
}

export function closePopUp(button, id) {
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        const element = document.getElementById(id).previousElementSibling;
        clear(id);
        unblurBackground(element);
    });
}

export function createChannel(token, body) {
    post.body = body;
    post.headers.Authorization = token;
    return fetch(path + 'channel', post).then((response) => response.json()).then((data) => {return data});
}

export function updateChannel(token, body, channelId) {
    put.body = body;
    put.headers.Authorization = token;
    return fetch(path + 'channel/' + channelId, put).then((response) => response.json()).then((data) => {return data});
}

export function getChannels(token) {
    get.headers.Authorization = token;
    return fetch(path + 'channel', get).then((response) => response.json()).then((data) => {return data});
}

export function getChannelDetail(token, channelId) {
    get.headers.Authorization = token;
    return fetch(path + 'channel/' + channelId, get).then((response) => response.json()).then((data) => {return data});
}

export function getUser(token, userId) {
    get.headers.Authorization = token;
    return fetch(path + 'user/' + userId, get).then((response) => response.json()).then((data) => {return data});
}

export function getUsers(token) {
    get.headers.Authorization = token;
    return fetch(path + 'user', get).then((response) => response.json()).then((data) => {return data});
}

export function joinChannel(token, channelId) {
    post.headers.Authorization = token;
    return fetch(path + 'channel/' + channelId + '/join', post).then((response) => response.json()).then((data) => {return data});
}

export function leaveChannel(token, channelId) {
    post.headers.Authorization = token;
    return fetch(path + 'channel/' + channelId + '/leave', post).then((response) => response.json()).then((data) => {return data});
}

export function getMessages(token, channelId, start) {
    get.headers.Authorization = token;
    return fetch(path + 'message/' + channelId + '?start=' + start, get).then((response) => response.json()).then((data) => {return data});
}

export function sendMessage(token, body, channelId) {
    post.body = body;
    post.headers.Authorization = token;
    return fetch(path + 'message/' + channelId, post).then((response) => response.json()).then((data) => {return data});
}

export function deleteMessage(token, channelId, messageId) {
    deleteMethod.headers.Authorization = token;
    return fetch(path + 'message/' + channelId + '/' + messageId, deleteMethod).then((response) => response.json()).then((data) => {return data});
}

export function editMessage(token, body, channelId, messageId) {
    put.body = body;
    put.headers.Authorization = token;
    return fetch(path + 'message/' + channelId + '/' + messageId, put).then((response) => response.json()).then((data) => {return data});
}

export function reactMessage(token, body, channelId, messageId) {
    post.body = body;
    post.headers.Authorization = token;
    return fetch(path + 'message/react/' + channelId + '/' + messageId, post).then((response) => response.json()).then((data) => {return data});
}

export function unreactMessage(token, body, channelId, messageId) {
    post.body = body;
    post.headers.Authorization = token;
    return fetch(path + 'message/unreact/' + channelId + '/' + messageId, post).then((response) => response.json()).then((data) => {return data});
}

export function inviteUser(token, body, channelId) {
    post.body = body;
    post.headers.Authorization = token;
    return fetch(path + 'channel/' + channelId + '/invite', post).then((response) => response.json()).then((data) => {return data});
}

export function updateUser(token, body) {
    put.body = body;
    put.headers.Authorization = token;
    return fetch(path + 'user', put).then((response) => response.json()).then((data) => {return data});
}