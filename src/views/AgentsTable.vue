<template>
   <SubMenu/>
<div class="row">
  <div class="col-lg-12">
     <Agents/>
  </div>
</div>
</template>

<script>
import Agents from "../components/Agents.vue";
import SubMenu from '../components/SubMenu'

export default {
components:{
  Agents,
  SubMenu
 },
}
</script>

<style>

</style>