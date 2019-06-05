# Choropleth Maps
A choropleth map is a map that uses shading or color to impart some information about regions on the map. One common quantitative choropleth is a population density map.

![Choropleth for population density by state](./state-pop-density.png)
```
csv-to-ndjson <(tail -n+5 ./data/census/population/pop_density.csv) > data/census/population/state-historic-population.ndjson

ndjson-join "d.properties.NAME" "d.STATE_OR_REGION" \
    data/census/cb_2017_us_state_500k/cb_2017_us_state_500k.ndjson \
    data/census/population/state-historic-population.ndjson | \
    ndjson-map 'Object.assign(d[0], d[1])' > data/census/states_with_population.ndjson

mkgeo-render data/census/states_with_population.ndjson -M mappers/choropleth.js -d "{
    f: function(d){ return parseFloat(d['2010_DENSITY'].replace(',',''))},
    colorScale: d3.scaleSequential(d3.interpolateReds),
    minmax: [0,10,20,40,80,160,320,640,1280,2560]
  }" -o output/zipbitmap/state-pop-density
```

![Choropleth for population density by zip](./zip-pop-density.png)
```
csv-to-ndjson data/census/population/ACS_17_5YR_DP05/ACS_17_5YR_DP05_with_ann.csv GEO.id2 HC01_VC03 \
  | tail -n +2 > data/census/population/zip-total-population.ndjson

ndjson-join "d.properties.GEOID10" "d['GEO.id2']" \
  data/census/cb_2017_us_zcta510_500k/cb_2017_us_zcta510_500k.ndjson \
  data/census/population/zip-total-population.ndjson | \
  ndjson-map 'Object.assign(d[0], d[1])' > data/census/zips_with_population.ndjson

mkgeo-render data/census/zips_with_population.ndjson -M mappers/choropleth.js -d '{
    f: function(d){ return parseFloat(d.HC01_VC03)/(d.properties.ALAND10*3.861e-7) },
    colorScale: d3.scaleSequential(d3.interpolateReds),
    minmax: [0,10,20,40,80,160,320,640,1280,2560]
  }' -o output/zipbitmap/zip-pop-density
```
