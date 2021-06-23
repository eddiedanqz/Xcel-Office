<template>
 <SubMenu/>
   <div class="row">
     <!-- Top Table UI -->
          <div class="col-lg-9">
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
                    <th scope="col"></th>
                    <th scope="col">AGENT</th>
                    <th scope="col">CODE</th>
                     <th scope="col">DORMANT</th>
                    <th scope="col" class="text-success">DORMANT ACTIVE</th>
                     <th scope="col">ACTIVE</th>
                    <th scope="col" class="text-danger">ACTIVE DORMANT</th>
                    <th scope="col" class="text-warning">GAIN / LOSS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr  v-for="(agent,index) in records" :key="agent.agentCode" id="tr"> 
                    <td>{{index+1}} </td>
                  <td class="font-weight-normal">{{ agent.agentName}} </td> 
                  <td class="font-weight-normal">{{ agent.agentCode}} </td> 
                   <td class="font-weight-normal">{{ agent.dormant}} </td> 
                  <td class="font-weight-normal text-success" id="dormantA">{{ agent.dormantActive }}</td> 
                    <td class="font-weight-normal" id="active">{{ agent.active}} </td> 
                  <td class="font-weight-normal text-danger" id="activeD">{{ agent.activeDormant }}</td>
                  <td v-if="agent.gainLoss >= 0 && (agent.gainLoss) " class="success-color text-white font-weight-normal" id="gainLoss"> {{ agent.gainLoss }}</td>
                  <td v-else class="danger-color font-weight-normal text-white" id="gainLoss"> {{ (agent.gainLoss) ? agent.gainLoss : 0 }}</td>
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
                     <th scope="col" id="grandA"></th>
                    <th scope="col"  id="grandAD"> </th>
                    <th scope="col"  id="grandGL"></th>
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
                <input type="date" id="target_date" class="form-control form-control-sm" v-model="weekDate" required
                  @change="getDaily">
              </div>
                       
                  </form>
                </li>
            </ul> 
          </div>
       
        </div>
    </div>
</template>

<script>
import SubMenu from '../components/SubMenu'
const { ipcRenderer } = require('electron');

export default {
    name:'Daily',
      components:{
      SubMenu
      },
      data (){
      return {
     top:'',
     last:'',
     records:'',
     weekDate: new Date(),
     
    }
      },
    methods:{
        getDaily(){
   let today  = this.weekDate
           
        let date = today
         
        ipcRenderer.send('getDaily', date)
      },
        loadWeekly(){
          let today  = new Date()
           
        let date = today
        // console.log(date)
      ipcRenderer.send('getDaily',date)
    },
     tableTotal(){
     
    document.getElementById("grandD").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.dormant)}, 0.00);
    document.getElementById("grandDA").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.dormantActive)}, 0.00);

    document.getElementById("grandA").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.active)}, 0.00);
    document.getElementById("grandAD").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.activeDormant)}, 0.00);
    document.getElementById("grandGL").innerHTML =  this.records.reduce((accum, item) => {
    // Assuming expenses is the field you want to total up
    return accum + parseFloat(item.gainLoss)}, 0.00);

    
     },
     getDates(startDate) {
//first the function and variable definitions
let dates = []
const addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };
//now our Sunday check
let currentDate = new Date(startDate)
   
   let diff =  currentDate.getDate() - (currentDate.getDay() - 1) 
   console.log( new Date(currentDate.setDate(diff)))
 
while (dates.length < 4) {
  dates.push({begin: currentDate});
  currentDate = addDays.call(currentDate, 7);
  //if (dates.length == 4) return
 }
return dates;
},

    } ,
    created(){
      this.getDaily()

      ipcRenderer.on("DailyResults", (e, arg) => {
      this.records = arg;
    this.tableTotal()
    });
   // let wkArr = this.getDates()
    //let drvv = wkArr //* 24 * 60 * 60 * 1000
   // console.log(wkArr)
   } 
}
</script>

<style>

</style>