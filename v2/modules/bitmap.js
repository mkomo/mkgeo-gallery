import { parseCss } from "../node_modules/d3-interpolate/src/transform/parse.js";

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

const getInitialTransform = ({image, width, height, size, position}) => {
  if (size === SIZE.CONTAIN) {
    const naturalHeight = image.naturalHeight, naturalWidth = image.naturalWidth;
    let k = Math.min(height/naturalHeight, width/naturalWidth), x = 0, y = 0;
    if (position === POSITION.CENTER) {
      if (height/naturalHeight < width/naturalWidth) {
        x = (width - naturalWidth * k)/2;
      } else {
        y = (height - naturalHeight * k)/2;
      }
    }
    return d3.zoomIdentity.translate(x, y).scale(k);
  }
  return d3.zoomIdentity;
}

const transformImage = ({viz, transform}) => {
  viz.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
}

const addZoomableImageTagToContainer = ({container, imageSrc, pixelated = false, width, height, size, position}) => {
  const canvas = container.append('canvas')
      .style('display', 'none')
      .style("transform-origin", "0 0"),
    image = new Image();
  image.onload = () => {
    container.call(zoom.transform, getInitialTransform({image, width, height, size, position}));
    canvas
      .attr('width', image.width)
      .attr('height', image.height);
    canvas.node().getContext("2d").drawImage(image, 0, 0);
    canvas.style('display', 'block');
  };
  image.src = imageSrc;
  const zoom = d3.zoom()
    .extent([[0, 0], [width, height]])
    .on("zoom", ({transform}) => {
      transformImage({viz: canvas, transform})
    });
  pixelated && canvas.style('image-rendering', 'pixelated');
  container.call(zoom);
  return canvas;
}

const addInfoContainer = ({container, title}) => {
  return container.append('div')
    .text(title)
    .attr('class', 'info-box');
}

const loadBitmap = bitmapImageUrl => {
  const canvas = d3.select('body').append('canvas').style('display', 'none'),
    context = canvas.node().getContext("2d"),
    bitmapImage = new Image();

  bitmapImage.onload = () => {
    canvas
      .attr('width', bitmapImage.width)
      .attr('height', bitmapImage.height);
    context.drawImage(bitmapImage, 0, 0);
  };
  bitmapImage.src = bitmapImageUrl;
  return canvas;
}

const readBitmapData = ({ event: {x, y}, image, bitmapCanvas, bitmapContext}) => {
  const imageWidth = image.attr('width'),
    imageHeight = image.attr('height'),
    bitmapWidth = bitmapCanvas.attr('width'),
    bitmapHeight = bitmapCanvas.attr('height'),
    scaling = bitmapHeight / imageHeight,
    imageTransform = parseCss(image.style('transform'));
  if (Math.abs(scaling - bitmapHeight/imageHeight) > Number.EPSILON) {
    console.error('bitmap does not match image aspect ratio. image:', imageWidth, imageHeight,'bitmap:', bitmapWidth, bitmapHeight);
    //TODO error out
  }
  const imageOffsetX = (x - imageTransform.translateX) * scaling / imageTransform.scaleX,
    imageOffsetY = (y - imageTransform.translateY) * scaling / imageTransform.scaleY;
  return bitmapContext.getImageData(Math.floor(imageOffsetX),Math.floor(imageOffsetY),1,1).data;
};

const readImageData = ({ event: {x, y}, image}) => {
  const imageContext = image.node().getContext("2d"),
    imageTransform = parseCss(image.style('transform')),
    imageOffsetX = (x - imageTransform.translateX) / imageTransform.scaleX,
    imageOffsetY = (y - imageTransform.translateY) / imageTransform.scaleY;
  return imageContext.getImageData(Math.floor(imageOffsetX),Math.floor(imageOffsetY),1,1).data;
};

export const bitmap = ({
  visibleImage, // TODO, handle as a canvas, svg, etc.
  bitmapImageUrl,
  bitmapBoundingBox, // TODO treat these as coords that correspond to [[0,0],[width,height]] of visible image
  onHover = ()=>{},
  onClick = ()=>{},
  size = SIZE.CONTAIN,
  position = POSITION.CENTER,
  // repeat = REPEAT.NO_REPEAT, // TODO handle repeat options
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
  container
    .style('background-color', bgColor)
    .style('position', 'relative');

  const image = addZoomableImageTagToContainer({container, imageSrc: visibleImage, pixelated: true, width, height, size, position});
  const bitmapCanvas = loadBitmap(bitmapImageUrl);
  const bitmapContext = bitmapCanvas.node().getContext("2d");
  const infoBox = addInfoContainer({container, title});

  image.on('click', (event) => {
    const bitmapData = readBitmapData({event, image, bitmapCanvas, bitmapContext}),
      imageData = readImageData({event, image});
    onClick(bitmapData, imageData, infoBox, {image, event, width, height, bitmapCanvas, bitmapContext});
  });
  image.on('mousemove', (event) => {
    const bitmapData = readBitmapData({event, image, bitmapCanvas, bitmapContext}),
      imageData = readImageData({event, image});
    onHover(bitmapData, imageData, infoBox);
  });
}