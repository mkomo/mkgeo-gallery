# Zip Code bitmap
This article will describe the creation and use of a PNG which shows the familiar outlines of U.S. states while also encoding the zip codes of each pixel in the color of the image. This image (plus a little bit of javascript) can be used to map clicks to zips without a server call.

### Political Maps

We learn in grammar school that a "political map" is any map that is primarily designed to show governmental boundaries and regions. This is a useful way to learn geography, and it's again useful for orienting yourself once you know that geography.

![Basic Political Map with black borders separating zip codes](./zips_with_states.png) //TODO make this just a state map

Thanks to Appel and Haken, we know that all planar maps can be colored with as few as 4 colors. This makes coloring efficient for mapmakers who don't want to put every color of the rainbow on their palette.

[Picture of 4-color US map]

But you might use more than 4 colors if you want a color choice to tell your audience something about the region. One exercise of this is a choropleth. A choropleth map is...TODO

[Choropleth for population density by state]

Another reason you might use many colors in a map rendering is to encode data within the color. That is, if you know the precise color of a point on a map, you could trace it back to some region identifier or other piece of information.

### State bitmap:
Here is a state map with a unique color for each state.
![United States Maps with distinct colors for each state.](./zip-bitmap.png)

### Zip code bitmap:
We can go a step further to show zip codes.
TODO define ZCTA.
TODO talk about precedence and how colors are encoded 
![United States Maps with distinct colors for each zip code.](./zip-bitmap2.png)

So the naive zip code map encodes all the information we need to determine which state and zip each pixel belongs to. But it does not
encode state information in a visually useful way!

(Note about areas not part of a zip)

(Zip+State with higher precedence for states)

### Uh oh! multi-state zips!

...Handle it

### Why it's useful

It's large, but doesn't require server round trips. (Quaint idea...)

### The Code

### Notes
[data about pixels per state, pixes per sq mile of this projection]
