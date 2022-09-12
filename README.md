
## This is the very first commit of the new Jademirror prototype

####  TL/DR Jademirror is a board for getting insights from data

During the development, Jademirror prototype will be hosted on [jademirror.github.io](https://jademirror.github.io)

https://user-images.githubusercontent.com/19384590/189565963-99ce0ea4-05e1-4597-a8cc-8584631f0d33.mov

-------

#### For developers

Basically Jademirror is a network graph, where nodes are some parts of data, and edges represent connections between these parts. When the user writes a query, the appropriate worker starts up. Worker is a script that is able to change the graph.

The documentation will be soon, for now just try to look through the workers code (mir folder). Two sample workers are `whitenoise` and `connectall`, they create nodes with 2D white noise and connect all nodes respectively

The very quick concept specification:

- Jademirror is an online board for working with data, it was inspired by evidence boards from detective movies
- The board is a network graph
- Each node represents some data
  - Node's data is a tensor
  - Node's label is a string or a metadata object
  - Node's type is a string in the form ```foo/bar``` where foo describes how to visualize the node, yet bar shows what exactly the node represents
- Each edge represents some relation
- User writes queries to make changes to the board
- Queries execute workers, i.e. scripts, that can interact with the graph

What technology we're using at the moment:

- Jademirror is a static webpage
- vis.js for network graph visualization
- tensorflow.js for working with data & Machine Learning
- custom dumb regex search (will improve later), based on `mir/index.js` index file

