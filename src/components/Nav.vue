<template>
<div class="row">
  <!--Grid Col-->
  <div class="col-lg-9 col-md-9">
  <ul class="nav nav-tabs p-2">
  <li class="nav-item">
        <router-link to="/" class="nav-link waves-effect" active-class="active">Customers</router-link>
  </li>
  <li class="nav-item">
       <router-link to="/performance"  class="nav-link waves-effect" active-class="active">Performance</router-link>
  </li>

  </ul>
  </div>
  <!--Grid Col-->
 
<div class="col-lg-3 col-md-3 border-bottom">
  <!-- Basic dropdown -->
<button class="btn btn-link dropdown-toggle mr-4" type="button" data-toggle="dropdown"
  aria-haspopup="true" aria-expanded="false" :disabled="disabled == true"> Action</button>

<div class="dropdown-menu">
  <button class="dropdown-item btn-link"  @click.prevent="runPerformance">Run</button>
</div>
<!-- Basic dropdown -->
</div>

</div>
</template>

<script>
const { ipcRenderer } = require("electron");

export default {
  name: 'Nav',
   data() {
    return {
      msg:"",
      disabled:false,
    };
  },
  methods:{
 runPerformance(){
   ipcRenderer.send('start-performannce')
   this.disabled = true
 }
  },
  mounted(){
    ipcRenderer.on('Performance:updated' , () =>{
      this.disabled = false
    })
  }
}


</script>

