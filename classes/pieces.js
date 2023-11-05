import { tileSize, promoteTile } from '../consts.js'
import * as buttons from './buttons.js'
import { buttonObjs } from '../main.js'

function isInBound(i, j) {
    return 0 <= i && i <= 7 && 0 <= j && j <= 7
}

class Piece {
    #i
    #j
    #color
    #img

    constructor(i, j, color) {
        this.#i = i
        this.#j = j
        this.#color = color
        this.#img = new Image()
        this.#img.src = `../images/${this.#color}${this.getName()}.png`
    }

    getI() {
        return this.#i
    }

    setI(i) {
        this.#i = i
    }

    getJ() {
        return this.#j
    }

    setJ(j) {
        this.#j = j
    }

    getColor() {
        return this.#color
    }

    getName() {
        return this.constructor.name
    }

    draw(ctx) {
        ctx.drawImage(this.#img, this.#j * tileSize, this.#i * tileSize, tileSize, tileSize)
    }

    getLegalMoves() {
        throw new Error(`Class ${this.getName()} missing method getLegalMoves`)
    }
}

export class Pawn extends Piece {
    #EnPassant

    constructor(i, j, color) {
        super(i, j, color)
        this.#EnPassant = false
    }

    getLegalMoves(matrix) {
        let i = this.getI()
        let j = this.getJ()
        let color = this.getColor()
        let direction = 1
        const moves = []

        if (color === 'white') { direction = -1 }
        for (let n = 1; n > 0; n++) {
            if (n === 2) {
                n = -1
            }
            
            if (!isInBound(i, j + n)) {
                continue
            }
            
            const tile = matrix[i][j + n]
            if (tile !== 0 && tile.getName() === 'Pawn' && tile.getColor() !== this.getColor() && tile.getEnPassant()) {
                moves.push({x: j + n, y: i + direction})
            }
        }
        
        const n = (i === 1 || i === 6) ? 2 : 1
        const cond = (direction === -1) ?
            function (i2) {
                return i2 >= i - n
            } :
            function (i2) {
                return i2 <= i + n
            }

        for (let i2 = i + direction; cond(i2); i2 += direction) {
            if (!isInBound(i2, j)) {
                continue
            }

            if (matrix[i2][j] !== 0) {
                break
            }

            moves.push({x: j, y: i2})
        }

        let i2 = i + direction
        let j2 = j - 1
        if (isInBound(i2, j2) && matrix[i2][j2] !== 0 && color !== matrix[i2][j2].getColor()) {
            moves.push({x: j2, y: i2})
        }
        j2 = j + 1
        if (isInBound(i2, j2) && matrix[i2][j2] !== 0 && color !== matrix[i2][j2].getColor()) {
            moves.push({x: j2, y: i2})
        }

        return moves
    }
    
    setEnPassant(value=true) {
        this.#EnPassant = value
    }

    getEnPassant() {
        return this.#EnPassant
    }

    promote() {
        let c = 0
        const linker = {
            'Queen': Queen,
            'Rook': Rook,
            'Knight': Knight,
            'Bishop': Bishop
        }

        for (const piece of ['Queen', 'Rook', 'Knight', 'Bishop']) {
            buttonObjs.push(new buttons.PromoteButton(
                this.getJ() * tileSize,
                (this.getI() + c) * tileSize,
                tileSize, tileSize,
                promoteTile,
                new linker[piece](this.getI() + c, this.getJ(), this.getColor()),
                this.getI(), this.getJ())
            )

            if (this.getColor() === 'white') {
                c++
            } else { c-- }
        }
    }
}

export class Rook extends Piece {
    #hasMoved

    constructor(i, j, color) {
        super(i, j, color)
        this.#hasMoved = false
    }

    getLegalMoves(matrix) {
        const i = this.getI()
        const j = this.getJ()
        const color = this.getColor()
        const moves = []
        
        let cond 
        for (let n = 1; n > 0; n++) {
            if (n == 2) { 
                n = -1
                cond = function(i2) { return i2 >= 0 }
            } else {
                cond = function(i2) { return i2 <= 7 }
            }
            for (let i2 = i + n; cond(i2); i2 += n) {
                if (!isInBound(i2, j)) {
                    continue
                }
    
                if (matrix[i2][j] !== 0) {
                    if (color !== matrix[i2][j].getColor()) {
                        moves.push({x: j, y: i2})
                    }
                    break
                }
    
                moves.push({x: j, y: i2})
            }
        }

        for (let n = 1; n > 0; n++) {
            if (n == 2) { 
                n = -1
                cond = function(j2) { return j2 >= 0 }
            } else {
                cond = function(j2) { return j2 <= 7 }
            }
            for (let j2 = j + n; cond(j2); j2 += n) {
                if (!isInBound(i, j2)) {
                    continue
                }
    
                if (matrix[i][j2] !== 0) {
                    if (color !== matrix[i][j2].getColor()) {
                        moves.push({x: j2, y: i})
                    }
                    break
                }
    
                moves.push({x: j2, y: i})
            }
        }

        return moves
    }

    setHasMoved() {
        this.#hasMoved = true
    }

    getHasMoved() {
        return this.#hasMoved
    }
}

export class Knight extends Piece {
    constructor(i, j, color) {
        super(i, j, color)
    }

    getLegalMoves(matrix) {
        const i = this.getI()
        const j = this.getJ()
        const color = this.getColor()
        const moves = []

        const dirs = [[-2, -1], [2, 1], [2, -1], [-2, 1], [-1, 2], [1, 2], [-1, -2], [1, -2]]

        for (let dir of dirs) {
            let i2 = i + dir[0]
            let j2 = j + dir[1]

            if (!isInBound(i2, j2)) {
                continue
            }

            if (matrix[i2][j2] !== 0) {
                if (color !== matrix[i2][j2].getColor()) {
                    moves.push({x: j2, y: i2})
                }
                continue
            }

            moves.push({x: j2, y: i2})
        }

        return moves
    }
}

export class Bishop extends Piece {
    constructor(i, j, color) {
        super(i, j, color)
    }

    getLegalMoves(matrix) {
        const i = this.getI()
        const j = this.getJ()
        const color = this.getColor()
        const moves = []
        
        let cond 
        for (let n = 1; n > 0; n++) {
            if (n == 2) { 
                n = -1
                cond = function(i2, j2) { return i2 >= 0 && j2 >= 0}
            } else {
                cond = function(i2, j2) { return i2 <= 7 && j2 <= 7}
            }
            for (let i2 = i + n, j2 = j + n; cond(i2, j2); i2 += n, j2 += n) {
                if (!isInBound(i2, j2)) {
                    continue
                }
    
                if (matrix[i2][j2] !== 0) {
                    if (color !== matrix[i2][j2].getColor()) {
                        moves.push({x: j2, y: i2})
                    }
                    break
                }
    
                moves.push({x: j2, y: i2})
            }
        }

        for (let n = 1; n > 0; n++) {
            if (n == 2) { 
                n = -1
                cond = function(i2, j2) { return i2 >= 0 && j2 >= 0}
            } else {
                cond = function(i2, j2) { return i2 <= 7 && j2 <= 7}
            }
            for (let i2 = i + n, j2 = j - n; cond(i2, j2); i2 += n, j2 -= n) {
                if (!isInBound(i2, j2)) {
                    continue
                }
    
                if (matrix[i2][j2] !== 0) {
                    if (color !== matrix[i2][j2].getColor()) {
                        moves.push({x: j2, y: i2})
                    }
                    break
                }
    
                moves.push({x: j2, y: i2})
            }
        }

        return moves
    }
}

export class Queen extends Piece {
    constructor(i, j, color) {
        super(i, j, color)
    }

    getLegalMoves(matrix) {
        const moves = []

        let dummyRook = new Rook(this.getI(), this.getJ(), this.getColor())
        let dummyBishop = new Bishop(this.getI(), this.getJ(), this.getColor())

        moves.push(...dummyRook.getLegalMoves(matrix))
        moves.push(...dummyBishop.getLegalMoves(matrix))

        return moves
    }
}

export class King extends Piece {
    #hasMoved

    constructor(i, j, color) {
        super(i, j, color)
        this.#hasMoved = false
    }

    getLegalMoves(matrix) {
        const i = this.getI()
        const j = this.getJ()
        const color = this.getColor()
        const dirs = [[-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]
        const moves = []

        for (let dir of dirs) {
            let i2 = i + dir[0]
            let j2 = j + dir[1]

            if (!isInBound(i2, j2)) {
                continue
            }

            if (matrix[i2][j2] !== 0) {
                if (color !== matrix[i2][j2].getColor()) {
                    moves.push({x: j2, y: i2})
                }
                continue
            }

            moves.push({x: j2, y: i2})
        }

        if (!this.#hasMoved) {
            const opponentMoves = []

            for (let i2 = 0; i2 < 8; i2++) {
                for (let j2 = 0; j2 < 8; j2++) {
                    const tile = matrix[i2][j2]
                    if (tile !== 0 && tile.getName() !== 'King' && tile.getColor() !== this.getColor()) {
                        opponentMoves.push(...tile.getLegalMoves(matrix))
                    }
                }
            }

            for (let i2 = 0; i2 < 8; i2 += 7) {
                for (let j2 = 0; j2 < 8; j2 += 7) {
                    const tile = matrix[i2][j2]
                    if (tile !== 0 && tile.getName() === 'Rook' && !tile.getHasMoved() && tile.getColor() === this.getColor()) {
                        let pathClear = true
                        let direction = j2 - j > 0 ? 1 : -1

                        for (let n = 1; n < Math.abs(j2 - j); n++) {
                            const jAux = j + n * direction
                            if (matrix[i][jAux] !== 0 || opponentMoves.some(el => el.x === jAux && el.y === i)) {
                                pathClear = false
                                break
                            }
                        }

                        if (!pathClear) {
                            continue
                        }

                        moves.push(
                            {
                                x: j2 === 0 ? j - 2 : j + 2,
                                y: i,
                                extra: {
                                    fromI: i2,
                                    fromJ: j2,
                                    toI: i,
                                    toJ: j2 === 0 ? j - 1 : j + 1
                                }
                            }
                        )
                    }
                }
            }
        }

        return moves
    }

    setHasMoved() {
        this.#hasMoved = true
    }
}
