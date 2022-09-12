var View = {
    "text": (d, l, c) => {
        var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="540" height="540">' +
        '<rect x="0" y="0" rx="20" width="100%" height="100%" fill="#AAAAAA"></rect>' +
        '<foreignObject x="15" y="10" width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:72px;">' +
        '<span style="color:white;">' +
        tf.util.decodeString(new Uint8Array(d.data.arraySync())) +
        "</span></div></foreignObject></svg>";
        c("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
    },
    "image": (d, l, c) => {
        let canvas = document.getElementById('renderer');
        tf.browser.toPixels(d.data, canvas).then(() => {
            c(canvas.toDataURL());
        })
    },
    "bbox": (d, l, c) => {
        let bbox = d.data.arraySync();
        let fakeNode = Kernel.graph.nodes._data[d.parents[0][0]];
        fakeNode.data = fakeNode.data.slice(bbox[0], bbox[1]);
        View[fakeNode.type.split('/')[0]](fakeNode, (img) => {
            c(img);
        })
    },
    "timeseries": (d, l, c) => {
        width = 540;
        height = 540;
        data = d.data.arraySync();
        timeAxis = [];
        for (var i in data[0]) {
            timeAxis.push(Kernel.timestampToString(data[0][i]));
        };
        values = data.slice(1);
        plots = [];
        thickness = l.thickness;
        if (thickness === undefined) thickness = 5;
        for (var i in values) {
            plots.push({
                x: timeAxis,
                y: values[i],
                type: 'scatter',
                name: l.plots[i],
                line: {
                    width: thickness
                },
                marker: {
                    size: thickness * 2
                },
            });
        }
        var layout = {
            title: l.title,
            showlegend: true,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            },
            xaxis: {
                title: l.xlabel,
                showgrid: true,
                zeroline: false,
            },
            yaxis: {
                title: l.ylabel,
                showgrid: true,
                zeroline: false,
            },
            margin: {
                l: 70,
                r: 20,
                b: 70,
                t: 60,
            }
        };
        Plotly.newPlot('plotter', plots, layout).then(
            function(gd)
            {
            Plotly.toImage(gd,{format:'svg',height:height,width:width})
                .then(
                    function(url)
                {
                    c(url);
                }
                )
            });
    },
    "samples1d": (d, l, c) => {
        width = 540;
        height = 540;
        tensor = d.data.arraySync();
        groups = tensor[0];
        groupsArray = [];
        for (var i in groups) {
            groupsArray.push(l.groups[groups[i]]);
        }
        data = tensor.slice(1);
        plots = [];
        for (var i in data) {
            plots.push({
                x: groupsArray,
                y: data[i],
                type: 'box',
                name: l.plots[i],
                boxmean: 'sd'
            });
        }
        var layout = {
            title: l.title,
            showlegend: true,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            },
            xaxis: {
                title: l.xlabel,
                showgrid: true,
                zeroline: false,
            },
            yaxis: {
                title: l.ylabel,
                showgrid: true,
                zeroline: false,
            },
            margin: {
                l: 70,
                r: 20,
                b: 70,
                t: 60,
            },
            boxmode: 'group'
        };
        Plotly.newPlot('plotter', plots, layout).then(
            function(gd)
            {
            Plotly.toImage(gd,{format:'svg',height:height,width:width})
                .then(
                    function(url)
                {
                    c(url);
                }
                )
            });
    },
    "percentage": (d, l, c) => {
        width = 540;
        height = 540;
        data = d.data.arraySync();
        plots = [{
            type: "pie",
            values: data,
            labels: l.plots,
            textinfo: "label+percent",
            insidetextorientation: "radial"
        }];
        var layout = {
            title: l.title,
            showlegend: false,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            },
            margin: {
                l: 20,
                r: 20,
                b: 40,
                t: 60,
            },
        };
        Plotly.newPlot('plotter', plots, layout).then(
            function(gd)
            {
            Plotly.toImage(gd,{format:'svg',height:height,width:width})
                .then(
                    function(url)
                {
                    c(url);
                }
                )
            });
    },
    "entity": (d, l, c) => {
        c(
            'img/entity/' + d.type.split('/')[1] + '.svg'
        );
    },
    "actor": (d, l, c) => {
        c(
            'img/actor/' + d.type.split('/')[1]
        );
    }
}