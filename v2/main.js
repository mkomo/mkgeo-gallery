import { mount } from './modules/zoom-basic.js'
import { bitmap } from './modules/bitmap.js'

// mount("/covid/deaths-09-20.svg", 'deaths as of 9/20');
bitmap({
  bitmapImageUrl: '../buffalo-properties/bitmap.png',
  visibleImage: '../buffalo-properties/single-family-assessment-per-sqft.png'
})
