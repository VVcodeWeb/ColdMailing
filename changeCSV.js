const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");
const winston = require("winston");
const { type } = require("os");
const log = "./combined.log"
const ObjectsToCsv = require('objects-to-csv');
const readline = require('readline');
function convert(file) {

    return new Promise((resolve, reject) => {

        const stream = fs.createReadStream(file);
        // Handle stream error (IE: file not found)
        stream.on('error', reject);

        const reader = readline.createInterface({
            input: stream
        });

        const array = [];

        reader.on('line', line => {
            array.push(JSON.parse(line));
        });

        reader.on('close', () => resolve(array));
    });
}



const main = async() => {
    const filePath = process.argv.slice(2)[0];
    let oldCSV = []
    try {
        const logData = await convert("combined.json")
        let newCSV = []
        let counter = 0
        fs
        .createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => oldCSV.push(row))
        .on("end", () => {
            oldCSV.forEach((item) => {
                logData.forEach((log, index) => {     
                    if(item.email.trim().toLowerCase() === log.message.envelope.to[0].trim().toLowerCase()){                     
                        let password
                        switch(log.message.envelope.from){
                            case "polina.orm@gmail.com":
                                password = "Polina.orm123"
                                break;
                            case "polinak.serm@gmail.com":
                                password = "Polinak.serm123";
                                break;
                            case "vitaly.serm@gmail.com":
                                password = "Vitaly.serm123";
                                break;
                            case "vitaly.orm@gmail.com":
                                password ="Vitaly.orm123";
                                break;
                            case "polinaa.serm@gmail.com":
                                password = "Polinaa.serm123";
                                break;
                            default:
                                password = "Undefined password, can't find given email."
                                break;
                        }
                        item.from = `${log.message.envelope.from} \n ${password}`
                        counter++;
                        newCSV.push(item)
                    }
                })

            })
            createFile(newCSV)
            notMatchingCompanies(oldCSV)
            console.log(counter) 
        }) 
    } catch (e) {
        console.log(e)
    }
}

const notMatchingCompanies = (data) => {
    data.forEach((company) => {
        if(!company.hasOwnProperty("from")){
            console.log(company.email)
        }
    })
}
const createFile = async (data) => {

    const csv = new ObjectsToCsv(data);
    
    await csv.toDisk('./report.csv');
}

main()