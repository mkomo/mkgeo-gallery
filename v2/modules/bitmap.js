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
      console.log('zoom!', debugRound(transform.k), debugRound(transform.x), debugRound(transform.y));
      viz.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
      viz.style("transform-origin", "0 0")
    }));
  return viz;
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
  container = d3.select('body'),
  width = window.innerWidth,
  height = window.innerHeight
}) => {
  console.log('drawing bitmap', visibleImage, bitmapImage);
  container.style('background-color', '#999')

  addZoomableImageTagToContainer({container, imageSrc: visibleImage, pixelated: true, width, height})
}