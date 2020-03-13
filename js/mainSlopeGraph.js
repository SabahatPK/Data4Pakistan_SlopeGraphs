SlopeGraph = function(_parentElement, _allData, _keys, _dimensionSVG) {
  this.parentElement = _parentElement;
  this.initVis();
};

//initVis() contains all the static elements of viz
StackedArea.prototype.initVis = function() {
  let vis = this;

  vis.svg = d3
    .select(vis.parentElement)
    .append("svg")
    .attr("class", "card")
    .attr(
      "width",
      vis.dimensions.width +
        vis.dimensions.marginLeft +
        vis.dimensions.marginRight
    )
    .attr(
      "height",
      vis.dimensions.height +
        vis.dimensions.marginTop +
        vis.dimensions.marginBottom
    );

  if (vis.keys[0] === "Active Accounts") {
    vis.title = "Active to Inactive Accounts";
  } else if (vis.keys[0] === "Active Agents") {
    vis.title = "Active to Inactive Agents";
  } else {
    vis.title = vis.allData[0]["Province"];
  }

  vis.svg
    .append("text")
    .attr("x", vis.dimensions.width - 30)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .style("font-size", "90%")
    .style("font-weight", "bold")
    .attr("class", "graphTitle")
    .text(vis.title);

  vis.g = vis.svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        vis.dimensions.marginLeft +
        ", " +
        vis.dimensions.marginTop +
        ")"
    );

  //Build scales:
  vis.xScale1 = d3.scaleTime().range([0, vis.dimensions.width]);
  vis.yScale1 = d3.scaleLinear().range([vis.dimensions.height, 0]);
  vis.color1 = d3.scaleOrdinal(d3.schemePaired).domain(vis.keys);

  //Define axes:
  vis.xAxis1 = d3.axisBottom(vis.xScale1).ticks(3);
  vis.yAxis1 = d3.axisLeft(vis.yScale1).ticks(5);

  //Place axes on chart:
  vis.xAxisCall = vis.g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + vis.dimensions.height + ")");
  vis.yAxisCall = vis.g.append("g").attr("class", "y axis");

  //Begin building the graph:
  vis.justDates = vis.allData.map(each => each.Date);
  vis.minAndMaxDates = d3.extent(vis.justDates);

  vis.largestKeysValue = d3.max(
    vis.allData.map(each => each[vis.keys[0]] + each[vis.keys[1]])
  );

  vis.stack = d3.stack().keys(vis.keys);

  vis.area1 = d3
    .area()
    .x(function(d) {
      return vis.xScale1(d.data.Date);
    })
    .y0(function(d) {
      return vis.yScale1(d[0]);
    })
    .y1(function(d) {
      return vis.yScale1(d[1]);
    });

  vis.sliderValues = $("#slider")
    .slider("values")
    .map(each => new Date(each));

  vis.sliderValuesOne = vis.sliderValues[0];
  vis.sliderValuesTwo = vis.sliderValues[1];

  vis.keys[0] === "Female" ? null : vis.addLegend();

  vis.wrangleData(vis.sliderValuesOne, vis.sliderValuesTwo);
};
