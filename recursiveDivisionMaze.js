/**
 * Recursive Division Maze Generator
 * 
 * This algorithm creates a maze by recursively dividing the space into smaller chambers
 * and creating walls with random passages between them.
 */

class RecursiveDivisionMaze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.maze = [];
        
        // Initialize maze with all cells as passages (0)
        for (let i = 0; i < rows; i++) {
            this.maze[i] = [];
            for (let j = 0; j < cols; j++) {
                this.maze[i][j] = 0;
            }
        }
        
        // Create outer walls
        for (let i = 0; i < rows; i++) {
            this.maze[i][0] = 1;
            this.maze[i][cols - 1] = 1;
        }
        for (let j = 0; j < cols; j++) {
            this.maze[0][j] = 1;
            this.maze[rows - 1][j] = 1;
        }
    }
    
    /**
     * Generate a maze using the Recursive Division algorithm
     */
    generate() {
        // Start with the entire maze (excluding outer walls)
        this.divide(1, 1, this.rows - 2, this.cols - 2);
        
        // Ensure start and end points are passages
        this.maze[0][0] = 0; // Start point
        this.maze[this.rows - 1][this.cols - 1] = 0; // End point
        
        // Ensure there's a path from start to end
        this.ensurePathExists();
        
        return this.maze;
    }
    
    /**
     * Recursively divide the maze
     * @param {number} startRow - Starting row of the current chamber
     * @param {number} startCol - Starting column of the current chamber
     * @param {number} height - Height of the current chamber
     * @param {number} width - Width of the current chamber
     */
    divide(startRow, startCol, height, width) {
        // Base case: if the chamber is too small, return
        if (height <= 1 || width <= 1) return;
        
        // Choose a random point to create a wall
        const wallRow = startRow + Math.floor(Math.random() * height);
        const wallCol = startCol + Math.floor(Math.random() * width);
        
        // Create a horizontal wall
        for (let j = startCol; j < startCol + width; j++) {
            this.maze[wallRow][j] = 1;
        }
        
        // Create a vertical wall
        for (let i = startRow; i < startRow + height; i++) {
            this.maze[i][wallCol] = 1;
        }
        
        // Choose a random passage in each wall
        const passageRow = wallRow + (Math.random() < 0.5 ? -1 : 1);
        const passageCol = wallCol + (Math.random() < 0.5 ? -1 : 1);
        
        // Ensure the passage is within bounds
        if (passageRow >= startRow && passageRow < startRow + height) {
            this.maze[passageRow][wallCol] = 0;
        }
        if (passageCol >= startCol && passageCol < startCol + width) {
            this.maze[wallRow][passageCol] = 0;
        }
        
        // Add some random additional passages to ensure multiple paths
        if (Math.random() < 0.3) {
            const additionalPassageRow = startRow + Math.floor(Math.random() * height);
            const additionalPassageCol = startCol + Math.floor(Math.random() * width);
            
            if (additionalPassageRow !== passageRow) {
                this.maze[additionalPassageRow][wallCol] = 0;
            }
            if (additionalPassageCol !== passageCol) {
                this.maze[wallRow][additionalPassageCol] = 0;
            }
        }
        
        // Recursively divide the four chambers
        this.divide(startRow, startCol, wallRow - startRow, wallCol - startCol);
        this.divide(startRow, wallCol + 1, wallRow - startRow, width - (wallCol - startCol + 1));
        this.divide(wallRow + 1, startCol, height - (wallRow - startRow + 1), wallCol - startCol);
        this.divide(wallRow + 1, wallCol + 1, height - (wallRow - startRow + 1), width - (wallCol - startCol + 1));
    }
    
    /**
     * Ensure there is a path from start to end
     */
    ensurePathExists() {
        // Create a path from start to end using a simple algorithm
        let currentRow = 0;
        let currentCol = 0;
        
        // First, move right until we reach the end column
        while (currentCol < this.cols - 1) {
            this.maze[currentRow][currentCol] = 0;
            currentCol++;
        }
        
        // Then, move down until we reach the end row
        while (currentRow < this.rows - 1) {
            this.maze[currentRow][currentCol] = 0;
            currentRow++;
        }
        
        // Set the end point
        this.maze[currentRow][currentCol] = 0;
        
        // Add some random variations to the path
        for (let i = 0; i < this.rows * this.cols / 20; i++) {
            const row = Math.floor(Math.random() * (this.rows - 2)) + 1;
            const col = Math.floor(Math.random() * (this.cols - 2)) + 1;
            
            // Create a small opening
            this.maze[row][col] = 0;
            this.maze[row][col + 1] = 0;
            this.maze[row + 1][col] = 0;
        }
    }
    
    /**
     * Add bombs to the maze
     * @param {number} count - Number of bombs to add
     */
    addBombs(count) {
        for (let i = 0; i < count; i++) {
            const row = Math.floor(Math.random() * (this.rows - 2)) + 1;
            const col = Math.floor(Math.random() * (this.cols - 2)) + 1;
            
            // Don't place bombs at start or end points
            if ((row === 0 && col === 0) || (row === this.rows - 1 && col === this.cols - 1)) {
                continue;
            }
            
            this.maze[row][col] = 2; // 2 represents a bomb
        }
    }
}

module.exports = RecursiveDivisionMaze;
