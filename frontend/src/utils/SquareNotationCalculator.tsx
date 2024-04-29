export const algebraicToIndices = (square: string): [number, number] => {
    console.log(square);
    let file: number, rank: number;

    // Check if the notation ends with '#' or '+'
    if (square.endsWith('#') || square.endsWith('+')) {
        square = square.slice(0, -1); // Remove the special symbol
    }

    // Check for non-standard notations like 'Bxf7'
    if (square.length === 4 && square[1] === 'x') {
        // Extract piece, file, and rank
        const destinationFile = square[2];
        const destinationRank = square[3];

        // Calculate file index
        file = destinationFile.charCodeAt(0) - 'a'.charCodeAt(0);

        // Calculate rank index
        rank = 8 - parseInt(destinationRank);
    } else if (square.length === 2) {
        // Standard two-character algebraic notation
        file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        rank = 8 - parseInt(square[1]);
    }else if (square.length === 3) {
        file = square.charCodeAt(1) - 'a'.charCodeAt(0);
        rank = 8 - parseInt(square.substring(2));
    } else {
        throw new Error('Invalid square notation');
    }

    return [rank, file];
};
