# Spicetify Last.fm

Get song information from [Last.fm](https://www.last.fm/).

## How to setup

Go to User > Last.fm Stats > Register Username
Fill the user name and click save

![Register Steps](/images/register.png)

## How to Use

Right click on the song > Last.fm Stats

The modal shows:
- Title | Album name (If exists)
- Total user scrobbles
- Total listeners
- Total artist scrobbles
- Link to the song on Last.fm

![Song Stats](/images/how_to_use.png)

## To-do list

- [x] Fetch song info from Spotify

## Installation

Available from the [Spicetify Marketplace](https://github.com/CharlieS1103/spicetify-marketplace) or via direct install:

Download `src/lastfm.js` into your Spicetify extensions folder.

| **Platform** | **Path**                                                                               |
|------------|------------------------------------------------------------------------------------------|
| **Linux**      | `~/.config/spicetify/Extensions` or `$XDG_CONFIG_HOME/.config/spicetify/Extensions/` |
| **MacOS**      | `~/.config/spicetify/Extensions` or `$SPICETIFY_CONFIG/Extensions`                   |
| **Windows**    | `%userprofile%/.spicetify/Extensions/`                                               |

Put the file into the correct folder and run the following command to install the extension:

```powershell
spicetify config extensions lastfm.js
spicetify apply
```
