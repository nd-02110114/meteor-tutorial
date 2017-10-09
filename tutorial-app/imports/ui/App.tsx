import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
 
import Task from './Task';
import { Tasks } from '../api/tasks';

interface PropsType {
 tasks: { _id: string; text: string; checked: boolean; }[];
 incompleteCount: number;
}

interface StateType {
  hideCompleted: boolean;
}
 
// App component - represents the whole app
class App extends React.Component<PropsType, StateType> {
  private textInput: HTMLInputElement;

  constructor(props){
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

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

  toggleHideCompleted = ():void => {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks = () => {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Holiday Plan ({ this.props.incompleteCount })</h1><label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted}
            />
            Hide Completed Tasks
          </label>
 

          <form className="new-task" onSubmit={this.handleSubmit} >
            <input
              type="text"
              ref={(ref) => this.textInput = ref}
              placeholder="Type to add new holiday plan!"
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
    incompleteCount: Tasks.find({ checked: { $ne: true }}).count(),
  };
}, App);