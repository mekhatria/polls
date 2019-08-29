export default {
  pieChart: function(x, y) {
    Highcharts.chart('containerPolls', {
      chart: {
        type: 'pie'
      },
      title: {
        text: null
      },
      xAxis: {
        labels: {
          enabled: false
        }
      },
      yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
          text: 'Polls result'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 0,
          borderColor: null,
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color:
                (Highcharts.theme && Highcharts.theme.contrastTextColor) ||
                'black'
            }
          }
        }
      },
      series: [
        {
          name: 'Pets',
          innerSize: '60%',
          colorByPoint: true,
          data: [
            {
              name: 'Cat',
              y: y,
              color: 'rgba(74,131,240,0.80)'
            },
            {
              name: 'Dog',
              y: x,
              color: 'rgba(220,71,71,0.80)'
            }
          ]
        }
      ]
    });
  },

  mapChart: function(mapData) {
    var maxVotes = 10,
      catColor = 'rgba(74,131,240,0.80)',
      dogColor = 'rgba(220,71,71,0.80)';

    Highcharts.seriesType(
      'mappie',
      'pie',
      {
        center: null, // Can't be array by default anymore
        clip: true, // For map navigation
        provinces: {
          hover: {
            halo: {
              size: 5
            }
          }
        },
        dataLabels: {
          enabled: false
        }
      },
      {
        getCenter: function() {
          var options = this.options,
            chart = this.chart,
            slicingRoom = 2 * (options.slicedOffset || 0);
          if (!options.center) {
            options.center = [null, null]; // Do the default here instead
          }
          // Handle lat/lon support
          if (options.center.lat !== undefined) {
            var point = chart.fromLatLonToPoint(options.center);
            options.center = [
              chart.xAxis[0].toPixels(point.x, true),
              chart.yAxis[0].toPixels(point.y, true)
            ];
          }
          // Handle dynamic size
          if (options.sizeFormatter) {
            options.size = options.sizeFormatter.call(this);
          }
          // Call parent function
          var result = Highcharts.seriesTypes.pie.prototype.getCenter.call(
            this
          );
          // Must correct for slicing room to get exact pixel pos
          result[0] -= slicingRoom;
          result[1] -= slicingRoom;
          return result;
        },
        translate: function(p) {
          this.options.center = this.userOptions.center;
          this.center = this.getCenter();
          return Highcharts.seriesTypes.pie.prototype.translate.call(this, p);
        }
      }
    );

    // Compute max votes to find relative sizes of bubbles
    Highcharts.each(mapData, function(row) {
      maxVotes = Math.max(maxVotes, row[3]);
    });

    // Build the chart
    var chart = Highcharts.mapChart('containerMap', {
      title: {
        text: null
      },

      chart: {
        animation: false // Disable animation, especially for zooming
      },

      colorAxis: {
        dataClasses: [
          {
            from: -1,
            to: 0,
            color: '#ccedfd',
            name: 'Cat'
          },
          {
            from: 0,
            to: 1,
            color: '#fddccc',
            name: 'Dog'
          },
          {
            from: 1,
            to: 2,
            color: '#ecfdcc',
            name: 'Equal'
          }
        ]
      },

      mapNavigation: {
        enabled: true
      },
      // Limit zoom range
      yAxis: {
        minRange: 1
      },

      tooltip: {
        useHTML: true
      },

      // Default options for the pies
      plotOptions: {
        mappie: {
          borderColor: 'rgba(255,255,255,0.4)',
          borderWidth: 0,
          borderColor: null,
          tooltip: {
            headerFormat: ''
          }
        }
      },

      series: [
        {
          mapData: Highcharts.maps['countries/ca/ca-all'],
          data: mapData,
          name: 'provinces',
          borderColor: '#FFF',
          showInLegend: false,
          joinBy: ['name', 'id'],
          keys: [
            'id',
            'catVotes',
            'dogVotes',
            'sumVotes',
            'value',
            'pieOffset'
          ],
          tooltip: {
            headerFormat: '',
            pointFormatter: function() {
              var hoverVotes = this.hoverVotes; // Used by pie only
              return (
                '<b>' +
                this.id +
                ' votes</b><br/>' +
                Highcharts.map(
                  [
                    ['Cat', this.catVotes, catColor],
                    ['Dog', this.dogVotes, dogColor]
                  ].sort(function(a, b) {
                    return b[1] - a[1]; // Sort tooltip by most votes
                  }),
                  function(line) {
                    return (
                      '<span style="color:' +
                      line[2] +
                      // Colorized bullet
                      '">\u25CF</span> ' +
                      // Party and votes
                      (line[0] === hoverVotes ? '<b>' : '') +
                      line[0] +
                      ': ' +
                      Highcharts.numberFormat(line[1], 0) +
                      (line[0] === hoverVotes ? '</b>' : '') +
                      '<br/>'
                    );
                  }
                ).join('') +
                '<hr/>Total: ' +
                Highcharts.numberFormat(this.sumVotes, 0)
              );
            }
          }
        },
        {
          name: 'Connectors',
          type: 'mapline',
          color: 'rgba(130, 130, 130, 0.5)',
          zIndex: 5,
          showInLegend: false,
          enableMouseTracking: false
        }
      ]
    });

    // When clicking legend items, also toggle connectors and pies
    Highcharts.each(chart.legend.allItems, function(item) {
      var old = item.setVisible;
      item.setVisible = function() {
        var legendItem = this;
        old.call(legendItem);
        Highcharts.each(chart.series[0].points, function(point) {
          if (
            chart.colorAxis[0].dataClasses[point.dataClass].name ===
            legendItem.name
          ) {
            // Find this province's pie and set visibility
            Highcharts.find(chart.series, function(item) {
              return item.name === point.id;
            }).setVisible(legendItem.visible, false);
            // Do the same for the connector point if it exists
            var connector = Highcharts.find(chart.series[2].points, function(
              item
            ) {
              return item.name === point.id;
            });
            if (connector) {
              connector.setVisible(legendItem.visible, false);
            }
          }
        });
        chart.redraw();
      };
    });

    // Add the pies after chart load, optionally with offset and connectors
    Highcharts.each(chart.series[0].points, function(province) {
      if (!province.id) {
        return; // Skip points with no data, if any
      }

      var pieOffset = province.pieOffset || {},
        centerLat = parseFloat(province.properties.latitude),
        centerLon = parseFloat(province.properties.longitude);
      // Add the pie for this province
      chart.addSeries(
        {
          type: 'mappie',
          innerSize: '40%',
          name: province.id,
          zIndex: 6, // Keep pies above connector lines
          sizeFormatter: function() {
            var yAxis = this.chart.yAxis[0],
              zoomFactor =
                (yAxis.dataMax - yAxis.dataMin) / (yAxis.max - yAxis.min);
            return Math.max(
              (this.chart.chartWidth / 45) * zoomFactor, // Min size
              ((this.chart.chartWidth / 11) * zoomFactor * province.sumVotes) /
                maxVotes
            );
          },
          tooltip: {
            // Use the province tooltip for the pies as well
            pointFormatter: function() {
              return province.series.tooltipOptions.pointFormatter.call({
                id: province.id,
                hoverVotes: this.name,
                catVotes: province.catVotes,
                dogVotes: province.dogVotes,
                sumVotes: province.sumVotes
              });
            }
          },
          data: [
            {
              name: 'Cat',
              y: province.catVotes,
              color: catColor
            },
            {
              name: 'Republicans',
              y: province.dogVotes,
              color: dogColor
            }
          ],
          center: {
            lat: centerLat + (pieOffset.lat || 0),
            lon: centerLon + (pieOffset.lon || 0)
          }
        },
        false
      );

      // Draw connector to province center if the pie has been offset
      if (pieOffset.drawConnector !== false) {
        var centerPoint = chart.fromLatLonToPoint({
            lat: centerLat,
            lon: centerLon
          }),
          offsetPoint = chart.fromLatLonToPoint({
            lat: centerLat + (pieOffset.lat || 0),
            lon: centerLon + (pieOffset.lon || 0)
          });
        chart.series[2].addPoint(
          {
            name: province.id,
            path:
              'M' +
              offsetPoint.x +
              ' ' +
              offsetPoint.y +
              'L' +
              centerPoint.x +
              ' ' +
              centerPoint.y
          },
          false
        );
      }
    });
    // Only redraw once all pies and connectors have been added
    chart.redraw();
  }
};
