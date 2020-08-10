SlopeGraph = function (
  _parentElement,
  _someData,
  _someDomain,
  _provNamePlaceholder,
  _provName
) {
  this.parentElement = _parentElement;
  this.provData = _someData;
  this.scaleDomain = _someDomain;
  this.provNamePlaceholder = _provNamePlaceholder;
  this.provName = _provName;

  this.initVis();
};

SlopeGraph.prototype.initVis = function () {
  let vis = this;

  vis.options = {
    margin: { left: 80, right: 20, top: 20, bottom: 20 },
    initialWidth: 300,
    initialHeight: 500,
  };

  vis.innerWidth =
    vis.options.initialWidth -
    vis.options.margin.left -
    vis.options.margin.right;
  vis.innerHeight =
    vis.options.initialHeight -
    vis.options.margin.top -
    vis.options.margin.bottom;
  vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  vis.mySVG = d3
    .select(vis.parentElement)
    .append("svg")
    .attr("class", "mySVG")
    .attr("width", vis.options.initialWidth)
    .attr("height", vis.options.initialHeight)
    .append("g")
    //OUTS: can magical numbers be removed?
    .attr("transform", "translate(" + 10 + "," + -80 + ")");

  function labelText(d) {
    return d.District + " " + d.First;
  }

  // compute labels dimension
  vis.dummyText = vis.mySVG.append("text");

  // Create scale for positioning data correctly in chart
  vis.vertScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([vis.options.margin.bottom, vis.innerHeight])
    .nice();

  vis.nodes = vis.provData.map(function (district) {
    let bbox = vis.dummyText.text(labelText(district))._groups[0][0].getBBox();
    district.h = bbox.height;
    district.w = bbox.width;
    return new labella.Node(
      vis.vertScale(district.First),
      district.h + 4,
      district
    );
  });

  vis.dummyText.remove();

  // ---------------------------------------------------
  // Draw dots on the timeline
  // ---------------------------------------------------

  //OUTS: do i ned this?
  // vis.mySVG
  //   .append("line")
  //   .classed("timeline", true)
  //   .attr("y2", vis.innerHeight)
  //   .attr(
  //     "transform",
  //     "translate(" +
  //       (vis.options.margin.left + 50) +
  //       "," +
  //       vis.options.margin.top +
  //       ")"
  //   );

  vis.linkLayer = vis.mySVG
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (vis.options.margin.left + 50) +
        "," +
        vis.options.margin.top +
        ")"
    );
  vis.labelLayer = vis.mySVG
    .append("g")
    .attr(
      "transform",
      "translate(" +
        vis.options.margin.left +
        "," +
        vis.options.margin.top +
        ")"
    );
  vis.dotLayer = vis.mySVG
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (vis.options.margin.left + 50) +
        "," +
        vis.options.margin.top +
        ")"
    );

  vis.dotLayer
    .selectAll("circle.dot")
    .data(vis.nodes)
    .enter()
    .append("circle")
    .classed("dot", true)
    .attr("r", 3)
    .attr("cy", function (d) {
      return d.getRoot().idealPos;
    });

  function color(d, i) {
    return vis.colorScale(i);
  }

  //---------------------------------------------------
  // Labella has utility to help rendering
  //---------------------------------------------------

  vis.renderer = new labella.Renderer({
    layerGap: 60,
    nodeHeight: vis.nodes[0].width,
    direction: "left",
  });

  function draw(nodes) {
    nodes = vis.nodes;
    // Add x,y,dx,dy to node
    console.log(vis.renderer.layout(nodes));
    vis.renderer.layout(nodes);

    // Draw label rectangles
    vis.sEnter = vis.labelLayer
      .selectAll("rect.flag")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + (d.y - d.dy / 2) + ")";
      });

    vis.sEnter
      .append("rect")
      .classed("flag", true)
      .attr("width", function (d) {
        return d.data.w + 10;
      })
      .attr("height", function (d) {
        return d.dy;
      })
      .attr("rx", 2)
      .attr("ry", 2)
      .style("fill", color);

    vis.sEnter
      .append("text")
      .attr("x", 4)
      .attr("y", 15)
      .style("fill", "#fff")
      .text(function (d) {
        return labelText(d.data);
      });

    //OUTS: how to get the path to go all the way to the rect?
    // Draw path from point on the timeline to the label rectangle
    vis.linkLayer
      .selectAll("path.link")
      .data(nodes)
      .enter()
      .append("path")
      .classed("link", true)
      .attr("d", function (d) {
        console.log(d);
        console.log(vis.renderer.generatePath(d));
        return vis.renderer.generatePath(d);
      })
      .style("stroke", color)
      .style("stroke-width", 2)
      .style("opacity", 0.6)
      .style("fill", "none");
  }

  //---------------------------------------------------
  // Use labella.Force to place the labels
  //---------------------------------------------------

  vis.force = new labella.Force({
    minPos: -10,
  })
    .nodes(vis.nodes)
    .compute();

  draw(vis.force.nodes());
};
