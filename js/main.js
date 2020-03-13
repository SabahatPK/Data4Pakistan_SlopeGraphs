//Follow this: https://gist.github.com/mwburke/9873c09ac6c21d6ac9153e54892cf5ec

const opts = {
  width: 600,
  height: 500,
  margin: { top: 20, right: 100, bottom: 30, left: 150 }
};

// Calculate area chart takes up out of entire svg
let chartHeight = opts.height - opts.margin.top - opts.margin.bottom;
let chartWidth = opts.width - opts.margin.left - opts.margin.right;

let svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", opts.width)
  .attr("height", opts.height);

// Create scale for positioning data correctly in chart
let vertScale = d3.scaleLinear().range([opts.margin.bottom, chartHeight]);

d3.csv("/data/Data4Pakistan-BalochistanOnly.csv").then(function(data) {
  //DATA clean-up/manipulation:
  //1. Downloaded Data4Pak dataset into Excel.
  //2. EXCEL - Deleted out all cols except those with data.Province === Balochistan and col = "Poverty Rate (%)"
  //3. EXCEL - Deleted all rows without value for "Poverty Rate (%)"
  //4. EXCEL - Ordered by Year
  //5. Saved as csv, loaded into main.js for further manipulation:

  let updatedData = [];

  for (let i = 0; i < data.length; i += 2) {
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = data[i].District;
    updatedObj.First = parseInt(data[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(data[i + 1]["Poverty Rate (%)"]);
    updatedData.push(updatedObj);
  }

  //Add Change property to each attribute to denote whether the district improved or got worse or remained the same.
  for (var i = 0; i < updatedData.length; i++) {
    change = updatedData[i]["Last"] - updatedData[i]["First"];
    if (change < -3) {
      updatedData[i]["Change"] = "negative";
    } else if (change > 5) {
      updatedData[i]["Change"] = "positive";
    } else {
      updatedData[i]["Change"] = "neutral";
    }
  }

  //Add in: calc domain dynamically based on datas extent
  vertScale.domain([40, 75]);

  // First, calculate the right and left side chart placements
  for (let i = 0; i < updatedData.length; i++) {
    updatedData[i]["AfterY"] = vertScale(updatedData[i]["Last"]);
    updatedData[i]["BeforeY"] = vertScale(updatedData[i]["First"]);
  }

  // Next, use a basic heuristic to pull labels up or down
  // If next item is too close to next one, move label up
  // If next item is too close and item above has been moved up, keep the same value,
  // and move next value down

  updatedData.sort(function(a, b) {
    return b.First - a.First;
  });

  for (var i = 1; i < updatedData.length - 1; i++) {
    if (updatedData[i]["BeforeY"] - updatedData[i + 1]["BeforeY"] < 15) {
      if (updatedData[i - 1]["BeforeY"] - updatedData[i]["BeforeY"] < 15) {
        updatedData[i + 1]["BeforeY"] = updatedData[i + 1]["BeforeY"] - 10;
      } else {
        updatedData[i]["BeforeY"] = updatedData[i]["BeforeY"] + 10;
      }
    }
  }

  updatedData.sort(function(a, b) {
    return b.Last - a.Last;
  });

  for (var i = 1; i < updatedData.length - 1; i++) {
    if (updatedData[i]["AfterY"] - updatedData[i + 1]["AfterY"] < 15) {
      if (updatedData[i - 1]["AfterY"] - updatedData[i]["AfterY"] < 15) {
        updatedData[i + 1]["AfterY"] = updatedData[i + 1]["AfterY"] - 10;
      } else {
        updatedData[i]["AfterY"] = updatedData[i]["AfterY"] + 10;
      }
    } else if (updatedData[i - 1]["AfterY"] - updatedData[i]["AfterY"] < 15) {
      updatedData[i]["AfterY"] = updatedData[i]["AfterY"] - 10;
    }
  }

  updatedData.sort(function(a, b) {
    return b.First - a.First;
  });

  // Create slopegraph labels
  svg
    .selectAll("text.labels")
    .data(updatedData)
    .enter()
    .append("text")
    .text(function(d) {
      return d.District;
    })
    .attr("class", function(d) {
      return "label " + d.Change;
    })
    .attr("text-anchor", "end")
    .attr("x", opts.margin.left * 0.6)
    .attr("y", function(d) {
      return opts.margin.top + chartHeight - d.BeforeY;
    })
    .attr("dy", ".35em");

  // Create slopegraph left value labels
  svg
    .selectAll("text.leftvalues")
    .data(updatedData)
    .enter()
    .append("text")
    .attr("class", function(d) {
      return d.Change;
    })
    .text(function(d) {
      return Math.round(d.First) + "%";
    })
    .attr("text-anchor", "end")
    .attr("x", opts.margin.left * 0.85)
    .attr("y", function(d) {
      return opts.margin.top + chartHeight - d.BeforeY;
    })
    .attr("dy", ".35em");

  // Create slopegraph left value labels
  svg
    .selectAll("text.rightvalues")
    .data(updatedData)
    .enter()
    .append("text")
    .attr("class", function(d) {
      return d.Change;
    })
    .text(function(d) {
      return Math.round(d.Last) + "%";
    })
    .attr("text-anchor", "start")
    .attr("x", chartWidth + opts.margin.right)
    .attr("y", function(d) {
      return opts.margin.top + chartHeight - d.AfterY;
    })
    .attr("dy", ".35em");

  // Create slopegraph lines
  svg
    .selectAll("line.slope-line")
    .data(updatedData)
    .enter()
    .append("line")
    .attr("class", function(d) {
      return "slope-line " + d.Change + " " + d.District;
    })
    .attr("x1", opts.margin.left)
    .attr("x2", chartWidth + opts.margin.right * 0.75)
    .attr("y1", function(d) {
      return opts.margin.top + chartHeight - vertScale(d.First);
    })
    .attr("y2", function(d) {
      return opts.margin.top + chartHeight - vertScale(d.Last);
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  // Create slopegraph left circles
  svg
    .selectAll("line.left-circle")
    .data(updatedData)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return d.Change;
    })
    .attr("cx", opts.margin.left)
    .attr("cy", function(d) {
      return opts.margin.top + chartHeight - vertScale(d.First);
    })
    .attr("r", 3);

  // Create slopegraph right circles
  svg
    .selectAll("line.left-circle")
    .data(updatedData)
    .enter()
    .append("circle")
    .attr("class", function(d) {
      return d.Change;
    })
    .attr("cx", chartWidth + opts.margin.right * 0.75)
    .attr("cy", function(d) {
      return opts.margin.top + chartHeight - vertScale(d.Last);
    })
    .attr("r", 3);

  // Create bottom area denoting years
  svg
    .append("line")
    .attr("x1", opts.margin.left)
    .attr("x2", opts.margin.left)
    .attr("y1", opts.height - opts.margin.bottom)
    .attr("y2", opts.height - opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  svg
    .append("line")
    .attr("x1", chartWidth + opts.margin.right * 0.75)
    .attr("x2", chartWidth + opts.margin.right * 0.75)
    .attr("y1", opts.height - opts.margin.bottom)
    .attr("y2", opts.height - opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  svg
    .append("line")
    .attr("x1", opts.margin.left)
    .attr("x2", chartWidth + opts.margin.right * 0.75)
    .attr("y1", opts.height - opts.margin.bottom * 0.7)
    .attr("y2", opts.height - opts.margin.bottom * 0.7)
    .attr("stroke", "grey")
    .attr("stroke-width", "2px");

  svg
    .append("text")
    .text("2004")
    .attr("class", "neutral")
    .attr("x", opts.margin.left)
    .attr("y", opts.height - opts.margin.bottom * 0.05)
    .attr("text-anchor", "start");

  svg
    .append("text")
    .text("2014")
    .attr("class", "neutral")
    .attr("x", chartWidth + opts.margin.right * 0.75)
    .attr("y", opts.height - opts.margin.bottom * 0.05)
    .attr("text-anchor", "end");

  //END OF DATA LOADING
});

function mouseover(d) {
  console.log(d);
  // let selectedDistrict = d.District;
  // console.log(d3.selectAll(".slope-line" + d.Change + selectedDistrict));
}

function mouseout(d) {
  console.log("You left!");
}
