<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Dormant</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0 mt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div>
                <!-- Chart -->
            <canvas id="canvas" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
             <p class="ml-3"> <span class="badge badge-danger">Total</span> : <span  id="dormant-total"></span> </p>
            <!-- Panel data -->
          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'Dormant',
  props: {total:Array},
  data(){
    return {
     data:this.total,
    }
  },
     methods:{
    buildDormantChart (){
      
     var labelvals = [];
     var dormantvals = [];

    //go through and create array of dates - just get unique dates
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         }); 

      //go through and create array of dates - just get unique dates
      this.data.forEach(element => {
        dormantvals.push(element.dormant);
      });
      
          // add all dormant values
    let SumDormant = dormantvals.reduce((a,b) => {
          return  a + b 
      });
  document.getElementById("dormant-total").innerHTML = SumDormant;

     // console.log(this.data)
   let ctxL = document.getElementById("canvas").getContext('2d');
   //
     if (this.dormantChart != undefined && this.dormantChart != null){ this.dormantChart.destroy() }
    //
    this.dormantChart = new Chart(ctxL, {
       type: 'line',
      data: {
        labels: labelvals,
        datasets: [{
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
    
  //  this.changeLineChart()
   },
     loadChart(){
        let  range = {from:this.week}
        ipcRenderer.send('loadchart', range)
      },
      changeLineChart() {
     // var labelvals = [];
      var dormantvals = [];

      this.dormantChart.destroy();

      //go through and create array of
      this.total.forEach((element) => {
        dormantvals.push(element.dormant);
      });
      //
  
      //this.dormantChart.data.labels = labelvals;
      this.dormantChart.data.datasets[0].data = dormantvals;
      this.dormantChart.update();
      //
    },
  },
 
  mounted(){
      //this.data = this.week
     this.$nextTick(function () {
    // entire view has been rendered
      ipcRenderer.on('chartResults', (e, arg) => {
        this.data = arg
        this.buildDormantChart()
        })

        })
      
  }
}
</script>

