<template>
<div class="row mb-2">
       <!-- Grid column -->
            <div class="col-lg-12">
              <ul class="list-inline list-unstyled mb-0">
                <li class="list-inline-item">
                  <form class="form-inline md-form mb-0" >
                       <router-link to="/performance"  class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right">Dashboard</router-link>
                    </form>
                </li>
                 <li class="list-inline-item">
                  <form class="form-inline md-form mb-0">
                       <router-link to="/daily" class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right">Daily Table</router-link>
                    </form>
                </li>
                <li class="list-inline-item">
                  <form class="form-inline md-form mb-0">
                       <router-link to="/agents"  class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right">Weekly Table</router-link>
                    </form>
                </li>
                 <li class="list-inline-item">
                  <form class="form-inline md-form mb-0">
                       <router-link to="/monthly"  class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right">Monthly Table</router-link>
                    </form>
                </li>
                 <li class="list-inline-item">
                  <form class="form-inline md-form mb-0">
                       <router-link to="/target" class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0"> Date Joined</router-link>
                    </form>
                </li>
              </ul>
            </div>
    </div>
    <!--row-->
  
</template>

<script>

export default {
  name: 'SubMenu',

}
</script>
