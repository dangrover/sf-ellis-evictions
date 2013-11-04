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


                    $scope.housing_series_shown['withdrawn'] = true;
                    
                });
            });
        };

        $scope.seriesInfo = {
            'withdrawn':{},
            'authorized':{},
            'constructed':{},
            'demolished':{},
            'altered':{}
        };

        $scope.housing_series_shown = {};
        

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

        $scope.showGraph = function() {
            if($scope.all_data === undefined) return;

            // make a list of the series we're showing.
            var showingSeriesIds = [];
            angular.forEach($scope.housing_series_shown, function(value, key){if(value === true) showingSeriesIds.push(key);});
            console.log("we are showing the series: %o", showingSeriesIds);

            var w = 800, h = 550, vMargin = 10, hMargin = 60;

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
                .orient('bottom')
                .ticks(d3.time.year,1)
                .tickFormat(d3.time.format("'%y"));

            var yAxisForEllis = d3.svg.axis()
                .scale(yScale)
                .orient('left').tickSize(10);

           var widthForYear = Math.floor(w - (hMargin * 2)) / 20; // TODO get num of years dynamically
           var unitsBarWidth = Math.floor(widthForYear / showingSeriesIds.length);


            if (!$scope.isSetUp) {
                graph_container = d3.select("#graph");
                graph_container.html("");

                var svg = graph_container.append("svg:svg").attr("width", w).attr("height", h + 100);

                var all_bars_group = svg.append("g").attr('class', 'all_bars');

                var xAxisDisplay = svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', 'translate(' + vMargin +', ' + (vMargin + yScale(0)) + ')')
                .call(xAxis);
        
                var yAxisDisplay =  svg.append('g')
                .attr('class', 'y-axis').
                attr('transform', 'translate(' + hMargin + ',' + vMargin + ')');

                $scope.isSetUp = true;
            } else {
                var svg = d3.select("#graph svg");
                var xAxisDisplay =  svg.selectAll("g.x-axis");
                var yAxisDisplay = svg.selectAll('g.y-axis');
                var all_bars_group = d3.selectAll("g.all_bars");
            }

            all_bars_group.selectAll('g.year_group').remove();
            var in_year = all_bars_group.selectAll('g').data($scope.all_data).enter().append('g').attr('class','year_group');

            angular.forEach(showingSeriesIds, function(seriesId, seriesIndex){
                in_year.append('rect')
                .attr('class', seriesId)
                .transition()
                .attr('height', function(d, i) {
                    return Math.abs(yScale(d[seriesId] ? d[seriesId] : 0) - yScale(0));
                })
                .attr('x', function(d, i) {
                    return  xScale(d.date) + (unitsBarWidth*seriesIndex);
                })
                .attr('y', function(d, i){
                    var val = d[seriesId];
                    console.log('val=%o', val);
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

            });
            console.log("in_year = %o", yScale);



        xAxisDisplay.selectAll("text")
         .style("text-anchor", "middle")
         .attr("top", '0px')
         .attr("dx", "18px");

         yAxisDisplay.transition().call(yAxisForEllis);
        };
    }
]);