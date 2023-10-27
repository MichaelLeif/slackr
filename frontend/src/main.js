import { post, path, put } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, blurBackground, closePopUp, popUpError, getChannels, getChannelDetail, createPopUp, getUser, joinChannel, forceClosePopUp, leaveChannel, getMessages, updateChannel, createChannel, infiniteScrollLoading, infiniteScrollUnloading, getUsers, inviteUser, updateUser } from './helpers.js';
import { createLogin } from './auth.js';
import { createMessageBox, createSendMessage, createMessageForm, createUserForm } from './messages.js';

export const base = document.getElementById('base');
export const main = document.getElementsByTagName('main')[0];
let token = null;
let userId = null;
// creates the main body elements e.g. the side bar, the main page, etc...
export function mainMenu() {
    token = localStorage.getItem('token');
    userId = localStorage.getItem('userId');
    base.classList.add('wrapper-main');
    createSideBar();
}

//creates the main page which holds channel details and messages
function createMainPage() {
    let mainPageContainer = document.getElementById('main-page-container');

    if (!mainPageContainer) {
        mainPageContainer = document.createElement('div');
        mainPageContainer.classList.add('main-page-container');
        mainPageContainer.id = 'main-page-container';
        base.insertBefore(mainPageContainer, base.firstElementChild);
    
        const mainPageHeaderWrapper = document.createElement('div');
        mainPageHeaderWrapper.classList.add('main-page-header-wrapper');
        mainPageHeaderWrapper.id = 'main-page-header-wrapper';
        mainPageContainer.appendChild(mainPageHeaderWrapper);
    
        const mainPageHeaderContainer = document.createElement('div');
        mainPageHeaderContainer.classList.add('main-page-header-container');
        mainPageHeaderContainer.id = 'main-page-header-container';
        mainPageHeaderWrapper.appendChild(mainPageHeaderContainer);
    
        const mainPageHeaderChannel = document.createElement('div');
        mainPageHeaderChannel.classList.add('main-page-header-container-channel-name');
        mainPageHeaderChannel.id = 'main-page-header-container-channel-name';
        mainPageHeaderContainer.appendChild(mainPageHeaderChannel);
        const name = document.createElement('h1');
        name.id = 'channel-name';
        mainPageHeaderChannel.appendChild(name);

        const mainPageInputWrapper = document.createElement('div');
        mainPageInputWrapper.classList.add('main-page-input-wrapper');
        mainPageInputWrapper.id = 'main-page-input-wrapper';
        mainPageContainer.appendChild(mainPageInputWrapper);

        const mainPageInputContainer = document.createElement('div');
        mainPageInputContainer.classList.add('main-page-input-container');
        mainPageInputContainer.id = 'message-input-container';
        mainPageInputWrapper.appendChild(mainPageInputContainer);

        const mainPageInput = document.createElement('input');
        mainPageInput.classList.add('main-page-message-input');
        mainPageInput.id = 'message-input';
        mainPageInputContainer.appendChild(mainPageInput);

        const mainPageButtonContainer = document.createElement('div');
        mainPageButtonContainer.classList.add('main-page-button-container');
        mainPageButtonContainer.id = 'header-button-container';
        mainPageHeaderContainer.appendChild(mainPageButtonContainer);
    } else {
        document.getElementById('more-button').remove();
        document.getElementById('setting-button').remove();
        document.getElementById('main-page-messages-wrapper').remove();

    }
    const moreButton = document.createElement('button');
    moreButton.classList.add('main-page-header-container-button');
    moreButton.id = 'more-button';
    moreButton.textContent = 'More Info';
    document.getElementById('header-button-container').appendChild(moreButton);

    const settingButton = document.createElement('button');
    settingButton.classList.add('main-page-header-container-button');
    settingButton.id = 'setting-button';
    settingButton.textContent = 'Setting';
    document.getElementById('header-button-container').appendChild(settingButton);

    const mainPageMessageWrapper = document.createElement('div');
    mainPageMessageWrapper.classList.add('main-page-messages-wrapper');
    mainPageMessageWrapper.id = 'main-page-messages-wrapper';
    document.getElementById('main-page-container').insertBefore(mainPageMessageWrapper, document.getElementById('main-page-container').lastElementChild);

    const mainPageMessageContainer = document.createElement('div');
    mainPageMessageContainer.classList.add('main-page-messages-container');
    mainPageMessageContainer.id = 'main-page-messages-container';
    mainPageMessageWrapper.appendChild(mainPageMessageContainer);
}

//listens for input whenever a user wants to send a message
function messageListener(input, channelId) {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!input.value.match(/^ *$/)) {
                createSendMessage(input.value, channelId);
                input.value = "";
            }
        }
    });
}

//listens for when a message is clicked
function clickMessages(channelId) {
    document.getElementById('main-page-messages-container').addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        if (e.target.name === 'content') {
            createMessageForm(e.target.parentNode.parentNode.parentNode.id, e.target.textContent, channelId);
        } else if (e.target.name === 'message-user') {
            createUserForm(e.target.id);
        }
    });
}


//infinite scroll
function infiniteScroll(channelId) {
    const wrapper = document.getElementById('main-page-messages-wrapper');
    wrapper.addEventListener('scroll', (e) => {
        if (wrapper.scrollTop === 0) {
            infiniteScrollLoading();
            displayMessages(channelId);
        }
    });
}


//creates the popup to join a channel
function channelJoin(channelId) {
    blurBackground(base);

    const popInfo = createPopUp();
    
    const joinSpan = document.createElement('span');
    joinSpan.textContent = 'Would you like to join the channel?';
    popInfo.box.appendChild(joinSpan);

    const joinButton = document.createElement('button');
    joinButton.textContent = 'Join!';
    joinButton.classList.add('auth-button');
    popInfo.box.appendChild(joinButton);

    joinButton.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const res = joinChannel(token, channelId);
        res.then((data) => {
            if (data.error) {
                popUpError(data.error);
                closePopUp(popInfo.close, popInfo.container.id);
            } else {
                forceClosePopUp();
                channelDisplay(channelId);
            }
        })
    });

    closePopUp(popInfo.close, popInfo.container.id);
}

//helps display the spcified channel
function channelDisplay(channelId) {
    const channel = getChannelDetail(token, channelId);
    channel.then((data) => {
        if (data.error) {
            channelJoin(channelId);
        } else {
            createMainPage();
            const name = document.getElementById('channel-name');
            name.textContent = data.name;
            messageListener(document.getElementById('message-input'), channelId);
            clickMessages(channelId);
            moreButtonListener(data, channelId);
            settingButtonListener(data, channelId);
            displayMessages(channelId);
            infiniteScroll(channelId);
        }
    });
}

//helps makes the message in the container
function sendMessageDisplay(message) {
    const container = document.getElementById('main-page-messages-container');
    const msgElement = createMessageBox(message);
    container.appendChild(msgElement);
}

//starts to make the messages container and grabs relevant messages
function displayMessages(channelId) {
    const container = document.getElementById('main-page-messages-container');
    const wrapper = document.getElementById('main-page-messages-wrapper');
    const oldHeight = wrapper.scrollHeight;
    let start = 0;
    if (container.lastElementChild) {
        start = document.querySelectorAll('.message-wrapper').length;
    }
    getMessages(token, channelId, start)
    .then((data) => {
        if (data.error) {
            popUpError(data.error);
        } else {
            for (const index in data.messages) {
                sendMessageDisplay(data.messages[index]);
            }
            if (start === 0) {
                wrapper.scrollTop = wrapper.scrollHeight;
            } else {
                wrapper.scrollTop = wrapper.scrollHeight - oldHeight;
            }
            infiniteScrollUnloading();
        }
    });
}

//listens to when the setting button is pressed and loads the relevant information
function settingButtonListener(channel, channelId) {
    const setting = document.getElementById('setting-button');
    setting.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        blurBackground(base);

        const popInfo = createPopUp();

        const form = document.createElement('form');
        form.classList.add('auth-form');
        popInfo.box.appendChild(form);

        const nameDiv = document.createElement('div');
        const nlabelDiv = document.createElement('div');
        nlabelDiv.classList.add('div-label');
        const nlabel = document.createElement('label');
        nlabel.setAttribute('for', 'channel-name');
        nlabel.textContent = 'Channel Name';
        nlabelDiv.appendChild(nlabel);
        nameDiv.appendChild(nlabelDiv);
        const ninput = document.createElement('input');
        ninput.classList.add('auth-input');
        ninput.type = 'name';
        ninput.name = 'channel-name';
        ninput.value = channel.name;
        nameDiv.appendChild(ninput);
        form.appendChild(nameDiv);

        const desDiv = document.createElement('div');
        const dlabelDiv = document.createElement('div');
        dlabelDiv.classList.add('div-label');
        const dlabel = document.createElement('label');
        dlabel.setAttribute('for', 'description');
        dlabel.textContent = 'Description';
        dlabelDiv.appendChild(dlabel);
        desDiv.appendChild(dlabelDiv);
        const dinput = document.createElement('input');
        dinput.classList.add('auth-input');
        dinput.type = 'description';
        dinput.name = 'description';
        dinput.value = channel.description;
        desDiv.appendChild(dinput);
        form.appendChild(desDiv);

        const submitDiv = document.createElement('div');
        const submitbtn = document.createElement('button');
        submitbtn.classList.add('auth-button');
        submitbtn.type = 'submit';
        submitbtn.textContent = 'Update';
        submitbtn.id = 'create-button';
        submitDiv.appendChild(submitbtn);
        form.appendChild(submitDiv);

        closePopUp(popInfo.close, popInfo.container.id);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const body = JSON.stringify({name: ninput.value, description: dinput.value});
            updateChannel(token, body, channelId)
            .then((data) => {
                if (data.error) {
                    popUpError(data.error);
                } else {
                    forceClosePopUp();
                    addChannels();
                    channelDisplay(channelId);
                }
            });
            
        });
    })
}

//listens to when the more button is pressed and loads relevant information
function moreButtonListener(channel, channelId) {
    const show = document.getElementById('more-button');
    show.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        blurBackground(base);

        const popInfo = createPopUp();
        popInfo.box.style.height = popInfo.box.offsetHeight + 10 + 'px';
        popInfo.box.style.alignItems = 'flex-start';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = 'Name: ' + channel.name;
        popInfo.box.appendChild(nameSpan);

        const descriptionSpan = document.createElement('span');
        descriptionSpan.textContent = 'Description: ' + channel.description;
        popInfo.box.appendChild(descriptionSpan);

        const typeSpan = document.createElement('span');
        typeSpan.textContent = 'Type: ' + (channel.private ? 'Private' : 'Public');
        popInfo.box.appendChild(typeSpan);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = 'Created At: ' + new Date(channel.createdAt).toLocaleDateString();
        popInfo.box.appendChild(dateSpan);
        const creator = getUser(token, channel.creator);
        creator.then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                const creatorSpan = document.createElement('span');
                creatorSpan.textContent = 'Creator: ' + data.name;
                popInfo.box.appendChild(creatorSpan);

                const leaveButton = document.createElement('button');
                leaveButton.textContent = 'Leave';
                leaveButton.classList.add('auth-button');
                leaveButton.style.background = 'red';
                leaveButton.style.alignSelf = 'center';
                popInfo.box.appendChild(leaveButton);

                leaveButtonListener(channelId, leaveButton);
            }
        });
        closePopUp(popInfo.close, popInfo.container.id);
    });
}

//listens to when the user clicks the leave button
function leaveButtonListener(channelId, button) {
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();

        const res = leaveChannel(token, channelId);
        res.then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                forceClosePopUp();
                const mainPageContainer = document.getElementById('main-page-container');
                if (mainPageContainer) {
                    mainPageContainer.remove();
                }
                addChannels();
            }
        });
    });
}

//hides the side bar and reveals it
function sideBarActionListen(button) {
    button.addEventListener('click', (e) => {
        const bar = document.getElementById('side-bar-container');
        const main = document.getElementById('main-page-container');
        if (bar.style.display === 'none') {
            bar.style.display = 'flex';
            main.style.paddingLeft = 500 + 'px';
        } else {
            bar.style.display = 'none';
            const main = document.getElementById('main-page-container');
            main.style.padding = 0;
        }
    });
}

//creates the sidebar
function createSideBar() {
    const button = document.createElement('button');
    button.textContent = 'Hide SideBar';
    button.classList.add('side-bar-action');
    base.append(button);
    sideBarActionListen(button);

    const sideDiv = document.createElement('div');
    sideDiv.classList.add('side-bar-container');
    sideDiv.id = 'side-bar-container';
    base.insertBefore(sideDiv, base.lastElementChild);
    
    const sideHeadDiv = document.createElement('div');
    sideHeadDiv.classList.add('side-bar-header-box');
    sideHeadDiv.id = 'side-bar-header-box';
    const sideHead = document.createElement('span');
    sideHead.classList.add('side-bar-header');
    sideHead.textContent = 'Slackr';
    sideHeadDiv.appendChild(sideHead);
    sideDiv.appendChild(sideHeadDiv);

    const sideBarButtons = document.createElement('div');
    sideBarButtons.classList.add('side-bar-buttons');
    sideDiv.appendChild(sideBarButtons);

    const createButton = document.createElement('button');
    createButton.classList.add('side-bar-button-profile');
    createButton.id = 'create-channel';
    createButton.textContent = 'Create Channel';
    sideBarButtons.appendChild(createButton);

    const inviteButton = document.createElement('button');
    inviteButton.classList.add('side-bar-button-profile');
    inviteButton.id = 'invite';
    inviteButton.textContent = 'Invite';
    sideBarButtons.appendChild(inviteButton);

    const profileButton = document.createElement('button');
    profileButton.classList.add('side-bar-button-profile');
    profileButton.id = 'invite';
    profileButton.textContent = 'Profile';
    sideBarButtons.appendChild(profileButton);

    const publicSpan = document.createElement('span');
    publicSpan.classList.add('side-bar-channel-header');
    publicSpan.textContent = 'Public';
    sideDiv.appendChild(publicSpan);

    const publicContainer = document.createElement('div');
    publicContainer.classList.add('side-bar-channel-box');
    publicContainer.id = 'public';
    sideDiv.appendChild(publicContainer);

    const privateSpan = document.createElement('span');
    privateSpan.classList.add('side-bar-channel-header');
    privateSpan.textContent = 'Private';
    sideDiv.appendChild(privateSpan);

    const privateContainer = document.createElement('div');
    privateContainer.classList.add('side-bar-channel-box');
    privateContainer.id = 'private';
    sideDiv.appendChild(privateContainer);
    
    addChannels();
    createChannelListen(createButton);
    inviteListen(inviteButton);
    profileListen(profileButton);
}

//listens to when a users wants to create a channel and pops up
function createChannelListen(createButton) {
    createButton.addEventListener('click', (e) => {
        e.stopImmediatePropagation();

        blurBackground(base);
        
        const popInfo = createPopUp();
        popInfo.box.style.height = popInfo.box.offsetHeight + 200 + 'px';

        const spanPop = document.createElement('span');
        spanPop.textContent = 'Create Channel'
        spanPop.classList.add('pop-up-header');
        popInfo.box.appendChild(spanPop);

        const form = document.createElement('form');
        form.classList.add('auth-form');
        popInfo.box.appendChild(form);

        const nameDiv = document.createElement('div');
        const nlabelDiv = document.createElement('div');
        nlabelDiv.classList.add('div-label');
        const nlabel = document.createElement('label');
        nlabel.setAttribute('for', 'name');
        nlabel.textContent = 'NAME';
        nlabelDiv.appendChild(nlabel);
        nameDiv.appendChild(nlabelDiv);
        const ninput = document.createElement('input');
        ninput.classList.add('auth-input');
        ninput.type = 'name';
        ninput.name = 'name';
        nameDiv.appendChild(ninput);
        form.appendChild(nameDiv);

        const selectorDiv = document.createElement('div');
        const slabelDiv = document.createElement('div');
        slabelDiv.classList.add('div-label');
        const slabel = document.createElement('label');
        slabel.setAttribute('for', 'channel-type');
        slabel.textContent = 'CHANNEL TYPE';
        slabelDiv.appendChild(slabel);
        selectorDiv.appendChild(slabelDiv);
        const sselect = document.createElement('select');
        const spub = document.createElement('option');
        spub.value = 'public';
        spub.textContent = 'Public';
        sselect.appendChild(spub);
        const spri = document.createElement('option');
        spri.value = 'private'
        spri.textContent = 'Private';
        sselect.appendChild(spri);
        selectorDiv.appendChild(sselect);
        form.appendChild(selectorDiv);

        const desDiv = document.createElement('div');
        const dlabelDiv = document.createElement('div');
        dlabelDiv.classList.add('div-label');
        const dlabel = document.createElement('label');
        dlabel.setAttribute('for', 'description');
        dlabel.textContent = 'DESCRIPTION';
        dlabelDiv.appendChild(dlabel);
        desDiv.appendChild(dlabelDiv);
        const dinput = document.createElement('input');
        dinput.classList.add('auth-input');
        dinput.type = 'text';
        dinput.name = 'description';
        desDiv.appendChild(dinput);
        form.appendChild(desDiv);

        const createDiv = document.createElement('div');
        const createbtn = document.createElement('button');
        createbtn.classList.add('auth-button');
        createbtn.type = 'submit';
        createbtn.textContent = 'Create';
        createbtn.id = 'create-button';
        createDiv.appendChild(createbtn);
        form.appendChild(createDiv);

        closePopUp(popInfo.close, popInfo.container.id);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const body = JSON.stringify({name: ninput.value, private: sselect.value === "public" ? false : true, description: dinput.value});
            createChannel(token, body)
            .then((data) => {
                if (data.error) {
                    popUpError(data.error);
                } else {
                    forceClosePopUp();
                    addChannels();
                }
            });
        });
    });
}

//listens to when the user wants to invite a user and popups
function inviteListen(inviteButton) {
    inviteButton.addEventListener('click', (e) => {
        e.stopImmediatePropagation();

        blurBackground(base);
        
        const popInfo = createPopUp();
        popInfo.box.style.height = popInfo.box.offsetHeight + 50 + 'px';

        const form = document.createElement('form');
        form.classList.add('auth-form');
        popInfo.box.appendChild(form);

        const selectorDiv = document.createElement('div');
        form.appendChild(selectorDiv);
        const slabelDiv = document.createElement('div');
        slabelDiv.classList.add('div-label');
        const slabel = document.createElement('label');
        slabel.setAttribute('for', 'channel');
        slabel.textContent = 'CHANNEL';
        slabelDiv.appendChild(slabel);
        selectorDiv.appendChild(slabelDiv);
        const sselect = document.createElement('select');
        sselect.style.width = 404 + 'px';
        selectorDiv.appendChild(sselect);
        getChannels(token)
        .then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
                for (const channel of data.channels) {
                    if (channel.private) {
                        for (const member of channel.members) {
                            if (member === parseInt(userId)) {
                                const option = document.createElement('option');
                                option.value = channel.id;
                                option.textContent = channel.name;
                                sselect.appendChild(option);
                            }
                        }
                    } else {
                        const option = document.createElement('option');
                        option.value = channel.id;
                        option.textContent = channel.name;
                        sselect.appendChild(option);
                    }
                }
            }
        });

        const userDiv = document.createElement('div');
        form.appendChild(userDiv);
        const ulabelDiv = document.createElement('div');
        ulabelDiv.classList.add('div-label');
        userDiv.appendChild(ulabelDiv);
        const ulabel = document.createElement('label');
        ulabel.setAttribute('for', 'users');
        ulabel.textContent = 'USERS';
        ulabelDiv.appendChild(ulabel);

        const userWrapper = document.createElement('div');
        userWrapper.classList.add('user-wrapper');
        userDiv.appendChild(userWrapper);
        const userContainer = document.createElement('div');
        userContainer.classList.add('user-container');
        userWrapper.appendChild(userContainer);

        getUsers(token)
        .then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                for (const user of data.users) {
                    if (user.id !== parseInt(userId)) {
                        getUser(token, user.id)
                        .then((specifiedUser) => {
                            if (specifiedUser.error) {
                                popUpError(specifiedUser.error);
                            } else {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'checkbox');
                                input.value = user.id;
                                userContainer.appendChild(input);
                                const label = document.createElement('label');
                                label.setAttribute('for', user.id);
                                label.textContent = specifiedUser.name;
                                userContainer.appendChild(label);
                                const lBreak = document.createElement('br');
                                userContainer.appendChild(lBreak);
                            }
                        });
                    }
                }
            }
        });
        const inviteDiv = document.createElement('div');
        const invitebtn = document.createElement('button');
        invitebtn.classList.add('auth-button');
        invitebtn.type = 'submit';
        invitebtn.textContent = 'Invite';
        invitebtn.id = 'invite-button';
        inviteDiv.appendChild(invitebtn);
        form.appendChild(inviteDiv);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const channel = document.querySelector('.auth-form option:checked');
            const users = document.querySelectorAll('.user-container input:checked');
            for (const user of users) {
                const body = JSON.stringify({userId: parseInt(user.value)});
                inviteUser(token, body, channel.value)
                .then((data) => {
                    if (data.error) {
                        popUpError(data.error);
                    }
                });
            }

            forceClosePopUp();
        });

        closePopUp(popInfo.close, popInfo.container.id);
    });
}

//listen to when the profile button is pressed and loads the popup
function profileListen(profileButton) {
    profileButton.addEventListener('click', (e) => {
        e.stopImmediatePropagation();

        blurBackground(base);
        
        const popInfo = createPopUp();
        popInfo.box.style.height = popInfo.box.offsetHeight + 100 + 'px';
        popInfo.box.style.width = popInfo.box.offsetWidth + 50 + 'px';
        popInfo.box.style.alignItems = 'start';


        const form = document.createElement('form');
        form.classList.add('auth-form');
        popInfo.box.appendChild(form);

        const wrapper = document.createElement('div');
        wrapper.classList.add('user-click-form-wrapper');
        wrapper.style.width = 300 + 'px';
        wrapper.style.marginLeft = 100 + 'px';
        wrapper.style.marginBottom = 50 + 'px';
        form.appendChild(wrapper);

        getUser(token, userId)
        .then((data) => {
            const img = document.createElement('img');
            if (data.image) {
                img.src = data.image;
            } else {
                img.src = '../img/default.jpeg';
            }
            wrapper.appendChild(img);

            const container = document.createElement('div');
            container.classList.add('user-click-form-container');
            wrapper.appendChild(container);

            const nameDiv = document.createElement('div');
            const nlabelDiv = document.createElement('div');
            nlabelDiv.classList.add('div-label');
            const nlabel = document.createElement('label');
            nlabel.setAttribute('for', 'username');
            nlabel.textContent = 'Name';
            nlabelDiv.appendChild(nlabel);
            nameDiv.appendChild(nlabelDiv);
            const ninput = document.createElement('input');
            ninput.classList.add('auth-input');
            ninput.style.width = 300 + 'px';
            ninput.type = 'name';
            ninput.name = 'username';
            ninput.value = data.name;
            nameDiv.appendChild(ninput);
            container.appendChild(nameDiv);

            const desDiv = document.createElement('div');
            const dlabelDiv = document.createElement('div');
            dlabelDiv.classList.add('div-label');
            const dlabel = document.createElement('label');
            dlabel.setAttribute('for', 'bio');
            dlabel.textContent = 'Bio';
            dlabelDiv.appendChild(dlabel);
            desDiv.appendChild(dlabelDiv);
            const dinput = document.createElement('input');
            dinput.classList.add('auth-input');
            dinput.style.width = 300 + 'px';
            dinput.type = 'description';
            dinput.name = 'bio';
            dinput.value = data.bio;
            desDiv.appendChild(dinput);
            container.appendChild(desDiv);

            const pDiv = document.createElement('div');
            const plabelDiv = document.createElement('div');
            plabelDiv.classList.add('div-label');
            const plabel = document.createElement('label');
            plabel.setAttribute('for', 'password');
            plabel.textContent = 'Password';
            plabelDiv.appendChild(plabel);
            pDiv.appendChild(plabelDiv);
            const pinput = document.createElement('input');
            pinput.classList.add('auth-input');
            pinput.style.width = 300 + 'px';
            pinput.type = 'password';
            pinput.id = 'password';
            pinput.name = 'password';
            pinput.value = localStorage.getItem('password');
            pDiv.appendChild(pinput);
            container.appendChild(pDiv);
            const show = document.createElement('button');
            show.textContent = 'show';
            show.id = 'show-password';
            pDiv.appendChild(show);
            showPassword();

            const submitDiv = document.createElement('div');
            const submitbtn = document.createElement('button');
            submitbtn.classList.add('auth-button');
            submitbtn.type = 'submit';
            submitbtn.textContent = 'Update';
            submitbtn.id = 'update-button';
            submitDiv.style.marginTop = 70 + 'px';
            submitDiv.style.marginLeft = 100 + 'px';
            submitDiv.appendChild(submitbtn);
            form.appendChild(submitDiv);

            submitbtn.addEventListener('click', (e) => {
                e.preventDefault();
                const body = {};
                if (ninput.value !== data.name) {
                    body.name = ninput.value;
                }
                if (dinput.value !== data.bio) {
                    body.bio = dinput.value;
                }
                if (pinput.value !== localStorage.getItem('password')) {
                    body.password = pinput.value;
                    localStorage.setItem('password', pinput.value);
                }
                updateUser(token, JSON.stringify(body))
                .then((data) => {
                    if (data.error) {
                        popUpError(data.error);
                    }
                })
                forceClosePopUp();
            });
            
        });
        closePopUp(popInfo.close, popInfo.container.id);
    });
}

//shows password when pressed
function showPassword() {
    const button = document.getElementById('show-password');
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        const password = document.getElementById('password');
        if (password.type === 'password') {
            password.type = 'text';
        } else {
            password.type = 'password';
        }
    });
}

//creates the channels which is showed in the sidebar
function createChannelButtons(channel) {
    const button = document.createElement('button');
    button.classList.add('channel-box-button');
    button.id = channel.id.toString();
    const span = document.createElement('span');
    span.textContent = channel.name;
    button.appendChild(span);
    channelButtonsListener(button);
    return button;
}

//expands the list
function showMoreButton(isPrivate) {
    let container = null;
    const button = document.createElement('button');
    button.classList.add('show-more-button');
    if (isPrivate) {
        container = document.getElementById('private');
        button.id = 'show-more-private';
        container.lastElementChild.remove();
    } else {
        container = document.getElementById('public');
        button.id = 'show-more-public';
        container.lastElementChild.remove();
    }
    const span = document.createElement('span');
    span.textContent = 'Show More';
    button.appendChild(span);
    container.appendChild(button);
    if (isPrivate) {
        showMorePrivateListener(button);
    } else {
        showMorePublicListener(button);
    }
}

function showMorePrivateListener(button) {
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        const parent = button.parentNode;
        let children = [].slice.call(parent.getElementsByTagName('button'),0);
        for (const element of children) {
            element.remove();
        }
        children = getChannels(token);
        children.then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
                parent.style.height = 0
                for (const channel of data.channels) {
                    if (channel.private) {
                        for (const member of channel.members) {
                            if (member === parseInt(userId)) {
                                parent.style.height = parent.offsetHeight + 50 + 'px';
                                parent.appendChild(createChannelButtons(channel));
                            }
                        }
                    }
                }
                parent.style.height = parent.offsetHeight + 50 + 'px';
                const showLessButton = document.createElement('button');
                const span = document.createElement('span');
                span.textContent = 'Show Less';
                showLessButton.classList.add('show-more-button');
                showLessButton.id = 'show-less-private';
                showLessButton.appendChild(span);
                parent.appendChild(showLessButton);
                showLessButton.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    parent.style.height = 160 + 'px';
                    const channels = getChannels(token);
                    channels.then((data) => {
                        if (data.error) {
                            popUpError(data.error);
                        } else {
                            const existingButtons = document.querySelectorAll('#private button')
                            for (const element of existingButtons) {
                                element.remove();
                            }
                            data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
                            for (const channel of data.channels) {
                                const container = document.getElementById('private');
                                for (const member of channel.members) {
                                    if (channel.private) {
                                        if (member === parseInt(userId)) {
                                            container.appendChild(createChannelButtons(channel));
                                            break;
                                        }
                                    }
                                }
                                const existingButton = document.querySelectorAll('#private .channel-box-button');
                                const showMore = document.getElementById('show-more-private');
                                if (existingButton.length > 3) {
                                    if (!showMore) {
                                        showMoreButton(true);
                                    }
                                    return;
                                }
                            }
                        }
                    });
                })
            }
        });
    });
}

function showMorePublicListener(button) {
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        const parent = button.parentNode;
        let children = [].slice.call(parent.getElementsByTagName('button'),0);
        for (const element of children) {
            element.remove();
        }
        children = getChannels(token);
        children.then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
                parent.style.height = 0
                for (const channel of data.channels) {
                    if (!channel.private) {
                        parent.style.height = parent.offsetHeight + 50 + 'px';
                        parent.appendChild(createChannelButtons(channel));
                    }
                }
                parent.style.height = parent.offsetHeight + 50 + 'px';
                const showLessButton = document.createElement('button');
                const span = document.createElement('span');
                span.textContent = 'Show Less';
                showLessButton.classList.add('show-more-button');
                showLessButton.id = 'show-less-public';
                showLessButton.appendChild(span);
                parent.appendChild(showLessButton);
                showLessButton.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    parent.style.height = 160 + 'px';
                    const channels = getChannels(token);
                    channels.then((data) => {
                        if (data.error) {
                            popUpError(data.error);
                        } else {
                            const existingButtons = document.querySelectorAll('#public button')
                            for (const element of existingButtons) {
                                element.remove();
                            }
                            data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
                            for (const channel of data.channels) {
                                if (!channel.private) {
                                    const container = document.getElementById('public');
                                    container.appendChild(createChannelButtons(channel));
                                    const existingButton = document.querySelectorAll('#public .channel-box-button');
                                    const showMore = document.getElementById('show-more-public');
                                    if (existingButton.length > 3) {
                                        if (!showMore) {
                                            showMoreButton(false);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    });
                })
            }
        });
    });
}

//sorts out channel types and helps load it in the side bar
function channelButtons(channel) {
    let container = null;
    if (document.getElementById(channel.id.toString())) {
        return;
    }
    if (!channel.private) {
        const existingButton = document.querySelectorAll('#public .channel-box-button');
        const showMore = document.getElementById('show-more-public');
        if (!showMore) {
            container = document.getElementById('public');
            container.appendChild(createChannelButtons(channel));
        }
        if (existingButton.length > 2) {
            if (!showMore) {
                showMoreButton(false);
            }
            return;
        }
    } else {
        const existingButton = document.querySelectorAll('#private .channel-box-button');
        const showMore = document.getElementById('show-more-private');
        if (!showMore) {
            container = document.getElementById('private');
            for (const member of channel.members) {
                if (member === parseInt(userId)) {
                    container.appendChild(createChannelButtons(channel));
                    break;
                }
            }
        }
        if (existingButton.length > 2) {
            if (!showMore) {
                showMoreButton(true);
            }
            return;
        }
    }
}

//adds channels to the sidebar
function addChannels() {
    const existingButtons = document.querySelectorAll('.side-bar-channel-box button')
    for (const element of existingButtons) {
        element.remove();
    }
    const publicContainer = document.getElementById('public');
    publicContainer.style.height = 160 + 'px';
    const privateContainer = document.getElementById('private');
    privateContainer.style.height = 160 + 'px';

    const channels = getChannels(token);
    channels.then((data) => {
        if (data.error) {
            popUpError(data.error);
        } else {
            data.channels.sort((a, b) => (a.name > b.name) ? 1 : -1)
            for (const channel of data.channels) {
                channelButtons(channel);
            }
        }
    });
}

//displays the channel on the main page
function channelButtonsListener(button) {
    button.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        channelDisplay(button.id);
    });
}

createLogin();