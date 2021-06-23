<template>
      <Nav/>
  <div class="container-fluid">
  <div class="row">
   <!--Col-->
    <div class="col-lg-12 col-md-12">
      <div class="tab-content">
        <router-view/>
      </div>
    </div>
    <!-- Alert box-->
    <div class="col-lg-5 col-md-5 fixed-bottom">
    <div class="alert alert-info alert-dismissible fade show float-right" role="alert" v-show="visibility">
      <strong>{{msg}}.</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="alertShow">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
 <!-- Alert box-->
  </div>
</div>
</template>
<script>
import Nav from './components/Nav.vue'
const { ipcRenderer } = require("electron");

export default {
  name: 'app',
  components: {
    Nav,

  },
  data() {
    return {
      empty: false,
      visibility:false,
      msg:""
    }
  },
  methods:{
    alertShow(){
       this.visibility = false;
       this.msg = ""
    }
  },
   mounted() {
    ipcRenderer.on("GlobalMsg", (e, arg) => {
       this.visibility = true;
      this.msg = arg;
    });
   }
};
</script>
