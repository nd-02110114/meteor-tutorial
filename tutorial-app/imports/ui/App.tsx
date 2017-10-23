import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import * as d3_select from 'd3-selection';
 
import Task from './Task';
import { Tasks } from '../api/tasks';
import AccountsUIWrapper from './AccountUIWrapper';
import '../api/slack.js';

export interface TaskType {
  _id: string; 
  text: string; 
  checked: boolean;
  owner: string;
  username: string;
  showPrivateButton: boolean;
  private: boolean;
}

interface PropsType {
  tasks: TaskType [];
  incompleteCount: number;
  currentUser: { _id: string; };
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
    const text: string = this.textInput.value.trim();
    // insert Database
    Meteor.call('tasks.insert', text);
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
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton: boolean = task.owner === currentUserId;
 
      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
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

          <AccountsUIWrapper />

          { this.props.currentUser ? 
            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref={(ref) => this.textInput = ref}
                placeholder="Type to add new holiday plan!"
              />
            </form> : ''
          }
        </header>

        <span className="list-label">Stock Plan!</span>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true }}).count(),
    currentUser: Meteor.user(),
  };
}, App);