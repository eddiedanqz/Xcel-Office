<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Total Dormant Vs Total Active</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div>
                <!-- Chart -->
            <canvas id="canvasTDA" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
            <!-- Panel data -->
            <p class="ml-3">
                  <span class="badge badge-info">Total</span> : <span  id="total-a" class=" mr-5"></span>
               <span class="badge badge-primary">Total</span> : <span  id="total-d"></span>
              </p>
          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'TotalDormantActive',
    props:{total:Array},

  data(){
    return {
     data:this.total,
     
    }
  },
     methods:{
    buildChart (){
      
     var labelvals = [];
     var activevals = [];
     var dormantvals = [];

    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         }); 
    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           activevals.push(element.totalActive);
         });
      //go through and create array of dates - just get unique dates
      this.data.forEach(element => {
        dormantvals.push(element.totalDormant);
      });

       let sumTotalActive = activevals.reduce((a,b) => {
          return  a + b 
      });

       let sumTotalDormant = dormantvals.reduce((a,b) => {

          return  a + b 
      });
      document.getElementById("total-a").innerHTML = sumTotalActive;
      document.getElementById("total-d").innerHTML = sumTotalDormant;

    
      //console.log(this.total)
   let ctxL = document.getElementById("canvasTDA").getContext('2d');
   //
     if (this.myChart != undefined && this.myChart != null){ this.myChart.destroy() }
    //
    this.myChart = new Chart(ctxL, {
       type: 'line',
      data: {
        labels: labelvals,
        datasets: [{
          label: 'Total Active',
          data: activevals,
           // fillColor: "#28a745",
          backgroundColor: '#46BFBD',
          borderColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 1
        }, {
          label: 'Total Dormant',
          data: dormantvals,
            //fillColor: "#dc3545",
          backgroundColor: 'rgba(0, 137, 132, .2)',
          borderColor: 'rgba(0, 10, 130, .7)',
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
        this.buildChart()
        })

      })
  }
}
</script>

