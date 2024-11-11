# NOTICE
This repository has been archived in favor of the upcoming V2 rework of this application.

V2 is a complete rewrite from scratch and improves on every facette of this app. Smoother UI, mobile support, better stability and performance, more features (i.e. embeddings, lorebooks,...), user login, and more.

# CharaManager

CharaManager is a web application made to manage and maintain your collection of TavernV2 cards (used by SillyTavern, ChubAi, JanitorAi, and more)

## Features

- Upload and parsing of character cards
- Multi file upload
- Direct download from ChubAi
- Hash-based duplicate detection
- Automatic conversion of v1 to v2 card specification
- Character card editor
  - Replacing of character images and cropping 
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

### Upcoming Integrations
- Lorebook Editing
- Character Renaming
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
