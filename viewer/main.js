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

const ordinal = number => {
  if (number % 10 == 1) {
    return `${number}st`
  } else if (number % 10 == 2) {
    return `${number}nd`
  } else if (number % 10 == 3) {
    return `${number}rd`
  } else {
    return `${number}th`
  }
}

const hoverBitmap = ({bitmapData, imageData, infoBox, bitmapKeyData, idFunc, labelFunc, bitmapDetails, displayName,
    choroplethScale,
    choroplethQuantilesData,
    choroplethDataUnit,
    choroplethIsExact
  }) => {
  if (bitmapData[0] == 255 && bitmapData[1] == 255 && bitmapData[2] == 255
      || bitmapData[0] == 0 && bitmapData[1] == 0 && bitmapData[2] == 0) {
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
        if (choroplethQuantilesData) {
          const segmentCount = choroplethQuantilesData.length - 1,
            lowerBoundIndex = Math.round(segmentCount * colorInterval), //TODO this is not quite right.
            // we need to consider when a color interval extends past the quantile boundary
            lowerBoundValue = choroplethQuantilesData[lowerBoundIndex];
          if (choroplethIsExact) {
            output.push(`${ordinal(choroplethQuantilesData.length - lowerBoundIndex)} of ${choroplethQuantilesData.length}`)
            output.push(`${lowerBoundValue} ${choroplethDataUnit}`)
          } else {
            const upperBoundIndex = Math.ceil(segmentCount * colorInterval),
              upperBoundValue = choroplethQuantilesData[upperBoundIndex];
            output.push(`${ordinal(Math.floor(colorInterval * 100))} percentile`);
            if (upperBoundValue - lowerBoundValue < Number.EPSILON) {
              output.push(`${lowerBoundValue} ${choroplethDataUnit}`)
            } else {
              output.push(`${lowerBoundValue}-${upperBoundValue} ${choroplethDataUnit}`);
            }
          }
        }
      } else if (imageData[0] == 255 && imageData[1] == 255 && imageData[2] == 255) {
        output.push('Choropleth: No Data')
      } else {
        output.push('Choropleth: COLOR NOT FOUND:' + cssColor)
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
  return getAllScaleColorsBetween(scale);
}
const getAllScaleColorsBetween = (scale, start=0, end=1) => {
  const s = scale(start),
    e = scale(end);
  if (s == e) {
    return {[s]: start};
  } else if (colorDiff(s, e) == 1 || end - start < Number.EPSILON) {
    return {[s]: start, [e]: end};
  } else {
    // console.log('s', start, s, '\ne', end, e, end - start);
    const mid = (start + end) / 2;
    return {...getAllScaleColorsBetween(scale, start, mid), ...getAllScaleColorsBetween(scale, mid, end)};
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
  fetch('./views.json').then(resp => resp.json()).then(views=> {
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
  });
}

