<template>
  <div class="row">
    <div class="col-md-12">
      <ul class="list-inline list-unstyled my-0 px-0 float-right">
        <li class="list-inline-item">
          <form class="form-inline md-form my-0">
            <div class="form-sm">
              <label for="form2" class=""> </label>
              <input
                type="week"
                class="form-control form-control-sm"
                v-model="week"
                required
                @change="reLoadChart"/>
            </div>
          </form>
        </li>
      </ul>
    </div>
  </div>
  <!-- Grid row 1-->
  <div class="row border-bottom">
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <!-- Grid row -->
      <Dormant :total="total"></Dormant>
    </div>
    <!-- Grid column -->
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <Active :total="total"></Active>
    </div>
    <!-- Grid column -->
  </div>
   <div class="row border-bottom">
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <GainLoss :total="total"></GainLoss>
    </div>
    <!-- Grid column -->
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <!-- Grid row -->
       <DormantVsActive :total="total"></DormantVsActive>
    </div>
    <!-- Grid column -->
  </div>
  <!-- Grid row 2-->
   <div class="row border-bottom">
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <!-- Grid row -->
      <TotalDormantActive :total="total"></TotalDormantActive>
    </div>
    <!-- Grid column -->

    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
       <GainLossVsTotalActive :total="total"></GainLossVsTotalActive>
    </div>
    <!-- Grid column -->
  </div>

  <!-- Grid row 3-->
   <div class="row justify-content-center">
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <Dormant3 :total="total"></Dormant3>
    </div>
    <!-- Grid column -->
    <!-- Grid column -->
    <div class="col-lg-6 mb-4">
      <Active3 :total="total"></Active3>
    </div>
    <!-- Grid column -->
    </div>

</template>

<script>
import Dormant from "./Dormant.vue";
import Active from "./Active.vue";
import Dormant3 from "./Dormant3.vue";
import Active3 from "./Active3.vue";
import DormantVsActive from "./DormantVsActive.vue";
import GainLoss from "./GainLoss.vue";
import GainLossVsTotalActive from "./GainLossVsTotalActive.vue";
import TotalDormantActive from "./TotalDormantActive.vue";

const { ipcRenderer } = require("electron");

export default {
  name: "Dashboard",
  components: {
    Active,
    Dormant,
    Dormant3,
    Active3,
    DormantVsActive,
    GainLoss,
    GainLossVsTotalActive,
    TotalDormantActive,
  },
  data() {
    return {
      total: [],
      weekRange:"", 
      week:"",
      month:null,
    };
  },
  methods: {
    reLoadChart() {
      let  range = {from:parseInt(this.week.substr(6)), year:parseInt(this.week.substr(0,4))} //{ from: this.from, to: this.to };
      ipcRenderer.send("loadchart", range);
       //this.$emit('page:update', pageNumber);
      //this.changeLineChart();
    },
    /*changeLineChart() {
      var labelvals = [];
      var activevals = [];
      var dormantvals = [];
      var datavals = [];

      this.myChart.destroy();
      this.myPie.destroy();

      //go through and create array of
      this.total.forEach((element) => {
        labelvals.push(element.agentName);
      });
      //go through and create array of
      this.total.forEach((element) => {
        activevals.push(element.dormantActive);
      });
      //go through and create array of
      this.total.forEach((element) => {
        dormantvals.push(element.activeDormant);
      });
      //
      this.total.forEach((element) => {
        datavals.push(element.gainLoss);
      });
      this.myChart.data.datasets[0].data = labelvals;
      this.myChart.data.datasets[0].data = activevals;
      this.myChart.data.datasets[1].data = dormantvals;
      this.myChart.update();

      //Update Pie Chart
      this.myPie.data.datasets[0].data = labelvals;
      this.myPie.data.datasets[1].data = datavals;
      this.myPie.update();
      //
    },*/
      //Get week number
     weekNumber(weekdate) {
     
      let result = Math.ceil(weekdate.substr(6));
     this.week = result
    },
     loadChart(){
        let  range = {from:this.week,
                        year :this.week.substr(0,4)
        }
        ipcRenderer.send('loadchart', range)
      },
      changeLineChart() {
      var labelvals = [];
      var dormantvals = [];

      this.dormantChart.destroy();

      //go through and create array of
      this.total.forEach((element) => {
        dormantvals.push(element.activeDormant);
      });
      //
  
      this.dormantChart.data.datasets[0].data = labelvals;
      this.dormantChart.data.datasets[1].data = dormantvals;
      this.dormantChart.update();
      //
    },
  },
  created(){
    this.loadChart()
    ipcRenderer.on("chartResults", (e, arg) => {
      this.total = arg;
    });
    },

  mounted() {
     ipcRenderer.on("chartResults", (e, arg) => {
      this.total = arg;
    });
  },
};
</script>
