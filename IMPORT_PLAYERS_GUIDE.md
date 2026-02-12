# Import Players Guide

## 📝 How to Add Players Easily

### Option 1: Use the Import Players UI (Recommended)
1. Go to **Settings** → **Data Management** → **Import Players**
2. Click **"Format Guide"** to see the JSON format
3. Copy and paste your player configurations in the JSON format
4. Click **"Parse JSON"** to preview the players
5. Click **"Import All"** or select specific players and click **"Import Selected"**
6. Players will appear in the player selector on the watch page with a blue download icon

### Option 2: Edit the Example File Directly
1. Open `players-example.json` in the project root
2. Add your player configurations following the format
3. Copy the JSON from `players-example.json`
4. Paste it in the Import Players UI and import

## 📄 JSON Format

```json
[
  {
    "name": "Player Name",
    "movieUrl": "https://example.com/movie/{imdb_id}",
    "tvUrl": "https://example.com/tv/{imdb_id}/{season}/{episode}",
    "useSandbox": false
  }
]
```

## 🔧 Format Details

### Required Fields:
- **name**: Display name of the player (e.g., "My Player")
- **movieUrl** OR **tvUrl**: At least one URL is required
  - Can provide both or just one depending on what the player supports
  - If you provide both, the player works for movies and TV shows
  - If you provide only one, the player will only show for that content type

### Optional Fields:
- **useSandbox**: `true` or `false` (default: `false`)
  - Set to `true` for players that need iframe restrictions
  - Set to `false` for players that need full iframe access

## 🎯 Available Variables

### For Movies:
- `{imdb_id}` - IMDB ID (e.g., `tt1234567`)
- `{tmdb_id}` - TMDB ID (e.g., `12345`)

### For TV Shows:
- `{imdb_id}` - IMDB ID (e.g., `tt1234567`)
- `{tmdb_id}` - TMDB ID (e.g., `12345`)
- `{season}` - Season number (e.g., `1`)
- `{episode}` - Episode number (e.g., `1`)

## 💡 Examples

### Example 1: Movie-Only Player
```json
{
  "name": "MoviePlayerX",
  "movieUrl": "https://example.com/watch/{tmdb_id}",
  "useSandbox": false
}
```

### Example 2: TV Show-Only Player
```json
{
  "name": "TVStreamPro",
  "tvUrl": "https://example.com/tv/{imdb_id}/s{season}/e{episode}",
  "useSandbox": true
}
```

### Example 3: Both Movies and TV Shows
```json
{
  "name": "UniversalPlayer",
  "movieUrl": "https://example.com/movie/{imdb_id}",
  "tvUrl": "https://example.com/tv/{imdb_id}/{season}/{episode}",
  "useSandbox": false
}
```

### Example 4: Single URL Format (Works for Both)
```json
{
  "name": "AllInOnePlayer",
  "url": "https://example.com/video/{tmdb_id}?s={season}&e={episode}",
  "useSandbox": true
}
```

## ⚡ Quick Tips

1. **Batch Import**: You can add multiple players at once by putting them all in one JSON array
2. **Validation**: The system will validate the JSON format before importing
3. **No Duplicates**: You can't import the same player name twice
4. **Easy Management**: Players appear in the watch page player selector with a blue download icon
5. **Delete Anytime**: You can delete imported players from either the settings page or directly from the watch page

## 🔍 Where to Find Players?

Most video streaming APIs provide embed URLs. Here are some common ones to get you started:

- Search for "TMDB embed API" or "movie streaming embed"
- Many streaming sites have embed APIs
- Check API documentation for the correct URL format

## 🗑️ Deleting Players

- From **Settings**: Go to Data Management → Import Players → Delete any player
- From **Watch Page**: Open player selector → Click the red trash icon on any imported player

## 💾 Data Storage

- All imported players are stored in your browser's localStorage
- They persist across sessions
- Clearing browser data will remove them
