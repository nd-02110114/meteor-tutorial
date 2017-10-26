import { config } from '../../config'
import { Template } from 'meteor/templating';
import * as d3 from 'd3';
import * as nv from 'nvd3';

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

interface formatDataType {
  key: string;
  color: string;
  values: { label: string; value:number; } [];
}

// get necessary data
function getData (data):channelDataType[] { 
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
  const channelData = getData(json.messages);
  return channelData;
}

// get all channel data
async function getAllChannelInfo() {
  const getChannelsUrl:string  = 'https://slack.com/api/channels.list?token=' + config.token
        + '&exclude_archived=true';
  try {
    const allChannelData = [];
    const response = await fetch(getChannelsUrl);
    const json = await response.json();
    json.channels.forEach(element => {
      const channelData = getChannelInfo(element).then(val => 
        { val['name'] = element.name; return val; });
      allChannelData.push(channelData);
    });
    return allChannelData;
  } catch (error) {
    console.log(error);
  }
};

// formatting
function formatData(data) {
  const filterData = data.filter(function(element){
    return (element.message > 15);
  }).sort(function(x, y){
    return y.message - x.message || y.reaction - x.reaction;
  });

  const formatData = [
    { key:"Message", color:"#d67777", values:[] },
    { key:"Reaction", color:"#4f99b4", values:[] },
  ];

  filterData.forEach(val => {
    formatData[0].values.push({ label: val.name, value: val.message });
    formatData[1].values.push({ label: val.name, value: val.reaction });
  })

  return formatData;
}

// draw d3 bar graph  
function d3BarDraw (d3Data) {
  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({top: 30, right: 20, bottom: 50, left: 175})
        .showValues(true)           //Show bar value next to each bar.
        .tooltips(true)             //Show tooltips on hover.
        // .transitionDuration(350)
        .showControls(true);        //Allow user to switch between "Grouped" and "Stacked" mode.

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('svg')
        .datum(d3Data)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

// draw d3 graph
function drawBarGraph () {
  const a = ["test", "hoge", "hello d3"]
  const alldata = getAllChannelInfo();

  alldata.then(e => {
    Promise.all(e).then((d3Data:d3DataType[]) => {
      // arrrange data
      return formatData(d3Data);
    }).then((d3FilterData: formatDataType[]):void => {
      // console.log(d3FilterData);
      Template.body.onRendered(function () {
        d3BarDraw(d3FilterData);
      });
    });
  });
};

// Draw Bar Graph
drawBarGraph();