<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Gain / Loss</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body">
              <!-- First column -->
              <div>
                <!-- Chart -->
            <canvas id="canvas-GL" height="400" width="600" class="chartjs-render-monitor" style="display: block; width: 600px; height: 400px;">
            </canvas>
              </div>
              <!-- First column -->
            </div>
             <p class="ml-3"> <span class="badge badge-warning">Total</span> : <span  id="gainLoss-total"></span> </p>
            <!-- Panel data -->
          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'GainLoss',
  props:{total:Array},
  data(){
    return {
      data:this.total,
    }
  },
     methods:{
   GLChart(){
      var labelvals = [];
     var datavals = [];

    //go through and create array of labels
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         })
    //go through and create array of labels
      this.data.forEach(element => {
           datavals.push(element.gainLoss);
         })
   
      // add all dormant values
    let sumGainLoss = datavals.reduce((a,b) => {
          return  a + b 
      });
    document.getElementById("gainLoss-total").innerHTML = sumGainLoss;

      //pie
    var ctxP = document.getElementById("canvas-GL").getContext('2d');
    //
     if (this.myPie != undefined && this.myPie != null) { this.myPie.destroy() }
     //
     this.myPie = new Chart(ctxP, {
      type: 'bar',
      data: {
        labels: labelvals,
        datasets: [{
          label: 'Gain / Loss',
          fillColor: '#FDB45C',
          data: datavals,
          backgroundColor: [ "#FDB45C"],
          //hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"],
          borderColor:1
        }]
      },
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
    
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
      this.GLChart()
        })
      })

  }
}
</script>

