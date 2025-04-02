class Dijkstra {
    constructor(graph) {
        this.graph = graph;
    }

    findShortestPath(startNode, endNode) {
        console.log("Finding shortest path from", startNode.id, "to", endNode.id);
        
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Initialize distances
        for (const node of this.graph.nodes.values()) {
            distances.set(node.id, Infinity);
            unvisited.add(node.id);
        }
        distances.set(startNode.id, 0);

        while (unvisited.size > 0) {
            // Find node with minimum distance
            let minDistance = Infinity;
            let currentNode = null;

            for (const nodeId of unvisited) {
                if (distances.get(nodeId) < minDistance) {
                    minDistance = distances.get(nodeId);
                    currentNode = this.graph.nodes.get(nodeId);
                }
            }

            if (!currentNode || minDistance === Infinity) {
                break;
            }

            if (currentNode.id === endNode.id) {
                break;
            }

            unvisited.delete(currentNode.id);

            // Update distances to neighbors
            for (const edge of this.graph.edges.values()) {
                if (edge.from.id === currentNode.id) {
                    const neighbor = edge.to;
                    const distance = distances.get(currentNode.id) + edge.weight;

                    if (distance < distances.get(neighbor.id)) {
                        distances.set(neighbor.id, distance);
                        previous.set(neighbor.id, currentNode.id);
                    }
                }
            }
        }

        // Reconstruct path
        const path = [];
        let currentId = endNode.id;

        while (currentId) {
            path.unshift(this.graph.nodes.get(currentId));
            currentId = previous.get(currentId);
        }

        console.log("Path found:", path.map(node => node.id).join(" -> "));
        console.log("Total distance:", distances.get(endNode.id));

        return {
            path: path,
            distance: distances.get(endNode.id)
        };
    }
}

// Add findShortestPath method to Graph class
Graph.prototype.findShortestPath = function() {
    console.log("findShortestPath called");
    
    if (this.nodes.size < 2) {
        alert('Please add at least 2 nodes to find the shortest path');
        return;
    }

    // Save current tool and set to select mode
    const previousTool = this.currentTool;
    this.currentTool = 'selectStart';
    
    // Create a message to guide the user
    const message = document.createElement('div');
    message.id = 'selection-message';
    message.style.position = 'absolute';
    message.style.top = '10px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    message.textContent = 'Click on the start node';
    document.body.appendChild(message);
    
    // Variables to store selected nodes
    let startNode = null;
    let endNode = null;
    
    // Create a one-time click handler for node selection
    const selectNode = (e) => {
        console.log("Node selection click event");
        const pos = this.getMousePos(e);
        const node = this.findNodeAt(pos.x, pos.y);
        
        if (node) {
            console.log("Node found:", node.id);
            
            if (this.currentTool === 'selectStart') {
                startNode = node;
                this.currentTool = 'selectEnd';
                message.textContent = 'Click on the end node';
                
                // Highlight the selected start node
                this.draw();
                this.ctx.beginPath();
                this.ctx.arc(startNode.x, startNode.y, 25, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
            } else if (this.currentTool === 'selectEnd') {
                endNode = node;
                
                // Remove the message
                document.body.removeChild(message);
                
                // Remove the event listener
                this.canvas.removeEventListener('click', selectNode);
                
                // Restore the previous tool
                this.currentTool = previousTool;
                
                // Find and display the shortest path
                const dijkstra = new Dijkstra(this);
                const result = dijkstra.findShortestPath(startNode, endNode);
                
                if (result.path.length === 0) {
                    alert('No path found between the selected nodes');
                    return;
                }
                
                // Highlight the path
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.draw();
                
                // Draw the path
                this.ctx.beginPath();
                this.ctx.moveTo(result.path[0].x, result.path[0].y);
                for (let i = 1; i < result.path.length; i++) {
                    this.ctx.lineTo(result.path[i].x, result.path[i].y);
                }
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
                
                // Show the result
                alert(`Shortest path found!\nTotal distance: ${result.distance}`);
            }
        } else {
            console.log("No node found at click position");
        }
    };
    
    // Add the click event listener
    this.canvas.addEventListener('click', selectNode);
    console.log("Click event listener added for node selection");
}; 