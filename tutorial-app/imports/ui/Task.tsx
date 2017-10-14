import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
 
import { TaskType } from './App'

// Task component - represents a single todo item
interface TaskProps {
  task: TaskType;
  showPrivateButton: boolean;
}

export default class extends React.Component<TaskProps,{}> {  
  toggleChecked = ():void => {
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask = ():void => {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate = ():void => {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  render() {
    const taskClassName: string = this.props.task.checked ? 'checked' : '';
    
    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask}>
          &times;
        </button>
        <input
          type="checkbox"
          readOnly
          checked={this.props.task.checked}
          onClick={this.toggleChecked}
        />

        { this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate}>
            { this.props.task.private ? 'Private' : 'Public' }
          </button>
        ) : ''}

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}
