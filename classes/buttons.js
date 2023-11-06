import {
    buttonObjs,
    mainBoard,
    canvas,
    redraw
} from "../shared.js"
import { tileSize, playAgainButtonColor } from "../consts.js"

class Button {
    #x
    #y
    #width
    #height
    #color

    constructor(x, y, width, height, color) {
        this.#x = x
        this.#y = y
        this.#width = width
        this.#height = height
        this.#color = color
    }

    pressed(x, y) {
        const isInX = this.#x <= x && x <= this.#x + this.#width
        const isInY = this.#y <= y && y <= this.#y + this.#height
        return isInX && isInY
    }

    whenPressed() {
        throw new Error(`Method ${this.constructor.name} missing method 'whenPressed'`)   
    }

    draw() {
        throw new Error(`Method ${this.constructor.name} missing method 'draw'`)   
    }

    getX() {
        return this.#x
    }

    getY() {
        return this.#y
    }

    getWidth() {
        return this.#width
    }

    getHeight() {
        return this.#height
    }

    getColor() {
        return this.#color
    }
}

export class PlayAgainButton extends Button {
    constructor() {
        const width = tileSize * 3.9
        const height = tileSize * 1.9
        const x = (canvas.width - width) / 2
        const y = (canvas.height - height) / 2
        const color = playAgainButtonColor
        super(x, y, width, height, color)
    }

    draw(ctx) {
        ctx.fillStyle = this.getColor()
        ctx.beginPath()
        ctx.roundRect(this.getX(), this.getY(), this.getWidth(), this.getHeight(), 100)
        ctx.fill()

        const fontSize = tileSize / 2
        ctx.fillStyle = 'white'
        ctx.font = `${fontSize}px Arial`
        ctx.textAlign = 'center'

        mainBoard.passTurn()
        let winner = mainBoard.getTurn()
        winner = winner.charAt(0).toUpperCase() + winner.slice(1)

        ctx.fillText(`${winner} wins!`, tileSize * 4, tileSize * 3.9)
        ctx.fillText('Play Again', tileSize * 4, tileSize * 3.9 + fontSize)
    }

    whenPressed() {
        buttonObjs.splice(0, buttonObjs.length)
        mainBoard.newGame()
        redraw()
    }
}

export class PromoteButton extends Button {
    #piece
    #originalI
    #originalJ

    constructor(x, y, width, height, color, piece, originalI, originalJ) {
        super(x, y, width, height, color)
        this.#piece = piece
        this.#originalI = originalI
        this.#originalJ = originalJ
    }

    draw(ctx) {
        ctx.fillStyle = this.getColor()
        ctx.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight())
        this.#piece.draw(ctx)
    }

    whenPressed() {
        buttonObjs.splice(0, buttonObjs.length)
        this.#piece.setI(this.#originalI)
        this.#piece.setJ(this.#originalJ)
        mainBoard.setPiece(this.#originalI, this.#originalJ, this.#piece)
        mainBoard.setPromoting(false)
        redraw()
    }
}
