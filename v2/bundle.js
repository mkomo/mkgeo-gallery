"use strict";

d3.xml("/covid/deaths-04-20.svg").then(data => {
    mountSvg(data);
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