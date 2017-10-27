import { config } from '../../config'
import * as d3 from 'd3';
import * as nv from 'nvd3';
import * as moment from 'moment';
import * as Chart from 'chart.js'

import '../../client/main.html';

// type declare
interface elementType {
  id: string
  name:string;
}

interface channelDataType {
  reaction: number;
  message: number;
  weeklyCount: { label: string; value:number; } []; 
}

interface d3DataType extends channelDataType {
  name: string;
}

interface d3BarDataType {
  key: string;
  color: string;
  values: { label: string; value:number; } [];
}

interface d3LineDataType {
  label: string;
  data: number[];
  tension: number;
  borderColor: string;
}

// get necessary data
function getData (data):channelDataType[] { 
  const channelData = [];

  let reactionCount:number = 0;
  const messageCount:number = data.length;
  const messageWeeklyCount = [];

  let startDay = moment();
  let count = 0;
  for (let i = 0; i < 15; i++){
    let endDay = moment().subtract(7 * (i+1), 'days');
    messageWeeklyCount.push({label: startDay.format('YYYY/MM/DD'), value: messageCount - count});
    data.forEach(element => {
      let postDate = moment.unix(element.ts);
      if (postDate.isBetween(endDay, startDay)){
        count++;
      }
    });
    startDay = endDay;
  }

  data.forEach(element => {
    if (element.reactions !== undefined) {
      element.reactions.forEach(value => {
        reactionCount += value.count;
      });
    }
  });

  channelData['reaction'] = reactionCount;
  channelData['message'] = messageCount;
  channelData['weeklyCount'] = messageWeeklyCount;
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

// formatting data
function formatData(data) {
  const filterData = data.filter(function(element){
    return (element.message > 15);
  }).sort(function(x, y){
    return y.message - x.message || y.reaction - x.reaction;
  });

  const formatDataForBar: d3BarDataType[] = [
    { key:"Message", color:"#d67777", values:[] },
    { key:"Reaction", color:"#4f99b4", values:[] },
  ];

  const formatDataForLine = [];
  const labels: string[] = [];
  const datasets: d3LineDataType[] = [];
  const colors = ['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#2196F3','#00BCD4',
        '#009688','#4CAF50','#8BC34A','#CDDC39','#FFEB3B','#FF9800','#FF5722','#795548','#9E9E9E'];

  filterData.forEach((val,i) => {
    /* For Line chart */
    let data: number[] = [];
    val.weeklyCount.forEach(element => {
      if (labels.indexOf(element.label) == -1) {
        labels.unshift(element.label);
      }
      data.unshift(element.value);
    });
    if (val.message > 50) {
      datasets.push({ label: val.name, data: data,tension: 0, borderColor: colors[i] });
    }

    /* For Bar chart */
    formatDataForBar[0].values.push({ label: val.name, value: val.message });
    formatDataForBar[1].values.push({ label: val.name, value: val.reaction });
  })

  formatDataForLine['labels'] = labels;
  formatDataForLine['datasets'] = datasets;

  return [formatDataForBar, formatDataForLine];
}

// draw d3 bar graph  
function d3BarDraw (d3Data) {
  nv.addGraph(function() {
    const chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({top: 30, right: 20, bottom: 50, left: 175});
     
    chart.yAxis
        .tickFormat(d3.format("01d"));

    d3.select('#bar-graph svg')
        .datum(d3Data)
        .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function chartJSLineDraw (d3Data) {
  const ctx = document.getElementById("lineChart").getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: d3Data,
  });
};

// draw d3 graph
function drawBarGraph () {
  const alldata = getAllChannelInfo();

  alldata.then(e => {
    Promise.all(e).then((d3Data:d3DataType[]) => {
      // arrrange data
      return formatData(d3Data);
    }).then((d3FilterData):void => {
      // draw many graph
      d3BarDraw(d3FilterData[0]);
      chartJSLineDraw(d3FilterData[1]);
    });
  });
};

// Draw Bar Graph
drawBarGraph();
