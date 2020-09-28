const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");
const winston = require("winston");

const CLIENT_ID =
  "827047791174-kj8jjtrpf3s09gfr1ena04357bkk6et0.apps.googleusercontent.com";
const CLIENT_SECRET = "WqzI2dOpl9P6-teszRyeskXs";
const GMAIL_API_KEY = "AIzaSyCPF8sOLXLm1FXgzrskTxatKvU8ry9gJOc";
//Step 1

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "email-service" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: "error.json", level: "error" }),
    new winston.transports.File({ filename: "combined.json" }),
  ],
});

/* let mailOptions = {
    from: "vvcodeweb@gmail.com",
    to: "kimcinin4@gmail.com",
    subject: "test",
    text: "it works"
} */

const createLetter = (name, url, comment) => {
  const fullUrl = url;
  const withoutHttps = url.slice(8);
  const cuttedUrl = withoutHttps.slice(0, withoutHttps.indexOf("/"));
  const letter = `Здравствуйте!<br>
    <br>
    O Вашей компании "${name}"</br> был опубликован негативный отзыв на сайте-отзовике <a href=${fullUrl}>${cuttedUrl}</a> следующего содержания: <br>
    <br>
    <div style="border: 1px solid black; padding: 10px;"><i>"${comment}"</i></div><br>
    Меня зовут Полина  Квачко, я старший менеджер отдела развития компании virgin-media.ru, мы профессионально занимаемся удалением негативных отзывов и управлением репутацией в интернете.<br>
    <br>
    Отрицательный отзыв - это не просто информация в сети.<br>
    <br>
    По статистике, каждый третий клиент отказывается от сотрудничества с компанией, если видит негатив.<br>
    <br>
    Мы можем увеличить количество ваших клиентов как минимум на 30 %.<br>
    <br>
    Результат нашей работы - позитивный контент, который прочитает клиент по запросам “ваш бренд”, “ваш бренд + отзывы”.<br>
    Мы подготовим бесплатный аудит репутации вашей компании или бренда и наметим конкретный план действий. <br>
    <br>
    Что дальше?<br>
    <p><i>Ответьте на это письмо, мы перезвоним и расскажем, чем можем быть вам полезны.</i></p><br>

    С уважением,<br>
    Cтарший менеджер отдела развития virgin-media.ru<br>
    Полина Квачко<br>
    +7 (499) 113-25-65<br>
    info@virgin-media.ru <br>
    `;
  return letter;
};

const createTheme = (name) => {
  const theme = `Отрицательный отзыв о франшизе компании "${name}"`;
  return theme;
};

const extractDataFromFile = (filePath) => {
  let data = [];
  let readyEmails = [];

  if (filePath.trim().length <= 0) {
    console.error("File path cant be empty");
    exit();
  }
  const accountsToSendFrom = JSON.parse(fs.readFileSync("./sendfrom.json", "utf8"))
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => data.push(row))
    .on("end", () => {
      const result = createEmailsFromData(data);
      result.forEach((company, index) => {
        if (
          !(company.email_address.trim() === '' || company.email_address === undefined) 
        ) {
          setTimeout(() => {
            console.log("Sending email");
            const acconuntToSendFrom = accountsToSendFrom[index % accountsToSendFrom.length];
            console.log(acconuntToSendFrom)
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: acconuntToSendFrom.email,
                pass: acconuntToSendFrom.password,
              },
            });
            let mailOptions = {
              from: acconuntToSendFrom.email,
              to: company.email_address,
              subject: company.theme,
              html: company.letter,
            };
            transporter.sendMail(mailOptions, function (err, data) {
              if (err) {
                console.log("error", err);
                logger.log({
                  level: "error",
                  message: err,
                });
                
              } else {
                logger.log({
                  level: "info",
                  message: data,
                });

                console.log("Sent!");
                console.log("___________________________");
                console.log("---------------------------");
              }
            });
          }, 60000 * index);
        }
      });
    });
};

const createEmailsFromData = (data) => {
  let readyEmails = [];
  data.map((company) => {
    if (!company.name.trim().length <= 0) {
      const letter = createLetter(company.name, company.url, company.comment);
      const theme = createTheme(company.name);
      const email_address = company.email;
      const readyEmail = {
        email_address,
        theme,
        letter,
      };
      readyEmails.push(readyEmail);
    }
  });
  return readyEmails;
};

const main = () => {
  var filePath = process.argv.slice(2)[0];
  const readyEmails = extractDataFromFile(filePath);
};

main();

const sendEmail = () => {
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("error", err);
    } else {
      console.log("done");
    }
  });
};
