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
    return { x, y, k };
  }
  return { x: 0, y: 0, k: 1 };
}

const transformImage = ({viz, transform}) => {
  viz.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
  viz.style("transform-origin", "0 0")
}

const addZoomableImageTagToContainer = ({container, imageSrc, pixelated = false, width, height, size, position}) => {
  let viz = container.append('img')
    .attr('src', imageSrc)
    .style('display', 'none')
    .on('load', function(a) {
      console.log('visible image loaded', this, this.naturalHeight, this.naturalWidth, a, viz);
      transformImage({viz, transform: getInitialTransform({image: this, width, height, size, position})});
      viz.style('display', 'block');
    });
  pixelated && viz.style('image-rendering', 'pixelated');
  container.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .on("zoom", ({transform}) => {
      transformImage({viz, transform})
    }));
  return viz;
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

  bitmapImage.onload = function() {
    canvas
      .attr('width', this.width)
      .attr('height', this.height);
    context.drawImage(bitmapImage, 0, 0);
  };
  bitmapImage.src = bitmapImageUrl;
  return canvas;
}

const readBitmapData = ({event, image, bitmapCanvas, bitmapContext}) => {
  const imageWidth = image.node().naturalWidth,
  imageHeight = image.node().naturalHeight,
  bitmapWidth = bitmapCanvas.attr('width'),
  bitmapHeight = bitmapCanvas.attr('height'),
  scaling = bitmapHeight / imageHeight;
  if (Math.abs(scaling - bitmapHeight/imageHeight) > Number.EPSILON) {
    console.error('bitmap does not match image aspect ratio. image:', imageWidth, imageHeight,'bitmap:', bitmapWidth, bitmapHeight);
    //TODO error out
  }
  return bitmapContext.getImageData(event.offsetX * scaling,event.offsetY * scaling,1,1).data;
};

export const bitmap = ({
  visibleImage, // TODO, handle this as a canvas, svg, etc.
  bitmapImageUrl,
  bitmapBoundingBox, // TODO treat these as coords that correspond to [[0,0],[width,height]] of visible image
  onHover = ()=>{},
  onClick = ()=>{},
  size = SIZE.CONTAIN,
  position = POSITION.CENTER,
  // repeat = REPEAT.NO_REPEAT, // TODO handle this
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

  const image = addZoomableImageTagToContainer({container, imageSrc: visibleImage, pixelated: true, width, height, size, position});
  const bitmapCanvas = loadBitmap(bitmapImageUrl);
  const bitmapContext = bitmapCanvas.node().getContext("2d");
  const infoBox = addInfoContainer({container, title});

  image.on('click', (event) => {
    const bitmapData = readBitmapData({event, image, bitmapCanvas, bitmapContext});
    onClick(bitmapData, infoBox);
  });
  image.on('mousemove', (event) => {
    const bitmapData = readBitmapData({event, image, bitmapCanvas, bitmapContext});
    onHover(bitmapData, infoBox);
  });
}