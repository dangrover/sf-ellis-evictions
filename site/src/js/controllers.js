app.controller('AppController', ['$scope', '$http',
    function($scope, $http) {

        $scope.start = function(){
            $http.get('./data/evictions.json').success(function(data) {
                $scope.evictions = data;
     
                angular.forEach($scope.evictions, function(data, index){
                    data.date = new Date(data.year, 0, 1); // create JS dates for the eviction dates
                });
                var evictionsStartDate = d3.min($scope.evictions, function(e){return e.date;});

                // get price data
                $http.get('./data/prices.json').success(function(data){
                    $scope.price_data = {};

                    angular.forEach(data, function(prices, type){
                        $scope.price_data[type] = [];
                        angular.forEach(prices, function(d, index){
                            d.date = new Date(d.date*1000); // create JS dates for the pricing dates
                            if(d.date > evictionsStartDate){
                                $scope.price_data[type].push(d);
                            }
                        });

                    });

                    $scope.evictions_series_shown = {'ellis':true}; 
                    $scope.price_series_shown = 'all';
                });
            });
        };

        $scope.seriesInfo = {
            'ellis':{name:'Ellis Act Evictions'},
            'nofault':{name:'All No-Fault Evictions'},
            'forcause':{name:'For Cause Evictions'}
        };

        $scope.priceInfo = {
            'all':{name:'All homes'},
            'single':{name:'All single-family homes'},
            'condo':{name:'All condos/co-ops'},
            '1bed':{name:'1 bedroom'},
            '2bed':{name:'2 bedrooms'},
            '3bed':{name:'3 bedrooms'}
        };

        $scope.$watch('evictions_series_shown',function(){$scope.showGraph();}, true);
        $scope.$watch('price_series_shown',function(){$scope.showGraph();}, true);
        $scope.start();

        $scope.getMaxValueForSeriesShown  = function(showingSeriesIds){
            return d3.max($scope.evictions, function(e){
                                    var theMax;
                                    angular.forEach(showingSeriesIds, function(seriesId, index){
                                        var val = e[seriesId];
                                        if(val !== undefined){
                                            theMax = (theMax === undefined) ? val : Math.max(theMax, val);
                                        }
                                    });
                                    return theMax;});
        };

        var existingBars = {};
  

        $scope.showGraph = function() {
            if($scope.evictions === undefined) return;

            // make a list of the series we're showing.
            var showingSeriesIds = [];
            angular.forEach($scope.evictions_series_shown, function(value, key){if(value === true) showingSeriesIds.push(key);});

            var w = 730, h = 400, vMargin = 20, hMargin = 70;

            var xScale = d3.time.scale()
            .domain([d3.min($scope.evictions, function(e){return e.date;}),
                     d3.max($scope.evictions, function(e){return e.date;})])
            .rangeRound([hMargin, w - (hMargin * 2)]);

            var yScaleForEllis = d3.scale.linear()
            .domain([0,$scope.getMaxValueForSeriesShown(showingSeriesIds)])
            .range([h - (vMargin * 2), vMargin]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(d3.time.year,1);

            var yAxisForEllis = d3.svg.axis()
                .scale(yScaleForEllis)
                .orient('left').tickSize(10);

           var widthForYear = (w - (hMargin * 2)) / 20; // TODO get num of years dynamically


            if (!$scope.isSetUp) {
                graph_container = d3.select("#graph");
                graph_container.html("");

                var svg = graph_container.append("svg:svg").attr("width", w + (hMargin*2)).attr("height", h + (vMargin*2));
                svg.append("g").attr('class', 'year_labels');
                svg.append("svg:path").attr("class", "data-line");
                var all_bars_group = svg.append("g").attr('class', 'all_bars');
                all_bars_group.selectAll('g').data($scope.evictions).enter().append('g').attr('class','year_group');
                graph_container.append("div").attr("id","tooltip"); // Hovering tooltip
               
                svg.append('line').attr('class','x-line')
                .style('stroke', 'black')
                .style('stroke-width', '1')
                .attr('x1', hMargin)
                .attr('x2', w-(hMargin))
                .attr('y1', yScaleForEllis(0) + vMargin)
                .attr('y2', yScaleForEllis(0) + vMargin);
                
                svg.append('g').attr('class', 'y-axis').
                attr('transform', 'translate(' + hMargin + ',' + vMargin + ')');

                svg.append('g').attr('class', 'y-axis-right').
                attr('transform', 'translate(' + (w - hMargin) + ',' + vMargin + ')');

                 svg.append("text")
                .attr("class", "y-label-right")
                .text("Median Home Price")
                .attr("text-anchor", "middle")
                .attr("transform", "translate("+(w)+", "+((h/2)-(vMargin/2))+"), rotate(90)");

                // y axis label
                svg.append("text")
                .attr("class", "y-label")
                .text("Evictions")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(12,"+((h/2)-(vMargin/2))+"), rotate(-90)");

                $scope.isSetUp = true;
            }

            var svg = d3.select("#graph svg");
            var xAxisDisplay =  svg.selectAll("g.x-axis");
            var yAxisLeftDisplay = svg.selectAll('g.y-axis');
            var yAxisRightDisplay = svg.selectAll('g.y-axis-right');
            var yLabelRight = svg.selectAll('text.y-label-right');
            var all_bars_group = d3.selectAll("g.all_bars");
            var year_labels_group = d3.selectAll('g.year_labels');
            var xLine = svg.selectAll('line.x-line');

            var each_year = all_bars_group.selectAll('g.year_group');
            var tooltip = d3.select('div#tooltip');
            var path = d3.selectAll('.data-line');

            // YEAR LABELS
            var year_labels = year_labels_group.selectAll('g').data($scope.evictions).enter().append('g').attr('class','year_label');

            year_labels.append('rect')
            .attr('x',function(d,i){return xScale(d.date);})
            .attr('y', 0)
            .attr('fill', function(d,i){return (i % 2) ? 'rgba(240,240,240,1)' : '#fff';})
            .attr('width',widthForYear)
            .attr('height', h - vMargin);

            year_labels.append('text').text(function(d){return d3.time.format('\'%y')(d.date);})
            .attr('x',function(d,i){return xScale(d.date)+(widthForYear/2);})
            .attr('y', vMargin+2)
            .attr('text-anchor','middle');

            // HOUSING PRICE DATA
            d3.selectAll('.y-label-right').remove();

            if($scope.price_series_shown !== 'none'){
                // make new the Y scale
                var getPrice = function(d){return d.price;};
                var data = $scope.price_data[$scope.price_series_shown];
                var priceYScale = d3.scale.linear()
                .domain([d3.min(data, getPrice),d3.max(data, getPrice)])
                .range([h - (vMargin * 2), vMargin]);

                var priceYAxis = d3.svg.axis()
                    .scale(priceYScale)
                    .orient('right').ticks(10).tickFormat(function(d){return '$'+(d/1000)+'K';});

                yAxisRightDisplay.style('display', 'inherit');
                yAxisRightDisplay.transition().call(priceYAxis);

        
                var line = d3.svg.line()
                            .interpolate("cardinal")
                            .x(function(d, i) { return xScale(d.date);})
                            .y(function(d, i) { return priceYScale(d.price);});

                path.transition().style("display", 'inherit').attr("d",line(data)).attr("stroke", 'blue').attr('fill', 'none');

            }
            else{ // get rid of the secondary Y axis
                path.style('display', 'none');
                yAxisRightDisplay.style('display', 'none');
            }

        // EVICTIONS DATA
          var unitsBarWidth = (widthForYear / showingSeriesIds.length);
           angular.forEach($scope.evictions_series_shown, function(shownNow, seriesId){
                if(shownNow === false){ // REMOVE THIS BAR
                    d3.selectAll('rect.'+seriesId).remove();
                    existingBars[seriesId] = undefined;
                }
                else{ // MAKE OR UPDATE A BAR FOR THIS DATUM
                     var this_bar = existingBars[seriesId];

                    if(this_bar === undefined){
                        this_bar = each_year.append('rect').attr('class', seriesId);
                        existingBars[seriesId] = this_bar;
                    }
                    
                    this_bar.on("mousemove", function(d, i) {
                        tooltip.style("visibility", "visible");
                        tooltip.style("top", event.clientY + "px");
                        tooltip.style("left", (event.clientX + 6) + "px");
                        tooltip.html( '<strong>'+$scope.seriesInfo[seriesId].name+' in '+d.year+':</strong><br/>'
                                     +'<span class="big-num">'+d3.format(',')(Math.abs(d[seriesId]))+'</span>');
                    })
                    .on("mouseout", function(el) {
                        tooltip.style("visibility", "hidden");
                    })
                    .transition()
                    .attr('height', function(d, i) {
                        return Math.abs(yScaleForEllis(d[seriesId] ? d[seriesId] : 0) - yScaleForEllis(0));
                    })
                    .attr('x', function(d, i) {
                        return  xScale(d.date) + (unitsBarWidth*showingSeriesIds.indexOf(seriesId));
                    })
                    .attr('y', function(d, i){
                        var heightUsed = Math.abs(yScaleForEllis(d[seriesId]) - yScaleForEllis(0));
                        return yScaleForEllis(0) - heightUsed + vMargin;
                    })
                    .attr('width', function(d, i){
                        return unitsBarWidth - 1;
                    });
                }
           });

             yAxisLeftDisplay.transition().call(yAxisForEllis);
             
            };
    }
]);