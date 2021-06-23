<template>
     <div class="card  card-cascade z-depth-0">
            <div class="card-title p-3">Dormant Vs Active Dormant Vs Total Dormant</div>
          <!-- Card content -->
          <div class="card-body card-body-cascade pb-0 pt-0">
            <!-- Panel data -->
            <div class="row card-body mt-0">
              <!-- First column -->
              <div>
                <!-- Chart -->
             <canvas id="pieChart-d3"  height="400px" style="height:400px;width:400px;"></canvas>
              </div>
              <!-- First column -->
            </div>
              <p class="ml-3"> Total : <span  id="activeTotal"></span> </p>
            <!-- Panel data -->
          </div>
          <!-- Card content -->
          </div>
</template>

<script>
import { ipcRenderer } from "electron";
const Chart = require('chart.js')

export default {
  name: 'Dormant3',
   props:{total:Array},
  data(){
    return {
     data:this.total,    
    }
  },
     methods:{
   Dormant3Chart(){
      var labelvals = [];
     var datavals;
      let arr = [];
    //go through and create array of labels
         this.data.forEach(element => {
           labelvals.push(element.agentName);
         })
    //go through and create array of labels
        this.data.forEach(element => {
           let obj = {agentName:element.agentName,agentCode:element.agentCode,dormant:element.dormant,
               activeDormant:element.activeDormant,totalDormant:element.totalDormant}
           arr.push(obj);
         })
           datavals = this.SumDormants(this.data);

       let sumTotal = datavals.reduce((a,b) => {
          return  a + b 
      });
     document.getElementById("activeTotal").innerHTML = sumTotal;

      //pie
    var ctxP = document.getElementById("pieChart-d3").getContext('2d');
    //
     if (this.myD3 != undefined && this.myD3 != null) { this.myD3.destroy() }
     //
     this.myD3 = new Chart(ctxP, {
       //pie
      type: 'pie',
      data: {
        labels:labelvals,
        datasets: [{
          data: datavals,
          backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#f06292 ","#4D5360","#20c997","#17a2b8","#6f42c1","#6610f2",
           "#ff6d00","#eeff81","#ff9100","#afb42b","#558b2f","#0288d1","#00897b","#a1887f","#ff3d00","#b0bec5","#b2ebf2"],
          //hoverBackgroundColor: ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774","","#17a2b8"]
        }]
      },
      options: {
        responsive: true
      }
      
    });
    
   },
     loadChart(){
        let  range = {from:this.from, to:this.to}
        ipcRenderer.send('loadchart', range)
      },

SumDormants(arg){
  let arr = []

  //Loop and sum dormant values
 arg.forEach(ele => {
   let d3 =  ele.dormant + ele.activeDormant
      arr.push(d3)
 });
 return arr
}
      
  },

  mounted(){
   
    this.$nextTick(function () {
    // entire view has been rendered
      ipcRenderer.on('chartResults', (e, arg) => {
        this.data = arg
       this.Dormant3Chart()
        })

    })
      
  }
}
</script>

