const fs = require('fs')
const { ethers } = require('ethers')
const config = require('./data.json')
require('dotenv').config()

const FileName = 'BakerySwap'
const Length = 100
const ADDRESS_ROUTER = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'



const locationFile = `./data${FileName}Pair.json`
const INFURA_ID = process.env.INFURA_ID
const provider = new ethers.providers.JsonRpcProvider(INFURA_ID)
const BotArb_ABI = [
  'function estimateDualDexTrade(address _router1, address _router2, address _token1, address _token2, uint256 _amount) external view returns (uint256)',
  'function getLengthPair(address router) external view returns (uint)',
  'function getAddressPair(address router,uint numberPair) external view returns (address)',
  'function getBothAddressToken(address addressPair) external view returns (address[] memory amounts)',
  'function getFactory(address router) external  pure returns (address)',
  'function getBothReservesToken(address addressPair) external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
]
const ERC20_ABI = ['function symbol() external view returns (string memory)']
const contract = new ethers.Contract(process.env.ADDRESS_CONTRACT, BotArb_ABI, provider)
let alladressPair = []
const main = async() => {
    try {
        let data = await getAllPairRoutes()
        const formatdata = JSON.stringify(data, null, 2)
        const x = fs.writeFileSync(locationFile, formatdata)
        console.error('DONE')
    } catch (error) {
        console.error(error)
    }
    
    
}

const toNumber = (input) => ethers.utils.formatUnits(input, 0)

const getAllPairRoutes = async () => {
  let factory = await contract.getFactory(ADDRESS_ROUTER)
  let lengthPair = await contract.getLengthPair(factory)
  lengthPair = +toNumber(lengthPair)
  for (let i =0; i < Length; i++) {
    console.log('index: ',i)
    try {
       let addressPair = await contract.getAddressPair(factory, i)
       let tokenAlladdress = await contract.getBothAddressToken(addressPair)
       let obj = {
         router: ADDRESS_ROUTER,
         addressPair: addressPair,
         token0: {
           sym: await new ethers.Contract(
             tokenAlladdress[0],
             ERC20_ABI,
             provider
           ).symbol(),
           address: tokenAlladdress[0],
         },
         token1: {
           sym: await new ethers.Contract(
             tokenAlladdress[1],
             ERC20_ABI,
             provider
           ).symbol(),
           address: tokenAlladdress[1],
         },
       }
       alladressPair.push(obj)
    } catch (error) {
      console.error(error)
    }
   
  }
   return alladressPair
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
   