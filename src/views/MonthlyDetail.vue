<template>
 <SubMenu/>
   <div class="row">
     <!-- Top Table UI -->
         <!-- <div class="col-lg-8">
            <div class="table-ui">
              Grid row 
              </div>-->
              <!-- Grid row 
            </div>-->
            
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
                    <th scope="col">TOTAL DORMANT</th>
                     <th scope="col">ACTIVE</th>
                    <th scope="col" class="text-danger">ACTIVE DORMANT</th>
                    <th scope="col" class="text-warning">GAIN / LOSS</th>
                     <th scope="col">TOTAL ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                 <tr  v-for="(agent,index) in records" :key="agent.agentCode"> 
                    <td>{{index+1}} </td>
                  <td class="font-weight-normal">{{ agent.agentName}} </td> 
                  <td class="font-weight-normal">{{ agent.agentCode}} </td> 
                   <td class="font-weight-normal">{{ agent.dormant}} </td> 
                  <td class="font-weight-normal text-success">{{ agent.dormantActive }}</td> 
                   <td class="font-weight-normal">{{ agent.totalDormant}} </td> 
                    <td class="font-weight-normal">{{ agent.active}} </td> 
                  <td class="font-weight-normal text-danger">{{ agent.activeDormant }}</td>
                  <td v-if="agent.gainLoss >= 0 " class="success-color text-white font-weight-normal"> {{ agent.gainLoss }}</td>
                  <td v-else class="danger-color font-weight-normal text-white font-weight-normal"> {{ agent.gainLoss }}</td>
                  <td class="font-weight-normal">{{ agent.totalActive }}</td>
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
                  <div class="form-sm">
                <label for="form2" class="">Month </label>
                <input type="month" id="target_date" class="form-control form-control-sm" v-model="from" @change="getDetail">
              </div>
                </li>
            </ul> 
          </div>

            <!--Performing Agents-->
           <!-- <div class="row justify-content-center mb-5">
          <ul class="list-group list-unstyled text-center">
            <h6 class="dark-grey-text font-weight-bold"> <i class="fas fa-chart-line text-success"></i> Best performing agents</h6>
                <li class="list-group-item border-top-0 border-right-0 border-left-0" v-for="agent in top" :key="agent.agentCode"> 
                      Name: {{ agent.agentName }}
                    <span class="ml-5"> Agent Code: {{ agent.agentCode }}</span>
                </li>
            </ul>
          </div>-->
          <!--Performing Agents-->
         <!-- <div class="row justify-content-center mb-5">
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
import SubMenu from '../components/SubMenu'
const { ipcRenderer } = require('electron');

export default {
    name:'Agents',
    components:{
      SubMenu
      },
     
      data (){
      return {
     top:'',
     last:'',
     records:'',
     from:null,
    }
      },
    methods:{
        loadAgents(){
    ipcRenderer.send('Get-Agents')
        },
        getDetail(){
        let  range = {month: this.from}
      ipcRenderer.send('getMonthly-details',range)
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
    
     }
  
    } ,
    created(){
      this.getDetail()

    ipcRenderer.on('Monthly-details', (e,arg) =>{
          this.records = arg 
      this.tableTotal()
     })
    // this.calcTotals()
   } 
}
</script>

<style>

</style>