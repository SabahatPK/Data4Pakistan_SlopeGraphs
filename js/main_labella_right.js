// ---------------------------------------------------
// Create dummy data
// ---------------------------------------------------

var data = [
  { date: new Date(1977, 4, 25), episode: 4, name: "A New Hope" },
  { date: new Date(1980, 4, 17), episode: 5, name: "The Empire Strikes Back" },
  { date: new Date(1984, 4, 25), episode: 6, name: "Return of the Jedi" },
  { date: new Date(1999, 4, 19), episode: 1, name: "The Phantom Menace" },
  { date: new Date(2002, 4, 16), episode: 2, name: "Attack of the Clones" },
  { date: new Date(2005, 4, 19), episode: 3, name: "Revenge of the Sith" },
  { date: new Date(2015, 11, 18), episode: 7, name: "The Force Awakens" },
];

var options = {
  margin: { left: 20, right: 20, top: 20, bottom: 20 },
  initialWidth: 300,
  initialHeight: 220,
};

var innerWidth =
  options.initialWidth - options.margin.left - options.margin.right;
var innerHeight =
  options.initialHeight - options.margin.top - options.margin.bottom;
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var vis = d3
  .select("#timeline")
  .append("svg")
  .attr("width", options.initialWidth)
  .attr("height", options.initialHeight)
  .append("g")
  .attr(
    "transform",
    "translate(" + options.margin.left + "," + options.margin.top + ")"
  );

function labelText(d) {
  return d.date.getFullYear() + " - " + d.name;
}

// compute labels dimension
var dummyText = vis.append("text");

var timeScale = d3
  .scaleTime()
  .domain(
    d3.extent(data, function (d) {
      return d.date;
    })
  )
  .range([0, innerHeight])
  .nice();

var nodes = data.map(function (movie) {
  var bbox = dummyText.text(labelText(movie))._groups[0][0].getBBox();
  movie.h = bbox.height;
  movie.w = bbox.width;
  return new labella.Node(timeScale(movie.date), movie.h + 4, movie);
});

dummyText.remove();

// ---------------------------------------------------
// Draw dots on the timeline
// ---------------------------------------------------

vis.append("line").classed("timeline", true).attr("y2", innerHeight);

var linkLayer = vis.append("g");
var labelLayer = vis.append("g");
var dotLayer = vis.append("g");

dotLayer
  .selectAll("circle.dot")
  .data(nodes)
  .enter()
  .append("circle")
  .classed("dot", true)
  .attr("r", 3)
  .attr("cy", function (d) {
    return d.getRoot().idealPos;
  });

function color(d, i) {
  return "#888";
}

//---------------------------------------------------
// Labella has utility to help rendering
//---------------------------------------------------

var renderer = new labella.Renderer({
  layerGap: 60,
  nodeHeight: nodes[0].width,
  direction: "right",
});

function draw(nodes) {
  // Add x,y,dx,dy to node
  renderer.layout(nodes);

  // Draw label rectangles
  var sEnter = labelLayer
    .selectAll("rect.flag")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + (d.y - d.dy / 2) + ")";
    });

  sEnter
    .append("rect")
    .classed("flag", true)
    .attr("width", function (d) {
      return d.data.w + 9;
    })
    .attr("height", function (d) {
      return d.dy;
    })
    .attr("rx", 2)
    .attr("ry", 2)
    .style("fill", color);

  sEnter
    .append("text")
    .attr("x", 4)
    .attr("y", 15)
    .style("fill", "#fff")
    .text(function (d) {
      return labelText(d.data);
    });

  // Draw path from point on the timeline to the label rectangle
  linkLayer
    .selectAll("path.link")
    .data(nodes)
    .enter()
    .append("path")
    .classed("link", true)
    .attr("d", function (d) {
      return renderer.generatePath(d);
    })
    .style("stroke", color)
    .style("stroke-width", 2)
    .style("opacity", 0.6)
    .style("fill", "none");
}

//---------------------------------------------------
// Use labella.Force to place the labels
//---------------------------------------------------

var force = new labella.Force({
  minPos: -10,
})
  .nodes(nodes)
  .compute();

draw(force.nodes());
