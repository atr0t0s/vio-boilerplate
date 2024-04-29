import Dashboard from '../templates/dashboard.html'

export default {
  template: Dashboard,
  data: {
    pageName: "Dashboard",
    clientName: "",
    age: 0
  },
  binds: {
    submitButton: {
      event: "click",
      inputs: [{
        input: "ageInput",
        updates: "age"
      },
      {
        input: "clientNameInput",
        updates: "clientName"
      }],
      update: [
        "age",
        "clientName"
      ]
    },
  },
  methods: {
    test(param: string) {
      console.log(param)
    },
    test2() {
      console.log("testing 2")
    }
  },
  mount() {
    this.methods.test2()
  }
}
