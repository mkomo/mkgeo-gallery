import { mount } from './modules/zoom-basic.js'
import { bitmap } from './modules/bitmap.js'

// mount("/covid/deaths-09-20.svg", 'deaths as of 9/20');
bitmap({
  bitmapImageUrl: '../buffalo-properties/bitmap.png',
  // visibleImage: '../buffalo-properties/bitmap.png',
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
});
