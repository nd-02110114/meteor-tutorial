import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { TaskType } from '../ui/App';

export const Tasks = new Mongo.Collection('tasks');


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find();
  });
}

Meteor.methods({
  'tasks.insert'(text: string) {
    check(text, String);
    if (! Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      checked: false,
    });
  },
  'tasks.remove'(taskId: string) {
    check(taskId, String);
 
    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId: string, setChecked: boolean) {
    check(taskId, String);
    check(setChecked, Boolean);
 
    Tasks.update(taskId, { $set: { checked: setChecked } });
  },
  'tasks.setPrivate'(taskId: string, setToPrivate: boolean) {
    check(taskId, String);
    check(setToPrivate, Boolean);
 
    const task: TaskType = Tasks.findOne(taskId);
 
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
 
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
});
