# next-nest-base

## Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [pnpm](https://pnpm.io/)

## Basic commands
Install dependencies using pnpm:
  ```sh
  pnpm install
  ```

Start dev all apps
  ```sh
  pnpm dev
  ```

Start single app
  ```sh
  pnpm --filter app_name dev
  ```

Add or save dev dependency to specific app
  ```sh
  pnpm --filter app_name add package_name
  ```

  ```sh
  pnpm --filter app_name add -D package_name
  ```
