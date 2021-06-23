<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Gain/Loss Vs Total Active</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div>
                <!-- Chart -->
            <canvas id="canvasGLT" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
            <!-- Panel data -->
            <p class="ml-3">
                  <span class="badge badge-info">Total</span> : <span  id="ta-total" class=" mr-5"></span>
               <span class="badge badge-warning">Total</span> : <span  id="gl-total"></span>
              </p>
          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'GainLossVsTotalActive',
   props:{total:Array},
  data(){
    return {
      data:this.total,
     
    }
  },
     methods:{
    GLTChart (){
      
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
        dormantvals.push(element.gainLoss);
      });

       // add all dormant values
    let sumGainLoss = dormantvals.reduce((a,b) => {
          return  a + b 
      });

   let sumTotalActive = activevals.reduce((a,b) => {
          return  a + b 
      });
    document.getElementById("ta-total").innerHTML = sumTotalActive;
      document.getElementById("gl-total").innerHTML = sumGainLoss;

      //console.log(this.data)
   let ctxL = document.getElementById("canvasGLT").getContext('2d');
   //
     if (this.myChart != undefined && this.myChart != null){ this.myChart.destroy() }
    //
    this.myChart = new Chart(ctxL, {
       type: 'bar',
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
          label: 'Gain/Loss',
          data: dormantvals,
            //fillColor: "#dc3545",
          backgroundColor: '#FDB45C',
          borderColor: '#ffcc80 ',
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
    this.GLTChart()
        })

     })
   
  }
}
</script>

