import type { FieldCoordinate } from "./CanvasMethods"
import { encodePoints, decodePoints } from "./Сoding";
import { config } from "../lib/config";
export type Cells=String[][]

// Seeded random generator (mulberry32)
let seed: number | null = null;

export function setSeed(newSeed: number): void {
  seed = newSeed;
}

export function clearSeed(): void {
  seed = null;
}

function mulberry32(a: number): number {
  let t = a += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function RandomNumber(start: number, end: number): number {
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  const random = seed !== null ? mulberry32(seed++) : Math.random();
  return from + Math.floor(random * (to - from + 1));
}

// Get daily seed based on UTC date (YYYYMMDD)
export function getDailySeed(): number {
  const now = new Date();
  const utcDate = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor(utcDate / 86400000); // Convert to days since epoch
}

// Format date for display
export function formatDailyDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function generateCells():Cells{
  let cells: Cells = [];
  for (let i = 0; i<config.fieldHeight;i++){
    let row:String[]=[];
    for(let j = 0; j<config.fieldWidth; j++){
      row.push("")
    };
    cells.push(row);
  };
  return cells;
};
export function GetTargetCells(cells:Cells){
  let SuitablePoints:FieldCoordinate[]= [];
  for(let i in cells){
    for (let j in cells[i]){
      if (cells[i][j] == "1"){
        SuitablePoints.push({x:Number(j), y:Number(i)});
      }
    };
  };
  return SuitablePoints;
};
export function GetForbiddenCells(cells:Cells){
  let ForbiddenCells:FieldCoordinate[]= [];
  for(let i in cells){
    for (let j in cells[i]){
      if (cells[i][j] == "-1"){
        ForbiddenCells.push({x:Number(j), y:Number(i)});
      }
    };
  };
  return ForbiddenCells;
};
export function getSquareFromCoordinates(coord1: FieldCoordinate, coord2: FieldCoordinate, coord3: FieldCoordinate):number{
  const points = [coord1, coord2, coord3].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
  const [p1, p2, p3] = points;
  return Math.abs(p1.x*(p2.y-p3.y)+p2.x*(p3.y-p1.y)+p3.x*(p1.y-p2.y))/2
}

export function GenerateForbiddenCells(cells: Cells, quantity:number, key:string|null|undefined, useDailySeed: boolean = false): Cells{
  if (key){
    let arr = decodePoints(key)
    if (!arr){return GenerateForbiddenCells(cells, quantity, "")}
    for (let f of arr){
      cells[f.x][f.y] = '-1'
    }
  } else {
    // Set daily seed if requested
    if (useDailySeed) {
      setSeed(getDailySeed());
    }
    
    let arr:FieldCoordinate[]=[]
    for (let i=0; i<quantity; i++){
      const x = RandomNumber(0, 15)
      const y = RandomNumber(0, 15)
      cells[x][y] = "-1"
      arr.push({x:x, y:y})
    }
    
    // Clear seed after generation
    clearSeed();
    
    // console.log(encodePoints(arr))
    if (arr.length !=16){
      return GenerateForbiddenCells(cells, quantity, key, useDailySeed)
    }
  }
  return cells
}

// Generate today's daily puzzle code for comparison
export function getDailyPuzzleCode(): string {
  const cells = generateCells();
  setSeed(getDailySeed());
  
  for (let i = 0; i < 16; i++) {
    const x = RandomNumber(0, 15);
    const y = RandomNumber(0, 15);
    cells[x][y] = "-1";
  }
  
  clearSeed();
  
  // Get forbidden cells in the same order as Start function
  const ForbiddenCells = GetForbiddenCells(cells);
  
  // Swap coordinates (as done in Start function)
  for (let f of ForbiddenCells) {
    const tempX = f.x;
    f.x = f.y;
    f.y = tempX;
  }
  
  return encodePoints(ForbiddenCells);
}
function checkForbiddenCellNotInTriangel( ForbiddenCell:FieldCoordinate, 
                                          TargetCell1: FieldCoordinate, 
                                          TargetCell2:FieldCoordinate, 
                                          TargetCell3:FieldCoordinate):boolean{
  return !(getSquareFromCoordinates(TargetCell1, TargetCell2, TargetCell3) == 
  getSquareFromCoordinates(ForbiddenCell, TargetCell2, TargetCell3) + 
  getSquareFromCoordinates(ForbiddenCell, TargetCell1, TargetCell3) + 
  getSquareFromCoordinates(ForbiddenCell, TargetCell1, TargetCell2));
};
export function checkForbiddenCellsNotInTriangel( ForbiddenCells: FieldCoordinate[],
                                                  TargetCell1: FieldCoordinate, 
                                                  TargetCell2: FieldCoordinate, 
                                                  TargetCell3: FieldCoordinate, 
                                                  ): boolean{
  let ans:boolean = true;
  for(let ForbiddenCell of ForbiddenCells){
    if (!checkForbiddenCellNotInTriangel(ForbiddenCell, TargetCell1, TargetCell2, TargetCell3)){
      ans = false;
      break;
    };
  }
  return ans;
}
export function checkForbiddenCellsNotInTriangelFromCells(cells: Cells):boolean{
  let ForbiddenCells = GetForbiddenCells(cells);
  let TargetCells = GetTargetCells(cells);
  return checkForbiddenCellsNotInTriangel(ForbiddenCells, TargetCells[0], TargetCells[1], TargetCells[2]);
};
export function clearTargetCells(cells: Cells): Cells{
  let TargetCells = GetTargetCells(cells);
  for (let TargetCell of TargetCells){
    cells[TargetCell.y][TargetCell.x] = ""
  }
  return cells
}
// export function GetMaxSquare(cells: Cells): number{
//   // console.time("a")
//   let ans: number = 0;
//   let dots: FieldCoordinate[]= [];
//   const ForbiddenCells = GetForbiddenCells(cells);
//   for(let x1 = 0; x1<config.fieldHeight; x1++){
//     for(let y1 = 0; y1<config.fieldWidth; y1++){
//       for(let x2 = 0; x2<config.fieldHeight; x2++){
//         for(let y2 = 0; y2<config.fieldWidth; y2++){
//           for(let x3 = 0; x3<config.fieldHeight; x3++){
//             for(let y3 = 0; y3<config.fieldWidth; y3++){
//               if (checkForbiddenCellsNotInTriangel(ForbiddenCells, 
//                 {x:x1, y:y1},
//                 {x:x2, y:y2},
//                 {x:x3, y:y3},
//               )){
//                 const sq = getSquareFromCoordinates(  {x:x1, y:y1},
//                                                       {x:x2, y:y2},
//                                                       {x:x3, y:y3})
//                 if (sq>ans){
//                   dots = []
//                   dots.push({x:x1, y:y1})
//                   dots.push({x:x2, y:y2})
//                   dots.push({x:x3, y:y3})
//                   ans = sq
//                 }
//               };
//             };
//           };
//         };
//       };
//     };
//   };
//   // console.timeEnd("a")
//   console.log(dots)
//   return ans;
// }
export function GetMaxSquare(cells: Cells): number{
  const ForbiddenCells = GetForbiddenCells(cells);
  const w = config.fieldWidth
  const h = config.fieldHeight
  let ans: number =  (h-1)*(w-1)/2/ForbiddenCells.length;
  let dots: FieldCoordinate[]=[];
  for(let a=0; a < w*h; a++){
  if ((w-1)*(h-(~~a/w)) <= 2*ans) {
    break;
  }
    for(let b=a+1; b < w*h; b++){
    for(let c=b+1; c < w*h; c++){
      const x1=a%w
    const y1=~~(a/w)
    const x2=b%w
    const y2=~~(b/w)
    const x3=c%w
    const y3=~~(c/w)
    if ((x1 == x2 && x2 == x3) || (y1 == y2 && y2 == y3)) {
      continue;
    }
    const sq = getSquareFromCoordinates(  {x:x1, y:y1},
                                              {x:x2, y:y2},
                                              {x:x3, y:y3})
    if (sq > ans){
          if (checkForbiddenCellsNotInTriangel(ForbiddenCells, 
            {x:x1, y:y1},
            {x:x2, y:y2},
            {x:x3, y:y3},
          )){
            dots = []
            dots.push({x:x1, y:y1})
            dots.push({x:x2, y:y2})
            dots.push({x:x3, y:y3})
            ans = sq
      if (ans == (h-1)*(w-1)/2) {
        console.log(dots)
        return ans;
      }
          };
        }
      };
    };
  };
  console.log(dots)
  return ans;
}
