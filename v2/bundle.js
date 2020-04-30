"use strict";

d3.xml("/covid/deaths-04-20.svg").then(data => {
  const svg = mountSvg(data);
  addTooltip(svg);
});

const fitSvg = (svg, width = window.innerWidth, height = window.innerHeight) => {
  const g = svg.insert("g").attr("class", "wrapper")
  svg.selectAll("path").each(function() {
    var el = this;
    g.append(function() { return el; });
  });

  svg.attr("preserveAspectRatio", "xMinYMin meet");
  svg.attr('width', null);
  svg.attr('height', null);
  //TODO use to shrink svg down to change svg viewBox: g.node().getBBox();

  return g;
}

const zoomable = g => {
  svg.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 8])
    .on("zoom", ()=>g.attr("transform", d3.event.transform)));
}

const mountSvg = (data, selection=d3.select('body').append('div')) => {
  selection.node().append(data.documentElement);
  const svg = selection.select("svg");
  const g = fitSvg(svg);
  return svg;
}

/*
TODO: how viewer should load
/link/to/viewer
  ?visible=use-categories.png image to view
  &overlay=streets.png partially transparent layer that is displayed over the visible layer
  &bitmap=bitmap.png underlying image that will provide click colors
  &click=loadPropertyData bitmapClick is a function name that's called with the visible layer color AND optionally the bitmap color that is clicked on
  &key=use-categories.key.png key to dock on bottom
*/

const addTooltip = (svg, container = document.body) => {
  const tooltip = d3.select(container)
    .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("padding", "0.5em")
      .style("background-color", "rgba(220,220,220,0.5)");
  const data = {};
  svg.on("mousemove", function(){
    const item = event.path[0];
    if (item.tagName == 'path') {
      if (data.id != item.id) {
        extractItemData(item, data)
        updateTooltip(tooltip, data, event);
        // console.log(item, item.attributes)
      }
    } else {
      if (data.id) {
        extractItemData(null, data)
        updateTooltip(tooltip);
      }
    }
  });
}

const extractItemData = (item, data) => {
  data.id = item && item.id;
  const {x,y,width,height} = item && item.getBBox() || {}
  Object.assign(data, {x,y,width,height});
}

const updateTooltip = (tooltip, data, event) => {
  if (data) {
    tooltip
      .style("visibility", "visible")
      .style("top", (event.pageY)+"px")
      .style("left",(event.pageX)+"px")
      .text(Object.values(data || {}).join(','));
  } else {
    console.log('');
    tooltip.style("visibility", "hidden");
  }
}
