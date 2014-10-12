

angular.module( 'ngEbola', ['ngEbola.service'])
    .controller('mainCtrl', ['$scope','notify', function ($scope, notify) {
        $scope.init = function() {
            $scope.day = 0;
        };
        $scope.callNotify = function(day) {
            if (day.x > 0 && day.x < 440) {
                notify(day).then(function success(data) {
                    $scope.dataOfDay = data[parseInt(day.x/10)];
                    (function() {
                        mapColors($scope.dataOfDay);
                    }())
                }, function error(msg) {
                    console.error(msg);
                });
            }
        };

        function drawMap(state) {
            d3.json("world.json", function(error, world) {
                console.log(world);

                //Define Dimensions
                var width = 800;
                var height = 400;

                var projection = d3.geo.mercator()
                    .translate([width / 2, height / 2])
                    .scale((width - 1) / 0.2 / Math.PI);

                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, 6])
                    .on("zoom", zoomed);

                var path = d3.geo.path()
                    .projection(projection);

                var svg = d3.select(".map")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr('transform', 'translate(0,200)');

                var g = svg.append('g');

                svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height);

                svg.call(zoom).call(zoom.event);

                //Generate Countries
                g.selectAll(".subunit")
                    .data(topojson.feature(world, world.objects.subunits).features)
                    .enter().append("path")
                    .attr("class", function(d) { return "country " + d.id; })
                    .attr("d", path);

                g.selectAll(".heatmap")
                    .data(topojson.feature(world, world.objects.subunits).features)
                    .enter().append("path")
                    .attr("class", function(d) { return "heatmap " + d.id; })
                    .attr("d", path)
                    .attr('fill', 'rgba(255,0,0,1)')
                    .attr('opacity', 0);

                //Generate Labels
                g.selectAll(".subunit-label")
                    .data(topojson.feature(world, world.objects.subunits).features)
                    .enter().append("text")
                    .attr("class", function(d) { return "subunit-label " + d.id; })
                    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
                    .attr("dy", ".15em")
                    .text(function(d) { return d.properties.name; });

                //Place Labels
                g.selectAll(".subunit-label")
                    .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
                    .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });

                d3.select(self.frameElement).style("height", height + "px");

                function zoomed() {
                    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }
            });
        }

//D3 Timeline
        function drawTimeline() {
            d3.json('ebola-300914.json', function(error, ebola) {
                console.log(ebola);
                var width = ebola.length * 10;
                var height = 200;
                var parseDate = d3.time.format("%Y-%m-%d").parse;

                var x = d3.time.scale().domain([new Date(ebola[0].Date), new Date(ebola[42].Date)]).range([0, width]);
                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(10)
                    .tickPadding(-10)
                    .tickSize(6)
                    .tickFormat(d3.time.format("%B"));

                var yAxis = d3.svg.axis().scale(y)
                    .orient("left").ticks(5);

                var svg = d3.select(".timeline")
                    .append("svg")
                    .attr("width", width + 20)
                    .attr("height", height)
                    .append("g");

                var slider = svg.selectAll('g')
                    .data([{x: 100, y : 20}])
                    .enter()
                    .append('g')
                    .attr("height", 200)
                    .attr("widht", width)
                    .attr("transform", "translate(10,10)");

                var tickers = slider.append('g')
                    .attr('class', 'tickergroup')
                    .attr('transform', 'translate(0,20)')
                    .call(xAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.9em")
                        .attr("dy", "1em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                    });




                //Drag Behavior
                var drag = d3.behavior.drag()
                    .origin(Object)
                    .on("drag", dragMove);

                var sliderPath = slider
                    .append('rect')
                    .attr('y', 17)
                    .attr("width", width);

                function dragMove(d) {
                    d3.select(this)
                        .attr("cx", (d.x = Math.max(0, Math.min(width, d3.event.x))))
                        .attr("cy", d.y = 20);
                    $scope.callNotify(d);

                }

                slider.append("circle")
                    .attr("r", 5)
                    .attr("cx", function(d) { return d.x })
                    .attr("cy", function(d) { return d.y; })
                    .attr("fill", "#dddddd")
                    .attr("stroke", "#222222")
                    .attr("stroke-width", "3px")
                    .call(drag);
            });
        }

        function mapColors(state) {
            var GIN = d3.select('.heatmap.GIN');
            var LIB = d3.select('.heatmap.LBR');
            var NER = d3.select('.heatmap.NGE');
            var SLE = d3.select('.heatmap.SLE');
            var SEN = d3.select('.heatmap.SEN');

            GIN.attr('opacity', state.GuinDeath/600);
            LIB.attr('opacity', state.LibDeath/600);
            NER.attr('opacity', state.NigDeath/600);
            SLE.attr('opacity', state.SLDeath/600);
            SEN.attr('opacity', state.SenDeath/600);
        }

        drawMap();
        drawTimeline();
    }]);



//D3Map
