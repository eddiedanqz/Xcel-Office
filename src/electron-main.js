"use strict";

// This intercepts the error message box shown by Electron in case of an uncaughtException. Needs to be on top of the main process.
process.on("uncaughtException", (error) => {
  console.error(error);
});

const { count, table } = require("console");
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./timesoffice.sqlite",
  },
  useNullAsDefault: true,
  acquireConnectionTimeout: 2400000

});

// Get and switch Vuelectro build type
process.env.VUELECTRO_ENV = process.env.VUELECTRO_ENV || "build";

// Set global variables for the resource path and Vue static path to be used throughout the app (both in main and renderer)
global.__resPath = path.join(process.cwd(), "resources");
global.__staticPath = path.join(process.cwd(), "public");

let rndURL = `file://${__dirname}/renderer/index.html`; // Renderer entry URL
let isDev = false; // Set the Electron environment to development or production

// Change running environment and renderer source according to the executed command
switch (process.env.VUELECTRO_ENV) {
  case "run":
  case "devprod":
    isDev = true;
    break;
  case "serve":
    isDev = true;
    rndURL = "http://localhost:8080/";
    break;
  case "build":
    global.__resPath = process.resourcesPath;
    global.__staticPath = path.join(__dirname, "renderer");
    break;
}

let MainWindow;

//Creating main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    icon: __dirname + "Icon.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      additionalArguments: [
        JSON.stringify({
          VUELECTRO_RES_PATH: __resPath,
          VUELECTRO_STATIC_PATH: __staticPath,
          VUELECTRO_ENV: process.env.VUELECTRO_ENV,
        }),
      ],
    },
  });

  MainWindow = win;

  // Use the promise returned by loadURL() in combination with show:false and win.show() to avoid showing the window before content is loaded
  win.loadURL(rndURL).then(() => {
    win.show();
    checkSubscribersTable();
    checkPerformanceTable();
    checkTotalPerformanceTable();
    //   codewin.loadURL(`file://${__dirname}/renderer/#/addagent`)
    if (isDev) win.webContents.openDevTools(); // Open dev tools on development mode
  });
}

app.on("ready", async () => {
  if (isDev) {
    // Install Vue Devtools
    try {
      await require("electron-devtools-installer").default({
        id: "ljjemllljcmogpfapbkkighbhhppjdbg", // Vue Devtools beta
        electron: ">=1.2.1",
      });
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  createWindow();

 // const maninMenu  = Menu.buildFromTemplate( maninMenuTemplate)
 // Menu.setApplicationMenu(maninMenu)
});

// Menu Template
//const maninMenuTemplate = []


// Prevent app from hanging around if all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// End main process if Electron instance has already been terminated
app.on("quit", () => {
  process.exit();
});

//check if subscribers table exists
function checkSubscribersTable() {
  knex.schema.hasTable("subscribers").then(function(exists) {
    if (!exists) {
      return knex.schema.createTable("subscribers", function(t) {
        t.increments("id").primary();
        t.text("customerName");
        t.text("agentName");
        t.integer("agentCode");
        t.integer("phone");
        t.integer("card").unique().notNullable();
        t.text("openDate");
        t.text("status");
        t.integer("daysRemain");
        t.integer("duration");
        t.text("expireDate");
        t.text("date_joined").notNullable();
      });
    }
  });
}

//check if subscribers table exists
function checkPerformanceTable() {
  knex.schema.hasTable("performance").then(function(exists) {
    if (!exists) {
      return knex.schema.createTable("performance", function(t) {
        t.increments("id").primary();
        t.text("agentName").notNullable();
        t.integer("agentCode").notNullable();
        t.integer("active");
        t.integer("dormant");
        t.integer("dormantActive");
        t.integer("activeDormant");
        t.integer("gainLoss");
        t.text("date").notNullable();
      });
    }
  });
}

//Check Agents Table
function checkTotalPerformanceTable() {
  knex.schema.hasTable("totalPerformance").then(function(exists) {
    if (!exists) {
      return knex.schema.createTable("totalPerformance", function(t) {
        t.increments("id").primary();
        t.integer("agentCode").notNullable();
        t.text("agentName").notNullable();
        t.integer("active").notNullable();
        t.integer("dormant").notNullable();
        t.integer("dormantActive");
        t.integer("activeDormant");
        t.integer("totalActive");
        t.integer("totalDormant");
        t.integer("gainLoss");
        t.integer("week").notNullable();
        t.integer("year");
        t.text("date").notNullable();
      });
    }
  });
}

//Check and update status daily
function updateDays() {
  
  var itemsProcessed = 0;
   knex.select("id", "expireDate")
    .whereNotNull("agentName").table("subscribers")
    .then((rows) => {
      let msg  = 'Updating Days Remain...'
      MainWindow.webContents.send('GlobalMsg',msg)
     return knex.transaction(trx => {
       console.log(rows.length)

       // Update days remain coloumn
      const queries = rows.forEach((ele) => {
        let expire = new Date(ele.expireDate);
        let now = new Date(new Date().toDateString());
        let end = new Date(`${expire}`);
        // To calculate the time difference of two dates
        let Difference_In_Time = end.getTime() - now.getTime();
        let day = 1000 * 60 * 60 * 24;
        // To calculate the no. of days between two dates
        let countdown = Math.round(Difference_In_Time / day);
        let status;
        countdown > 0 ? (status = "VALID") : (status = "PUNISHSTOP");
        
        //
        knex("subscribers")
          .where({ id: ele.id })
          .update({ status: status, daysRemain: countdown })
          .transacting(trx)
          .then((res)=> {
            itemsProcessed++;
            if (itemsProcessed === rows.length) {
              let msg  = 'Days remain has been updated succesfully.'
              MainWindow.webContents.send('GlobalMsg', msg)
              console.log("days remain updated")
            }
          }).catch(function(error) {
            console.error(error);
          });
      })
      
     return Promise.all(queries)
      .then(()=> trx.commit)
     .catch(function(error) {
       trx.rollback
     });
    })
   })
    .catch(function(error) {
      console.error(error);
    });
}
updateDays()

//Inserting data into subscribers table
function InsertData(items) {
  var itemsProcessed = 0;
  let errorLog;

  //Loop through each row and insert
  items.forEach((item) => {
    
    let newDate = new Date(item.OPEN_DATE);
    
    //Calculate the expire date
    let expire = new Date(newDate.setDate(newDate.getDate() + 30)).toDateString();
    //Compare end date and now
    let date1 = new Date(new Date().toDateString());
    let end = new Date(`${expire}`);
    // To calculate the time difference of two dates
    let Difference_In_Time = end.getTime() - date1.getTime();
    let day = 1000 * 60 * 60 * 24;
    // To calculate the no. of days between two dates
    let daysRemain = Math.round(Difference_In_Time / day);
    let status;
    daysRemain > 0 ? (status = "VALID") : (status = item.STATUS);
    
    // Insert statement
    knex("subscribers")
      .insert({
        agentName: item.AGENT_NAME,
        customerName: item.CUSTOMER_NAME,
        agentCode: item.CODE,
        openDate: item.OPEN_DATE,
        phone: item.PHONE_NUMBER,
        card: item.CARD,
        status: status,
        duration: item.DURATION,
        daysRemain: daysRemain,
        expireDate: expire,
        date_joined: new Date().toISOString(),
      })
      .then(() => {
        itemsProcessed++;
        itemsProcessed
        if (itemsProcessed === items.length) {
          //startPerformanceUpdate();
          MainWindow.webContents.send("Data-Inserted" ,itemsProcessed);
          console.log("Data-Inserted " +itemsProcessed);
        }
      })
      .catch(function(res) {
        itemsProcessed++;
         if (res.errno == 19){
           errorLog = "Aborted due to duplicate entry. Data already exist";
           MainWindow.webContents.send("Error", errorLog);
           console.log(res.message);
         }else{
          MainWindow.webContents.send("Error", res.message);
          console.log(res.message);
        }
         if (itemsProcessed === items.length) {
          MainWindow.webContents.send("Error-Done");
          }
      });
  });
}


//Update subscribers table
ipcMain.on("update-subscribe-table", (e, arg) => {
  //console.log(item)
  var itemsProcessed = 0;
  let cards = []

  return knex.transaction(trx => {

    //
    const queries = arg.forEach((item) => {
    let newDate = new Date(item.OPEN_DATE);
    let dateString = new Date(newDate).setHours(0, 0, 0, 0)
     let duration = durationCounter(item.Amount)
      //duration = 30
    let expire = new Date(
      newDate.setDate(newDate.getDate() + duration)
    ).toDateString();

    let date1 = new Date(new Date().toDateString());
    let end = new Date(`${expire}`);
    // To calculate the time difference of two dates
    let Difference_In_Time = end.getTime() - date1.getTime();
    let day = 1000 * 60 * 60 * 24;
    // To calculate the no. of days between two dates
    let daysRemain = Math.round(Difference_In_Time / day);
    let status = "VALID"
     
    knex("subscribers")
      .where("card", item.CARD)
      .update({
        openDate: new Date(dateString).toISOString(),
        status: status,
        duration:duration,
        daysRemain: daysRemain,
        expireDate: expire,
      })
      .transacting(trx)
      .then(() => {
        itemsProcessed++;
         cards.push(item.CARD)
        if (itemsProcessed === arg.length) {
          console.log(cards.length)
          console.log(arg.length)
          MainWindow.webContents.send("Data-Updated");
        }
      })  
      .catch(function(error) {
        MainWindow.webContents.send("Error", error.message);
        console.error(error);
      });
  })

  return Promise.all(queries)
  .then(()=> trx.commit)
 .catch(function(error) {
   trx.rollback
  })
 })

});

// Update active dormant
let dormantUpdate  =  () => {
  var itemsProcessed = 0;
   let date = new Date().setHours(0, 0, 0, 0);
   date = new Date(date).toISOString(); 
  let yesterday  =  new Date().setDate(new Date().getDate() - 1)
     yesterday = new Date(yesterday).setHours(0, 0, 0, 0);

   knex.select("agentName", "agentCode","status")
  .where("daysRemain","=", -1).whereNotNull("agentName").table("subscribers")
  .then((rows) => {
    //Insert into performance
    let dormantRows  = rows
    let data = CountDuplicates(dormantRows)
    //
    knex.select("agentName", "agentCode","status")
  .where("openDate", new Date(yesterday).toISOString())
  .whereNotNull("agentName").table("subscribers")
    .then((res)=>{
     let activeRows = CountDuplicates(res)
     console.log(data)
     console.log(activeRows)
     let arr = arrayMerger(activeRows,data)
    //
    console.log(arr)
     arr.forEach((element) => {
      let gl = element.dormantActive - element.activeDormant
         
      knex("performance")
             .insert({
              agentName:element.Name,
              agentCode: element.agentCode,
               activeDormant: (element.activeDormant) ? element.activeDormant: 0,
               dormantActive: (element.dormantActive) ? element.dormantActive : 0,
               gainLoss: (gl) ? gl : 0,
               date:date
             })
             .then(() => {
           itemsProcessed++;
           if (itemsProcessed === arr.length) {
            MainWindow.webContents.send('Performance:updated')
            let msg = "performance data inserted"
            MainWindow.webContents.send("GlobalMsg", msg);
            console.log('Performance:updated:initial')
            getWeeklyTotals();
            checkInitial();
           }
         })
         .catch(function(error) {
           console.error(error);
         });
        
     });
    }).catch(function(error) {
      console.error(error);
    });

  }).catch(function(error) {
    console.error(error);
  });

}

// Update dormant active
//  let diffUpdate  =  (date) => {
//   var itemsProcessed = 0;
//   //
//    knex("performance").select("dormantActive","activeDormant","agentCode")
//    .where("date" , date)
//    .then(res => {
//      console.log(res)
//      res.forEach((ele) => {
//     let gainloss = ele.dormantActive  -  ele.activeDormant
 
//     // Update gainLoss
//     knex("performance")
//     .where("agentCode" ,ele.agentCode)
//     .where("date",date)
//       .update({
//         gainLoss: gainloss,
//       }).then(()=>{
//         itemsProcessed++;
//           if (itemsProcessed === rows.length) {
//             let msg = "Final data updated"
//             MainWindow.webContents.send("GlobalMsg", msg);
//             console.log('GainLoss:updated')
//           }
//       }).catch(function(error) {
//         console.error(error);
//       });

//      })
//    }).catch(function(error) {
//     console.error(error);
//   });
//  }

//
const CountDuplicates = (arr) => {
  let result;
  //Find and count
  result = [...arr.reduce( (mp, o) => {
         const key = JSON.stringify([o.agentCode]);
         if (!mp.has(key)) mp.set(key, { ...o, count: 0 });
         mp.get(key).count++;
         return mp;
      }, new Map).values()];

    return result
}

// //Calculates activeDormant values,dormantActive values
 const durationCounter = (amount) => {
   let result = (amount == 25 || amount == 35) ? 7 : 
                (amount == 75 || amount == 45 || amount == 20) ? 30 : 
                (amount == 150 || amount == 90 ) ? 60 :
                (amount == 135 || amount == 60 ) ? 90 : 30
           
   return result;
 };

//Get subscribers table data
ipcMain.on("loadSubscriberTable", (e) => {
  let result = knex
    .select()
    .whereNotNull("agentName")
    .orderBy("date_joined", "asc")
    .table("subscribers");
  result.then((rows) => {
         let data = countDownUpdater(rows)
      MainWindow.webContents.send("TableResults", data);
  })
  .catch(function(error) {
    MainWindow.webContents.send("Error", error.message);
    console.error(error);
  });
  
});


// Count status in tale
  ipcMain.on("getStatus", ()=>{
    knex("subscribers").select("agentName","status")
    .whereNotNull("agentName")
   .then((res) =>{
    if(res.length != 0){

      let statusSum = findAnSum(res)
      MainWindow.webContents.send("StatusSum", statusSum);

      //console.log(statusSum)
    }
    
   })

  })

// Create subscribers table on import
ipcMain.on("subscribe-table", (e, item) => {
  //console.log(item)
  InsertData(item);
});

//Replace Subscribers data
ipcMain.on("replace-data", (e, item) => {
  knex("subscribers")
    .where("agentCode", item.Code)
    .del()
    .then(() => {
      InsertData(item.arrData);
    })
    .catch(function(error) {

      console.error(error);
    });
});

//search subscribers table data
ipcMain.on("search-user", (e, arg) => {
  let result = knex
    .select()
    .where("customerName", "like", `%${arg}%`)
    .orWhere("agentCode", "like", `%${arg}%`)
    .orWhere("phone", "like", `%${arg}%`)
    .orWhere("card", "like", `%${arg}%`)
    .orWhere("agentName", "like", `%${arg}%`)
    .orWhere("status", "like", `%${arg}%`)
    .table("subscribers");
  result.then((res) => {
    let data = countDownUpdater(res)
    MainWindow.webContents.send("SearchResults", data);
  });
});

//Select rows from subscribers table
function startPerformanceUpdate() {  
  dormantUpdate()
  //  knex("subscribers").select("agentName", "agentCode", "status")
  //  .whereNotNull("agentName")
  //   .then((res) => {
  //     let data = findAndCount(res)
  //     console.log(data)
  //     CalcPerformance(data)
  //   })
  //   .catch(function(error) {
  //     console.error(error);
  //   });
}

ipcMain.on('start-performannce', () =>{
  startPerformanceUpdate()
})

//Find duplicates method and count
function findAndCount(arr) {
  let result;
  //Find and count
  result = [
    ...arr
      .reduce((mp, o) => {
        const key = JSON.stringify([o.agentCode, o.status]);
        if (!mp.has(key)) mp.set(key, { ...o, count: 0 });
        mp.get(key).count++;
        return mp;
      }, new Map())
      .values(),
  ];

  //Group values by key
  let newArr = groupBy(result, "status");

  //Create new active object
  let active = newArr.VALID.map((item) => {
    return {
      Name: item.agentName,
      Code: item.agentCode,
      Active: item.count,
    };
  });

  //Create newn dormant object
  let dormant = newArr.PUNISHSTOP.map((item) => {
    return {
      Name: item.agentName,
      Code: item.agentCode,
      Dormant: item.count,
    };
  });

  //Merge arrays together
  const map = new Map();
  active.forEach((item) => map.set(item.Code, item));
  dormant.forEach((item) =>
    map.set(item.Code, { ...map.get(item.Code), ...item })
  );
  const mergedArr = Array.from(map.values());
  return mergedArr;
}

// //Find duplicates method and count
// function findAndCountDup(arr) {
//   let result;
//   //Find and count
//   result = [
//     ...arr
//       .reduce((mp, o) => {
//         const key = JSON.stringify([o.agentCode, o.status]);
//         if (!mp.has(key)) mp.set(key, { ...o, count: 0 });
//         mp.get(key).count++;
//         return mp;
//       }, new Map())
//       .values(),
//   ];

//   //Create newn dormant object
//   let dormant = result.map((item) => {
//     return {
//       Name: item.agentName,
//       Code: item.agentCode,
//       Dormant: item.count,
//     };
//   });

//   return dormant;
// }

//Group b key
function groupBy(arr, property) {
  return arr.reduce((acc, cur) => {
    acc[cur[property]] = [...(acc[cur[property]] || []), cur];
    return acc;
  }, {});
}

//Gets values for  activedormant ,dormantactive calculations
function CalcPerformance(rows) {
 

        let start = new Date().setHours(0,0,0,0);
        let end  = new Date().setHours(23,59,59,999);
        start = new Date(start).toISOString();
        end = new Date(end).toISOString();
      
        let date = new Date().setHours(0,0,0,0)
        date = new Date(date).toISOString();
      
        //Select current dormant and active values
        knex("performance")
          .select("dormant", "active", "agentCode","date")
          .whereBetween("date", [start,end])
          .whereNotNull("agentName")
          .orderBy("date", "desc")
          .then((NowRows) => {
            if(NowRows.length > 0){
              var itemsProcessed = 0;
              //Update
              rows.forEach((ele) => {
                knex("performance")
                .where('agentCode',ele.Code)
                .whereBetween('date',[date,end])
                  .update({ 
                    active: ele.Active, dormant: ele.Dormant,
                    date:date})
                    .then(() => {
                      itemsProcessed++;
                      if (itemsProcessed === rows.length) {
                        MainWindow.webContents.send('Performance:updated')
                        dormantUpdate(rows)
          
                        let msg = "Performance data updated"
                        MainWindow.webContents.send("GlobalMsg", msg);
                        console.log('Performance:updated-diplicate')
                        getWeeklyTotals();
                        checkInitial();
                      }
                    })
                    .catch(function(error) {
                      console.error(error);
                    });
              })
            
            }else{
              var itemsProcessed = 0;

              //Insert
              rows.forEach((ele) => {
                knex("performance")
                  .insert({
                    agentName: ele.Name,
                    active: ele.Active,
                    dormant: ele.Dormant,
                    agentCode: ele.Code,
                    date: date,
                  })
                  .then(() => {
                    itemsProcessed++;
                    if (itemsProcessed === rows.length) {
                      MainWindow.webContents.send('Performance:updated')
                      dormantUpdate(rows)
          
                      let msg = "Performance data updated"
                      MainWindow.webContents.send("GlobalMsg", msg);
          
                      console.log('Performance:updated')
                      getWeeklyTotals();
                      checkInitial();
                    }
                  })
                  .catch(function(error) {
                    console.error(error);
                  });
                })
            }
          }).catch(function(error) {
            console.error(error);
          })
}
 
// //Insert into performance
// function InsertIntoPerformance(arr) {
//   var itemsProcessed = 0;
//   let date = new Date().setHours(0, 0, 0, 0);
//   date = new Date(date).toISOString();
//   let end  = new Date().setHours(23,59,59,999);
//         end = new Date(end).toISOString();
//  // Check if is data already entered
//   knex('performance').select('agentName')
//   .where('date',date)
//   .whereNotNull("agentName")
//   .then((res) =>{
//   if (res.length > 0) {
//     arr.forEach((ele) => {
//       knex("performance")
//       .where('agentName',ele.agentName)
//       .whereBetween('date',[date,end])
//         .update({ active: ele.active, dormant: ele.dormant,
//           dormantActive: ele.dormantActive,date:date})
//           .then(() => {
//             itemsProcessed++;
//             if (itemsProcessed === arr.length) {
//               MainWindow.webContents.send('Performance:updated')
//               dormantUpdate()

//               let msg = "Performance data updated"
//               MainWindow.webContents.send("GlobalMsg", msg);
//               console.log('Performance:updated-diplicate')
//               getWeeklyTotals();
//               checkInitial();
//             }
//           })
//           .catch(function(error) {
//             console.error(error);
//           });
//     })

//   }else{

//     arr.forEach((ele) => {
//       knex("performance")
//         .insert({
//           agentName: ele.agentName,
//           active: ele.active,
//           dormant: ele.dormant,
//           agentCode: ele.agentCode,
//           date: date,
//           dormantActive: ele.dormantActive,
//         })
//         .then(() => {
//           itemsProcessed++;
//           if (itemsProcessed === arr.length) {
//             MainWindow.webContents.send('Performance:updated')
//             dormantUpdate()

//             let msg = "Performance data updated"
//             MainWindow.webContents.send("GlobalMsg", msg);

//             console.log('Performance:updated')
//             getWeeklyTotals();
//             checkInitial();
//           }
//         })
//         .catch(function(error) {
//           console.error(error);
//         });
//       })
//     }
//     }) .catch(function(error) {
//     console.log('Performance:error')
//    // let msg = "Performance data inserted"
//       MainWindow.webContents.send("GlobalMsg", error.message);
//    console.error(error);
//  });
// }


//Calculates activeDormant values,dormantActive values
const subValues = (newEle, oldEle) => {
  const result = [];
  for (let i = 0; i < newEle.length; i++) {
    
    if (newEle[i].Code === oldEle[i].agentCode) {
      let dormantDiff = oldEle[i].dormant - newEle[i].Dormant;
      let dormantActive = (dormantDiff > 0) ? dormantDiff : Math.abs(dormantDiff)
      
      const element = {
        agentName: newEle[i].Name,
        active: newEle[i].Active ,
        dormant: newEle[i].Dormant,
        agentCode: newEle[i].Code,
        dormantActive:  dormantActive,
      };
      result[i] = element;
    }
  }
  return result;
};

//
function getMonthly(arg) {
      let  date = new Date(arg.month)
       let from = new Date(arg.month).toISOString()
       let to = new Date(date.getFullYear(),date.getMonth() +1, 0).toISOString()
 
   knex.select()
    .whereBetween("date", [from,to])
    .whereNotNull("agentName")
    .orderBy("agentName", "asc")

    .from("totalPerformance")
    .then((row) => {
      let monthData = SumAll(row)
        MainWindow.webContents.send('Monthly-details', monthData)
    }).catch(function(error) {
      console.error(error);
    });
}

    ipcMain.on('getMonthly-details', (e, range)=>{
        getMonthly(range)
    })

//Sum columns active ,dormant ,gainLoss
function Sum(arg) {
  var helper = {};
  return arg.reduce(function(r, o) {
    var key = o.agentCode + "-" + o.agentName;

    if (!helper[key]) {
      helper[key] = Object.assign({}, o); // create a copy of o
      r.push(helper[key]);
    } else {
      helper[key].dormantActive += o.dormantActive;
      helper[key].activeDormant += o.activeDormant;
      helper[key].gainLoss += o.gainLoss;
    }

    return r;
  }, []);
}

//Sum columns active ,dormant ,gainLoss
function SumAll(arg) {
  var helper = {};
  return arg.reduce(function(r, o) {
    var key = o.agentCode + "-" + o.agentName;

    if (!helper[key]) {
      helper[key] = Object.assign({}, o); // create a copy of o
      r.push(helper[key]);
    } else {
      helper[key].dormant += o.dormant;
      helper[key].active += o.active;
      helper[key].dormantActive += o.dormantActive;
      helper[key].activeDormant += o.activeDormant;
      helper[key].totalActive += o.totalActive;
      helper[key].totalDormant += o.totalDormant;
      helper[key].gainLoss += o.gainLoss;
    }

    return r;
  }, []);
}

//Get chart details
ipcMain.on("loadchart", (e, arg) => {
  //let to = new Date(arg.to).toISOString();

  let rows = knex
    .select()
    //.whereBetween("date", [from, to])
    .where("week",arg.from)
    .where("year",arg.year)
    .whereNotNull("agentName")
    .orderBy("agentName", "asc")
    .from("totalPerformance");
  rows.then((row) => {
    let totals = row;
    //Send data
    MainWindow.webContents.send("chartResults", totals);
  });
});


//Get chart details
ipcMain.on("getdata", (e, arg) => {
  let from = arg.begin;

  let to = new Date(arg.end).setHours(23,59,59,999);
  to = new Date(to).toISOString();
  
  let rows = knex
    .select()
    .whereBetween("date", [from, to])
    .whereNotNull("agentName")
    .orderBy("agentName", "asc")
    .from("totalPerformance");
  rows.then((row) => {
    let totals = row;
    //Send data
    MainWindow.webContents.send("dataResults", totals);
  });
});

//get agent performance data //Get daily data, sum for a week
function getDAilyTotals(arg) {

  let from = new Date(arg.from).setHours(0, 0, 0, 0);
  from = new Date(from).toISOString();

  let to = new Date(arg.to).setHours(23,59,59,999);
  to = new Date(to).toISOString();
  

  let rows = knex
    .select(
      "agentName",
      "agentCode",
      "dormantActive",
      "activeDormant",
      "gainLoss"
    )
    .whereBetween("date", [from, to])
    .whereNotNull("agentName")
    .orderBy("agentName", "asc")
    .from("performance");
  rows
    .then((row) => {
      //
      let totals = Sum(row);
  
      //Update totalPerformance
      totals.forEach((element) => {
        //
        knex("totalPerformance")
          .whereBetween("date", [from,to])
          .where("agentCode", element.agentCode)
          .update({
            dormantActive: element.dormantActive,
            activeDormant: element.activeDormant,
            gainLoss: element.gainLoss,
          })
          .then(() => {
            //
            calcTotals(arg);
          })
          .catch(function(error) {
            console.error(error);
          });
      });
    })
    .catch(function(error) {
      console.error(error);
    });
}

//Calculate weekly totals
function calcTotals(arg) {
  let now = new Date().toISOString();
  
  let from = new Date(arg.from).setHours(0, 0, 0, 0);
  from = new Date(from).toISOString();

  let to = new Date(arg.to).setHours(23,59,59,999);
  to = new Date(to).toISOString();

  knex
    .select(
      "agentCode",
      "dormant",
      "active",
      "gainLoss",
      "activeDormant",
      "dormantActive"
    )
    .whereBetween("date", [from,to])
    .whereNotNull("agentName")
    .from("totalPerformance")
    .then((rows) => {
      rows.forEach((element) => {
        //Calculate totals
        let totalActive = element.active + element.gainLoss;
        let totalDormant =  element.dormant + element.activeDormant - element.dormantActive
        knex("totalPerformance")
            .update({ totalActive: totalActive, totalDormant: totalDormant ,date:now})
            .where("agentCode", element.agentCode)
            .whereBetween("date", [from,to])
            .catch(function(error) {
              console.error(error);
            });
      });
    });
}


//Check and insert initial values
function hasInitial() {
  //check total dormant and total active for previous week
  let week = prevWeek();
  let now = new Date().toISOString();
  let dates = rangeDates(week) 
  let weeks = getEndDates(dates.from,dates.to)

 let range = {} 
 weeks.filter(ele => {
    if (new Date(ele.begin) <= new Date(week) && new Date(week) <=  new Date(ele.end)) {
     return range = ele
    }
  })
  console.log(range)
  knex
    .select("totalActive", "totalDormant", "agentCode", "agentName")
    .whereBetween("date",[range.begin,range.end])
    .whereNotNull("agentName")
    .from("totalPerformance")
    .then((rows) => {
      
      if (rows.length <= 0) {
        //if it doesnt exist get dormant and active from subscribers table
        knex
          .select("status", "agentName", "agentCode")
          .whereNotNull("agentName")
          .from("subscribers")
          .then((row) => {
            //Count dormant and active for each agent
            let newData = findAndCount(row);
            //console.log(newData);
            //Insert in to table for each agent
            newData.forEach((element) => {
              knex("totalPerformance")
                .insert({
                  dormant: element.Dormant,
                  active: element.Active,
                  agentName: element.Name,
                  agentCode: element.Code,
                  date: now,
                })
                .catch(function(error) {
                  console.error(error);
                });
            });
          });
      } else {
        //if it exist use it as initial values for the next week
        rows.forEach((element) => {
          knex("totalPerformance")
            .insert({
              dormant: element.totalDormant,
              active: element.totalActive,
              agentCode: element.agentCode,
              agentName: element.agentName,
              date: now,
            })
            .catch(function(error) {
              console.error(error);
            });
        });
      }
    });
}

//Check if current week initial values exists
function checkInitial() {
  // let todaysWeek = currentWeek();
  // let CurrWeekNumber = weekNumber(todaysWeek);
  let today  = new Date()
  let dates = rangeDates(today) 
  let weeks = getEndDates(dates.from,dates.to)
  let range = {} 
  
  weeks.filter(ele => {
    if ( new Date(ele.begin) <= new Date(today) && new Date(today) <= new Date(ele.end)) {
        return range = ele
    }
  });
 
  knex
    .select("dormant","active")
    .whereBetween("date", [range.begin.toISOString(), range.end])
    .whereNotNull("agentName")
    .from("totalPerformance")
    .then((rows) => {
     
      rows.length == 0 ? hasInitial() : "";
    });

}

//last day of the week
 function endOfWeek() {
    let today = new Date();
    let firstday = today.setTime(today.getTime() - 6*24*60*60*1000);
    firstday = new Date(firstday)
    let lastday =  today.setDate(firstday.getDate() + 6);
   return lastday;
 }

//d.setTime(d.getTime() - (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000)
//First day of the week
function startOfWeek() {
   let today = new Date();
  // let firstday = today.getDate() - today.getDay() + 1;
  // return new Date(today.setDate(firstday)).toISOString();
 return today.setTime(today.getTime() - 6*24*60*60*1000)
}

//check prevoius week
function prevWeek() {
  var today = new Date();
  var lastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 7
  );
  return lastWeek;
}

//currentWeek
function currentWeek() {
  var today = new Date();
  var currWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return currWeek;
}

// Next week number
function lastStartWeek() {
  let today = new Date();

  let lastday = today.setTime(today.getTime() - (today.getDay() ? today.getDay() : 7) * 24 * 60 * 60 * 1000);

  return new Date(lastday)
}

//Get week number
function weekNumber(weekdate) {
  let date = new Date(weekdate);

 var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}

//Check if its end of the week
function getWeeklyTotals() {

   let dates = rangeDates(new Date()) 
   let lastdays = getEndDates(dates.from,dates.to)
      
      //Check if its end of the week
      lastdays.forEach(ele => {
        if (new Date(ele.end).getDate() === new Date().getDate()) {
       let dateRange = { from: ele.begin, to: ele.end }
       console.log("dateRange")
       getDAilyTotals(dateRange);
     }
     
   });
} 

// Get first day and end day of a month
const rangeDates = (date) =>{
  let today  = new Date(date)
  let year = today.getFullYear()
   let month = today.getMonth()+1
  let  startDate = new Date(`${year}-${month}`)
   let endDate = new Date(today.getFullYear(),today.getMonth() +1, 0)
   
   return {from:startDate,to:endDate}
}

// Get weeks in a month
const getEndDates = (startDate,endDate) =>{
    //first the function and variable definitions
    let dates = []
    const addDays = function (days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    
    //
    let currentDate = new Date(startDate)
      endDate =  new Date(endDate) 
       let diff =  currentDate.getDate()
        new Date(currentDate.setDate(diff))
     
    while (currentDate <=  endDate) {
       let endWeekDate = addDays.call(currentDate, 6);

       // End date is equal last day of the month
        (endWeekDate > endDate) ?  endWeekDate = endDate: ""
        endWeekDate = new Date(endWeekDate).setHours(23,59,59,999);
        endWeekDate = new Date(endWeekDate).toISOString();

        // Add to dates array
        dates.push({begin:currentDate, end:endWeekDate});
         currentDate = addDays.call(currentDate, 7);
     }
    return dates;
}
// Get daily performance
 ipcMain.on('getDaily', (e,arg) =>{
  let start = new Date(arg).setHours(0,0,0,0);
  let end  = new Date(arg).setHours(23,59,59,999);
  start = new Date(start).toISOString();
  end = new Date(end).toISOString();

  knex.select()
    .whereBetween("date",[start,end])
    .whereNotNull("agentName")
    .from('performance')
    .orderBy("agentName", "asc")
     .then((row)=>{

          MainWindow.webContents.send('DailyResults', row)
       })
    })

    //
    // Find duplicates method
  function findAnSum(arr) {
    let result;
           //Find and count 
    result = [...arr.reduce( (mp, o) => {
         const key = JSON.stringify([o.status]);
         if (!mp.has(key)) mp.set(key, { ...o, count: 0 });
         mp.get(key).count++;
         return mp;
        }, new Map).values()];

        //Group values by key
       let newArr = groupBy(result, 'status')
       //
       let active = newArr.VALID.map((item) => {
            return {
               Active: item.count,
            };
         });
      // 
      let dormant = newArr.PUNISHSTOP.map((item) => {
            return {
                Dormant: item.count,
            };
         });

        //Merge arrays together
        const mergedArr = {Active:active[0].Active, Dormant:dormant[0].Dormant};
            
        return mergedArr
}

// Days Remain Updater
let countDownUpdater = (rows) => {
  let result;

  result = rows.map(ele => {
    let expire = new Date(ele.expireDate);

  let now = new Date(new Date().toDateString());
  let end = new Date(`${expire}`);
  // To calculate the time difference of two dates
  let Difference_In_Time = end.getTime() - now.getTime();
  let day = 1000 * 60 * 60 * 24;
  // To calculate the no. of days between two dates
  let countdown = Math.round(Difference_In_Time / day);
  let status;
  countdown > 0 ? (status = "VALID") : (status = "PUNISHSTOP");
    
   return {id:ele.id,agentName:ele.agentName,agentCode:ele.agentCode,customerName:ele.customerName,
    phone:ele.phone,card:ele.card,openDate:ele.openDate,status:status,duration:ele.duration,
    daysRemain:countdown,expireDate:ele.expireDate,dateJoined:ele.date_joined}
  });

  return result
}

// Merges two array
let arrayMerger = (arr1,arr2) => {
  let active = arr1.map((item) => {
    return {
      Name: item.agentName,
      agentCode: item.agentCode,
      dormantActive: item.count,
    };
  });

  //Create newn dormant object
  let dormant = arr2.map((item) => {
    return {
      Name: item.agentName,
      agentCode: item.agentCode,
      activeDormant: item.count,
    };
  });

  //Merge arrays together
  const map = new Map();
  active.forEach((item) => map.set(item.agentCode, item));
  dormant.forEach((item) =>
    map.set(item.agentCode, { ...map.get(item.agentCode), ...item })
  );
  const mergedArr = Array.from(map.values());
  return mergedArr;
}