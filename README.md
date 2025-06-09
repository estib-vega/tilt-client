# tilt desktop app

Tilt is an Agent chat.
It is also an MCP host, so you can attach the agent to an MCP server if you wish so.

## Stack

This is written in Electron + React.

Using Tailwind and Shadcn for the component styling.

Currently, this only supports Open AI, but in the future I plan to make it LLM-provider agnostic.

## Credits

This is a personal project, but based on the template published the great guasam [here](https://github.com/guasam/electron-react-app)

Go and star his repository!

## Development

Install dependencies:

```bash
bun i
```

Start the development server:

```bash
bun run dev
```

This will start Electron with hot-reload enabled so you can see changes in real time.

<br />

## Building for Production

Build the application for your platform:

```bash
# For Windows
bun run build:win

# For macOS
bun run build:mac

# For Linux
bun run build:linux

# Unpacked for all platforms
bun run build:unpack
```

Distribution files will be located in the `dist` directory.

## Tailwind Styling

The project supports **TailwindCSS** for styling:

```ts
// Example component with Tailwind classes
const Button = () => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
);
```

<br />

## Project Structure

<!-- prettier-ignore-start -->
```markdown
├── app/                        # Renderer process files
│   ├── assets/                 # Static assets (images, fonts, etc)
│   ├── components/             # React components
│   │   ├── App.tsx             # Application component
│   ├── styles/                 # CSS and Tailwind files
│   │   ├── app.css             # App stylesheet
│   │   └── tailwind.css        # Tailwind stylesheet
│   ├── index.html              # Entry HTML file
│   └── renderer.tsx            # Renderer process entry
├── lib/                        # Shared library code
│   ├── main/                   # Main process code
│   │   ├── index.ts            # Main entry point for Electron
│   │   └── ...                 # Other main process modules
│   ├── preload/                # Preload scripts for IPC
│   │   ├── index.ts            # Preload script entry
│   │   └── api.ts              # Exposed API for renderer
│   └── welcome/                # Welcome kit components
├── resources/                  # Build resources
├── .eslintrc                   # ESLint configuration
├── .prettierrc                 # Prettier format configuration
├── electron-builder.yml        # Electron builder configuration
├── electron.vite.config.ts     # Vite configuration for Electron
├── package.json                # Project dependencies and scripts
└── tsconfig.node.json          # Main process tsconfig
└── tsconfig.web.json           # Renderer process tsconfig

```
<!-- prettier-ignore-end -->
