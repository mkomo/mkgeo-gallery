import { mount } from './modules/zoom-basic.js'
import { bitmap } from './modules/bitmap.js'

// This import is handled differently because it comes from a file that has to be formatted for mkgeo-render mapping
const {
  getLabelFromColor,
  getZipFromColor
} = zipbitmap(null, true);

const idFuncs = {
  'buffalo': bitmapData => (bitmapData[0].toString(16) +
    bitmapData[1].toString(16).padStart(2, '0') +
    bitmapData[2].toString(16).padStart(2, '0')).replace(/^0+/, '')
}

const hoverBitmap = ({bitmapData, imageData, infoBox, keyData, idFunc, labelFunc}) => {
  if (bitmapData[0] == 255 && bitmapData[1] == 255 && bitmapData[2] == 255) {
    infoBox.text('');
  } else {
    let output = [],
      id = idFunc(bitmapData),
      label = labelFunc(bitmapData);
    if (keyData && id in keyData) {
      output.push(keyData[id]);
    } else {
      output.push(label);
    }
    output.push('color: ' + bitmapData);
    output.push('image: ' + imageData);
    infoBox.html(`<pre>${output.join('\n')}</pre>`);
  }
}

hoverBitmap.withArgs = (moreArgs) => {
  return (args) => hoverBitmap({...args, ...moreArgs})
}

const urlParams = new URLSearchParams(window.location.search);
const map = urlParams.get('map'),
  visibleImage = urlParams.get('visible');

if (map === 'covid') {
  mount('/covid/deaths-09-20.svg', 'deaths as of 9/20');
} else if (map === 'buffalo') {
  const props = {
    bitmapImage: '../buffalo-properties/bitmap.png',
    visibleImage: '../buffalo-properties/single-family-assessment-per-sqft.png',
    onClick: ({bitmapData, imageData, infoBox}) => {
      const propertyId = (bitmapData[0].toString(16) +
        bitmapData[1].toString(16).padStart(2, '0') +
        bitmapData[2].toString(16).padStart(2, '0')).replace(/^0+/, '');
      console.log('click!', propertyId, ['offsetX', 'offsetY'].map(key=>event[key]), bitmapData);
    },
    onHover: ({bitmapData, imageData, infoBox}) => {
      if (bitmapData[0] == 255 && bitmapData[1] == 255 && bitmapData[2] == 255) {
        infoBox.text('none');
      } else {
        const propertyId = (bitmapData[0].toString(16) +
          bitmapData[1].toString(16).padStart(2, '0') +
          bitmapData[2].toString(16).padStart(2, '0')).replace(/^0+/, '');
        infoBox.text(propertyId);
      }
    }
  };

  if (visibleImage) {
    props.visibleImage = `../${visibleImage}.png`;
  }

  bitmap(props);
} else if (map === 'zips') {
  /*
  determine how many colors are in each scale
  do colors in mkgeo-render by percentile or half-percentile (if there are 200 colors)
  add info to infobox about top color
  flip high and low bits in bitmaps
  format info box

  zcta
  county
  congress
  state
   */

  const props = {
    bitmapImage: '../zipbitmap/multi-state-zips-4x.png',
    visibleImage: '../zipbitmap/multi-state-zips-4x.png',
    onClick: (bitmapData, imageData, infoBox, {image, event, width, height, bitmapCanvas, bitmapContext}) => {
    },
    onHover: hoverBitmap
  };

  if (visibleImage) {
    props.visibleImage = `../${visibleImage}.png`;
  }

  bitmap(props);
} else {
  const views = {
    'pop-density-zip': {
      'displayName': 'ZCTA Population Density',
      'bitmapImage': '../zipbitmap/multi-state-zips-4x.png',
      'visibleImage': '../choropleth/zip-pop-density.1.png'
    },
    'pop-density-county': {
      'displayName': 'County Population Density',
      'bitmapImage': '../bitmapus/county.png',
      'bitmapKey': '../bitmapus/county.data.json',
      'visibleImage': '../choropleth/county-pop-density.png'
    },
    'pop-density-state': {
      'displayName': 'State Population Density',
      'bitmapImage': '../bitmapus/state.png',
      'visibleImage': '../choropleth/state-pop-density.1.png'
    },
    'buffalo/use': {
      'displayName': 'Buffalo Property Uses',
      'bitmapImage': '../buffalo-properties/bitmap.png',
      'visibleImage': '../buffalo-properties/use-categories.1.cropped.png',
      'idFunc': 'buffalo',
      'bitmapKey': '../buffalo-properties/property.data.json',
    }
  }
  const viewName = urlParams.get('view');
  if (viewName in views) {
    const view = views[viewName];
    let args = {};

    args.idFunc = ('idFunc' in view) ? idFuncs[view.idFunc] : getZipFromColor;
    args.labelFunc = ('idFunc' in view) ? idFuncs[view.idFunc] : getLabelFromColor;
    if ('bitmapKey' in view) {
      fetch(view['bitmapKey'])
        .then(response => response.json())
        .then(keyData => {
          bitmap(Object.assign({ onHover: hoverBitmap.withArgs({...args, keyData}) }, view));
        });
    } else {
      bitmap(Object.assign({ onHover: hoverBitmap.withArgs(args) }, view));
    }
  }
}

