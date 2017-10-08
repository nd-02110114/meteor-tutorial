import * as React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
 
import Task from './Task';
import { Tasks } from '../api/tasks';

export interface TasksPropType {
 tasks: { _id: number; text: string; }[];
}
 
// App component - represents the whole app
class App extends React.Component<TasksPropType,{}> {
  renderTasks() {
    return this.props.tasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
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
    tasks: Tasks.find({}).fetch(),
  };
}, App);