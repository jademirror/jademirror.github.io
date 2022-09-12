{
    title: "Add white noise",
    icon: "icon.svg",
    color: "#aaeeee",
    onLoad: (query, api) => {
        api.addNode(
            "white noise",
            "image/noise",
            tf.randomUniform([100, 100, 3])
        );
    }
}