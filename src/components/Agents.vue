<template>
   <div class="row">
     <!-- Top Table UI -->
          <div class="col-lg-8">
            <div class="table-ui">
              <!-- Grid row -->
              <div class="float-right">
                <!-- Grid column -->
                </div>
                <!-- Grid column -->
              </div>
              <!-- Grid row -->
            </div>
            <!-- Top Table UI -->
            <div class="col-lg-9">
               <div class="table-responsive">
                <table class="table table-hover text-center" id="agents_table">
                <thead>
                  <tr>
                    <th></th>
                    <th scope="col">AGENT</th>
                    <th scope="col">CODE</th>
                     <th scope="col">DORMANT</th>
                    <th scope="col" class="text-success">DORMANT ACTIVE</th>
                    <th scope="col">TOTAL DORMANT</th>
                     <th scope="col">ACTIVE</th>
                    <th scope="col" class="text-danger">ACTIVE DORMANT</th>
                    <th scope="col" class="text-warning">GAIN / LOSS</th>
                     <th scope="col">TOTAL ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr  v-for="(agent,index) in records" :key="agent.agentCode" id="tr"> 
                     <td class="font-weight-normal">{{ index+1 }}</td>
                  <td class="font-weight-normal">{{ agent.agentName}} </td> 
                  <td class="font-weight-normal">{{ agent.agentCode}} </td> 
                   <td class="font-weight-normal">{{ agent.dormant}} </td> 
                  <td class="font-weight-normal text-success" id="dormantA">{{ agent.dormantActive }}</td> 
                   <td class="font-weight-normal" id="totalD">{{ agent.totalDormant}} </td> 
                    <td class="font-weight-normal" id="active">{{ agent.active}} </td> 
                  <td class="font-weight-normal text-danger" id="activeD">{{ agent.activeDormant }}</td>
                  <td v-if="agent.gainLoss >= 0 " class="success-color text-white font-weight-normal" id="gainLoss"> {{ agent.gainLoss }}</td>
                  <td v-else class="danger-color font-weight-normal text-white" id="gainLoss"> {{ agent.gainLoss }}</td>
                  <td class="font-weight-normal" id="totalA">{{ agent.totalActive }}</td>
                </tr>
              
              </tbody>
              <tfoot>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col">GRAND</th>
                     <th scope="col" id="grandD"></th>
                    <th scope="col"  id="grandDA"> </th>
                    <th scope="col" id="grandTD"> </th>
                     <th scope="col" id="grandA"></th>
                    <th scope="col"  id="grandAD"> </th>
                    <th scope="col"  id="grandGL"></th>
                     <th scope="col" id="grandTA"> </th>
                  </tr>
                </tfoot>
            </table>
            </div>
          </div>
         <!--Table-->
         <!-- Col Date-->
        <div class="col-lg-3">
          <div class="row justify-content-center mt-0">
            <ul class="list-inline list-unstyled px-0">
                 <li class="list-inline-item">
                  <form class="form-inline mb-0 mt-0 material-tooltip-main">
                <div class="form-sm">
                <label for="form2" class=""> </label>
                <input type="month" id="target_date" class="form-control form-control-sm" v-model="month" required
                 @change="getWeekly(month)">
              </div>
                       
                  </form>
                </li>
            </ul> 
             <!--category-->
            <div class="col-lg-8">
                  <select v-model="selected" class="browser-select custom-select form-control-sm" 
                  @change="getWeekRange">
                <option  v-for="(date,index) in week" :value="date" :key="date.index">
                   {{"Week " + (index + 1)}} </option>
                </select>
              </div>
             
          </div>

            <!--Performing Agents
            <div class="row justify-content-center mb-5">
          <ul class="list-group list-unstyled text-center">
            <h6 class="dark-grey-text font-weight-bold"> <i class="fas fa-chart-line text-success"></i> Best performing agents</h6>
                <li class="list-group-item border-top-0 border-right-0 border-left-0" v-for="agent in top" :key="agent.agentCode"> 
                      Name: {{ agent.agentName }}
                    <span class="ml-5"> Agent Code: {{ agent.agentCode }}</span>
                </li>
            </ul>
          </div>-->
          <!--Performing Agents
          <div class="row justify-content-center mb-5">
         <ul class="list-group list-unstyled text-center">
           <h6 class="dark-grey-text font-weight-bold"><i class="fas fa-chart-line text-danger"></i> Last performing agents</h6>
              <li class="list-group-item border-top-0 border-right-0 border-left-0" v-for="agent in last" :key="agent.agentCode"> 
                     Name: {{ agent.agentName }}
                   <span class="ml-5"> Agent Code: {{ agent.agentCode }}</span>
              </li>
          </ul>
        </div>-->
         <!--Performing Agents-->
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');

export default {
    name:'Agents',
     
      data (){
      return {
     top:'',
     last:'',
     records:'',
     month:'',
     week:[],
     selected:{}
    }
      },
    methods:{
        getWeekly(month){
    let  date = new Date(month)
       let from = new Date(month)
       let to = new Date(date.getFullYear(),date.getMonth() +1, 0)
    let wkArr = this.getDates(from,to)
        this.week = wkArr  
      },
      getWeekRange(){
        let range = {begin:this.selected.begin,end:this.selected.end}
        ipcRenderer.send('getdata', range)
        //console.log(this.selected)
      },
        loadWeekly(){
          let today  = new Date()
           var currWeek = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );
          let year = currWeek.getFullYear()
           let week = this.CurrWeekNumber() 
        let range = {from:year, to:week}
        // console.log(range)
      ipcRenderer.send('getdata',range)
    },
    calBest(){
      let bestAgent  =  
           (3 > this.records.length) ? false : this.records.slice().sort((a,b) =>{return b.dormantActive - a.dormantActive})
           .slice(0,3)
      let worstAgent = (3 > this.records.length) ? false : this.records.slice().sort((a,b) =>{return b.activeDormant - a.activeDormant})
           .slice(0,3)

              this.top = bestAgent
              this.last = worstAgent
    },
     tableTotal(){
     
    document.getElementById("grandD").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.dormant)}, 0.00);
    document.getElementById("grandDA").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.dormantActive)}, 0.00);
    document.getElementById("grandTD").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.totalDormant)}, 0.00);
    document.getElementById("grandA").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.active)}, 0.00);
    document.getElementById("grandAD").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.activeDormant)}, 0.00);
    document.getElementById("grandGL").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.gainLoss)}, 0.00);
    document.getElementById("grandTA").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.totalActive)}, 0.00);
    
     },
     getDates(startDate, endDate) {
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
    (endWeekDate > endDate) ?  endWeekDate = endDate: ""

  dates.push({begin: currentDate,end:endWeekDate});
  currentDate = addDays.call(currentDate, 7);
 }
return dates;
},
//Get week number
 CurrWeekNumber() {
  var d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
},
    } ,
    created(){
      //this.loadWeekly()
      ipcRenderer.on("dataResults", (e, arg) => {
      this.records = arg;
    this.tableTotal()
    });
    
   } 
}
</script>

<style>

</style>