<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Active</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div>
                <!-- Chart -->
            <canvas id="canvas-active" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
            <!-- Panel data -->
       <p class="ml-3"> <span class="badge badge-success">Total</span> : <span  id="active-total"></span> </p>

          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'Active',
  props:{total:Array},
  
  data(){
    return {
     data:this.total,     
    }
  },
     methods:{
    buildActiveChart (){
      
     var labelvals = [];
     var activevals = [];

    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         }); 
    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           activevals.push(element.active);
         });
      
       // add all dormant values
    let SumActive = activevals.reduce((a,b) => {
          return  a + b 
      });
    document.getElementById("active-total").innerHTML = SumActive;


      //console.log(this.data)
   let ctxL = document.getElementById("canvas-active").getContext('2d');
   //
     if (this.myActiveChart != undefined && this.myActiveChart != null){ this.myActiveChart.destroy() }
    //
    this.myActiveChart = new Chart(ctxL, {
       type: 'line',
      data: {
        labels: labelvals,
        datasets: [{
          label: 'Active',
          data: activevals,
           // fillColor: "#28a745",
          backgroundColor: '#28a745',
          borderColor: 'rgba(0, 213, 132, .7)',
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
       changeLineChart() {
      var labelvals = [];
      var activevals = [];

      this.myActiveChart.destroy();

      //go through and create array of
      this.total.forEach((element) => {
        activevals.push(element.active);
      });
      //
  
      this.myActiveChart.data.datasets[0].data = labelvals;
      this.myActiveChart.data.datasets[1].data = activevals;
      this.myActiveChart.update();
      //
    },
  },

  mounted(){
    
    this.$nextTick(function () {
    // entire view has been rendered
      ipcRenderer.on('chartResults', (e, arg) => {
        this.data = arg
        this.buildActiveChart()
        })

     })
      
  }
}
</script>

