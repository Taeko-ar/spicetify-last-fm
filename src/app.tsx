const LFMApiKey = '83fb76a887a860800fd8719bd7412ada';
const MUSIC_SVG_PATH = `M6 3h15v15.167a3.5 3.5 0 1 1-3.5-3.5H19V5H8v13.167a3.5 3.5 0 1 1-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 1 0 1.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 1 0 1.5 1.5v-1.5z`;

const CSS_STYLES = `
#login-global-div { padding-bottom: 20px; }
.lastfm-modal-text { padding-bottom: 20px; font-size: 1.1em; }
.lastfm-modal-input { display: flex; flex-direction: column; padding: 15px; border-radius: 15px; border: 0; box-shadow: 4px 4px 10px rgba(0,0,0,0.06); width: 100%; box-sizing: border-box; margin-bottom: 15px; color: black; }
.lastfm-modal-btn { background-color: var(--spice-button); border-radius: 8px; border-style: none; cursor: pointer; color: #FFFFFF; font-weight: 500; padding: 10px 16px; text-align: center; width: 100%; border: 0; transition: transform 0.1s ease; }
.lastfm-modal-btn:hover { transform: scale(1.04); }
.lastfm-stats-global { margin: 20px 20px 0 0; overflow: auto; display: flex; gap: 20px; }
.lastfm-stats-img { border-radius: 8px; width: 175px; height: 175px; object-fit: cover; }
.lastfm-stats-content { display: flex; flex-direction: column; gap: 5px; }
.lastfm-stats-artist { font-size: 1.2em; font-weight: bold; margin-bottom: 8px; }
.lastfm-stats-link { color: var(--spice-button); text-decoration: none; margin-top: 8px; font-weight: bold; }
.lastfm-stats-tags { margin-top: 5px; color: var(--spice-subtext); font-size: 0.9em; }
`;

async function main() {
    while (!Spicetify?.showNotification || !Spicetify?.CosmosAsync) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const styleEl = document.createElement('style');
    styleEl.innerHTML = CSS_STYLES;
    document.head.appendChild(styleEl);

    const trackCache: Record<string, any> = {};
    let RegisteredUsername = "Register username";

    const storedUsername = Spicetify.LocalStorage.get("lastFmUsername");
    if (storedUsername) {
        try { RegisteredUsername = JSON.parse(storedUsername).userName; } catch (e) { }
    }

    async function setLastFmUsername() {
        try {
            if (document.getElementById('lastfm-custom-overlay')) return;

            const overlay = document.createElement('div');
            overlay.id = 'lastfm-custom-overlay';
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s ease;';

            const modal = document.createElement('div');
            modal.style.cssText = 'background: var(--spice-main); padding: 32px; border-radius: 8px; width: 400px; box-shadow: 0 4px 24px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--spice-card); transform: scale(0.95); transition: transform 0.2s ease;';

            modal.innerHTML = `
                <div style="font-size: 1.5em; font-weight: bold; color: var(--spice-text);">Connect Last.Fm Account</div>
                <div style="color: var(--spice-subtext); font-size: 0.95em;">Enter your Last.FM username below to sync track statistics.</div>
                <input id="lastfm-native-input" style="background: var(--spice-card); color: var(--spice-text); border: 1px solid var(--spice-subtext); padding: 14px; border-radius: 4px; outline: none; font-size: 1em; margin-top: 8px;" placeholder="${RegisteredUsername}" required />
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
                    <button id="lastfm-native-cancel" style="background: transparent; color: var(--spice-text); border: none; padding: 12px 24px; border-radius: 32px; font-weight: bold; cursor: pointer; transition: transform 0.1s ease;">Cancel</button>
                    <button id="lastfm-native-save" style="background: var(--spice-button); color: var(--spice-button-text, #FFF); border: none; padding: 12px 24px; border-radius: 32px; font-weight: bold; cursor: pointer; transition: transform 0.1s ease;">Save Username</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            });

            const cancelBtn = modal.querySelector('#lastfm-native-cancel') as HTMLButtonElement;
            const saveBtn = modal.querySelector('#lastfm-native-save') as HTMLButtonElement;
            const inputField = modal.querySelector('#lastfm-native-input') as HTMLInputElement;

            cancelBtn.onmouseover = () => cancelBtn.style.transform = 'scale(1.04)';
            cancelBtn.onmouseout = () => cancelBtn.style.transform = 'scale(1)';
            saveBtn.onmouseover = () => saveBtn.style.transform = 'scale(1.04)';
            saveBtn.onmouseout = () => saveBtn.style.transform = 'scale(1)';

            setTimeout(() => inputField.focus(), 100);

            const close = () => {
                overlay.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (document.body.contains(overlay)) document.body.removeChild(overlay);
                }, 200);
            }

            cancelBtn.onclick = close;
            saveBtn.onclick = () => {
                const name = inputField.value.trim();
                if (!name) return Spicetify.showNotification("The username can't be blank");

                Spicetify.LocalStorage.set(`lastFmUsername`, JSON.stringify({ userName: name }));
                RegisteredUsername = name;
                Spicetify.showNotification("Username registered successfully!");
                close();
            };

            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveBtn.click();
            });

            overlay.onclick = (e) => {
                if (e.target === overlay) close();
            };

        } catch (err) {
            Spicetify.showNotification("Error opening Last.fm settings dropdown.");
        }
    }

    function showTrackStatsModal(currentSong: any, trackInfo: any) {
        if (document.getElementById('lastfm-stats-custom-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'lastfm-stats-custom-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s ease;';

        const modal = document.createElement('div');
        modal.style.cssText = 'background: var(--spice-main); padding: 32px; border-radius: 8px; max-width: 600px; min-width: 450px; box-shadow: 0 4px 24px rgba(0,0,0,0.6); display: flex; flex-direction: column; border: 1px solid var(--spice-card); transform: scale(0.95); transition: transform 0.2s ease;';

        const topTagsArray = trackInfo?.track?.toptags?.tag || [];
        const tags = topTagsArray.map((t: any) => t.name.charAt(0).toUpperCase() + t.name.slice(1)).join(", ");

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--spice-card); padding-bottom: 16px; margin-bottom: 16px;">
                <div style="font-size: 1.5em; font-weight: bold; color: var(--spice-text);">Stats for ${currentSong.name}</div>
                <button id="lastfm-stats-native-close" style="background: transparent; color: var(--spice-subtext); border: none; cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                    <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path></svg>
                </button>
            </div>
            <div class="lastfm-stats-global" style="margin: 0; display: flex; gap: 24px;">
                ${currentSong.image ? `<img src="${currentSong.image}" style="border-radius: 8px; width: 180px; height: 180px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" alt="Cover Art" />` : ''}
                <div class="lastfm-stats-content" style="display: flex; flex-direction: column; gap: 8px; justify-content: center; font-size: 1.05em;">
                    <div style="font-size: 1.25em; font-weight: bold; margin-bottom: 4px; color: var(--spice-text);">${trackInfo?.track?.artist?.name || 'Unknown'} | ${trackInfo?.track?.album?.title || 'Unknown Title'}</div>
                    <div style="color: var(--spice-text);">Personal total scrobbles: <strong style="color: var(--spice-button); font-size: 1.1em;">${Number(trackInfo?.track?.userplaycount || 0).toLocaleString()}</strong></div>
                    <div>Total song scrobbles: <span style="color: var(--spice-subtext)">${Number(trackInfo?.track?.playcount || 0).toLocaleString()}</span></div>
                    <div>Total song listeners: <span style="color: var(--spice-subtext)">${Number(trackInfo?.track?.listeners || 0).toLocaleString()}</span></div>
                    ${tags ? `<div style="margin-top: 8px; color: var(--spice-subtext); font-size: 0.9em; line-height: 1.4;">Tags: ${tags}</div>` : ''}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; border-top: 1px solid var(--spice-card); padding-top: 16px;">
                <a href="${trackInfo?.track?.url || "#"}" target="_blank" style="background: var(--spice-button); color: var(--spice-button-text, #FFF); text-decoration: none; padding: 12px 24px; border-radius: 32px; font-weight: bold; display: inline-block; transition: transform 0.1s ease;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">Open on Last.fm</a>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        const closeBtn = modal.querySelector('#lastfm-stats-native-close') as HTMLButtonElement;
        closeBtn.onmouseover = () => { closeBtn.style.color = 'var(--spice-text)'; closeBtn.style.background = 'var(--spice-card)'; };
        closeBtn.onmouseout = () => { closeBtn.style.color = 'var(--spice-subtext)'; closeBtn.style.background = 'transparent'; };

        const close = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
            }, 200);
        }

        closeBtn.onclick = close;
        overlay.onclick = (e) => {
            if (e.target === overlay) close();
        };
    }

    async function fetchSong(song_id: string) {
        const currentItem = Spicetify.Player?.data?.item;
        if (currentItem && currentItem.uri?.includes(song_id)) {
            const meta = currentItem.metadata;
            return {
                artist: meta.artist_name || "Unknown Artist",
                name: meta.title || "Unknown Track",
                image: meta.image_url || ""
            };
        }

        try {
            if (Spicetify.GraphQL && Spicetify.GraphQL.Definitions && (Spicetify.GraphQL.Definitions as any).getTrack) {
                const graphqlResp = await Spicetify.GraphQL.Request((Spicetify.GraphQL.Definitions as any).getTrack, { uri: `spotify:track:${song_id}` });

                if (graphqlResp && graphqlResp.data && graphqlResp.data.trackUnion) {
                    const trackUnion = graphqlResp.data.trackUnion;
                    const artistName = trackUnion.firstArtist?.items?.[0]?.profile?.name || trackUnion.artists?.items?.[0]?.profile?.name || "Unknown Artist";
                    const trackName = trackUnion.name || "Unknown Track";
                    const imgUrl = trackUnion.albumOfTrack?.coverArt?.sources?.[0]?.url || "";
                    return { artist: artistName, name: trackName, image: imgUrl };
                }
            }
        } catch (e: any) { }

        try {
            const resp = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/tracks/${song_id}`);

            if (resp && resp.code === 429) {
                Spicetify.showNotification("Spotify API Rate Limit reached! Last.fm lookup failed.", true);
                return { error: "RATE_LIMITED", artist: "", name: "", image: "" };
            }

            if (resp && resp.artists && resp.artists.length > 0) {
                return {
                    artist: resp.artists[0]?.name || "Unknown Artist",
                    name: resp.name || "Unknown Track",
                    image: resp.album?.images[0]?.url || ""
                };
            }
        } catch (e: any) {
            if (e && (e.code === 429 || (e.message && e.message.includes("429")))) {
                Spicetify.showNotification("Spotify API Rate Limit reached!", true);
            }
        }

        return { error: "RATE_LIMITED", artist: "", name: "", image: "" };
    }

    async function getSongStats(song_id: string) {
        const isValid = RegisteredUsername && RegisteredUsername !== "Register username";
        if (!isValid) return Spicetify.showNotification("You need to register your Last.fm username first!");

        const cacheKey = `${song_id}_${RegisteredUsername}`;

        if (!trackCache[cacheKey]) {
            try {
                const song = await fetchSong(song_id);
                if (song.error) return;

                const trackReq = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LFMApiKey}&artist=${encodeURIComponent(song.artist)}&track=${encodeURIComponent(song.name)}&format=json&username=${encodeURIComponent(RegisteredUsername)}`);
                const trackRes = await trackReq.json();

                if (trackRes.error || !trackRes.track) return Spicetify.showNotification(`Last.fm Error: ${trackRes.message}`);

                trackCache[cacheKey] = { currentSong: song, trackInfo: trackRes };
            } catch (e) {
                return Spicetify.showNotification("Error fetching song stats.");
            }
        }

        const { currentSong, trackInfo } = trackCache[cacheKey];
        showTrackStatsModal(currentSong, trackInfo);
    }

    new Spicetify.ContextMenu.Item("Last.fm Settings", () => setLastFmUsername(),
        (uris) => uris.length === 1 && Spicetify.URI.fromString(uris[0]).type === Spicetify.URI.Type.PROFILE,
        `<svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.89c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg>` as any
    ).register();

    new Spicetify.ContextMenu.Item("Last.FM Song Stats", (uris) => getSongStats(uris[0].split(":")[2]),
        (uris) => uris.length === 1 && Spicetify.URI.fromString(uris[0]).type === Spicetify.URI.Type.TRACK,
        `<svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="${MUSIC_SVG_PATH}"></path></svg>` as any
    ).register();

    function injectProfileButton() {
        const pathname = Spicetify.Platform?.History?.location?.pathname || window.location.pathname;
        if (!pathname.startsWith('/user/') || document.getElementById('lastfm-profile-settings-btn')) return;

        const actionBarRow = document.querySelector('.main-actionBar-ActionBarRow');
        const moreButton = actionBarRow?.querySelector('button[aria-haspopup="menu"]') || actionBarRow?.lastElementChild as HTMLElement;
        if (!actionBarRow || !moreButton) return;

        const btn = document.createElement('button');
        btn.id = 'lastfm-profile-settings-btn';
        btn.className = moreButton.className;
        btn.setAttribute('aria-label', 'Last.fm Settings');
        btn.setAttribute('data-encore-id', 'buttonTertiary');

        const wrapperClass = moreButton.querySelector('span')?.className || "";
        const svgClass = moreButton.querySelector('svg')?.getAttribute('class') || "";

        btn.innerHTML = `<span aria-hidden="true" class="${wrapperClass}"><svg data-encore-id="icon" role="img" aria-hidden="true" class="${svgClass}" viewBox="0 0 24 24" fill="currentColor"><path d="${MUSIC_SVG_PATH}"></path></svg></span>`;
        btn.style.cursor = 'pointer';

        btn.onmouseover = () => btn.style.transform = 'scale(1.04)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';

        btn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setLastFmUsername();
        };

        actionBarRow.insertBefore(btn, moreButton);
    }

    new MutationObserver(injectProfileButton).observe(document.body, { childList: true, subtree: true });
}

export default main;
