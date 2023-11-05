import { 
    tileSize,
    whiteTile,
    darkTile,
    checkTile,
    checkMateTile,
    staleMateTile,
    moveTile 
} from '../consts.js'
import * as pieces from './pieces.js'
import { PlayAgainButton } from './buttons.js'
import { buttonObjs } from '../main.js'

export class Board {
    #lastFromI
    #lastFromJ
    #lastToI
    #lastToJ
    #matrix
    #turn
    #promoting

    constructor() {
        this.#matrix = this.#init()
        this.#turn = 'white'
        this.#lastFromI = undefined
        this.#lastFromJ = undefined
        this.#lastToI = undefined
        this.#lastToJ = undefined
        this.#promoting = false
    }

    draw(ctx) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tile = this.#matrix[i][j]
                ctx.fillStyle = (i + j) % 2 === 0 ? whiteTile : darkTile
                
                if ((i === this.#lastFromI && j === this.#lastFromJ) || (i === this.#lastToI && j === this.#lastToJ)) {
                    ctx.fillStyle = moveTile
                } else if (tile !== 0 && tile.getName() === 'King' && tile.getColor() === this.#turn) {
                    const isCheckmateOrStaleMate = this.checkCheckmateOrStalemate()
                    if (isCheckmateOrStaleMate === 'checkmate') {
                        ctx.fillStyle = checkMateTile
                        buttonObjs.push(new PlayAgainButton())
                    } else if (isCheckmateOrStaleMate === 'stalemate') {
                        ctx.fillStyle = staleMateTile
                    } else if (this.checkCheck()) {
                        ctx.fillStyle = checkTile
                    }
                }

                ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize)
            }
        }
    }

    #init() {
        const mat = []

        for (let i = 0; i < 8; i++) {
            const line = []
            const color = i <= 1 ? 'black' : 'white'

            if (1 < i && i < 6) {
                for (let j = 0; j < 8; j++) {
                    line.push(0)
                }
            } else if (i === 1 || i === 6) {
                for (let j = 0; j < 8; j++) {
                    line.push(new pieces.Pawn(i, j, color))
                }
            } else {
                for (let j = 0; j < 8; j++) {
                    switch (j) {
                        case 0:
                        case 7:
                            line.push(new pieces.Rook(i, j, color))
                            break
                        case 1:
                        case 6:
                            line.push(new pieces.Knight(i, j, color))
                            break
                        case 2:
                        case 5:
                            line.push(new pieces.Bishop(i, j, color))
                            break
                        case 3:
                            line.push(new pieces.Queen(i, j, color))
                            break
                        case 4:
                            line.push(new pieces.King(i, j, color))
                            break
                    }
                }
            }

            mat.push(line)
        }

        return mat
    }

    getPieceMoves(i, j) {
        if (this.#promoting) { return [] }
        const tile = this.#matrix[i][j]
        if (tile === 0 || tile.getColor() !== this.#turn) { return [] }

        const moves = tile.getLegalMoves(this.#matrix)
        this.#matrix[i][j] = 0
        for (let i = moves.length - 1; i >= 0; i--) {
            const move = moves[i]
            const prevTile = this.#matrix[move.y][move.x]
            this.#matrix[move.y][move.x] = tile
            if (this.checkCheck()) {
                moves.splice(i, 1)
            }
            this.#matrix[move.y][move.x] = prevTile
        }
        this.#matrix[i][j] = tile

        return moves
    }

    movePiece(fromI, fromJ, toI, toJ, extra) {
        this.resetEnPassant()
        const piece = this.#matrix[fromI][fromJ]

        this.#lastFromI = fromI
        this.#lastFromJ = fromJ
        this.#lastToI = toI
        this.#lastToJ = toJ
        
        this.#matrix[toI][toJ] = piece
        this.#matrix[fromI][fromJ] = 0
        piece.setI(toI)
        piece.setJ(toJ)

        if (['Rook', 'King'].includes(piece.getName())) {
            piece.setHasMoved()
        } else if (piece.getName() === 'Pawn') {
            if (Math.abs(fromI - toI) === 2) {
                piece.setEnPassant()
            } else if (this.#matrix[toI][toJ] === 0 && toJ !== fromJ) {
                this.#matrix[fromI][toJ] = 0
            } else if (toI === 0 || toI === 7) {
                piece.promote(this.#matrix)
                this.#promoting = true
            }
        }

        if (extra) {
            this.movePiece(extra.fromI, extra.fromJ, extra.toI, extra.toJ)
        }
    }
    
    passTurn() {
        this.#turn = (this.#turn === 'white') ? 'black' : 'white'
    }
    
    getTurn() {
        return this.#turn
    }

    checkCheck() {
        let kingI
        let kingJ

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tile = this.#matrix[i][j]
                if (tile !== 0 && tile.getName() === 'King' && tile.getColor() === this.#turn) {
                    kingI = i
                    kingJ = j
                    i = 8
                    j = 8
                }
            }
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tile = this.#matrix[i][j]

                if (tile === 0 || tile.getColor() === this.#turn) {
                    continue
                }

                const moves = tile.getLegalMoves(this.#matrix)

                if (moves.some(el => el.x === kingJ && el.y === kingI)) {
                    return true
                }
            }
        }

        return false
    }

    checkCheckmateOrStalemate() {
        if (this.#promoting) {
            return false
        }

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const moves = this.getPieceMoves(i, j)
                
                if (moves.length > 0) {
                    return false
                }
            }
        }

        if (this.checkCheck()) {
            return "checkmate"
        }
        return "stalemate"
    }

    resetEnPassant() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tile = this.#matrix[i][j]
                if (tile !== 0 && tile.getName() === 'Pawn' && tile.getEnPassant()) {
                    tile.setEnPassant(false)
                }
            }
        }
    }

    getMatrix() {
        return this.#matrix
    }

    setPiece(i, j, piece) {
        this.#matrix[i][j] = piece
    }

    setPromoting(value=true) {
        this.#promoting = value
    }

    newGame() {
        this.#matrix = this.#init()
        this.#turn = 'white'
        this.#lastFromI = undefined
        this.#lastFromJ = undefined
        this.#lastToI = undefined
        this.#lastToJ = undefined
        this.#promoting = false
    }
}
