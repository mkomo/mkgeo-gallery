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

const hoverBitmap = ({bitmapData, imageData, infoBox, bitmapKeyData, idFunc, labelFunc, bitmapDetails, displayName,
    choroplethScale,
    choroplethQuantilesData
  }) => {
  if (bitmapData[0] == 255 && bitmapData[1] == 255 && bitmapData[2] == 255) {
    infoBox.text(displayName);
  } else {
    let output = [],
      id = idFunc(bitmapData),
      label = labelFunc(bitmapData);
    if (bitmapKeyData && id in bitmapKeyData) {
      output.push(bitmapKeyData[id]);
    } else {
      output.push(label);
    }
    if (bitmapDetails) {
      output.push(getStateDetailFromColor(bitmapData));
      output.push(getZipDetailFromColor(bitmapData));
      output.push(explainGeoColor(bitmapData));
      output.push('color: ' + bitmapData);
    }
    if (choroplethScale) {
      const cssColor = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`
      if (cssColor in choroplethScale) {
        // color -> scale value [0,1] (with upper and lower bounds) -> actual value (with upper and lower bounds)
        const colorInterval = choroplethScale[cssColor];
        output.push(`choro: ${Math.floor(colorInterval * 100)}th percentile`)
        if (choroplethQuantilesData) {
          // console.log('choroplethQuantilesData',choroplethQuantilesData);
          const segmentCount = choroplethQuantilesData.length - 1,
            lowerBoundIndex = Math.floor(segmentCount * colorInterval), //TODO this is not quite right.
            // we need to consider when a color interval extends past the quantile boundary
            upperBoundIndex = Math.ceil(segmentCount * colorInterval),
            lowerBoundValue = choroplethQuantilesData[lowerBoundIndex],
            upperBoundValue = choroplethQuantilesData[upperBoundIndex];
          if (upperBoundValue - lowerBoundValue < Number.EPSILON) {
            output.push(`value: ${lowerBoundValue}`)
          } else {
            output.push(`range: ${lowerBoundValue}-${upperBoundValue}`)
          }
        }
      } else if (imageData[0] == 255 && imageData[1] == 255 && imageData[2] == 255) {
        output.push('choro: No Data')
      } else {
        output.push('choro: NOT FOUND:' + cssColor)
      }
    } else {
      // This is a placeholder -- handle categorical colors, etc
      output.push('image: ' + imageData);
    }
    infoBox.html(`<pre>${output.join('\n')}</pre>`);
  }
}

hoverBitmap.withArgs = (moreArgs) => {
  return (args) => hoverBitmap({...args, ...moreArgs})
}

const getAllColorsForScale = scaleName => {
  let scale = d3[`interpolate${scaleName}`];
  return getAllScaleColorsBetween(0, 1, scale);
}
const getAllScaleColorsBetween = (start, end, scale) => {
  const s = scale(start),
    e = scale(end);
  if (s == e) {
    return {[s]: start};
  } else if (colorDiff(s, e) == 1 || end - start < Number.EPSILON) {
    return {[s]: start, [e]: end};
  } else {
    // console.log('s', start, s, '\ne', end, e, end - start);
    const mid = (start + end) / 2;
    return {...getAllScaleColorsBetween(start, mid, scale), ...getAllScaleColorsBetween(mid, end, scale)};
  }
}
const colorDiff = (s, e) => {
  const c1 = d3.color(s), c2 = d3.color(e);
  return Math.abs(c1.r - c2.r) + Math.abs(c1.g - c2.g) + Math.abs(c1.b - c2.b);
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
    'buffalo': {
      'displayName': 'Buffalo Property Bitmap',
      'visibleImage': '../buffalo-properties/bitmap.png',
      'bitmapImage': '../buffalo-properties/bitmap.png',
      'bitmapKey': '../buffalo-properties/property.data.json',
      'idFunc': 'buffalo',
    },

    //pop density
    'pop-density/zip': {
      'displayName': 'ZCTA Population Density',
      'visibleImage': '../choropleth/zip-pop-density.png',
      'bitmapImage': '../zipbitmap/multi-state-zips-4x.png',
      'choroplethScaleName': 'YlOrRd',
      'choroplethQuantiles': '../choropleth/zip-pop-density.quantiles.json'
    },
    'pop-density/county': {
      'displayName': 'County Population Density',
      'visibleImage': '../choropleth/county-pop-density.png',
      'bitmapImage': '../bitmapus/county.png',
      'bitmapKey': '../bitmapus/county.data.json',
      'choroplethScaleName': 'YlOrRd',
      'choroplethQuantiles': '../choropleth/county-pop-density.quantiles.json'
    },
    'pop-density/state': {
      'displayName': 'State Population Density',
      'visibleImage': '../choropleth/state-pop-density.png',
      'bitmapImage': '../bitmapus/state.png',
      'choroplethScaleName': 'YlOrRd',
      'choroplethQuantiles': '../choropleth/state-pop-density.quantiles.json'
    },

    //Buffalo
    'buffalo/use': {
      'displayName': 'Buffalo Property Uses',
      'visibleImage': '../buffalo-properties/use-categories.cropped.png',
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
    }
  }
  const viewName = urlParams.get('view') || 'bitmapus/zip';
  if (viewName in views) {
    const view = views[viewName];
    let args = Object.assign({}, view);

    args.idFunc = ('idFunc' in view) ? idFuncs[view.idFunc] : getZipFromColor;
    args.labelFunc = ('idFunc' in view) ? idFuncs[view.idFunc] : getLabelFromColor;
    args.choroplethScale = ('choroplethScaleName' in view) ? getAllColorsForScale(view.choroplethScaleName) : null;

    const fetches = {};

    if ('bitmapKey' in view) {
      console.log('fetch bitmapKey')
      fetches['bitmapKey'] = fetch(view['bitmapKey']);
    }

    if ('choroplethQuantiles' in view) {
      console.log('fetch choroplethQuantiles key')
      fetches['choroplethQuantiles'] = fetch(view['choroplethQuantiles']);
    }

    Promise.all(Object.values(fetches))
    .then(responses=>Promise.all(responses.map(resp => resp.json())))
    .then(data => {
      Object.keys(fetches).forEach((key, i) => {
        args[key + 'Data'] = data[i];
      })
      bitmap(Object.assign({ onHover: hoverBitmap.withArgs(args) }, view));
    })
    .catch(error => console.error(error));

  }
}

