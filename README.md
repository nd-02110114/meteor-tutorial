# meteor-tutorial

Meteor +  React + Typescript 

## How to set up

### Set up Meteor
```
$ meteor create app-name
```

### Set up React + Typescript

```
// 1. install npm react package
$ meteor npm install --save react react-dom @types/react @types/react-dom

// 2. install typescript typings
$ npm install -g typescript
$ npm install -g typings

// 3. typings install type definition
$ typings install registry:env/meteor--global
$ typings install github:meteor-typings/react-meteor-data#955e4521623d6574dde8e0ed1b29967ec13f2c9d --global
$ typings install react
$ typings install react-dom

// 4. install compiler
$ meteor add meteortypescript:compiler
```

### Replace Code
client/hello.tsx
```
import * as React from "react";
import { Meteor } from "meteor/meteor"
import { render } from "react-dom";

class Hello extends React.Component<{}, {}> {
    render() {
        return (
          <div>
            <h1>Hello World from Typescript!!</h1>
          </div> 
        );
    }
}

Meteor.startup(() => {
  render(<Hello />, document.getElementById('render-target'));
});
```
client/main.html
```
<head>
  <title>Sample App</title>
</head>

<body>
  <div id="render-target"></div>
</body>
```
