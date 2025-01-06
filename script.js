const points = [
    { x: 5, y: 3.5 }, { x: 50.5, y: 3.5 }, { x: 96, y: 3.5 },
    { x: 16.5, y: 19 }, { x: 50.5, y: 18.5 }, { x: 82, y: 19 },
    { x: 36.5, y: 35.3 }, { x: 50.5, y: 35.3 }, { x: 65, y: 35.3 },
    { x: 5, y: 50 }, { x: 16.5, y: 50 }, { x: 36.5, y: 50 }, { x: 65, y: 50 }, { x: 83, y: 50 }, { x: 96, y: 50 },
    { x: 36.5, y: 65 }, { x: 50.5, y: 65 }, { x: 65, y: 65 },
    { x: 16.5, y: 82.5 }, { x: 50, y: 82 }, { x: 83, y: 82 },
    { x: 5, y: 97 }, { x: 50, y: 97 }, { x: 96, y: 97 }
];

const board = document.getElementById('board');
const message = document.getElementById('message');
let currentPlayer = 'black';
let piecesPlaced = { black: 0, white: 0 };
const maxPieces = 9;
let selectedPiece = null;
let gamePhase = 'placement';
let blackPiecesRemoved = 0;
let whitePiecesRemoved = 0;
let lastMill = null;

function updateMessage() {
    message.textContent = `${currentPlayer.toUpperCase()}'s turn - ${gamePhase === 'placement' ? 'Place a piece' : (gamePhase === 'movement' ? 'Move a piece' : 'Remove a Piece')}. Black pieces Removed: ${blackPiecesRemoved}. White pieces Removed: ${whitePiecesRemoved}.`;
}

function highlightPossibleMoves(pointElement) {
    removeHighlightFromPoints();
    const adjacentPoints = getAdjacentPoints(parseFloat(pointElement.dataset.x), parseFloat(pointElement.dataset.y));
    if (adjacentPoints) {
        adjacentPoints.forEach(point => {
            const pointElement = [...board.querySelectorAll('.point')].find(p =>
                Math.abs(parseFloat(p.style.left.replace('%', '')) - point[0]) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - point[1]) < 0.5
            );
            if (pointElement && !pointElement.classList.contains('taken')) {
                pointElement.classList.add('possible-move');
            }
        });
    }
}

function removeHighlightFromPoints() {
    board.querySelectorAll('.point').forEach(point => {
        point.classList.remove('possible-move');
    });
}

function highlightMill(linePositions) {
    if (lastMill) {
        lastMill.forEach(position => {
            const pointElement = [...board.querySelectorAll('.point')].find(p =>
                Math.abs(parseFloat(p.style.left.replace('%', '')) - position.x) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - position.y) < 0.5
            );
            if (pointElement) {
                pointElement.classList.remove('mill-highlight');
            }
        });
    }

    linePositions.forEach(position => {
        const pointElement = [...board.querySelectorAll('.point')].find(p =>
            Math.abs(parseFloat(p.style.left.replace('%', '')) - position.x) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - position.y) < 0.5
        );
        if (pointElement) {
            pointElement.classList.add('mill-highlight');
        }
    });
    lastMill = linePositions;
}

function highlightRemovablePieces() {
      const pieces = [...board.querySelectorAll('.point')].filter(point =>
        point.classList.contains('taken') && point.dataset.player !== currentPlayer
    );

    const millPositions = lastMill ? lastMill.map(pos => `${pos.x}-${pos.y}`) : [];
     const nonMillPieces =  pieces.filter(piece=> !millPositions.includes(`${piece.dataset.x}-${piece.dataset.y}`));

    if(nonMillPieces.length>0)
      nonMillPieces.forEach(piece=> piece.classList.add('removable'));
    else
    pieces.forEach(piece=> piece.classList.add('removable'));
}

function removeHighlightFromRemovablePieces() {
    const pieces = [...board.querySelectorAll('.point')].filter(point =>
        point.classList.contains('removable')
    );
    pieces.forEach(piece => piece.classList.remove('removable'));
}

function checkThreeInRow(x, y) {
    const positions = {
        'x:5,y:3.5': [[1, 0], [2, 0], [0, 1], [0, 2]],
        'x:50.5,y:3.5': [[-1, 0], [1, 0], [0, 1], [0, 2]],
        'x:96,y:3.5': [[-1, 0], [-2, 0], [0, 1], [0, 2]],
        'x:16.5,y:19': [[1, 0], [-1, 0], [0, 1], [0, 2]],
        'x:50.5,y:18.5': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:82,y:19': [[-1, 0], [-2, 0], [0, 1], [0, -1]],
        'x:36.5,y:35.3': [[1, 0], [-1, 0], [0, 1], [0, 2]],
        'x:50.5,y:35.3': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:65,y:35.3': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:5,y:50': [[1, 0], [2, 0], [0, 1], [0, -1]],
        'x:16.5,y:50': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:36.5,y:50': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:65,y:50': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:83,y:50': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:96,y:50': [[-1, 0], [-2, 0], [0, 1], [0, -1]],
        'x:36.5,y:65': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:50.5,y:65': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:65,y:65': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:16.5,y:82.5': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:50,y:82': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'x:83,y:82': [[-1, 0], [-2, 0], [0, 1], [0, -1]],
        'x:5,y:97': [[1, 0], [2, 0], [0, -1], [-1, 0]],
        'x:50,y:97': [[1, 0], [-1, 0], [0, -1], [-1, 0]],
        'x:96,y:97': [[-1, 0], [-2, 0], [0, -1], [-1, 0]]
    };
    const currentPointString = `x:${x},y:${y}`;
    const currentPoint = points.find(point => `x:${point.x},y:${point.y}` === currentPointString);

    if (!currentPoint) return false;
    const adjacentPoints = positions[currentPointString];

    const checkLine = (dirX, dirY) => {
        let count = 1;
        let linePositions = [];
        linePositions.push({ x: currentPoint.x, y: currentPoint.y });
        let nextX = currentPoint.x;
        let nextY = currentPoint.y;

        for (let i = 1; i <= 2; i++) {
            nextX = parseFloat(nextX) + parseFloat(dirX * 16.5);
            nextY = parseFloat(nextY) + parseFloat(dirY * 16.5);
            let found = false;

            for (const point of points) {
                if (Math.abs(point.x - nextX) < 0.5 && Math.abs(point.y - nextY) < 0.5) {
                    linePositions.push({ x: point.x, y: point.y });
                    found = true;
                    break;
                }
            }

            if (found) {
                const pointElement = [...board.querySelectorAll('.point')].find(p =>
                    Math.abs(parseFloat(p.style.left.replace('%', '')) - nextX) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - nextY) < 0.5
                );

                if (pointElement && pointElement.dataset.player === currentPlayer) {
                    count++;
                } else {
                    break;
                }

            } else {
                break;
            }
        }

        return count === 3 ? linePositions : false;

    };
    if (adjacentPoints) {
        for (const adj of adjacentPoints) {
            const check = checkLine(adj[0], adj[1]);
            if (check) {
                return check;
            }

        }
    }
    return false;
}

function getAdjacentPoints(x, y) {
    const positions = {
        'x:5,y:3.5': [[50.5, 3.5], [5, 19]],
        'x:50.5,y:3.5': [[5, 3.5], [96, 3.5], [50.5, 18.5]],
        'x:96,y:3.5': [[50.5, 3.5], [82, 19]],
        'x:16.5,y:19': [[5, 3.5], [50.5, 18.5], [16.5, 50]],
        'x:50.5,y:18.5': [[16.5, 19], [50.5, 3.5], [82, 19], [50.5, 35.3]],
        'x:82,y:19': [[96, 3.5], [50.5, 18.5], [83, 50]],
        'x:36.5,y:35.3': [[16.5, 19], [50.5, 35.3], [36.5, 50]],
        'x:50.5,y:35.3': [[50.5, 18.5], [36.5, 35.3], [65, 35.3], [50.5, 50]],
        'x:65,y:35.3': [[82, 19], [50.5, 35.3], [65, 50]],
        'x:5,y:50': [[5, 3.5], [16.5, 50], [5, 97]],
        'x:16.5,y:50': [[16.5, 19], [5, 50], [36.5, 50], [16.5, 82.5]],
        'x:36.5,y:50': [[36.5, 35.3], [16.5, 50], [65, 50], [36.5, 65]],
        'x:65,y:50': [[65, 35.3], [36.5, 50], [83, 50], [65, 65]],
        'x:83,y:50': [[82, 19], [65, 50], [96, 50], [83, 82]],
        'x:96,y:50': [[96, 3.5], [83, 50], [96, 97]],
        'x:36.5,y:65': [[36.5, 50], [50.5, 65], [36.5, 82.5]],
        'x:50.5,y:65': [[50.5, 50], [36.5, 65], [65, 65]],
        'x:65,y:65': [[65, 50], [50.5, 65], [65, 82]],
        'x:16.5,y:82.5': [[16.5, 50], [36.5, 82], [16.5, 97]],
        'x:50,y:82': [[50.5, 65], [50, 50], [50, 97]],
        'x:83,y:82': [[83, 50], [65, 82], [83, 97]],
        'x:5,y:97': [[5, 50], [16.5, 82.5], [50, 97]],
        'x:50,y:97': [[5, 97], [50, 82], [96, 97]],
        'x:96,y:97': [[96, 50], [83, 82], [50, 97]]
    };
    const currentPointString = `x:${x},y:${y}`;
    return positions[currentPointString] || [];
}

function isAdjacent(point1, point2) {
      const adjacentPoints =  getAdjacentPoints(parseFloat(point1.style.left.replace('%', '')), parseFloat(point1.style.top.replace('%', '')));
        const  piecesOnBoard =  [...board.querySelectorAll('.point')].filter(point=>point.classList.contains('taken'));

      if(piecesOnBoard.filter(point=> point.dataset.player === currentPlayer).length <= 3)
            return true;
       return adjacentPoints.some((point)=>
        Math.abs(parseFloat(point2.style.left.replace('%', '')) - point[0]) < 0.5  &&  Math.abs(parseFloat(point2.style.top.replace('%', '')) - point[1]) < 0.5
        );
}

points.forEach(point => {
    const pointElement = document.createElement('div');
    pointElement.classList.add('point');
    pointElement.style.left = `${point.x}%`;
    pointElement.style.top = `${point.y}%`;
    pointElement.dataset.x = `${point.x}`;
    pointElement.dataset.y = `${point.y}`;

    pointElement.addEventListener('click', () => {
        if (gamePhase === 'placement') {
            if (!pointElement.classList.contains('taken') && piecesPlaced[currentPlayer] < maxPieces) {
                let canPlace = true;
                let check = checkThreeInRow(pointElement.dataset.x, pointElement.dataset.y);
                if (check) {
                    canPlace = false;
                }
                if (canPlace) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    piece.classList.add(currentPlayer === 'black' ? 'black-piece' : 'white-piece');
                    piece.style.left = `${point.x}%`;
                    piece.style.top = `${point.y}%`;
                    piece.dataset.player = currentPlayer;
                    board.appendChild(piece);
                    pointElement.classList.add('taken');
                    pointElement.dataset.player = currentPlayer;
                    piecesPlaced[currentPlayer]++;
                    const threeInRow = checkThreeInRow(pointElement.dataset.x, pointElement.dataset.y);
                    if (threeInRow) {
                        gamePhase = 'remove';
                        highlightMill(threeInRow);
                        highlightRemovablePieces();
                        updateMessage();
                        message.textContent = `Make a 3 in a row, Remove an Opponent Piece.`;
                        return;
                    }
                    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                    if (piecesPlaced.black === maxPieces && piecesPlaced.white === maxPieces) {
                        gamePhase = 'movement';
                    }
                    updateMessage();
                } else {
                    message.textContent = `Can't place here, three in a row is not allowed`;
                }
            }
        } else if (gamePhase === 'movement') {
            if (pointElement.classList.contains('taken') && pointElement.dataset.player === currentPlayer) {
                if (selectedPiece) {
                    selectedPiece.classList.remove('selected');
                    removeHighlightFromPoints();
                }
                selectedPiece = pointElement;
                selectedPiece.classList.add('selected');
                highlightPossibleMoves(pointElement);
            } else if (selectedPiece && !pointElement.classList.contains('taken')) {
                const pieceToMove = [...board.querySelectorAll('.piece')].find(img =>
                    Math.abs(parseFloat(img.style.left.replace('%', '')) - parseFloat(selectedPiece.style.left.replace('%', ''))) < 0.5 && Math.abs(parseFloat(img.style.top.replace('%', '')) - parseFloat(selectedPiece.style.top.replace('%', ''))) < 0.5
                );
                if (pieceToMove && isAdjacent(selectedPiece, pointElement)) {
                    pieceToMove.style.left = `${point.x}%`;
                    pieceToMove.style.top = `${point.y}%`;
                    selectedPiece.classList.remove('taken');
                    selectedPiece.removeAttribute('data-player');
                    pointElement.classList.add('taken');
                    pointElement.dataset.player = currentPlayer;
                    selectedPiece.classList.remove('selected');
                    removeHighlightFromPoints();
                    selectedPiece = null;
                    const threeInRow = checkThreeInRow(pointElement.dataset.x, pointElement.dataset.y);
                    if (threeInRow) {
                        gamePhase = 'remove';
                        highlightMill(threeInRow);
                        highlightRemovablePieces();
                        updateMessage();
                        message.textContent = `Make a 3 in a row, Remove an Opponent Piece.`;
                        return;
                    }
                    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                    updateMessage();
                } else {
                    message.textContent = 'Invalid move';
                }
            }
        } else if (gamePhase === 'remove') {
            if (pointElement.classList.contains('removable')) {
                const pieceToRemove = [...board.querySelectorAll('.piece')].find(img =>
                    Math.abs(parseFloat(img.style.left.replace('%', '')) - parseFloat(pointElement.style.left.replace('%', ''))) < 0.5 && Math.abs(parseFloat(img.style.top.replace('%', '')) - parseFloat(pointElement.style.top.replace('%', ''))) < 0.5
                );
                if (pieceToRemove) {
                    board.removeChild(pieceToRemove);
                    pointElement.classList.remove('taken');
                    pointElement.removeAttribute('data-player');
                    if (currentPlayer === 'black') {
                        whitePiecesRemoved++;
                    } else {
                        blackPiecesRemoved++;
                    }
                    removeHighlightFromRemovablePieces();
                    removeHighlightFromPoints();
                    if (piecesPlaced.black === maxPieces && piecesPlaced.white === maxPieces) {
                         gamePhase = 'movement';
                    }
                    else
                    {
                         gamePhase = 'placement';
                    }
                     lastMill = null;
                    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                    if (checkWinCondition()) {
                        return;
                    }
                    updateMessage();
                }
            } else {
                message.textContent = 'Invalid remove';
            }
        }
    });
    board.appendChild(pointElement);
});
function checkWinCondition() {
        const blackPieces = [...board.querySelectorAll('.point')].filter(point => point.classList.contains('taken') && point.dataset.player === 'black');
        const whitePieces = [...board.querySelectorAll('.point')].filter(point => point.classList.contains('taken') && point.dataset.player === 'white');

       if(whitePieces.length < 3 ) {
            message.textContent = 'Black wins!';
           gamePhase = 'gameOver';
           return true;
        }
         if(blackPieces.length < 3 ) {
            message.textContent = 'White wins!';
             gamePhase = 'gameOver';
            return true;
         }
           const blackCanMove =  blackPieces.some(piece=> getAdjacentPoints( parseFloat(piece.dataset.x), parseFloat(piece.dataset.y)).some(point=> {
                const pointElement = [...board.querySelectorAll('.point')].find(p =>
                     Math.abs(parseFloat(p.style.left.replace('%', '')) - point[0]) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - point[1]) < 0.5
                    );
                 return pointElement && !pointElement.classList.contains('taken')
               }));
            const whiteCanMove =  whitePieces.some(piece=> getAdjacentPoints( parseFloat(piece.dataset.x), parseFloat(piece.dataset.y)).some(point=> {
              const pointElement = [...board.querySelectorAll('.point')].find(p =>
                  Math.abs(parseFloat(p.style.left.replace('%', '')) - point[0]) < 0.5 && Math.abs(parseFloat(p.style.top.replace('%', '')) - point[1]) < 0.5
              );
              return pointElement && !pointElement.classList.contains('taken')
            }));
        if(!blackCanMove && gamePhase==='movement' && currentPlayer === 'black' )
         {
           message.textContent = 'White wins!';
           gamePhase = 'gameOver';
            return true;
         }
        if(!whiteCanMove && gamePhase ==='movement' && currentPlayer === 'white')
        {
            message.textContent = 'Black wins!';
             gamePhase = 'gameOver';
            return true;
        }

        return false;
    }

updateMessage();
