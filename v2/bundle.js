
"use strict";
(() => {
  const width = window.innerWidth, height = window.innerHeight;
  const mount = (url, title) => {
    d3.xml(url).then(data => {
      const svg = mountSvg(data, title);
      addTooltip(svg);
    });
  }

  const fitSvg = (svg) => {
    const g = svg.insert("g").attr("class", "wrapper")
    svg.selectAll("path").each(function() {
      var el = this;
      g.append(function() { return el; });
    });

    svg.attr("preserveAspectRatio", "xMinYMin meet");
    svg.attr('width', null);
    svg.attr('height', null);
    svg.attr('viewBox',"-50 350 2100 1300");
    //TODO use to shrink svg down to change svg viewBox: g.node().getBBox();

    return g;
  }

  const mountSvg = (data, title='map', container=d3.select('body').append('div')) => {
    container.append('h1').text(title);
    container.node().append(data.documentElement);
    const svg = container.select("svg");
    const g = fitSvg(svg);
    // svg.call(zoom);

    function zoomed({transform}) {
      g.attr("transform", transform);
    }

    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

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
        .style("user-select", "none")
        .style("padding", "0.5em")
        .style("background-color", "rgba(220,220,220,0.5)");
    const data = {};
    svg.on("mousemove", function(){
      const item = event.path[0];
      if (item.tagName == 'path') {
        if (data.id != item.id) {
          extractItemData(item, data)
          updateTooltip(tooltip, data, event);
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

  const TOOLTIP_OFFSET = 28;

  const tooltipData = {
    visible: false,
    text: null
  }

  const updateTooltip = (tooltip, data, event) => {
    if (data) {
      tooltip
        .style("top", (event.pageY + TOOLTIP_OFFSET) + "px")
        .style("left",(event.pageX + TOOLTIP_OFFSET) + "px")
      if (!tooltipData.visible) {
        tooltip.style("visibility", "visible");
      }
      const text = Object.values(data || {}).join(',');
      if (text != tooltipData.text) {
        tooltip.text(text);
      }
      tooltipData.text = text;
      tooltipData.visible = true;
    } else {
      tooltip.style("visibility", "hidden");
      tooltipData.visible = false;
    }
  }

  mount("/covid/deaths-09-20.svg", 'deaths as of 9/20');
})();