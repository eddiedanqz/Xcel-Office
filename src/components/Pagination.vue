<template>
  <div class="row mb-5 ">
    <!-- Pagination -->
    <nav class="my-4">
      <ul class="pagination pagination-circle pg-blue mb-0">
           <!-- Arrow left -->
                  <li class="page-item" v-if="showPreviousLink()" v-on:click="updatePage(currentPage - 1)">
                    <a class="page-link waves-effect waves-effect" aria-label="Previous">
                      <span aria-hidden="true">«</span>
                      <span class="sr-only">Previous</span>
                    </a>
                  </li>

                <div class="pagination-wrapper" v-if="totalPages() > 0">
                   <li :class="['page-item', (currentPage + 1 == index + 1) ? 'active' : '']" @click="updatePage(index)">
                     <a class="page-link waves-effect waves-effect"> 
                         {{ currentPage + 1 }} of {{ totalPages() }}
                    </a></li>
                </div>
             <!-- Arrow right -->
                  <li class="page-item" v-if="showNextLink()" v-on:click="updatePage(currentPage + 1)">
                    <a class="page-link waves-effect waves-effect" aria-label="Next">
                     <span aria-hidden="true">»</span>
                      <span class="sr-only">Next</span>
                    </a>
                  </li>
            
             <li class="page-item list-inline-item float-right ml-5 mb-0 pb-0">
                 <span class="page-link">showing - {{ subscribers.length }}</span></li>
        <!-- First -->
      </ul>
      
    </nav>
    <!-- /Pagination -->
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['subscribers', 'currentPage', 'pageSize'],
  data(){
    return{
      data:''
    }
  },
  methods: {
    updatePage(pageNumber) {
      this.$emit('page:update', pageNumber);
      this.totalPages()
    },
    totalPages() {

      if (this.pageSize != ""){
      return this.data = Math.ceil(this.subscribers.length / this.pageSize);
      }
    },
    showPreviousLink() {
      return this.currentPage == 0 ? false : true;
    },
    showNextLink() {
      return this.currentPage == (this.totalPages() - 1) ? false : true;
    }
  }
}
</script>
