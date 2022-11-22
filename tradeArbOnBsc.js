const fs = require("fs");
const {ethers} =require('ethers');
const dotenv = require('dotenv')
const nerdamer = require('nerdamer')
require('nerdamer/Algebra')
require('nerdamer/Calculus')
require('nerdamer/Solve')
require('nerdamer/Extra')
dotenv.config()


let inTrade,  tradeSize;
let liqLessToMore = true  
let index1Count = 0,index2Count=0
let config = require('./dataSamePair.json')
const INFURA_ID = process.env.INFURA_ID
const provider = new ethers.providers.JsonRpcProvider(INFURA_ID)
const BotArb_ABI = [
  'function estimateDualDexTrade(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external view returns (uint256)',
  'function estimateDualDexTradeIN(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external view returns (uint256[] memory amounts)',
  'function getLengthPair(address router) external view returns (uint)',
  'function getAddressPair(address router,uint numberPair) external view returns (address)',
  'function getBothAddressToken(address addressPair) external view returns (address[] memory amounts)',
  'function getFactory(address router) external  pure returns (address)',
  'function getBothReservesToken(address addressPair) external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function Trade(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external ',
]
const PRIVATE_KEY = process.env.PRIVATE_KEY
const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
const contract = new ethers.Contract(
  process.env.ADDRESS_CONTRACT,
  BotArb_ABI,
  provider
)

const Pair_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
]



const main = async () => {
   await findTrade();
}

const toWei = (ether) => ethers.utils.parseEther(ether)
const toEther = (wei) => ethers.utils.formatEther(wei).toString()
const toNumber = (input) => ethers.utils.formatUnits(input, 0)

function calRatioPair() {
  //[main sell,arb buy] then? [arb sell,arb buy] .....
  let resultRation = []
  resultRation.push(arguments[0][0] / arguments[0][1])
  //console.log(`Pair 1 Ration : ${resultRation[0]}`)
  let resultCal = resultRation[0]
  //console.log(`Result: ${resultCal} `)
  for (let i = 1; i < arguments.length; i++) {
    resultRation.push(arguments[i][1] / arguments[i][0])
    //console.log(`Pair ${i + 1} Ration : ${resultRation[i]}`)
    if (i != arguments.length - 1) {
      resultCal /= resultRation[i]
      //console.log(`Result: ${resultCal} `)
    } else {
      resultCal = resultRation[i] / resultCal
    //  console.log(`final Result (>1 Good  <1 Bad): ${resultCal} `)
    }
  }
  return +resultCal
}

function calAMMMutiPair() {
  //[main sell,arb buy] then? [arb sell,arb buy] .....
  let x1 = arguments[0][0] //sell
  let y1 = arguments[0][1] //buy
  let x2 = arguments[1][0] //sell
  let y2 = arguments[1][1] //buy
  let sol
  let ans = []
  try {
    if (x1 / y2 >= 1 && y1 / x2 >= 1) {
      //use when LP MORE -> LP LESS  return amountOut for buy
      liqLessToMore = false
      sol = nerdamer.solveEquations(
        `${y1 / x1}=(${x2}+n)/(${y2}-(${y2}-((${x2}*${y2})/(${x2}+(n*0.9975)))))`,
        'n'
      )
  
    } else {
      //use when LP LESS -> LP MORE return amountIn
      liqLessToMore = true
      sol = nerdamer.solveEquations(
        `(${x1}+n)/(${y1}-(${y1}-((${x1}*${y1})/(${x1}+(n*0.9975))))) = ${y2}/${x2}`,
        'n'
      )
    }
    let eq = sol.toString()
    eq = eq.split(',')
    //console.log(eq)
  
    for (let i = 0; i < eq.length; i++) {
      var x = nerdamer(eq[i])
      let temp = x.evaluate().toString()
      ans.push(eval(temp))
    }
    return ans
  } catch (error) {
    console.error(error)
  }
  //console.log(ans)
  //ans ==> ammIn to sell
  return ans
}

const findRoutes =async () => {
  if (index2Count >= config[index1Count].length) {
    index2Count = 0
    index1Count +=1
  }
  if (index1Count >= config.length) {
    index1Count = 0
    index2Count = 0
  }
  console.log(index1Count, index2Count)
  const targetRoute = {}
  
  const addressPair1 = config[index1Count][index2Count].samePair1.addressPair
  const addressPair2 = config[index1Count][index2Count].samePair2.addressPair
  const nameToekn1 = config[index1Count][index2Count].samePair1.token0.sym
  const nameToekn2 = config[index1Count][index2Count].samePair1.token1.sym

  const contractPair1 = new ethers.Contract(addressPair1, Pair_ABI, provider)
  const contractPair2 = new ethers.Contract(addressPair2, Pair_ABI, provider)
  const reservesTokenPair1 = await contractPair1.getReserves()
  const reservesTokenPair2 = await contractPair2.getReserves()

  const ammToken0Pair1 = +toEther(reservesTokenPair1[0])
  const ammToken1Pair1 = +toEther(reservesTokenPair1[1])
  const ammToken0Pair2 = +toEther(reservesTokenPair2[0])
  const ammToken1Pair2 = +toEther(reservesTokenPair2[1])

  //[main sell,arb buy] then? [arb sell,arb buy] .....
  let cal1 = calRatioPair(
    [ammToken1Pair1, ammToken0Pair1],
    [ammToken0Pair2, ammToken1Pair2]
  ) // pancake -> biswap
  let cal2 = calRatioPair(
    [ammToken1Pair2, ammToken0Pair2],
    [ammToken0Pair1, ammToken1Pair1]
  ) // biswap-> pancake

  //[main sell,arb buy] then? [arb sell,arb buy] .....
  if (cal1 >= 1.005) {
      targetRoute.router1 = config[index1Count][index2Count].samePair1.router
      targetRoute.router2 = config[index1Count][index2Count].samePair2.router
      targetRoute.token1 = config[index1Count][index2Count].samePair1.token1.address
      targetRoute.token2 = config[index1Count][index2Count].samePair1.token0.address
    // console.log(`${targetRoute.router1} -> ${targetRoute.router2}: ${cal1}`)
    // console.log(`ammToken0Pair1${nameToekn1}: ${ammToken0Pair1}`)
    // console.log(`ammToken1Pair1${nameToekn2}: ${ammToken1Pair1}`)
    // console.log(`Ration: ${ammToken0Pair1/ammToken1Pair1}`)
    // console.log(`ammToken0Pair2${nameToekn1}: ${ammToken0Pair2}`)
    // console.log(`ammToken1Pair2${nameToekn2}: ${ammToken1Pair2}`)
    // console.log(`Ration: ${ammToken0Pair2 / ammToken1Pair2}`)
     let ans = calAMMMutiPair(
      [ammToken1Pair1, ammToken0Pair1],
      [ammToken0Pair2, ammToken1Pair2]
    )
    for (let k = 0; k < ans.length; k++) {
      if(ans[k]>0){
           targetRoute.ammount = (Number(ans[k]) * 1).toFixed(18)
      }
    }

  }else if (cal2 >= 1.005) {
    targetRoute.router1 = config[index1Count][index2Count].samePair2.router
    targetRoute.router2 = config[index1Count][index2Count].samePair1.router
    targetRoute.token1 = config[index1Count][index2Count].samePair1.token1.address
    targetRoute.token2 = config[index1Count][index2Count].samePair1.token0.address
    // console.log(`${targetRoute.router1} -> ${targetRoute.router2}: ${cal2}`)
    // console.log(`ammToken0Pair2${nameToekn1}: ${ammToken0Pair2}`)
    // console.log(`ammToken1Pair2${nameToekn2}: ${ammToken1Pair2}`)
    // console.log(`Ration: ${ammToken0Pair2 / ammToken1Pair2}`)
    // console.log(`ammToken0Pair1${nameToekn1}: ${ammToken0Pair1}`)
    // console.log(`ammToken1Pair1${nameToekn2}: ${ammToken1Pair1}`)
    // console.log(`Ration: ${ammToken0Pair1 / ammToken1Pair1}`)
     let ans =  calAMMMutiPair(
       [ammToken1Pair2, ammToken0Pair2],
       [ammToken0Pair1, ammToken1Pair1]
     )
      for (let k = 0; k < ans.length; k++) {
        if (ans[k] > 0)
        {
           targetRoute.ammount = (Number(ans[k])*1).toFixed(18)
        }
      }
  }
   index2Count +=1
   return targetRoute
}


const findTrade = async () => {
  let targetRoute;
  targetRoute = await findRoutes()
  if(Object.keys(targetRoute).length > 0 ){
    try {
  let addressMain = [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5'
  ]
  let Profit
  tradeSize = toWei(targetRoute.ammount)
    
  for(let index =0;index<addressMain.length;index++)
  {
    if (targetRoute.token1 === addressMain[index] ) 
    {
      if (liqLessToMore === true) {

        let amtBack = await contract.estimateDualDexTrade(
          targetRoute.router1,
          targetRoute.router2,
          targetRoute.token1,
          targetRoute.token2,
          tradeSize
        )
        let amtStart = toEther(tradeSize)
        amtBack = toEther(amtBack)
         Profit = (
          +(+amtBack).toFixed(18) - (+amtStart).toFixed(18)
        ).toFixed(18)
        console.log(`
(Lp Less --> More)
router: ${targetRoute.router1} => ${targetRoute.router2}
token1: ${targetRoute.token1}  
token2: ${targetRoute.token2}  
amtStart: ${(+amtStart).toFixed(18)}
amtBack: ${(+amtBack).toFixed(18)}
Profit: ${Profit}
`)
      } else if (liqLessToMore === false) {
        let amt = await contract.estimateDualDexTradeIN(
          targetRoute.router1,
          targetRoute.router2,
          targetRoute.token1,
          targetRoute.token2,
          tradeSize
        )
        tradeSize = amt[0]
        let amtStart = toEther(tradeSize)
        let amtBack = toEther(amt[1])

         Profit = (
          +(+amtBack).toFixed(18) - (+amtStart).toFixed(18)
        ).toFixed(18)
        console.log(`
(Lp More --> Less)
router: ${targetRoute.router1} => ${targetRoute.router2}
token1: ${targetRoute.token1}  
token2: ${targetRoute.token2}  
amtStart: ${(+amtStart).toFixed(18)}
amtBack: ${(+amtBack).toFixed(18)}
Profit: ${Profit}
`)
      }
 
    //Condition to Trade 
    //if Profit > gasUse
    let gasUse = 0 // can change 
    if (+Profit > gasUse) {
      console.log('Trade')
      await goTrade(
        targetRoute.router1,
        targetRoute.router2,
        targetRoute.token1,
        targetRoute.token2,
        tradeSize
      )
    }
    }
  }
    } catch (e) {
      console.log(e)
      await findTrade()
    }
  
  }
  
  await findTrade()
}

const goTrade = async (router1, router2, baseToken, token2, amount) => {
  if (inTrade === true) {
    return false
  }
  try {
    inTrade = true
    console.log('-> RUN Trade........')
    const gasLimit =1000000
    const gasPrice = ethers.utils.parseUnits('5.0', 'gwei')
    const options = {
      gasPrice: gasPrice,
      gasLimit: gasLimit,
    }
    //estimateGas for condition to Trade
    //if want to use -> USE bnbGas
    const txGas = await contract.connect(wallet).estimateGas.Trade(router1, router2, baseToken, token2, amount, options)
    const bnbGas = (+toNumber(txGas) / gasLimit) * (gasLimit*(+toEther(gasPrice)))
    console.log('EstimateGas: ', bnbGas)

    //Interacted with contract
    const tx = await contract
      .connect(wallet)
      .Trade(router1, router2, baseToken, token2, amount, options) 
    await tx.wait()
    console.log(
      'https://' + 'bscscan.com' + '/tx/' + tx.hash
    )
     
    inTrade = false
  } catch (e) {
    console.log(e)
    inTrade = false
    
  }
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
   