import { Board } from './classes/board.js'
import { canvasId, moveCircle, tileSize } from './consts.js'

export let buttonObjs = []
export let moves = []
export const mainBoard = new Board()
export const canvas = document.getElementById(canvasId)
export const ctx = canvas.getContext('2d')

export function clearMoves() {
    moves = []
}

export function setMoves(value) {
    moves = value
}

export function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    mainBoard.draw(ctx)
    
    for (const line of mainBoard.getMatrix()) {
        for (const tile of line) {
            if (tile !== 0) {
                tile.draw(ctx)
            }
        }
    }
    
    for (const button of buttonObjs) {
        button.draw(ctx)
    }

    ctx.fillStyle = moveCircle
    for (const move of moves) {
        ctx.beginPath()
        ctx.arc(
            tileSize / 2 + move.x * tileSize,
            tileSize / 2 + move.y * tileSize,
            tileSize * 0.1,
            0, Math.PI * 2
        )
        ctx.fill()
    }

}
