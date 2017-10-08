import * as React from 'react';

import { Tasks } from '../api/tasks';
 
// Task component - represents a single todo item
interface TaskProps {
  task: { 
    _id: string; 
    text: string; 
    checked: boolean;
  }
}

export default class extends React.Component<TaskProps,{}> {  
  toggleChecked = ():void => {
    Tasks.update(this.props.task._id, {
      $set: { checked: !this.props.task.checked }, 
    })
  }

  deleteThisTask = ():void => {
    Tasks.remove(this.props.task._id);
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
        <span className="text">{this.props.task.text}</span>
      </li>
    );
  }
}
