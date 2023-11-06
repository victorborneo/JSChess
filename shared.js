import { Board } from './classes/board.js'
import { canvasId } from './consts.js'

export let buttonObjs = []
export const mainBoard = new Board()
export const canvas = document.getElementById(canvasId)
export const ctx = canvas.getContext('2d')
