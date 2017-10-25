import { config } from '../../config'
import { Template } from 'meteor/templating';
import * as d3 from 'd3-selection';

import '../../client/main.html';

// type declare
interface elementType {
  id: string
}

interface channelDataType {
  reaction: number;
  message: number;
}

interface d3DataType extends channelDataType {
  name: string;
}

// arrange data
function setChannelData (data):channelDataType[] { 
  const channelData = [];

  let reactionCount:number = 0;
  const messageCount:number = data.length;
  data.forEach(element => {
    if (element.reactions !== undefined) {
      element.reactions.forEach(value => {
        reactionCount += value.count;
      });
    }
  });

  channelData['reaction'] = reactionCount;
  channelData['message'] = messageCount;
  return channelData;
}

// get each channel data
async function getChannelInfo(element:elementType) {
  let getPostUrl:string = 'https://slack.com/api/channels.history?token=' + config.token 
    + '&channel=' + element.id + '&count=500';
  const response = await fetch(getPostUrl); 
  const json = await response.json();
  const channelData = setChannelData(json.messages);
  return channelData;
}

// get all channel data
export async function getAllChannelInfo() {
  const getChannelsUrl:string  = 'https://slack.com/api/channels.list?token=' + config.token
        + '&exclude_archived=true';
  try {
    const allChannelData = [];
    const response = await fetch(getChannelsUrl);
    const json = await response.json();
    json.channels.forEach(element => {
      const channelData = getChannelInfo(element);
      channelData['name'] = element.name;
      allChannelData.push(channelData);
    });
    return allChannelData;
  } catch (error) {
    console.log(error);
  }
};

// draw d3 graph
function drawBarGraph () {
  const a = ["test", "hoge", "hello d3"]
  const alldata = getAllChannelInfo();

  // promise convert pure array
  const d3Data:d3DataType[] = [];
  alldata.then(e => {
    e.forEach(element => {
      let data: d3DataType = {};
      data.name = element.name;
      element.then(count => {
        data.reaction = count.reaction;
        data.message = count.message;
      });
      // if (data.message > 10) {
      d3Data.push(data);
      // }
    });
  });

  // sort about message
  d3Data.sort(function(x, y){
    return x.message - y.message || x.reaction - y.reaction;
  });
  console.log(d3Data);
  Template.body.onRendered(function () {
    d3.select('body').selectAll('p').data(a).enter().append('p');
    d3.selectAll('p').text(function(d){ return d });
  });
};

drawBarGraph();
