import { tileSize, moveCircle } from './consts.js'
import {
    mainBoard,
    buttonObjs,
    canvas,
    ctx
} from './shared.js'

let fromI
let fromJ
let moves = []

canvas.width = tileSize * 8
canvas.height = tileSize * 8

function redraw() {
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

function main() {
    redraw()

    canvas.addEventListener('mousedown', evt => {
        for (const button of buttonObjs) {
            if (button.pressed(evt.clientX, evt.clientY)) {
                button.whenPressed()
                redraw()
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
                moves = []
            }
        }

        if (!flag) {
            moves = mainBoard.getPieceMoves(i, j)
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
