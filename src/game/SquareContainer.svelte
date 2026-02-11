<script lang="ts">
  let {newToken,copyToken,resetToken, handleSquare, handleMaxSquare} = $props()
  import { onMount } from "svelte";
  import { config } from "../lib/config";
  import { setupCanvas, clear, drawTriangel, drawByCells, drawPoint, getFieldCoordinateFromEvent, type FieldCoordinate, cellsEquality, drawForbiddenPoint } from "./CanvasMethods";
  import { checkForbiddenCellsNotInTriangelFromCells, clearTargetCells, generateCells, GenerateForbiddenCells, GetForbiddenCells, GetMaxSquare, getSquareFromCoordinates, GetTargetCells, type Cells, formatDailyDate, getDailyPuzzleCode } from "./MathMethods";
  import { encodePoints } from "./Сoding";
  import { getQuery, setQuery } from "../lib/queryParams";
  import { copyText, getCurrentUrl, isMouseEvent } from "../lib/utils";
  import { isMobile } from "../stores/isMobile";
  import { dailyPuzzle, setDailyPuzzle, clearDailyPuzzle } from "../stores/dailyPuzzle";

  let canvas:HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null
  let cells: Cells = generateCells();
  let MaxSquare = 0;
  function Count(){
    clear(canvas);
    let targetCells = GetTargetCells(cells);
    if (targetCells.length == 3){
      if (checkForbiddenCellsNotInTriangelFromCells(cells)){
        const square = getSquareFromCoordinates(targetCells[0], targetCells[1], targetCells[2])
        handleSquare(square)
        if (MaxSquare == square){
          drawTriangel(canvas, targetCells[0], targetCells[1], targetCells[2], "max");

        }
        else{
          drawTriangel(canvas, targetCells[0], targetCells[1], targetCells[2], "normal");
        }
      } else {
        handleSquare(0);
        drawTriangel(canvas, targetCells[0], targetCells[1], targetCells[2], "forbidden");
      }
    }
    drawByCells(canvas, cells);
  }
  onMount(()=>{
    const Size = window.innerHeight;
    ctx = setupCanvas(canvas, Size*2, Size*2);
    if (!ctx){
      return;
    };
    const key = getQuery("k");
    const useDaily = !key; // Use daily seed only if no key provided
    const code = Start(key, useDaily);
    setQuery("k", code);
  });
  function Start(key?:string|null|undefined, useDailySeed: boolean = false){
    clear(canvas)
    cells = generateCells();
    
    cells = GenerateForbiddenCells(cells, 16, key, useDailySeed);
    const ForbiddenCells = GetForbiddenCells(cells);
      for (let ForbiddenCell of ForbiddenCells){
      const x = ForbiddenCell.x
      const y = ForbiddenCell.y
      ForbiddenCell.x = y
      ForbiddenCell.y = x
    }
    const code = encodePoints(ForbiddenCells);
    
    // Check if this is today's daily puzzle by comparing codes
    const expectedDailyCode = getDailyPuzzleCode();
    if (code === expectedDailyCode) {
      setDailyPuzzle(formatDailyDate());
    } else {
      clearDailyPuzzle();
    }
    
    handleSquare(0);
    MaxSquare = GetMaxSquare(cells);
    handleMaxSquare(MaxSquare);
    drawByCells(canvas, cells);
    return code
  }
  $effect(() => {
    if (!ctx || !resetToken) return;
    resetToken;
    clear(canvas);
    const key = getQuery("k");
    // For reset, check if current puzzle is daily by comparing with expected code
    const expectedDailyCode = getDailyPuzzleCode();
    const isDaily = key === expectedDailyCode;
    const code = Start(key, isDaily);
    // setQuery("k", code);
    handleSquare(0)
    cells = clearTargetCells(cells);
    drawByCells(canvas, cells);
  });
  $effect(() => {
    if (!ctx || !copyToken) return;
    copyToken;
    const url = getCurrentUrl();
    copyText(url);
  });
  $effect(() => {
    if (!ctx || !newToken) return;
    const code = Start(undefined, false); // Random puzzle on "New" button
    setQuery("k", code);
  });
function handleCanvasClick(event:MouseEvent, canvas:HTMLCanvasElement, cells:Cells){
  const fcoord = getFieldCoordinateFromEvent(event, canvas)
  const TargetCells = GetTargetCells(cells);
  const ForbiddenCells = GetForbiddenCells(cells);
  for(let ForbiddenCell of ForbiddenCells){
      if (cellsEquality(ForbiddenCell, fcoord)){return};
  };
  if (TargetCells.length<3){
    cells[fcoord.y][fcoord.x] = "1";
    drawPoint(canvas, fcoord);
  };
  if(GetTargetCells(cells).length == 3){
    Count()
  }
};
let dragging = false;
let draggingCell: FieldCoordinate | null;
function onPointerDown(event: MouseEvent | TouchEvent){
  if (isMouseEvent(event)){
    if (!(event.buttons & 1)){
      onPointerUp(event);
    }
  }
  draggingCell = getFieldCoordinateFromEvent(event, canvas);
  const TargetCells = GetTargetCells(cells);
  dragging = false;
  for(let TargetCell of TargetCells){
      if (cellsEquality(TargetCell, draggingCell)){
        canvas.style.cursor = "grabbing"
        dragging = true; 
        break;
      }
  }
}
function onPointerUp(event: MouseEvent | TouchEvent){
  if (draggingCell) draggingCell = null;
  if (dragging) {
    dragging = false
    canvas.style.cursor = "grab"
  }
}
function onPointerMove(event: MouseEvent | TouchEvent){
  if (isMouseEvent(event)){
    if (!(event.buttons & 1)){
      onPointerUp(event);
    }

  }
  const currentCell = getFieldCoordinateFromEvent(event, canvas);
  const ForbiddenCells = GetForbiddenCells(cells);
  const TargetCells = GetTargetCells(cells);  
  let fl = false;
  if (!dragging){
    for(let TargetCell of TargetCells){
      if (cellsEquality(TargetCell, currentCell)){canvas.style.cursor = "grab"; fl=true;return}
    }
  }
  if (dragging){canvas.style.cursor = "grabbing"} 
  else if (!fl){canvas.style.cursor="default"}
  if (!cellsEquality(draggingCell, currentCell)){
    for(let TargetCell of TargetCells){
      if (cellsEquality(TargetCell, currentCell)){return}
    }
    for(let ForbiddenCell of ForbiddenCells){
      if (cellsEquality(ForbiddenCell, currentCell)){return}
    }
    if (!draggingCell || !dragging) return
    cells[draggingCell.y][draggingCell.x] = ""
    cells[currentCell.y][currentCell.x] = "1"
    draggingCell.x = currentCell.x
    draggingCell.y = currentCell.y
    clear(canvas)
    drawByCells(canvas, cells);
    Count()
  }
}
</script>

<style>
  canvas{
    border: 2px solid var(--line-game-color);
    touch-action: none;
    height: calc(100vh - 324px);
  }
  canvas.mobile{
    min-width: 300px;
    max-width: 85vw;
    height: unset;
  }
</style>

<canvas class:mobile={$isMobile}
  bind:this={canvas}
  onclick= {(event)=>{handleCanvasClick(event, canvas, cells)}}
  onmousedown={onPointerDown}
  onmousemove={onPointerMove}
  onmouseup={onPointerUp}
  ontouchstart={onPointerDown}
  ontouchmove={onPointerMove}
  ontouchend={onPointerUp}
  ontouchcancel={onPointerUp}
></canvas>
