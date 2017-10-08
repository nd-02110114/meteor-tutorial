import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
 
import Task from './Task';
import { Tasks } from '../api/tasks';

interface TasksPropType {
 tasks: { _id: string; text: string; checked: boolean; }[];
}
 
// App component - represents the whole app
class App extends React.Component<TasksPropType,{}> {
  private textInput: HTMLInputElement;

  handleSubmit = (event: any):void  => {
    event.preventDefault();
    // Find the text field via the React ref
    const text = this.textInput.value.trim();
    // insert Database
    Tasks.insert({
      text,
      createdAt: new Date(),
      checked: false, 
    });
    // Clear form
    this.textInput.value = '';
  }

  renderTasks = () => {
    return this.props.tasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
          <form className="new-task" onSubmit={this.handleSubmit} >
            <input
              type="text"
              ref={(ref) => this.textInput = ref}
              placeholder="Type to add new tasks"
            />
          </form>
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default createContainer(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
  };
}, App);