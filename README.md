
# SimpleBotArb

A small project to try arbitrage on dex between two pairs (same token) e.g. busd-usdt on pancake arbitrage to busd-usdt on biswap


## What file is what

- file `botarb.sol` for  smart contract on blockchain
- file `calAMM.js` for  shows the logic of the bot's calculation method
- file `createDataJson.js` for fetching pairs in factory router on dex and generating json file
- file `createSamePair.js` for selecting only same pairs between 2 dex
- file `tradeArbOnBsc.js` for connects the smart contract and trade arbitrage when it detects the condition of the arbitrage



## Logic Arbitrage 
- go to file `calAMM.js` 
### run file `calAMM.js`
```bash
  node calAMM.js
```
#### Change data input if you want to test logic
```javascript
Test([94781884.284722067962798239, 94699896.246303358765962232], [0.008911144541043 , 991.9861803364])
```
```javascript
In the above example 
DATA INPUT
paris busd-usdt on pancakeswap  
94781884.284722067962798239 busd       
94699896.246303358765962232 usdt     

paris busd-usdt on twindex
991.9861803364              busd 
0.008911144541043           usdt
```
![Logo](https://sv1.picz.in.th/images/2023/02/25/e0NQlI.png)
### what this mean?
    1. The bot will check the ratio to make arbitrage 1->2 or 2->1.
    2. Then calculate whether to do arbitrage from liquidity pool more to less or less to more and calculate the numbers that will make the pool balanced out of the x*y = k equation.
    3. Then, when  get the numbers for  arbitrage will be performed and the result will be displayed.
#### In the above example  result displayed
1.LP MORE -> LP LESS because `busd-usdt on pancakeswap`  have more liquidity than `busd-usdt on twindex`\
2.Find and get numbers for  arbitrage ->In pancakeswap sell amount `busd 2.976692320410171` to get `usdt 2.966682040880783`\
ratio in the pool will change from `0.9991349819742724` to to `0.9991349192956358`\
3.In twindex sell amount `usdt 2.966682040880783` to get `busd 989.0080109808019`\
ratio in the pool will change from `0.000008983133754969321` to `0.999134981974273`\
4.The profit you will get is busd(get after arbitrage) `busd 989.0080109808019` - busd(initial cost)  `busd 2.976692320410171` = `busd 986.0313186603918`\
5.Then you can see that the pool ratio between `busd-usdt on pancakeswap` and `busd-usdt on twindex` is almost close together that means the arbitrage is done





## How to use
### 1. If you want to create your own data file (if not skip this Because I also give you `dataSamePair.json`)
- go to file `createDataJson.js` 



#### Change this variable
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `FileName` | `string` | name file |
| `Length` | `number` | for pairs data length from factory router on dex  |
| `ADDRESS_ROUTER` | `string` | router address |

```javascript
const FileName = 'BakerySwap'
const Length = 100
const ADDRESS_ROUTER = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'
```
In the above example. i need length paris 100 and router dex BakerySwap

### run file `createDataJson.js`
you will get file `dataBiswapPair.json`


```bash
  node createDataJson.js
```

#### what pair length do you want?, and which router? You can create one
#### next step
- go to file `createSamePair.js`

#### Change this variable

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `locationFile1` | `string` | name file1 for combined |
| `locationFile2` | `string` | name file2 for combined |


```javascript
const locationFile1 = './dataApeSwapPair.json'
const locationFile2 = './dataBakerySwapPair.json'
```

At this step, you must have data json at least two router pairs.
In the above example. I have `dataApeSwapPair.json` and `dataBakerySwapPair.json`

### run file `createSamePair.js`
you will get file `dataSamePair.json` The resulting file is filter only same pairs from 2 dex routers for use in arbitrage


```bash
  node createSamePair.js
```

### 2. deploy smart contract
At this step, you must deploy smart contract `botarb.sol` on network Bsc.
and send token which you want arbitrage to smartcontract

#### Change address token  on file `tradeArbOnBsc.js`
```javascript
 let addressMain = [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5'
  ]
```
In the above example. I use wbnb / busd / bake . You can edit and add address token you want if the `dataSamePair.json` uses that token

### 3. final
At this step, you must add `.env` file in your folder and input your information.
```javascript
INFURA_ID=
PRIVATE_KEY=
ADDRESS_CONTRACT=
```

### run file `tradeArbOnBsc.js`
```bash
  node tradeArbOnBsc.js
```
If you get something like this means bot  it works and it will run loop data in file `dataSamePair.json` until you stop it

![Logo](https://sv1.picz.in.th/images/2023/02/25/eWmiG9.png))

This picture is when the bot does arbitrage it will show information including Profit and if it have Profit it will execute tx immediately and you will get txhash back 

![Logo](https://sv1.picz.in.th/images/2023/02/25/eWmltR.png))



### This is a contract that I test `https://bscscan.com/address/0xc4f4643f0e5bdfa6901b7b76751517777c470112`








## Authors

- [@cs0041](https://github.com/cs0041)

# Warning You need to have a good understanding before working, please test the smart contract carefully, otherwise your money will be lost This is just a simple arbitrage project. if you are going to use it for real use, you should improve and develop many more
