var app=angular.module("ellis",[]);app.controller("AppController",["$scope","$http",function(a,b){a.start=function(){b.get("./data/evictions.json").success(function(c){a.evictions=c,angular.forEach(a.evictions,function(a){a.date=new Date(a.year,0,1)});var d=d3.min(a.evictions,function(a){return a.date});b.get("./data/prices.json").success(function(b){a.price_data={},angular.forEach(b,function(b,c){a.price_data[c]=[],angular.forEach(b,function(b){b.date=new Date(1e3*b.date),b.date>d&&a.price_data[c].push(b)})}),a.housing_series_shown={ellis:!0},a.price_series_shown="all"})})},a.seriesInfo={ellis:{name:"Ellis Act Evictions"},nofault:{name:"All No-Fault Evictions"},forcause:{name:"For Cause Evictions"}},a.priceInfo={all:{name:"All homes"},single:{name:"Single family"},"1bed":{name:"1 bedroom"},"2bed":{name:"2 bedroom"}},a.$watch("housing_series_shown",function(b){console.log("series=%o",b),a.showGraph()},!0),a.$watch("price_series_shown",function(b){console.log("price series=%o",b),a.showGraph()},!0),a.start(),a.getMinValueForSeriesShown=function(b){return d3.min(a.evictions,function(a){var c;return angular.forEach(b,function(b){var d=a[b];void 0!==d&&(c=void 0===c?d:Math.min(c,d))}),c})},a.getMaxValueForSeriesShown=function(b){return d3.max(a.evictions,function(a){var c;return angular.forEach(b,function(b){var d=a[b];void 0!==d&&(c=void 0===c?d:Math.max(c,d))}),c})};var c={};a.showGraph=function(){if(void 0!==a.evictions){var b=[];angular.forEach(a.housing_series_shown,function(a,c){a===!0&&b.push(c)});var d=800,e=400,f=20,g=70,h=d3.time.scale().domain([d3.min(a.evictions,function(a){return a.date}),d3.max(a.evictions,function(a){return a.date})]).rangeRound([g,d-2*g]),i=d3.scale.linear().domain([a.getMinValueForSeriesShown(b),a.getMaxValueForSeriesShown(b)]).range([e-2*f,f]);d3.svg.axis().scale(h).ticks(d3.time.year,1);var j=d3.svg.axis().scale(i).orient("left").tickSize(10),k=(d-2*g)/20;if(a.isSetUp){var l=d3.select("#graph svg");l.selectAll("g.x-axis");var m=l.selectAll("g.y-axis"),n=d3.selectAll("g.all_bars"),o=d3.selectAll("g.year_labels"),p=l.selectAll("line.x-line"),q=n.selectAll("g.year_group"),r=d3.select("div#tooltip"),s=d3.selectAll(".data-line")}else{graph_container=d3.select("#graph"),graph_container.html("");var l=graph_container.append("svg:svg").attr("width",d+2*g).attr("height",e+2*f),o=l.append("g").attr("class","year_labels"),s=l.append("svg:path").attr("class","data-line"),n=l.append("g").attr("class","all_bars"),q=n.selectAll("g").data(a.evictions).enter().append("g").attr("class","year_group"),r=graph_container.append("div").attr("id","tooltip"),p=l.append("line").attr("class","x-line").style("stroke","black").style("stroke-width","1"),m=l.append("g").attr("class","y-axis").attr("transform","translate("+g+","+f+")");l.append("text").attr("class","y-label").text("Evictions").attr("text-anchor","middle").attr("transform","translate(12,"+(e/2-f/2)+"), rotate(-90)"),a.isSetUp=!0}var t=o.selectAll("g").data(a.evictions).enter().append("g").attr("class","year_label");if(t.append("rect").attr("x",function(a){return h(a.date)}).attr("y",0).attr("fill",function(a,b){return b%2?"rgba(240,240,240,1)":"#fff"}).attr("width",k).attr("height",e-f),t.append("text").text(function(a){return d3.time.format("'%y")(a.date)}).attr("x",function(a){return h(a.date)+k/2}).attr("y",f+2).attr("text-anchor","middle"),d3.selectAll(".y-label-right").remove(),d3.selectAll(".y-axis-right").remove(),"none"!==a.price_series_shown){var u=function(a){return a.price},v=a.price_data[a.price_series_shown],w=d3.scale.linear().domain([d3.min(v,u),d3.max(v,u)]).range([e-2*f,f]),x=d3.svg.axis().scale(w).orient("right").ticks(10).tickFormat(function(a){return"$"+a/1e3+"K"}),y=l.append("g").attr("class","y-axis-right").attr("transform","translate("+(d-g)+","+f+")");y.call(x),l.append("text").attr("class","y-label-right").text("Median Home Price").attr("text-anchor","middle").attr("transform","translate("+d+", "+(e/2-f/2)+"), rotate(90)");var z=d3.svg.line().interpolate("cardinal").x(function(a){return h(a.date)}).y(function(a){return w(a.price)});s.transition().style("stroke-opacity",1).attr("d",z(v)).attr("stroke","blue").attr("fill","none")}else s.style("stroke-opacity",0);var A=k/b.length;angular.forEach(a.housing_series_shown,function(d,e){if(d===!1)d3.selectAll("rect."+e).remove(),c[e]=void 0;else{var g=c[e];void 0===g&&(g=q.append("rect").attr("class",e),c[e]=g),g.on("mousemove",function(b){r.style("visibility","visible"),r.style("top",event.clientY+"px"),r.style("left",event.clientX+6+"px");var c=Math.abs(b[e]);r.html("<strong>"+a.seriesInfo[e].name+" in "+b.year+':</strong><br/><span class="big-num">'+d3.format(",")(c)+"</span>")}).on("mouseout",function(){r.style("visibility","hidden")}).transition().attr("height",function(a){return Math.abs(i(a[e]?a[e]:0)-i(0))}).attr("x",function(a){return h(a.date)+A*b.indexOf(e)}).attr("y",function(a){var b=a[e];if(0>=b)return i(0)+f;i(b);var c=Math.abs(i(b)-i(0));return i(0)-c+f}).attr("width",function(){return A-1})}}),m.transition().call(j),p.transition().attr("x1",g).attr("x2",d-g).attr("y1",i(0)+f).attr("y2",i(0)+f)}}}]);