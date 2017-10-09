import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AccountsUIWrapper extends React.Component<{},{}> {  
  private container: HTMLSpanElement;
  private view: any;

  componentDidMount() {
    this.view = Blaze.render(Template.loginButtons, this.container);
  }
  
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  }
  
  render() {
    // Just render a placeholder container that will be filled in
    return <span ref={(ref) => this.container = ref} />;
  }

}