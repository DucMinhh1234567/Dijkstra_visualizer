class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedNode = null;
        this.isDrawingEdge = false;
        this.edgeStart = null;
        this.currentTool = 'addNode';
        
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
        this.draw();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        document.getElementById('addNode').addEventListener('click', () => {
            this.currentTool = 'addNode';
            console.log('Tool changed to: addNode');
        });
        
        document.getElementById('addEdge').addEventListener('click', () => {
            this.currentTool = 'addEdge';
            console.log('Tool changed to: addEdge');
        });
        
        document.getElementById('deleteNode').addEventListener('click', () => {
            this.currentTool = 'deleteNode';
            console.log('Tool changed to: deleteNode');
        });
        
        document.getElementById('randomGraph').addEventListener('click', () => {
            console.log('Creating random graph');
            this.createRandomGraph();
        });
        
        document.getElementById('findPath').addEventListener('click', () => {
            console.log('Finding shortest path');
            this.findShortestPath();
        });
        
        document.getElementById('clearAll').addEventListener('click', () => {
            console.log('Clearing all');
            this.clearAll();
        });
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        
        if (this.currentTool === 'addNode') {
            this.addNode(pos.x, pos.y);
        } else if (this.currentTool === 'addEdge') {
            const node = this.findNodeAt(pos.x, pos.y);
            if (node) {
                this.isDrawingEdge = true;
                this.edgeStart = node;
            }
        } else if (this.currentTool === 'deleteNode') {
            const node = this.findNodeAt(pos.x, pos.y);
            if (node) {
                this.deleteNode(node);
            }
        }
    }

    handleMouseMove(e) {
        if (this.isDrawingEdge) {
            const pos = this.getMousePos(e);
            this.draw();
            this.ctx.beginPath();
            this.ctx.moveTo(this.edgeStart.x, this.edgeStart.y);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.strokeStyle = '#666';
            this.ctx.stroke();
        }
    }

    handleMouseUp(e) {
        if (this.isDrawingEdge) {
            const pos = this.getMousePos(e);
            const endNode = this.findNodeAt(pos.x, pos.y);
            
            if (endNode && endNode !== this.edgeStart) {
                const weight = prompt('Enter edge weight:', '1');
                if (weight && !isNaN(weight)) {
                    this.addEdge(this.edgeStart, endNode, parseFloat(weight));
                }
            }
            
            this.isDrawingEdge = false;
            this.edgeStart = null;
            this.draw();
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    addNode(x, y) {
        const id = `node${this.nodes.size + 1}`;
        this.nodes.set(id, { id, x, y });
        this.draw();
    }

    deleteNode(node) {
        // Remove all edges connected to this node
        const edgesToRemove = [];
        for (const [edgeId, edge] of this.edges.entries()) {
            if (edge.from.id === node.id || edge.to.id === node.id) {
                edgesToRemove.push(edgeId);
            }
        }
        
        for (const edgeId of edgesToRemove) {
            this.edges.delete(edgeId);
        }
        
        // Remove the node
        this.nodes.delete(node.id);
        this.draw();
    }

    clearAll() {
        this.nodes.clear();
        this.edges.clear();
        this.draw();
    }

    addEdge(from, to, weight) {
        const edgeId = `${from.id}-${to.id}`;
        this.edges.set(edgeId, { from, to, weight });
        this.draw();
    }

    findNodeAt(x, y) {
        for (const node of this.nodes.values()) {
            const dx = node.x - x;
            const dy = node.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                return node;
            }
        }
        return null;
    }

    createRandomGraph() {
        this.nodes.clear();
        this.edges.clear();
        
        const numNodes = 10;
        const numEdges = 15;
        
        for (let i = 0; i < numNodes; i++) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            this.addNode(x, y);
        }
        
        const nodes = Array.from(this.nodes.values());
        for (let i = 0; i < numEdges; i++) {
            const from = nodes[Math.floor(Math.random() * nodes.length)];
            const to = nodes[Math.floor(Math.random() * nodes.length)];
            if (from !== to) {
                const weight = Math.floor(Math.random() * 10) + 1;
                this.addEdge(from, to, weight);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw edges
        for (const edge of this.edges.values()) {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.from.x, edge.from.y);
            this.ctx.lineTo(edge.to.x, edge.to.y);
            this.ctx.strokeStyle = '#666';
            this.ctx.stroke();
            
            // Draw weight
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(edge.weight.toString(), midX, midY);
        }
        
        // Draw nodes
        for (const node of this.nodes.values()) {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            this.ctx.strokeStyle = '#45a049';
            this.ctx.stroke();
            
            // Draw node ID
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.id, node.x, node.y + 4);
        }
    }
}

// Initialize the graph when the page loads
window.addEventListener('load', () => {
    window.graph = new Graph();
}); 