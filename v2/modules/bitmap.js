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
  return container.append('div')
    .text(title)
    .style('position','absolute')
    .style('z-index','10')
    .style('top', '10px')
    .style('left', '10px')
}

const loadBitmap = bitmapImageUrl => {
  const canvas = d3.select('body').append('canvas').style('display', 'none'),
    context = canvas.node().getContext("2d"),
    bitmapImage = new Image();

  bitmapImage.onload = function() {
    canvas
      .attr('width', this.width)
      .attr('height', this.height);
    context.drawImage(bitmapImage, 0, 0);
  };
  bitmapImage.src = bitmapImageUrl;
  return canvas;
}

export const bitmap = ({
  visibleImage, // TODO, handle this as a canvas, svg, etc.
  bitmapImageUrl,
  bitmapBoundingBox, // TODO treat these as coords that correspond to [[0,0],[width,height]] of visible image
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
    .style('width', width + 'px')
    .style('height', height + 'px')
    .style('overflow', 'hidden'),
  bgColor = '#eee'
}) => {
  console.log('drawing image', visibleImage, bitmapImageUrl);
  container
    .style('background-color', bgColor)
    .style('position', 'relative');

  const image = addZoomableImageTagToContainer({container, imageSrc: visibleImage, pixelated: true, width, height});
  const bitmapCanvas = loadBitmap(bitmapImageUrl);
  const bitmapContext = bitmapCanvas.node().getContext("2d");
  const infoBox = addInfoContainer({container, title});

  image.on('click', (event) => {
    const imageWidth = image.node().naturalWidth,
      imageHeight = image.node().naturalHeight,
      bitmapWidth = bitmapCanvas.attr('width'),
      bitmapHeight = bitmapCanvas.attr('height'),
      scaling = bitmapHeight / imageHeight;
    if (Math.abs(scaling - bitmapHeight/imageHeight) > Number.EPSILON) {
      console.error('bitmap does not match image aspect ratio. image:', imageWidth, imageHeight,'bitmap:', bitmapWidth, bitmapHeight);
      //TODO error out
    }
    const bitmapData = bitmapContext.getImageData(event.offsetX * scaling,event.offsetY * scaling,1,1).data;
    onClick(bitmapData, infoBox);
  });
}