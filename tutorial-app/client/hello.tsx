import * as React from "react";
import { Meteor } from "meteor/meteor"
import { render } from "react-dom";

class Hello extends React.Component<{}, {}> {
    render() {
        return (
          <div>
            <h1>Hello from boilerplate-land!</h1>
          </div> 
        );
    }
}

Meteor.startup(() => {
  render(<Hello />, document.getElementById('render-target'));
});