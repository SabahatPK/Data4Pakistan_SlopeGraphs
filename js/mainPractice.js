let svg = d3
  .select("body")
  .append("svg")
  .attr("height", 400)
  .attr("width", 466);

// let circle1 = d3
//   .select("svg")
//   .append("circle")
//   .attr("cx", 300)
//   .attr("cy", 300)
//   .attr("r", 20)
//   .attr("fill", "green");

let rectangle1 = d3
  .select("svg")
  .append("rect")
  .attr("x", 300)
  .attr("y", 300)
  .attr("height", 20)
  .attr("width", 20)
  .attr("stroke", "black")
  .attr("stroke-width", 5)
  .attr("fill", "green");

let rectangle2 = d3
  .select("svg")
  .append("rect")
  .attr("height", 200)
  .attr("width", 200)
  .attr("stroke", "black")
  .attr("fill", "green")
  .attr("stroke-width", 10);

let line = d3
  .select("svg")
  .append("line")
  .attr("x1", 200)
  .attr("y1", 200)
  .attr("x2", 300)
  .attr("y2", 300)
  .attr("stroke", "black")
  .attr("stroke-width", 10);

let ellipse = d3
  .select("svg")
  .append("ellipse")
  .attr("cx", 300)
  .attr("cy", 30)
  .attr("rx", 30)
  .attr("ry", 30)
  .attr("fill", "purple");
