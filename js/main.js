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

let dataBalochDomain;
let dataSindhDomain;
let dataICTDomain;
let dataKPKDomain;
let dataPunjabDomain;

let slopeGraphBaloch;
let slopeGraphSindh;
let slopeGraphICT;
let slopeGraphKPK;
let slopeGraphPunjab;

let provNameBaloch = "";
let provNameICT = "";
let provNameKPK = "";
let provNamePunjab = "";
let provNameSindh = "";

//DATA clean-up/manipulation:
//1. Downloaded Data4Pak dataset into Excel.
//2. EXCEL - Deleted out all cols except those with data.Province === Balochistan and col = "Poverty Rate (%)"
//3. EXCEL - Deleted all rows without value for "Poverty Rate (%)"
//4. EXCEL - Ordered by Year
//5. Saved as csv, loaded into main.js for further manipulation:
Promise.all(promises).then(function(data) {
  for (let i = 0; i < data.length; i++) {
    let allPovertyData = [];

    //Go into each province's array and build one object out of every two:
    for (let j = 0; j < data[i].length; j += 2) {
      let updatedObj = { District: "", First: "", Last: "" };
      updatedObj.District = data[i][j].District;
      updatedObj.First = parseInt(data[i][j]["Poverty Rate (%)"]);
      updatedObj.Last = parseInt(data[i][j + 1]["Poverty Rate (%)"]);
      if (data[i][j]["Province"] === "Balochistan") {
        updatedBalochData.push(updatedObj);
        provNameBaloch = "Balochistan";
      } else if (data[i][j]["Province"] === "Federal Capital Territory") {
        updatedICTData.push(updatedObj);
        provNameICT = "Federal Capital Territory";
      } else if (data[i][j]["Province"] === "Khyber Pakhtunkhwa") {
        updatedKPKData.push(updatedObj);
        provNameKPK = "Khyber Pakhtunkhwa";
      } else if (data[i][j]["Province"] === "Punjab") {
        updatedPunjabData.push(updatedObj);
        provNamePunjab = "Punjab";
      } else {
        updatedSindhData.push(updatedObj);
        provNameSindh = "Sindh";
      }
    }

    //Go into each province's array and calc min and max poverty rate for each:
    for (let j = 0; j < data[i].length; j++) {
      allPovertyData.push(parseInt(data[i][j]["Poverty Rate (%)"]));
      if (data[i][j]["Province"] === "Balochistan") {
        dataBalochDomain = d3.extent(allPovertyData);
      } else if (data[i][j]["Province"] === "Federal Capital Territory") {
        dataICTDomain = d3.extent(allPovertyData);
      } else if (data[i][j]["Province"] === "Khyber Pakhtunkhwa") {
        dataKPKDomain = d3.extent(allPovertyData);
      } else if (data[i][j]["Province"] === "Punjab") {
        dataPunjabDomain = d3.extent(allPovertyData);
      } else {
        dataSindhDomain = d3.extent(allPovertyData);
      }
    }
  }

  slopeGraphKPK = new SlopeGraph(
    "#chart1",
    updatedKPKData,
    dataKPKDomain,
    "#provNameKPK",
    provNameKPK
  );
  slopeGraphPunjab = new SlopeGraph(
    "#chart2",
    updatedPunjabData,
    dataPunjabDomain,
    "#provNamePunjab",
    provNamePunjab
  );
  slopeGraphICT = new SlopeGraph(
    "#chart3",
    updatedICTData,
    dataICTDomain,
    "#provNameICT",
    provNameICT
  );
  slopeGraphSindh = new SlopeGraph(
    "#chart4",
    updatedSindhData,
    dataSindhDomain,
    "#provNameSindh",
    provNameSindh
  );
  slopeGraphBaloch = new SlopeGraph(
    "#chart5",
    updatedBalochData,
    dataBalochDomain,
    "#provNameBaloch",
    provNameBaloch
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
