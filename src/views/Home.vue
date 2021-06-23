<template>
 
  <div class="row mb-2">
    <!-- Grid column -->
    <div class="col-lg-12 col-md-12 mt-0">
      <ul class="list-inline list-unstyled mb-0">
        <li class="list-inline-item">
          <form class="form-inline md-form mb-0">
            <router-link
              to="/subtable"
              class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right"
              >Add</router-link
            >
          </form>
        </li>
        <li class="list-inline-item">
          <form class="form-inline md-form mb-0">
            <router-link
              to="/update"
              class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right"
              >Update</router-link
            >
          </form>
        </li>
        <li class="list-inline-item">
          <form class="form-inline md-form mb-0">
            <router-link
              to="/reset"
              class="btn btn-md btn-link text-primary waves-effect waves-light
                      z-depth-0 border-right"
              >Rsest</router-link
            >
          </form>
        </li>
        
      </ul>
    </div>
      <!-- Grid column -->
    <div class="col-lg-5 col-md-5">
      <form class="form-inline mb-0 material-tooltip-main">
             <!--Per Page-->
            <div class=" form-group mt-4">
             <label class="col-md-5 col-form-label text-md-right mt-0" >Per Page:</label>
                <div class="col-md-4 md-form mt-0 mx-0">
                <input type="number" class="form-control col-sm-9" v-model="pageSize" @change="updateData" />
                </div>
            </div>
      </form>
    </div>
    <!-- Grid column -->
    <div class="col-lg-7 col-md-7">
      <ul class="list-inline list-unstyled mb-0 float-right">
        <li class="list-inline-item">
          <form class="form-inline mb-0 material-tooltip-main">
            
              <!--From--> 
            <div class="md-form">
              <label for="date-picker-example" class="active">From</label>
              <input
                class="form-control col-sm-10"
                type="date"
                v-model="from"
              />
            </div>
            <span class=""></span>
            <!--To-->
            <div class="md-form">
              <label for="date-picker-example" class="active">To</label>
              <input class="form-control col-sm-8" type="date" v-model="to" />
              <button
                class="btn btn-sm blue-gradient mr-0 mb-md-0 mb-4 px-1 waves-effect waves-light z-depth-0"
                @click="dateReset" type="button">
                <!-- <i class="fas fa-minus"></i>-->
                Clear
              </button>
              <button
                class="btn btn-sm blue-gradient mr-3 mr-0 mb-md-0 mb-4 px-1 waves-effect waves-light z-depth-0"
                @click.prevent="FilterDays"
              >
                <!--<i class="fas fa-sliders-h"></i>-->
                Filter
              </button>
            </div>
          </form>
        </li>
        <li class="list-inline-item">
          <form class="form-inline md-form mb-0 mr-2">
            <input
              class="form-control mt-2 col-sm-8"
              type="text"
              placeholder="Search"
              style="max-width: 250px;"
              v-model="search"
            />
             <button
                class="btn btn-sm blue-gradient mr-0 mb-md-0 mb-4 px-2 waves-effect waves-light z-depth-0"
                @click.prevent="searchUser"
              >
              <!--<i class="fas fa-search"></i>-->
              Search
              </button>
          </form>
        </li>
      </ul>
    </div>
    <!-- Grid column -->
  </div>
  <!--row-->
  <div class="row">
   <!--Status Ui-->
    <ul class="list-unstyled list-inline">
       <li class="list-inline-item ml-3"> Active: <span class="text-success">{{ status.Active }}</span> </li>
        <li class="list-inline-item ml-3"> Dormant: <span class="text-danger"> {{ status.Dormant }}</span></li>
    </ul>

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
            <th scope="col">CODE</th>
            <th scope="col">CUSTOMER NAME</th>
            <th scope="col">PHONE No.</th>
            <th scope="col">CARD</th>
            <th scope="col">OPEN DATE</th>
            <th scope="col">STATUS</th>
            <th scope="col">DURATION</th>
            <th scope="col">DAYS REMAIN</th>
            <th scope="col">EXPIRE DATE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(subscriber, index) in visibleTodos" v-bind:visibleTodos="visibleTodos" :key="subscriber.id"
            v-bind:currentPage="currentPage" >
             <td class="font-weight-normal">{{ index+1 }}</td>
            <td class="font-weight-normal">{{ subscriber.agentName }}</td>
            <td class="font-weight-normal">{{ subscriber.agentCode }}</td>
            <td class="font-weight-normal">{{ subscriber.customerName }}</td>
            <td class="font-weight-normal">{{ subscriber.phone }}</td>
            <td class="font-weight-normal">{{ subscriber.card }}</td>
            <td class="font-weight-normal">{{  (subscriber.openDate !="") ? 
              new Date(subscriber.openDate).toLocaleDateString() : subscriber.openDate}}</td>
            <td class="font-weight-normal">{{ subscriber.status }}</td>
            <td class="font-weight-normal">{{ subscriber.duration }}</td>
            <td
              v-if="subscriber.daysRemain > 0"
              class="text-success font-weight-normal"
            >
              {{ subscriber.daysRemain }}
            </td>
            <td v-else class="text-danger font-weight-normal">
              {{ subscriber.daysRemain }}
            </td>
            <td class="font-weight-light">{{ subscriber.expireDate }}</td>
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
// @ is an alias to /src
import Pagination from "../components/Pagination.vue";
const { ipcRenderer } = require("electron");

export default {
  name: "Home",
  components: {
    Pagination,
  },
  data() {
    return {
      empty: false,
      subscribers: [],
      search: "",
      days: "",
      from: "",
      to: "",
      currentPage: 0,
      pageSize: 500,
      visibleTodos: [],
      status:{},
      visibility:false
    }
  },
  methods: {
    checkTableStatus() {
      this.empty = true;
    },

    loadTable() {
      ipcRenderer.send("loadSubscriberTable");
       //ipcRenderer.send("getStatus");
        this.visibility = true;
    },
    dailyUpdate() {
      ipcRenderer.send("daily-Update");
    },
    EmptyFilter(){
      let query = this.search;
      if(query === "" ) this.loadTable()
    },
    searchUser() {
      let query = this.search;
      query == "" ? this.loadTable() :this.FilterData(query);
       this.updateData();
    },
    FilterData(query){
      let arr = this.subscribers
     this.subscribers = arr.filter((item) => {
  if (query == item.agentName || query ==  item.agentCode || query == item.card ||query ==  item.customerName || 
     query == item.phone || query == item.status){
      return item
   } 
     })
     
     if (this.subscribers.length  == 0) { this.loadTable(); this.updateData();}

    },
    FilterDays() {
      let fromdate = new Date(this.from);
      let todate = new Date(this.to);
      let arr = this.subscribers
      this.subscribers = arr.filter((item) => {
        const itemDate = new Date(item.expireDate);

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

       if (this.subscribers.length  == 0) { this.loadTable(); this.updateData();}
    },
    dateReset() {
      this.from = "";
      this.to = "";
      this.loadTable();
      this.updateData();
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
           (this.currentPage * parseInt(this.pageSize)) + parseInt(this.pageSize))
      
      // if we have 0 visible todos, go back a page
      if (this.visibleTodos.length == 0 && this.currentPage > 0) {
        this.updatePage(this.currentPage -1);
      }
    },
    CalcPerformance(){
      ipcRenderer.send('start-performannce')
      console.log('click')
    },
     // Find duplicates method
  findAnSum(arr) {
    let result;
           //Find and count 
    result = [...arr.reduce( (mp, o) => {
         const key = JSON.stringify([o.status]);
         if (!mp.has(key)) mp.set(key, { ...o, count: 0 });
         mp.get(key).count++;
         return mp;
        }, new Map).values()];

        //Group values by key
       let newArr = this.groupBy(result, 'status')
          
       //
       let active = newArr.VALID.map((item) => {
            return {
               Active: item.count,
            };
         });
      // 
      let dormant = newArr.PUNISHSTOP.map((item) => {
            return {
                Dormant: item.count,
            };
         });

        //Merge arrays together
        const mergedArr = {Active:active[0].Active, Dormant:dormant[0].Dormant};
            
        return mergedArr
},//Group b key
 groupBy(arr, property) {
  return arr.reduce((acc, cur) => {
    acc[cur[property]] = [...(acc[cur[property]] || []), cur];
    return acc;
  }, {});
}
  },
  created() {
    //  this.dailyUpdate();
    this.loadTable();
    this.totalSubscribers();
  },
 mounted() {
  this.$nextTick(function () {
    // entire view has been rendered
    ipcRenderer.on("TableResults", (e, arg) => {
      if (arg == "") this.checkTableStatus();
       this.visibility = false;
      this.subscribers = arg;
      this.updateData()
     this.status = this.findAnSum(arg)
    });
  
    //this.updateData()
  })

   /* ipcRenderer.on("StatusSum", (e, arg) => {
      this.status = arg;
    });*/

      ipcRenderer.on("SearchResults", (e, arg) => {
      this.subscribers = arg;
    
    });

    ipcRenderer.on("total-status", (e, arg) => {
      this.total = arg;
    });
  
  /*document.onreadystatechange = () => {
  if (document.readyState == "complete") {
    this.updateData()
  }
 }*/
},
 
};
</script>
