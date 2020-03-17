SlopeGraph = function(
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

SlopeGraph.prototype.initVis = function() {
  let vis = this;

  $(vis.provNamePlaceholder).text(vis.provName);

  vis.opts = {
    width: 600,
    height: 500,
    margin: { top: 10, right: 50, bottom: 45, left: 125 }
  };

  // Calculate area chart takes up out of entire svg
  vis.chartHeight =
    vis.opts.height - vis.opts.margin.top - vis.opts.margin.bottom;
  vis.chartWidth =
    vis.opts.width - vis.opts.margin.left - vis.opts.margin.right;

  vis.svg = d3
    .select(vis.parentElement)
    .append("svg")
    .attr("viewBox", `0 0 600 500`);
  // .attr("width", vis.opts.width)
  // .attr("height", vis.opts.height);

  // Create scale for positioning data correctly in chart
  vis.vertScale = d3
    .scaleLinear()
    .domain(vis.scaleDomain)
    .range([vis.opts.margin.bottom, vis.chartHeight]);

  //Add Change property to each attribute to denote whether the district improved or got worse or remained the same.
  for (var i = 0; i < vis.provData.length; i++) {
    change = vis.provData[i]["Last"] - vis.provData[i]["First"];
    if (change < -3) {
      vis.provData[i]["Change"] = "positive";
    } else if (change > 5) {
      vis.provData[i]["Change"] = "negative";
    } else {
      vis.provData[i]["Change"] = "neutral";
    }
  }

  // First, calculate the right and left side chart placements
  for (let i = 0; i < vis.provData.length; i++) {
    vis.provData[i]["AfterY"] = vis.vertScale(vis.provData[i]["Last"]);
    vis.provData[i]["BeforeY"] = vis.vertScale(vis.provData[i]["First"]);
  }

  // Next, use a basic heuristic to pull labels up or down
  // If next item is too close to next one, move label up
  // If next item is too close and item above has been moved up, keep the same value,
  // and move next value down

  vis.provData.sort(function(a, b) {
    return b.First - a.First;
  });

  for (var i = 1; i < vis.provData.length - 1; i++) {
    if (vis.provData[i]["BeforeY"] - vis.provData[i + 1]["BeforeY"] < 15) {
      if (vis.provData[i - 1]["BeforeY"] - vis.provData[i]["BeforeY"] < 15) {
        vis.provData[i + 1]["BeforeY"] = vis.provData[i + 1]["BeforeY"] - 10;
      } else {
        vis.provData[i]["BeforeY"] = vis.provData[i]["BeforeY"] + 10;
      }
    }
  }

  vis.provData.sort(function(a, b) {
    return b.Last - a.Last;
  });

  for (var i = 1; i < vis.provData.length - 1; i++) {
    if (vis.provData[i]["AfterY"] - vis.provData[i + 1]["AfterY"] < 15) {
      if (vis.provData[i - 1]["AfterY"] - vis.provData[i]["AfterY"] < 15) {
        vis.provData[i + 1]["AfterY"] = vis.provData[i + 1]["AfterY"] - 10;
      } else {
        vis.provData[i]["AfterY"] = vis.provData[i]["AfterY"] + 10;
      }
    } else if (vis.provData[i - 1]["AfterY"] - vis.provData[i]["AfterY"] < 15) {
      vis.provData[i]["AfterY"] = vis.provData[i]["AfterY"] - 10;
    }
  }

  vis.provData.sort(function(a, b) {
    return b.First - a.First;
  });

  // Create slopegraph labels
  vis.svg
    .selectAll("text.labels")
    .data(vis.provData)
    .enter()
    .append("text")
    .text(function(d) {
      return d.District;
    })
    .attr("class", function(d) {
      return "label " + d.Change;
    })
    .attr("text-anchor", "end")
    .attr("x", vis.opts.margin.left * 0.6)
    .attr("y", function(d) {
      return vis.opts.margin.top + vis.chartHeight - d.BeforeY;
    })
    .attr("dy", ".35em");

  // Create slopegraph left value labels
  vis.svg
    .selectAll("text.leftvalues")
    .data(vis.provData)
    .enter()
    .append("text")
    .attr("class", function(d) {
      return d.Change;
    })
    .text(function(d) {
      return Math.round(d.First) + "%";
    })
    .attr("text-anchor", "end")
    .attr("x", vis.opts.margin.left * 0.85)
    .attr("y", function(d) {
      return vis.opts.margin.top + vis.chartHeight - d.BeforeY;
    })
    .attr("dy", ".35em");

  // Create slopegraph right value labels
  vis.svg
    .selectAll("text.rightvalues")
    .data(vis.provData)
    .enter()
    .append("text")
    .attr("class", function(d) {
      return d.Change;
    })
    .text(function(d) {
      return Math.round(d.Last) + "%";
    })
    .attr("text-anchor", "start")
    .attr("x", vis.chartWidth + vis.opts.margin.right)
    .attr("y", function(d) {
      return vis.opts.margin.top + vis.chartHeight - d.AfterY;
    })
    .attr("dy", ".35em");

  // Create slopegraph lines
  vis.svg
    .selectAll("line.slope-line")
    .data(vis.provData)
    .enter()
    .append("line")
    .attr("class", function(d) {
      return "slope-line " + d.Change + " " + d.District;
    })
    .attr("x1", vis.opts.margin.left)
    .attr("x2", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("y1", function(d) {
      return vis.opts.margin.top + vis.chartHeight - vis.vertScale(d.First);
    })
    .attr("y2", function(d) {
      return vis.opts.margin.top + vis.chartHeight - vis.vertScale(d.Last);
    });
  // .on("mouseover", mouseover)
  // .on("mouseout", mouseout);

  // Create slopegraph left circles
  vis.svg
    .selectAll("line.left-circle")
    .data(vis.provData)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return d.Change;
    })
    .attr("cx", vis.opts.margin.left)
    .attr("cy", function(d) {
      return vis.opts.margin.top + vis.chartHeight - vis.vertScale(d.First);
    })
    .attr("r", 3);

  // Create slopegraph right circles
  vis.svg
    .selectAll("line.left-circle")
    .data(vis.provData)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return d.Change;
    })
    .attr("cx", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("cy", function(d) {
      return vis.opts.margin.top + vis.chartHeight - vis.vertScale(d.Last);
    })
    .attr("r", 3);

  // Create bottom area denoting years

  vis.svg
    .append("line")
    .attr("x1", vis.opts.margin.left)
    .attr("x2", vis.opts.margin.left)
    .attr("y1", vis.opts.height - vis.opts.margin.bottom)
    .attr("y2", vis.opts.height - vis.opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  vis.svg
    .append("line")
    .attr("x1", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("x2", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("y1", vis.opts.height - vis.opts.margin.bottom)
    .attr("y2", vis.opts.height - vis.opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  vis.svg
    .append("line")
    .attr("x1", vis.opts.margin.left)
    .attr("x2", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("y1", vis.opts.height - vis.opts.margin.bottom * 0.7)
    .attr("y2", vis.opts.height - vis.opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  vis.svg
    .append("text")
    .text("2004")
    .attr("class", "neutral")
    .attr("x", vis.opts.margin.left)
    .attr("y", vis.opts.height - vis.opts.margin.bottom * 0.05)
    .attr("text-anchor", "start");

  vis.svg
    .append("text")
    .text("2014")
    .attr("class", "neutral")
    .attr("x", vis.chartWidth + vis.opts.margin.right * 0.75)
    .attr("y", vis.opts.height - vis.opts.margin.bottom * 0.05)
    .attr("text-anchor", "end");

  vis.wrangleData();
};

SlopeGraph.prototype.wrangleData = function() {
  let vis = this;
  vis.updateVis();
};

SlopeGraph.prototype.updateVis = function() {
  let vis = this;
};
