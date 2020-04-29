const fs = require("fs-extra");
const XLSX = require("xlsx");
const axios = require("axios");
const path = require("path");
const find = require("lodash").find;
const isEqual = require("lodash").isEqual;
const isObject = require("lodash").isObject;
const transform = require("lodash").transform;
const csvToJson = require("convert-csv-to-json");

const waitFor = ms => new Promise(r => setTimeout(r, ms));
module.exports.waitFor = waitFor;

const writeFile = async (content, to) => {
  try {
    await fs.writeJson(to, content, { spaces: 2, encoding: "utf8" });
    console.log("success!");
  } catch (err) {
    console.error(err);
  }
};
module.exports.writeFile = writeFile;

const readFile = async from => {
  try {
    return await fs.readJson(path.join(__dirname, from));
  } catch (err) {
    console.error(err);
  }
};
module.exports.readFile = readFile;

const readFileSync = fullPath => {
  try {
    return fs.readJsonSync(fullPath);
  } catch (err) {
    console.error(err);
  }
};
module.exports.readFileSync = readFileSync;

const isValidUAI = uai => {
  return /^[0-9]{7}[a-zA-Z]{1}$/g.test(uai);
};
module.exports.isValidUAI = isValidUAI;

const isValidSiren = siren => {
  return /^[0-9]{9}$/g.test(siren);
};
module.exports.isValidSiren = isValidSiren;

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
module.exports.asyncForEach = asyncForEach;

const readJsonFromCsvFile = localPath => {
  const jsonArray = csvToJson.getJsonFromCsv(localPath);
  return jsonArray;
};
module.exports.readJsonFromCsvFile = readJsonFromCsvFile;

const readXLSXFile = localPath => {
  const workbook = XLSX.readFile(localPath, { codepage: 65001 });
  return { sheet_name_list: workbook.SheetNames, workbook };
};
module.exports.readXLSXFile = readXLSXFile;

const writeXlsxFile = async (worksheets = [], filePath, fileName) => {
  if (worksheets.length === 0) return;

  const workbook = XLSX.utils.book_new(); // Create a new blank workbook

  for (let i = 0; i < worksheets.length; i++) {
    const { name, content } = worksheets[i];
    XLSX.utils.book_append_sheet(workbook, content, name); // Add the worksheet to the workbook
  }

  const execWrite = () =>
    new Promise(resolve => {
      XLSX.writeFileAsync(path.join(__dirname, `${filePath}/${fileName}`), workbook, e => {
        if (e) {
          console.log(e);
        }
        resolve();
      });
    });

  await execWrite();
};
module.exports.writeXlsxFile = writeXlsxFile;

const downloadFile = async (url, to) => {
  const writer = fs.createWriteStream(to);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
module.exports.downloadFile = downloadFile;

const findValidFileName = async (fileNoExt, ext, ite) => {
  let fileName = ite === 0 ? `${fileNoExt}${ext}` : `${fileNoExt}_${ite}${ext}`;
  let localPath = path.resolve(__dirname, "../../tmp", `${fileName}`);

  if (await fs.pathExists(localPath)) {
    return await findValidFileName(localPath, ite + 1);
  }

  return fileName;
};

// Download a file from url and return the path, filename & status
const downloadAttachmentFile = async (url, fileNoExt) => {
  const ext = getExtension(url);
  const validExt = [".xls", ".xlsx", ".xlsm", ".csv"];
  const fileName = await findValidFileName(fileNoExt, ext, 0);

  let localPath = path.resolve(__dirname, "../../tmp", `${fileName}`);

  await fs.ensureDir(path.resolve(__dirname, "../../tmp"));

  try {
    await downloadFile(url, localPath);

    if (validExt.includes(ext)) {
      return {
        localPath,
        fileName,
        status: {
          type: "success",
        },
      };
    }

    await moveFileToFailFiles(localPath, fileName);

    return {
      localPath,
      fileName,
      status: {
        type: "error",
        message: "Error file extension! File saved in folder output/failFiles",
      },
    };
  } catch (error) {
    return {
      localPath,
      fileName,
      status: {
        type: "error",
        message: error.message,
      },
    };
  }
};
module.exports.downloadAttachmentFile = downloadAttachmentFile;

const moveFileToFailFiles = async (srcpath, file) => {
  const dstpath = path.resolve(__dirname, "../../output/failFiles", `${file}`);
  await fs.ensureDir(path.resolve(__dirname, "../../output/failFiles"));
  await fs.move(srcpath, dstpath);
};
module.exports.moveFileToFailFiles = moveFileToFailFiles;

const getJsonDataFromWorksheet = (worksheet, headers, range) => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: headers,
    range: range,
  });

  return jsonData;
};
module.exports.getJsonDataFromWorksheet = getJsonDataFromWorksheet;

const getExtension = url => {
  return url.match(/\.[^/\\.]+$/)[0]; // TODO THROW
};

const removeExtension = fileName => {
  return fileName.substr(0, fileName.lastIndexOf("."));
};
module.exports.removeExtension = removeExtension;

const getFileId = fileName => {
  return removeExtension(fileName.split("_")[1]);
};
module.exports.getFileId = getFileId;

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 * Thanks to https://gist.github.com/Yimiprod
 */
function difference(object, base) {
  function changes(object, base) {
    return transform(object, function(result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}
module.exports.difference = difference;

let academiesCommunes = [];
const getAcademieFromCodeInsee = code_commune_insee => {
  if (academiesCommunes.length === 0) {
    academiesCommunes = fs.readJsonSync(path.join(__dirname, "../assets/AcademiesCommunes.json"));
  }
  return find(academiesCommunes, { commune: code_commune_insee });
};
module.exports.getAcademieFromCodeInsee = getAcademieFromCodeInsee;

const getAcademieFromNumAcademie = numAcademieToSearch => {
  if (academiesCommunes.length === 0) {
    academiesCommunes = fs.readJsonSync(path.join(__dirname, "../assets/AcademiesCommunes.json"));
  }
  return find(academiesCommunes, { numAcademie: numAcademieToSearch });
};
module.exports.getAcademieFromNumAcademie = getAcademieFromNumAcademie;

let siretTrainingsCci = [];
const getCCISiretFromCfaNameAndCodePostal = (cfaNameToSearch, codePostalToSearch) => {
  if (siretTrainingsCci.length === 0) {
    siretTrainingsCci = fs.readJsonSync(path.join(__dirname, "../assets/FormationsCCI_SiretSiren.json"));
  }
  const infoCciFound = find(siretTrainingsCci, { nomCfa: cfaNameToSearch, codePostal: codePostalToSearch });
  return infoCciFound ? infoCciFound.siret : "";
};
module.exports.getCCISiretFromCfaNameAndCodePostal = getCCISiretFromCfaNameAndCodePostal;

let academiesDepartements = [];
const getDepartementFromAcademie = numAcademie => {
  if (academiesDepartements.length === 0) {
    academiesDepartements = fs.readJsonSync(path.join(__dirname, "../assets/AcademiesDepartements.json"));
  }
  return find(academiesDepartements, { numAcademie: numAcademie });
};

// TODO TO REFACTOR
const getLocationInfo = givenCodePostal => {
  const result = {
    // codePostal: givenCodePostal,
    // codeCommuneInsee: "",
    // numAcademie: "",
    // numDepartement: "",
  };

  //let info = await getInfoFromDataGouv(givenCodePostal, "code_postal");
  let info = getInfoFromLocal({ code_postal: givenCodePostal });
  if (!info) {
    //info = await getInfoFromDataGouv(givenCodePostal, "code_commune_insee");
    info = getInfoFromLocal({ code_commune_insee: givenCodePostal });
    if (!info) {
      const matchAca = getAcademieFromCodeInsee(givenCodePostal);
      if (!matchAca) {
        console.error(`getLocationInfo > coun't not retrieve data.gouv info from ${givenCodePostal}`);
        return null;
      }
      result.numAcademie = matchAca.numAcademie;
      const nDepartement = findDepartement(result.numAcademie);
      if (!nDepartement) {
        return null;
      }
      result.numDepartement = nDepartement;
      result.codePostal = givenCodePostal;
      return result;
    } else {
      result.codePostal = info.code_postal;
      result.codeCommuneInsee = givenCodePostal;
    }
  } else {
    result.codePostal = info.code_postal;
    result.codeCommuneInsee = info.code_commune_insee;
  }

  // trim first 0
  result.codeCommuneInsee = result.codeCommuneInsee.replace(/^0*/, "");

  const resultAca = getAcademieFromCodeInsee(result.codeCommuneInsee);
  if (!resultAca) {
    console.error(`getLocationInfo > coun't not retrieve academie from ${result.codeCommuneInsee}`);
    return null;
  }
  result.numAcademie = resultAca.numAcademie;

  const nDepartement = findDepartement(result.numAcademie);
  if (!nDepartement) {
    return null;
  }
  result.numDepartement = nDepartement;

  return result;
};

const findDepartement = numAcademie => {
  const resultDep = getDepartementFromAcademie(numAcademie);
  if (!resultDep) {
    console.mainLogger().error(`getLocationInfo > coun't not retrieve Deparement from ${numAcademie}`);
    return null;
  }
  return resultDep.numDeparement;
};

module.exports.getLocationInfo = getLocationInfo;

let baseCodePostaux = [];
const getInfoFromLocal = search => {
  if (baseCodePostaux.length === 0) {
    baseCodePostaux = fs.readJsonSync(path.join(__dirname, "../assets/base-officielle-des-codes-postaux.json"));
  }
  return find(baseCodePostaux, search);
};
module.exports.getInfoFromLocal = getInfoFromLocal;

const mergedMaps = (...maps) => {
  const dataMap = new Map([]);

  for (const map of maps) {
    for (const [key, value] of map) {
      dataMap.set(key, value);
    }
  }

  return dataMap;
};
module.exports.mergedMaps = mergedMaps;
