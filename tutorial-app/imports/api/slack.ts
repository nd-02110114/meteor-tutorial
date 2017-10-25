import { config } from '../../config'
import { Template } from 'meteor/templating';
import * as d3 from 'd3';
import * as d3_selection from 'd3-selection';

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

// draw d3 graph
function drawBarGraph () {
  const a = ["test", "hoge", "hello d3"]
  const alldata = getAllChannelInfo();

  alldata.then(e => {
    Promise.all(e).then((d3Data:d3DataType[]): void => {
      console.log(d3Data);
      Template.body.onRendered(function () {
        d3BarDraw(d3Data);
      });
    });
  });
};

drawBarGraph();

// draw d3 bar graph  
function d3BarDraw (d3Data) {
  const  margin = {top: 40, right: 10, bottom: 30, left: 40},
  width = 350 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

  const x = d3.scale().ordinal()
  .rangeRoundBands([0, width], .1);

  const y = d3.scale().linear()
  .range([height, 0]);

  const xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  const yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(10);

  const colorCategoryScale = d3.scale().ordinal()
  .range([ "rgba(255, 255, 255, 0.2)","rgba(255, 255, 255, 0.3)","rgba(255, 255, 255, 0.4)","rgba(255, 255, 255, 0.5)","rgba(255, 255, 255, 0.6)","rgba(255, 255, 255, 0.7)"]);

  const svg = d3_selection.select("#bar-graph").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  

  x.domain(d3Data.map(function(d) { return d.name; }));
  y.domain([0, d3.max(d3Data, function(d) { return d.message; })]);
  
  svg.append("g")
  .attr("class", "x axis")
  .style("fill", "#FFF")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis")
  .style("fill", "#FFF")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end");
  //  .text("Frequency")

  svg.selectAll("#bar-graph")
  .data(d3Data)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.name); })
  .attr("width", x.rangeBand())
  .attr("height", 0) // 1 アニメーション前の設定値
  .attr("y", function(d) { return height; }) // 1 アニメーション前の設定値
  // .attr("fill", function(d){ return colorCategoryScale(d["level"]); })
  .transition()
  .delay(function (d, i) { return i * 100; })
  .duration(1000)
  .ease("linear") // bounceの動きを指定する
  .attr("y", function(d) { return y(d.message); }) // 2 設定値
  .attr("height", function(d) { return height - y(d.message); }); // 2 設定値

  function type(d) {
    d.frequency = +d.frequency;
    return d;
  }
}