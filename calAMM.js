const nerdamer = require('nerdamer')
require('nerdamer/Algebra')
require('nerdamer/Calculus')
require('nerdamer/Solve')
require('nerdamer/Extra')
let liqLessToMore = false
let calAMM

//////////////////////////////////////////////////////////////////////////////////
//94781884.284722067962798239   busd       991.9861803364 busd 
//94699896.246303358765962232   usdt       0.008911144541043 usdt 

Test([94781884.284722067962798239, 94699896.246303358765962232], [0.008911144541043 , 991.9861803364])
function Test(){
  //[main sell,arb buy] then? [arb sell,arb buy] .....
  //arguments[0][0] main
  //arguments[0][1] arb
  //arguments[1][0] arb 
  //arguments[1][1] main
  let RationPair, reserveIn1, reserveOut1, reserveIn2, reserveOut2 
  let RationPair1 = calRatioPair([arguments[0][0], arguments[0][1]], [arguments[1][0], arguments[1][1]])
  let RationPair2 = calRatioPair([arguments[1][1], arguments[1][0]], [arguments[0][1], arguments[0][0]])
  if(RationPair1>1){
    RationPair = RationPair1
    reserveIn1 = arguments[0][0]
    reserveOut1 = arguments[0][1]
    reserveIn2 = arguments[1][0]
    reserveOut2 = arguments[1][1]
    calAMM=calAMMMutiPair([arguments[0][0], arguments[0][1]], [arguments[1][0], arguments[1][1]])
  }else if(RationPair2>1){
    RationPair = RationPair2
    reserveIn1 = arguments[1][1]
    reserveOut1 = arguments[1][0]
    reserveIn2 = arguments[0][1]
    reserveOut2 = arguments[0][0]
    calAMM=calAMMMutiPair([arguments[1][1], arguments[1][0]], [arguments[0][1], arguments[0][0]])
  }

  if (liqLessToMore === true)
  {
    let amountIn1 = calAMM
    let amountOut1 = calAmmountOut(reserveIn1, reserveOut1, amountIn1)
    console.log('START')
    console.log('Pool1 ')
    console.log('Sell amount', amountIn1)
    console.log('Buy amount', amountOut1)
    console.log(`amountToken1: ${reserveIn1}   ===Arbitrage===>>>   amountToken1: ${(reserveIn1 + amountIn1)} `)
    console.log(`amountToken2: ${reserveOut1}   ===Arbitrage===>>>   amountToken2: ${(reserveOut1 - amountOut1)}`)
    console.log(`Ratio pool1: ${reserveOut1 / reserveIn1}   ===Arbitrage===>>>   Ratio pool1: ${(reserveOut1 - amountOut1) / (reserveIn1 + amountIn1)} `)



    console.log('========================')

    let amountIn2 = amountOut1
    let amountOut2 = calAmmountOut(reserveIn2, reserveOut2, amountIn2)
    console.log('Pool2 ')
    console.log('Sell amount', amountIn2)
    console.log('Buy amount', amountOut2)
    console.log(`amountToken1: ${reserveIn2}   ===Arbitrage===>>>   amountToken1: ${(reserveIn2 + amountIn2)} `)
    console.log(`amountToken2: ${reserveOut2}   ===Arbitrage===>>>   amountToken2: ${(reserveOut2 - amountOut2)}`)
    console.log(`Ratio pool1: ${reserveIn2/ reserveOut2}   ===Arbitrage===>>>   Ratio pool1: ${(reserveIn2 + amountIn2) / (reserveOut2 - amountOut2)} `)

   console.log('Profit: ', amountOut2 - amountIn1)
  }else if(liqLessToMore === false)
  {
    let amountOut1 = calAMM
    let amountIn1 = calAmmountIn(reserveIn1, reserveOut1, amountOut1)
    console.log('START')
    console.log('Pool1 ')
    console.log('Sell amount', amountIn1)
    console.log('Buy amount', amountOut1)
    console.log(`amountToken1: ${reserveIn1}   ===Arbitrage===>>>   amountToken1: ${(reserveIn1 + amountIn1)} `)
    console.log(`amountToken2: ${reserveOut1}   ===Arbitrage===>>>   amountToken2: ${(reserveOut1 - amountOut1)}`)
    console.log(`Ratio pool1: ${reserveOut1 / reserveIn1}   ===Arbitrage===>>>   Ratio pool1: ${(reserveOut1 - amountOut1) / (reserveIn1 + amountIn1)} `)
    

    console.log('========================')

    let amountIn2 = amountOut1
    let amountOut2 = calAmmountOut(reserveIn2, reserveOut2, amountIn2)
    console.log('START')
    console.log('Pool2 ')
    console.log('Sell amount', amountIn2)
    console.log('Buy amount', amountOut2)
    console.log(`amountToken1: ${reserveIn2}   ===Arbitrage===>>>   amountToken1: ${(reserveIn2 + amountIn2)} `)
    console.log(`amountToken2: ${reserveOut2}   ===Arbitrage===>>>   amountToken2: ${(reserveOut2 - amountOut2)}`)
    console.log(`Ratio pool1: ${reserveIn2 / reserveOut2}   ===Arbitrage===>>>   Ratio pool1: ${(reserveIn2 + amountIn2) / (reserveOut2 - amountOut2)} `)


    console.log('Profit: ', amountOut2 - amountIn1)
  }
}

function calAmmountIn(reserveIn, reserveOut, amountOut) {
  let k = reserveIn * reserveOut
  let amountIn = (k / (reserveOut - amountOut) - reserveIn) / 0.9975
  return +amountIn
}
function calAmmountOut(reserveIn, reserveOut, amountIn) {
  let k = reserveIn * reserveOut
  let amountOut = reserveOut - k / (reserveIn + amountIn * 0.9975)
  return +amountOut
}


function calRatioPair() {
  let resultRation = []
  resultRation.push(arguments[0][0] / arguments[0][1])
  //console.log(`Pair 1 Ration : ${resultRation[0]}`)
  let resultCal = resultRation[0]
  //console.log(`Result: ${resultCal} `)
  for (let i = 1; i < arguments.length; i++) {
    resultRation.push(arguments[i][1] / arguments[i][0])
   // console.log(`Pair ${i + 1} Ration : ${resultRation[i]}`)
    if (i != arguments.length - 1) {
      resultCal /= resultRation[i]
    //  console.log(`Result: ${resultCal} `)
    } else {
      resultCal = resultRation[i] / resultCal
     // console.log(`final Result (>1 Good  <1 Bad): ${resultCal} `)
    }
  }
  return +resultCal
}

function calAMMMutiPair() {
  let x1 = arguments[0][0] //sell
  let y1 = arguments[0][1] //buy
  let x2 = arguments[1][0] //sell
  let y2 = arguments[1][1] //buy
  let sol
  if (x1 / y2 >= 1 && y1 / x2 >= 1) {
    //use when LP MORE -> LP LESS  return ammountOut to buy
    console.log('LP MORE -> LP LESS')
    liqLessToMore = false
    sol = nerdamer.solveEquations(
      `${y1 / x1}=(${x2}+n)/(${y2}-(${y2}-((${x2}*${y2})/(${x2}+(n*0.9975)))))`,
      'n'
    )
    //  sol = nerdamer.solveEquations(
    //   `(${x1}+n)/(${y1}-(${y1}-((${x1}*${y1})/(${x1}+(n*0.9975))))) = (${y2}-(${y2}-((${x2}*${y2})/(${x2}+(n*0.9975)))))/(${x2}+n)`,
    //   'n'
    // )
  } else {
    //use when LP LESS -> LP MORE return ammountIn
    console.log('LP LESS -> LP MORE')
    liqLessToMore = true
    sol = nerdamer.solveEquations(
      `(${x1}+n)/(${y1}-(${y1}-((${x1}*${y1})/(${x1}+(n*0.9975))))) = ${y2}/${x2}`,
      'n'
    )
  }

  let eq = sol.toString()
  eq = eq.split(',')
 // console.log(eq)

  let ans = []
  for (let i = 0; i < eq.length; i++) {
    var x = nerdamer(eq[i])
    let temp = x.evaluate().toString()
    ans.push(eval(temp))
  }
   //console.log(ans)
  for(let i =0;i<ans.length;i++){
    if(ans[i]>0){
      return ans[i]
    }
  }
  return ans[0]
}

