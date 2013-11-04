app.controller('AppController', ['$scope', '$http',
    function($scope, $http) {

        $scope.start = function(){
            $http.get('./data/ellis.json').success(function(data) {
                $scope.ellis_evictions = data;
                $http.get('./data/inventory.json').success(function(data) {
                    $scope.housing_inventory = data;


                    // coalesce the evictions by year
                    $scope.all_data = [];
                    var year_index = {};
                    angular.forEach($scope.ellis_evictions, function(months, year) {
                        var int_year = parseInt(year);
                        var this_year = {'year':int_year, 
                                         'date':new Date(int_year, 0, 1), 
                                         'withdrawn':0, 
                                         'withdrawn-petitions':0};

                        angular.forEach(months, function(data, month) {
                            this_year['withdrawn'] += data[1];
                            this_year['withdrawn-petitions'] += data[0];
                        });

                        $scope.all_data.push(this_year);
                        year_index[int_year] = this_year;
                    });

                    // add in the inventory data
                    angular.forEach($scope.housing_inventory, function(info, index){
                        if(year_index[info.year] === undefined) return; // skip years we're not showing withdrawls for

                        angular.forEach(info, function(value, key){
                            if(key !== 'year') year_index[info.year][key] = value;
                        });
                    });

                    // now adjust the polarity of things and get min/max
                    angular.forEach($scope.all_data, function(info, index){
                        info.withdrawn *= -1;
                        info.demolished *= -1;
                    });


                    $scope.housing_series_shown = {'withdrawn':true, 'demolished': true}; 
                    
                });
            });
        };

        $scope.seriesInfo = {
            'withdrawn':{name:'Withdrawn (Ellis)'},
            'authorized':{name:'Construction Authorized'},
            'completed':{name:'Construction Completed'},
            'demolished':{name:'Demolished'},
            'altered':{name:'+/- from Alterations'}
        };


        $scope.$watch('housing_series_shown', function(newVal, oldVal){
            console.log("series=%o", newVal);
            $scope.showGraph();
        }, true);

        $scope.start();
        
        $scope.getMinValueForSeriesShown = function(showingSeriesIds){
            return d3.min($scope.all_data, function(e){
                                    var theMin;
                                    angular.forEach(showingSeriesIds, function(seriesId, index){
                                        var val = e[seriesId];
                                        if(val !== undefined){
                                            theMin = (theMin === undefined) ? val : Math.min(theMin, val);
                                        }
                                    });
                                    return theMin;});
        };

        $scope.getMaxValueForSeriesShown  = function(showingSeriesIds){
            return d3.max($scope.all_data, function(e){
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
            if($scope.all_data === undefined) return;

            // make a list of the series we're showing.
            var showingSeriesIds = [];
            angular.forEach($scope.housing_series_shown, function(value, key){if(value === true) showingSeriesIds.push(key);});
            console.log("we are showing the series: %o", showingSeriesIds);

            var w = 800, h = 400, vMargin = 20, hMargin = 70;

            var xScale = d3.time.scale()
            .domain([d3.min($scope.all_data, function(e){return e.date;}),
                     d3.max($scope.all_data, function(e){return e.date;})])
            .rangeRound([hMargin, w - (hMargin * 2)]);

            var yScale = d3.scale.linear()
            .domain([$scope.getMinValueForSeriesShown(showingSeriesIds),
                     $scope.getMaxValueForSeriesShown(showingSeriesIds)])
                .range([h - (vMargin * 2), vMargin]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(d3.time.year,1);

            var yAxisForEllis = d3.svg.axis()
                .scale(yScale)
                .orient('left').tickSize(10);

           var widthForYear = (w - (hMargin * 2)) / 20; // TODO get num of years dynamically


            if (!$scope.isSetUp) {
                graph_container = d3.select("#graph");
                graph_container.html("");

                var svg = graph_container.append("svg:svg").attr("width", w + (hMargin*2)).attr("height", h + (vMargin*2));

                 var year_labels_group = svg.append("g").attr('class', 'year_labels');

                var all_bars_group = svg.append("g").attr('class', 'all_bars');


                var each_year = all_bars_group.selectAll('g').data($scope.all_data).enter().append('g').attr('class','year_group');

                var tooltip = graph_container.append("div").attr("id","tooltip"); // Hovering tooltip
               
                var xLine = svg.append('line')
                .attr('class','x-line')
                .style('stroke', 'black')
                .style('stroke-width', '1');
                
                var yAxisDisplay =  svg.append('g')
                .attr('class', 'y-axis').
                attr('transform', 'translate(' + hMargin + ',' + vMargin + ')');

                // y axis label
                svg.append("text")
                .attr("class", "y-label")
                .text("Change in Housing Units")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(12,"+((h/2)-(vMargin/2))+"), rotate(-90)");

                $scope.isSetUp = true;
            } else {
                var svg = d3.select("#graph svg");
                var xAxisDisplay =  svg.selectAll("g.x-axis");
                var yAxisDisplay = svg.selectAll('g.y-axis');
                var all_bars_group = d3.selectAll("g.all_bars");
                var year_labels_group = d3.selectAll('g.year_labels');
                var xLine = svg.selectAll('line.x-line');

                var each_year = all_bars_group.selectAll('g.year_group');
                var tooltip =d3.select('div#tooltip');
            }

            // make some year labels
            var year_labels = year_labels_group.selectAll('g').data($scope.all_data).enter().append('g').attr('class','year_label');

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

            


           // each_year.selectAll('rect').remove();

            var unitsBarWidth = widthForYear / showingSeriesIds.length;
           angular.forEach($scope.housing_series_shown, function(shownNow, seriesId){
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
                        
                        tooltip.style("left", (event.pageX + 6) + "px");


                        var thisVal = Math.abs(d[seriesId]);
                        var smallPart = 'units';

                        if(i > 0){
                            var prevVal = Math.abs($scope.all_data[i-1][seriesId]);
                            var pctChange = Math.round(((thisVal/prevVal)*100) - 100);
                            var symbol = (pctChange > 0) ? '\u25B2' : '\u25BC';
                            smallPart += ' ('+symbol+Math.abs(pctChange)+'%)';
                        }

                        tooltip.html( '<strong>'+$scope.seriesInfo[seriesId].name+' in '+d.year+':</strong><br/>'
                                     +'<span class="big-num">'+d3.format(',')(thisVal)+'<small>'+smallPart+'</small></span>');

                    })
                    .on("mouseout", function(el) {
                        tooltip.style("visibility", "hidden");
                    })
                    .transition()
                    .attr('height', function(d, i) {
                        return Math.abs(yScale(d[seriesId] ? d[seriesId] : 0) - yScale(0));
                    })
                    .attr('x', function(d, i) {
                        return  xScale(d.date) + (unitsBarWidth*showingSeriesIds.indexOf(seriesId));
                    })
                    .attr('y', function(d, i){
                        var val = d[seriesId];
                        //console.log('val=%o', val);
                        if(val <= 0){ // if it's negative, the top of the rect is on the baseline.
                            return yScale(0) + vMargin;
                        }else{ // if it's positive, the top of the rect is the baseline minus the actual height
                            var valueY = yScale(val);
                           
                            var heightUsed = Math.abs(yScale(val) - yScale(0));
                            return yScale(0) - heightUsed + vMargin;
                        }
                    })
                    .attr('width', function(d, i){
                        return unitsBarWidth;
                    });
                }
           });

         yAxisDisplay.transition().call(yAxisForEllis);

         xLine.transition().attr('x1', hMargin)
                .attr('x2', w-(hMargin))
                .attr('y1', yScale(0) + vMargin)
                .attr('y2', yScale(0) + vMargin);

        };
    }
]);