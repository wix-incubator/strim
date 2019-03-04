# STRIM 🌊

Streaming Transports Relay Isomorphic Modules

## Installation

`npm i -S @wix/strim`

or

`yarn add @wix/strim`

## Usage
Write a module in your modules directory
```js
// myModules/myAmazingModule.js
```

Server side (only if you need to run some of your modules on the server)
```js
// server.js
```

Client side
```js
// client.js
```

### Full Example

```js
import Strim from '@wix/strim'

new Strim()
  .pipe({
    module: 'globals',
    func: 'get',
    args: [1, 2, 4],
  })
  .pipe({
    module: 'globals',
    func: 'runningSum',
  })
  .subscribe(
    value => {
      console.log('Current Value:', value)
    },
    err => {
      console.error('Error Occurred:', err)
    },
    () => {
      console.log('Done')
    },
  )
```

## API

### Strim
The core class which activates the `strim` flow
#### Strim instance public methods
##### pipe(options)
* __module__ (*Defalut `'global'`*): The module name that will be imported for use of the pipe.
* __func__ (*Defalut `'default'`*): The function name within the module.:
* __args__: arguments that will be sent to the piped function.

##### subscribe(options)
* __subscribe__:


### strimModules(app, options)
* __app__: The Express application to set up `strim` on.
* __options__ (*Optional*): An object containing further options.
  * __wsRoute__ (*Default `'/strim'`*): The route path for `strim`'s endpoint.
  * __modulesPath__ (*Default `'node_modules'`*): The path to the directory of the modules.

## Development
This module is written as part of Wix guild week, we'll be happy to have people help.

just clone the repo, `yarn` and `yarn test`
