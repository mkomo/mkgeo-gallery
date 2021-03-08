export const REPEAT = {
  NO_REPEAT: 'no-repeat'
};
export const SIZE = {
  CONTAIN: 'contain'
};
export const POSITION = {
  CENTER: 'center'
};

const debugRound = (val, factor = 2) => Math.round(val * Math.pow(10, factor))/Math.pow(10, factor);

const addZoomableImageTagToContainer = ({container, imageSrc, pixelated = false, width, height}) => {
  let viz = container.append('img')
    .attr('src', imageSrc);
  pixelated && viz.style('image-rendering', 'pixelated');
  container.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .on("zoom", ({transform}) => {
      viz.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
      viz.style("transform-origin", "0 0")
    }));
  return viz;
}

const addInfoContainer = ({container, title}) => {
  container.append('div')
    .text(title)
    .style('position','absolute')
    .style('z-index','10')
    .style('top', '10px')
    .style('left', '10px')
}

export const bitmap = ({
  visibleImage,
  bitmapImage,
  visibleBoundingBox,
  bitmapBoundingBox,
  onHover = ()=>{},
  onClick = ()=>{},
  size = SIZE.CONTAIN,
  position = POSITION.CENTER,
  repeat = REPEAT.NO_REPEAT,
  title = 'test title',
  width = window.innerWidth,
  height = window.innerHeight,
  container = d3.select('body').append('div')
    .style('position','fixed')
    .style('width', width)
    .style('height', height),
  bgColor = '#eee'
}) => {
  console.log('drawing bitmap', visibleImage, bitmapImage);
  container
    .style('background-color', bgColor)
    .style('position', 'relative');

  addInfoContainer({container, title});

  addZoomableImageTagToContainer({container, imageSrc: visibleImage, pixelated: true, width, height})
}