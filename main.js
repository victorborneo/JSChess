import { tileSize } from './consts.js'
import {
    mainBoard,
    buttonObjs,
    canvas,
    redraw,
    moves,
    clearMoves,
    setMoves
} from './shared.js'

let fromI
let fromJ

canvas.width = tileSize * 8
canvas.height = tileSize * 8

function main() {
    redraw()

    canvas.addEventListener('mousedown', evt => {
        for (const button of buttonObjs) {
            if (button.pressed(evt.clientX, evt.clientY)) {
                button.whenPressed()
                return
            }
        }

        let flag = false
        let i = Math.min(Math.floor((evt.clientY - canvas.offsetTop) / tileSize), 7)
        let j = Math.min(Math.floor((evt.clientX - canvas.offsetLeft) / tileSize), 7)

        for (let move of moves) {
            if (move.x === j && move.y === i) {
                mainBoard.movePiece(fromI, fromJ, i, j, move.extra)
                mainBoard.passTurn()
                flag = true
                clearMoves()
            }
        }

        if (!flag) {
            setMoves(mainBoard.getPieceMoves(i, j))
            fromI = i
            fromJ = j
        }

        redraw()
    })
}

if (typeof window !== 'undefined') {
    window.onload = function() {
        main()
    }
}
