const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// TODO Finish
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1WZHGgzrw-GgxaXQyzkve5S942ltJTEAeiUGXFrdS-AI';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);

  // TODO(you): Finish onGet.
  // TODO Finish
  var output=[];

  for(let i=1;i<rows.length;i++){
    var item={};
    for(let j=0;j<rows[0].length;j++){
      item[rows[0][j]] = rows[i][j];
    }
    output.push(item);
  }

  res.json( output );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  const messageBody = req.body;
  const key = Object.keys(messageBody);
  const value = Object.values(messageBody);

  var row_post=[];
  // TODO(you): Implement onPost.
  // TODO Finish

  for(i=0;i<value.length;i++){
    row_post[rows[0].indexOf(key[i])]=value[i];
  }

  console.log("POST the row to sheet : [ " +  row_post +" ]");

  sheet.appendRow(row_post).then(
      function(resp){
        const response=resp["response"];
        console.log(resp);
        res.json( { response })
      });
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows ;
  const messageBody = req.body;
  const mkey = Object.keys(messageBody);
  const mvalue = Object.values(messageBody);
  var output=null;
  var row_patch=[];
  var rows0=[];

  for(let i=0;i<rows[0].length;i++){
    rows0[i]=rows[0][i].toLowerCase();
  }

  // TODO(you): Implement onPatch.
  // TODO Finish

  for(let i=0;i<rows[0].length;i++){
    if(rows[0][i].toLowerCase()==column.toLowerCase()){
      for(let j=1;j<rows.length;j++){
        if(rows[j][i]==value){

          for(let k=0;k<mvalue.length;k++){
            let position=rows0.indexOf(mkey[k].toLowerCase());
            row_patch[position]=mvalue[k];
          }
          console.log("PATCH the row  [ " +  rows[j] + " ]" + " to row : [ " +  row_patch +" ]");

          sheet.setRow(j,row_patch).then(
              function (resp) {
                const response=resp["response"];
                res.json( { response });
              }
          );
          output=true;
          break;
        }
      }
      if(output)break;
    }
  }
  if(!output)res.json( { "response": "success" } );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows ;
  var output=null;

  // TODO(you): Implement onDelete.
  // TODO Finish

  for(let i=0;i<rows[0].length;i++){
    if(rows[0][i].toLowerCase()==column.toLowerCase()){
      for(let j=1;j<rows.length;j++){
        if(rows[j][i]==value){
          console.log("DELETE the row from sheet : [ " + rows[j] +" ]");
          sheet.deleteRow(j).then(
              function (resp) {
                const response=resp["response"];
                res.json( { response });
              }
          );
          output=true;
          break;
        }
      }
      if(output)break;
    }
  }
  if(!output)res.json( { "response": "success" } );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`CS193X: Server listening on port ${port}!`);
});
