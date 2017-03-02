var cellSize = 8,
    width = 750,
    height = 750;

var calcType = "returns";
var fname = "ff-mkt.json";

// colors generated by colorbrewer:
var colorScale = d3.scale.linear()
    .domain([-2, -1, 0, 1, 2, 3])
    .range(["#ca0020", "#f4a582","#f7f7f7","#d1e5f0","#67a9cf", "#2166ac"]);

var svg = d3.select("div#heatmap")
    .append("svg")
      .attr("width", width)
      .attr("height", height);

d3.selectAll("input[name=datasource]")
  .data(["ff-mkt.json", "ff-smb.json", "ff-hml.json"])
    .on("change", function(newFname) {
      fname = newFname;
      execute();
    });

d3.selectAll("input[name=calculation]")
  .data(["returns", "stdev", "sharpe"])
    .on("change", function(newCalcType) {
      calcType = newCalcType;
      execute();
    });

function scoreStdev(s) {
  if (s > .25) {
    return -2; // extreme volatility
  } else if (s > 0.19) {
    return -1; // very high volatility
  } else if (s > 0.18) {
    return 0; // high volatility
  } else if (s > 0.16) {
    return 1; // moderate volatility
  } else if (s > 0.14) {
    return 2; // low volatility
  } else {
    return 3; // no volatility
  }
}

function scoreSharpe(r) {
  if (r < 4.5) {
    return -2; // large loss
  } else if (r < 5.5) {
    return -1; // small loss
  } else if (r < 6.5) {
    return 0; // flat
  } else if (r < 7) {
    return 1; // small gain
  } else if (r < 7.5) {
    return 2; // medium gain
  } else {
    return 3; // large gain
  }
}

function scoreReturn(r) {
  if (r < .97) {
    return -2; // large loss
  } else if (r < 1.00) {
    return -1; // small loss
  } else if (r < 1.03) {
    return 0; // flat
  } else if (r < 1.06) {
    return 1; // small gain
  } else if (r < 1.09) {
    return 2; // medium gain
  } else {
    return 3; // large gain
  }
}

function calc(timeseries) {
  var grid = [];

  for (var i=0; i<timeseries.length; i++) {
    var start = timeseries[i];
    var mean = 0;
    var hold = 0;
    var M2 = 0;
    var cumr = 1;
    for (var j=i; j<timeseries.length; j++) {
      var point = timeseries[j];
      cumr *= 1 + point.r;
      hold += 1;
      var delta = point.r - mean;
      mean += delta / hold;
      M2 += delta * (point.r - mean);
      var stdev = Math.sqrt(M2 / (hold - 1));
      var geomean = Math.pow(cumr, 1/hold);
      var sharpe = geomean / stdev;
      var score = calcType == "returns" ? scoreReturn(geomean) : calcType == "stdev" ? scoreStdev(stdev) : scoreSharpe(sharpe);
      var cell = { "start": start.dt, "end": point.dt, "cumr": cumr, "mean": mean, "sharpe": sharpe, "stdev": stdev, "geomean": geomean, "score": score };
      if (j > i) {
        grid.push(cell);
      }
    }
  }

  return grid;
}

function render(data) {
  if (data === null || data.length === 0) {
    return;
  }

  var first = data[0].start;

  // first, remove old chart if one exists:
  svg.select("g").remove();

  // now add a new chart:
  var svgdata = svg.append("g").selectAll()
      .data(data, function(d) { return d.start + ':' + d.end; });

  svgdata.enter().append("svg:rect")
      .attr("x", function(d) { return (d.end - first) * cellSize; })
      .attr("y", function(d) { return (first - d.start) * cellSize + height; })
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", function(d) { return colorScale(d.score); });
}

function execute() {
  d3.json(fname, function(error, data) {
    render(calc(data));
  });
}

execute();
