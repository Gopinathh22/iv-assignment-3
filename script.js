/* Set the time format
  Ref: https://github.com/d3/d3-time-format */
const parseTime = d3.timeParse("%Y-%m-%d");

/* Load the dataset and formatting variables
  Ref: https://www.d3indepth.com/requests/ */
d3.csv("./data.csv", d => {
  return {
    date: parseTime(d.date),
    category: d.category,
    value: +d.value
  }
}).then(data => {
  // Print out the data on the console
  console.log(data);

  /* Data Manipulation in D3 
    Ref: https://observablehq.com/@d3/d3-extent?collection=@d3/d3-array */

  // Define colors for the 4 categories
  // "Female - Amount Paid", "Female - Bill Statement", "Male - Amount Paid", "Male - Bill Statement"
  const categories = Array.from(new Set(data.map(d => d.category))).sort();
  
  // Move the color scale here to share with both charts
  const colors = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);

  // Plot the line chart
  createLineChart(data, colors);
});

const createLineChart = (data, colors) => {
  /* Set the dimensions and margins of the graph
    Ref: https://observablehq.com/@d3/margin-convention */
  const width = 900, height = 400;
  const margins = {top: 20, right: 120, bottom: 40, left: 60};

  /* Create the SVG container */
  const svg = d3.select("#line")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  /* Define x-axis, y-axis, and color scales
    Ref: https://observablehq.com/@d3/introduction-to-d3s-scales */
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margins.left, width - margins.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height - margins.bottom, margins.top]);

  /* Construct a line generator
    Ref: https://observablehq.com/@d3/line-chart and https://github.com/d3/d3-shape */
  const line = d3.line()
    .curve(d3.curveLinear)
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

  /* Group the data for each category
    Ref: https://observablehq.com/@d3/d3-group */
  const group = d3.group(data, d => d.category);
  console.log(group);

  /* Draw a line path for each category */
  const path = svg.append("g")
    .selectAll("path")
    .data(group)
    .join("path")
      .attr("d", ([i, d]) => line(d))
      .style("fill", "transparent")
      .style("stroke", ([i, d]) => colors(i))
      .style("stroke-width", 2);

  /* Add animation to the lines */
  const transitionPath = d3.transition()
      .ease(d3.easeSin)
      .duration(2500);

  path.attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .attr("stroke-dasharray", function() { return this.getTotalLength(); })
      .transition(transitionPath)
      .attr("stroke-dashoffset", 0);

  /* Add the tooltip when hover on the line */
  path.append('title').text(([i, d]) => i);

  /* Create the x and y axes and append them to the chart
    Ref: https://www.d3indepth.com/axes/ and https://github.com/d3/d3-axis */
  const yAxis = d3.axisLeft(yScale);
  
  const yGroup = svg.append("g")
    .attr("transform", `translate(${margins.left}, 0)`)
    .call(yAxis);
    
  // Add Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Amount (NT Dollar)");

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"));

  const xGroup = svg.append("g")
    .attr("transform", `translate(0,${height - margins.bottom})`)
    .call(xAxis);

  /* Add text labels on the right of the chart */
  // We want labels at the last data point (Sept 2005)
  const lastDate = d3.max(data, d => d.date);
  const dataLast = data.filter(d => d.date.getTime() === lastDate.getTime());
  
  svg.selectAll('text.label')
    .data(dataLast)
    .join('text')
      .attr('class', 'label')
      .attr('x', width - margins.right + 5)
      .attr('y', (d, i) => yScale(d.value) + i * 3)
      .attr('dy', '0.35em')
      .style('font-family', 'sans-serif')
      .style('font-size', 12)
      .style('fill', d => colors(d.category))
    .text(d => d.category);
}
