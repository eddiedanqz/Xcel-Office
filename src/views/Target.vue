<template>
     <SubMenu/>
     <!--Row-->
      <div class="row">
          <!-- Grid column -->
    <div class="col-lg-5">
      <form class="form-inline mb-0 material-tooltip-main">
             <!--Per Page-->
            <div class=" form-group mt-4">
             <label class="col-md-5 col-form-label text-md-right mt-0" >Per Page:</label>
                <div class="col-md-4 md-form mt-0 mx-0">
                <input type="number" class="form-control col-sm-7" v-model="pageSize" @keyup="updateData" />
                </div>
            </div>
      </form>
    </div>
            <!-- Grid column -->
            <div class="col-lg-7">
               <ul class="list-inline list-unstyled mb-0 float-right">
                 <li class="list-inline-item">
                  <form class="form-inline mb-0 material-tooltip-main">
                    <div class="md-form">
                       <label for="date-picker-example" class="active">From</label>
                        <input class="form-control col-sm-10" type="date" v-model="from">
                    </div>
                        <span class=""></span>
                      <div class="md-form">
                         <label for="date-picker-example" class="active">To</label>
                           <input class="form-control col-sm-10" type="date" v-model="to">
                            <button class="btn btn-sm blue-gradient mr-0 mb-md-0 mb-4 px-1 waves-effect waves-light z-depth-0" @click="dateReset">
                               <!-- <i class="fas fa-minus"></i>--> Clear</button>
                             <button class="btn btn-sm blue-gradient mr-3 mr-0 mb-md-0 mb-4 px-1 waves-effect waves-light z-depth-0" @click.prevent="FilterDays">
                               <!--<i class="fas fa-sliders-h"></i>--> Filter</button>
                      </div>
                  </form>
                </li>
               
               </ul>
            </div>
            <!-- Grid column -->
    </div>
        <!--row-->
   <div class="row  justify-content-center">
     <!--Loader-->
      <div class="md-progress primary-color-dark mt-0 pt-0" v-show="visibility" 
      style="top:0px;position:absolute;">
            <div class="indeterminate"></div>
          </div>
    <!--Loader -->
    <div class="col-lg-12 col-md-12 table-responsive">
    <table class="table table-hover mt-1 text-center">
    <thead>
      <tr>
        <th scope="col">No.</th>
         <th scope="col">AGENT NAME</th>
       <!-- <th scope="col">CODE</th>-->
        <th scope="col">CUSTOMER NAME</th>
        <th scope="col">PHONE No.</th>
        <th scope="col">CARD</th>
        <th scope="col">OPEN DATE</th>
        <th scope="col">STATUS</th>
        <th scope="col">DURATION</th>
        <th scope="col">DAYS REMAIN</th>
        <th scope="col">EXPIRE DATE</th>
        <th scope="col">DATE JOINED</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(subscriber, index) in visibleTodos" v-bind:visibleTodos="visibleTodos" :key="subscriber.id" 
         v-bind:currentPage="currentPage" > 
          <td class="font-weight-normal">{{ index+1 }}</td>
        <td class="font-weight-normal">{{ subscriber.agentName }}</td> 
       <!-- <td class="font-weight-normal">{{ subscriber.agentCode }}</td>-->
        <td class="font-weight-normal">{{ subscriber.customerName }}</td>
        <td class="font-weight-normal">{{ subscriber.phone }}</td>
        <td class="font-weight-normal">{{ subscriber.card }}</td>
        <td class="font-weight-normal">{{ subscriber.openDate }}</td>
        <td class="font-weight-normal">{{ subscriber.status }}</td>
        <td class="font-weight-normal">{{ subscriber.duration }}</td>
        <td  v-if="subscriber.daysRemain > 0" class="text-success font-weight-normal">
          {{ subscriber.daysRemain }}</td>
         <td  v-else class="text-danger font-weight-normal">
           {{ subscriber.daysRemain }}</td>
        <td class="font-weight-normal">{{ subscriber.expireDate }}</td>
         <td class="font-weight-normal">{{ new Date(subscriber.dateJoined).toDateString() }}</td>
      </tr>
     
    </tbody>
  </table>
  <div class="d-flex justify-content-center">
      <Pagination  v-bind:subscribers="subscribers"
        v-on:page:update="updatePage"
        v-bind:currentPage="currentPage"
        v-bind:pageSize="pageSize"></Pagination>
      </div>
  </div>
      </div>
     
</template>

<script>
import SubMenu from '../components/SubMenu'
import Pagination from "../components/Pagination.vue";

const { ipcRenderer } = require('electron');

export default {
    name:'Target',
     components:{
        SubMenu,
        Pagination
      },
      data (){
      return {
     empty:false,
       subscribers: [],
       search:"",
       days:'',
       from:"",
       to:"",
       total:'',
      currentPage: 0,
      pageSize: 500,
      visibleTodos: [],
      visibility:false
    }
      },
    methods:{
    checkTableStatus (){
      this.empty = true 
    },

    loadTable(){
    ipcRenderer.send('loadSubscriberTable')
    this.visibility = true;
    },
    dailyUpdate(){
      ipcRenderer.send('daily-Update')
    },
    FilterDays() {
      let fromdate = new Date(this.from);
      let todate = new Date(this.to);
      let arr = this.subscribers

      //
       this.subscribers = arr.filter((item) => {
        const itemDate = new Date(item.date_joined);

        if (fromdate && todate) {
          return fromdate <= itemDate && itemDate <= todate;
          
        }
        if (fromdate && !todate) {
          return fromdate <= itemDate;
        }
        if (!fromdate && todate) {
          return itemDate <= todate;
        }
      });

       if (this.subscribers.length  != 0) { this.updateData();}

       if (this.subscribers.length  == 0) { this.dateReset()}
    },
    dateReset(){
     this.from = ""
     this.to =""
     this.loadTable() 
     this.updateData()
    },
     totalSubscribers() {
      ipcRenderer.send("TotalSub");
    },
     updatePage(pageNumber) {
      this.currentPage = pageNumber;
      this.updateData();
    },
    updateData() {
      this.visibleTodos = this.subscribers.slice(this.currentPage * parseInt(this.pageSize), 
           (this.currentPage * parseInt(this.pageSize)) + parseInt(this.pageSize));
      
      // if we have 0 visible todos, go back a page
      if (this.visibleTodos.length == 0 && this.currentPage > 0) {
        this.updatePage(this.currentPage -1);
      }
    },
  },
  created(){
   /* 
     ipcRenderer.on('total-status',(e,arg) =>{
        this.total = arg
     })
    */

   this.loadTable();
  },
  mounted() {
    //this.totalSubscribers();
   // this.$nextTick(function () {
      // entire view has been rendered
  ipcRenderer.on("TableResults", (e, arg) => {
    if (arg == "") this.checkTableStatus();
      this.visibility = false;
      this.subscribers = arg;
     // this.dailyUpdate();
      this.updateData()
    });

      ipcRenderer.on('SearchResults', (e, arg) => {
        this.subscribers = arg
      });

   // this.dailyUpdate();
    this.updateData()
 // })


 /* document.onreadystatechange = () => {
  if (document.readyState == "complete") {
    this.updateData()
  }
 }*/
},
}
</script>

<style>

</style>