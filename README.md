# CharaManager

CharaManager is a web application made to manage and maintain your collection of TavernV2 cards (used by SillyTavern, ChubAi, JanitorAi, and more)

## Features

- Upload and parsing of character cards
- Multi file upload
- Direct download from ChubAi
- Hash-based duplicate detection
- Automatic conversion of v1 to v2 card specification
- Character card editor
  - Allows editing of all fields except embedded lorebooks, latter coming soon
- Automatic hierarchy and relation detection using name and string distance matching
- Comparison of definition content between related cards using a full diff editor
- Statistics for cards, including characters per author, token count, cards uploaded per day
- Portable as all data is stored within '.data/CharaManager.sqlite3' and the app can recreate all necessary files from that

### Know Issues
- Layout and Styling:
  - Smaller screen sizes may struggle to contain the full application
  - Workaround:
    - Currently, there no workaround except using a larger screen
  - Fix (in progress):
    - Update styling to work better on smaller screens
- Relations:
  - Worker script is not fully functional in production builds
  - Updating relations on upload seems to stall the worker pool
  - Workaround:
    - Run from source in dev
    - Build relations after upload
  - Fix (in progress):
    - Split worker script into variants for prod and dev environments (cjs/mjs)
    - Share worker pool across API calls
- Optimized Images:
  - Images can't be created if 'cards' folder is missing in 'public' folder
  - Workaround:
    - Create a folder named 'cards' within the 'public' folder manually
  - Fix (in progress):
    - We will create the folder from the server side when necessary
- Server API:
  - The API is not protected as of now, there is no API key or local only access
  - Workaround:
    - When running your app, use something like Caddy with Caddy Security to block access to your app unless authenticated
  - Fix (in progress):
    - Integrate API key authentication

### Upcoming Integrations
- Lorebook Editing
- Character Renaming
- Image Replacement
- SillyTavern Synchronization

## Running from Pre-Built

You can find the latest builds under the Actions tab or by clicking here: [Actions](https://github.com/Dakraid/CharaManager/actions)

Click on the last successful run and download an artifact matching your OS (currently Linux and Windows are supported).

Unpack the archive into a folder and run within it following command:

```bash
node server/index.mjs
```

## Running from Source

### Setup

Make sure to install the dependencies:

```bash
yarn install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

### Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# License

This project is licensed under AGPLv3.0 (see included LICENSE file).

**NOTE: This project may not be used in a commercial context under any circumstance unless a commercial license has been granted by the owner. This stipulation applies on top of the AGPLv3 license.**

# Credits

This project is build using VueJS, NuxtJS, and Shadcn-Vue (and more).

Thanks to Cohee and the other SillyTavern developers for helping me with parsing the data from the PNGs.

Many thanks to the nice people over at the SillyTavern Discord for providing feedback and guidance. Especially Cohee, Wolfsblvt, Nyx, and others!
