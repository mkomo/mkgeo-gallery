import { mount } from './modules/zoom-basic.js'
import { bitmap } from './modules/bitmap.js'

const urlParams = new URLSearchParams(window.location.search);
const map = urlParams.get('map'),
  visibleImage = urlParams.get('visible');

if (map === 'covid') {
  mount("/covid/deaths-09-20.svg", 'deaths as of 9/20');
} else if (map === 'buffalo') {
  const props = {
    bitmapImageUrl: '../buffalo-properties/bitmap.png',
    visibleImage: '../buffalo-properties/single-family-assessment-per-sqft.png',
    onClick: (bitmapData, infoBox) => {
      const propertyId = (bitmapData[0].toString(16) +
        bitmapData[1].toString(16).padStart(2, '0') +
        bitmapData[2].toString(16).padStart(2, '0')).replace(/^0+/, '');
      console.log('click!', propertyId, ['offsetX', 'offsetY'].map(key=>event[key]), bitmapData);
    },
    onHover: (bitmapData, infoBox) => {
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
  let {
    getStateDetailFromColor,
    getStateFromColor,
    getZipDetailFromColor,
    getZipFromColor,
    explainGeoColor,
  } = zipbitmap(null, true);

  const props = {
    bitmapImageUrl: '../zipbitmap/multi-state-zips-4x.png',
    visibleImage: '../zipbitmap/multi-state-zips-4x.png',
    onClick: (bitmapData, infoBox) => {
    },
    onHover: (bitmapData, infoBox) => {
      if (bitmapData[0] == 255 && bitmapData[1] == 255 && bitmapData[2] == 255) {
        infoBox.text('none');
      } else {
        let output = [];
        let state = getStateFromColor(bitmapData)
        let zip = getZipFromColor(bitmapData)
        output.push(`${zip}, ${state}`);
        output.push(getStateDetailFromColor(bitmapData));
        output.push(getZipDetailFromColor(bitmapData));
        output.push(explainGeoColor(bitmapData));
        output.push("color: " + bitmapData);
        infoBox.text(output.join('\n'));
      }
    }
  };

  if (visibleImage) {
    props.visibleImage = `../${visibleImage}.png`;
  }

  bitmap(props);
}