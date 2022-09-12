{
    title: "Connecting all nodes",
    icon: "icon.svg",
    color: "#FFA500",
    onLoad: (query, api) => {
        api.iterPairs((n1, n2) => {
            api.addEdge("test", n1.id, n2.id);
            console.log(n1.data);
        })
    }
}