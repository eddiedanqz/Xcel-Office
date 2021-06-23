<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Dormant Vs Active</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div class="">
                <!-- Chart -->
            <canvas id="canvas-DA" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
            <!-- Panel data -->
               <p class="ml-3">
                  <span class="badge badge-success">Total</span> : <span  id="actives-total" class=" mr-5"></span>
               <span class="badge badge-danger">Total</span> : <span  id="dormants-total"></span>
              </p>

          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'DormantVsActive',
   props:{total:Array},
  data(){
    return {
     data:this.total,
     
    }
  },
     methods:{
    Chart_DA (){
      
     var labelvals = [];
     var activevals = [];
     var dormantvals = [];
   
    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         }); 
    //go through and create array of active values
         this.data.forEach(element => {
           activevals.push(element.active);
         });
      //go through and create array of dormant values
      this.data.forEach(element => {
        dormantvals.push(element.dormant);
      });

      // add all dormant values
    let sumDormants = dormantvals.reduce((a,b) => {
          return  a + b 
      });

       // add all dormant values
    let SumActives = activevals.reduce((a,b) => {
          return  a + b 
      });
    document.getElementById("actives-total").innerHTML = SumActives;
    document.getElementById("dormants-total").innerHTML = sumDormants;

      //
   let ctxL = document.getElementById("canvas-DA").getContext('2d');
   //
     if (this.myChart != undefined && this.myChart != null){ this.myChart.destroy() }
    //
    this.myChart = new Chart(ctxL, {
       type: 'bar',
      data: {
        labels: labelvals,
        datasets: [{
          label: 'Active',
          data: activevals,
           // fillColor: "#28a745",
          backgroundColor: '#28a745',
          borderColor: 'rgba(0, 213, 132, .7)',
            borderWidth: 1
        }, {
          label: 'Dormant',
          data: dormantvals,
            //fillColor: "#dc3545",
          backgroundColor: '#F7464A',
          borderColor: 'rgba(200, 99, 132, .7)',
            borderWidth: 1
        }]
      },options: {
        responsive: true
      }
     })
    
    // lineChart.reset()
   },
     loadChart(){
        let  range = {from:this.from, to:this.to}
        ipcRenderer.send('loadchart', range)
      },
      
  },

  mounted(){
    
     this.$nextTick(function () {
    // entire view has been rendered
      ipcRenderer.on('chartResults', (e, arg) => {
        this.data = arg
        this.Chart_DA()
        })
   })
       
  }
}
</script>

