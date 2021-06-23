<template>

  <div class="col-lg-10 col-md-10 p-5">
    <h5 class="pb-4 font-weight-normal">Add New Record</h5>
    <div class="small mb-5">
      NOTE : spaces between column names should be replaced with underscore ( _
      )
    </div>
    <form class="md-form my-5">
      <div class="file-field">
        <div class="btn blue-gradient btn-sm float-left">
          <span>Choose file</span>
          <input
            type="file"
            name="importfile"
            placeholder="Upload your file"
            accept=".xlsx,.xls"
            @change="onFileChange"
            id="excelfile"
          />
        </div>
        <div class="file-path-wrapper">
          <input class="file-path validate" id="import_file" />
        </div>
      </div>
    </form>
    <p :class="['text-center', (success == true) ? 'text-success' : 'text-warning' ]">{{ msg }}</p>
     <p class="text-center" v-show="visibility">Inserting please wait. Do not leave this page</p>
    <div class="float-right mt-5">
      <button
        type="button"
        class="btn blue-gradient btn-md waves-effect"
        @click="importFile"
      :disabled="disabled == true">
        Submit
      </button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import * as XLSX from "xlsx";

let file;

export default {
  name: "CreateSubTable",
  data() {
    return {
      excelfile: "",
      msg:"",
      success:false,
      disabled:false,
      visibility:false
    };
  },

  methods: {
    onFileChange(e) {
      file = e.target.files[0];
      //let vm = this;
    },
    importFile() {
      if (file) {
            this.disabled = true;
            this.visibility = true;

        var fileReader = new FileReader();
        fileReader.onload = function(event) {
          var data = event.target.result;

          var workbook = XLSX.read(data, {
            type: "binary",
          });
          workbook.SheetNames.forEach((sheet) => {
            let rowObject = XLSX.utils.sheet_to_row_object_array(
              workbook.Sheets[sheet]
            );
            //console.log(rowObject)
            ipcRenderer.send("subscribe-table", rowObject);
            document.getElementById("import_file").value = "";
          });
          
        };
        fileReader.readAsBinaryString(file);
      }
    },
    timeout(){
      setTimeout(() => {
        this.message = 'Timeout, it took too long to respond'
      }, 2400000);
    }
  },
  mounted() {
    ipcRenderer.on("Data-Inserted", () => {
      this.success = true
      this.disabled = false
       this.visibility = false;
     this.msg = "Data inserted successfully. Go back"
    // document.getElementById("import_file").value = "";
    });

    //
    ipcRenderer.on("Error", (e,arg) => {
      this.success = false
      this.disabled = false
      this.msg = arg;
      document.getElementById("import_file").value = "";
    });

    //
    ipcRenderer.on('Error-Done', () =>{
      this.visibility = false;

    })
  },
};
</script>
<style></style>
