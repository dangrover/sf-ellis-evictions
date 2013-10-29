var app = angular.module('ellis', []);
app.controller('AppController', ['$scope', '$http',
    function($scope, $http) {

        $http.get('./data/ellis.json').success(function(data) {
            $scope.ellis_evictions = data;
            console.log("data=%o", data);
            $scope.showGraph('month', 'petitions');
        });

        $scope.classForTypeButton = function(type) {
            return [($scope.type == type) ? 'active' : '', 'btn', 'btn-small'];
        }

        $scope.showGraph = function(coalesce, type) {
            $scope.coalesce = coalesce;
            $scope.type = type;

            var w = 700,
                h = 300,
                vMargin = 20,
                hMargin = 40;

            if (!$scope.isSetUp) {
                graph_container = d3.select("#graph");
                graph_container.html("");

                var svg = graph_container.append("svg:svg").
                attr("width", w).
                attr("height", h + 100);

                svg.append("g").attr('class', 'bars');

                $scope.isSetUp = true;
            } else {
                var svg = d3.select("#graph svg");
            }

            // reformat the data slightly
            var by_month = [];
            angular.forEach($scope.ellis_evictions, function(months, year) {
                angular.forEach(months, function(data, month) {
                    var date = new Date(parseInt(year), parseInt(month));
                    by_month.push({
                        date: date,
                        units: data[1],
                        petitions: data[0]
                    });
                });
            });

            var xScale = d3.time.scale()
                .domain([by_month[0].date,
                    by_month[by_month.length - 1].date
                ])
                .rangeRound([0, w - hMargin * 2]);

            //  .rangeRound([0, w - hMargin*2]).ticks(20);
            //     .ticks(10);

            var yScale = d3.scale.linear()
                .domain([0, d3.max(by_month, function(d) {
                    return d[type];
                })])
                .range([h - vMargin * 2, vMargin]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(d3.time.month, 6)
                .tickFormat(d3.time.format('%m/%y'))
                .tickSize(0)
                .tickPadding(8);

            var yAxisForEllis = d3.svg.axis()
                .scale(yScale)
                .orient('left');

            var bars_group = d3.selectAll("g.bars");

            bars_group.selectAll("rect").remove();
            
            bars_group.selectAll("rect").data(by_month).enter().append("rect")
                .attr("width", 1)
                .transition()
                .attr('y', function(d) {
                    return h - (vMargin) - (h - (vMargin * 2) - yScale(d[type]))
                })
                .attr('height', function(d, i) {
                    return h - (vMargin * 2) - yScale(d[type]);
                })
                .attr('x', function(d, i) {
                    return hMargin + Math.round(xScale(d.date));
                });

                svg.selectAll("g.x-axis").remove();
                svg.selectAll("g.y-axis").remove();

            // X axis elements
            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', 'translate(' + hMargin + ', ' + (h - vMargin) + ')')
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dy", "-.5em")
                .attr('dx', "-1em")
                .attr("transform", "rotate(-80)")
                .call(xAxis);


            svg.append('g')
                .attr('class', 'y-axis').attr('transform', 'translate(' + hMargin + ',' + vMargin + ')')
                .call(yAxisForEllis);
        };
    }
]);