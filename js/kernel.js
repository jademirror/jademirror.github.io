var Kernel = {
    graph: {
        nid: 0
    },
    workers: {},
    evil: function(text) {
        return eval("("+text+")");
    },
    init: function() {
        Kernel.graph.nodes = new vis.DataSet([]);
        Kernel.graph.edges = new vis.DataSet([]);
        var container = document.getElementById("graph");
        var data = {
            nodes: Kernel.graph.nodes,
            edges: Kernel.graph.edges,
        };
        var options = {   
            nodes: {
                font: {
                    color: "#ffffff"
                },
                shape: 'image'
            },
            edges: {
                smooth: false,
                color: {
                    color: "#ffffff"
                }
            },
            interaction:{
                multiselect: true
            },
            physics: true,
        };
        Kernel.graph.network = new vis.Network(container, data, options);
        Kernel.graph.network.on( 'doubleClick', function(properties) {
            var ids = properties.nodes;
            if (ids.length > 0) {
                var cln = Kernel.graph.nodes.get(ids);
                if (Kernel.graph.network.isCluster(ids[0])) {
                    Kernel.graph.network.openCluster(ids[0]);
                    return
                } else {
                    var newState = Kernel.sample(
                        cln[0].id,
                        cln[0].type,
                        cln[0].label,
                        cln[0].state,
                        cln[0].data,
                        cln[0].image       
                    )
                    Kernel.clusterByConnection(cln[0].id);
                }
            };
        });
    },
    parseLabel: (label) => {
        if (typeof label == "string") return {label: label};
        return label;
    },
    addNode: function(worker, label, type, data, parents) {
        rendered = document.getElementById('renderer');
        let parsedLabel = Kernel.parseLabel(label);
        var newNodeId = Kernel.graph.nodes.add({
            worker: worker,
            parents: parents,
            type: type,
            data: data,
            font: {
                color: Kernel.workers[worker].color
            },
            id: Kernel.graph.nid++,
            label: parsedLabel.label,
            image: "img/types/query.svg"
        })[0];
        for (var p in parents) {
            Kernel.graph.edges.add({
                worker: worker,
                from: parents[p][0],
                to: newNodeId,
                label: parents[p][1],
                color: {
                    color: Kernel.workers[worker].color
                }
            });
        }
        View[type.split('/')[0]](Kernel.graph.nodes._data[newNodeId], parsedLabel, (image) => {
            Kernel.graph.nodes.update({id: newNodeId, image: image});
        })
        return newNodeId;
    },
    addEdge: function(from, to, label, color) {
        Kernel.graph.edges.add({
            from: from,
            to: to,
            label: label,
            color: {
                color: color
            }
        })
    },
    updateTaskbar: () => {
        for (var w in Kernel.workers) {
            if (Kernel.workers[w].status == "exit") {
                let workerTaskbarEntry = document.getElementById('worker-' + Kernel.workers[w].id + '-entry')
                try {
                    document.getElementById('worker-' + Kernel.workers[w].id + '-title').id = "exiting";
                    workerTaskbarEntry.id = "exiting";
                    setTimeout(() => {
                        workerTaskbarEntry.style.opacity = "0";
                        setTimeout(() => {
                            workerTaskbarEntry.innerHTML = "";
                            workerTaskbarEntry.outerHTML = "";
                            workerTaskbarEntry = null;                    
                        }, 1100)
                    }, 1000);
                } catch(e) {}
                return
            };
            workerTaskbarTitle = document.getElementById('worker-' + Kernel.workers[w].id + '-title');
            if (workerTaskbarTitle !== null) {
                workerTaskbarTitle.innerHTML = Kernel.workers[w].title;
            } else {
                var newWorkerTaskbarEntry = document.createElement('div');
                var newWorkerTaskbarIcon = document.createElement('img');
                var newWorkerTaskbarTitle = document.createElement('div');
                var newWorkerTaskbarClose = document.createElement('button');

                newWorkerTaskbarClose.innerHTML = '×';
                newWorkerTaskbarClose.addEventListener('click', () => {
                    Kernel.workers[w].status = "exit";
                    Kernel.updateTaskbar();
                })

                newWorkerTaskbarEntry.className = 'entry';
                newWorkerTaskbarEntry.id = 'worker-' + Kernel.workers[w].id + '-entry';

                newWorkerTaskbarTitle.innerHTML = Kernel.workers[w].title;
                newWorkerTaskbarTitle.id = 'worker-' + Kernel.workers[w].id + '-title';
                newWorkerTaskbarTitle.className = 'title';

                newWorkerTaskbarEntry.style.color = Kernel.workers[w].color;

                newWorkerTaskbarIcon.src = 'mir/' + Kernel.workers[w].id + '/' + Kernel.workers[w].icon;
                newWorkerTaskbarIcon.id = 'worker-' + Kernel.workers[w].id + '-icon';
                newWorkerTaskbarIcon.className = 'icon';

                newWorkerTaskbarEntry.appendChild(newWorkerTaskbarIcon);
                newWorkerTaskbarEntry.appendChild(newWorkerTaskbarTitle);
                newWorkerTaskbarEntry.appendChild(newWorkerTaskbarClose);
                document.getElementById('taskbar').appendChild(newWorkerTaskbarEntry);
            }
        }
    },
    api: (id) => {
        var api = {
            addNode: (label, type, data, parents) => {
                return Kernel.addNode(id, label, type, data, parents);
            },
            addEdge: (label, from, to) => {
                return Kernel.addEdge(from, to, label, Kernel.workers[id].color);
            },
            iterNodes: (c) => {
                for (var i in Kernel.graph.nodes._data) {
                    c(Kernel.graph.nodes._data[i]);
                }
            },
            iterPairs: (c) => {
                for (var i in Kernel.graph.nodes._data) {
                    for (var j in Kernel.graph.nodes._data) {
                        if (i!=j) {
                            c(Kernel.graph.nodes._data[i], Kernel.graph.nodes._data[j]);
                        }
                    }
                }
            },
            iterEdges: (c) => {
                for (var i in Kernel.graph.edges._data) {
                    c(Kernel.graph.edges._data[i]);
                }
            }
        }
        return api
    },
    spawnWorker: (name, query) => {
        fetch('mir/' + name + '/main.js')
        .then((response) => response.text())
        .then((text) => {
            let mirror = Kernel.evil(text);
            mirror.id = name;
            Kernel.workers[mirror.id] = mirror;
            Kernel.updateTaskbar();
            let status = mirror.onLoad(query, Kernel.api(name));
            if (status === undefined) Kernel.workers[mirror.id].status = "exit";
            Kernel.updateTaskbar();
        });
    },
    query: function(e) {
        let label = document.getElementById("query-text-input").value;
        if (e !== undefined) {
            if (e.keyCode == 13) {
                let dropDown = document.getElementById("query-dropdown");
                Kernel.spawnWorker(dropDown.childNodes[dropDown.childNodes.length-1].getAttribute('alt'));
                return
            }
        }
        document.getElementById("query-dropdown").innerHTML = "";
        document.getElementById("query-dropdown").style.visibility = "hidden";
        document.getElementById("query-text-input").style.borderRadius = "0.3em 0 0 0.3em";
        for (var i in INDEX) {
            for (var r in INDEX[i][0]) {
                if (label.match(INDEX[i][0][r])) {
                    document.getElementById("query-dropdown").innerHTML +=
                    "<div alt='" + INDEX[i][1] + "' onmousedown='Kernel.spawnWorker(\"" + INDEX[i][1] +  "\")' style='background-image: url(\"" + 'mir/' + INDEX[i][1] + '/icon.svg' +  "\")'>" + 
                    INDEX[i][2] + "</div>";
                    document.getElementById("query-dropdown").style.visibility = "visible";
                    document.getElementById("query-text-input").style.borderRadius = "0 0 0 0.3em";
                    //Kernel.spawnWorker(INDEX[i][1]);
                    break
                } else {
                    /*let childs = document.getElementById("query-dropdown").childNodes;
                    for (var d in childs) {
                        if (childs[d].innerHTML == INDEX[i][1]) {
                            childs[d].innerHTML = "";
                            childs[d].outerHTML = "";
                            childs[d] = null;
                        }
                    }*/
                }
            }
        }
    },
    sample(caller_id, type, label, state, data, image) {
        switch (type) {
            case "query":
                break;
            case "mirror":
                return new Promise(() => {
                    data.onsample(
                        caller_id,
                        Kernel.api(caller_id)
                    );
                }).then((result) => {
                    // callback for model result
                });
                break;
            default:
                alert("Unknown node type: " + type)
        }
    },
    cluster: () => {
        options = {
            joinCondition: (nodeOptions) => {
                //
            },
            processProperties: function (clusterOptions, childNodes, childEdges) {
                clusterOptions.label = "[+] " + childNodes[0].label
                clusterOptions.image = parechildNodes[0].image
                return clusterOptions;
            },
            clusterNodeProperties: {
                image: ""
            }
        }
        Kernel.graph.network.clusterOutliers(options);
    },
    clusterByConnection: (id) => {
        Kernel.graph.network.clusterByConnection(id, {
            joinCondition: (parentNodeOptions, childNodeOptions) => {
                if (parentNodeOptions.nid < childNodeOptions.nid) {
                    Kernel.clusterByConnection(childNodeOptions.id);
                    return true;
                }
                return false;
            },
            processProperties: (clusterOptions, childNodesOptions, childEdgesOptions) => {
                clusterOptions.image = childNodesOptions[0].image;
                clusterOptions.label = "[+] " + childNodesOptions[0].label;
                clusterOptions.nid = childNodesOptions[0].nid;
                return clusterOptions;
            },
            clusterNodeProperties: {
                image: ""
            }
        })
    },
    stringToTensor: (s) => {
        return tf.tensor(tf.util.encodeString(s));
    },
    timestampToString: (t) => {
        var date = new Date(t);
        return (
            date.toISOString()
        );
    },
    hideDropdown: () => {
        document.getElementById('query-dropdown').style.visibility = 'hidden';
        document.getElementById('query-text-input').style.borderRadius='0.3em 0 0 0.3em';
    }
}