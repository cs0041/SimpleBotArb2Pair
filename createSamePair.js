const fs = require('fs')


const locationFile = './dataSamePair.json'






const main = async () => {
  try {
    let data = await Read()
    console.log(data.length)
    const jsonEmpty =[]
    jsonEmpty.push(data)
       if (fs.existsSync(locationFile)) {
         const file = fs.readFileSync(locationFile)
           if (file.length == 0) {
             fs.writeFileSync(locationFile, JSON.stringify(jsonEmpty, null, 2))
           } else {
             const jsonHave = JSON.parse(file.toString())
             jsonHave.push(data)
             fs.writeFileSync(locationFile, JSON.stringify(jsonHave, null, 2))
           }
       }else{
        fs.writeFileSync(locationFile, jsonEmpty.stringify(data, null, 2))
       }

  
  } catch (error) {
    console.error(error)
    }
    console.error('DONE')
}



const Read = async () => {


  const locationFile1 = './dataApeSwapPair.json'
  const locationFile2 = './dataBakerySwapPair.json'

  const jsonString1 = fs.readFileSync(locationFile1)
  const data1 = JSON.parse(jsonString1)

  const jsonString2 = fs.readFileSync(locationFile2)
  const data2 = JSON.parse(jsonString2)

  let allSamePair = []
  for(let x =0;x<data1.length;x++){
    for (let y = 0; y < data2.length; y++) {
      if ((data1[x].token0.address == data2[y].token0.address || data1[x].token0.address == data2[y].token1.address)
       &&(data1[x].token1.address == data2[y].token0.address ||data1[x].token1.address == data2[y].token1.address)) 
        {
            let obj = {
              samePair1: data1[x],
              samePair2: data2[y],
            }
            allSamePair.push(obj)
        }
    }
  }

  return allSamePair

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
