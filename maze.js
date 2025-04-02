class Maze {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 15;
        this.rows = 40;
        this.cols = 40;
        this.maze = [];
        this.currentPath = [];
        this.score = 0;
        this.currentTool = 'drawPath';
        this.isDrawing = false;
        this.isDrawingMaze = false;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.generateMaze();
    }
    
    setupCanvas() {
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    }
    
    setupEventListeners() {
        // Tool selection
        document.getElementById('generateMaze').addEventListener('click', () => {
            this.currentTool = 'generate';
            this.generateMaze();
        });
        
        document.getElementById('drawPath').addEventListener('click', () => {
            this.currentTool = 'drawPath';
            console.log('Tool changed to: drawPath');
        });
        
        document.getElementById('erasePath').addEventListener('click', () => {
            this.currentTool = 'erasePath';
            console.log('Tool changed to: erasePath');
        });
        
        document.getElementById('eraseCell').addEventListener('click', () => {
            this.currentTool = 'eraseCell';
            console.log('Tool changed to: eraseCell');
        });
        
        document.getElementById('clearMaze').addEventListener('click', () => {
            this.currentTool = 'clear';
            this.clearMaze();
        });
        
        document.getElementById('drawMaze').addEventListener('click', () => {
            this.currentTool = 'drawMaze';
            console.log('Tool changed to: drawMaze');
            this.isDrawingMaze = true;
        });
        
        document.getElementById('findShortestPath').addEventListener('click', () => {
            this.currentTool = 'findShortestPath';
            this.findShortestPath();
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    }
    
    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const cell = this.getCellAt(pos.x, pos.y);
        
        if (!cell) return;
        
        this.isDrawing = true;
        
        if (this.currentTool === 'drawPath') {
            this.addToPath(cell);
        } else if (this.currentTool === 'erasePath') {
            this.removeFromPath(cell);
        } else if (this.currentTool === 'eraseCell') {
            this.eraseCell(cell);
        } else if (this.currentTool === 'drawMaze') {
            this.drawCell(cell);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        const cell = this.getCellAt(pos.x, pos.y);
        
        if (!cell) return;
        
        if (this.currentTool === 'drawPath') {
            this.addToPath(cell);
        } else if (this.currentTool === 'erasePath') {
            this.removeFromPath(cell);
        } else if (this.currentTool === 'eraseCell') {
            this.eraseCell(cell);
        } else if (this.currentTool === 'drawMaze') {
            this.drawCell(cell);
        }
    }
    
    handleMouseUp() {
        this.isDrawing = false;
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getCellAt(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        
        return { row, col };
    }
    
    generateMaze() {
        // Initialize maze with all walls
        this.maze = [];
        for (let i = 0; i < this.rows; i++) {
            this.maze[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.maze[i][j] = 1; // 1 represents a wall
            }
        }
        
        // Generate a random maze using Recursive Division algorithm
        const mazeGenerator = new RecursiveDivisionMaze(this.rows, this.cols);
        this.maze = mazeGenerator.generate();
        
        // Add some bombs randomly
        mazeGenerator.addBombs(40);
        
        // Clear the current path and reset score
        this.currentPath = [];
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        
        // Draw the maze
        this.draw();
    }
    
    clearMaze() {
        // Clear the maze (set all cells to empty)
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.maze[i][j] = 0;
            }
        }
        
        // Set start and end points
        this.maze[0][0] = 0; // Start point
        this.maze[this.rows - 1][this.cols - 1] = 0; // End point
        
        // Clear the current path and reset score
        this.currentPath = [];
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        
        // Draw the maze
        this.draw();
    }
    
    drawCell(cell) {
        if (cell.row === 0 && cell.col === 0) return; // Don't modify start point
        if (cell.row === this.rows - 1 && cell.col === this.cols - 1) return; // Don't modify end point
        
        this.maze[cell.row][cell.col] = 1; // Set as wall
        this.draw();
    }
    
    eraseCell(cell) {
        if (cell.row === 0 && cell.col === 0) return; // Don't modify start point
        if (cell.row === this.rows - 1 && cell.col === this.cols - 1) return; // Don't modify end point
        
        this.maze[cell.row][cell.col] = 0; // Set as empty
        this.draw();
    }
    
    addToPath(cell) {
        // Check if the cell is already in the path
        const cellIndex = this.currentPath.findIndex(c => c.row === cell.row && c.col === cell.col);
        
        if (cellIndex !== -1) {
            return; // Cell is already in the path
        }
        
        // Check if the cell is adjacent to the last cell in the path
        if (this.currentPath.length > 0) {
            const lastCell = this.currentPath[this.currentPath.length - 1];
            if (!this.isAdjacent(lastCell, cell)) {
                return; // Cell is not adjacent to the last cell in the path
            }
        }
        
        // Add the cell to the path
        this.currentPath.push(cell);
        
        // Update the score
        if (this.maze[cell.row][cell.col] === 2) { // Bomb
            this.score -= 10;
        } else {
            this.score += 1;
        }
        
        document.getElementById('score').textContent = this.score;
        
        // Draw the maze
        this.draw();
    }
    
    removeFromPath(cell) {
        // Find the cell in the path
        const cellIndex = this.currentPath.findIndex(c => c.row === cell.row && c.col === cell.col);
        
        if (cellIndex === -1) {
            return; // Cell is not in the path
        }
        
        // Remove the cell and all cells after it from the path
        this.currentPath = this.currentPath.slice(0, cellIndex);
        
        // Recalculate the score
        this.score = 0;
        for (const pathCell of this.currentPath) {
            if (this.maze[pathCell.row][pathCell.col] === 2) { // Bomb
                this.score -= 10;
            } else {
                this.score += 1;
            }
        }
        
        document.getElementById('score').textContent = this.score;
        
        // Draw the maze
        this.draw();
    }
    
    isAdjacent(cell1, cell2) {
        // Check if cells are adjacent horizontally or vertically (not diagonally)
        return (Math.abs(cell1.row - cell2.row) === 1 && cell1.col === cell2.col) ||
               (Math.abs(cell1.col - cell2.col) === 1 && cell1.row === cell2.row);
    }
    
    findShortestPath() {
        console.log("Finding shortest path...");
        
        // Define start and end points
        const start = { row: 0, col: 0 };
        const end = { row: this.rows - 1, col: this.cols - 1 };
        
        // Initialize data structures for Dijkstra's algorithm
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        
        // Initialize distances
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.maze[i][j] !== 1) { // Not a wall
                    const id = `${i},${j}`;
                    distances[id] = Infinity;
                    unvisited.add(id);
                }
            }
        }
        
        // Set distance of start node to 0
        distances[`${start.row},${start.col}`] = 0;
        
        // Main loop of Dijkstra's algorithm
        while (unvisited.size > 0) {
            // Find the unvisited node with the smallest distance
            let minDistance = Infinity;
            let currentId = null;
            
            for (const id of unvisited) {
                if (distances[id] < minDistance) {
                    minDistance = distances[id];
                    currentId = id;
                }
            }
            
            // If no path exists or we've reached the end
            if (currentId === null || minDistance === Infinity) {
                break;
            }
            
            // If we've reached the end, we're done
            if (currentId === `${end.row},${end.col}`) {
                break;
            }
            
            // Remove the current node from unvisited
            unvisited.delete(currentId);
            
            // Get the current node's coordinates
            const [currentRow, currentCol] = currentId.split(',').map(Number);
            
            // Check all neighbors (up, right, down, left)
            const neighbors = [
                { row: currentRow - 1, col: currentCol }, // Up
                { row: currentRow + 1, col: currentCol }, // Down
                { row: currentRow, col: currentCol - 1 }, // Left
                { row: currentRow, col: currentCol + 1 }  // Right
            ];
            
            for (const neighbor of neighbors) {
                // Skip if out of bounds or is a wall
                if (neighbor.row < 0 || neighbor.row >= this.rows || 
                    neighbor.col < 0 || neighbor.col >= this.cols || 
                    this.maze[neighbor.row][neighbor.col] === 1) {
                    continue;
                }
                
                const neighborId = `${neighbor.row},${neighbor.col}`;
                
                // Skip if not in unvisited set
                if (!unvisited.has(neighborId)) {
                    continue;
                }
                
                // Calculate the distance to the neighbor
                // Bombs have a higher cost (10) than regular cells (1)
                const cost = this.maze[neighbor.row][neighbor.col] === 2 ? 10 : 1;
                const distance = distances[currentId] + cost;
                
                // If this path is shorter, update the distance and previous node
                if (distance < distances[neighborId]) {
                    distances[neighborId] = distance;
                    previous[neighborId] = currentId;
                }
            }
        }
        
        // Reconstruct the path
        const path = [];
        let currentId = `${end.row},${end.col}`;
        
        // If no path exists
        if (distances[currentId] === Infinity) {
            alert("No path exists from start to end!");
            return;
        }
        
        // Build the path from end to start
        while (currentId) {
            const [row, col] = currentId.split(',').map(Number);
            path.unshift({ row, col });
            currentId = previous[currentId];
        }
        
        // Set the current path to the shortest path
        this.currentPath = path;
        
        // Calculate the score
        this.score = 0;
        for (const cell of path) {
            if (this.maze[cell.row][cell.col] === 2) { // Bomb
                this.score -= 10;
            } else {
                this.score += 1;
            }
        }
        
        document.getElementById('score').textContent = this.score;
        
        // Draw the maze with the shortest path
        this.draw();
        
        // Show the total distance
        alert(`Shortest path found! Total distance: ${distances[`${end.row},${end.col}`]}`);
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the maze
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const x = j * this.cellSize;
                const y = i * this.cellSize;
                
                if (this.maze[i][j] === 1) { // Wall
                    this.ctx.fillStyle = '#333';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                } else if (this.maze[i][j] === 2) { // Bomb
                    this.ctx.fillStyle = '#f00';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Draw grid lines
                this.ctx.strokeStyle = '#ccc';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
        
        // Draw the path
        if (this.currentPath.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.currentPath[0].col * this.cellSize + this.cellSize / 2,
                this.currentPath[0].row * this.cellSize + this.cellSize / 2
            );
            
            for (let i = 1; i < this.currentPath.length; i++) {
                this.ctx.lineTo(
                    this.currentPath[i].col * this.cellSize + this.cellSize / 2,
                    this.currentPath[i].row * this.cellSize + this.cellSize / 2
                );
            }
            
            this.ctx.strokeStyle = '#00f';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        }
        
        // Draw start and end points
        this.ctx.fillStyle = '#0f0';
        this.ctx.beginPath();
        this.ctx.arc(this.cellSize / 2, this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#f0f';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.cols - 1) * this.cellSize + this.cellSize / 2,
            (this.rows - 1) * this.cellSize + this.cellSize / 2,
            this.cellSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
}

// Initialize the maze when the page loads
window.addEventListener('load', () => {
    console.log("Page loaded, initializing maze");
    window.maze = new Maze();
}); 