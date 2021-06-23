<template>
 <SubMenu/>
<div class="row">
  <div class="col-lg-12">
     <Dashboard/>
  </div>
</div>
</template>

<script>
import Dashboard from '../components/Dashboard.vue'
import SubMenu from '../components/SubMenu'
export default {
 name:'Performance',
 components:{
   Dashboard,
   SubMenu,
 // Agents,
 },
 data (){
    return{
      empty:false,
    }
  },
}
</script>

<style>

</style>