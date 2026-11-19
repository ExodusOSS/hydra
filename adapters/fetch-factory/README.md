# @exodus/fetch-factory

A utility for managing and setting global request headers based on host domains.

This module allows you to configure default headers for specific host domains and globally. It provides a custom fetch function that automatically includes these headers in each request.

## Features

- Set global headers applicable to all requests.
- Configure headers for specific host domains.
- Merge custom headers with existing ones for each request.
- Supports setting default identifier headers for exodus.io and exodus-int.com.

# Installation

Install the package using npm:

```bash
npm install @exodus/fetch-factory
```

## Usage

### Import and Initialize

```javascript
const { FetchFactory } = require('@exodus/fetch-factory')
const nodeFetch = require("node-fetch")

const headerSetter = new FetchFactory(nodeFetch)

const exchangeFetcher = headerSetter.setRequestHeaders({
  "authentication": "<my-key">
}, ["exchange.io"]).create()


exchangeFetcher('https://exchange.io/api/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
}).then((response) => {
  // handle response
})

```

## Methods

`setHeaders(headers, allowedHostDomains = ['*']): FetchFactory`
Sets custom headers for the specified host domains.

- headers (Object): Headers to set.
- allowedHostDomains (Array): List of domains or subdomains to which these headers should apply. Headers set for a domain will also apply to its subdomains.

`setDefaultExodusIdentifierHeaders({ appId, appVersion, appBuild }): FetchFactory`
Sets default identifier headers (`x-exodus-app-id`, `x-exodus-version`, `x-requested-with`) for the exodus.io and exodus-int.com domains and their subdomains. Exported as `hosts.EXODUS_HOST` and `hosts.EXODUS_INT_HOST`.

- appId (String): The application ID.
- appVersion (String): The application version.
- appBuild (String): The application build identifier.

`create()`
Returns a custom fetch function that includes the configured headers.

- `fetchFn (Function)`: The original fetch function.
