import { config } from '../../config.js'

const getChannelsUrl = 'https://slack.com/api/channels.list?token=' + config.token;

async function getPostInfo(element){
  let getPostUrl = 'https://slack.com/api/channels.history?token=' + config.token 
  + '&channel=' + element.id;
  const response = await fetch(getPostUrl); 
  const json = await response.json();
  return json.messages;
}

export async function getInfo() {
  try {
    const response = await fetch(getChannelsUrl);
    const json = await response.json();
    json.channels.forEach(element => {
      const data = getPostInfo(element);
      console.log(data);
    });
    console.log(json.channels);
  } catch (error) {
    console.log(error);
  }
};

getInfo();



