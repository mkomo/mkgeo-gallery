import { mount } from './modules/zoom-basic.js'
import { bitmap } from './modules/bitmap.js'

// This import is handled differently because it comes from a file that has to be formatted for mkgeo-render mapping
const {
  getLabelFromColor,
  getZipFromColor,
  getStateDetailFromColor,
  getZipDetailFromColor,
  explainGeoColor
} = zipbitmap(null, true);

const idFuncs = {
  'buffalo': bitmapData => (bitmapData[0].toString(16) +
    bitmapData[1].toString(16).padStart(2, '0') +
    bitmapData[2].toString(16).padStart(2, '0')).replace(/^0+/, '')
}

const hoverBitmap = ({bitmapData, imageData, infoBox, keyData, idFunc, labelFunc, bitmapDetails}) => {
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
    if (bitmapDetails) {
      output.push(getStateDetailFromColor(bitmapData));
      output.push(getZipDetailFromColor(bitmapData));
      output.push(explainGeoColor(bitmapData));
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
  /*
  determine how many colors are in each scale
  do colors in mkgeo-render by percentile or half-percentile (if there are 200 colors)
  add info to infobox about top color
  flip high and low bits in bitmaps
  format info box
   */

} else {
  const views = {
    //bitmaps
    'bitmapus/zip': {
      'displayName': 'Zip Code Tabulation Area Bitmap',
      'visibleImage': '../zipbitmap/multi-state-zips-4x.png',
      'bitmapImage': '../zipbitmap/multi-state-zips-4x.png',
      'bitmapDetails': true
    },
    'bitmapus/county': {
      'displayName': 'County Bitmap',
      'visibleImage': '../bitmapus/county.png',
      'bitmapImage': '../bitmapus/county.png',
      'bitmapKey': '../bitmapus/county.data.json',
      'bitmapDetails': true
    },
    'bitmapus/congress115': {
      'displayName': '115th Congressional District Bitmap',
      'visibleImage': '../bitmapus/congress115.png',
      'bitmapImage': '../bitmapus/congress115.png',
      'bitmapDetails': true
    },
    'bitmapus/state': {
      'displayName': 'State Bitmap',
      'visibleImage': '../bitmapus/state.png',
      'bitmapImage': '../bitmapus/state.png',
      'bitmapDetails': true
    },

    //pop density
    'pop-density-zip': {
      'displayName': 'ZCTA Population Density',
      'visibleImage': '../choropleth/zip-pop-density.1.png',
      'bitmapImage': '../zipbitmap/multi-state-zips-4x.png'
    },
    'pop-density-county': {
      'displayName': 'County Population Density',
      'visibleImage': '../choropleth/county-pop-density.png',
      'bitmapImage': '../bitmapus/county.png',
      'bitmapKey': '../bitmapus/county.data.json'
    },
    'pop-density-state': {
      'displayName': 'State Population Density',
      'visibleImage': '../choropleth/state-pop-density.1.png',
      'bitmapImage': '../bitmapus/state.png'
    },

    //Buffalo
    'buffalo/use': {
      'displayName': 'Buffalo Property Uses',
      'visibleImage': '../buffalo-properties/use-categories.1.cropped.png',
      'bitmapImage': '../buffalo-properties/bitmap.png',
      'bitmapKey': '../buffalo-properties/property.data.json',
      'idFunc': 'buffalo'
    },
    'buffalo/assessment-sqft': {
      'displayName': 'Buffalo Properties - Assessed value per sqft',
      'visibleImage': '../buffalo-properties/single-family-assessment-per-sqft.png',
      'bitmapImage': '../buffalo-properties/bitmap.png',
      'bitmapKey': '../buffalo-properties/property.data.json',
      'idFunc': 'buffalo'
    },
    'buffalo': {
      'displayName': 'Buffalo Property Bitmap',
      'visibleImage': '../buffalo-properties/bitmap.png',
      'bitmapImage': '../buffalo-properties/bitmap.png',
      'bitmapKey': '../buffalo-properties/property.data.json',
      'idFunc': 'buffalo',
    }
  }
  const viewName = urlParams.get('view') || 'bitmapus/zip';
  if (viewName in views) {
    const view = views[viewName];
    let args = Object.assign({}, view);

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

