//Follow this: https://gist.github.com/mwburke/9873c09ac6c21d6ac9153e54892cf5ec

let promises = [
  d3.csv("/data/Data4Pakistan-BalochistanOnly.csv"),
  d3.csv("/data/Data4Pakistan-SindhOnly.csv"),
  d3.csv("/data/Data4Pakistan-ICTOnly.csv"),
  d3.csv("/data/Data4Pakistan-KPKOnly.csv"),
  d3.csv("/data/Data4Pakistan-PunjabOnly.csv")
];

let updatedBalochData = [];
let updatedSindhData = [];
let updatedICTData = [];
let updatedKPKData = [];
let updatedPunjabData = [];

let slopeGraphBaloch;
let slopeGraphSindh;
let slopeGraphICT;
let slopeGraphKPK;
let slopeGraphPunjab;

Promise.all(promises).then(function(data) {
  let dataBaloch = data[0];
  let dataSindh = data[1];
  let dataICT = data[2];
  let dataKPK = data[3];
  let dataPunjab = data[4];

  //DATA clean-up/manipulation:
  //1. Downloaded Data4Pak dataset into Excel.
  //2. EXCEL - Deleted out all cols except those with data.Province === Balochistan and col = "Poverty Rate (%)"
  //3. EXCEL - Deleted all rows without value for "Poverty Rate (%)"
  //4. EXCEL - Ordered by Year
  //5. Saved as csv, loaded into main.js for further manipulation:

  let allPovertyData = [];
  for (let i = 0; i < dataBaloch.length; i += 2) {
    allPovertyData.push(parseInt(dataBaloch[i]["Poverty Rate (%)"]));
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = dataBaloch[i].District;
    updatedObj.First = parseInt(dataBaloch[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(dataBaloch[i + 1]["Poverty Rate (%)"]);
    updatedBalochData.push(updatedObj);
  }
  let dataBalochDomain = d3.extent(allPovertyData);

  for (let i = 0; i < dataSindh.length; i += 2) {
    allPovertyData.push(parseInt(dataSindh[i]["Poverty Rate (%)"]));
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = dataSindh[i].District;
    updatedObj.First = parseInt(dataSindh[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(dataSindh[i + 1]["Poverty Rate (%)"]);
    updatedSindhData.push(updatedObj);
  }

  let dataSindhDomain = d3.extent(allPovertyData);

  for (let i = 0; i < dataICT.length; i += 2) {
    allPovertyData.push(parseInt(dataICT[i]["Poverty Rate (%)"]));
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = dataICT[i].District;
    updatedObj.First = parseInt(dataICT[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(dataICT[i + 1]["Poverty Rate (%)"]);
    updatedICTData.push(updatedObj);
  }

  let dataICTDomain = d3.extent(allPovertyData);

  for (let i = 0; i < dataKPK.length; i += 2) {
    allPovertyData.push(parseInt(dataKPK[i]["Poverty Rate (%)"]));
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = dataKPK[i].District;
    updatedObj.First = parseInt(dataKPK[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(dataKPK[i + 1]["Poverty Rate (%)"]);
    updatedKPKData.push(updatedObj);
  }

  let dataKPKDomain = d3.extent(allPovertyData);

  for (let i = 0; i < dataPunjab.length; i += 2) {
    allPovertyData.push(parseInt(dataPunjab[i]["Poverty Rate (%)"]));
    let updatedObj = { District: "", First: "", Last: "" };
    updatedObj.District = dataPunjab[i].District;
    updatedObj.First = parseInt(dataPunjab[i]["Poverty Rate (%)"]);
    updatedObj.Last = parseInt(dataPunjab[i + 1]["Poverty Rate (%)"]);
    updatedPunjabData.push(updatedObj);
  }

  let dataPunjabDomain = d3.extent(allPovertyData);

  slopeGraphBaloch = new SlopeGraph(
    "#chart1",
    updatedBalochData,
    dataBalochDomain
  );
  slopeGraphSindh = new SlopeGraph(
    "#chart2",
    updatedSindhData,
    dataSindhDomain
  );
  slopeGraphICT = new SlopeGraph("#chart3", updatedICTData, dataICTDomain);
  slopeGraphKPK = new SlopeGraph("#chart4", updatedKPKData, dataKPKDomain);
  slopeGraphPunjab = new SlopeGraph(
    "#chart5",
    updatedPunjabData,
    dataPunjabDomain
  );

  //END OF DATA LOADING
});

// function mouseover(d) {
//   console.log(d);
//   // let selectedDistrict = d.District;
//   // console.log(d3.selectAll(".slope-line" + d.Change + selectedDistrict));
// }

// function mouseout(d) {
//   console.log("You left!");
// }
