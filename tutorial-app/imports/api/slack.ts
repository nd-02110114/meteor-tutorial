import { config } from '../../config.js'
import * as d3 from 'd3';

interface elementType {
  id: string
}

interface channelDataType {
  reaction: number;
  message: number;
}

const getChannelsUrl:string  = 'https://slack.com/api/channels.list?token=' + config.token
  + '&exclude_archived=true';

// each channel data
async function getPostInfo(element:elementType) {
  let getPostUrl:string = 'https://slack.com/api/channels.history?token=' + config.token 
    + '&channel=' + element.id;
  const response = await fetch(getPostUrl); 
  const json = await response.json();
  const channelData = await setChannelData(json.messages);
  return channelData;
}

// arrange data
function setChannelData (data):channelDataType[] { 
  const channelData = [];

  let reactionCount:number = 0;
  const messageCount:number = data.length;
  data.forEach(element => {
    // console.log(element.reactions);
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

// all data
export async function getInfo() {
  try {
    const allChannelData = [];
    const response = await fetch(getChannelsUrl);
    const json = await response.json();
    json.channels.forEach(element => {
      const channelData = getPostInfo(element);
      allChannelData[element.name] = channelData;
    });
    return allChannelData;
  } catch (error) {
    console.log(error);
  }
};

getInfo();
