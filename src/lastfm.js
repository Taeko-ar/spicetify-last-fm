let addLoginContainer;
let addSongContainer;

(async function lastFmInfo() {

    const { Platform } = Spicetify;

    const LFMApiKey = '83fb76a887a860800fd8719bd7412ada'

    if (!Platform) {
        setTimeout(lastFmInfo, 300);
        return;
    }

    async function validateLocalStorage() {
        if (!getLocalStorageDataFromKey(`lastFmUsername`)) {
            alert("You need to add the username first! \nUser > Last.fm Stats > Register Username");
            return;
        }
    }

    async function setLastFmUsername() {

        const MODAL_TITLE = "Connect Last.Fm Account";

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: MODAL_TITLE,
                content: addLoginContainer
            });
        };

        if (addLoginContainer) {
            triggerModal();
            return;
        }
        addLoginContainer = document.createElement("div");
        const loginContainer = document.createElement("div");
        loginContainer.setAttribute('id', 'login-global-div')
        if (getLocalStorageDataFromKey(`lastFmUsername`)) {
            loginContainer.remove()
            let LFMUsername = getLocalStorageDataFromKey(`lastFmUsername`).userName
            const loginContainer = document.createElement("div");
            loginContainer.setAttribute('id', 'login-global-div')
            const loginText = document.createElement("div");
            loginText.innerText = `Hey ${LFMUsername}!`
            loginText.style.cssText = 'padding-bottom: 10%;'
            loginContainer.appendChild(loginText);

            const logOutButton = document.createElement("button");
            logOutButton.innerText = "Log-out";
            logOutButton.addEventListener("click", function (event) {
                event.preventDefault();
                localStorage.removeItem(`lastFmUsername`);
                Spicetify.PopupModal.hide();
            }, false);

            addLoginContainer.append(
                loginText,
                loginContainer,
                logOutButton
            );
        } else if (!getLocalStorageDataFromKey(`lastFmUsername`)) {
            loginContainer.remove()
            const loginText = document.createElement("div");
            loginText.innerText = `Enter your Last.FM username`
            const nameInput = document.createElement("input");
            nameInput.style.cssText = 'display: flex;flex-direction: column;'
            nameInput.placeholder = "Last.fm username.";
            nameInput.required = true;
            loginContainer.appendChild(nameInput);

            const submitBtn = document.createElement("button");
            submitBtn.innerText = "Save";
            submitBtn.setAttribute('style', 'background-color: #EA4C89;border-radius: 8px;border-style: none;box-sizing: border-box;color: #FFFFFF;cursor: pointer;display: inline-block;font-family: "Haas Grot Text R Web", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size: 14px;font-weight: 500;height: 40px;line-height: 20px;list-style: none;margin: 0;outline: none;padding: 10px 16px;position: relative;text-align: center;text-decoration: none;transition: color 100ms;vertical-align: baseline;user-select: none;-webkit-user-select: none;touch-action: manipulation;}.button-1:hover,.button-1:focus {background-color: #F082AC;')
            submitBtn.addEventListener("click", function (event) {
                event.preventDefault();
                const name = nameInput.value.replace(/\n/g, "");

                if (name === "" || !name) {
                    alert("The username can't be blank")
                    return;
                }

                localStorage.setItem(`lastFmUsername`, JSON.stringify({
                    userName: name,
                }));

                Spicetify.PopupModal.hide();
            }, false);

            loginText.style.cssText = 'padding-bottom: 10%;'
            loginContainer.appendChild(loginText);

            addLoginContainer.append(
                loginText,
                loginContainer,
                submitBtn,
            );

        }

        triggerModal();
    }

    async function fetchCurrentSong() {
        validateLocalStorage()
        const LFMUsername = getLocalStorageDataFromKey(`lastFmUsername`).userName ?? ''
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LFMUsername}&api_key=${LFMApiKey}&format=json`
        const initialReq = await fetch(url)
        const res = await initialReq.json();
        return res.recenttracks.track[0]
    }

    async function fetchTrackInfo(artist, songName) {
        validateLocalStorage()
        const LFMUsername = getLocalStorageDataFromKey(`lastFmUsername`).userName ?? ''
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${artist}&track=${songName}&format=json&username=${LFMUsername}`
        const initialReq = await fetch(url)
        const res = await initialReq.json();
        return res
    }

    async function createTrackModal(currentSong, trackInfo) {
        const modalTitle = `Stats for ${currentSong.name}`;
        const tagsList = trackInfo.track.toptags.tag.map(obj => obj.name);
        addSongContainer = document.createElement('div')

        // Global div
        const globalDiv = document.createElement('div')
        globalDiv.setAttribute('style', 'margin: 20px 20px 0 0;overflow: auto')
        globalDiv.setAttribute('id', 'modal-global-div')


        // Image div
        const imageDiv = document.createElement('img');
        imageDiv.setAttribute(
            'src',
            currentSong.image[2]['#text'],
        );
        imageDiv.setAttribute('style', 'float: left')
        imageDiv.setAttribute('id', 'modal-album-cover-img')

        // Content div
        const contentDiv = document.createElement('div')
        contentDiv.setAttribute('style', ' margin-left: 210px')

        // User total play count div
        const artistName = document.createElement('div');
        artistName.innerText = `${trackInfo.track.artist.name} | ${trackInfo?.track?.album?.title ?? ''}`
        artistName.setAttribute('id', 'modal-artist-name')

        // User total play count div
        const userPlayCount = document.createElement('div');
        userPlayCount.innerText = `Personal total scrobbles: ${trackInfo.track.userplaycount}`
        userPlayCount.setAttribute('id', 'modal-total-user-scrobbles')

        // Total artist play div
        const totalArtistPlayCount = document.createElement('div');
        totalArtistPlayCount.innerText = `Total artist scrobbles: ${trackInfo.track.playcount}`
        totalArtistPlayCount.setAttribute('id', 'modal-total-artist-scrobbles')

        // Total listeners div
        const totalListenersCount = document.createElement('div');
        totalListenersCount.innerText = `Total listeners: ${trackInfo.track.listeners}`
        totalListenersCount.setAttribute('id', 'modal-total-listeners')

        // Link to song div
        const linkToSong = document.createElement('a');
        linkToSong.innerText = `Link to song`
        linkToSong.setAttribute('id', 'modal-song-link')
        linkToSong.setAttribute('href', trackInfo.track.url)

        // Modal Creation
        globalDiv.appendChild(imageDiv)
        globalDiv.appendChild(contentDiv)
        contentDiv.appendChild(artistName)
        contentDiv.appendChild(userPlayCount)
        contentDiv.appendChild(totalListenersCount)
        contentDiv.appendChild(totalArtistPlayCount)

        // Tags div
        if (tagsList.length > 0) {
            const tagsDiv = document.createElement('div');
            tagsDiv.setAttribute('id', 'modal-tags')
            tagsDiv.innerText = `Tags: ${tagsList.toString()}`
            contentDiv.appendChild(tagsDiv)
        }
        contentDiv.appendChild(linkToSong)
        addSongContainer.append(globalDiv);

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: modalTitle,
                content: addSongContainer,
                isLarge: true,
            });
        };

        if (addSongContainer) {
            triggerModal();
            return;
        }
    }

    async function updateTrackModal(currentSong, trackInfo) {
        const modalTitle = `Stats for ${currentSong.name}`;

        document.getElementById("modal-total-user-scrobbles").innerHTML = await trackInfo.track.userplaycount;
        document.getElementById("modal-total-artist-scrobbles").innerHTML = await trackInfo.track.playcount;
        document.getElementById("modal-total-listeners").innerHTML = await trackInfo.track.listeners;
        document.getElementById("modal-album-cover-img").innerHTML = await currentSong.image[2]['#text'];
        document.getElementById("modal-song-link").href = await trackInfo.track.url;
        document.getElementById("modal-artist-name").innerHTML = await `${trackInfo.track.artist.name} | ${trackInfo.track.album.title}`

        const triggerModal = () => {
            Spicetify.PopupModal.display({
                title: modalTitle,
                content: addSongContainer,
                isLarge: true,
            });
        };

        if (addSongContainer) {
            triggerModal();
            return;
        }
    }

    async function getSongStats() {
        validateLocalStorage()
        const currentSong = await fetchCurrentSong()
        const trackInfo = await fetchTrackInfo(currentSong.artist['#text'], currentSong.name)

        if (document.getElementById("modal-global-div")) {
            await updateTrackModal(currentSong, trackInfo)
        } else {
            await createTrackModal(currentSong, trackInfo)
        }
    }

    const registerUsernameMenuItem = new Spicetify.Menu.Item("Register username", false, async () => {
        await setLastFmUsername();
    });

    new Spicetify.Menu.SubMenu("Last.fm Stats", [registerUsernameMenuItem]).register();

    new Spicetify.ContextMenu.Item(
        "Last.FM Song Stats",
        (uris) => {
            getSongStats(Spicetify.Player.data.track.metadata.title);
        },
        (uris) => {
            if (uris.length != 1) return false;
            return Spicetify.URI.fromString(uris[0]).type == Spicetify.URI.Type.TRACK;
        }
    ).register();
})();
